-- D1 schema for Get Your Site Live
-- SQLite dialect. All timestamps stored as ISO-8601 TEXT.

-- ============================================================
-- businesses
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  slug       TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'Auto Repair',
  theme      TEXT NOT NULL DEFAULT 'modern',
  content    TEXT NOT NULL,           -- full Business JSON blob
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_businesses_name     ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('admin', 'owner')),
  name          TEXT NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  owned_slug    TEXT,
  phone         TEXT,
  street        TEXT,
  city          TEXT,
  zip           TEXT,
  state         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_owned_slug ON users(owned_slug);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);

-- ============================================================
-- prospects
-- ============================================================
CREATE TABLE IF NOT EXISTS prospects (
  slug              TEXT PRIMARY KEY,
  short_id          INTEGER UNIQUE,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL DEFAULT '',
  phone_normalized  TEXT NOT NULL DEFAULT '',  -- digits only for fast phone lookups
  address           TEXT NOT NULL DEFAULT '',
  state             TEXT,
  status            TEXT NOT NULL DEFAULT 'found'
                      CHECK(status IN ('found','contacted','interested','paid','delivered')),
  notes             TEXT NOT NULL DEFAULT '[]',  -- JSON array
  domain1           TEXT,
  domain2           TEXT,
  domain3           TEXT,
  proposal_sent_at  TEXT,
  proposal_sent_by  TEXT,
  contacted_by      TEXT,
  contacted_by_name TEXT,
  contacted_at      TEXT,
  contact_method    TEXT,  -- visit, mail, phone, email
  google_business_status TEXT,
  google_price_level    TEXT,
  google_editorial_summary TEXT,
  google_opening_hours  TEXT,
  google_reviews        TEXT,
  google_photos         TEXT,
  google_short_address  TEXT,
  google_address_components TEXT,
  lat               REAL,
  lng               REAL,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_prospects_status          ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_short_id        ON prospects(short_id);
CREATE INDEX IF NOT EXISTS idx_prospects_phone_normalized ON prospects(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at      ON prospects(created_at DESC);

-- ============================================================
-- audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id         TEXT PRIMARY KEY,
  at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  user_email TEXT NOT NULL,
  user_name  TEXT NOT NULL,
  action     TEXT NOT NULL,
  slug       TEXT,
  detail     TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_at         ON audit_log(at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_slug       ON audit_log(slug);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email ON audit_log(user_email);

-- ============================================================
-- invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
  token      TEXT PRIMARY KEY,
  email      TEXT NOT NULL COLLATE NOCASE,
  role       TEXT NOT NULL CHECK(role IN ('admin', 'owner')),
  owned_slug TEXT,
  invited_by TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_invitations_email      ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);

-- ============================================================
-- password_resets
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

-- ============================================================
-- rate_limits
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  ip           TEXT PRIMARY KEY,
  attempts     INTEGER NOT NULL DEFAULT 0,
  window_start TEXT NOT NULL,
  locked_until TEXT
);

-- ============================================================
-- prospect_visits — tracks every visit to a prospect preview site
-- ============================================================
CREATE TABLE IF NOT EXISTS prospect_visits (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL,
  business_name TEXT NOT NULL,
  ip            TEXT NOT NULL DEFAULT '',
  user_agent    TEXT NOT NULL DEFAULT '',
  referrer      TEXT NOT NULL DEFAULT '',
  visited_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_prospect_visits_slug       ON prospect_visits(slug);
CREATE INDEX IF NOT EXISTS idx_prospect_visits_visited_at ON prospect_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_visits_ip         ON prospect_visits(ip);

-- ============================================================
-- bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  service      TEXT NOT NULL,
  date         TEXT NOT NULL,
  message      TEXT NOT NULL DEFAULT '',
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_slug         ON bookings(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_submitted_at ON bookings(submitted_at DESC);
