# Carry One — Sip & Show Live Talk Track

Date: 2026-09-09
Status: live presentation script; demo-only claim boundary applies

## 60–90 second talk track

Hi everyone — I’m Faadil, and this is Carry One.

The problem we’re solving is simple: warm introductions and community handoffs disappear into private messages. After the first person forwards something, you usually have no durable proof of who moved it, whether it stalled, or whether it ever reached the intended destination.

Carry One turns that into a destination-bound human route.

You create a mission for a known, consenting destination. The current holder chooses one person who can move it closer. That person explicitly accepts, and only then the holder sends exactly 1 NIM. The 1 NIM is not a reward or a prize — it is the verified baton for the handoff.

The important part is that the route only advances after independent finality verification. A click, an invitation acceptance, or a transaction hash is not enough. Only FINAL changes custody.

So the core loop is:
Create a mission -> choose a bridge -> bridge accepts -> pass 1 NIM -> verify FINAL -> next holder -> eventually ARRIVED.

What you’re seeing today is our clickable product demo, so the flow is simulated and no wallet/network writes are happening in demo mode. The real testnet flow is the next gate we’re closing this week.

The piece we think becomes the product’s proof artifact is the verified route: a privacy-safe receipt showing that the mission actually moved through consenting human bridges and reached its destination.

What we’d especially love feedback on is: does the destination-bound routing concept feel immediately clear, and what would make you trust or want to use a verified route like this?

## Click path while speaking

1. Home: explain the structural problem and destination-bound promise.
2. Create Mission: target label, private target wallet, purpose/ask, consent.
3. Choose next bridge: show that the holder chooses the next human bridge; no automatic routing.
4. Bridge Invitation: emphasize explicit consent before any transfer.
5. Pass 1 NIM: explain exact 1 NIM baton and FINAL-only custody.
6. Route / Arrival: explain verified path and future Route Receipt.

## If asked why Nimiq / why 1 NIM

Nimiq Pay is not just checkout here. Wallet consent, the 1 NIM transfer, transaction data and finality are part of the product state machine. The 1 NIM baton makes each human handoff independently verifiable without turning the route into a reward economy.

## If asked whether this is already live on testnet

Not yet as a full end-to-end proof. The clickable demo is live, the frontend and PostgreSQL foundation are merged, and we are closing the secure HTTP integration now. We will only claim the real testnet E2E after actual Nimiq Pay confirmations and FINAL -> ARRIVED are observed.

## Do not say

- Do not say the demo is the real testnet run.
- Do not say 1 NIM is a reward, investment or prize.
- Do not pitch Carry One as a generic pay-it-forward chain.
- Do not lead with Postgres/HMAC/RPC/test counts unless asked.

## One-line positioning

Carry One turns a warm-introduction chain into a consented, finality-verified human route to a defined destination.
