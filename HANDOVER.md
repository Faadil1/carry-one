# HANDOVER — NimCarry

Date: 2026-09-12  
Canonical version: **0.8.37**
State: `PROVIDER_PREFLIGHT_DEPLOYED_PRODUCTION_READY`

## Read first

`CANONICAL-STATE.yaml` is the source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone so a new conversation can take lead without chat history.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Secure stack already complete

PR #24 — secure vertical — merged at `449f1d3b942b8593596ea2e637033444f41f0bc9`; post-merge CI `34598905774` PASS.

PR #25 — Cloudflare runtime scaffold — merged at `aed163d0335b5fc68317ec4cb325a56739cf54b8`; post-merge CI `34601571626` PASS. The stack is:
- Cloudflare Worker Static Assets from `web/`;
- canonical Node backend inside Cloudflare Container;
- stable container identity `nimcarry-primary`;
- `max_instances: 1` for the proof gate;
- same-origin SPA/API routing;
- production mode + Postgres repository + legacy `/relay` mutations disabled.

No real Nimiq testnet `FINAL` or `ARRIVED` has yet been claimed.

## Database — NEON READY

Dedicated Neon PostgreSQL project:
- project `nimcarry`
- project id `late-credit-21248077`
- branch `main`
- database `nimcarry`
- region `aws-us-east-1`
- PostgreSQL 18

Applied on production main:
- `migrations/001_reach_mission_foundation.sql`
- `migrations/002_postgres_concurrency_guards.sql`

Verified: **7 canonical tables + 3 concurrency triggers PASS**.

The Neon connection string is installed only as Cloudflare runtime secret `CARRY_ONE_DATABASE_URL`. Never expose it in chat, Git, issues, screenshots, logs, or evidence.

## Cloudflare production runtime — DEEP SMOKE PASS

Production origin:
`https://nimcarry.faadil-casecraft.workers.dev`

Account/runtime status:
- Workers Paid enabled;
- production `workers.dev` enabled;
- preview disabled;
- Worker + Container deployed;
- runtime secrets installed;
- Observability enabled;
- `CARRY_ONE_CANONICAL_ORIGIN` is now a Wrangler var so it cannot silently disappear on deploy;
- the three sensitive runtime names are declared via `secrets.required`.

Hardening commits:
- Observability config: `48679a3cc4b6681a6f6dca923dc06006e1cee788`
- runtime config source-of-truth hardening: `1189cc6096b96c21827be9350ae90a814e85e45f` — CI `34646840377` PASS
- deterministic deep runtime smoke: `0ff137d5287fec484cb2fa7e132e1c88758e6e0b` — CI `34649046241` PASS

Observed production proof:
- `GET /health` = `200 {"status":"ok"}`
- static same-origin asset check `/nimcarry-mark.svg` = `304`, outcome OK
- `GET /health?deep=1` = **PASS** with:
  - `backend_http_status: 200`
  - `repository_mode: postgres`
  - `mission_http_bindings: enabled`
  - `canonical_origin: https://nimcarry.faadil-casecraft.workers.dev`
  - `container_identity: nimcarry-primary`
  - `max_instances_for_proof_gate: 1`
  - `legacy_relay_gate.pass: true`
  - `legacy_relay_gate.status: 403`
  - `legacy_relay_gate.error: LEGACY_RELAY_DISABLED`

This deterministic endpoint supersedes the need to manually hunt startup console lines for the runtime gate. Runtime smoke is now considered **PASS**.

Cloudflare Builds housekeeping is complete. Production trigger `b060a3f1-7490-46ef-9ea7-8f997d8f7884` for Worker tag `79cd9d3ec2814fc8a565a2b1c75dc6c3` now includes only deploy-relevant paths (`cloudflare/**`, `Dockerfile.cloudflare`, `.dockerignore`, root package manifests, `src/**`, `migrations/**`, and `web/**`) and excludes `docs/**`, `CANONICAL-STATE.yaml`, `HANDOVER.md`, and repository-only documentation. Documentation-only commits therefore do not deploy production.

The Build-scoped variable list is empty after removing all four duplicate runtime-config copies. Worker runtime secrets were preserved under their original names: `CARRY_ONE_DATABASE_URL`, `CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL`, and `CARRY_ONE_TARGET_HMAC_KEY_B64URL`. Reverification returned `GET /health?deep=1` = `200`, `status: ok`, Postgres mode, and `LEGACY_RELAY_DISABLED` at `403`.

