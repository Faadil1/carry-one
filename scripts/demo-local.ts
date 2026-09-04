import { randomBytes } from "node:crypto";
import { RelayStore } from "../src/core/relay.js";
import { ONE_NIM_IN_LUNA, batonDataTag, type NimiqTxLookup } from "../src/core/types.js";
import { NIMIQ_POLICY } from "../src/nimiq/policy.js";
import type { NimiqRpcClient } from "../src/nimiq/rpc-client.js";
import { CanonicalRelayService } from "../src/service/canonical-relay-service.js";
import { createHttpServer } from "../src/service/http-server.js";

const batonId = "demo";
const currentHolder = "NQ_DEMO_SENDER";
const recipient = "NQ_DEMO_RECIPIENT";
const txHash = randomBytes(32).toString("hex");
const includedBlock = NIMIQ_POLICY.genesisBlockNumber + 1;

class LocalDemoRpcClient implements NimiqRpcClient {
  private transaction: NimiqTxLookup | null = null;

  setTransaction(transaction: NimiqTxLookup): void {
    this.transaction = transaction;
  }

  async getTransactionByHash(hash: string): Promise<NimiqTxLookup | null> {
    return this.transaction?.hash === hash ? this.transaction : null;
  }

  async getBlockNumber(): Promise<number> {
    return includedBlock + NIMIQ_POLICY.blocksPerBatch;
  }
}

const rpc = new LocalDemoRpcClient();
const service = new CanonicalRelayService(new RelayStore(), rpc);
const intent = service.initiatePass(batonId, currentHolder, recipient);
service.recordBroadcast(batonId, txHash);
rpc.setTransaction({
  hash: txHash,
  from: currentHolder,
  to: recipient,
  value: ONE_NIM_IN_LUNA,
  blockNumber: includedBlock,
  confirmations: NIMIQ_POLICY.blocksPerBatch,
  recipientData: batonDataTag(batonId, intent.sequence),
});

const port = Number(process.env.DEMO_PORT ?? 8788);
const server = createHttpServer(service);
server.listen(port, () => {
  console.log(`Local demo ready on http://localhost:${port}`);
  console.log(`Simulated tx: ${txHash}`);
  console.log(`Try: curl.exe -X POST http://localhost:${port}/relay/demo/reconcile`);
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);