import "dotenv/config";
import { Address, KeyPair, MnemonicUtils, PrivateKey, TransactionBuilder } from "@nimiq/core";
import { HttpNimiqRpcClient } from "../src/nimiq/rpc-client.js";
import { NIMIQ_TESTNET_POLICY } from "../src/nimiq/policy.js";

const secondaryAddressText = process.env.SECONDARY_WALLET_ADDRESS ?? "NQ55 JH10 X805 RM3Y 9YHE SK7S S89G D0SQ JPN3";
const recipientText = process.env.PRIMARY_WALLET_ADDRESS ?? process.env.NIMIQ_TESTNET_WALLET_ADDRESS;
const amountLuna = 100_000n;
const privateKeyHex = process.env.SECONDARY_WALLET_PRIVATE_KEY_HEX;
const mnemonic = process.env.SECONDARY_WALLET_MNEMONIC;
const rpcUrl = process.env.NIMIQ_RPC_URL ?? "https://rpc.testnet.nimiqwatch.com";

if (!privateKeyHex && !mnemonic) {
  throw new Error("Set SECONDARY_WALLET_PRIVATE_KEY_HEX or SECONDARY_WALLET_MNEMONIC in local .env");
}

if (privateKeyHex && !/^[0-9a-f]{64}$/i.test(privateKeyHex)) {
  throw new Error("SECONDARY_WALLET_PRIVATE_KEY_HEX must be exactly 64 hex characters");
}

if (!recipientText) {
  throw new Error("PRIMARY_WALLET_ADDRESS or NIMIQ_TESTNET_WALLET_ADDRESS is required");
}

const privateKey = privateKeyHex
  ? PrivateKey.fromHex(privateKeyHex)
  : MnemonicUtils.mnemonicToExtendedPrivateKey(mnemonic!).privateKey;
const keyPair = KeyPair.derive(privateKey);
const sender = keyPair.toAddress();
const senderText = sender.toUserFriendlyAddress();
let recipient: Address;
try {
  recipient = Address.fromUserFriendlyAddress(recipientText);
} catch {
  throw new Error(`PRIMARY_WALLET_ADDRESS is not a valid Nimiq address: ${recipientText}`);
}

if (process.env.CONFIRM_BROADCAST !== "true") {
  console.log("Dry run only. No transaction was signed or broadcast.");
  console.log(`Sender: ${senderText}`);
  console.log(`Recipient: ${recipientText}`);
  console.log("Amount: 1 NIM (100,000 Luna)");
  console.log("Payload: carryone:demo:1");
  console.log(`Network: Nimiq TestAlbatross (${rpcUrl})`);
  console.log("To broadcast this exact testnet payment, set CONFIRM_BROADCAST=true and run again.");
  process.exit(0);
}

const rpc = new HttpNimiqRpcClient(rpcUrl);
const headHeight = await rpc.getBlockNumber();
const transaction = TransactionBuilder.newBasicWithData(
  sender,
  recipient,
  new TextEncoder().encode("carryone:demo:1"),
  amountLuna,
  null,
  headHeight,
  NIMIQ_TESTNET_POLICY.networkId!
);
transaction.sign(keyPair, undefined);

const response = await fetch(rpcUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "sendRawTransaction",
    params: [transaction.toHex()],
    id: 1,
  }),
});
if (!response.ok) throw new Error(`Nimiq RPC sendRawTransaction failed: HTTP ${response.status}`);
const responseText = await response.text();
const result = JSON.parse(responseText) as {
  result?: string | { hash?: string; data?: string } | null;
  error?: unknown;
};
if (result.error) throw new Error(`Nimiq RPC sendRawTransaction error: ${JSON.stringify(result.error)}`);
const transactionHash =
  typeof result.result === "string" ? result.result : result.result?.hash ?? result.result?.data;
if (!transactionHash) {
  throw new Error(`Nimiq RPC did not return a transaction hash. Response: ${responseText}`);
}

console.log(`Broadcast transaction hash: ${transactionHash}`);
console.log(`Sent 1 NIM from ${senderText} to ${recipientText} on TestAlbatross`);

function normalizeAddress(address: string): string {
  return address.replace(/\s+/g, "").toUpperCase();
}
