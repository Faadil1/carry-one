<div align="center">
  <div style="background:#0b1f33;padding:24px;border-radius:12px;">
    <img src="https://miniappscompetition.com/landing/nimiq-logo-white.svg" alt="Nimiq" width="180" />
  </div>
  <h1>Carry One</h1>
  <p>Verified 1 NIM relay for Nimiq Pay</p>
  <p>
    <img src="https://img.shields.io/badge/Nimiq-Testnet-2f80ed" alt="Nimiq Testnet" />
    <img src="https://img.shields.io/badge/Tests-76%20passing-2ea44f" alt="76 tests passing" />
    <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="Strict TypeScript" />
    <img src="https://img.shields.io/badge/Status-Technical%20Spike-f2c94c" alt="Technical spike" />
  </p>
</div>

# Carry One — Technical Spike (Opeyemi's track)

Nimiq integration, relay state, transaction verification, and negative tests
for [Carry One](../../..) — the Nimiq Mini Apps Cycle II relay game where
passing exactly 1 NIM *is* the game's state transition.

Status: **logic + service layer complete, 74/74 tests passing, typechecks
clean, verified against live Nimiq testnet.** What's left needs a real
Nimiq Pay install and two funded testnet wallets — see [What's NOT yet
verified](#whats-not-yet-verified) below.

## Architecture

This deliberately follows the PRD's technical shape as separate layers, not
one file, because they run in genuinely different places:

```
carry-one/
├── src/
│   ├── core/
│   │   ├── types.ts                 Domain types and 1 NIM constant
│   │   └── relay.ts                 RelayStore and validation rules
│   ├── nimiq/
│   │   ├── policy.ts                Albatross policy and finality math
│   │   ├── rpc-client.ts            Read-only Nimiq JSON-RPC client
│   │   ├── pay-provider.ts          Nimiq Pay wallet adapter
│   │   └── transaction-watcher.ts  Incoming transaction polling helper
│   ├── service/
│   │   ├── canonical-relay-service.ts
│   │   └── http-server.ts           Minimal REST API
│   └── index.ts                     Server entrypoint
├── scripts/
│   ├── demo-local.ts                Chain-free FINAL reconciliation demo
│   └── fund-wallet.ts               Local testnet sender
├── tests/                           Unit and integration tests
├── .env.example                     Environment template
├── package.json                     Scripts and dependencies
├── README.md                        Project overview
└── Carry_One_PRD_*.pdf              Product requirements
```

**Why `pay-provider.ts` and `rpc-client.ts` are separate, not one client:**
`@nimiq/mini-app-sdk`'s `init()` reads `window.nimiq`, which only exists
inside the Nimiq Pay webview. The canonical relay service runs on a server
and can never call it — a server has no wallet to authorize a spend with.
So the server only ever *reads* the chain (`rpc-client.ts`) to independently
verify what the client claims happened; only the client-side Mini App code
(Faadil's UI, importing `pay-provider.ts`) ever triggers the native approval
dialog and gets a transaction hash back. The service treats that hash as a
claim to verify via RPC, never as a fact to trust — see
`CanonicalRelayService.reconcile()`.

## The five-hop technical proof

Two levels, both passing:

1. **`tests/core/five-hop-chain.test.ts`** — pure logic, no network: proves
   the intent/validation rules are sound (fast, deterministic).
2. **`tests/service/canonical-relay-service.test.ts`** — runs the same
   W0→W1→W2→...→W5 chain through the actual service: `initiatePass` →
   `recordBroadcast` → `reconcile`, against a fake RPC client that plays the
   role of "the network" observing the tx go from unseen → included → past
   its batch's finalizing macro block. Also proves the relay **fails
   closed and recovers**: a forged/mismatched observation is marked
   `INVALID` and never advances `hop_count` or `current_holder`, but the
   intent stays open so a corrected retry still lands correctly (see that
   test for the full recovery sequence).

Negative tests (`tests/core/negative.test.ts`) cover all five PRD-required
cases: wrong amount, wrong sender/recipient, stale/duplicate intent,
cancellation, and pending recovery after the app is closed and reopened —
plus one addition: a forged on-chain baton/sequence tag (see below).

## What's new since the first pass at this spike

- **Wired to the real Nimiq Pay Provider.** `src/nimiq/pay-provider.ts`
  installs `@nimiq/mini-app-sdk` (v0.1.0, npm) and calls its actual shipped
  API — `sendBasicTransaction` / `sendBasicTransactionWithData` — not a
  guess. One correction from what the SDK's changelog implied: the public
  method is `sendBasicTransaction*`, not `sendPayment` (that name was an
  internal RPC method rename, not the app-facing API in this SDK version —
  confirmed by reading the shipped `.d.ts` directly rather than trusting the
  changelog blurb). Cancellation surfaces as a *resolved* `ErrorResponse`
  object, not a rejected promise — the adapter normalizes both into one
  `UserCancelledPaymentError` so calling code has one control-flow path.
- **`INTENT_VALIDITY_WINDOW_MS` is now derived, not guessed.** It used to be
  a flat 1-hour guess. It's now `transactionValidityWindowBlocks (7200) ×
  blockSeparationTimeMs (1000) + a 5-minute safety buffer` — i.e. at least as
  long as a broadcast transaction can legally still land on-chain. That
  matters: if the app's own staleness window were *shorter* than Nimiq's
  real tx expiry, the UI could offer a "retry" while the original transfer
  could still be included later, racing two legitimate hops against each
  other.
- **Optional on-chain baton tag.** `batonDataTag(batonId, sequence)` produces
  a compact string (e.g. `carryone:baton-1:3`) sent via
  `sendBasicTransactionWithData`'s `data` field — the PRD's "optional
  compact baton/sequence data." When present, `validateTransactionAgainstIntent`
  cross-checks it as a second, independent signal beyond sender/recipient/
  amount. Optional by design (older/plain sends won't have it), but adds
  defense in depth against a same-amount transaction that happens to match
  sender and recipient by coincidence.
- **The canonical relay service is now a runnable thing, not just logic.**
  `CanonicalRelayService` + a minimal `node:http` REST layer (no framework —
  this is five fixed endpoints, not a general API). Run it: `npm run dev`.
- **Fixed a real bug found while testing the recovery path:** `RelayStore.recordHop`
  used to unconditionally push, so a retried broadcast under the same
  still-active intent would leave the earlier (bad) hop record in place
  forever — `getHop` would keep finding the stale one. It now replaces the
  record at the same `(batonId, sequence)` slot.

## Run it

The local testnet server reads `.env` and watches the configured wallet for
incoming transactions. The committed `.env.example` shows the required keys;
keep the real `.env` file private.

```bash
NIMIQ_RPC_URL=https://rpc.testnet.nimiqwatch.com
NIMIQ_TESTNET_WALLET_ADDRESS=NQ83A24EV6QCJM6U6KFJK6THH0QXHBR837R6
NIMIQ_WATCH_INTERVAL_MS=5000
PORT=8787
```

Start the watcher with:

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run — 74/74
npm start            # starts the built relay service and wallet watcher
npm run dev          # development mode with the same .env configuration
```

When an incoming transaction is found, the server logs a JSON event with its
hash, sender, recipient, amount, block, payload, and either
`VERIFIED_CANDIDATE` or `REJECTED_PAYLOAD`. The watcher is read-only: the
transaction must still be initiated and approved in Nimiq Pay.

For a chain-free reconciliation demo, run `npm run demo:local`. It uses port
`8788` by default, seeds the `demo` baton with a valid simulated transaction,
and makes this endpoint return `FINAL`:

```bash
curl -X POST http://localhost:8788/relay/demo/reconcile
```

Example flow against the running server:

```bash
curl -X POST localhost:8787/relay/demo/intent \
  -H 'Content-Type: application/json' \
  -d '{"currentHolder":"W0","recipient":"W1"}'

curl -X POST localhost:8787/relay/demo/broadcast \
  -H 'Content-Type: application/json' -d '{"txHash":"<hash from Nimiq Pay>"}'

curl -X POST localhost:8787/relay/demo/reconcile   # call again after each block
curl localhost:8787/relay/demo                      # public view
curl localhost:8787/relay/demo/history               # public relay history
```

## Mainnet policy constants — confirmed live

`NIMIQ_MAINNET_POLICY` (`src/nimiq/policy.ts`) is now read directly from
`https://rpc.nimiqwatch.com`'s `getPolicyConstants` (2026-09-01), not
guessed. Batch shape (`blocksPerBatch`, `blockSeparationTimeMs`,
`transactionValidityWindowBlocks`) is identical to testnet; the genesis
block is not (`3,456,000` vs testnet's `3,032,010`), confirming the PRD's
warning that this constant is network-specific. `NIMIQ_POLICY` (the active
export everything computes against) is still pinned to testnet — flipping
it to mainnet is a deliberate production cutover to make alongside pointing
`HttpNimiqRpcClient` at a mainnet RPC URL, not something to do incidentally.

One field, `networkId`, is left `null` on the mainnet policy: no read-only
RPC method exposed it without an actual mainnet transaction to read it off
of (that's how testnet's `5` was originally confirmed), and nothing in this
codebase's finality/staleness math consumes it — it's informational only.
Fill it in from a real `getTransactionByHash` response once one exists.

## What's NOT yet verified

Both items below need a real signed transaction from an actual wallet
through Nimiq Pay's native approval dialog — by design, that can't be
scripted or simulated from here. The Mini App SDK explicitly keeps private
keys out of reach of the app and routes every send through a native
confirmation the app can't bypass, so closing these out needs you, not more
code:

1. **`MiniAppSdkPayProvider.sendPass` against a real Nimiq Pay send.** The
   adapter is built against the SDK's actual shipped types, and it defends
   itself (`looksLikeTxHash`) against the one thing those types leave
   genuinely ambiguous — every `send*` method's doc comment says "@returns
   The serialized transaction," worded identically across nine unrelated
   methods including staking calls that clearly never apply here, which
   reads as boilerplate rather than a precise contract. If a real send
   returns something that isn't a 64-hex-char hash, the adapter throws
   loudly instead of silently mis-tracking the hop — but confirming which
   behavior actually happens needs one real send.
2. **A real end-to-end hop:** two funded testnet wallets, one live Nimiq Pay
   send, tracked through `initiatePass` → the real `sendPass` → `reconcile`
   to `FINAL`. Everything up to "you have a hash" and everything from "you
   have a hash" onward are each proven independently (provider adapter
   tests, service tests against a fake RPC client); the join between them
   — a real hash flowing from a real send into a real RPC lookup — is the
   one thing that's still simulated. This is the PRD's actual "five-hop
   technical proof" gate (T2) — everything in this repo is what makes that
   one real run trustworthy once you can do it, not a replacement for it.
