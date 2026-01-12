import { getDb } from './sqlite';

export const LATEST_VERSION = 1;

export async function initDb() {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `);

  const rows = await db.getAllAsync<{ version: number }>(
    `SELECT version FROM schema_version LIMIT 1;`
  );

  const currentVersion = rows.length ? rows[0].version : 0;

  if (currentVersion === 0) {
    await db.runAsync(`INSERT INTO schema_version (version) VALUES (0);`);
  }

  if (currentVersion < 1) {
    await migrateToV1();
    await db.runAsync(`UPDATE schema_version SET version = 1;`);
  }

  // Heal any legacy nulls that may violate NOT NULL constraints
  await db.runAsync(`UPDATE markets SET change_24h = 0 WHERE change_24h IS NULL;`);
  await db.runAsync(`UPDATE markets SET volume_24h = 0 WHERE volume_24h IS NULL;`);
  await db.runAsync(`UPDATE markets SET last_price = 0 WHERE last_price IS NULL;`);
}

async function migrateToV1() {
  const db = await getDb();

  await db.execAsync(`
    -- MARKETS (top-level list screen)
    CREATE TABLE IF NOT EXISTS markets (
      market_id TEXT PRIMARY KEY NOT NULL,
      base_asset TEXT,
      quote_asset TEXT,
      last_price REAL NOT NULL DEFAULT 0,
      change_24h REAL NOT NULL DEFAULT 0,
      volume_24h REAL NOT NULL DEFAULT 0,
      is_favourite INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_markets_fav ON markets(is_favourite);
    CREATE INDEX IF NOT EXISTS idx_markets_updated ON markets(updated_at);

    -- ORDERBOOK (for a market detail screen)
    CREATE TABLE IF NOT EXISTS orderbook_levels (
      market_id TEXT NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('bid','ask')),
      price REAL NOT NULL,
      size REAL NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      PRIMARY KEY (market_id, side, price),
      FOREIGN KEY (market_id) REFERENCES markets(market_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_orderbook_market_side
      ON orderbook_levels(market_id, side);

    -- TRADES (time-series)
    CREATE TABLE IF NOT EXISTS trades (
      trade_id TEXT PRIMARY KEY NOT NULL,
      market_id TEXT NOT NULL,
      ts INTEGER NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('buy','sell')),
      price REAL NOT NULL,
      size REAL NOT NULL,
      FOREIGN KEY (market_id) REFERENCES markets(market_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_trades_market_ts ON trades(market_id, ts DESC);

    -- ORDERS
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY NOT NULL,
      market_id TEXT NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('buy','sell')),
      type TEXT NOT NULL CHECK(type IN ('market','limit')),
      price REAL,
      size REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('open','filled','cancelled','rejected')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (market_id) REFERENCES markets(market_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_orders_market_created ON orders(market_id, created_at DESC);

    -- BALANCES
    CREATE TABLE IF NOT EXISTS balances (
      asset TEXT PRIMARY KEY NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      available REAL NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    -- EVENTS (raw event stream)
    CREATE TABLE IF NOT EXISTS events (
      idx INTEGER PRIMARY KEY NOT NULL,
      ts INTEGER,
      type TEXT NOT NULL,
      market_id TEXT,
      payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_market ON events(market_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

    -- PREFS
    CREATE TABLE IF NOT EXISTS prefs (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}
