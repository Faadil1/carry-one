# Carry One Backend Handover

## Overview

Carry One is a social relay game where the baton advances only after the current holder sends exactly **1 NIM** to the next wallet. The backend independently verifies the transaction on the Nimiq Albatross testnet before advancing the canonical relay.

This backend spike includes:

- Canonical relay state and sequence management
- Atomic intent creation before wallet approval
- Exactly 1 NIM validation (`100,000` Luna)
- Sender and recipient validation
- Optional baton/sequence payload validation
- Nimiq Pay provider adapter
- Read-only Nimiq JSON-RPC integration
- Inclusion and Albatross finality checks
- Pending, invalid, stale, duplicate, cancelled, and recovery handling
- HTTP REST API
- Five-hop W0 -> W1 -> W2 -> W3 -> W4 -> W5 tests

Verified status: **76 tests passing, clean TypeScript typecheck, production build passing.**

## Architecture

```text
Nimiq Pay WebView / Frontend
        |
        | @nimiq/mini-app-sdk
        | wallet approval and transaction hash
        v
Carry One HTTP API
        |
        v
CanonicalRelayService
        |
        +-- RelayStore
        |   canonical intent and hop state
        |
        +-- HttpNimiqRpcClient
            read-only chain verification
                |
                v
        Nimiq Albatross testnet RPC
```

### File tree

```text
carry-one/
├── src/
│   ├── core/
│   │   ├── types.ts
│   │   └── relay.ts
│   ├── nimiq/
│   │   ├── policy.ts
│   │   ├── rpc-client.ts
│   │   ├── pay-provider.ts
│   │   └── transaction-watcher.ts
│   ├── service/
│   │   ├── canonical-relay-service.ts
│   │   └── http-server.ts
│   └── index.ts
├── scripts/
│   ├── demo-local.ts
│   └── fund-wallet.ts
├── tests/
├── .env.example
├── package.json
└── README.md
```

## Nimiq Testnet Integration

`HttpNimiqRpcClient` uses:

```text
https://rpc.testnet.nimiqwatch.com
```

It calls:

- `getTransactionByHash(hash)` to retrieve transaction evidence
- `getBlockNumber()` to determine finality
- `getTransactionsByAddress(address, 100, null)` for the optional watcher

The client supports both raw RPC results and the Nimiq Watch wrapper:

```json
{
  "result": {
    "data": {}
  }
}
```

The active testnet policy is:

```text
blocksPerBatch: 60
blockSeparationTimeMs: 1000
transactionValidityWindowBlocks: 7200
genesisBlockNumber: 3032010
networkId: 5
```

A transaction is `INCLUDED` when it has a block number. It becomes `FINAL` after the chain head crosses the macro-block boundary closing its batch.

## Server Setup

Create a local `.env` file. Never commit private keys or mnemonics.

```env
NIMIQ_RPC_URL=https://rpc.testnet.nimiqwatch.com
NIMIQ_TESTNET_WALLET_ADDRESS=NQ83 A24E V6QC JM6U 6KFJ K6TH H0QX HBR8 37R6
NIMIQ_WATCH_INTERVAL_MS=5000
PORT=8787
```

Install and verify:

```powershell
npm install
npm run typecheck
npm test
npm run build
```

Start the built server:

```powershell
npm run build
npm start
```

Development mode:

```powershell
npm run dev
```

### Storage backend (`CARRY_ONE_REPOSITORY`)

The server supports two durable storage backends behind a single env switch:

```env
# file (default) — no external service required
CARRY_ONE_REPOSITORY=file
# postgres — durable relay + mission storage in a real database
CARRY_ONE_REPOSITORY=postgres
CARRY_ONE_DATABASE_URL=postgres://user:password@host:5432/carry_one
```

- **`file` (default)** — exactly the pre-Postgres behavior: an in-memory `RelayStore`, or `FileRelayStore` when `CARRY_ONE_RELAY_STATE_FILE` is set. No database is required or opened.
- **`postgres`** — boots `PgRelayStore` + `PgMissionRepository` on a shared DB pool, hydrating relay/mission state from Postgres. The connection URL is read from `CARRY_ONE_DATABASE_URL`, falling back to `DATABASE_URL`. If `postgres` is selected without a URL, the server fails fast at startup with a clear error instead of silently degrading.
- Migrations must be applied before first use: `npx tsx scripts/migrate.ts`.

The normal server listens on port `8787`. The incoming transaction watcher is read-only and logs candidate transactions sent to `NIMIQ_TESTNET_WALLET_ADDRESS`.

