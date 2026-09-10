# NimCarry — Faadil-side HTTP security delta

Date: 2026-09-09
Status: implementation branch, pending CI/merge
Branch: `feat/faadil-http-security`
Base: `feat/mission-http-bindings` at `4f219cbd153484e560c4079ffd8c549ec52e483f`

## Scope

This branch implements the two Faadil-side blockers from the agreed HTTP split without force-updating Opeyemi's branch:

1. secure tx-hash broadcast claim;
2. automatic frontend/API-client `Idempotency-Key` generation.

## Broadcast capability

A signed `AUTHORIZE_PASS` now returns a short-lived, process-local bearer capability bound to:

- mission id;
- invitation id;
- sequence;
- pass-intent nonce;
- canonical holder wallet.

`POST /missions/:id/broadcast` must present that capability. The capability is one-time and expires no later than the pass intent. Same-request network retries remain safe because the HTTP idempotency replay cache is checked before the capability is consumed again.

A process restart intentionally invalidates outstanding bearer capabilities while preserving the durable pass intent. The holder can obtain a fresh capability by repeating the signed `AUTHORIZE_PASS` operation.

## Client idempotency

`src/mini-app/api-client.ts` now generates a fresh `Idempotency-Key` automatically for canonical mutation endpoints. Broadcast also accepts an explicit stable retry key so callers can safely retry the exact same request after a transport failure.

`/auth/challenge` and `/reconcile` intentionally do not use the replay cache; reconcile must re-evaluate current finality on every poll.

## Tests added/updated

- capability consume/replay/binding/expiry behavior;
- HTTP E2E includes capability issuance and secure broadcast;
- same idempotency key replays the successful broadcast after capability consumption;
- a new idempotency key cannot replay a consumed capability;
- missing capability is rejected;
- API client sends automatic mutation idempotency keys and transports broadcast capability.

## Not changed here

Still owned by the parallel Opeyemi work / integration gate:

- spoofable `X-Wallet` route-view authorization;
- invitation privacy/redaction;
- legacy `/relay` dev-gating;
- full frontend + HTTP + PostgreSQL integration;
- real Nimiq Pay testnet E2E.

No real testnet proof is claimed by this branch.
