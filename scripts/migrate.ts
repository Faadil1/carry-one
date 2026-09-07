/**
 * Run pending migrations against the configured Postgres instance.
 *
 * Usage:
 *   npx tsx scripts/migrate.ts              # uses DATABASE_URL from .env / environment
 *   CARRY_ONE_DATABASE_URL=... npx tsx scripts/migrate.ts
 *
 * Exit codes: 0 = success (or already up-to-date), 1 = migration error.
 */
import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PgPool } from "../src/persistence/pg-pool.js";
import { runMigrations } from "../src/persistence/migration-runner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "migrations");

const connectionUrl = process.env.CARRY_ONE_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionUrl) {
  console.error(
    "No database URL configured. Set CARRY_ONE_DATABASE_URL or DATABASE_URL in your environment."
  );
  process.exit(1);
}

const pool = new PgPool(connectionUrl);
try {
  const applied = await runMigrations(pool, MIGRATIONS_DIR);
  if (applied.length === 0) {
    console.log("No pending migrations.");
  } else {
    for (const name of applied) {
      console.log(`Applied: ${name}`);
    }
    console.log(`Done — ${applied.length} migration(s) applied.`);
  }
} catch (error) {
  console.error("Migration failed:", (error as Error).message);
  process.exit(1);
} finally {
  await pool.close();
}
