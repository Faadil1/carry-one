import "dotenv/config";
import { HttpNimiqRpcClient } from "./nimiq/rpc-client.js";
import { ResilientNimiqRpcClient } from "./nimiq/resilient-rpc-client.js";
import { IncomingTransactionWatcher } from "./nimiq/transaction-watcher.js";
import { CanonicalRelayService } from "./service/canonical-relay-service.js";
import { createHttpServer } from "./service/http-server.js";
import { createRepositoryStores, resolveRepositoryMode } from "./persistence/bootstrap.js";

const port = Number(process.env.PORT ?? 8787);
const defaultRpcUrl = process.env.NIMIQ_RPC_URL ?? "https://rpc.testnet.nimiqwatch.com";
const rpcUrls = (process.env.NIMIQ_RPC_URLS ?? defaultRpcUrl)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const watchAddress = process.env.NIMIQ_TESTNET_WALLET_ADDRESS;
const repositoryMode = resolveRepositoryMode();

async function main(): Promise<void> {
  const stores = await createRepositoryStores();
  const rpc = new ResilientNimiqRpcClient(rpcUrls.map((url) => new HttpNimiqRpcClient(url)));
  const service = new CanonicalRelayService(stores.relayStore, rpc);
  const server = createHttpServer(service);

  server.listen(port, () => {
    console.log(
      `Carry One relay listening on :${port} (${rpcUrls.length} read RPC endpoint${rpcUrls.length === 1 ? "" : "s"})`
    );
    console.log(`Repository mode: ${repositoryMode}${repositoryMode === "postgres" ? "" : ` (state file: ${process.env.CARRY_ONE_RELAY_STATE_FILE ?? "in-memory"})`}`);
    if (!watchAddress) {
      console.warn("NIMIQ_TESTNET_WALLET_ADDRESS is not configured; transaction watching is disabled");
      return;
    }
    const watcher = new IncomingTransactionWatcher(rpc, watchAddress);
    watcher.start();
  });

  let closing = false;
  const shutdown = async (code: number): Promise<void> => {
    if (closing) return;
    closing = true;
    server.close(async () => {
      await stores.close();
      process.exit(code);
    });
  };
  process.once("SIGINT", () => void shutdown(0));
  process.once("SIGTERM", () => void shutdown(0));
}

void main().catch((error) => {
  console.error("Startup failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});