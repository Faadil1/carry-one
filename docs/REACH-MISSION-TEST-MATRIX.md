# Carry One — Reach Mission Test Matrix

Date: 2026-09-05  
Gate: `CARRY_ONE_MVP_VERTICAL_SLICE_1`

Existing relay/foundation coverage remains required. This matrix adds the blind-spot invariants discovered before the vertical slice.

## A. Mission and target

| ID | Scenario | Expected |
|---|---|---|
| M01 | valid signed creation + distinct target + consent attestation | ACTIVE, creator holder, seq 0 |
| M02 | missing/false target consent attestation | reject `TARGET_CONSENT_REQUIRED` |
| M03 | target = creator | reject |
| M04 | public DTO | no target plaintext/ciphertext/HMAC |
| M05 | target consent flag | boolean true only; never described as cryptographic consent/identity proof |
| M06 | 24h no product activity | activity STALLED; holder/sequence unchanged |
| M07 | stalled restart CTA | creates new mission only; no old-baton reassignment |

## B. Invitation and route integrity

| ID | Scenario | Expected |
|---|---|---|
| I01 | two open invites race | one succeeds, one `OPEN_INVITATION_EXISTS` |
| I02 | unbound accept | wallet binds, no custody move |
| I03 | decline/expiry/withdraw | custody unchanged, reroute allowed before broadcast |
| I04 | pre-bound wallet already in FINAL route | reject `ROUTE_WALLET_REUSE` |
| I05 | unbound accept by wallet already in FINAL route | reject `ROUTE_WALLET_REUSE` |
| I06 | A -> B FINAL then B attempts invite A | reject; no route loop |
| I07 | COMPLETED invitation | terminal, cannot reopen |

## C. Authorization and wallet selection

| ID | Scenario | Expected |
|---|---|---|
| A01 | valid Nimiq signed challenge | accepted once |
| A02 | replay/expired/wrong wallet/public key | reject |
| A03 | multi-account client preflight lacks canonical holder | fail before payment prompt |
| A04 | preflight sees holder but provider broadcasts another sender | backend rejects `WRONG_SENDER` |
| A05 | AUTHORIZE_PASS | durable intent + mandatory opaque commitment |

A03/A04 require both automated boundary tests and a real Nimiq Pay multi-account device validation before Early Access.

## D. Opaque on-chain commitment

| ID | Scenario | Expected |
|---|---|---|
| O01 | Reach Mission intent | recipient data starts `co:v1:` |
| O02 | commitment bytes | <=64 bytes |
| O03 | inspect commitment | no clear mission id/sequence/recipient |
| O04 | tx lacks data | reject `MISSING_HOP_COMMITMENT` |
| O05 | tx commitment differs | reject `WRONG_HOP_COMMITMENT` |
| O06 | exact commitment + sender/recipient/value | eligible for inclusion/finality verification |
| O07 | legacy clear-text tag in Reach Mission client | rejected before send |

## E. Payment and finality

| ID | Scenario | Expected |
|---|---|---|
| T01 | client request | exactly 100000 Luna + fee 0 + opaque data |
| T02 | amount != 100000 | client/server reject |
| T03 | fee != 0 in Cycle-II MVP client | client reject |
| T04 | exactly-1-NIM funded wallet | real Nimiq Pay sends 1 NIM + data + fee 0 successfully |
| T05 | PENDING/INCLUDED | holder unchanged |
| T06 | FINAL | holder advances exactly once, invite COMPLETED |
| T07 | tx hash replay | reject globally |
| T08 | crash after relay FINAL before mission projection | restart repairs idempotently |

T04 is a real testnet runtime gate; unit tests alone cannot mark it PASS.

## F. RPC resilience

| ID | Scenario | Expected |
|---|---|---|
| R01 | primary RPC errors, secondary has tx | secondary result used |
| R02 | primary has not indexed tx, secondary has tx | secondary result used |
| R03 | at least one healthy endpoint says not found | null/pending semantics, not infrastructure failure |
| R04 | all endpoints unavailable | `VERIFICATION_DELAYED`; no INVALID/custody mutation |
| R05 | block-height primary down | fallback endpoint used |

## G. Privacy and anti-spam

| ID | Scenario | Expected |
|---|---|---|
| P01 | DB/API/log | target encrypted/HMAC'd and redacted |
| P02 | on-chain data | opaque commitment only; no mission id/sequence clear text |
| P03 | documentation/UI claim | acknowledges sender/recipient/value remain public on-chain |
| P04 | Cycle-II create | known target + creator attestation required |
| P05 | public-scale target consent | remains blocked until stronger target controls/opt-out exist |

## H. Native invitation and retention

| ID | Scenario | Expected |
|---|---|---|
| U01 | opaque invite link | HTTPS `/i/<token>` |
| U02 | Nimiq Pay custom scheme | encodes private HTTPS invite URL |
| U03 | weak token/insecure public origin | builder rejects |
| U04 | real phone tap | launches Nimiq Pay into intended invite screen |
| U05 | former participant | read-only route following available where authorized; no custody power |
| U06 | ARRIVED | may offer `Start your own mission`; no XP/reward |

U04 is a real-device runtime gate.

## I. Real-usage evidence

| ID | Scenario | Expected |
|---|---|---|
| G01 | aggregate evidence | missions/invites/accepts/completions/FINAL hops/arrivals counted |
| G02 | wallet appears in multiple route positions | counted once in unique-wallet count |
| G03 | evidence output | no raw wallet list, target, token or private why_you |
| G04 | terminology | `unique participating wallets`, never `unique humans` |
| G05 | test/demo wallets | separately tagged/excluded from competition real-usage evidence in deployment layer |

## J. Baseline regression

All 56 verified pre-hardening tests must remain green, plus all new hardening tests. CI must run `npm ci`, strict typecheck, tests and build. No public Early Access until all automated tests are green and the three real-runtime gates (multi-account, exact-balance fee=0, native deeplink) pass.
