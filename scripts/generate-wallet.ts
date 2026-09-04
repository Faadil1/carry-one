import { Entropy, KeyPair } from "@nimiq/core";

/**
 * LOCAL TESTNET TOOL ONLY.
 * This prints wallet secrets to the terminal. Never paste its output into git,
 * chat, screenshots, issue trackers, or a production environment.
 *
 * The key is network-agnostic; select testnet when importing it into Nimiq Pay.
 */
const entropy = Entropy.generate();
const extendedPrivateKey = entropy.toExtendedPrivateKey();
const keyPair = KeyPair.derive(extendedPrivateKey.privateKey);
const userFriendlyAddress = keyPair.toAddress().toUserFriendlyAddress();

console.warn("LOCAL TESTNET WALLET - KEEP THESE SECRETS PRIVATE");
console.log(`Address: ${userFriendlyAddress}`);
console.log(`Private key (hex): ${extendedPrivateKey.privateKey.toHex()}`);
console.log(`Keypair (hex): ${keyPair.toHex()}`);
console.log(`Entropy (hex): ${Buffer.from(entropy.serialize()).toString("hex")}`);
console.log(`Mnemonic: ${entropy.toMnemonic().join(" ")}`);
console.log("Import/select TESTNET in Nimiq Pay before funding or using this wallet.");
