import { describe, expect, it } from "vitest";
import { RelayStore, validateTransactionAgainstIntent } from "../../src/core/relay.js";
import { ONE_NIM_IN_LUNA, type Hop, type NimiqTxLookup } from "../../src/core/types.js";

const WALLETS = ["W0", "W1", "W2", "W3", "W4", "W5"];
const BATON = "baton-five-hop-spike";

/** Simulates one full hop: create intent -> observe matching tx -> validate -> record as FINAL. */
function runHop(store: RelayStore, from: string, to: string, blockNumber: number): Hop {
  const intent = store.createIntent(BATON, from, to);

  const tx: NimiqTxLookup = {
    hash: `0xhash-${intent.sequence}`,
    from,
    to,
    value: ONE_NIM_IN_LUNA,
    blockNumber,
    confirmations: 350, // above the assumed finality threshold
  };

  validateTransactionAgainstIntent(intent, tx); // throws on any failure — chain must fail closed

  const hop: Hop = {
    batonId: BATON,
    sequence: intent.sequence,
    currentHolder: from,
    recipient: to,
    nonce: intent.nonce,
    txHash: tx.hash,
    value: tx.value,
    status: "FINAL",
    createdAt: intent.createdAt,
    confirmedAt: Date.now(),
  };
  store.recordHop(hop);
  return hop;
}

describe("Five-hop technical spike: W0 -> W1 -> W2 -> W3 -> W4 -> W5", () => {
  it("chains all five hops with sequence numbers incrementing correctly", () => {
    const store = new RelayStore();

    for (let i = 0; i < WALLETS.length - 1; i++) {
      const hop = runHop(store, WALLETS[i], WALLETS[i + 1], 1000 + i);
      expect(hop.sequence).toBe(i + 1);
      expect(hop.status).toBe("FINAL");
      // Each hop consumes its intent — no leftover active intent after FINAL.
      expect(store.getActiveIntent(BATON)).toBeUndefined();
    }

    const hops = store.getHops(BATON);
    expect(hops).toHaveLength(5);
    expect(hops.map((h) => h.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(store.getCurrentSequence(BATON)).toBe(5);
  });

  it("canonical relay history is queryable and correctly ordered after all five hops", () => {
    const store = new RelayStore();
    for (let i = 0; i < WALLETS.length - 1; i++) {
      runHop(store, WALLETS[i], WALLETS[i + 1], 2000 + i);
    }

    const hops = store.getHops(BATON);
    // Each hop's recipient is the next hop's sender — the chain is unbroken.
    for (let i = 0; i < hops.length - 1; i++) {
      expect(hops[i].recipient).toBe(hops[i + 1].currentHolder);
    }
    expect(hops[0].currentHolder).toBe("W0");
    expect(hops[hops.length - 1].recipient).toBe("W5");
  });

  it("a mismatched hop in the middle of the chain fails closed and does not advance", () => {
    const store = new RelayStore();
    runHop(store, "W0", "W1", 3000);
    runHop(store, "W1", "W2", 3001);

    // W2 tries to pass, but a forged/duplicate tx claims a different recipient.
    const intent = store.createIntent(BATON, "W2", "W3");
    const forgedTx: NimiqTxLookup = {
      hash: "0xforged",
      from: "W2",
      to: "W9", // does not match committed intent
      value: ONE_NIM_IN_LUNA,
      blockNumber: 3002,
      confirmations: 350,
    };

    expect(() => validateTransactionAgainstIntent(intent, forgedTx)).toThrow();
    // Relay must still show only 2 confirmed hops — it never advanced.
    expect(store.getCurrentSequence(BATON)).toBe(2);
  });
});
