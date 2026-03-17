const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

function filePath(dataDir, name) {
  return path.join(dataDir, name);
}

function readJsonFileSafe(dataDir, name, fallback) {
  const target = filePath(dataDir, name);
  if (!fs.existsSync(target)) return fallback;
  const raw = fs.readFileSync(target, "utf8").replace(/^\uFEFF/, "").trim();
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function ensureDatabase(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = filePath(dataDir, "letemple.db");
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      privacy_accepted INTEGER NOT NULL DEFAULT 0,
      terms_accepted INTEGER NOT NULL DEFAULT 0,
      marketing_opt_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      telephone TEXT NOT NULL,
      soin TEXT NOT NULL,
      cabine TEXT NOT NULL,
      date TEXT NOT NULL,
      heure TEXT NOT NULL,
      format TEXT NOT NULL,
      message TEXT DEFAULT '',
      privacy_accepted INTEGER NOT NULL DEFAULT 0,
      marketing_opt_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      sujet TEXT NOT NULL,
      message TEXT NOT NULL,
      privacy_accepted INTEGER NOT NULL DEFAULT 0,
      marketing_opt_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS planning_notes (
      id TEXT PRIMARY KEY,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_profiles (
      email TEXT PRIMARY KEY,
      points INTEGER NOT NULL DEFAULT 0,
      last_spin_date TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS game_history (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      reward TEXT NOT NULL,
      points INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (email) REFERENCES game_profiles(email) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_date_cabine_heure ON reservations(date, cabine, heure);
    CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON planning_notes(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_game_history_email_created_at ON game_history(email, created_at DESC);
  `);

  ensureColumn(db, "users", "privacy_accepted", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "users", "terms_accepted", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "users", "marketing_opt_in", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "reservations", "privacy_accepted", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "reservations", "marketing_opt_in", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "contacts", "privacy_accepted", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(db, "contacts", "marketing_opt_in", "INTEGER NOT NULL DEFAULT 0");

  migrateJsonData(db, dataDir);
  return db;
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getMeta(db, key) {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  return row ? row.value : null;
}

function setMeta(db, key, value) {
  db.prepare(`
    INSERT INTO meta(key, value) VALUES(?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function migrateJsonData(db, dataDir) {
  if (getMeta(db, "json_migration_done") === "1") return;

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users(id, nom, email, password_hash, privacy_accepted, terms_accepted, marketing_opt_in, created_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertReservation = db.prepare(`
    INSERT OR IGNORE INTO reservations(id, nom, email, telephone, soin, cabine, date, heure, format, message, privacy_accepted, marketing_opt_in, created_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertContact = db.prepare(`
    INSERT OR IGNORE INTO contacts(id, nom, email, sujet, message, privacy_accepted, marketing_opt_in, created_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertStock = db.prepare(`
    INSERT OR REPLACE INTO stocks(id, name, qty, unit)
    VALUES(?, ?, ?, ?)
  `);
  const insertNote = db.prepare(`
    INSERT OR IGNORE INTO planning_notes(id, note, created_at)
    VALUES(?, ?, ?)
  `);
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO game_profiles(email, points, last_spin_date)
    VALUES(?, ?, ?)
  `);
  const insertHistory = db.prepare(`
    INSERT OR IGNORE INTO game_history(id, email, reward, points, created_at)
    VALUES(?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN IMMEDIATE");
  try {
    const users = readJsonFileSafe(dataDir, "users.json", []);
    users.forEach((user) => {
      insertUser.run(
        user.id,
        user.nom || "",
        String(user.email || "").toLowerCase(),
        user.passwordHash || "",
        Number(Boolean(user.privacyAccepted)),
        Number(Boolean(user.termsAccepted)),
        Number(Boolean(user.marketingOptIn)),
        user.createdAt || new Date().toISOString()
      );
    });

    const reservations = readJsonFileSafe(dataDir, "reservations.json", []);
    reservations.forEach((row) => {
      insertReservation.run(
        row.id,
        row.nom || "",
        String(row.email || "").toLowerCase(),
        row.telephone || "",
        row.soin || "",
        row.cabine || "",
        row.date || "",
        row.heure || "",
        row.format || "",
        row.message || "",
        Number(Boolean(row.privacyAccepted)),
        Number(Boolean(row.marketingOptIn)),
        row.createdAt || new Date().toISOString()
      );
    });

    const contacts = readJsonFileSafe(dataDir, "contacts.json", []);
    contacts.forEach((row) => {
      insertContact.run(
        row.id,
        row.nom || "",
        String(row.email || "").toLowerCase(),
        row.sujet || "",
        row.message || "",
        Number(Boolean(row.privacyAccepted)),
        Number(Boolean(row.marketingOptIn)),
        row.createdAt || new Date().toISOString()
      );
    });

    const stocks = readJsonFileSafe(dataDir, "stocks.json", []);
    stocks.forEach((row) => {
      insertStock.run(row.id, row.name || "", Number(row.qty || 0), row.unit || "");
    });

    const notes = readJsonFileSafe(dataDir, "planning_notes.json", []);
    notes.forEach((row) => {
      insertNote.run(row.id, row.note || "", row.createdAt || new Date().toISOString());
    });

    const profiles = readJsonFileSafe(dataDir, "game_profiles.json", {});
    Object.entries(profiles).forEach(([email, profile]) => {
      insertProfile.run(email, Number(profile.points || 0), profile.lastSpinDate || "");
      const history = Array.isArray(profile.history) ? profile.history : [];
      history.forEach((entry, index) => {
        insertHistory.run(
          entry.id || `${email}-${entry.date || "history"}-${index}`,
          email,
          entry.reward || "",
          Number(entry.points || 0),
          entry.date || new Date().toISOString()
        );
      });
    });
    setMeta(db, "json_migration_done", "1");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function mapReservationRow(row) {
  return {
    id: row.id,
    nom: row.nom,
    email: row.email,
    telephone: row.telephone,
    soin: row.soin,
    cabine: row.cabine,
    date: row.date,
    heure: row.heure,
    format: row.format,
    message: row.message || "",
    privacyAccepted: Boolean(row.privacy_accepted),
    marketingOptIn: Boolean(row.marketing_opt_in),
    createdAt: row.created_at
  };
}

function mapContactRow(row) {
  return {
    id: row.id,
    nom: row.nom,
    email: row.email,
    sujet: row.sujet,
    message: row.message,
    privacyAccepted: Boolean(row.privacy_accepted),
    marketingOptIn: Boolean(row.marketing_opt_in),
    createdAt: row.created_at
  };
}

function mapUserRow(row) {
  return row ? {
    id: row.id,
    nom: row.nom,
    email: row.email,
    passwordHash: row.password_hash,
    privacyAccepted: Boolean(row.privacy_accepted),
    termsAccepted: Boolean(row.terms_accepted),
    marketingOptIn: Boolean(row.marketing_opt_in),
    createdAt: row.created_at
  } : null;
}

function mapNoteRow(row) {
  return {
    id: row.id,
    note: row.note,
    createdAt: row.created_at
  };
}

function mapStockRow(row) {
  return {
    id: row.id,
    name: row.name,
    qty: row.qty,
    unit: row.unit
  };
}

function createStore(dataDir) {
  const db = ensureDatabase(dataDir);

  return {
    db,
    dbPath: filePath(dataDir, "letemple.db"),

    listReservations() {
      return db.prepare("SELECT * FROM reservations ORDER BY date ASC, heure ASC, created_at ASC").all().map(mapReservationRow);
    },

    listContacts(limit = 30) {
      return db.prepare("SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?").all(limit).map(mapContactRow);
    },

    listStocks() {
      return db.prepare("SELECT * FROM stocks ORDER BY name ASC").all().map(mapStockRow);
    },

    listPlanningNotes(limit = 50) {
      return db.prepare("SELECT * FROM planning_notes ORDER BY created_at DESC LIMIT ?").all(limit).map(mapNoteRow);
    },

    findUserByEmail(email) {
      const row = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email || "").toLowerCase());
      return mapUserRow(row);
    },

    createUser(user) {
      db.prepare(`
        INSERT INTO users(id, nom, email, password_hash, privacy_accepted, terms_accepted, marketing_opt_in, created_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.id,
        user.nom,
        String(user.email || "").toLowerCase(),
        user.passwordHash,
        Number(Boolean(user.privacyAccepted)),
        Number(Boolean(user.termsAccepted)),
        Number(Boolean(user.marketingOptIn)),
        user.createdAt
      );
      return this.findUserByEmail(user.email);
    },

    createReservation(row) {
      db.prepare(`
        INSERT INTO reservations(id, nom, email, telephone, soin, cabine, date, heure, format, message, privacy_accepted, marketing_opt_in, created_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        row.id,
        row.nom,
        String(row.email || "").toLowerCase(),
        row.telephone,
        row.soin,
        row.cabine,
        row.date,
        row.heure,
        row.format,
        row.message || "",
        Number(Boolean(row.privacyAccepted)),
        Number(Boolean(row.marketingOptIn)),
        row.createdAt
      );
      return row;
    },

    createContact(row) {
      db.prepare(`
        INSERT INTO contacts(id, nom, email, sujet, message, privacy_accepted, marketing_opt_in, created_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        row.id,
        row.nom,
        String(row.email || "").toLowerCase(),
        row.sujet,
        row.message,
        Number(Boolean(row.privacyAccepted)),
        Number(Boolean(row.marketingOptIn)),
        row.createdAt
      );
      return row;
    },

    updateStock(id, qty) {
      const result = db.prepare("UPDATE stocks SET qty = ? WHERE id = ?").run(Math.floor(qty), id);
      if (result.changes === 0) {
        throw new Error("Stock introuvable");
      }
      return this.listStocks();
    },

    addStock(stockRow) {
      db.prepare(`
        INSERT INTO stocks(id, name, qty, unit)
        VALUES(?, ?, ?, ?)
      `).run(stockRow.id, stockRow.name, Math.floor(stockRow.qty), stockRow.unit);
      return this.listStocks();
    },

    deleteStock(id) {
      const result = db.prepare("DELETE FROM stocks WHERE id = ?").run(id);
      if (result.changes === 0) {
        throw new Error("Stock introuvable");
      }
      return this.listStocks();
    },

    addPlanningNote(noteRow) {
      db.prepare("INSERT INTO planning_notes(id, note, created_at) VALUES(?, ?, ?)").run(noteRow.id, noteRow.note, noteRow.createdAt);
      return this.listPlanningNotes();
    },

    getGameProfile(email) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const profile = db.prepare("SELECT * FROM game_profiles WHERE email = ?").get(normalizedEmail);
      const history = db.prepare(`
        SELECT id, reward, points, created_at
        FROM game_history
        WHERE email = ?
        ORDER BY created_at DESC
        LIMIT 20
      `).all(normalizedEmail);
      return {
        email: normalizedEmail,
        points: profile ? profile.points : 0,
        lastSpinDate: profile ? profile.last_spin_date || "" : "",
        history: history.map((row) => ({
          id: row.id,
          reward: row.reward,
          points: row.points,
          date: row.created_at
        }))
      };
    },

    saveGameSpin(email, reward, today) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const existing = this.getGameProfile(normalizedEmail);
      const updatedProfile = {
        email: normalizedEmail,
        points: existing.points + reward.points,
        lastSpinDate: today
      };

      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare(`
          INSERT INTO game_profiles(email, points, last_spin_date)
          VALUES(?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            points = excluded.points,
            last_spin_date = excluded.last_spin_date
        `).run(updatedProfile.email, updatedProfile.points, updatedProfile.lastSpinDate);

        db.prepare(`
          INSERT INTO game_history(id, email, reward, points, created_at)
          VALUES(?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          updatedProfile.email,
          reward.label,
          reward.points,
          new Date().toISOString()
        );

        const removable = db.prepare(`
          SELECT id FROM game_history
          WHERE email = ?
          ORDER BY created_at DESC
          LIMIT -1 OFFSET 20
        `).all(updatedProfile.email);

        removable.forEach((row) => {
          db.prepare("DELETE FROM game_history WHERE id = ?").run(row.id);
        });
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
      return this.getGameProfile(normalizedEmail);
    }
  };
}

module.exports = {
  createStore
};
