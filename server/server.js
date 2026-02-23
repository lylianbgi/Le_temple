const http = require("http");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(crypto.scrypt);

function loadDotEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  });
}

loadDotEnv();

const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = path.join(ROOT_DIR, "data");
const PORT = Number(process.env.PORT || 3000);

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;
const MAX_CAPACITY_PER_SLOT = 6;
const MAX_CAPACITY_PER_SLOT_PER_CABIN = 2;
const CABINS = ["Japon", "Bali", "Europe", "Thailande", "Mauresque"];
const EMPLOYEE_CODE = process.env.EMPLOYEE_CODE;
const EMPLOYEE_IDLE_MINUTES = Number(process.env.EMPLOYEE_IDLE_MINUTES || 5);
const EMPLOYEE_IDLE_MS = Math.max(1, EMPLOYEE_IDLE_MINUTES) * 60 * 1000;
const EMPLOYEE_COOKIE = "letemple_employee";
const EMPLOYEE_COOKIE_SECURE = String(process.env.EMPLOYEE_COOKIE_SECURE || "").toLowerCase() === "true";
const LOG_LEVEL = String(process.env.LOG_LEVEL || "info").toLowerCase();

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8"
};

const SOINS = [
  "Californien",
  "Shiatsu",
  "Suedois",
  "Thai a l'huile",
  "Mauresque",
  "Balinais",
  "Abhyanga",
  "Lomi Lomi",
  "Massage a la bougie",
  "Massage aux bambous",
  "Massage aux pochons",
  "Rituel Oriental",
  "Rituel Ayurvedique",
  "Rituel Balinais",
  "Rituel Nordique",
  "Soin visage hydratant",
  "Soin visage purifiant",
  "Soin visage anti-age (Kobido)"
];

const employeeSessions = new Map();
const fileLocks = new Map();
let warnedInsecureCookie = false;

function filePath(name) {
  return path.join(DATA_DIR, name);
}

function withFileLock(name, operation) {
  const last = fileLocks.get(name) || Promise.resolve();
  const next = last.then(operation, operation);
  fileLocks.set(name, next.catch(() => {}));
  return next;
}

async function ensureDataStore() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const defaults = [
    ["reservations.json", "[]\n"],
    ["contacts.json", "[]\n"],
    ["users.json", "[]\n"],
    ["game_profiles.json", "{}\n"],
    ["stocks.json", JSON.stringify([
      { id: "huile_neutre", name: "Huile neutre", qty: 16, unit: "flacons" },
      { id: "serviettes", name: "Serviettes", qty: 84, unit: "pieces" },
      { id: "pochons", name: "Pochons", qty: 31, unit: "sets" },
      { id: "bougies", name: "Bougies", qty: 40, unit: "pieces" },
      { id: "savon_noir", name: "Savon noir", qty: 12, unit: "pots" }
    ], null, 2) + "\n"],
    ["planning_notes.json", "[]\n"],
    ["notifications.log", ""]
  ];
  for (const [name, content] of defaults) {
    try {
      await fsp.access(filePath(name));
    } catch {
      await fsp.writeFile(filePath(name), content, "utf8");
    }
  }
}

async function readJson(name, fallback = []) {
  const content = await fsp.readFile(filePath(name), "utf8");
  const normalized = (content || "").replace(/^\uFEFF/, "");
  return JSON.parse(normalized || JSON.stringify(fallback));
}

