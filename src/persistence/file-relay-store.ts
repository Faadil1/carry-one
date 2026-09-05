import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { RelayStore, type RelayStoreSnapshot } from "../core/relay.js";

function loadSnapshot(filePath: string): RelayStoreSnapshot | undefined {
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(readFileSync(filePath, "utf8")) as RelayStoreSnapshot;
}

/**
 * Durable local/dev adapter for the canonical relay state machine. Production
 * deployment can replace this with Postgres without changing relay semantics;
 * the snapshot boundary exists primarily to prove restart recovery now.
 */
export class FileRelayStore extends RelayStore {
  private hydrating = true;

  constructor(private readonly filePath: string) {
    super(loadSnapshot(filePath));
    this.hydrating = false;
  }

  protected override onMutation(): void {
    if (this.hydrating) return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, `${JSON.stringify(this.snapshot(), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    renameSync(tmp, this.filePath);
  }
}
