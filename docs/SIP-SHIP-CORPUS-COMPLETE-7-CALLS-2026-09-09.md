# NimCarry — Sip & Ship corpus complete (7 calls)

Date: 2026-09-09
Status: CORPUS_COMPLETE / FULL_CODING_PENDING_EXTRACTION

## Milestone

The complete available Nimiq Mini Apps Competition Sip & Ship corpus for Cycle I + Cycle II through 2026-09-09 is now assembled.

### Cycle I
- Call #1 — Jul 8 — Otter export supplied
- Call #2 — Jul 15 — Otter export supplied
- Call #3 — Jul 22 — Otter export supplied
- Call #4 — Jul 29 — Otter export supplied

### Cycle II
- Call #1 — Aug 26 — Otter export supplied
- Call #2 — Sep 2 — Otter export supplied
- Call #3 — Sep 9 — Otter export supplied on 2026-09-09

The Sep 9 source video is also available in the user's Google Drive as:
`Cycle 2 - Sip & Ship Call Recording / 03 - Sip & Ship Call #3 (Sep 9) / 01 - Sip & Ship Call #3 (Sep 9).mp4`

## Evidence posture

The seven Otter exports are now the preferred transcript corpus for the full Winning Intelligence pass. The Google Drive videos are secondary visual evidence for screen-share/UI/demo behavior, visible bugs, flow interruptions, and other non-verbal context.

Do not treat prior WhisperTranscribe opening-minute snippets as the full transcript source now that the complete Otter corpus has been supplied.

## Full coding target

For each call, code:
- app/demo subject;
- timestamp;
- Nimiq-team reaction;
- PRAISE / CONCERN / QUESTION / FAILURE / ADVICE;
- PRODUCT / JUDGING / DISTRIBUTION / PLATFORM / COMPETITOR;
- whether the signal is explicit in the official rubric;
- recurrence across calls;
- confidence;
- eventual Cycle I winner relationship where applicable;
- NimCarry action: DO / DO_NOT_DO / WATCH / ALREADY_COVERED;
- priority P0 / P1 / P2 / POST_CYCLE_II.

## Research questions

1. What does the Nimiq team praise spontaneously rather than only when prompted?
2. Which questions recur before builders finish explaining their products?
3. Which live-demo failures materially damage perception?
4. Which NIM uses are treated as native versus bolted on?
5. What did eventual Cycle I winners change after Sip & Ship feedback?
6. Which signals recur live but are absent or understated in the written scoring rubric?
7. What has changed in Nimiq's language and expectations from Cycle I to Cycle II?
8. Which hidden spots can NimCarry exploit before the Sep 18 submission deadline and post-deadline judging window?

## Current technical ingestion note

The chat execution sandbox is temporarily returning transport timeouts while attempting to extract the supplied ZIP packages. This is a tooling/runtime issue, not a corpus gap. Do not ask the user to retranscribe or recreate the files. Retry local ZIP extraction on the next available execution attempt. If necessary for continuity, ask the user only to mirror the existing Otter ZIPs into the already-shared Drive folder; do not request another transcription pass.

## Continuity

This milestone must be reflected in both `CANONICAL-STATE.yaml` and `HANDOVER.md`. The next conversation should begin from the seven-call corpus, not from the earlier six-call/Whisper limitation state.