### Local chain-free demo

For frontend integration without a real blockchain transaction:

```powershell
npm run demo:local
```

The demo listens on port `8788` and seeds a valid transaction with payload `carryone:demo:1`. Test it with:

```powershell
curl.exe -X POST http://localhost:8788/relay/demo/reconcile
```

The response should contain `"status":"FINAL"`.

## API Contract

All routes use `/relay/:batonId`. The examples below use the baton ID `demo`.

### Create an intent

```http
POST /relay/demo/intent
Content-Type: application/json
```

Request:

```json
{
  "currentHolder": "NQ_CURRENT_HOLDER",
  "recipient": "NQ_NEXT_HOLDER"
}
```

Response: `201 Created`

```json
{
  "batonId": "demo",
  "sequence": 1,
  "currentHolder": "NQ_CURRENT_HOLDER",
  "recipient": "NQ_NEXT_HOLDER",
  "nonce": "generated-uuid",
  "createdAt": 1780000000000
}
```

Rules:

- Only one active intent may exist for a baton.
- The holder and recipient cannot be the same address.
- After a finalized hop, `currentHolder` must be the previous canonical recipient.
- Create the intent before opening the Nimiq Pay approval dialog.

Example:

```powershell
curl.exe -X POST http://localhost:8787/relay/demo/intent `
  -H "Content-Type: application/json" `
  -d '{"currentHolder":"NQ_CURRENT_HOLDER","recipient":"NQ_NEXT_HOLDER"}'
```

### Record a broadcast

```http
POST /relay/demo/broadcast
Content-Type: application/json
```

Request:

```json
{
  "txHash": "64-character-transaction-hash"
}
```

Response: `201 Created`

```json
{
  "batonId": "demo",
  "sequence": 1,
  "currentHolder": "NQ_CURRENT_HOLDER",
  "recipient": "NQ_NEXT_HOLDER",
  "nonce": "generated-uuid",
  "txHash": "64-character-transaction-hash",
  "value": null,
  "status": "PENDING",
  "createdAt": 1780000000000,
  "confirmedAt": null
}
```

This records the hash as an unverified claim. It does not advance the relay. Verification happens during reconciliation.

```powershell
curl.exe -X POST http://localhost:8787/relay/demo/broadcast `
  -H "Content-Type: application/json" `
  -d '{"txHash":"<HASH_RETURNED_BY_NIMIQ_PAY>"}'
```

### Reconcile a relay

```http
POST /relay/demo/reconcile
```

No request body is required:

```powershell
curl.exe -X POST http://localhost:8787/relay/demo/reconcile
```

Possible successful `200 OK` results:

- `null`: no active intent or no broadcast has been recorded
- `PENDING`: transaction is not visible yet or remains in the mempool
- `INCLUDED`: transaction is on-chain but not final
- `FINAL`: transaction is verified and final
- `INVALID`: stale transaction or stale intent did not advance the baton

The transaction must match:

```text
from == intent.currentHolder
to == intent.recipient
value == 100000 Luna
```

If recipient data is present, it must equal:

```text
carryone:<batonId>:<sequence>
```

For the demo baton’s first hop:

```text
carryone:demo:1
```

A mismatched transaction produces `409 Conflict` with one of these reasons:

- `WRONG_SENDER`
- `WRONG_RECIPIENT`
- `WRONG_AMOUNT`
- `WRONG_BATON_TAG`

RPC failures produce `500 Internal Server Error`.

### Get public relay status

```http
GET /relay/demo
```

Example response:

```json
{
  "baton_id": "demo",
  "sequence": 1,
  "current_holder": "NQ_NEXT_HOLDER",
  "status": "READY",
  "hop_count": 1,
  "activity": "ACTIVE"
}
```

Fields:

| Field | Meaning |
| --- | --- |
| `baton_id` | Stable relay identifier |
| `sequence` | Latest finalized sequence |
| `current_holder` | Current canonical holder |
| `status` | `READY`, `PENDING`, `CONFIRMED`, `CANCELLED`, or `INVALID` |
| `hop_count` | Number of finalized hops |
| `activity` | `ACTIVE` or `DORMANT` |

Internal hop status `FINAL` is represented as public status `CONFIRMED`.

### Get relay history

```http
GET /relay/demo/history
```

Example response:

