# Carry One — Security, Wallet Authorization & Invite Threat Model

Date: 2026-09-04  
Applies to: Reach Mission MVP

## 1. Security posture

Carry One must treat the wallet as the authority for holder actions and the blockchain as the authority for transfer finality. A browser session, invite link, device identifier, display name or submitted transaction hash is never sufficient authority by itself.

The Nimiq Mini App provider supports wallet account access and arbitrary message signing. Carry One should use those signatures for action authorization; the server must verify the signature and derive/confirm that the public key corresponds to the claimed Nimiq address.

## 2. Canonical signed-action format

Every state-changing wallet action receives a short-lived server challenge. The client signs one canonical UTF-8 message:

```text
carry-one:v1
origin=<canonical-origin>
action=<ACTION>
wallet=<NORMALIZED_NIMIQ_ADDRESS>
mission=<MISSION_UUID_OR_NONE>
invitation=<INVITATION_UUID_OR_NONE>
sequence=<INTEGER_OR_0>
nonce=<SERVER_RANDOM_NONCE>
expires_at=<RFC3339_UTC>
```

Rules:
- nonce: minimum 128 bits cryptographically random;
- challenge TTL: 5 minutes;
- nonce stored only as a one-way hash where practical;
- exact string serialization is server-generated, never client-composed ad hoc;
- one successful verification marks challenge `USED` atomically;
- replay of a used/expired challenge is rejected;
- signature verification also verifies wallet/public-key correspondence.

## 3. Actions requiring wallet signature

### `CREATE_MISSION`
Signer becomes creator and initial canonical holder.

### `CREATE_INVITATION`
Signer must equal mission `current_holder_wallet_normalized`.

### `ACCEPT_INVITATION`
Invitee signs acceptance. For an unbound invitation, the first valid acceptance binds `candidate_wallet_normalized`. For a pre-bound invitation, signer must match the pre-bound wallet.

### `WITHDRAW_INVITATION`
Signer must be current holder; forbidden after a transaction hash has been recorded.

### `AUTHORIZE_PASS`
Signer must be current holder. Challenge is bound to mission id, sequence, invitation id and accepted candidate wallet. Successful authorization creates the atomic server-side pass intent.

### `CANCEL_MISSION`
Signer must be creator/current holder, mission must have zero finalized hops, no broadcast may be in flight.

## 4. Actions that do not require wallet signature

### `DECLINE_INVITATION`
MVP may allow decline with possession of the one-time invite capability token without connecting/signing a wallet because decline cannot move custody or funds. Threat impact is limited to denial of one invitation; the holder can reroute.

If abuse appears, upgrade decline to signed-wallet-only for pre-bound invitations.

### Read-only unlisted route view
Possession of the mission view token may reveal the participant-safe route and target label, but never wallet secrets or mutation authority.

## 5. Invitation token design

Invite links use at least 256 bits of cryptographically random entropy.

Example logical shape:

```text
https://carry.one/i/<opaque-token>
```

Server stores only `SHA-256(token)` or stronger equivalent, never plaintext token.

Token properties:
- single invitation scope;
- default TTL 12 hours;
- one acceptance only;
- no power to create a pass intent;
- no power to submit or approve a transaction;
- no power to reveal target wallet;
- after `DECLINED`, `EXPIRED`, `WITHDRAWN` or successful finalized pass, token is dead.

## 6. Unbound vs pre-bound invitations

### Unbound invitation
Used when the holder knows the person socially but not their Nimiq address.

Security model:
1. private capability link identifies the invitation;
2. first valid wallet-signed `ACCEPT_INVITATION` binds the candidate wallet;
3. current holder sees a candidate label + short wallet fingerprint;
4. holder must explicitly authorize the pass to that bound wallet;
5. server and on-chain verification enforce exact recipient.

Risk: a stolen invite link can be accepted by the thief first.

Mitigations:
- high-entropy unguessable link;
- short TTL;
- do not post invite links publicly;
- display accepted wallet fingerprint to holder before payment;
- holder can withdraw before broadcast if identity looks wrong;
- transaction cannot occur without holder wallet approval.

### Pre-bound invitation
Used when candidate wallet is already known.

Acceptance signer must equal the pre-bound wallet. Stolen link alone cannot claim the invitation.

Prefer pre-bound invitations for public/high-value missions; unbound remains the default convenience path for warm social routing.

## 7. Pass authorization and transaction verification

The signed `AUTHORIZE_PASS` does not prove payment. It only permits creation of the pass intent.

The canonical pass still requires:
1. wallet-approved Nimiq transaction;
2. returned transaction hash treated as a claim;
3. independent RPC lookup;
4. exact sender = current holder;
5. exact recipient = accepted candidate wallet;
6. exact recipient value = 100000 Luna;
7. global tx-hash replay check;
8. required finality;
9. atomic persistence update.

After a tx hash is recorded, Carry One exposes no user cancel path. It reconciles until `FINAL` or deterministic `INVALID`.

## 8. Target-wallet privacy model

The target wallet is sensitive mission metadata even though blockchain addresses are public in general.

Requirements:
- encrypt normalized target wallet at rest with application-level authenticated encryption;
- store a keyed HMAC for equality matching at arrival;
- never return target wallet from general mission, invitation or route APIs;
- never log plaintext target wallet in application logs, analytics or error telemetry;
- do not expose target wallet in invite tokens, URLs, client state hydration or page source;
- public/participant UI shows `target_label` only;
- backend compares finalized recipient to target internally.

A plain hash is insufficient because public wallet address spaces can be enumerated/correlated. Use a server-secret keyed HMAC for lookup.

## 9. API boundary rules

All mutation endpoints must enforce:
- HTTPS only in production;
- schema validation;
- rate limiting by IP + wallet + mission where applicable;
- signed challenge for holder-sensitive actions;
- database transaction + row lock for mission sequence/custody mutations;
- no client-provided canonical holder/sequence accepted without server comparison;
- idempotency keys for mutation retries;
- generic errors to unauthenticated callers; detailed reason codes only to authorized participants where safe.

## 10. Primary threats and fail-closed behavior

| Threat | Required behavior |
|---|---|
| stolen invite link | cannot move funds; holder sees bound wallet before pass |
| replayed wallet signature | rejected by one-time challenge nonce |
| forged current-holder request | rejected by signature + canonical holder comparison |
| duplicate invitation race | DB uniqueness + row lock rejects second open invitation |
| tx hash reused across missions | global unique tx-hash constraint rejects replay |
| wrong sender/recipient/amount | hop INVALID; custody unchanged |
| user cancels after broadcast | cancellation rejected; reconciliation continues |
| app/server restart | durable DB restores mission, invitation and hop state |
| target wallet scraped from API | impossible through participant/public DTOs |
| candidate accepts then disappears | accepted-pass deadline expires; holder reroutes |
| holder sends outside Carry One | ignored unless it exactly matches an active canonical pass intent |
| concurrent finalization workers | row lock/idempotent state transition prevents double advance |

## 11. Logging and analytics

Allowed analytics:
- mission count;
- invitation conversion states;
- finalized hop count;
- time-to-accept/time-to-finality/time-to-arrival;
- unique participating wallet count using privacy-conscious pseudonymous identifiers.

Do not log:
- plaintext target wallets;
- invite tokens;
- full wallet signatures;
- private `why_you` text in third-party analytics;
- secrets or private keys.

## 12. Build gate

Public Early Access is blocked until this authorization model, durable persistence and target-wallet API redaction are implemented and covered by tests.