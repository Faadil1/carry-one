import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PgPoolLike } from "./pg-pool.js";

export interface MigrationFile {
  version: string;
  name: string;
  sql: string;
}

// Matches migration filenames like "001_reach_mission_foundation.sql".
const MIGRATION_FILE_RE = /^(\d+)_([a-z0-9_-]+)\.sql$/i;

export function listMigrationFiles(dir: string): MigrationFile[] {
  const files = readdirSync(dir)
    .filter((name) => MIGRATION_FILE_RE.test(name))
    .sort((a, b) => {
      const av = Number(a.match(MIGRATION_FILE_RE)![1]);
      const bv = Number(b.match(MIGRATION_FILE_RE)![1]);
      return av - bv;
    });
  return files.map((name) => {
    const match = name.match(MIGRATION_FILE_RE)!;
    return {
      version: match[1].padStart(8, "0"),
      name: `${match[1]}_${match[2]}`,
      sql: readFileSync(join(dir, name), "utf8"),
    };
  });
}

/**
 * Applies pending migrations in order. Each migration runs in its own
 * transaction and its version is recorded in `schema_migrations`. Already
 * applied versions (by name) are skipped, so re-running is idempotent.
 */
export async function runMigrations(pool: PgPoolLike, dir: string): Promise<string[]> {
  const appliedNames = await appliedMigrationNames(pool);
  const pending = listMigrationFiles(dir).filter((m) => !appliedNames.has(m.name));
  const appliedNow: string[] = [];

  for (const migration of pending) {
    await ensureSchemaMigrationsTable(pool);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      try {
        await client.query(migration.sql);
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${migration.name} failed: ${(error as Error).message}`);
      }
      await client.query(
        "INSERT INTO schema_migrations (name, applied_at) VALUES ($1, now())",
        [migration.name]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
    appliedNow.push(migration.name);
  }

  return appliedNow;
}

async function ensureSchemaMigrationsTable(pool: PgPoolLike): Promise<void> {
  const exists = await pool.query<{ found: number }>(
    `SELECT 1 AS found
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'schema_migrations'`
  );
  if (exists.rows.length === 0) {
    await pool.query(`
      CREATE TABLE schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL
      )
    `);
  }
}

async function appliedMigrationNames(pool: PgPoolLike): Promise<Set<string>> {
  await ensureSchemaMigrationsTable(pool);
  const result = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
  return new Set(result.rows.map((row) => row.name));
}
