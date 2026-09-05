# Carry One — Reach Mission Test Matrix

Date: 2026-09-04  
Gate: `CARRY_ONE_REACH_MISSION_UX_AND_STATE_CONTRACT`

This matrix defines the minimum automated coverage required before Early Access. Existing relay-spike tests remain valid; these scenarios add the destination, invitation, authorization, persistence and privacy layers.

## A. Mission creation

| ID | Scenario | Expected |
|---|---|---|
| M01 | valid creator signature + distinct target | mission ACTIVE, creator holder, sequence 0 |
| M02 | target = creator wallet | reject `SELF_TARGET` |
| M03 | invalid target address | reject before persistence |
| M04 | replay CREATE_MISSION challenge | reject replay |
| M05 | expired CREATE_MISSION challenge | reject |
| M06 | service restart after creation | mission still readable with same canonical holder |
| M07 | public mission without explicit public-target permission | reject/downgrade to UNLISTED |
| M08 | mission API response | target wallet absent from DTO/log-safe serialization |

## B. Invitation creation

| ID | Scenario | Expected |
|---|---|---|
| I01 | current holder signs CREATE_INVITATION | INVITED created at next sequence |
| I02 | non-holder signs CREATE_INVITATION | reject `NOT_CURRENT_HOLDER` |
| I03 | second open invitation while one INVITED | reject `ACTIVE_INVITATION_EXISTS` |
| I04 | second open invitation while one ACCEPTED | reject |
| I05 | invite after mission ARRIVED | reject terminal mission |
| I06 | invite after mission CANCELLED | reject |
| I07 | token entropy/storage | only token hash persisted; plaintext absent |
| I08 | invite response payload | no target wallet, no full participant wallet by default |

## C. Accept / decline / expiry / withdrawal

| ID | Scenario | Expected |
|---|---|---|
| A01 | valid unbound invite + wallet-signed accept | candidate wallet bound, status ACCEPTED |
| A02 | second wallet attempts accept after first acceptance | reject |
| A03 | pre-bound invite accepted by different wallet | reject `WRONG_INVITEE_WALLET` |
| A04 | accept expired invite | reject; status EXPIRED |
| A05 | decline valid INVITED token | DECLINED; holder unchanged |
| A06 | decline twice | idempotent terminal response, no mutation |
| A07 | holder withdraws INVITED | WITHDRAWN; holder unchanged |
| A08 | holder withdraws ACCEPTED before pass intent | WITHDRAWN allowed |
| A09 | holder withdraws after tx hash recorded | reject fail-closed |
| A10 | accepted pass deadline expires before broadcast | EXPIRED; holder can invite another |
| A11 | restart while ACCEPTED | acceptance and deadline survive restart |

## D. Holder authorization

| ID | Scenario | Expected |
|---|---|---|
| H01 | valid holder signs AUTHORIZE_PASS for accepted candidate | pass intent created |
| H02 | non-holder signs AUTHORIZE_PASS | reject |
| H03 | signature valid but wrong mission/sequence | reject challenge binding mismatch |
| H04 | replay AUTHORIZE_PASS signature | reject used challenge |
| H05 | expired challenge | reject |
| H06 | accepted recipient changed client-side after signature | reject server canonical mismatch |
| H07 | create pass intent with invitation not ACCEPTED | reject |

## E. Broadcast and chain verification

| ID | Scenario | Expected |
|---|---|---|
| T01 | correct 1 NIM sender/recipient, included not final | INCLUDED, holder unchanged |
| T02 | same tx finalizes | FINAL, holder advances exactly once |
| T03 | wrong sender | INVALID, holder unchanged |
| T04 | wrong recipient | INVALID, holder unchanged |
| T05 | 0.99999 NIM | INVALID |
| T06 | 1.00001 NIM | INVALID |
| T07 | fee causes sender outflow > 1 NIM but recipient gets exactly 1 NIM | valid |
| T08 | same tx hash reused in different mission | reject global replay |
| T09 | same tx hash submitted twice to same hop | idempotent, no duplicate advance |
| T10 | cancel after broadcast | reject; reconciliation continues |
| T11 | RPC temporary null before stale deadline | remains PENDING |
| T12 | never-observed tx exceeds validity window | INVALID, holder unchanged |
| T13 | concurrent finalization workers | one canonical FINAL transition only |
| T14 | restart during PENDING/INCLUDED | watcher resumes from durable state |

