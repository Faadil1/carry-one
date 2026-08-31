# Carry One

Carry One is a Nimiq Cycle II social relay prototype where **1 NIM acts as the baton**.

The current holder passes exactly 1 NIM to the next wallet. A verified transaction advances the canonical relay, and the recipient becomes the next holder.

## Current phase

**PRE-BUILD / W0→W5 TECHNICAL SPIKE**

This repository is private during early collaboration and validation. Full product production is not yet authorized.

## Core product law

> THE BATON IS A VERIFIED 1-NIM HANDOFF — NOT AN INVESTMENT, WAGER, PRIZE POOL OR UNIQUE-HUMAN PROOF.

## Team

- **Faadil Boussari** — repo owner / product lead
- **Opeyemi** — collaborator / technical lead (GitHub handle pending)

Collaboration alignment confirmed by email: joint Cycle II concept, team submission, no solo build/submission of the same concept, and 50/50 prize split while both contributors carry their planned responsibilities through submission. If either collaborator steps away, the split is revisited in writing before submission.

## Technical decisions frozen for the spike

- One atomic active pass intent per `baton + sequence`, bound to intended recipient + nonce.
- Canonical hop = valid included transaction matching the active intent; mempool observation order is not canonical.
- Exactly 1 NIM means **recipient receives 100,000 Luna**; fee is separate.
- State progression: `PENDING → INCLUDED → FINAL`.
- Next canonical pass unlocks only after `FINAL` during the spike.
- A relay may display as `DORMANT` after inactivity without claw-back or automatic reassignment.
- Invalid/stale/duplicate/wrong-value transfers never advance canonical state.

## First gate

See [`docs/W0-W5-SPIKE.md`](docs/W0-W5-SPIKE.md).

## Repository state

Canonical continuity is stored in [`CANONICAL-STATE.yaml`](CANONICAL-STATE.yaml) and [`HANDOVER.md`](HANDOVER.md).

---

Working title: **Carry One**  
Target: **Nimiq Mini Apps Competition — Cycle II**
