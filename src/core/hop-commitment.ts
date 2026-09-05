import { createHash } from "node:crypto";

/**
 * Opaque, deterministic commitment written into Nimiq recipient data for a
 * Reach Mission pass. It deliberately does not reveal the mission id, holder,
 * recipient or sequence in clear text on-chain.
 *
 * The random pass nonce makes offline reversal impractical even when an
 * observer knows likely mission ids. The commitment is still only a binding
 * tag — blockchain sender/recipient/value remain public by design.
 */
export function opaqueHopCommitment(input: {
  batonId: string;
  sequence: number;
  currentHolder: string;
  recipient: string;
  nonce: string;
}): string {
  const material = [
    "carry-one-hop:v1",
    input.batonId,
    String(input.sequence),
    input.currentHolder,
    input.recipient,
    input.nonce,
  ].join("\n");
  const digest = createHash("sha256").update(material, "utf8").digest("base64url");
  const commitment = `co:v1:${digest}`;
  // Nimiq basic transaction data supports up to 64 bytes; this remains < 64 ASCII bytes.
  if (Buffer.byteLength(commitment, "utf8") > 64) {
    throw new Error("Opaque Carry One hop commitment exceeds Nimiq recipient-data limit");
  }
  return commitment;
}