async function writeJson(name, payload) {
  await fsp.writeFile(filePath(name), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, code, payload) {
  res.writeHead(code, jsonHeaders);
  res.end(JSON.stringify(payload));
}

async function writeNotification(type, payload) {
  const line = `[${new Date().toISOString()}] ${type}: ${JSON.stringify(payload)}\n`;
  await fsp.appendFile(filePath("notifications.log"), line, "utf8");
}

function listSlots() {
  const slots = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h += 1) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

function reservationWeight(format) {
  return String(format || "").toLowerCase() === "duo" ? 2 : 1;
}

function normalizeCabin(cabine) {
  const match = CABINS.find((c) => c.toLowerCase() === String(cabine || "").toLowerCase());
  return match || "";
}

function computeAvailability(reservations, date, cabine = "") {
  const slots = listSlots();
  const usage = Object.fromEntries(slots.map((slot) => [slot, 0]));
  const selectedCabin = normalizeCabin(cabine);
  for (const r of reservations) {
    if (r.date !== date || !(r.heure in usage)) continue;
    if (selectedCabin && normalizeCabin(r.cabine) !== selectedCabin) continue;
    usage[r.heure] += reservationWeight(r.format);
  }
  const maxCapacity = selectedCabin ? MAX_CAPACITY_PER_SLOT_PER_CABIN : MAX_CAPACITY_PER_SLOT;
  return slots.map((slot) => ({
    time: slot,
    remaining: Math.max(0, maxCapacity - usage[slot]),
    max: maxCapacity
  }));
}

function sanitizePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  if (normalized === "/" || normalized === "\\") return "index.html";
  return normalized.replace(/^[/\\]+/, "");
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function spinReward() {
  const rewards = [
    { label: "Infusion offerte", points: 15 },
    { label: "Upgrade ambiance cabine", points: 20 },
    { label: "Remise de 5%", points: 25 },
    { label: "Masque visage offert", points: 30 },
    { label: "Remise de 10%", points: 40 }
  ];
  return rewards[Math.floor(Math.random() * rewards.length)];
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt] = String(stored || "").split(":");
  if (!salt) return false;
  const hashed = await hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(stored));
}

function parseCookies(req) {
  const header = String(req.headers.cookie || "");
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [rawKey, ...rest] = part.trim().split("=");
      const rawValue = rest.join("=");
      try {
        return [rawKey, decodeURIComponent(rawValue)];
      } catch {
        return [rawKey, rawValue];
      }
    })
  );
}

function makeEmployeeCookie(token, maxAgeSeconds = Math.ceil(EMPLOYEE_IDLE_MS / 1000), secure = false) {
  const secureFlag = secure ? "; Secure" : "";
  return `${EMPLOYEE_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

function shouldUseSecureCookie(req) {
  if (EMPLOYEE_COOKIE_SECURE) return true;
  if (PORT === 443) return true;
  return req.headers["x-forwarded-proto"] === "https";
}

function canWarn() {
  return LOG_LEVEL !== "silent" && LOG_LEVEL !== "error";
}

function getEmployeeSession(req) {
  const cookies = parseCookies(req);
  const token = String(cookies[EMPLOYEE_COOKIE] || "").trim();
  if (!token) return null;
  const session = employeeSessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    employeeSessions.delete(token);
    return null;
  }
  // Sliding expiration on activity.
  session.expiresAt = Date.now() + EMPLOYEE_IDLE_MS;
  return session;
}

function requireEmployee(req, res) {
  const session = getEmployeeSession(req);
  if (!session) {
    sendJson(res, 401, { ok: false, error: "Session employe invalide." });
    return null;
  }
  res.setHeader("Set-Cookie", makeEmployeeCookie(session.token, undefined, shouldUseSecureCookie(req)));
  return session;
}

function buildPlanning(reservations) {
  const map = new Map();
  for (const r of reservations) {
    const key = `${r.date} ${r.heure}`;
    if (!map.has(key)) {
      map.set(key, { date: r.date, heure: r.heure, total: 0, details: [] });
    }
    const row = map.get(key);
    row.total += 1;
    row.details.push({
      nom: r.nom,
      soin: r.soin,
      cabine: r.cabine,
      format: r.format
    });
  }
  return Array.from(map.values()).sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`));
}

