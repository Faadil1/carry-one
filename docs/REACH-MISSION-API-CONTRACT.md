# Carry One — Reach Mission API Contract

Date: 2026-09-05  
Status: MVP vertical-slice contract

## 1. General rules

- Sensitive mutations require short-lived Nimiq wallet-signature authorization unless explicitly token-only decline/read.
- Server derives canonical holder/sequence; clients never assert them as trusted facts.
- Target wallet plaintext is server-private and absent from normal response DTOs/logs.
- Participant wallets render as fingerprints by default.
- Production mutations require idempotency keys.
- Active pass state is durable across restart.
- A wallet already in a mission's FINAL route cannot re-enter that mission.
- RPC unavailability never means transaction failure; return `VERIFICATION_DELAYED` and preserve pending custody.

## 2. `MissionView`

```ts
interface MissionView {
  mission_id: string
  status: 'ACTIVE' | 'ARRIVED' | 'CANCELLED'
  activity: 'ACTIVE' | 'STALLED' | 'TERMINAL'
  target_label: string
  target_consent_confirmed: true
  mission_note: string // human purpose/ask: why should this reach them?
  sequence: number
  finalized_hop_count: number
  current_holder: { display_label: string | null; wallet_fingerprint: string; is_viewer: boolean }
  invitation: InvitationSummary | null
  route: RouteEntry[]
  route_following_available: boolean
  stalled_restart_available: boolean
  viewer_role: 'CREATOR' | 'HOLDER' | 'PARTICIPANT' | 'INVITEE' | 'TARGET' | 'UNLISTED_VIEWER'
  primary_action: 'CREATE_INVITATION' | 'WAIT' | 'PASS_1_NIM' | 'REROUTE' | 'VIEW_ROUTE' | 'START_NEW_ROUTE' | null
}
```

STALLED is display-only and never changes custody. `START_NEW_ROUTE` creates a new mission; it does not reassign or claw back the old baton.

## 3. Auth challenge

`POST /auth/challenge` issues a `carry-one:v1` canonical message bound to wallet, action, mission, invitation, sequence, one-time nonce and expiry. Mutation signature envelopes include challenge id, claimed wallet, public key and signature. Server verifies public-key -> wallet derivation and atomically consumes the challenge.

## 4. Mission endpoints

### `POST /missions`

Requires `CREATE_MISSION` signature.

```json
{
  "target_label": "Harley",
  "target_wallet": "NQ...",
  "target_consent_confirmed": true,
  "mission_note": "I'd like this invitation to reach Harley through people who actually know him.",
  "visibility": "UNLISTED",
  "creator_display_label": "Faadil"
}
```

For Cycle II, `target_consent_confirmed` must be exactly true. This is a creator attestation/policy requirement, not cryptographic proof of target consent. The target wallet is normalized, encrypted immediately and HMAC'd for equality; it is never echoed back.

### `GET /missions/:missionId`

Returns participant-safe MissionView. `activity=STALLED` may be derived from last product activity without mutating the mission.

### `POST /missions/:missionId/cancel`

Signed `CANCEL_MISSION`; only pristine mission, no open invitation, no tx hash in flight.

## 5. Invitation endpoints

`POST /missions/:missionId/invitations` requires signed current holder and next sequence. A pre-bound candidate already present in FINAL history is rejected `ROUTE_WALLET_REUSE`.

Response returns plaintext invite URL exactly once. The server stores only its token hash. The client may derive a Nimiq Pay mini-app launcher from the private HTTPS URL.

`GET /i/:opaqueToken` is token-scoped participant-safe read.

`POST /i/:opaqueToken/accept` requires wallet signature. The accepting wallet is also rejected if it already appears in the mission's FINAL route.

`POST /i/:opaqueToken/decline` remains low-risk token-only. `withdraw` requires current-holder signature and is forbidden after broadcast.

## 6. Pass intent

### `POST /missions/:missionId/pass-intent`

Requires signed current holder, ACTIVE mission, ACCEPTED invitation, exact next sequence and no conflicting pass.

```json
{
  "intent_id": "uuid",
  "sequence": 4,
  "recipient": "NQ...",
  "value_luna": 100000,
  "fee_luna": 0,
  "recipient_data": "co:v1:<opaque-commitment>",
  "expected_sender": "NQ...",
  "expires_at": "..."
}
```

`recipient_data` is mandatory for Reach Mission, <=64 bytes, and must not expose mission id or sequence in clear text. The accepted recipient and expected sender may be returned only inside this authorized payment boundary.

The Mini App must preflight `listAccounts()` for `expected_sender` before opening Nimiq Pay. This is UX only; after broadcast, the backend independently verifies the actual transaction sender.

The MVP requests fee 0 and exactly 100000 Luna recipient value. Real-device exact-balance behavior remains a runtime validation gate.

### Broadcast / reconcile

Broadcast submits `{tx_hash}` only. The hash is not trusted. Independent RPC verification requires exact sender, recipient, 100000 Luna, exact opaque commitment and finality.

Configured read RPCs are attempted as fallback. If every endpoint is unavailable, response is HTTP 503:

```json
{
  "error": "VERIFICATION_DELAYED",
  "message": "Nimiq verification is temporarily delayed. The pass remains pending; custody has not changed."
}
```

No INVALID transition occurs merely because RPC infrastructure is down.

## 7. Arrival and retention

FINAL advances holder/sequence once, closes invitation as COMPLETED and compares recipient HMAC to target HMAC. Match -> ARRIVED. Former participants may retain authorized read-only access to follow the route. After arrival, `Start your own mission` is allowed as a product CTA, not a reward.

## 8. Stable errors added by hardening

- `TARGET_CONSENT_REQUIRED`
- `ROUTE_WALLET_REUSE`
- `MISSING_HOP_COMMITMENT`
- `WRONG_HOP_COMMITMENT`
- `VERIFICATION_DELAYED`
- plus existing holder/invitation/signature/transaction reason codes.

## 9. Usage evidence boundary

Competition analytics may expose aggregate counts for missions, invitations, accepted/completed invitations, FINAL hops, arrivals and **unique participating wallets**. They must never expose the underlying wallet list or call wallet count a unique-human count.

## 10. Deployment boundary

Public Early Access still requires production PostgreSQL repository/transactions, complete mission/auth/invitation/pass HTTP bindings, schema validation, rate limiting, idempotency, privacy/secret review and the real Nimiq Pay runtime validations recorded in the UX contract.
