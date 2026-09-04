import "dotenv/config";
import { RelayStore } from "./core/relay.js";
import { HttpNimiqRpcClient } from "./nimiq/rpc-client.js";
import { IncomingTransactionWatcher } from "./nimiq/transaction-watcher.js";
import { CanonicalRelayService } from "./service/canonical-relay-service.js";
import { createHttpServer } from "./service/http-server.js";

const port = Number(process.env.PORT ?? 8787);
const rpcUrl = process.env.NIMIQ_RPC_URL ?? "https://rpc.testnet.nimiqwatch.com";
const watchAddress = process.env.NIMIQ_TESTNET_WALLET_ADDRESS;

const rpc = new HttpNimiqRpcClient(rpcUrl);
const service = new CanonicalRelayService(new RelayStore(), rpc);
const server = createHttpServer(service);

server.listen(port, () => {
  console.log(`Carry One relay listening on :${port} (RPC: ${rpcUrl})`);
  if (!watchAddress) {
    console.warn("NIMIQ_TESTNET_WALLET_ADDRESS is not configured; transaction watching is disabled");
    return;
  }
  const watcher = new IncomingTransactionWatcher(rpc, watchAddress);
  watcher.start();
});
