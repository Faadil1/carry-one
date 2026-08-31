# Carry One — W0→W5 Technical Spike

Status: **ACTIVE — PRE-BUILD VALIDATION**

## Objective

Prove that a single 1 NIM baton can move sequentially:

`W0 → W1 → W2 → W3 → W4 → W5`

with deterministic canonical state and fail-closed validation.

## Frozen transaction rule

A valid pass must satisfy all of the following:

- sender = current canonical holder;
- recipient = intended next holder from the active pass intent;
- value = exactly `100000` Luna (= 1 NIM) to the recipient;
- transaction fee is separate and is not part of amount validation;
- transaction matches `baton_id + sequence + recipient + nonce`;
- transaction is included and reaches the required FINAL state before the next pass unlocks;
- recipient has not already held this baton if the anti-repeat rule is enabled for the spike.

## Canonical sequence locking

Before a transaction is broadcast, create exactly one atomic active pass intent for:

`baton_id + sequence`

The intent must bind:

- current holder;
- intended recipient;
- expected amount;
- nonce;
- current sequence.

Mempool observation order is not canonical. A transaction advances the baton only when it matches the active intent and satisfies all validation rules.

## State progression

`READY → PENDING → INCLUDED → FINAL`

Additional non-canonical/display/error states:

- `CANCELLED`
- `INVALID`
- `DORMANT` — display state after prolonged inactivity; no claw-back or reassignment.

## Required negative tests

1. Wrong amount.
2. Correct 1 NIM value but different total sender outflow because of fee — must still validate on value, not outflow.
3. Wrong sender.
4. Wrong recipient.
5. Stale sequence.
6. Reused nonce.
7. Duplicate active intent.
8. Second/forked transfer after canonical state already advanced.
9. Native wallet confirmation cancelled by user.
10. App closes while transaction is pending; reopening must reconcile correctly.
11. Transaction never includes / expires; baton remains with the previous holder.

## Pass criteria

The spike passes only if:

- all five sequential hops complete;
- each next holder can use the received 1 NIM for the following pass;
- no invalid transfer advances canonical state;
- cancellation leaves the baton with the current holder;
- pending state recovers correctly after restart;
- only one canonical hop can win a sequence;
- FINAL semantics are documented against the Nimiq implementation actually used.

## Out of scope

- full production UI;
- prizes or wagering;
- custody or pooled funds;
- AI;
- marketplace features;
- NFT/token issuance;
- unique-human claims;
- production growth features.

## Deliverable

Technical lead returns:

1. source code for the spike;
2. setup/run instructions;
3. evidence of W0→W5 success;
4. negative-test results;
5. any Nimiq API/finality constraints discovered;
6. recommendation: `PASS`, `PASS_WITH_CHANGES`, or `FAIL`.
