import { getDb } from '@/db/sqlite';

export type OrderbookLevelRow = {
  market_id: string;
  side: 'bid' | 'ask';
  price: number;
  size: number;
};

export async function replaceOrderbook(args: {
  marketId: string;
  bids: { price: number; size: number }[];
  asks: { price: number; size: number }[];
}) {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);

  await db.execAsync('BEGIN;');
  try {
    await db.runAsync(`DELETE FROM orderbook_levels WHERE market_id = ?;`, [args.marketId]);

    const insertSql = `
      INSERT INTO orderbook_levels (market_id, side, price, size, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(market_id, side, price) DO UPDATE SET
        size = excluded.size,
        updated_at = excluded.updated_at;
    `;

    for (const l of args.bids) {
      await db.runAsync(insertSql, [args.marketId, 'bid', l.price, l.size, now]);
    }
    for (const l of args.asks) {
      await db.runAsync(insertSql, [args.marketId, 'ask', l.price, l.size, now]);
    }

    await db.execAsync('COMMIT;');
  } catch (e) {
    await db.execAsync('ROLLBACK;');
    throw e;
  }
}

export async function upsertLevel(args: {
  marketId: string;
  side: 'bid' | 'ask';
  price: number;
  size: number;
}) {
  const db = await getDb();

  if (args.size <= 0) {
    await db.runAsync(
      `DELETE FROM orderbook_levels WHERE market_id=? AND side=? AND price=?;`,
      [args.marketId, args.side, args.price]
    );
    return;
  }

  await db.runAsync(
    `
    INSERT INTO orderbook_levels (market_id, side, price, size, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(market_id, side, price) DO UPDATE SET
      size = excluded.size,
      updated_at = excluded.updated_at;
    `,
    [args.marketId, args.side, args.price, args.size, Math.floor(Date.now() / 1000)]
  );
}

export async function getOrderbook(marketId: string): Promise<{
  bids: OrderbookLevelRow[];
  asks: OrderbookLevelRow[];
}> {
  const db = await getDb();

  const bids = await db.getAllAsync<OrderbookLevelRow>(
    `
    SELECT market_id, side, price, size
    FROM orderbook_levels
    WHERE market_id = ? AND side = 'bid'
    ORDER BY price DESC
    LIMIT 20;
    `,
    [marketId]
  );

  const asks = await db.getAllAsync<OrderbookLevelRow>(
    `
    SELECT market_id, side, price, size
    FROM orderbook_levels
    WHERE market_id = ? AND side = 'ask'
    ORDER BY price ASC
    LIMIT 20;
    `,
    [marketId]
  );

  return { bids, asks };
}
