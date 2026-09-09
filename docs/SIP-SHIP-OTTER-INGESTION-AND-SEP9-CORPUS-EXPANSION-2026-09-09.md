# NimCarry — Sip & Ship Otter ingestion + Sep 9 corpus expansion

Date: 2026-09-09
Status: evidence-ingestion milestone; full transcript coding still pending

## What changed

Faadil replaced the limited WhisperTranscribe long-file workflow with Otter AI exports for the six historical Sip & Ship recordings and uploaded those exports directly into the active ChatGPT conversation as ZIP archives.

Uploaded Otter packages:
- Cycle I Call #1 — July 8
- Cycle I Call #2 — July 15
- Cycle I Call #3 — July 22
- Cycle I Call #4 — July 29
- Cycle II Call #1 — August 26
- Cycle II Call #2 — September 2

The Cycle II Sip & Ship Call #3 recording from **September 9, 2026** also became available and was added to the existing Google Drive corpus.

Verified Drive location:
- folder: `03 - Sip & Ship Call #3 (Sep 9)`
- video: `01 - Sip & Ship Call #3 (Sep 9).mp4`
- Drive file id: `1cyeBj2KFbriRSSoADZPLByf9Rz3JaYES`
- size observed: `167824742` bytes

## Evidence posture

The six Otter ZIPs are the preferred source for the next transcript-level coding pass because the WhisperTranscribe connector only exposed the opening segment of long files.

The Sep 9 video is available as a visual/reference source even before a transcript package is added. Do not treat untranscribed audio from the Sep 9 video as transcript-verified evidence.

Evidence classes now include:
- `VERIFIED_OFFICIAL_PUBLIC`
- `USER_SUPPLIED_LIVE_FEEDBACK`
- `TRANSCRIPT_VERIFIED_OPENING_SEGMENT`
- `OTTER_FULL_TRANSCRIPT_PACKAGE_UPLOADED_PENDING_PARSE`
- `VIDEO_REFERENCE_AVAILABLE_PENDING_VISUAL_PASS`
- `TRANSCRIPT_FULL_PASS_VERIFIED`

## Next analysis gate

1. Parse every Otter export and recover full transcript/timestamps/speaker labels where present.
2. Code all six historical calls using one common evidence schema.
3. Use the Sep 9 recording for visual/demo-reference checks where useful.
4. Add the Sep 9 full transcript when available and bring the corpus to seven fully coded calls.
5. Produce a cross-call Winning Intelligence synthesis: recurrent praise, objections, questions, demo failures, Nimiq-native patterns, distribution signals, platform friction, winner trajectories, unwritten judging behavior, and NimCarry P0/P1/P2 actions.
6. Update canonical + handover immediately after the full coding milestone.

## Continuity rule

This project continues to require `CANONICAL-STATE.yaml` and `HANDOVER.md` updates after every meaningful milestone so a new conversation can take lead without relying on chat history.
