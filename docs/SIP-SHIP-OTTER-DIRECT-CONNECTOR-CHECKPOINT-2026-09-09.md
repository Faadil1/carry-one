# NimCarry — Sip & Ship Otter Direct Connector Checkpoint

Date: 2026-09-09
Status: OPERATIONAL CHECKPOINT

## Context

The seven-call Sip & Ship corpus is complete through Cycle II Call #3 (Sep 9): four Cycle I calls and three Cycle II calls. Faadil supplied Otter.ai transcript export packages for all seven calls, and the corresponding videos are available in Google Drive for targeted visual verification.

Local ZIP extraction in the active ChatGPT runtime is currently failing with repeated transport timeouts. This is an execution-sandbox issue, not a data/corpus gap.

## Better extraction path discovered

The ChatGPT plugin directory exposes an official/available **Otter.ai** connector capable of searching meetings and retrieving full transcripts, summaries, action items and meeting metadata with speaker attribution.

The Otter.ai connector has been surfaced to Faadil for connection. Once connected, it becomes the preferred full-transcript ingestion path and supersedes the need to manually unzip the seven export packages.

Status: `PENDING_USER_CONNECTION`

## Evidence discipline

Until the connector is connected and the seven full transcripts are fetched, do not mark the seven-call transcript coding pass complete and do not invent recurrence counts. Existing public/official and opening-segment evidence remains valid, but full transcript claims remain pending.

## Interim cross-check from public official evidence

The current public Cycle II scoring and community guidance reinforce these already-supported directions:

- Functionality/reliability/usefulness is the dominant scoring category.
- A simple app solving a real problem is explicitly preferred over a complicated app without clear demand.
- First-time users should understand and reach the main point within 60 seconds.
- Real usage and community testing are explicit scoring levers.
- The app may be judged at any point after the submission deadline, so post-deadline reliability matters.
- Cycle I judge feedback publicly shared by a non-winner cites onboarding, error handling, over-broad scope and limited ecosystem reach as material weaknesses.
- Cycle I winners all make an important state/proof primitive visible and persistent rather than relying on an unverifiable client claim.

## NimCarry implications already strong enough to preserve

1. Keep the user story problem-first and simple.
2. Keep 1 NIM as a semantic custody baton, not an economic incentive.
3. Make Nimiq's role visible in-product: wallet authorization + independent finality + verified route state.
4. Make `ARRIVED / Route Receipt` the demo climax.
5. Treat onboarding/error handling/60-second comprehension as P0 assurance, not final polish.
6. Build a legitimate bridge-invite acquisition loop after secure E2E so NimCarry can create ecosystem reach beyond existing holders.
7. Keep the production judge path continuously healthy after Sep 18.

## Next step

After Otter.ai is connected:

1. Search/fetch all seven meetings directly from Otter.ai.
2. Code every Nimiq-team reaction, question, concern, failure and advice with timestamps and speaker attribution.
3. Quantify recurrence across all seven calls.
4. Compare Cycle I live feedback with eventual winner/non-winner outcomes.
5. Use Drive video only around highest-signal timestamps for UI/demo/non-verbal verification.
6. Produce final NimCarry hidden-spot matrix and P0/P1/P2 changes.
7. Immediately update `CANONICAL-STATE.yaml` and `HANDOVER.md`.
