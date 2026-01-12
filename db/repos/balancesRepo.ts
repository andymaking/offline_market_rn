import { getDb } from '@/db/sqlite';

export type BalanceRow = {
  asset: string;
  total: number;
  available: number;
  updated_at: number;
};

export async function upsertBalance(args: { asset: string; total: number; available: number }) {
  const db = await getDb();
  await db.runAsync(
    `
    INSERT INTO balances (asset, total, available, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(asset) DO UPDATE SET
      total = excluded.total,
      available = excluded.available,
      updated_at = excluded.updated_at;
    `,
    [args.asset, args.total, args.available, Math.floor(Date.now() / 1000)]
  );
}

export async function listBalances(): Promise<BalanceRow[]> {
  const db = await getDb();
  return db.getAllAsync<BalanceRow>(
    `SELECT asset, total, available, updated_at FROM balances ORDER BY total DESC, asset ASC;`
  );
}
