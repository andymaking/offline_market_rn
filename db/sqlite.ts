import * as SQLite from 'expo-sqlite';

export type Db = SQLite.SQLiteDatabase;

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync('market.db');

  await _db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  return _db;
}
