import { getDb } from '@/db/sqlite';

export type MarketRow = {
  market_id: string;
  base_asset: string | null;
  quote_asset: string | null;
  last_price: number;
  change_24h: number;
  volume_24h: number;
  is_favourite: number;
  updated_at: number;
};

export async function upsertMarket(args: {
  marketId: string;
  baseAsset?: string | null;
  quoteAsset?: string | null;
  lastPrice?: number;
  change24h?: number;
  volume24h?: number;
}) {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);

  await db.runAsync(
    `
    INSERT INTO markets (
      market_id, base_asset, quote_asset, last_price, change_24h, volume_24h, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(market_id) DO UPDATE SET
      base_asset = COALESCE(excluded.base_asset, markets.base_asset),
      quote_asset = COALESCE(excluded.quote_asset, markets.quote_asset),
      last_price = COALESCE(excluded.last_price, markets.last_price),
      change_24h = COALESCE(excluded.change_24h, markets.change_24h),
      volume_24h = COALESCE(excluded.volume_24h, markets.volume_24h),
      updated_at = excluded.updated_at;
    `,
    [
      args.marketId,
  args.baseAsset ?? null,
  args.quoteAsset ?? null,
  args.lastPrice ?? 0,
  args.change24h ?? 0,
  args.volume24h ?? 0,
      now,
    ]
  );
}

export async function setFavourite(marketId: string, isFav: boolean) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE markets SET is_favourite = ?, updated_at = ? WHERE market_id = ?;`,
    [isFav ? 1 : 0, Math.floor(Date.now() / 1000), marketId]
  );
}

export async function listMarkets(): Promise<MarketRow[]> {
  const db = await getDb();
  return db.getAllAsync<MarketRow>(
    `
    SELECT market_id, base_asset, quote_asset, last_price, change_24h, volume_24h, is_favourite, updated_at
    FROM markets
    ORDER BY is_favourite DESC, volume_24h DESC, market_id ASC;
    `
  );
}

export async function getMarket(marketId: string): Promise<MarketRow | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<MarketRow>(
    `SELECT * FROM markets WHERE market_id = ? LIMIT 1;`,
    [marketId]
  );
  return rows[0] ?? null;
}
