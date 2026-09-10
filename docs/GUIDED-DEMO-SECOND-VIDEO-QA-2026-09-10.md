# NimCarry — Guided Demo Second Video QA — 2026-09-10

## Evidence

User supplied a 109.3s production screen recording of the provider-free guided demo after the second-bridge continuation fix.

The recording was visually sampled across the full duration. The clean guided run begins from the home/problem-first surface at about 12s and reaches the ARRIVED / DEMO Route Receipt surface at about 66s — roughly 54 seconds from fresh start to the proof climax in this recording.

## Observed PASS

- Home/problem-first surface renders with NimCarry branding and explicit DEMO MODE / GUIDED 1→5 TOUR banner.
- Create path is reachable and the five-step Living Route renders.
- First bridge dialog can be created and opened without Nimiq Pay.
- Bridge invitation renders and Accept remains a no-funds consent step.
- Pass surface renders the 1 NIM / requested fee / FINAL proof model.
- First simulated FINAL produces one verified hop and advances custody.
- Continue-to-destination flow now reaches the second bridge cycle instead of stopping at one hop.
- Second pass produces a second simulated FINAL.
- Destination is reached and the route becomes ARRIVED.
- ARRIVED renders the existing DEMO Route Receipt with two finalized hops.
- Starting another mission after ARRIVED remains possible; the later part of the recording exercises another local demo cycle rather than revealing a terminal-state dead end.

## UX findings from the recording

Two small presentation issues were worth correcting without touching any blocked backend contract:

1. The pass screen headline said `One verified handoff.` before the handoff had actually finalized. That overstates the state. It should describe the action, not claim proof prematurely.
2. The general `?demo=1` shortcut `Preview ARRIVED receipt` remained visible inside the guided `tour=1` path. It is useful for spot-checking the receipt, but it can let a tester skip the intended 1→5 narrative.

## Remediation

Presentation-only patch on `main`:

- commit `61a64e530b74f1f3c0300fc1387694c6ef6218af`
- CI run `34441565599`: PASS

Behavior after deployment:

- pass headline becomes `Pass the 1 NIM baton.` before FINAL;
- invitation/pass/route kickers are normalized to STEP 3/4/5 wording;
- `Preview ARRIVED receipt` is hidden only when both `demo=1` and `tour=1` are active;
- ordinary `?demo=1` receipt preview remains available;
- no transaction, FINAL, custody or ARRIVED state is created by this polish layer.

## Verdict

`GUIDED_DEMO_1_TO_5_VISUAL_QA = PASS_WITH_MINOR_POLISH_APPLIED`

The provider-free demo is now sufficient for rapid UI/story rehearsal and first-time comprehension testing. It remains explicitly non-evidentiary: simulated demo FINAL/ARRIVED must never be presented as Nimiq testnet or on-chain proof.

The next material engineering gate remains secure HTTP/browser/PostgreSQL integration followed by the real Nimiq Pay A→B→C testnet route.