## F. Destination arrival

| ID | Scenario | Expected |
|---|---|---|
| D01 | finalized recipient != target | mission remains ACTIVE, recipient becomes holder |
| D02 | finalized recipient = target | mission ARRIVED atomically with FINAL hop |
| D03 | target merely accepts invitation | not ARRIVED |
| D04 | tx to target seen in mempool | not ARRIVED |
| D05 | included tx to target not final | not ARRIVED |
| D06 | finalization retried | arrived_at unchanged/idempotent |
| D07 | invite after ARRIVED | reject |
| D08 | pass after ARRIVED | reject |
| D09 | completed route | consists only of FINAL hops in ascending sequence |

## G. Reroute behavior

| ID | Scenario | Expected |
|---|---|---|
| R01 | candidate declines | holder creates new invitation at same next sequence |
| R02 | invite expires | holder creates new invitation at same next sequence |
| R03 | holder withdraws before broadcast | new invite allowed |
| R04 | invalid transfer | canonical sequence does not advance; reroute allowed after invalid closes |
| R05 | broadcast in flight | reroute forbidden |
| R06 | FINAL pass | previous holder cannot reroute mission |

## H. Mission cancellation

| ID | Scenario | Expected |
|---|---|---|
| C01 | creator/current holder cancels before first FINAL, no tx in flight | CANCELLED |
| C02 | non-authorized wallet cancels | reject |
| C03 | cancel after first FINAL | reject |
| C04 | cancel with tx hash in flight | reject |
| C05 | cancelled mission survives restart | remains terminal |

## I. Privacy and redaction

| ID | Scenario | Expected |
|---|---|---|
| P01 | unauthenticated mission view | no target wallet ciphertext/HMAC/plaintext |
| P02 | invitation view | target label yes, target wallet no |
| P03 | route view | wallet fingerprints only unless policy explicitly allows more |
| P04 | third-party analytics event | no target wallet, invite token or why_you |
| P05 | application error | no secret/token/plain target wallet in message |
| P06 | DB dump of application columns | target wallet encrypted, lookup uses keyed HMAC |
| P07 | raw invite token search in DB | no plaintext token stored |

## J. Invite-token threat cases

| ID | Scenario | Expected |
|---|---|---|
| S01 | random token guessing | rate-limited 404-equivalent, no enumeration signal |
| S02 | stolen unbound token accepted by wallet X | X binds, but holder must explicitly authorize X before any payment |
| S03 | holder spots wrong wallet fingerprint and withdraws | no transfer, invitation terminal |
| S04 | stolen pre-bound token + wrong wallet | cannot accept |
| S05 | expired token | no state-changing power |
| S06 | terminal token reused | reject/idempotent terminal response |

## K. UX contract assertions

| ID | Scenario | Expected |
|---|---|---|
| U01 | ACTIVE holder + no invite | exactly one primary CTA: Choose next bridge |
| U02 | INVITED | pass CTA unavailable |
| U03 | ACCEPTED | Pass 1 NIM available only to current holder |
| U04 | PENDING/INCLUDED | all reroute/cancel CTAs unavailable |
| U05 | DECLINED/EXPIRED/WITHDRAWN | Choose another bridge available |
| U06 | ARRIVED | no pass/invite CTA; completed route displayed |
| U07 | target wallet | never rendered in the five-screen UI |
| U08 | why_you | visible to inviter/invitee only by default |

## L. Real-usage instrumentation

| ID | Scenario | Expected |
|---|---|---|
| G01 | same wallet participates twice | counted once in unique-wallet metric |
| G02 | different wallet final recipients | counted separately |
| G03 | declined invite with no wallet acceptance | not counted as participating wallet unless rules explicitly define otherwise |
| G04 | test/demo wallets | tagged/excluded from real-usage competition reporting |

## Exit criteria for this test family

Before public Early Access:
- all existing spike tests green;
- all security-critical cases in sections B–J automated;
- no known path can change current holder without a verified FINAL 1-NIM hop;
- no known API path reveals the target wallet;
- restart/recovery tests prove durability;
- CI runs typecheck + tests + build on every PR.