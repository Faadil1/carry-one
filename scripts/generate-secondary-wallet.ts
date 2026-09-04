import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { Entropy } from "@nimiq/core";

const envPath = new URL("../.env", import.meta.url);
const entropy = Entropy.generate();
const extendedPrivateKey = entropy.toExtendedPrivateKey();
const address = extendedPrivateKey.toAddress().toUserFriendlyAddress();
const mnemonic = entropy.toMnemonic().join(" ");

let env = await readFile(envPath, "utf8");
env = setEnv(env, "SECONDARY_WALLET_ADDRESS", address);
env = setEnv(env, "SECONDARY_WALLET_MNEMONIC", mnemonic);
await writeFile(envPath, env.endsWith("\n") ? env : `${env}\n`, "utf8");

console.log(`Generated secondary testnet wallet: ${address}`);
console.log("Mnemonic written to the ignored local .env file; it was not printed.");
console.log("Fund this address with testnet NIM before running npm run fund:wallet.");

function setEnv(contents: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(contents) ? contents.replace(pattern, line) : `${contents.trimEnd()}\n${line}`;
}