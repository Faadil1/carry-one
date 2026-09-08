import { newDb, DataType } from "pg-mem";
import type { PgClientLike, PgPoolLike } from "../../src/persistence/pg-pool.js";

type PgMemPoolInstance = {
  connect(): Promise<PgClientLike>;
  query<R extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: R[] }>;
  end(): Promise<void>;
};

/**
 * Wraps pg-mem (in-memory Postgres) behind the PgPoolLike interface so the
 * Postgres adapters run hermetic tests against the real migration schema
 * without needing a live Postgres server.
 */
export class PgMemPool implements PgPoolLike {
  private readonly pool: PgMemPoolInstance;
  readonly db;

  constructor() {
    this.db = newDb();
    // pg-mem lacks the standard octet_length(text) function; register it so
    // the migration's recipient-data length CHECK works as it would on real PG.
    this.registerOctetLength();
    const { Pool } = this.db.adapters.createPg();
    this.pool = new Pool() as PgMemPoolInstance;
  }

  private registerOctetLength(): void {
    // pg-mem lacks the standard octet_length/char_length length functions that
    // the migration's CHECK constraints rely on; register them so the schema
    // behaves as it would on real Postgres.
    this.db.public.registerFunction({
      name: "octet_length",
      args: [DataType.text],
      returns: DataType.integer,
      implementation: (value: string | null) =>
        value === null ? null : Buffer.byteLength(value, "utf8"),
    });
    this.db.public.registerFunction({
      name: "octet_length",
      args: [DataType.bytea],
      returns: DataType.integer,
      implementation: (value: Buffer | null) =>
        value === null ? null : Buffer.from(value).length,
    });
    this.db.public.registerFunction({
      name: "char_length",
      args: [DataType.text],
      returns: DataType.integer,
      implementation: (value: string | null) => (value === null ? null : value.length),
    });
  }

  connect(): Promise<PgClientLike> {
    return this.pool.connect();
  }

  query<R extends object = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: R[] }> {
    return (this.pool.query as (text: string, values?: unknown[]) => Promise<{ rows: R[] }>)(
      text,
      values
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  /** Executes raw SQL against the in-memory DB (used to bootstrap the schema). */
  async exec(sql: string): Promise<void> {
    await this.db.public.none(sql);
  }
}