async function handleEmployeeApi(req, res) {
  if (req.method === "POST" && req.url.startsWith("/api/employee/login")) {
    const body = await parseBody(req);
    if (String(body.code || "") !== EMPLOYEE_CODE) {
      return sendJson(res, 401, { ok: false, error: "Code employe invalide." });
    }
    const token = crypto.randomBytes(24).toString("hex");
    employeeSessions.set(token, { token, role: "employee", expiresAt: Date.now() + EMPLOYEE_IDLE_MS });
    res.setHeader("Set-Cookie", makeEmployeeCookie(token, undefined, shouldUseSecureCookie(req)));
    return sendJson(res, 200, { ok: true, expiresInMinutes: EMPLOYEE_IDLE_MINUTES });
  }

  if (req.method === "POST" && req.url.startsWith("/api/employee/logout")) {
    const session = getEmployeeSession(req);
    if (session) employeeSessions.delete(session.token);
    res.setHeader("Set-Cookie", makeEmployeeCookie("deleted", 0, shouldUseSecureCookie(req)));
    return sendJson(res, 200, { ok: true });
  }

  const session = requireEmployee(req, res);
  if (!session) return;

  if (req.method === "GET" && req.url.startsWith("/api/employee/dashboard")) {
    const [reservations, contacts, stocks, notes] = await Promise.all([
      readJson("reservations.json"),
      readJson("contacts.json"),
      readJson("stocks.json"),
      readJson("planning_notes.json")
    ]);
    return sendJson(res, 200, {
      ok: true,
      planning: buildPlanning(reservations),
      demandes: contacts.slice(-30).reverse(),
      stocks,
      notes: notes.slice(-50).reverse()
    });
  }

  if (req.method === "POST" && req.url.startsWith("/api/employee/stocks")) {
    const body = await parseBody(req);
    const id = String(body.id || "").trim();
    const qty = Number(body.qty);
    if (!id || !Number.isFinite(qty) || qty < 0) {
      return sendJson(res, 400, { ok: false, error: "id et qty valides requis." });
    }
    const updated = await withFileLock("stocks.json", async () => {
      const stocks = await readJson("stocks.json");
      const item = stocks.find((s) => s.id === id);
      if (!item) throw new Error("Stock introuvable");
      item.qty = Math.floor(qty);
      await writeJson("stocks.json", stocks);
      return stocks;
    }).catch((error) => ({ error }));

    if (updated.error) {
      return sendJson(res, 404, { ok: false, error: updated.error.message });
    }
    await writeNotification("stock_update", { id, qty });
    return sendJson(res, 200, { ok: true, stocks: updated });
  }

  if (req.method === "POST" && req.url.startsWith("/api/employee/planning-note")) {
    const body = await parseBody(req);
    const note = String(body.note || "").trim();
    if (!note) return sendJson(res, 400, { ok: false, error: "Note vide." });
    const notes = await withFileLock("planning_notes.json", async () => {
      const rows = await readJson("planning_notes.json");
      rows.push({ id: crypto.randomUUID(), note, createdAt: new Date().toISOString() });
      await writeJson("planning_notes.json", rows);
      return rows;
    });
    return sendJson(res, 201, { ok: true, notes: notes.slice(-50).reverse() });
  }

  return sendJson(res, 404, { ok: false, error: "Endpoint employe inconnu" });
}

