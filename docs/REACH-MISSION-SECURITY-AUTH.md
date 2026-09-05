# Carry One — Security, Wallet Authorization & Blind-Spot Threat Model

Date: 2026-09-05  
Applies to: Reach Mission MVP

## 1. Authority model

Wallet signatures authorize holder actions; the blockchain authoritatively determines transfer finality. Browser sessions, invite links, device ids, display names, client-selected accounts and submitted tx hashes are never sufficient authority by themselves.

## 2. Signed actions

Canonical challenges remain domain-separated under `carry-one:v1`, TTL 5 minutes, >=128-bit random nonce, exact wallet/action/mission/invitation/sequence binding and atomic one-time consumption. Public key must derive to the challenged Nimiq address.

Signed actions: CREATE_MISSION, CREATE_INVITATION, ACCEPT_INVITATION, WITHDRAW_INVITATION, AUTHORIZE_PASS, CANCEL_MISSION.

Token-only DECLINE remains allowed because it cannot move custody or funds.

## 3. Target policy and anti-spam

Cycle-II missions are intentionally limited to a **known target wallet** and require the creator to attest `target_consent_confirmed=true`. This is a policy guard, not cryptographic evidence that the target signed consent.

Before broad public scaling, add stronger target controls such as target-signed consent/pre-registration and block/opt-out handling. Never represent the current boolean as verified identity or unique-human proof.

## 4. Invite capabilities

Invite tokens use >=256 bits entropy, are stored only as SHA-256 hashes, expire by default in 12h and cannot authorize payment. Unbound invitations bind the first valid wallet-signed acceptance; pre-bound invitations require exact wallet match. The holder sees the bound wallet fingerprint and separately signs AUTHORIZE_PASS.

Native Nimiq Pay deeplinks may carry the private Carry One HTTPS invite URL, but no target wallet or mutation secret is placed in the URL beyond the existing opaque invite capability.

## 5. Multi-account Nimiq Pay threat

The Mini App provider can list accounts, but the basic send method does not let Carry One force an explicit sender address. Therefore:

1. client preflights that the canonical expected-holder wallet is present in `listAccounts()`;
2. UI tells the user which wallet must be used;
3. this preflight is **not** trusted as authorization;
4. after broadcast, independent RPC verification requires actual tx sender = canonical holder;
5. wrong sender -> INVALID, custody unchanged.

A real multi-account Nimiq Pay device test is required before Early Access.

## 6. Opaque on-chain hop commitment

Reach Mission does not write clear `carryone:<mission>:<sequence>` metadata on-chain. AUTHORIZE_PASS creates a random-nonce-bound opaque commitment:

`co:v1:<sha256-base64url-commitment>`

It binds mission, sequence, holder, accepted recipient and random pass nonce without revealing those values in recipient data. It must fit Nimiq's transaction-data limit and is mandatory/exact for canonical Reach Mission passes.

This improves metadata privacy and binding but **does not make a Nimiq transfer private**. Sender, recipient, value and transaction existence remain public blockchain information. Carry One must not claim transaction anonymity.

## 7. Pass verification

A canonical pass requires:
1. signed AUTHORIZE_PASS by current holder;
2. durable pass intent;
3. accepted bridge wallet;
4. exactly 100000 Luna recipient value;
5. explicit zero-luna fee requested by the MVP client;
6. exact opaque `co:v1` commitment;
7. returned tx hash treated as claim;
8. independent RPC lookup;
9. exact actual sender and recipient;
10. global tx-hash uniqueness;
11. required finality;
12. atomic/idempotent mission projection.

The zero-fee request is intended to let a bridge holding exactly the received 1 NIM forward that full 1 NIM. A real exact-balance Nimiq Pay test remains required before public release.

## 8. Route-loop defense

A wallet already present in FINAL route history cannot become a recipient again in the same mission. The application rejects this before pass authorization; production PostgreSQL also uses one participant row per `(mission_id, wallet)` as a database-level invariant.

This prevents A -> B -> C -> A loops and discourages artificial hop inflation. It is not a unique-human mechanism: one person can own multiple wallets, and Carry One never claims otherwise.

## 9. Stalled holder behavior

If a canonical holder stops participating, Carry One may display the mission as STALLED after inactivity. STALLED is not a custody transition. No server, creator or previous holder may reclaim/reassign the 1 NIM. Users may create a completely new mission/route to the same consented destination.

## 10. RPC availability

A single RPC must not become a false transaction-failure oracle. Deployed verification should use multiple read endpoints. If all configured endpoints fail, Carry One returns `VERIFICATION_DELAYED`, keeps the pass pending and leaves custody unchanged. It must not mark a transaction INVALID solely because RPC infrastructure is unavailable.

## 11. Target-wallet privacy at rest/API

- AES-256-GCM authenticated encryption at rest;
- separate keyed HMAC-SHA256 for equality/arrival matching;
- no plaintext target wallet in ordinary DTOs/logs/analytics/tokens/client hydration;
- no plain hash as a confidentiality mechanism;
- participant UI uses target label and wallet fingerprints only.

## 12. Logging and analytics

Allowed aggregate evidence: mission count, invitation conversions, FINAL hops, arrival rate, timings and unique participating wallet count.

Never log plaintext targets, invite tokens, full signatures, private why_you, challenge nonces or a raw list of analytics wallets. `unique wallet` must never be relabeled as `unique human`.

## 13. Early Access gate

Still required before public Early Access:
- production PostgreSQL transactional/row-lock adapter;
- production HTTP validation/rate limiting/idempotency;
- secret/privacy review;
- real multi-account Nimiq Pay sender test;
- real exactly-1-NIM + data + explicit fee=0 test from an exactly-1-NIM wallet;
- real native invite-deeplink device test.
