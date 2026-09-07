# Carry One — PostgreSQL Runtime Boundary

Date: 2026-09-07
Status: MVP vertical-slice deployment contract

The PostgreSQL adapters make mission, invitation, challenge, pass-intent and hop state durable across process restart. They do **not** yet make the relay state machine safe for arbitrary active-active writers.

## Cycle II deployment rule

Run exactly **one application writer replica** for Carry One during the MVP vertical slice and Early Access candidate testing. PostgreSQL may be managed/HA underneath, but only one Carry One process may accept state-changing requests at a time.

Why: `PgRelayStore` deliberately reuses the canonical in-memory fail-closed relay state machine and persists its snapshots to PostgreSQL. Database uniqueness and trigger guards provide defense-in-depth, but cross-process sequencing is not yet a database-native state machine.

## Durability-before-ack

`CanonicalRelayService.flushDurability()` is the request-boundary barrier. Reach Mission authorization, broadcast recording and reconciliation await it before returning success or projecting a FINAL hop into mission custody. A PostgreSQL persistence error therefore fails the request instead of acknowledging volatile state.

## Database guards

Migration `002_postgres_concurrency_guards.sql` adds:

- mission-row locking and canonical holder/sequence revalidation at invitation insert;
- route-reentry rejection when an unbound invite becomes ACCEPTED;
- a hard participant update rejection so the historical `ON CONFLICT` path cannot silently admit a repeated finalized participant.

These guards are defense-in-depth. Application-level holder, sequence, invitation, route-loop and finality checks remain authoritative too.

## Not claimed yet

- active-active/multi-writer safety;
- horizontal write scaling;
- failover between simultaneous writer replicas without external leader election.

Those remain post-Cycle-II work unless a later gate explicitly promotes a DB-native relay transaction protocol.
