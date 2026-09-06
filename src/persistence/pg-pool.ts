import { Pool } from "pg";

/** A single checkout from the pool — the shape `pg`'s Client.Pool presents. */
export interface PgClientLike {
  query<R extends object = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: R[] }>;
  release(err?: Error): void;
}

/** The subset of `pg`'s Pool interface the adapters depend on. */
export interface PgPoolLike {
  connect(): Promise<PgClientLike>;
  query<R extends object = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: R[] }>;
  close(): Promise<void>;
}

/**
 * Production Postgres pool backed by node-postgres (`pg`). Connection is lazy:
 * no TCP socket is opened until a query/connect is issued, so code paths that
 * never touch the DB do not need a running server.
 */
export class PgPool implements PgPoolLike {
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10,
    });
    this.pool.on("error", (error) => {
      // Idle-client errors must not crash the process; surface them on the
      // next query instead.
      void error;
    });
  }

  async connect(): Promise<PgClientLike> {
    return this.pool.connect();
  }

  async query<R extends object = Record<string, unknown>>(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: R[] }> {
    return this.pool.query<R>(text, values);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