Why singleton routing matters: route-view and broadcast capabilities remain process-local. If the Container restarts during an active proof, fail closed and restart the proof. Never manufacture recovery evidence.

## CURRENT GATE — REAL NIMIQ PAY TESTNET E2E

Current status:
`RUNTIME_SMOKE_PASS_NIMIQ_PAY_PROVIDER_THEN_REAL_PROOF`

Next exact actions:
1. open the production Mini App in Nimiq Pay and confirm the injected provider is available;
2. execute the real A-to-B-to-C Nimiq Pay testnet proof;
3. open the production Mini App in Nimiq Pay and confirm the injected provider is available;
4. execute the real A → B → C Nimiq Pay testnet proof;
5. after each real `FINAL`, query Neon and capture durable state evidence before advancing custody.

Target topology:
- A = creator / initial holder
- B = bridge
- C = consented destination
- 3 testnet wallets, preferably 2 physical devices

Target proof:
`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → INVITE C → ACCEPT → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Required checks:
- exactly `100000 Luna` each hop;
- requested fee `0` plus actual wallet/network behavior;
- independent FINAL before custody movement;
- durable Neon state after each FINAL;
- multi-account wallet selection;
- native invitation deep link;
- iOS cold/warm/background-resume;
- real Route Receipt matches finalized route.

**Never claim real testnet `FINAL` or `ARRIVED` before observed evidence exists.**

## Tooling boundary

GitHub and Neon are directly manageable from this chat. Cloudflare dashboard/account settings still require the authenticated user session unless moved to ChatGPT Work/Cloud Browser or a local Codex/CLI flow with Cloudflare auth. Do not expose the database credential or encryption/HMAC keys.

## Post-E2E order

1. verify real Route Receipt;
2. first 5 observed cold-start tests under 60s;
3. genuine Skool + public social posts for 5/5 promotion;
4. reach 4+, 11+, then 25+ legitimate unique wallet opens;
5. submit once genuinely usable;
6. Sep 16 Sip & Show only if runtime remains green;
7. judge-window monitoring/rollback + final TRACE/demo packaging.


## Milestone — provider preflight + operator readiness (2026-09-11)

- Live production frontend pass flow now checks the server-authorized `expected_sender` against the explicitly selected Nimiq Pay account before invoking `sendBasicTransactionWithData`.
- Canonical guards remain enforced: exactly `100000` Luna, fee `0`, and `co:v1:` opaque commitment; demo mode remains isolated.
- Verification: full suite **156/156 PASS** across 24 files; TypeScript build **PASS**.
- Operator checklist: `docs/REAL-TESTNET-OPERATOR-CHECKLIST-2026-09-11.md`.
- Cloudflare Workers Builds watch-path and Build-variable secret cleanup are complete via the official API; no Worker runtime secrets were changed.
- Next stop: open the production origin inside Nimiq Pay, confirm `listAccounts()` and account selection. Stop before any send until the user explicitly approves each wallet transaction.


## Cloudflare Builds Gate A milestone (2026-09-11)

- `npx wrangler whoami` now succeeds for the authenticated account.
- Official Workers Builds API inspection and update succeeded with the active API token.
- Trigger path filters now exclude documentation-only commits; Build-scoped variables are empty.
- Worker runtime secret names remain present and production deep runtime smoke remains PASS.

## Gate B provider-preflight deployment verification (2026-09-12)

- Commit `3a40c8593d4e99f85339b720c407dedca3dfef2b` pushed to `main`.
- Full suite: **156/156 PASS** across 24 files; TypeScript `--noEmit`: **PASS**.
- GitHub CI: run `34676115077`, **PASS**.
- Workers Build: `bd31e1e8-def9-48aa-bbf8-8a9554c2af5c`, **PASS**.
- Production `/health`: **200**, `status: ok`.
- Production `/health?deep=1`: **200**, Postgres mode, backend HTTP 200, and legacy relay disabled with 403.
- Production SPA and deployed `/app.js`: **PASS**; bundle contains the `expected_sender` account guard and `WRONG_WALLET_SELECTION` fail-closed path before `sendBasicTransactionWithData`.
- Provider readiness is limited to deployed production code verification. A live Nimiq Pay session check has **not** been run; no wallet send was initiated; real `FINAL` / `ARRIVED` remain unobserved.

## SDK provider acquisition fix + read-only diagnostic (2026-09-12)

- Root cause: the live frontend was polling `window.nimiq` directly instead of acquiring the injected provider through the official Mini App SDK initializer.
- `web/app.js`, `web/http-compat.js`, and the hidden `?provider-check=1` route now share SDK `init()` provider acquisition; the diagnostic calls only `listAccounts()` and renders short account fingerprints.
- Route-view signing now uses the same initialized provider. Real-flow guards remain intact: expected sender, exactly `100000` Luna, fee `0`, `co:v1:` commitment, and explicit wallet approval before send.
- Directly related tests/docs updated. Full suite: **158/158 PASS** across 24 files; TypeScript `--noEmit`: **PASS**.
- Production `/health`: **200**, `/health?deep=1`: **200**, Postgres mode and legacy relay fail-closed gate verified. Production SPA and bundle expose the SDK provider path, read-only diagnostic, and transaction guards.
- Deployed Worker version: `5d0830da-1a6d-4bf8-b090-eec865b32fb8`; static/frontend deployment used `--containers-rollout=none`, leaving the existing backend container unchanged.
- Exact partial state: SDK provider fix is deployed and production-code verified; live Nimiq Pay phone test is **PENDING**. Do not claim provider PASS, account listing PASS, wallet fingerprint, or any real proof until that phone test succeeds. No wallet send, signature, mission creation, or Neon mutation was initiated by this work.

## Live provider readiness closed (2026-09-12)

- User-provided TESTNET screen recording confirms the production Mini App provider session is ready: `live_nimiq_pay_session_check: PASS` and `listAccounts: PASS_1_ACCOUNT`.
- A short public A-wallet fingerprint is intentionally not transcribed into this continuity update because it was not provided as text; no full wallet address is recorded here.
- Provider-readiness gate: **CLOSED / PASS**. Next exact gate: execute the real Nimiq testnet `A → B → C` proof.
- `wallet_send_initiated: false`; `real_FINAL_observed: false`; `real_ARRIVED_observed: false`.
- No wallet send was initiated by this continuity-only update.

## Operator boundary before real proof (2026-09-12)

- Canonical version: `0.8.38`.
- Provider readiness remains **PASS**; real proof is **NOT STARTED**.
- The only blocker is that live A/B/C testnet wallet-role mapping is not yet established in the operator environment.
- Exact state: no mission, invitation, wallet signature, send, `FINAL`, or `ARRIVED` occurred.
- `wallet_send_initiated: false`; `real_FINAL_observed: false`; `real_ARRIVED_observed: false`.
- Next exact action: `ESTABLISH_A_B_C_TESTNET_WALLET_MAPPING`.
- This milestone changes continuity only; runtime code and wallet state were not touched.

## A/B/C mapping and funding readiness (2026-09-12)

- Canonical version: `0.8.39`.
- Verified TESTNET role mapping using short fingerprints only: A `NQ46 EB… CLQL`, B `NQ48 HR… E1QT`, C `NQ67 MX… 7S1U`.
- Device plan: A and C are distinct TESTNET accounts on phone 1; B is on phone 2.
- Funding readiness: A funded with observed balance `110000 NIM`; B funded with observed balance `110000 NIM`; C funding not required before proof.
- `ESTABLISH_A_B_C_TESTNET_WALLET_MAPPING`: **COMPLETE**. Operator and funding blockers: **CLEARED**.
- Exact execution state remains: no mission, no invitation, no wallet signature, no NimCarry send, no `FINAL`, no `ARRIVED`.
- Next exact action: `START_REAL_PROOF_CREATE_MISSION_WITH_A`.
- This is a continuity-only milestone; runtime code and wallet state were not touched.

## Real-proof partial milestone: invitation pending (2026-09-12)

- Canonical version: `0.8.40`.
- Real TESTNET mission was created by A targeting C; a private invitation for B was created. No private invitation token or link is recorded here.
- B acceptance is **NOT YET observed**. Current holder remains A/Faadil; observed UI state is **Waiting for response**; finalized hops: `0`.
- No `AUTHORIZE_PASS`, NimCarry send, `FINAL`, or `ARRIVED` occurred.
- Next exact action: `B_OPEN_PRIVATE_INVITE_AND_ACCEPT`.
- This is a continuity-only milestone; no wallet send was initiated.

## Creator-session recovery path deployed (2026-09-12)

- Canonical version: `0.8.41`.
- Added and deployed a narrow recovery path for the existing mission: SDK provider → require A by short fingerprint → signed `VIEW_ROUTE` challenge → `POST /missions/:id/view` → store `carryone.view.<missionId>` → navigate to the mission.
- Production `/health` and `/health?deep=1`: **200**; deployed bundle contains the recovery path and wrong-wallet fail-closed guard. Frontend-only deployment version: `11f1f888-3c8b-4ab1-a749-77d443815e61`.
- Live recovery was **not observed** because the existing mission ID and active phone-A Nimiq Pay session were unavailable in the operator environment. A has not been claimed to see the mission.
- No new mission, invitation, `AUTHORIZE_PASS`, send, `FINAL`, `ARRIVED`, or custody change occurred.
- Next exact action: `CREATOR_RECOVER_EXISTING_MISSION_WITH_A`.

## Live creator-session recovery PASS (2026-09-12)

- Canonical version: `0.8.42`.
- Existing real TESTNET mission was successfully restored on phone A; the UI visibly shows **Pass 1 NIM**.
- B invitation status is **ACCEPTED**.
- Neon confirms: mission `ACTIVE`, `finalized_hop_count=0`, `current_sequence=0`, no `pass_intent`, no hop, no `FINAL`, and no `ARRIVED`.
- `wallet_send_initiated: false`.
- Next exact action: `OPEN_PASS_SCREEN_WITHOUT_AUTHORIZING_SEND`.
- Continuity-only update; runtime code was not changed and no send was authorized.

## Real TESTNET pre-send screen milestone (2026-09-12)

- Canonical version: `0.8.43`.
- Phone A reached **Screen 4 / 5 · Pass 1 NIM** with accepted bridge B visible.
- Displayed value: `1 NIM = 100000 Luna`; requested fee: `0`; custody remains **FINAL-only**.
- **Authorize + Pass 1 NIM was not pressed.**
- Read-only Neon observation: mission `ACTIVE`, invitation `ACCEPTED`, `finalized_hop_count=0`, `current_sequence=0`, no `pass_intent`, and no hop.
- `wallet_send_initiated: false`; `real_FINAL_observed: false`; `real_ARRIVED_observed: false`.
- Next exact action: `USER_APPROVE_FIRST_A_TO_B_TESTNET_SEND`.
- Continuity-only update; runtime code was not changed.

## Failed first A→B send attempt (2026-09-12)

- Canonical version: `0.8.44`.
- `AUTHORIZE_PASS` succeeded and pass-intent sequence `1` exists. Nimiq Pay displayed the native `1 NIM` approval screen, then returned a sync error.
- Independent TESTNET.WATCH check on B: balance remains `110000 NIM`; no A→B transaction observed.
- Neon: `tx_hash: null`, no hop, `finalized_hop_count=0`, mission `ACTIVE`, invitation `ACCEPTED`.
- Chain broadcast: **NOT OBSERVED / NO BROADCAST EVIDENCE**. No transaction hash is recorded or inferred.
- `real_FINAL_observed: false`; `real_ARRIVED_observed: false`; `wallet_send_initiated: true`.
- Next exact action: `RETRY_A_TO_B_AFTER_NIMIQ_PAY_SYNC_HEALTH_CHECK`.
- Continuity-only update; runtime code was not modified.

## Truth correction: wallet approval flow initiated (2026-09-12)

- Canonical version: `0.8.45`.
- Correction: `authorize_and_pass_button_pressed: true`. A wallet send attempt was initiated because Nimiq Pay opened the native approval flow, which then returned a sync error.
- This does **not** establish chain broadcast: `chain_broadcast: NOT_OBSERVED_NO_BROADCAST_EVIDENCE`, `tx_hash: null`, no hop, `real_FINAL_observed: false`, and `real_ARRIVED_observed: false` remain unchanged.
- Next exact action remains `RETRY_A_TO_B_AFTER_NIMIQ_PAY_SYNC_HEALTH_CHECK`.
- Continuity-only update; runtime code was not modified.
