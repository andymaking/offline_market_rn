import { getDb } from '@/db/sqlite';

export type EventRow = {
  idx: number;
  ts: number | null;
  type: string;
  market_id: string | null;
  payload_json: string;
};

export async function insertEvent(args: {
  idx: number;
  ts?: number | null;
  type: string;
  marketId?: string | null;
  payload: unknown;
}) {
  const db = await getDb();
  await db.runAsync(
    `
    INSERT OR IGNORE INTO events (idx, ts, type, market_id, payload_json)
    VALUES (?, ?, ?, ?, ?);
    `,
    [args.idx, args.ts ?? null, args.type, args.marketId ?? null, JSON.stringify(args.payload ?? {})]
  );
}

export async function getMaxEventIndex(): Promise<number> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ maxIdx: number | null }>(`SELECT MAX(idx) as maxIdx FROM events;`);
  return rows[0]?.maxIdx ?? -1;
}
