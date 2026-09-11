# NimCarry — Real Testnet E2E Runtime + Evidence Runbook

Date: 2026-09-11
Gate: `NIMCARRY_REAL_TESTNET_E2E_PROOF`
Status: **runtime topology locked; real FINAL/ARRIVED not yet observed**

## 0. Non-negotiable evidence boundary

This runbook does **not** create testnet proof by itself.

Do not claim a real testnet `FINAL`, custody transfer, `ARRIVED`, or Verified Route Receipt until all required observations below exist from the deployed runtime and real Nimiq Pay wallets.

The guided/demo flow remains presentation evidence only.

## 1. Locked runtime topology

Use the existing Vercel deployment as the Mini App/frontend surface and deploy the Mission HTTP API on a **long-lived single-process Node runtime** backed by a **dedicated PostgreSQL database**.

Why this topology is locked for this gate:

- `src/index.ts` is already the canonical Node application entrypoint.
- `CARRY_ONE_REPOSITORY=postgres` gives one shared durable Postgres-backed relay + mission store.
- route-view and broadcast capabilities are intentionally process-local short-lived stores today; a multi-instance/serverless backend could route sequential requests to different processes and invalidate those capabilities.
- the real E2E gate is not the place to redesign capability persistence. Keep one backend process for the proof run.
- frontend and backend should remain same-origin from the browser's perspective via a reverse proxy/rewrite when possible. If a separate browser origin is introduced, add an explicit strict-origin CORS boundary before using it.

### Required production shape

- Frontend: current NimCarry Vercel Mini App
- Backend: one long-lived Node process running `npm start`
- Database: dedicated Postgres for NimCarry testnet proof
- Network: Nimiq testnet only
- Wallets: A creator/current holder, B bridge, C destination
- Devices: preferably two physical devices
- Legacy relay mutations: disabled
- Mainnet/funds: forbidden for this gate

## 2. External infrastructure prerequisites

Before starting the real wallet run:

1. Provision a dedicated Postgres database for NimCarry.
2. Apply both migrations in order:
   - `migrations/001_reach_mission_foundation.sql`
   - `migrations/002_postgres_concurrency_guards.sql`
3. Provision a long-lived Node runtime capable of running one application process.
4. Connect the frontend to that runtime without weakening the browser security boundary.
5. Configure the exact environment contract below.
6. Confirm `/health` returns `{ "status": "ok" }` from the Mission HTTP server.
7. Open the deployed Mini App inside Nimiq Pay and confirm the injected provider is available.

## 3. Environment contract

Use deployment secret storage. Never commit real values.

```bash
NODE_ENV=production
PORT=8787

CARRY_ONE_REPOSITORY=postgres
CARRY_ONE_DATABASE_URL=postgres://...

CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL=<random 32-byte base64url>
CARRY_ONE_TARGET_HMAC_KEY_B64URL=<different random 32-byte base64url>
CARRY_ONE_CANONICAL_ORIGIN=https://<public-mini-app-origin>

CARRY_ONE_LEGACY_RELAY_ENABLED=false

NIMIQ_RPC_URL=https://rpc.testnet.nimiqwatch.com
# Prefer a comma-separated independently operated fallback set when available.
# NIMIQ_RPC_URLS=https://rpc-a.example,https://rpc-b.example
```

Generate the two application keys independently, for example:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

The two values must be different.

Do **not** set or expose private wallet keys in the deployed runtime. Nimiq Pay remains the user-controlled signing and transaction surface.

## 4. Database migration gate

Run migrations against the dedicated database with stop-on-error behavior, for example:

```bash
psql "$CARRY_ONE_DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/001_reach_mission_foundation.sql
psql "$CARRY_ONE_DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/002_postgres_concurrency_guards.sql
```

Pass criteria:

- both migrations succeed;
- the production runtime starts in `postgres` mode;
- no fallback to file/in-memory mission persistence occurs;
- restart preserves mission/hop state in Postgres.

## 5. Runtime preflight

Before touching a testnet wallet, verify:

- `GET /health` returns 200 with `status=ok`;
- startup log reports `Repository mode: postgres`;
- startup log reports Mission HTTP bindings enabled with PostgreSQL;
- `NODE_ENV=production`;
- `CARRY_ONE_LEGACY_RELAY_ENABLED=false` or omitted only when `NODE_ENV=production` is guaranteed;
- canonical origin is the public Mini App origin;
- encryption and HMAC keys are present and distinct;
- at least one working Nimiq testnet RPC read endpoint is configured, with fallback preferred;
- frontend loads outside demo mode;
- inside Nimiq Pay, `window.nimiq.listAccounts()` succeeds;
- multiple accounts can be selected when the wallet exposes more than one account.

## 6. Real proof topology

