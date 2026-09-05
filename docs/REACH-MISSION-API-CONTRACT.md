# Carry One — Reach Mission API Contract

Date: 2026-09-04  
Status: MVP implementation contract

This document defines the API boundary needed by the five-screen Reach Mission UX. It intentionally separates participant-safe DTOs from server-private custody and target data.

## 1. General rules

- All mutation endpoints are authenticated by short-lived Nimiq wallet-signature challenges unless explicitly marked token-only decline/read.
- Clients never submit a canonical holder or canonical sequence as trusted facts; the server derives and verifies them.
- Target wallet plaintext is server-private and absent from every normal response DTO.
- Full participant wallet addresses are not returned by default; use a display label and short fingerprint.
- Every production mutation accepts an idempotency key.
- All timestamps are RFC3339 UTC.
- Active pass authorization/broadcast state is durable and survives restart.

## 2. Safe DTOs

### `MissionView`

```ts
interface MissionView {
  mission_id: string
  status: 'ACTIVE' | 'ARRIVED' | 'CANCELLED'
  target_label: string
  mission_note: string
  sequence: number
  finalized_hop_count: number
  current_holder: {
    display_label: string | null
    wallet_fingerprint: string
    is_viewer: boolean
  }
  invitation: InvitationSummary | null
  route: RouteEntry[]
  viewer_role: 'CREATOR' | 'HOLDER' | 'PARTICIPANT' | 'INVITEE' | 'TARGET' | 'UNLISTED_VIEWER'
  primary_action: 'CREATE_INVITATION' | 'WAIT' | 'PASS_1_NIM' | 'REROUTE' | 'VIEW_ROUTE' | null
}
```

`MissionView` MUST NOT contain `target_wallet`, target ciphertext/HMAC, invite-token hashes, raw signatures or private `why_you` unless viewer authorization permits a separate field.

### `InvitationView`

```ts
interface InvitationView {
  invitation_id: string
  mission_id: string
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'WITHDRAWN' | 'COMPLETED'
  target_label: string
  mission_note: string
  inviter: {
    display_label: string | null
    wallet_fingerprint: string
  }
  why_you: string | null
  finalized_hop_count: number
  expires_at: string
  pass_deadline_at: string | null
  accepted_wallet_fingerprint: string | null
}
```

`COMPLETED` means this invitation produced the matching finalized canonical hop. It is historical/terminal and cannot be reopened.

### `RouteEntry`

```ts
interface RouteEntry {
  sequence: number
  from: { display_label: string | null; wallet_fingerprint: string }
  to: { display_label: string | null; wallet_fingerprint: string }
  finalized_at: string
  tx_hash_short: string
}
```

No failed/invalid hop is included in the unauthenticated participant-safe route.

## 3. Auth challenge endpoints

### `POST /auth/challenge`

Request:

```json
{
  "wallet": "NQ...",
  "action": "CREATE_MISSION",
  "mission_id": null,
  "invitation_id": null,
  "sequence": 0
}
```

Response:

```json
{
  "challenge_id": "uuid",
  "canonical_message": "carry-one:v1...",
  "expires_at": "..."
}
```

### Signature envelope

Mutation requests requiring wallet authorization include:

```json
{
  "auth": {
    "challenge_id": "uuid",
    "wallet": "NQ...",
    "public_key": "hex",
    "signature": "hex"
  }
}
```

Server verifies message, signature, wallet/public-key correspondence, expiry, exact action/mission/invitation/sequence binding and one-time nonce use atomically.

## 4. Mission endpoints

### `POST /missions`

Requires `CREATE_MISSION` signature.

Body:

```json
{
  "target_label": "Harley",
  "target_wallet": "NQ...",
  "mission_note": "Can this reach Harley through people who know people?",
  "visibility": "UNLISTED",
  "creator_display_label": "Faadil"
}
```

The target wallet is accepted only on this write boundary, normalized, encrypted immediately with authenticated encryption, and reduced to a keyed HMAC for equality matching. It is never echoed back.

Returns `MissionView` with creator as holder at sequence 0.

### `GET /missions/:missionId`

Requires participant/unlisted-view authorization appropriate to mission visibility. Returns `MissionView`; never returns target wallet.

### `POST /missions/:missionId/cancel`

Requires `CANCEL_MISSION` signature. Allowed only if zero finalized hops, no open invitation and no tx hash is in flight.

## 5. Invitation endpoints

### `POST /missions/:missionId/invitations`

Requires `CREATE_INVITATION` signature from canonical holder and binds the signed challenge to the mission's next sequence.

Body:

```json
{
  "candidate_label": "Opeyemi",
  "candidate_wallet": null,
  "why_you": "You know more builders in this ecosystem than I do."
}
```

Returns once:

