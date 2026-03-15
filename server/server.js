const http = require("http");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { promisify } = require("util");
const { createStore } = require("./database");

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
const APP_BASE_URL = String(process.env.APP_BASE_URL || "").trim();
const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
const SMTP_USER = String(process.env.SMTP_USER || "").trim();
const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
const MAIL_FROM = String(process.env.MAIL_FROM || SMTP_USER || "no-reply@letemple-spa.fr").trim();

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

const employeeSessions = new Map();
let warnedInsecureCookie = false;
let mailTransporter = null;

const store = createStore(DATA_DIR);

function sendJson(res, code, payload) {
  res.writeHead(code, jsonHeaders);
  res.end(JSON.stringify(payload));
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

async function writeNotification(type, payload) {
  const line = `[${new Date().toISOString()}] ${type}: ${JSON.stringify(payload)}\n`;
  await fsp.appendFile(path.join(DATA_DIR, "notifications.log"), line, "utf8");
}

function createMailTransporter() {
  if (!SMTP_HOST || !MAIL_FROM) return null;
  if (mailTransporter) return mailTransporter;
  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
  return mailTransporter;
}

async function sendMail({ to, subject, text, html }) {
  const transporter = createMailTransporter();
  if (!transporter) {
    await writeNotification("mail_skipped", { to, subject, text });
    return { delivered: false, skipped: true };
  }
  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html
  });
  return { delivered: true, skipped: false };
}