Use three genuine testnet wallets/accounts:

- **A** — creator and initial holder
- **B** — consented bridge
- **C** — consented destination

Target route:

`A -> B -> C`

Each finalized hop must transfer exactly:

`1 NIM = 100000 Luna`

Requested fee remains `0`. Record actual wallet/network behavior separately from the requested fee.

## 7. Canonical real E2E sequence

### Hop 1 — A to B

1. A opens the non-demo Mini App in Nimiq Pay.
2. A creates a mission whose private destination is C.
3. Verify mission creation is durable in Postgres.
4. A creates an invitation for B.
5. Share/open the native invitation deep link on B's device.
6. B accepts with wallet B.
7. Verify B receives a separate signed route-view capability after acceptance.
8. A authorizes the pass.
9. Confirm the pass intent recipient is B and `value_luna=100000`.
10. A approves the transaction in Nimiq Pay.
11. Record the real transaction hash.
12. Submit the capability-bound broadcast claim.
13. Reconcile until the backend independently observes `FINAL`.
14. Verify custody changes exactly once from A to B.
15. Verify the finalized hop exists in Postgres before calling Hop 1 successful.

### Hop 2 — B to C

1. B re-opens/follows the same mission as current holder.
2. B creates the next invitation for C.
3. C opens the native invitation deep link and accepts with wallet C.
4. B authorizes the pass.
5. Confirm the pass intent recipient is C and `value_luna=100000`.
6. B approves the transaction in Nimiq Pay.
7. Record the real transaction hash.
8. Submit the capability-bound broadcast claim.
9. Reconcile until the backend independently observes `FINAL`.
10. Verify custody changes exactly once from B to C.
11. Verify mission state becomes `ARRIVED` only because the finalized recipient is the destination.
12. Verify the second finalized hop and terminal mission state are durable in Postgres.

## 8. Required evidence packet

Capture all of the following before declaring the gate PASS:

- public Mini App URL used for the run;
- backend runtime identifier/revision used for the run;
- database migration/version confirmation;
- timestamped start/end of the run;
- wallet fingerprints for A/B/C only — never private keys or secrets;
- invitation deep-link behavior for B and C;
- transaction hash for A -> B;
- independent FINAL observation for A -> B;
- Postgres row/state confirming Hop 1 durability;
- transaction hash for B -> C;
- independent FINAL observation for B -> C;
- Postgres row/state confirming Hop 2 durability;
- `ARRIVED` mission state;
- rendered Route Receipt matching the two finalized hops;
- requested fee `0` plus observed wallet/network fee behavior;
- multi-account wallet-selection result;
- iOS cold launch result;
- iOS warm resume result;
- iOS background/resume result.

## 9. Gate verdict rubric

### PASS

Only if the full real sequence is observed:

`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A_SENDS_1_NIM_TO_B -> FINAL -> B_HOLDER -> INVITE -> ACCEPT -> AUTHORIZE -> B_SENDS_1_NIM_TO_C -> FINAL -> ARRIVED -> VERIFIED_ROUTE_RECEIPT`

and both finalized hops plus terminal mission state are durable in Postgres.

### PARTIAL / HOLD

Use HOLD if any of these occur:

- transaction broadcasts but FINAL is not independently observed;
- custody advances before FINAL;
- browser loses route/broadcast capability because requests hit another backend process;
- Postgres durability cannot be verified;
- B cannot become the next holder after Hop 1;
- C receives funds but mission does not become ARRIVED;
- Route Receipt does not match finalized route;
- native invite or iOS lifecycle breaks the path.

### FAIL-CLOSED

Never convert a timeout, UI projection, locally simulated state, wallet broadcast success, or mempool inclusion into `FINAL` or `ARRIVED` evidence.

## 10. Evidence record template

Copy this block into the eventual evidence file after the real run:

```yaml
gate: NIMCARRY_REAL_TESTNET_E2E_PROOF
verdict: HOLD
run_date: null
frontend_url: null
backend_revision: null
database_migrations: [001_reach_mission_foundation, 002_postgres_concurrency_guards]
wallets:
  A_fingerprint: null
  B_fingerprint: null
  C_fingerprint: null
hop_1:
  requested_value_luna: 100000
  requested_fee_luna: 0
  tx_hash: null
  final_observed: false
  durable_postgres_observed: false
hop_2:
  requested_value_luna: 100000
  requested_fee_luna: 0
  tx_hash: null
  final_observed: false
  durable_postgres_observed: false
arrived_observed: false
route_receipt_verified: false
multi_account_selection: NOT_RUN
ios_cold: NOT_RUN
ios_warm: NOT_RUN
ios_background_resume: NOT_RUN
notes: []
```

Change `verdict` to `PASS` only after every required proof element has been observed.