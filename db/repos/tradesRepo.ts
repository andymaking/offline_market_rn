import { getDb } from '@/db/sqlite';

export type TradeRow = {
  trade_id: string;
  market_id: string;
  ts: number;
  side: 'buy' | 'sell';
  price: number;
  size: number;
};

export async function insertTrade(t: TradeRow) {
  const db = await getDb();
  await db.runAsync(
    `
    INSERT OR IGNORE INTO trades (trade_id, market_id, ts, side, price, size)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [t.trade_id, t.market_id, t.ts, t.side, t.price, t.size]
  );
}

export async function listRecentTrades(marketId: string, limit = 80) {
  const db = await getDb();
  return db.getAllAsync<TradeRow>(
    `
    SELECT trade_id, market_id, ts, side, price, size
    FROM trades
    WHERE market_id = ?
    ORDER BY ts DESC
    LIMIT ?;
    `,
    [marketId, limit]
  );
}
