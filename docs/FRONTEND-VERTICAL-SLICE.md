# Carry One — MVP Vertical Slice Frontend Skeleton

Date: 2026-09-07  
Status: implementation slice; visual polish intentionally deferred

## Purpose

This slice makes the frozen five-screen Reach Mission contract executable while Opeyemi continues backend/infra on `feat/postgres-adapter` and `feat/mission-http-bindings`. It intentionally avoids those backend files so the workstreams can proceed without overwriting each other.

Canonical screens remain exactly: Mission Home, Create Mission, Bridge Invitation, Pass 1 NIM, and Route / Arrival. Dialogs for wallet selection and next-bridge details are inline controls, not extra product screens.

## Real-mode behavior

The browser skeleton covers auth challenge, mission create/read, invitation create/read/accept/decline, pass intent, broadcast claim, and reconcile. If the backend/provider is unavailable, real mode fails closed. It does not silently substitute mock state.

On 2026-09-07 the frontend was reconciled against the live `feat/mission-http-bindings` branch rather than only the earlier written contract. `web/http-compat.js` bridges the current transport differences while that backend branch is still unmerged:

- nested UI auth envelopes are flattened to `challenge_id/public_key/signature`;
- invitation creation unwraps the backend's `{ invitation, invite_token, web_invite_url, nimiq_pay_custom_scheme }` response;
- invitation reads unwrap `{ invitation, mission }`;
- broadcast claims are routed to `/missions/:missionId/broadcast` and rebound to the accepted `invitation_id`;
- reconciliation converts an observed canonical sequence advance into the frontend FINAL signal;
- backend `CONFIRMED` route entries are normalized into the five-screen display shape and non-final entries are excluded from the displayed verified path.

This compatibility layer does not grant authority and does not replace server-side signature/finality enforcement.

## Wallet boundary

Inside Nimiq Pay, the client requests accounts, lets the human choose the account they expect to use when multiple are available, signs the server-generated action challenge, accepts only a pass intent with exact `100000` Luna plus opaque `co:v1:` recipient data, calls `sendBasicTransactionWithData` with requested `fee: 0`, records only the returned tx hash as a claim, and waits for independent backend reconciliation before presenting custody as advanced.

The UI explicitly states that account selection cannot force the transaction sender. Backend on-chain sender verification remains authoritative.

## Secure route following

The frontend capability boundary is implemented: a route-follow capability arriving as `?view=<opaque-token>` is immediately moved to `sessionStorage`, removed from the visible URL, and sent only as bearer authorization on later reads. The client never uses a view token as mutation authority.

**Integration blocker still open:** the current `feat/mission-http-bindings` branch does not yet enforce this bearer capability. Its read-side viewer role is currently derived from an `X-Wallet` header, and `MissionView` includes invitation `why_you`. Therefore secure route-following is **not** production-complete and must not be marked PASS until backend capability verification/redaction is added. The compatibility layer may use a locally signed wallet value only to personalize holder UI; it never treats `X-Wallet` as security authority.

Public Early Access remains blocked on that backend fix.

## Demo mode

`?demo=1` enables a clearly labeled local state-machine demo for UI review before the mission HTTP backend is merged. It performs no wallet or network writes and must never be presented as testnet evidence.

## Visual direction

The skeleton avoids generic dark AI-dashboard styling. Its visual language is a physical human route: warm paper, high-contrast route ribbons, bridge nodes, tactile cards and explicit transaction/custody language. Full TRACE polish remains deferred until the real vertical flow is proven.

## Public-repository safety

Because the repository is public, CI now performs a full-history high-confidence secret scan before typecheck/tests/build. This is an additional guard, not a guarantee that every possible secret format can be detected. Confirmed exposed credentials must be revoked/rotated before any history rewrite.

## Runtime gates still requiring real device/testnet

- multi-account Nimiq Pay behavior with the canonical holder;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with recipient data and requested fee 0;
- native Nimiq Pay deeplink opening the intended private invitation;
- full `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS -> FINAL -> ARRIVED` across 2–3 real wallets.

## Local preview

After the root TypeScript build, run `node dist/src/mini-app/dev-server.js`, then open `http://localhost:4173/?demo=1`.

For real HTTP integration once the backend branch is running, use `http://localhost:4173/?api=http://localhost:8787`. The real app must ultimately be served over HTTPS for Nimiq Pay/device validation.
