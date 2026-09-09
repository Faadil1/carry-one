# Carry One — Cycle II Hidden-Spot Audit

Date: 2026-09-09
Status: intelligence / prioritization input, not a product-law rewrite

## Why this audit exists

A fresh review of the Cycle I top 3, the full Cycle I gallery, the current Cycle II gallery, current scoring, FAQ/rules and Skool discussion exposed several opportunities and risks that are easy to miss if we focus only on backend correctness.

## High-confidence winner pattern from Cycle I

The three winners did more than have a mechanic; each created a **visible proof artifact / persistent state** around the mechanic:

- Nimiq Space: a persistent shared world where signed players and activity remain visible.
- NimJump: server-replayable runs; leaderboard outcomes have replay evidence and the builder published real-user stats.
- NimQuest: server-graded completion + one-time wallet signature creates a stored receipt that can be shown later.

Implication for Carry One: the verified path should not be treated as a passive log. It is the product's equivalent proof artifact. A finalized mission should leave a durable, privacy-safe **Route Receipt / Handoff Receipt** that makes the mechanism legible to users and judges.

## P0 hidden spots

### 1. Carry One is not currently visible in the Cycle II showcase

The live Cycle II showcase currently lists submitted entries, but Carry One is not present in the checked gallery. The FAQ says merged submissions appear in the showcase, and Week 3 is the Early Access period.

Action: do not wait until September 18 if the secure vertical flow is green earlier. Submit as soon as the product is genuinely usable so Carry One can collect community feedback and real wallet opens before judging.

### 2. Real-usage scoring is a direct 15-point unlock

Current Cycle II scoring is based on unique Nimiq wallets opening the Mini App during the measurement period:
- 25+ = 15 points
- 11–24 = 10 points
- 4–10 = 6 points
- 0–3 = 0 points

Action after secure E2E: launch a legitimate community testing push. Ask real builders to open and test Carry One in Nimiq Pay and provide feedback. Do not manufacture wallets or bot traffic.

### 3. New direct collision: Pay It Sideways

Cycle II's `Pay It Sideways` lets a recipient keep or relay an exact NIM gift through a private bearer link. That means "relay the same NIM" is no longer differentiating by itself.

Carry One must be positioned visibly as:

> **destination-bound verified human routing**

not as a generic relay, gift chain or pay-it-forward mechanic.

Every judge-facing screen/story should emphasize:
- precommitted destination;
- bridge-by-bridge consent;
- verified chain of custody;
- FINAL-only advancement;
- arrival as a distinct terminal event.

### 4. The target-wallet paradox is now more visible

Pay It Sideways demonstrates a low-friction addressless bearer flow. Carry One still requires a known/consenting target wallet for Cycle II while promising to reach someone the creator cannot reach directly.

Cycle II mitigation: explicitly frame the beachhead as **socially unreachable, wallet-known/consenting destinations** (for example, public/community Nimiq identities). Do not build a large identity/claim system before the deadline.

Post-Cycle-II roadmap candidate: destination claim -> wallet binding -> final handoff.

### 5. iOS/Nimiq Pay lifecycle bug is a judge-path risk

A current Skool report describes a reproducible Nimiq Pay iOS issue where a Mini App can become stuck over the wallet after backgrounding and opening another Mini App link. The report references iOS 26.6.1 / Nimiq Pay 2.19.1 and a filed Developer Center issue.

Action before testnet/judging:
- test cold launch, warm launch, background/resume, deeplink while Mini App open, and deeplink after explicit close;
- never make the main judge flow depend on a fragile background -> external app -> deeplink transition;
- document a recovery path if the framework-level issue occurs.

## P1 hidden spots

### 6. Make invisible Nimiq integration judge-visible

Carry One has strong wallet/finality/security mechanics, but judges evaluate the live Mini App as users inside Nimiq Pay, not the repository.

Visible UI should say things like:
- `Accepted with Nimiq Pay`
- `1 NIM handoff authorized`
- `Waiting for independent finality`
- `FINAL — custody moved`
- `Verified route receipt`

Do not force judges to infer the sophistication from code.

### 7. Route Receipt / Handoff Receipt

After FINAL/ARRIVED, create a durable privacy-safe receipt surface showing:
- mission purpose / target label (subject to visibility rules);
- finalized hop count;
- timestamps;
- short tx references / verification links where safe;
- no full private wallets;
- ARRIVED status;
- optional share action only after privacy checks.

This gives Carry One its own equivalent of NimJump replay evidence and NimQuest completion receipts.

### 8. Repeat value should become personal history, not gamification

Current scoring explicitly rewards a reason to return. Carry One should use non-game retention:
- `My routes` / mission history;
- follow a mission after handing it off;
- see whether it arrived;
- after arrival, start a new mission.

Avoid XP, streaks, leaderboards, points or forwarding rewards.

### 9. Shareable handoff/arrival card is a distribution primitive

Opeyemi's suggestion is strategically strong if privacy-safe. After a finalized handoff or completed mission, optionally create a shareable card such as:

`I helped move a Carry One mission one person closer.`

or after ARRIVED:

`This mission reached its destination through 3 verified human bridges.`

No wallet address, private target identity, or active-route information should be exposed by default.

This can help organic distribution and the 25-wallet usage target without turning the product into a social feed.

### 10. 60-second judge path needs a dedicated assurance gate

Current scoring says a first-time user should understand and reach the main point within 60 seconds without instructions.

Before polish, run a strict judge-path test:
1. open Carry One inside Nimiq Pay;
2. understand promise in <10s;
3. create or open an invitation without external explanation;
4. understand why 1 NIM matters;
5. see what `FINAL` means;
6. never hit a dead end.

The recent demo `Accept as bridge` issue is exactly the class of failure the scoring rubric penalizes.

### 11. The strongest builder stories are structural, not feature lists

NimJump explains one structural flaw (client-trusted scores) and one structural fix (server replay). NimQuest explains one flaw (read-only learning / client-visible answers) and one fix (server grading + wallet-signed receipt).

Carry One story should stay equally simple:

> Warm introductions disappear into private messages after the first handoff. Carry One turns each human bridge into a consented, verified 1-NIM custody handoff until a defined destination is actually reached.

Do not lead with architecture, Postgres, HMAC, RPC fallback or test counts in the submission story.

## P2 / after real E2E

- Destination-claim / addressless target binding.
- Broader personal-history UX.
- Rich share cards.
- Notifications / re-engagement only if the framework path is reliable.
- Full TRACE visual polish.

## Competition execution implications

1. Finish secure HTTP + combined vertical flow.
2. Run real 3-wallet testnet E2E.
3. Add judge-visible verification language and Route Receipt before broad polish.
4. Submit early enough to enter the showcase / Early Access if the product is genuinely usable.
5. Acquire 25+ legitimate Nimiq Pay opens through community testing.
6. Post at least once in Skool and once publicly on social with direct links preserved for submission.
7. Keep the production app continuously ready because Cycle II judging may happen at random after the deadline and judges evaluate the live Mini App inside Nimiq Pay.

## Sources reviewed

- https://miniappscompetition.com/submissions/cycle1
- https://miniappscompetition.com/submissions/cycle1/emrealt34
- https://miniappscompetition.com/submissions/cycle1/mystiquemide
- https://miniappscompetition.com/submissions/cycle2
- https://miniappscompetition.com/submissions/cycle2/kirstyjhawker-hms
- https://miniappscompetition.com/scoring
- https://miniappscompetition.com/rules
- https://miniappscompetition.com/faq
- https://www.skool.com/miniappscompetition

