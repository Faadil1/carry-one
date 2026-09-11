# NimCarry — Real Testnet E2E Runtime + Evidence Runbook

Date: 2026-09-11
Gate: `NIMCARRY_REAL_TESTNET_E2E_PROOF`
Status: **Neon production database ready; Cloudflare deployment + real FINAL/ARRIVED still pending**

## 0. Non-negotiable evidence boundary

This runbook does **not** create testnet proof by itself.

Do not claim a real testnet `FINAL`, custody transfer, `ARRIVED`, or Verified Route Receipt until all required observations below exist from the deployed runtime and real Nimiq Pay wallets.

The guided/demo flow remains presentation evidence only.

## 1. Locked runtime topology

NimCarry is now prepared to deploy as one Cloudflare Worker application with:

- Cloudflare Workers Static Assets serving `web/`;
- the canonical Node Mission HTTP runtime inside a Cloudflare Container;
- one stable container identity: `nimcarry-primary`;
- `max_instances: 1` during this proof gate;
- a dedicated external PostgreSQL database;
- Nimiq testnet only.

Deployment files:

- `cloudflare/worker.mjs`
- `cloudflare/wrangler.jsonc`
- `cloudflare/package.json`
- `Dockerfile.cloudflare`

Why this topology is locked for this gate:

- `src/index.ts` stays the canonical Node application entrypoint; no product-runtime rewrite is required.
- `CARRY_ONE_REPOSITORY=postgres` gives one shared durable Postgres-backed relay + mission store.
- route-view and broadcast capabilities are intentionally short-lived process-local stores today.
- Cloudflare Containers can be addressed through a stable Durable Object/container name, so all API requests in the proof window can be routed to the same logical container instance.
- static frontend and API are served from the same Cloudflare origin, avoiding a new CORS trust boundary.
- browser navigation to `/mission/*` and `/i/*` remains SPA navigation, while JSON API requests are routed to the Node backend based on method/Accept contract.

### Important limitation

Cloudflare does not guarantee that a container process will run forever. A platform restart or deployment can replace it. PostgreSQL state survives; process-local route/broadcast capabilities do not.

Therefore during `NIMCARRY_REAL_TESTNET_E2E_PROOF`:

- keep one stable container ID;
- do not redeploy during an active A -> B -> C proof run;
- if the container restarts mid-run and a capability is lost, fail closed and restart the proof run rather than inventing recovery evidence;
- durable/shared capability storage is a later production-hardening item, not a reason to weaken the current security contract.

## 2. Cloudflare account prerequisite

Cloudflare Containers requires Workers Paid. The current documented plan floor is USD 5/month.

No Cloudflare account mutation or paid deployment has been executed by this repository preparation alone.

## 3. PostgreSQL status — NEON READY

Opeyemi confirmed on 2026-09-11 that he never set up or connected any persistent database for NimCarry. The duplicate-database check is complete.

A dedicated Neon PostgreSQL project is now provisioned:

- project: `nimcarry`
- project id: `late-credit-21248077`
- branch: `main`
- database: `nimcarry`
- region: `aws-us-east-1`
- PostgreSQL: 18

Both production migrations have been applied:

- `migrations/001_reach_mission_foundation.sql`
- `migrations/002_postgres_concurrency_guards.sql`

Verification after application:

- 7 canonical tables present: `missions`, `invitations`, `pass_intents`, `hops`, `participants`, `auth_challenges`, `audit_events`;
- 3 production concurrency triggers present: `carry_one_invitation_insert_guard`, `carry_one_invitation_accept_guard`, `carry_one_participant_reentry_guard`;
- the database connection string has been obtained securely and must never be committed or pasted into public evidence.

The remaining database task is only runtime wiring: install that connection string into Cloudflare as the secret `CARRY_ONE_DATABASE_URL`.

## 4. External infrastructure prerequisites

Database provisioning and migrations are complete. Before starting the real wallet run:

1. Enable/confirm Workers Paid / Containers in the Cloudflare account.
2. Connect the repository to Cloudflare Workers Builds or deploy with Wrangler.
3. Configure the exact Cloudflare Worker secrets below, including the already-obtained Neon URL.
4. Deploy the Worker + singleton container.
5. Set/confirm `CARRY_ONE_CANONICAL_ORIGIN` to the actual public Cloudflare origin and redeploy if necessary.
6. Confirm `/health` returns `{ "status": "ok" }` from the Mission HTTP server.
7. Confirm startup/runtime evidence shows PostgreSQL repository mode.
8. Open the deployed Mini App inside Nimiq Pay and confirm the injected provider is available.

## 5. Cloudflare deployment contract

From the repository root, the Cloudflare build/deploy command can be:

```bash
npm --prefix cloudflare install
npm --prefix cloudflare run deploy
```

For Cloudflare Workers Builds, keep the build root at the repository root so both `cloudflare/wrangler.jsonc` and `Dockerfile.cloudflare` remain inside the build root.

