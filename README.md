# Carry One

Carry One is a **destination-bound human routing Mini App** for Nimiq Cycle II:

> **Get this to someone you cannot reach directly — one human bridge at a time.**

One verified **1 NIM** baton moves through consenting human bridges until the defined destination becomes the finalized recipient. Each holder chooses the next person who can move the mission closer.

## Product laws

- **The baton is a verified 1-NIM handoff** — not an investment, wager, prize pool or unique-human proof.
- **Every mission has a destination.** Cycle-II missions use a known target wallet and require creator-attested target consent.
- **No one becomes a bridge by surprise.** Invitation acceptance happens before payment.
- **Only FINAL changes custody.** A reported tx hash, mempool observation or acceptance never advances the route.
- **The path is the product.** No XP, streaks, leaderboards, forwarding rewards or AI routing.
- **No clawback.** An inactive route may display STALLED, but the baton is never reassigned automatically.
- **No route loops.** A wallet already in the finalized path cannot re-enter the same mission.

## Five-screen MVP

1. Mission Home
2. Create Mission
3. Bridge Invitation
4. Pass 1 NIM
5. Route / Arrival

## Security and Nimiq integration

- Nimiq wallet signatures authorize holder-sensitive actions.
- Target wallet is encrypted with AES-256-GCM and matched at arrival with a separate keyed HMAC-SHA256.
- Reach Mission transactions require an opaque `co:v1:<commitment>` recipient-data value rather than exposing mission/sequence identifiers in clear text.
- Recipient value is exactly **100,000 Luna = 1 NIM**; the Cycle-II client requests **fee 0** so a bridge holding exactly the received 1 NIM can forward it intact.
- Client preflights that the canonical holder wallet exists in the Nimiq Pay session; the backend still independently verifies the actual on-chain sender.
- Multiple read RPC endpoints can be configured; infrastructure outages surface as `VERIFICATION_DELAYED`, never as a false custody change.

## Current build state

Foundation Slice 1 is merged. It includes durable restart-proof local adapters, mission/invitation services, wallet authorization, target privacy, relay-to-mission finality projection and PostgreSQL-oriented migration contracts.

Blind-spot hardening is being integrated before the MVP vertical slice. CI currently verifies the baseline plus target-consent, stalled-route, route-loop, opaque-commitment, wallet-preflight, RPC-fallback, deeplink and privacy-safe usage-evidence tests.

Public Early Access and mainnet remain blocked until the vertical flow, production PostgreSQL adapter, production HTTP bindings, secret/privacy hardening and real Nimiq Pay runtime tests pass.

## Team

- **Faadil Boussari** — repo owner / product lead
- **Opeyemi (`opeblow`)** — collaborator / technical lead

Current collaboration alignment: joint Cycle II concept and team submission; prize split 50/50 while both contributors carry planned responsibilities through submission, revisited in writing if either party steps away.

## Source of truth

- [`CANONICAL-STATE.yaml`](CANONICAL-STATE.yaml)
- [`HANDOVER.md`](HANDOVER.md)
- [`docs/REACH-MISSION-PRODUCT-LAW.md`](docs/REACH-MISSION-PRODUCT-LAW.md)
- [`docs/REACH-MISSION-UX-STATE-CONTRACT.md`](docs/REACH-MISSION-UX-STATE-CONTRACT.md)
- [`docs/REACH-MISSION-SECURITY-AUTH.md`](docs/REACH-MISSION-SECURITY-AUTH.md)
- [`docs/REACH-MISSION-API-CONTRACT.md`](docs/REACH-MISSION-API-CONTRACT.md)
- [`docs/REACH-MISSION-TEST-MATRIX.md`](docs/REACH-MISSION-TEST-MATRIX.md)

Target: **Nimiq Mini Apps Competition — Cycle II**
