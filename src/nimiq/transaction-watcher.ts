import type { NimiqRpcClient } from "./rpc-client.js";
import { ONE_NIM_IN_LUNA, batonDataTag, type NimiqTxLookup } from "../core/types.js";

/** Polls the read-only history API; it never signs, broadcasts, or moves funds. */
export class IncomingTransactionWatcher {
  private timer: ReturnType<typeof setInterval> | undefined;
  private seen = new Set<string>();

  constructor(
    private rpc: NimiqRpcClient,
    address: string,
    private intervalMs = Number(process.env.NIMIQ_WATCH_INTERVAL_MS ?? 5000)
  ) {
    this.address = normalizeAddress(address);
  }

  private address: string;

  start(): void {
    console.log(`Watching incoming testnet transactions for ${this.address}`);
    void this.poll();
    this.timer = setInterval(() => void this.poll(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  private async poll(): Promise<void> {
    if (!this.rpc.getTransactionsByAddress) {
      console.warn("Configured RPC client does not support getTransactionsByAddress; watching is unavailable");
      this.stop();
      return;
    }
    try {
      const transactions = await this.rpc.getTransactionsByAddress(this.address);
      for (const tx of transactions) {
        if (this.seen.has(tx.hash) || normalizeAddress(tx.to) !== this.address) continue;
        this.seen.add(tx.hash);
        this.logTransaction(tx);
      }
    } catch (error) {
      console.error("Transaction watcher poll failed:", error instanceof Error ? error.message : error);
    }
  }

  private logTransaction(tx: NimiqTxLookup): void {
    const exactAmount = tx.value === ONE_NIM_IN_LUNA;
    const payload = tx.recipientData;
    const batonPayload = payload === undefined || parseBatonPayload(payload) !== null;
    const status = exactAmount && (!payload || batonPayload) ? "VERIFIED_CANDIDATE" : "REJECTED_PAYLOAD";
    console.log(JSON.stringify({
      event: "incoming_transaction",
      status,
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      valueLuna: tx.value,
      valueNim: tx.value / ONE_NIM_IN_LUNA,
      blockNumber: tx.blockNumber,
      recipientData: payload ?? null,
      payloadValid: exactAmount && batonPayload,
    }));
  }
}

function normalizeAddress(address: string): string {
  return address.replace(/\s+/g, "").toUpperCase();
}

function parseBatonPayload(payload: string): { batonId: string; sequence: number } | null {
  const match = /^carryone:([^:]+):(\d+)$/.exec(payload);
  if (!match || Number(match[2]) < 1) return null;
  return { batonId: match[1], sequence: Number(match[2]) };
}