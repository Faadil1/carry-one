# Carry One — MVP Vertical Slice Frontend Skeleton

Date: 2026-09-07
Status: implementation slice; visual polish intentionally deferred

## Purpose

This slice makes the frozen five-screen Reach Mission contract executable without waiting for the production PostgreSQL/HTTP work to finish. It is intentionally split from backend/infra so Opeyemi can continue on `feat/postgres-adapter` without file-level collisions.

Canonical screens remain exactly: Mission Home, Create Mission, Bridge Invitation, Pass 1 NIM, and Route / Arrival. Dialogs for wallet selection and next-bridge details are inline controls, not extra product screens.

## Real-mode behavior

The browser skeleton is wired against the frozen API contract: auth challenge, mission create/read, invitation create/read/accept/decline, pass intent, broadcast claim, and reconcile. If the backend/provider is unavailable, real mode fails closed. It does not silently substitute mock state.

## Wallet boundary

Inside Nimiq Pay, the client requests accounts, lets the human choose the account they expect to use when multiple are available, signs the server-generated action challenge, accepts only a pass intent with exact `100000` Luna plus opaque `co:v1:` recipient data, calls `sendBasicTransactionWithData` with requested `fee: 0`, records only the returned tx hash as a claim, and waits for independent backend reconciliation before presenting custody as advanced. The UI explicitly states that account selection cannot force the transaction sender; backend on-chain sender verification remains authoritative.

## Secure route following

A route-follow capability may arrive as `?view=<opaque-token>`. The client immediately moves it into `sessionStorage` and removes it from the visible URL before later route reads. The token is sent only as bearer authorization. The client does not render full participant wallets or the private target wallet, and authorization failure never falls back to cached/public route data in real mode.

## Demo mode

`?demo=1` enables a clearly labeled local state-machine demo for UI review before the mission HTTP backend is merged. It performs no wallet or network writes and must never be presented as testnet evidence.

## Visual direction

The skeleton avoids generic dark AI-dashboard styling. Its visual language is a physical human route: warm paper, high-contrast route ribbons, bridge nodes, tactile cards and explicit transaction/custody language. Full TRACE polish remains deferred until the real vertical flow is proven.

## Runtime gates still requiring real device/testnet

- multi-account Nimiq Pay behavior with the canonical holder;
- wallet funded with exactly 1 NIM forwarding exactly 1 NIM with recipient data and requested fee 0;
- native Nimiq Pay deeplink opening the intended private invitation;
- full `CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> PASS -> FINAL -> ARRIVED` across 2–3 real wallets.

## Local preview

After the root TypeScript build, run `node dist/src/mini-app/dev-server.js`, then open `http://localhost:4173/?demo=1`. For real HTTP integration once Opeyemi's bindings are available, use `http://localhost:4173/?api=http://localhost:8787`. The real app must ultimately be served over HTTPS for Nimiq Pay/device validation.
