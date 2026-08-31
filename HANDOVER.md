# HANDOVER — Carry One

Date: 2026-08-31  
State: `PRE_BUILD_TECHNICAL_SPIKE`

## Completed

- Carry One selected as the current Nimiq Cycle II collaboration concept.
- Partner PRD shared with Opeyemi.
- Opeyemi confirmed by email:
  - joint concept for Cycle II;
  - team submission;
  - neither party builds/submits the same concept solo;
  - Faadil = repo owner / product lead;
  - Opeyemi = collaborator / technical lead;
  - prize split = 50/50 while both carry planned responsibilities through submission;
  - split revisited in writing if either party steps away before submission.
- Technical decisions aligned:
  - one atomic active pass intent per baton+sequence;
  - bind intent to recipient + nonce;
  - canonical hop must match the active intent;
  - validate recipient value = 100,000 Luna, fee separate;
  - `PENDING → INCLUDED → FINAL`;
  - next pass unlocks after FINAL for the spike;
  - DORMANT is display-only, no claw-back.
- Private repository created: `Faadil1/carry-one`.
- W0→W5 spike specification added.

## Current blocker

Opeyemi's actual GitHub username is still missing. His email contained the placeholder `[your GitHub username here]`.

## Next 3 priorities

1. Get Opeyemi's actual GitHub handle and add him as collaborator.
2. Opeyemi runs the W0→W5 technical spike in this repository and shares progress incrementally.
3. Review spike evidence and classify `PASS`, `PASS_WITH_CHANGES`, or `FAIL` before any full production build.

## Do not do yet

- Do not start the full product build.
- Do not add prizes, wagering, custody, pooled funds, AI, marketplace scope or unique-human claims.
- Do not make the repository public until the team intentionally enters the competition publication phase.

## Source of truth

`CANONICAL-STATE.yaml` overrides chat memory when conflicts appear.