function renderEmailLayout({ preheader = "", title, intro, bodyHtml, ctaLabel = "", ctaUrl = "", footerNote = "" }) {
  const ctaHtml = ctaLabel && ctaUrl
    ? `
      <tr>
        <td style="padding: 8px 32px 0 32px;">
          <a href="${ctaUrl}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:linear-gradient(135deg,#1f5238,#2b6a4a);color:#f8fff9;text-decoration:none;font-weight:700;">
            ${ctaLabel}
          </a>
        </td>
      </tr>
    `
    : "";

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#edf5ef;color:#1c2a22;font-family:Arial,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:radial-gradient(circle at top left,#f2f8f3 0%,#e1efe5 55%,#d3e6da 100%);">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border-collapse:collapse;background:#ffffff;border:1px solid #d8e8dd;border-radius:24px;overflow:hidden;box-shadow:0 18px 40px rgba(26,65,44,0.10);">
                <tr>
                  <td style="padding:32px;background:linear-gradient(135deg,rgba(18,45,31,0.96),rgba(43,106,74,0.92));color:#f3fff7;">
                    <div style="font-family:Georgia,serif;font-size:34px;letter-spacing:0.14em;">LE TEMPLE</div>
                    <div style="margin-top:10px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#d6ebdd;">Spa holistique et sensoriel</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 32px 8px 32px;">
                    <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.05;color:#1f3529;">${title}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 0 32px;font-size:16px;line-height:1.7;color:#476457;">
                    ${intro}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 0 32px;font-size:15px;line-height:1.7;color:#1c2a22;">
                    ${bodyHtml}
                  </td>
                </tr>
                ${ctaHtml}
                <tr>
                  <td style="padding:28px 32px 12px 32px;font-size:14px;line-height:1.7;color:#5b7567;">
                    ${footerNote || "A bientot,<br><strong>Le Temple</strong>"}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px 30px 32px;border-top:1px solid #e2eee6;font-size:12px;line-height:1.6;color:#6f8579;">
                    Le Temple, votre parenthese de bien-etre immersive.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getBaseUrl(req) {
  if (APP_BASE_URL) return APP_BASE_URL.replace(/\/+$/, "");
  const proto = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const host = String(req.headers.host || `127.0.0.1:${PORT}`);
  return `${proto}://${host}`;
}

function buildSiteUrl(req, pathname) {
  return `${getBaseUrl(req)}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function sendReservationConfirmationEmail(reservation, req) {
  const reservationUrl = buildSiteUrl(req, "/reservation.html");
  const subject = "Confirmation de votre reservation Le Temple";
  const text = [
    `Bonjour ${reservation.nom},`,
    "",
    "Votre demande de reservation a bien ete enregistree.",
    `Soin : ${reservation.soin}`,
    `Cabine : ${reservation.cabine}`,
    `Date : ${reservation.date}`,
    `Heure : ${reservation.heure}`,
    `Format : ${reservation.format}`,
    "",
    "Nous reviendrons vers vous si un ajustement est necessaire.",
    `Retrouvez le site ici : ${reservationUrl}`,
    "",
    "Le Temple"
  ].join("\n");
  const html = renderEmailLayout({
    preheader: "Votre reservation Le Temple a bien ete enregistree.",
    title: "Confirmation de reservation",
    intro: `<p style="margin:0;">Bonjour ${reservation.nom},</p><p style="margin:14px 0 0 0;">Nous sommes ravis de vous confirmer la bonne prise en compte de votre demande de reservation.</p>`,
    bodyHtml: `
      <div style="padding:22px;border:1px solid #dbeadf;border-radius:18px;background:linear-gradient(160deg,#f8fdf9,#edf6f1);">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:15px;line-height:1.7;">
          <tr><td style="padding:4px 0;color:#476457;">Soin</td><td style="padding:4px 0;text-align:right;"><strong>${reservation.soin}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#476457;">Cabine</td><td style="padding:4px 0;text-align:right;"><strong>${reservation.cabine}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#476457;">Date</td><td style="padding:4px 0;text-align:right;"><strong>${reservation.date}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#476457;">Heure</td><td style="padding:4px 0;text-align:right;"><strong>${reservation.heure}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#476457;">Format</td><td style="padding:4px 0;text-align:right;"><strong>${reservation.format}</strong></td></tr>
        </table>
      </div>
      <p style="margin:18px 0 0 0;">Notre equipe reviendra vers vous rapidement si un ajustement est necessaire ou pour toute precision complementaire.</p>
    `,
    ctaLabel: "Voir le site Le Temple",
    ctaUrl: reservationUrl,
    footerNote: "Merci pour votre confiance.<br><br>A tres bientot au Temple,<br><strong>Le Temple</strong>"
  });
  return sendMail({ to: reservation.email, subject, text, html });
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
  reservations.forEach((r) => {
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
  });
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
    return sendJson(res, 200, {
      ok: true,
      planning: buildPlanning(store.listReservations()),
      demandes: store.listContacts(30),
      stocks: store.listStocks(),
      notes: store.listPlanningNotes(50)
    });
  }

  if (req.method === "POST" && req.url.startsWith("/api/employee/stocks")) {
    const body = await parseBody(req);
    const id = String(body.id || "").trim();
    const qty = Number(body.qty);
    if (!id || !Number.isFinite(qty) || qty < 0) {
      return sendJson(res, 400, { ok: false, error: "id et qty valides requis." });
    }
    try {
      const stocks = store.updateStock(id, qty);
      await writeNotification("stock_update", { id, qty });
      return sendJson(res, 200, { ok: true, stocks });
    } catch (error) {
      return sendJson(res, 404, { ok: false, error: error.message });
    }
  }

  if (req.method === "POST" && req.url.startsWith("/api/employee/planning-note")) {
    const body = await parseBody(req);
    const note = String(body.note || "").trim();
    if (!note) return sendJson(res, 400, { ok: false, error: "Note vide." });
    const notes = store.addPlanningNote({
      id: crypto.randomUUID(),
      note,
      createdAt: new Date().toISOString()
    });
    return sendJson(res, 201, { ok: true, notes });
  }

  return sendJson(res, 404, { ok: false, error: "Endpoint employe inconnu" });
}

async function handleApi(req, res) {
  if (req.url.startsWith("/api/employee/")) {
    return handleEmployeeApi(req, res);
  }

  if (req.method === "GET" && req.url.startsWith("/api/health")) {
    return sendJson(res, 200, {
      ok: true,
      database: path.basename(store.dbPath)
    });
  }

  if (req.method === "GET" && req.url.startsWith("/api/meta/catalog")) {
    return sendJson(res, 200, { ok: true, soins: SOINS, cabins: CABINS });
  }

  if (req.method === "GET" && req.url.startsWith("/api/availability")) {
    const parsed = new URL(req.url, "http://localhost");
    const date = parsed.searchParams.get("date");
    const cabine = normalizeCabin(parsed.searchParams.get("cabine"));
    if (!date) return sendJson(res, 400, { ok: false, error: "Parametre date requis (YYYY-MM-DD)." });
    return sendJson(res, 200, {
      ok: true,
      date,
      cabine,
      cabins: CABINS,
      openHour: OPEN_HOUR,
      closeHour: CLOSE_HOUR,
      slots: computeAvailability(store.listReservations(), date, cabine)
    });
  }

  if (req.method === "POST" && req.url.startsWith("/api/reservations")) {
    const body = await parseBody(req);
    const required = ["nom", "email", "telephone", "soin", "date", "heure", "format", "cabine"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (missing.length > 0) {
      return sendJson(res, 400, { ok: false, error: `Champs manquants: ${missing.join(", ")}` });
    }

    const cabine = normalizeCabin(body.cabine);
    if (!cabine) return sendJson(res, 400, { ok: false, error: "Cabine invalide." });

    const slot = computeAvailability(store.listReservations(), body.date, cabine).find((entry) => entry.time === body.heure);
    if (!slot) {
      return sendJson(res, 400, { ok: false, error: "Heure invalide. Choisissez un creneau propose." });
    }
    if (slot.remaining < reservationWeight(body.format)) {
      return sendJson(res, 409, { ok: false, error: "Ce creneau est complet pour ce format." });
    }

    const reservation = store.createReservation({
      id: crypto.randomUUID(),
      nom: String(body.nom || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      telephone: String(body.telephone || "").trim(),
      soin: String(body.soin || "").trim(),
      cabine,
      date: String(body.date || "").trim(),
      heure: String(body.heure || "").trim(),
      format: String(body.format || "").trim(),
      message: String(body.message || "").trim(),
      createdAt: new Date().toISOString()
    });

    await writeNotification("reservation", reservation);
    const mail = await sendReservationConfirmationEmail(reservation, req).catch(async (error) => {
      await writeNotification("mail_error", { scope: "reservation_confirmation", email: reservation.email, error: error.message });
      return { delivered: false, skipped: false, error: error.message };
    });
    const message = mail && mail.delivered
      ? "Reservation enregistree. Un email de confirmation vous a ete envoye."
      : "Reservation enregistree. Confirmation email a finaliser apres configuration SMTP.";
    return sendJson(res, 201, { ok: true, message, reservation, email: mail });
  }

  if (req.method === "POST" && req.url.startsWith("/api/contacts")) {
    const body = await parseBody(req);
    const required = ["nom", "email", "sujet", "message"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (missing.length > 0) {
      return sendJson(res, 400, { ok: false, error: `Champs manquants: ${missing.join(", ")}` });
    }

    const contact = store.createContact({
      id: crypto.randomUUID(),
      nom: String(body.nom || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      sujet: String(body.sujet || "").trim(),
      message: String(body.message || "").trim(),
      createdAt: new Date().toISOString()
    });
    await writeNotification("contact", contact);
    return sendJson(res, 201, { ok: true, message: "Message recu.", contact });
  }

  if (req.method === "POST" && req.url.startsWith("/api/auth/register")) {
    const body = await parseBody(req);
    const nom = String(body.nom || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!nom || !email || password.length < 8) {
      return sendJson(res, 400, { ok: false, error: "Nom, email et mot de passe (8+ caracteres) requis." });
    }
    if (store.findUserByEmail(email)) {
      return sendJson(res, 409, { ok: false, error: "Un compte existe deja pour cet email." });
    }

    const user = store.createUser({
      id: crypto.randomUUID(),
      nom,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString()
    });
    await writeNotification("register", { email, nom });
    return sendJson(res, 201, { ok: true, message: "Compte cree. Vous pouvez maintenant vous connecter.", user: { nom: user.nom, email: user.email } });
  }

  if (req.method === "POST" && req.url.startsWith("/api/auth/login")) {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = store.findUserByEmail(email);
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
    return sendJson(res, 200, { ok: true, profile: store.getGameProfile(email) });
  }

  if (req.method === "POST" && req.url.startsWith("/api/game/spin")) {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return sendJson(res, 400, { ok: false, error: "Email requis." });

    const existingProfile = store.getGameProfile(email);
    const today = new Date().toISOString().slice(0, 10);
    if (existingProfile.lastSpinDate === today) {
      return sendJson(res, 409, {
        ok: false,
        error: "Deja joue aujourd'hui. Revenez demain.",
        profile: existingProfile
      });
    }

    const rewards = [
      { label: "Infusion offerte", points: 15 },
      { label: "Upgrade ambiance cabine", points: 20 },
      { label: "Remise de 5%", points: 25 },
      { label: "Masque visage offert", points: 30 },
      { label: "Remise de 10%", points: 40 }
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const profile = store.saveGameSpin(email, reward, today);
    await writeNotification("game_spin", { email, reward });
    return sendJson(res, 200, {
      ok: true,
      message: `Bravo: ${reward.label} (+${reward.points} points)`,
      reward,
      profile
    });
  }

  return sendJson(res, 404, { ok: false, error: "Endpoint inconnu" });
}

function sanitizePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  if (normalized === "/" || normalized === "\\") return "index.html";
  return normalized.replace(/^[/\\]+/, "");
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
  if (!EMPLOYEE_CODE) {
    console.error("[startup] EMPLOYEE_CODE manquant. Definissez la variable d'environnement pour demarrer.");
    process.exit(1);
  }
  if (!SMTP_HOST && canWarn()) {
    console.warn("[startup] SMTP non configure. Les emails seront journalises mais non envoyes.");
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
    console.log(`Database: ${store.dbPath}`);
  });
}

start();
