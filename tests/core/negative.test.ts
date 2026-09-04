import { describe, expect, it } from "vitest";
import {
  INTENT_VALIDITY_WINDOW_MS,
  RelayStore,
  RelayValidationError,
  isDormant,
  isIntentStale,
  validateTransactionAgainstIntent,
} from "../../src/core/relay.js";
import { ONE_NIM_IN_LUNA } from "../../src/core/types.js";
import type { NimiqTxLookup } from "../../src/core/types.js";

const W0 = "NQ_WALLET_0";
const W1 = "NQ_WALLET_1";
const W2 = "NQ_WALLET_2";
const BATON = "baton-carry-one-spike";

function mockTx(overrides: Partial<NimiqTxLookup> = {}): NimiqTxLookup {
  return {
    hash: "0xabc",
    from: W0,
    to: W1,
    value: ONE_NIM_IN_LUNA,
    blockNumber: 12345,
    confirmations: 400,
    ...overrides,
  };
}

describe("Negative test 1: wrong amount", () => {
  it("rejects a transaction that isn't exactly 1 NIM", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const badTx = mockTx({ value: ONE_NIM_IN_LUNA - 1 });

    expect(() => validateTransactionAgainstIntent(intent, badTx)).toThrow(RelayValidationError);
    try {
      validateTransactionAgainstIntent(intent, badTx);
    } catch (e) {
      expect((e as RelayValidationError).reason).toBe("WRONG_AMOUNT");
    }
  });

  it("accepts exactly 1 NIM regardless of implied fee on sender outflow", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const okTx = mockTx({ value: ONE_NIM_IN_LUNA }); // fee is separate, not modeled here
    expect(() => validateTransactionAgainstIntent(intent, okTx)).not.toThrow();
  });
});

describe("Negative test 2: wrong sender/recipient", () => {
  it("rejects a transaction from someone other than the committed holder", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const badTx = mockTx({ from: W2 }); // W2 is not the current holder

    expect(() => validateTransactionAgainstIntent(intent, badTx)).toThrow(RelayValidationError);
    try {
      validateTransactionAgainstIntent(intent, badTx);
    } catch (e) {
      expect((e as RelayValidationError).reason).toBe("WRONG_SENDER");
    }
  });

  it("rejects a transaction to someone other than the committed recipient", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const badTx = mockTx({ to: W2 }); // baton was promised to W1, not W2

    expect(() => validateTransactionAgainstIntent(intent, badTx)).toThrow(RelayValidationError);
    try {
      validateTransactionAgainstIntent(intent, badTx);
    } catch (e) {
      expect((e as RelayValidationError).reason).toBe("WRONG_RECIPIENT");
    }
  });
});

describe("Negative test 2b: forged baton/sequence tag", () => {
  it("rejects a transaction whose recipient data doesn't match this baton/sequence", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const badTx = mockTx({ recipientData: "carryone:some-other-baton:1" });

    expect(() => validateTransactionAgainstIntent(intent, badTx)).toThrow(RelayValidationError);
    try {
      validateTransactionAgainstIntent(intent, badTx);
    } catch (e) {
      expect((e as RelayValidationError).reason).toBe("WRONG_BATON_TAG");
    }
  });

  it("accepts a matching tag, and skips the check entirely when no tag is present", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const tagged = mockTx({ recipientData: `carryone:${BATON}:${intent.sequence}` });
    expect(() => validateTransactionAgainstIntent(intent, tagged)).not.toThrow();

    const untagged = mockTx({ recipientData: undefined });
    expect(() => validateTransactionAgainstIntent(intent, untagged)).not.toThrow();
  });
});

describe("Negative test 3: stale or duplicate intent", () => {
  it("rejects creating a second intent while one is already active (race-condition fix)", () => {
    const store = new RelayStore();
    store.createIntent(BATON, W0, W1);

    expect(() => store.createIntent(BATON, W0, W2)).toThrow(RelayValidationError);
    try {
      store.createIntent(BATON, W0, W2);
    } catch (e) {
      expect((e as RelayValidationError).reason).toBe("DUPLICATE_INTENT");
    }
  });

  it("flags an intent as stale only after Nimiq's own tx validity window (plus safety buffer) elapses", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);
    const justBefore = intent.createdAt + INTENT_VALIDITY_WINDOW_MS;
    const justAfter = intent.createdAt + INTENT_VALIDITY_WINDOW_MS + 1;

    expect(isIntentStale(intent, intent.createdAt)).toBe(false);
    expect(isIntentStale(intent, justBefore)).toBe(false);
    expect(isIntentStale(intent, justAfter)).toBe(true);
  });

  it("rejects self-pass (holder passing to themselves) as a degenerate duplicate case", () => {
    const store = new RelayStore();
    expect(() => store.createIntent(BATON, W0, W0)).toThrow(RelayValidationError);
  });

  it("rejects a pass initiated by an address that is not the current holder", () => {
    const store = new RelayStore();
    store.createIntent(BATON, W0, W1);
    store.cancelIntent(BATON);

    expect(() => store.createIntent(BATON, W2, W1)).toThrow(RelayValidationError);
    try {
      store.createIntent(BATON, W2, W1);
    } catch (e) {
      expect((e as RelayValidationError).reason).toBe("WRONG_CURRENT_HOLDER");
    }
  });
});

describe("Negative test 4: cancellation", () => {
  it("leaves the baton with the current holder when the user cancels the Nimiq Pay prompt", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);

    // Simulate the user backing out of the native approval dialog: no tx is
    // ever broadcast, so the app cancels the intent directly.
    store.cancelIntent(BATON);

    expect(store.getActiveIntent(BATON)).toBeUndefined();
    // Sequence never advanced — W0 is still the effective current holder.
    expect(store.getCurrentSequence(BATON)).toBe(0);
  });
});

describe("Negative test 5: pending recovery", () => {
  it("reconciles correctly if the app is closed and reopened mid-transaction", () => {
    const store = new RelayStore();
    const intent = store.createIntent(BATON, W0, W1);

    // App closes here. On reopen, the intent is still exactly as it was —
    // nothing was lost, and no duplicate intent can be created for the same
    // baton (DUPLICATE_INTENT guards re-entrancy), so recovery just means
    // re-reading state, not re-deciding it.
    const recovered = store.getActiveIntent(BATON);
    expect(recovered).toEqual(intent);
    expect(() => store.createIntent(BATON, W0, W2)).toThrow(RelayValidationError);
  });
});

describe("Bonus: dormancy is display-only and never mutates state", () => {
  it("marks a relay dormant after 24h without touching the baton's custody", () => {
    const store = new RelayStore();
    store.createIntent(BATON, W0, W1);
    const lastActionAt = Date.now() - (24 * 60 * 60 * 1000 + 1);

    expect(isDormant(lastActionAt)).toBe(true);
    // Dormancy check does not cancel or reassign the intent:
    expect(store.getActiveIntent(BATON)).toBeDefined();
  });
});