The Worker serves `web/` itself and forwards API requests to the stable `nimcarry-primary` container, so the frontend does not need a separate API hostname.

## 6. Environment and secret contract

The Worker passes these values into the Node container. Use Cloudflare Worker Secrets for sensitive values. Never commit real values.

Required secrets/configuration:

```bash
CARRY_ONE_DATABASE_URL=postgres://...
CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL=<random 32-byte base64url>
CARRY_ONE_TARGET_HMAC_KEY_B64URL=<different random 32-byte base64url>
CARRY_ONE_CANONICAL_ORIGIN=https://<public-cloudflare-origin>
```

Optional RPC overrides:

```bash
NIMIQ_RPC_URL=https://rpc.testnet.nimiqwatch.com
# Prefer multiple independently operated read endpoints when available.
NIMIQ_RPC_URLS=https://rpc-a.example,https://rpc-b.example
```

The container wrapper fixes these runtime values for this gate:

```bash
NODE_ENV=production
PORT=8787
CARRY_ONE_REPOSITORY=postgres
CARRY_ONE_LEGACY_RELAY_ENABLED=false
```

Generate the two application keys independently, for example:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

The two values must be different.

Do **not** set or expose private wallet keys in the deployed runtime. Nimiq Pay remains the user-controlled signing and transaction surface.

## 7. Database migration gate — PASS

The production database migration gate is complete on the dedicated Neon database.

Pass criteria already observed:

- both migrations succeeded;
- canonical production tables exist;
- PostgreSQL concurrency guards/triggers exist.

Still to verify after Cloudflare deployment:

- production runtime starts in `postgres` mode;
- no fallback to file/in-memory mission persistence occurs;
- restart preserves mission/hop state in Neon.

## 8. Runtime preflight

Before touching a testnet wallet, verify:

- the Cloudflare deployment is active;
- `GET /health` returns 200 with `status=ok`;
- startup log reports `Repository mode: postgres`;
- startup log reports Mission HTTP bindings enabled with PostgreSQL;
- Cloudflare routes API requests to the stable `nimcarry-primary` container;
- only one container instance is allowed for this gate;
- canonical origin exactly matches the public Cloudflare Mini App origin;
- encryption and HMAC keys are present and distinct;
- legacy `/relay` POST mutations return `403 LEGACY_RELAY_DISABLED`;
- at least one working Nimiq testnet RPC read endpoint is configured, with fallback preferred;
- frontend loads outside demo mode from the same Cloudflare origin;
- direct `/mission/...` and `/i/...` browser navigation returns the SPA shell;
- JSON fetches to `/missions/...` and `/i/...` reach the backend;
- inside Nimiq Pay, `window.nimiq.listAccounts()` succeeds;
- multiple accounts can be selected when the wallet exposes more than one account.

## 9. Real proof topology

Use three genuine testnet wallets/accounts:

- **A** — creator and initial holder
- **B** — consented bridge
- **C** — consented destination

Target route:

`A -> B -> C`

Each finalized hop must transfer exactly:

`1 NIM = 100000 Luna`

Requested fee remains `0`. Record actual wallet/network behavior separately from the requested fee.

## 10. Canonical real E2E sequence

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

## 11. Required evidence packet

Capture all of the following before declaring the gate PASS:

- public Cloudflare Mini App URL used for the run;
- Cloudflare deployment/container revision used for the run;
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

## 12. Gate verdict rubric

### PASS

Only if the full real sequence is observed:

`CREATE -> INVITE -> ACCEPT -> AUTHORIZE -> A_SENDS_1_NIM_TO_B -> FINAL -> B_HOLDER -> INVITE -> ACCEPT -> AUTHORIZE -> B_SENDS_1_NIM_TO_C -> FINAL -> ARRIVED -> VERIFIED_ROUTE_RECEIPT`

and both finalized hops plus terminal mission state are durable in Postgres.

### PARTIAL / HOLD

Use HOLD if any of these occur:

- transaction broadcasts but FINAL is not independently observed;
- custody advances before FINAL;
- the Cloudflare container restarts and invalidates a required process-local capability;
- Postgres durability cannot be verified;
- B cannot become the next holder after Hop 1;
- C receives funds but mission does not become ARRIVED;
- Route Receipt does not match finalized route;
- native invite or iOS lifecycle breaks the path.

### FAIL-CLOSED

Never convert a timeout, UI projection, locally simulated state, wallet broadcast success, or mempool inclusion into `FINAL` or `ARRIVED` evidence.

## 13. Evidence record template

Copy this block into the eventual evidence file after the real run:

```yaml
gate: NIMCARRY_REAL_TESTNET_E2E_PROOF
verdict: HOLD
run_date: null
cloudflare_origin: null
cloudflare_deployment_revision: null
container_identity: nimcarry-primary
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
