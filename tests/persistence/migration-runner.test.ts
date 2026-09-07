import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PgMemPool } from "../helpers/pg-mem-pool.js";
import { listMigrationFiles, runMigrations } from "../../src/persistence/migration-runner.js";

const MIGRATION_DIR = join(import.meta.dirname!, "../../migrations");

describe("migration runner", () => {
  it("lists migration files in version order", () => {
    const files = listMigrationFiles(MIGRATION_DIR);
    expect(files.length).toBeGreaterThanOrEqual(1);
    const versions = files.map((f) => f.version);
    expect([...versions].sort()).toEqual(versions);
    expect(files.every((f) => f.sql.length > 0)).toBe(true);
  });

  it("applies the real migration and becomes idempotent on re-run", async () => {
    const pool = new PgMemPool();
    const first = await runMigrations(pool, MIGRATION_DIR);
    expect(first.length).toBeGreaterThanOrEqual(1);
    expect(first[0]).toBe("001_reach_mission_foundation");

    const second = await runMigrations(pool, MIGRATION_DIR);
    expect(second).toEqual([]);

    const tables = await pool.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const names = tables.rows.map((r) => r.table_name);
    expect(names).toContain("missions");
    expect(names).toContain("pass_intents");
    expect(names).toContain("hops");
    expect(names).toContain("schema_migrations");
  });

  it("records an applied migration name exactly once", async () => {
    const pool = new PgMemPool();
    await runMigrations(pool, MIGRATION_DIR);
    const rows = await pool.query<{ name: string; count: number }>(
      "SELECT name, COUNT(*) AS count FROM schema_migrations GROUP BY name"
    );
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0].name).toBe("001_reach_mission_foundation");
    expect(rows.rows[0].count).toBe(1);
  });

  it("skips only the pending migrations when some are already applied", async () => {
    const pool = new PgMemPool();
    const dir = mkdtempSync(join(tmpdir(), "carry-one-mig-"));
    const early = mkdtempSync(join(tmpdir(), "carry-one-mig2-"));
    try {
      // Apply only 001 first.
      writeFileSync(join(early, "001_first.sql"), "CREATE TABLE first_tbl (id integer PRIMARY KEY);");
      await runMigrations(pool, early);

      // Simulate 002 as applied upstream (already recorded), then drop in 002
      // and 003 and confirm only the pending 003 runs.
      await pool.query("INSERT INTO schema_migrations (name, applied_at) VALUES ($1, now())", ["002_second"]);
      writeFileSync(join(early, "002_second.sql"), "CREATE TABLE second_tbl (id integer PRIMARY KEY);");
      writeFileSync(join(early, "003_third.sql"), "CREATE TABLE third_tbl (id integer PRIMARY KEY);");
      const second = await runMigrations(pool, early);
      expect(second).toEqual(["003_third"]);
    } finally {
      rmSync(early, { recursive: true, force: true });
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("aborts and does not record a failing migration", async () => {
    const pool = new PgMemPool();
    const dir = mkdtempSync(join(tmpdir(), "carry-one-mig-fail-"));
    try {
      writeFileSync(join(dir, "001_bad.sql"), "CREATE TABLE bad_tbl (id integer); SELECT * FROM missing_table;");
      await expect(runMigrations(pool, dir)).rejects.toThrow(/Migration 001_bad failed/);
      const recorded = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
      expect(recorded.rows).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});