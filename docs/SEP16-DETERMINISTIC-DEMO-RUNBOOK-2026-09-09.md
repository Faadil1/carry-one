# NimCarry — Sep 16 Deterministic Proof Demo Runbook

Date: 2026-09-09
Status: ARMED, NOT YET AUTHORIZED FOR LIVE PROOF

This runbook converts the seven-call Winning Intelligence into the exact demonstration shape that should be used only after the secure integrated runtime and real A→B→C testnet proof are green.

## Gate

Do **not** present this as a real-product proof until all of the following are true:

- secure HTTP + browser + PostgreSQL vertical runtime is merged and green;
- real Nimiq Pay A→B→C route has reached `ARRIVED` at least once;
- the Route Receipt is populated from real finalized route data;
- cold-start judge smoke passes;
- no presenter needs the judge/host to perform an action for the core proof.

If these are not green by Sep 16, attend the call and ask/get feedback, but do not fake or overstate proof.

## Demo law

The judge should understand the problem in <=10 seconds and the full mechanism in <=60 seconds.

Do not begin with architecture, Postgres, HMAC, RPC, signatures, test counts or source code.

Opening line:

> **Warm introductions disappear after the first handoff.**

Second line:

> **NimCarry turns every human bridge into a consented, verifiable handoff until the destination is actually reached.**

Then show, do not explain:

`Create → Invite → Accept → Pass 1 NIM → FINAL → next bridge → FINAL → ARRIVED`

## 3–5 minute proof sequence

### 0:00–0:15 — Human problem

Show the NimCarry home screen.

Say:

> I want this to reach someone I cannot reach directly. Normally, after I ask one person to forward it, the route disappears.

Use one relatable mission only. No abstract platform pitch.

### 0:15–0:30 — Why 1 NIM

Say:

> The 1 NIM is not a reward. It is the baton. A bridge accepts first, and custody changes only after Nimiq finality.

If needed:

> There is no stake, wager, prize pool or forwarding reward.

### 0:30–1:20 — Create + first bridge

Create the known-consenting destination mission.

Show the private bridge invitation.

Bridge B accepts in Nimiq Pay.

The audience should visibly see:

- destination;
- current holder;
- bridge invitation;
- explicit acceptance;
- `Accepted with Nimiq Pay`.

### 1:20–2:00 — First verified handoff

Holder A authorizes the canonical pass.

Show exactly `1 NIM` and the wallet confirmation.

After broadcast, show:

- `1 NIM handoff authorized`;
- `Waiting for independent finality`;
- then `FINAL — custody moved`.

Do not call a pending/mempool transaction a completed handoff.

### 2:00–2:45 — Second bridge to destination

Bridge B is now the canonical holder.

Repeat only the essential action: B passes the same 1 NIM baton to destination C.

Do not re-explain the system. The repetition itself demonstrates the product.

### 2:45–3:15 — Climax

The destination becomes the finalized recipient.

Stop on:

> **ARRIVED — Verified Route Receipt**

The receipt should show only privacy-safe already-authorized evidence:

- ARRIVED;
- count of verified human bridges;
- finalized timestamps;
- shortened transaction references;
- no private target wallet disclosure.

Then pause. Let the proof artifact carry the demo.

### 3:15–3:35 — Why Nimiq is necessary

Say:

> Without Nimiq, a bridge can only say “I forwarded it.” With NimCarry, each custody handoff is wallet-approved and the route advances only after independent finality.

### 3:35–4:00 — Differentiation

If comparison is needed:

> Rally propagates an activity. NimCarry routes custody toward a destination.

or:

> The chain is not the distribution mechanism in NimCarry. The chain is the product.

Do not name competitors unless asked or comparison materially clarifies the product.

### 4:00–4:30 — Product signal

Only after real usage exists, mention the truthful number of genuine users/routes.

Do not manufacture usage. Do not present demo wallets as competition usage.

## Presenter split

Recommended:

**Faadil**
- problem;
- why it matters;
- why 1 NIM;
- final differentiation;
- answer product/judging questions.

**Opeyemi**
- operate the deterministic product flow;
- wallet/device transitions;
- show FINAL and Route Receipt;
- answer implementation/runtime questions if asked.

Either presenter must be able to finish the demo alone if the other has a connection problem.

## Judge-cooperation prohibition

The judge or host must not be required to:

- install anything;
- accept an invitation;
- sign a wallet action;
- become the second player/bridge;
- provide a wallet;
- wait while accounts are configured.

All A/B/C wallets and devices are controlled by the team for the proof run.

## Finality fallback

The primary path is the actual live verified route.

If testnet finality is temporarily slower than the demo window:

1. Keep the live transaction honestly labeled `Waiting for independent finality`.
2. Do not say it is FINAL.
3. Switch to a **previously captured real testnet ARRIVED run** only if it already exists, clearly saying that it is the prior verified run.
4. Show its timestamp/tx references and Route Receipt.

Never substitute the local `?demo=1` simulation as testnet evidence.

## Freeze discipline

Before Sip & Show:

- choose one known-good commit;
- deploy it;
- run `npm run smoke:judge` against the exact public URL;
- verify Nimiq Pay cold open;
- verify both prepared devices/wallets;
- record a real backup proof video;
- freeze speculative code changes;
- keep rollback path ready.

No same-day feature expansion.

## Success criterion

A person who sees only the first minute should be able to answer:

1. What problem does NimCarry solve?
2. Why is there exactly 1 NIM?
3. What makes a handoff verified?
4. What is the destination?
5. When does the route end?

A person who sees the full demo should remember one image:

> **ARRIVED — Verified Route Receipt**