```json
[
  {
    "baton_id": "demo",
    "sequence": 1,
    "current_holder": "NQ_CURRENT_HOLDER",
    "recipient": "NQ_NEXT_HOLDER",
    "tx_hash": "64-character-transaction-hash",
    "status": "CONFIRMED",
    "created_at": "2026-09-03T12:00:00.000Z",
    "confirmed_at": "2026-09-03T12:01:00.000Z"
  }
]
```

History is ordered by sequence and uses snake_case public field names.

### Cancel an intent

```http
POST /relay/demo/cancel
```

No body is required. Response: `204 No Content`.

Call this only when the user cancels the native approval before a transaction hash is returned.

```powershell
curl.exe -X POST http://localhost:8787/relay/demo/cancel
```

## Frontend Integration Flow

The frontend owns the wallet interaction. The backend owns canonical state and independently verifies the chain.

1. Load `GET /relay/demo` and `GET /relay/demo/history`.
2. Obtain the current Nimiq account through `@nimiq/mini-app-sdk` inside Nimiq Pay.
3. Call `/relay/demo/intent` with the current address and selected recipient.
4. Show the user that exactly `1 NIM` will be sent.
5. Send through `MiniAppSdkPayProvider.sendPass()`.
6. Attach recipient data `carryone:demo:1`.
7. Send the returned hash to `/relay/demo/broadcast`.
8. Poll `/relay/demo/reconcile` every few seconds.
9. Show progress for `PENDING` and `INCLUDED`.
10. Show the handoff as complete only on `FINAL`.
11. Reload status and history after finalization.

Example:

```ts
const intent = await postJson('/relay/demo/intent', {
  currentHolder: currentWalletAddress,
  recipient: nextWalletAddress,
});

const payment = await payProvider.sendPass({
  recipient: nextWalletAddress,
  amountLuna: 100_000,
  data: `carryone:${intent.batonId}:${intent.sequence}`,
});

await postJson('/relay/demo/broadcast', { txHash: payment.txHash });

let hop;
do {
  hop = await postJson('/relay/demo/reconcile');
  if (hop?.status === 'PENDING' || hop?.status === 'INCLUDED') {
    await delay(5000);
  }
} while (hop?.status === 'PENDING' || hop?.status === 'INCLUDED');

if (hop?.status === 'FINAL') {
  // Show confirmed handoff and reload public status/history.
} else if (hop?.status === 'INVALID') {
  // Show that the canonical relay did not advance.
}
```

### Frontend error handling

- User cancels approval: show cancelled state and call `/cancel` only if no hash exists.
- Hash is returned but not found: keep polling; do not create another intent.
- `409`: show the validation reason; the baton did not advance.
- `500`: show a retryable service/network error; do not assume the payment failed.
- App reload: reload the public state and reconcile the active pending intent.

Never display a completed handoff merely because the wallet dialog closed or `/broadcast` accepted a hash.

## Payload Construction

The provider adapter uses:

```ts
await nimiq.sendBasicTransactionWithData({
  recipient,
  value: 100_000,
  data: "carryone:demo:1",
  validityStartHeight,
});
```

The local `fund-wallet.ts` helper uses the core SDK:

```ts
TransactionBuilder.newBasicWithData(
  sender,
  recipient,
  new TextEncoder().encode("carryone:demo:1"),
  100_000n,
  null,
  headHeight,
  5,
);
```

The string is encoded as UTF-8 bytes, embedded in recipient data, signed, serialized, and sent through `sendRawTransaction`.

## Testing

Run the complete test suite:

```powershell
npm test
```

Expected current result: `76` tests passing.

Run strict TypeScript checking:

```powershell
npm run typecheck
```

Build the production output:

```powershell
npm run build
```

Run the local reconciliation demo:

```powershell
npm run demo:local
curl.exe -X POST http://localhost:8788/relay/demo/reconcile
```

Coverage includes five-hop progression, finality, wrong amount, wrong sender/recipient, wrong payload, duplicate state, cancellation, stale state, pending recovery, provider cancellation, and HTTP behavior.

## Current Limitations Before Production

- `RelayStore` is in-memory; restarts lose relay state.
- The API needs production authentication and authorization.
- Multi-instance/database coordination is not implemented.
- The frontend is outside this repository.
- The watcher logs candidates but does not automatically attach them to a baton.
- The public RPC is rate-limited and has no uptime guarantee.
- A real Nimiq Pay transaction and live five-hop run still require manual testnet wallets.

Before production deployment, add persistent storage, wallet authorization, request validation, rate limiting, RPC retry handling, and HTTPS hosting.
