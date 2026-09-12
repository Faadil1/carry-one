# NimCarry — A → B → C Testnet Operator Checklist

Gate: `NIMCARRY_REAL_TESTNET_E2E_PROOF`
Origin: `https://nimcarry.faadil-casecraft.workers.dev`
Network: Nimiq testnet only

## Safety stop
- Codex does not request or handle seed phrases, private keys, or wallet credentials.
- Stop at every Nimiq Pay approval prompt and require the operator to explicitly approve or reject.
- Never treat broadcast/mempool/UI state as `FINAL`; independently reconcile first.
- If the singleton container restarts or the provider session changes, fail closed and restart the proof run.

## Roles and sessions
- A — creator / initial holder: record only a short public wallet fingerprint.
- B — consenting bridge: record only a short public wallet fingerprint.
- C — consenting destination: record only a short public wallet fingerprint.
- Prefer two physical devices; use separate Nimiq Pay sessions/accounts for A, B, and C.
- Confirm production origin is opened inside Nimiq Pay, not demo mode.
- Confirm `listAccounts()` succeeds and the canonical holder account is selectable before each pass.

## Locked transaction contract
- Each hop: exactly `100000 Luna` (`1 NIM`).
- Requested fee: `0 Luna`; record actual wallet/network behavior separately.
- Recipient and `co:v1:` opaque commitment must come from the server pass intent.
- The selected Nimiq Pay account must match `expected_sender` before the send call.

## Hop 1 — A → B
1. Create mission with C as the consented destination; verify mission durability in Neon.
2. Create invitation for B; share the native invitation deep link.
3. B accepts with wallet B; verify the signed route-view capability.
4. A authorizes the pass and inspect the intent: recipient B, value `100000`, fee `0`, `co:v1:` data.
5. Stop for explicit A approval in Nimiq Pay.
6. Record the transaction hash without exposing wallet secrets.
7. Submit the capability-bound broadcast claim and reconcile until independent `FINAL`.
8. Query Neon and confirm the finalized hop plus holder transition A → B before continuing.

## Hop 2 — B → C
1. B reopens the mission as current holder and creates the invitation for C.
2. C opens the native invitation deep link and accepts with wallet C.
3. B authorizes the pass and inspect the same locked transaction contract.
4. Stop for explicit B approval in Nimiq Pay.
5. Record the transaction hash and reconcile until independent `FINAL`.
6. Query Neon and confirm the second finalized hop, B → C holder transition, and `ARRIVED`.
7. Verify the rendered Route Receipt matches the two finalized hops.

## Required evidence checkpoints
- Production origin and deployment revision.
- A/B/C short public wallet fingerprints only.
- Invitation deep-link behavior for B and C.
- Both transaction hashes and independent finality observations.
- Neon durable state after each `FINAL`.
- Multi-account selection result.
- iOS cold launch, warm resume, and background/resume results.
- Requested fee `0` and observed network fee behavior.

## Current status
- Cloudflare deep smoke: PASS.
- Provider live-path preflight wiring: PASS in deployed production code and 156-test suite; live Nimiq Pay session check: NOT RUN.
- Cloudflare Build watch paths and duplicate Build-scoped secret cleanup: PASS and reverified through the official Workers Builds API.
- Production `/health`, `/health?deep=1`, SPA, and deployed `/app.js`: PASS.
- No wallet send initiated.
- Real `FINAL` / `ARRIVED`: NOT OBSERVED; do not claim.
