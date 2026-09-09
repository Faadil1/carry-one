<p align="center">
  <img src="web/favicon.svg" alt="Carry One logo" width="92" height="92" />
</p>

<h1 align="center">Carry One</h1>

<p align="center"><strong>Get this to someone you cannot reach directly — one human bridge at a time.</strong></p>

<p align="center">
  <a href="https://carry-one-sip-show.vercel.app/?demo=1"><strong>Live clickable demo</strong></a>
  ·
  <a href="#demo--evidence">Demo video / evidence</a>
  ·
  <a href="CANONICAL-STATE.yaml">Current state</a>
</p>

> **Sip & Show note:** the public URL above is an explicit **demo-only** surface: no wallet writes, no backend/network mutations, and no claim of real testnet finality. The real Nimiq Pay E2E proof is the next runtime gate.

Carry One is a **destination-bound human routing Mini App** for the Nimiq Mini Apps Competition — Cycle II. One verified **1 NIM** baton moves through consenting human bridges until the defined destination becomes the finalized recipient. Each holder chooses the next person who can move the mission closer.

## Why Carry One

Warm introductions and community routing become opaque after the first handoff: you rarely know whether something was forwarded, where it stalled, or whether it actually reached the destination.

Carry One turns that invisible chain into a verifiable path while keeping the core mechanic simple:

**1 NIM → verified handoff → next holder → FINAL route → destination**

## Five-screen MVP

1. **Mission Home** — destination, purpose, current holder and verified path.
2. **Create Mission** — known/consenting destination + purpose.
3. **Bridge Invitation** — explicit consent before any payment.
4. **Pass 1 NIM** — wallet-approved exact-value handoff.
5. **Route / Arrival** — only independently verified FINAL hops appear.

## Product laws

- **The baton is a verified 1-NIM handoff** — not an investment, wager, prize pool or unique-human proof.
- **Every mission has a destination.** Cycle-II missions use a known target wallet and require creator-attested target consent.
- **No one becomes a bridge by surprise.** Invitation acceptance happens before payment.
- **Only FINAL changes custody.** A reported tx hash, mempool observation or acceptance never advances the route.
- **The path is the product.** No XP, streaks, leaderboards, forwarding rewards or AI routing.
- **No clawback.** An inactive route may display STALLED, but the baton is never reassigned automatically.
- **No route loops.** A wallet already in the finalized path cannot re-enter the same mission.

## Security and Nimiq integration

- Nimiq wallet signatures authorize holder-sensitive actions.
- Target wallet is encrypted with AES-256-GCM and matched at arrival with a separate keyed HMAC-SHA256.
- Reach Mission transactions require an opaque `co:v1:<commitment>` recipient-data value rather than exposing mission/sequence identifiers in clear text.
- Recipient value is exactly **100,000 Luna = 1 NIM**; the Cycle-II client requests **fee 0** so a bridge holding exactly the received 1 NIM can attempt to forward it intact.
- Client preflights that the canonical holder wallet exists in the Nimiq Pay session; the backend still independently verifies the actual on-chain sender.
- Multiple read RPC endpoints can be configured; infrastructure outages surface as `VERIFICATION_DELAYED`, never as a false custody change.
- Public repo CI scans tracked files + reachable Git history for high-confidence credential material.

See [`SECURITY.md`](SECURITY.md) for vulnerability reporting and current release boundaries.

## Current build state

Already merged:

- frozen Reach Mission product law + UX/state/security contracts;
- foundation mission/invitation/auth/finality services;
- blind-spot hardening;
- five-screen frontend skeleton;
- PostgreSQL repository/relay adapter, migration runner and durability guards;
- public Sip & Show clickable demo;
- demo navigation + favicon usability fix.

Current gate: **secure HTTP + frontend/PostgreSQL vertical integration**.

Still intentionally unclaimed until real runtime proof:

- real Nimiq Pay multi-account behavior;
- exactly-1-NIM forwarding with requested fee 0;
- native invite deeplink on a real device;
- full 3-wallet testnet `CREATE → INVITE → ACCEPT → AUTHORIZE → PASS → FINAL → ARRIVED`.

Public Early Access and mainnet remain blocked until those security/runtime gates pass.

## Demo & evidence

**Live clickable demo:** https://carry-one-sip-show.vercel.app/?demo=1

**Demo video:** to be added after the secure real-wallet/testnet vertical proof is recorded. We intentionally do not publish a simulated walkthrough as if it were runtime evidence.

The planned proof topology is three testnet wallets:

`A creator → B bridge → C destination → ARRIVED`

with screen recording, timestamps, transaction hashes, FINAL state and ARRIVED evidence captured during the run.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Contributors should read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before opening material changes.

## Team

- **Faadil Boussari** — repo owner / product lead
- **Opeyemi (`opeblow`)** — collaborator / technical lead

Current collaboration alignment: joint Cycle II concept and team submission; prize split 50/50 while both contributors carry planned responsibilities through submission, revisited in writing if either party steps away.

## Source of truth

- [`CANONICAL-STATE.yaml`](CANONICAL-STATE.yaml)
- [`HANDOVER.md`](HANDOVER.md)
- [`docs/WEEKEND-FINALIZATION-PLAN.md`](docs/WEEKEND-FINALIZATION-PLAN.md)
- [`docs/REACH-MISSION-PRODUCT-LAW.md`](docs/REACH-MISSION-PRODUCT-LAW.md)
- [`docs/REACH-MISSION-UX-STATE-CONTRACT.md`](docs/REACH-MISSION-UX-STATE-CONTRACT.md)
- [`docs/REACH-MISSION-SECURITY-AUTH.md`](docs/REACH-MISSION-SECURITY-AUTH.md)
- [`docs/REACH-MISSION-API-CONTRACT.md`](docs/REACH-MISSION-API-CONTRACT.md)
- [`docs/REACH-MISSION-TEST-MATRIX.md`](docs/REACH-MISSION-TEST-MATRIX.md)

## License

MIT — see [`LICENSE`](LICENSE).