```json
{
  "invitation_id": "uuid",
  "invite_url": "https://.../i/<opaque-token>",
  "expires_at": "..."
}
```

The plaintext invite token is never returned again and never stored plaintext server-side.

### `GET /i/:opaqueToken`

Token-scoped read. Returns participant-safe `InvitationView`. Invalid/expired tokens return a non-enumerable not-found style response in the production API.

### `POST /i/:opaqueToken/accept`

Requires `ACCEPT_INVITATION` wallet signature. First successful valid acceptance binds candidate wallet for unbound invites. Pre-bound invitations require exact wallet match.

Returns updated `InvitationView`; does not create a pass intent and does not move funds.

### `POST /i/:opaqueToken/decline`

Token-only allowed in MVP. Transition only from `INVITED` to `DECLINED`. Cannot move custody or funds.

### `POST /missions/:missionId/invitations/:invitationId/withdraw`

Requires current-holder signature. Allowed only before tx hash is recorded.

## 6. Pass endpoints

### `POST /missions/:missionId/pass-intent`

Requires `AUTHORIZE_PASS` signature from canonical holder.

Preconditions:
- mission ACTIVE;
- invitation ACCEPTED;
- accepted wallet bound;
- before pass deadline;
- signer equals current holder;
- challenge bound to exact mission/invitation/sequence;
- no conflicting active canonical pass.

Response:

```json
{
  "intent_id": "uuid",
  "sequence": 4,
  "recipient": "NQ...",
  "value_luna": 100000,
  "recipient_data": "carryone:<mission-id>:4",
  "expires_at": "..."
}
```

This is the one narrow response where the accepted recipient wallet may be returned to the authenticated current holder because the client must construct/confirm the payment. It is never target metadata: it is the wallet the candidate actually accepted with, which may happen to be the target only on the final bridge.

The active pass intent is durable. A server restart must not erase its holder/recipient/sequence/nonce/tx-hash tracking.

### `POST /missions/:missionId/pass-intent/:intentId/broadcast`

Requires holder-bound authenticated session/challenge or a server-issued single-use intent credential.

Body:

```json
{ "tx_hash": "..." }
```

Server treats the hash as a claim and independently verifies it. Once a hash is recorded, user cancellation/reroute is fail-closed until reconciliation resolves the transaction.

### `POST /missions/:missionId/reconcile`

May be server-internal/background. Participant-triggered calls are idempotent. Returns safe hop state only.

On a verified `FINAL`, the same logical transition must:
- advance holder/sequence exactly once;
- set the invitation to `COMPLETED`;
- project the finalized route entry;
- compare the recipient HMAC to the private target HMAC;
- set `ARRIVED` if matched.

If relay FINAL persisted immediately before a process crash, restart reconciliation must safely project that same next FINAL hop without double-advancing the mission.

## 7. Arrival behavior

On FINAL verification the service atomically compares the normalized recipient's keyed HMAC to the private target HMAC.

If matched:
- mission -> `ARRIVED`;
- matching invitation -> `COMPLETED`;
- `arrived_at` set once;
- no further invitation/pass endpoints are valid;
- target receives role `TARGET` if authenticated;
- normal client DTO still does not reveal the stored target wallet value.

## 8. Error contract

Authorized clients may receive stable reason codes such as:

- `WRONG_CURRENT_HOLDER`
- `OPEN_INVITATION_EXISTS`
- `INVITATION_EXPIRED`
- `WRONG_INVITEE_WALLET`
- `INVITATION_NOT_ACCEPTED`
- `PASS_DEADLINE_EXPIRED`
- `BROADCAST_IN_FLIGHT`
- `DUPLICATE_TX_HASH`
- `WRONG_SENDER`
- `WRONG_RECIPIENT`
- `WRONG_AMOUNT`
- `MISSION_NOT_ACTIVE`
- `CHALLENGE_EXPIRED`
- `CHALLENGE_REPLAY`
- `SIGNER_WALLET_MISMATCH`
- `INVALID_SIGNATURE`

Unauthenticated/token-invalid calls should avoid detailed existence signals.

## 9. Logging/redaction contract

Structured application logs MUST redact:
- `target_wallet`;
- target ciphertext/HMAC;
- `invite_url` and raw invite token;
- full wallet signatures;
- private `why_you`;
- any authorization nonce.

Allowed identifiers in routine logs:
- mission UUID;
- invitation UUID;
- hop UUID;
- tx hash;
- short wallet fingerprint;
- reason code;
- state transition.

## 10. Slice-1 vs deployment boundary

Slice 1 implements and tests the domain/security/persistence foundation plus local durable adapters. Public deployment still requires the HTTP bindings, a production PostgreSQL repository/transaction implementation, deployment rate limits/idempotency middleware, secret/privacy review and explicit Early Access gate.
