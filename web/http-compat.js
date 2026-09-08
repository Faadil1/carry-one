(() => {
  "use strict";

  // Compatibility layer for Opeyemi's active `feat/mission-http-bindings`
  // branch. It keeps the UI decoupled from transport details while that branch
  // is still unmerged. It NEVER grants authority: every sensitive mutation is
  // still protected by the server's wallet-signature verifier.
  const nativeFetch = window.fetch.bind(window);
  const missionWallet = new Map();
  const passByMission = new Map();
  let pendingChallenge = null;

  function jsonBody(init) {
    if (!init?.body || typeof init.body !== "string") return null;
    try { return JSON.parse(init.body); } catch { return null; }
  }

  function flattenSignedEnvelope(body) {
    if (!body || typeof body !== "object" || !body.auth || typeof body.auth !== "object") return body;
    const { auth, ...rest } = body;
    return {
      ...rest,
      challenge_id: auth.challenge_id,
      public_key: auth.public_key,
      signature: auth.signature,
    };
  }

  function removeEmptyOptionalFields(body) {
    if (!body || typeof body !== "object") return body;
    const next = { ...body };
    for (const key of ["creator_display_label", "candidate_display_label"]) {
      if (next[key] === "") delete next[key];
    }
    return next;
  }

  function normalizeRoute(route) {
    if (!Array.isArray(route)) return [];
    return route
      .filter((entry) => {
        if (entry && typeof entry === "object" && "status" in entry) return entry.status === "CONFIRMED";
        return true;
      })
      .map((entry) => {
        if (!entry || typeof entry !== "object" || !("current_holder" in entry) || !("recipient" in entry)) return entry;
        const hash = entry.tx_hash || "";
        return {
          sequence: entry.sequence,
          from: { display_label: null, wallet_fingerprint: entry.current_holder?.wallet_fingerprint || "private" },
          to: { display_label: null, wallet_fingerprint: entry.recipient?.wallet_fingerprint || "private" },
          finalized_at: entry.confirmed_at,
          tx_hash_short: hash.length > 14 ? `${hash.slice(0, 7)}…${hash.slice(-5)}` : (hash || "verified tx"),
        };
      })
      .sort((a, b) => Number(a.sequence) - Number(b.sequence));
  }

  function normalizeMission(mission) {
    if (!mission || typeof mission !== "object") return mission;
    return { ...mission, route: normalizeRoute(mission.route) };
  }

  function normalizePayload(path, method, payload) {
    if (!payload || typeof payload !== "object") return payload;

    if (method === "POST" && /^\/missions\/[^/]+\/invitations$/.test(path) && payload.invitation) {
      return {
        ...payload.invitation,
        mission_id: payload.mission_id || payload.invitation.mission_id,
        invite_token: payload.invite_token,
        invite_url: payload.web_invite_url,
        web_invite_url: payload.web_invite_url,
        nimiq_pay_custom_scheme: payload.nimiq_pay_custom_scheme,
      };
    }

    if (method === "GET" && /^\/i\/[^/]+$/.test(path) && payload.invitation) {
      return {
        ...payload.invitation,
        target_label: payload.mission?.target_label,
        mission_note: payload.mission?.mission_note,
        finalized_hop_count: payload.mission?.finalized_hop_count ?? 0,
        mission: normalizeMission(payload.mission),
      };
    }

    if (/^\/missions\/[^/]+$/.test(path) && method === "GET") return normalizeMission(payload);
    if (method === "POST" && path === "/missions") return normalizeMission(payload);

    if (method === "POST" && /^\/missions\/[^/]+\/reconcile$/.test(path) && payload.mission) {
      const mission = normalizeMission(payload.mission);
      const missionId = path.split("/")[2];
      const expected = passByMission.get(missionId)?.sequence;
      if (expected && Number(mission?.sequence) >= Number(expected)) {
        return { ...payload, mission, hop: { status: "FINAL", sequence: expected } };
      }
      return { ...payload, mission };
    }

    return payload;
  }

  async function rebuildResponse(response, payload) {
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "application/json");
    return new Response(payload === null ? "" : JSON.stringify(payload), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  window.fetch = async function carryOneCompatibleFetch(input, init = {}) {
    const requestUrl = typeof input === "string" ? new URL(input, location.href) : new URL(input.url, location.href);
    let path = requestUrl.pathname;
    const method = String(init.method || (typeof input !== "string" ? input.method : "GET") || "GET").toUpperCase();
    let body = jsonBody(init);
    const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));

    if (path === "/auth/challenge" && method === "POST" && body) {
      pendingChallenge = { wallet: body.wallet, action: body.action, missionId: body.mission_id || null, invitationId: body.invitation_id || null, sequence: body.sequence ?? 0 };
      if (pendingChallenge.missionId && pendingChallenge.wallet) missionWallet.set(pendingChallenge.missionId, pendingChallenge.wallet);
    }

    body = removeEmptyOptionalFields(flattenSignedEnvelope(body));

    // The active Mission HTTP branch accepts the broadcast claim at
    // /missions/:missionId/broadcast and binds it to invitation_id.
    const legacyBroadcast = path.match(/^\/missions\/([^/]+)\/pass-intent\/[^/]+\/broadcast$/);
    if (legacyBroadcast) {
      const missionId = decodeURIComponent(legacyBroadcast[1]);
      const pass = passByMission.get(missionId);
      if (!pass?.invitationId) throw new Error("BROADCAST_BINDING_MISSING: no accepted invitation is bound to this local pass intent.");
      path = `/missions/${encodeURIComponent(missionId)}/broadcast`;
      requestUrl.pathname = path;
      body = { invitation_id: pass.invitationId, tx_hash: body?.tx_hash };
    }

    const missionRead = path.match(/^\/missions\/([^/]+)$/);
    if (method === "GET" && missionRead && !headers.has("Authorization")) {
      // Current backend branch uses X-Wallet only to personalize read-side UI
      // role/action derivation. Mutation authority still requires signatures.
      // Never use this as a route-follow authorization substitute.
      const localWallet = missionWallet.get(decodeURIComponent(missionRead[1]));
      if (localWallet) headers.set("X-Wallet", localWallet);
    }

    const finalInit = {
      ...init,
      method,
      headers,
      body: body === null ? init.body : JSON.stringify(body),
    };

    const response = await nativeFetch(requestUrl.toString(), finalInit);
    const text = await response.clone().text();
    if (!text) return response;
    let payload;
    try { payload = JSON.parse(text); } catch { return response; }

    if (response.ok && method === "POST" && path === "/missions" && payload?.mission_id && pendingChallenge?.wallet) {
      missionWallet.set(payload.mission_id, pendingChallenge.wallet);
    }

    const passMatch = path.match(/^\/missions\/([^/]+)\/pass-intent$/);
    if (response.ok && method === "POST" && passMatch && payload) {
      const missionId = decodeURIComponent(passMatch[1]);
      passByMission.set(missionId, {
        invitationId: body?.invitation_id,
        sequence: payload.sequence,
        intentId: payload.intent_id,
      });
    }

    return rebuildResponse(response, normalizePayload(path, method, payload));
  };
})();
