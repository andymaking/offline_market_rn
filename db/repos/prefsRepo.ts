import { getDb } from '@/db/sqlite';

export async function setPref(key: string, value: string) {
  const db = await getDb();
  await db.runAsync(
    `
    INSERT INTO prefs (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `,
    [key, value]
  );
}

export async function getPref(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ value: string }>(`SELECT value FROM prefs WHERE key = ? LIMIT 1;`, [key]);
  return rows[0]?.value ?? null;
}
