# HANDOVER — NimCarry

Date: 2026-09-10  
Canonical version: **0.8.23**  
State: `HTTP_SECURITY_REVIEW_PR23_CHANGES_REQUESTED_REPO_RENAMED_BROWSER_INTEGRATION_PENDING`

## Read first

`CANONICAL-STATE.yaml` is the current source of truth and overrides chat memory. Update both `CANONICAL-STATE.yaml` and `HANDOVER.md` after every meaningful milestone.

## Product law — FROZEN

**NimCarry** — *One NIM. One bridge at a time.* Exactly `1 NIM = 100000 Luna` is the semantic custody baton, not a reward/stake/wager/prize. Every mission has a destination, every bridge consents, and only independently verified `FINAL` changes custody. Destination as finalized recipient = `ARRIVED`.

Judge line: **NimCarry uses 1 NIM to make warm introductions verifiable.**

## Repository naming — UPDATED

The GitHub repository rename is now complete. Canonical repo is **`Faadil1/nimcarry`**. The old `Faadil1/carry-one` path redirects. Vercel public domain remains `https://carry-one-mu.vercel.app`; desired `https://nimcarry.vercel.app` alias is still pending.

## Winning Intelligence + UI — COMPLETE FOR CURRENT GATE

Seven Sip & Ship calls analyzed. Hidden spots implemented. Living Route P0/P1 merged and observed in production. Provider-free guided demo passes the complete 1→5 story through ARRIVED/DEMO Route Receipt in ~54s fresh-start-to-climax in the latest user video. This is UI/story QA only, never testnet evidence.

## HTTP security — NEW STATE

### Faadil side: PR #20 MERGED INTO THE SHARED BASE

PR **#20** `Secure broadcast claims and add client idempotency` is now merged into `feat/mission-http-bindings` at merge SHA `77c89bb9f289de1c00b5d22d6f8c7280dc223b01`.

That means Faadil items are preserved in the base:
- short-lived one-time broadcast capability after signed `AUTHORIZE_PASS`;
- binding to mission + invitation + sequence + intent nonce + canonical holder wallet;
- replay/expiry/mismatch rejection;
- automatic mutation `Idempotency-Key` support and stable broadcast retry semantics.

### Opeyemi side: PR #23 OPEN, CI GREEN, REVIEWED

Opeyemi opened **PR #23 `Feat/route privacy security`** from `feat/route-privacy-security` onto `feat/mission-http-bindings`.

Observed:
- base SHA: `77c89bb9f289de1c00b5d22d6f8c7280dc223b01` (already contains PR #20);
- head SHA: `07745e6dd8cc60f309c576ec8125d6a609281097`;
- CI run `34454548111`: **PASS**;
- declared tests: **145/145**;
- intended scope is present: route-view capability, invitation redaction, legacy `/relay` production gate.

A Faadil review was submitted as **REQUEST_CHANGES** (review id `5166605684`) because two issues remain before merge:

1. **Privacy bypass through reconcile:** `POST /missions/:id/reconcile` uses an open MissionView path for non-public missions when no Bearer token is supplied. That can disclose the same UNLISTED/PRIVATE mission data that protected GET route views now reject. Fix by requiring route-view capability for non-public reconcile responses, or return only minimal non-sensitive reconcile status and require an authorized GET for MissionView. Add regression test for anonymous reconcile.

2. **Invite-token capability claim mismatch:** PR/comments state invite tokens double as generic route-view capabilities, but `resolveViewer()` only verifies tokens from `RouteViewCapabilityStore`; it does not resolve invitation tokens. Either implement this safely with mission/expiry/status binding, or remove the claim and make the intended flow explicit: `/i/:token` for landing, then signed `VIEW_ROUTE` mint for continued route access.

Do **not** merge PR #23 until both review findings are closed and CI is green again.

## Current gate

**`NIMCARRY_HTTP_SECURITY_AND_VERTICAL_INTEGRATION`**

Current status: **WAITING PR #23 REVIEW FIXES**, then:
1. re-review PR #23;
2. merge it into `feat/mission-http-bindings` only if both findings are closed;
3. wire the browser to the secure view-token + broadcast-capability contract;
4. run combined browser + HTTP + PostgreSQL harness;
5. full CI green;
6. merge secure vertical slice to `main`;
7. update canon/handover.

## Next real proof gate

After secure merge, run real Wallet A creator/holder → Wallet B bridge → Wallet C destination, two physical devices preferred:

`CREATE → INVITE → ACCEPT → AUTHORIZE → A sends exactly 1 NIM to B → FINAL → B holder → AUTHORIZE → B sends exactly 1 NIM to C → FINAL → ARRIVED → Verified Route Receipt`

Also prove multi-account behavior, fee-0 exact 1-NIM forwarding, native invite deep link and iOS cold/warm/background/resume lifecycle.

## Score-floor after real E2E

Builder Promotion = Skool 2 + public social 3 = **5/5**. Real Usage = `0–3:0`, `4–10:6`, `11–24:10`, `25+:15`. Promotion + 4 genuine users = **11 points**, +11 users = **15**, +25 users = **20/20** outside the 80-point core. No bots/artificial wallets/gaming.

## Do not reopen now

No new feature expansion, gamification, rewards, marketplace, target discovery, autonomous routing, or mainnet. UI/demo is frozen except evidence-driven fixes. Real testnet FINAL/ARRIVED must not be claimed until observed.