async function handleApi(req, res) {
  if (req.url.startsWith("/api/employee/")) {
    return handleEmployeeApi(req, res);
  }

  if (req.method === "GET" && req.url.startsWith("/api/health")) {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && req.url.startsWith("/api/meta/catalog")) {
    return sendJson(res, 200, { ok: true, soins: SOINS, cabins: CABINS });
  }

  if (req.method === "GET" && req.url.startsWith("/api/availability")) {
    const parsed = new URL(req.url, "http://localhost");
    const date = parsed.searchParams.get("date");
    const cabine = normalizeCabin(parsed.searchParams.get("cabine"));
    if (!date) return sendJson(res, 400, { ok: false, error: "Parametre date requis (YYYY-MM-DD)." });
    const reservations = await readJson("reservations.json");
    return sendJson(res, 200, {
      ok: true,
      date,
      cabine,
      cabins: CABINS,
      openHour: OPEN_HOUR,
      closeHour: CLOSE_HOUR,
      slots: computeAvailability(reservations, date, cabine)
    });
  }

  if (req.method === "POST" && req.url.startsWith("/api/reservations")) {
    const body = await parseBody(req);
    const required = ["nom", "email", "telephone", "soin", "date", "heure", "format", "cabine"];
    const missing = required.filter((k) => !String(body[k] || "").trim());
    if (missing.length > 0) {
      return sendJson(res, 400, { ok: false, error: `Champs manquants: ${missing.join(", ")}` });
    }
    body.cabine = normalizeCabin(body.cabine);
    if (!body.cabine) return sendJson(res, 400, { ok: false, error: "Cabine invalide." });

    const result = await withFileLock("reservations.json", async () => {
      const rows = await readJson("reservations.json");
      const slot = computeAvailability(rows, body.date, body.cabine).find((s) => s.time === body.heure);
      if (!slot) throw new Error("Heure invalide. Choisissez un creneau propose.");
      if (slot.remaining < reservationWeight(body.format)) {
        const e = new Error("Ce creneau est complet pour ce format.");
        e.code = 409;
        throw e;
      }
      const item = { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() };
      rows.push(item);
      await writeJson("reservations.json", rows);
      return item;
    }).catch((error) => ({ error }));

    if (result.error) {
      return sendJson(res, result.error.code || 400, { ok: false, error: result.error.message });
    }
    await writeNotification("reservation", result);
    return sendJson(res, 201, { ok: true, message: "Reservation enregistree.", reservation: result });
  }

  if (req.method === "POST" && req.url.startsWith("/api/contacts")) {
    const body = await parseBody(req);
    const required = ["nom", "email", "sujet", "message"];
    const missing = required.filter((k) => !String(body[k] || "").trim());
    if (missing.length > 0) {
      return sendJson(res, 400, { ok: false, error: `Champs manquants: ${missing.join(", ")}` });
    }
    const item = await withFileLock("contacts.json", async () => {
      const rows = await readJson("contacts.json");
      const row = { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() };
      rows.push(row);
      await writeJson("contacts.json", rows);
      return row;
    });
    await writeNotification("contact", item);
    return sendJson(res, 201, { ok: true, message: "Message recu.", contact: item });
  }

  if (req.method === "POST" && req.url.startsWith("/api/auth/register")) {
    const body = await parseBody(req);
    const nom = String(body.nom || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!nom || !email || password.length < 8) {
      return sendJson(res, 400, { ok: false, error: "Nom, email et mot de passe (8+ caracteres) requis." });
    }
    const result = await withFileLock("users.json", async () => {
      const users = await readJson("users.json");
      if (users.some((u) => u.email === email)) {
        const err = new Error("Un compte existe deja pour cet email.");
        err.code = 409;
        throw err;
      }
      const row = {
        id: crypto.randomUUID(),
        nom,
        email,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString()
      };
      users.push(row);
      await writeJson("users.json", users);
      return row;
    }).catch((error) => ({ error }));
    if (result.error) return sendJson(res, result.error.code || 400, { ok: false, error: result.error.message });
    await writeNotification("register", { email, nom });
    return sendJson(res, 201, { ok: true, message: "Compte cree." });
  }

  if (req.method === "POST" && req.url.startsWith("/api/auth/login")) {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const users = await readJson("users.json");
    const user = users.find((u) => u.email === email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return sendJson(res, 401, { ok: false, error: "Identifiants invalides." });
    }
    const token = crypto.randomBytes(24).toString("hex");
    await writeNotification("login", { email, tokenPreview: token.slice(0, 8) });
    return sendJson(res, 200, { ok: true, message: "Connexion reussie.", token, nom: user.nom });
  }

  if (req.method === "GET" && req.url.startsWith("/api/game/profile")) {
    const parsed = new URL(req.url, "http://localhost");
    const email = String(parsed.searchParams.get("email") || "").trim().toLowerCase();
    if (!email) return sendJson(res, 400, { ok: false, error: "Parametre email requis." });
    const profiles = await readJson("game_profiles.json", {});
    const profile = profiles[email] || { email, points: 0, lastSpinDate: "", history: [] };
    return sendJson(res, 200, { ok: true, profile });
  }

  if (req.method === "POST" && req.url.startsWith("/api/game/spin")) {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return sendJson(res, 400, { ok: false, error: "Email requis." });

    const result = await withFileLock("game_profiles.json", async () => {
      const profiles = await readJson("game_profiles.json", {});
      const profile = profiles[email] || { email, points: 0, lastSpinDate: "", history: [] };
      const today = todayIsoDate();
      if (profile.lastSpinDate === today) {
        const err = new Error("Deja joue aujourd'hui. Revenez demain.");
        err.code = 409;
        err.profile = profile;
        throw err;
      }
      const reward = spinReward();
      profile.points += reward.points;
      profile.lastSpinDate = today;
      profile.history.unshift({ date: new Date().toISOString(), reward: reward.label, points: reward.points });
      profile.history = profile.history.slice(0, 20);
      profiles[email] = profile;
      await writeJson("game_profiles.json", profiles);
      return { profile, reward };
    }).catch((error) => ({ error }));

    if (result.error) {
      return sendJson(res, result.error.code || 400, {
        ok: false,
        error: result.error.message,
        profile: result.error.profile || null
      });
    }
    await writeNotification("game_spin", { email, reward: result.reward });
    return sendJson(res, 200, {
      ok: true,
      message: `Bravo: ${result.reward.label} (+${result.reward.points} points)`,
      reward: result.reward,
      profile: result.profile
    });
  }

  return sendJson(res, 404, { ok: false, error: "Endpoint inconnu" });
}

