import "dotenv/config";
import { RelayStore } from "./core/relay.js";
import { HttpNimiqRpcClient } from "./nimiq/rpc-client.js";
import { ResilientNimiqRpcClient } from "./nimiq/resilient-rpc-client.js";
import { IncomingTransactionWatcher } from "./nimiq/transaction-watcher.js";
import { FileRelayStore } from "./persistence/file-relay-store.js";
import { CanonicalRelayService } from "./service/canonical-relay-service.js";
import { createHttpServer } from "./service/http-server.js";

const port = Number(process.env.PORT ?? 8787);
const defaultRpcUrl = process.env.NIMIQ_RPC_URL ?? "https://rpc.testnet.nimiqwatch.com";
const rpcUrls = (process.env.NIMIQ_RPC_URLS ?? defaultRpcUrl)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const watchAddress = process.env.NIMIQ_TESTNET_WALLET_ADDRESS;
const relayStateFile = process.env.CARRY_ONE_RELAY_STATE_FILE;

const rpc = new ResilientNimiqRpcClient(rpcUrls.map((url) => new HttpNimiqRpcClient(url)));
const relayStore = relayStateFile ? new FileRelayStore(relayStateFile) : new RelayStore();
const service = new CanonicalRelayService(relayStore, rpc);
const server = createHttpServer(service);

server.listen(port, () => {
  console.log(`Carry One relay listening on :${port} (${rpcUrls.length} read RPC endpoint${rpcUrls.length === 1 ? "" : "s"})`);
  if (relayStateFile) console.log(`Durable relay state: ${relayStateFile}`);
  if (!watchAddress) {
    console.warn("NIMIQ_TESTNET_WALLET_ADDRESS is not configured; transaction watching is disabled");
    return;
  }
  const watcher = new IncomingTransactionWatcher(rpc, watchAddress);
  watcher.start();
});
