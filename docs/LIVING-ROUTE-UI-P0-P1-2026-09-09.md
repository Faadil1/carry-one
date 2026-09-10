# NimCarry — Living Route UI P0/P1

Date: 2026-09-09

## Objective

Implement the non-blocked P0/P1 UI improvements discovered through Sip & Ship Winning Intelligence and team feedback without touching Opeyemi-owned HTTP security work or claiming testnet proof that does not yet exist.

## P0 implemented

- Route-native NimCarry logo in the product header and browser favicon.
- Web app manifest and install branding.
- Social-preview artwork/metadata source.
- Five-step progress helper visually converted into one continuous route.
- Current baton holder visually emphasized.
- Pass proof ladder reacts to real UI status text: wallet approval -> independent verification -> FINAL/custody moved.
- Verified route hops progressively reveal from already-rendered FINAL route data.
- ARRIVED Route Receipt receives a deliberate reveal/climax treatment.
- Reduced-motion remains mandatory.

## P1 implemented

- Physical button press/hover feedback.
- Busy/loading affordance derived from the existing real busy/disabled state.
- Stronger bridge-consent copy without inventing sender identity.
- Visual empty-route state that clearly remains unverified/dashed.
- One-time automatic focus/scroll toward the ARRIVED receipt.
- Header/network micro-interactions.

## Evidence and truthfulness law

This layer is presentation-only. It does not send transactions, mutate mission custody, create FINAL state or manufacture an ARRIVED result. It reacts to state already rendered by the canonical app and uses explicit demo state only where the existing demo mode is already marked as non-network proof.

`FINAL` styling is activated only when the app notice explicitly reports verified finality/custody movement, or when finalized route entries are already present in the route view.

## Deliberately not implemented yet

- Real runtime state wiring that depends on the final merged HTTP contract.
- Production `view` capability integration.
- New broadcast capability integration in the browser shell.
- Real-device Nimiq Pay timing adjustments.
- iOS cold/warm/background/deeplink fixes.
- Raster Apple/social assets if a final production asset pipeline is preferred.
- TRACE final polish after real A -> B -> C evidence.

These remain downstream of the secure HTTP integration and testnet E2E gates.