function shouldServeIndexFallback(relativePath, req) {
  const ext = path.extname(relativePath);
  if (ext) return false;
  const accept = String(req.headers.accept || "");
  return accept.includes("text/html") || accept.includes("*/*");
}

async function serveStatic(req, res) {
  const relative = sanitizePath(req.url || "/");
  const target = path.join(PUBLIC_DIR, relative);
  if (!target.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  let filePathResolved = target;
  try {
    const stat = await fsp.stat(filePathResolved);
    if (stat.isDirectory()) {
      filePathResolved = path.join(filePathResolved, "index.html");
    }
  } catch {
    if (shouldServeIndexFallback(relative, req)) {
      filePathResolved = path.join(PUBLIC_DIR, "index.html");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
  }

  const ext = path.extname(filePathResolved).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  fs.createReadStream(filePathResolved)
    .on("error", () => {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    })
    .once("open", () => {
      res.writeHead(200, { "Content-Type": contentType });
    })
    .pipe(res);
}

async function start() {
  await ensureDataStore();
  if (!EMPLOYEE_CODE) {
    console.error("[startup] EMPLOYEE_CODE manquant. Definissez la variable d'environnement pour demarrer.");
    process.exit(1);
  }
  if (!warnedInsecureCookie && process.env.NODE_ENV === "production" && !EMPLOYEE_COOKIE_SECURE && PORT !== 443 && canWarn()) {
    console.warn("[startup] EMPLOYEE_COOKIE_SECURE=false en production. Activez-le pour forcer Secure sur le cookie.");
    warnedInsecureCookie = true;
  }
  const server = http.createServer(async (req, res) => {
    try {
      if ((req.url || "").startsWith("/api/")) {
        await handleApi(req, res);
      } else {
        await serveStatic(req, res);
      }
    } catch (error) {
      sendJson(res, 500, { ok: false, error: `Erreur serveur: ${error.message}` });
    }
  });
  server.listen(PORT, () => {
    console.log(`Le Temple server running on http://localhost:${PORT}`);
  });
}

start();
