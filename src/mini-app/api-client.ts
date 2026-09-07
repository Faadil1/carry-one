export interface SignatureEnvelope {
  challenge_id: string;
  public_key: string;
  signature: string;
}

export interface ChallengeResponse {
  challenge_id?: string;
  id?: string;
  canonical_message?: string;
  message?: string;
  expires_at?: string;
  expiresAt?: string;
}

export interface CarryOneApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function signedBody(auth: SignatureEnvelope, fields: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...fields, challenge_id: auth.challenge_id, public_key: auth.public_key, signature: auth.signature };
}

export class CarryOneApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: CarryOneApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  issueChallenge(input: { wallet: string; action: string; mission_id?: string | null; invitation_id?: string | null; sequence?: number }): Promise<ChallengeResponse> {
    return this.request("/auth/challenge", { method: "POST", body: input });
  }

  createMission(input: Record<string, unknown> & { auth: SignatureEnvelope }): Promise<unknown> {
    const { auth, ...fields } = input;
    return this.request("/missions", { method: "POST", body: signedBody(auth, fields) });
  }

  getMission(missionId: string, viewToken?: string): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}`, { viewToken });
  }

  createInvitation(missionId: string, input: Record<string, unknown> & { auth: SignatureEnvelope }): Promise<unknown> {
    const { auth, ...fields } = input;
    return this.request(`/missions/${encodeURIComponent(missionId)}/invitations`, { method: "POST", body: signedBody(auth, fields) });
  }

  getInvitation(inviteToken: string): Promise<unknown> {
    return this.request(`/i/${encodeURIComponent(inviteToken)}`);
  }

  acceptInvitation(inviteToken: string, input: { auth: SignatureEnvelope; candidate_display_label?: string }): Promise<unknown> {
    return this.request(`/i/${encodeURIComponent(inviteToken)}/accept`, {
      method: "POST",
      body: signedBody(input.auth, { candidate_display_label: input.candidate_display_label }),
    });
  }

  declineInvitation(inviteToken: string): Promise<unknown> {
    return this.request(`/i/${encodeURIComponent(inviteToken)}/decline`, { method: "POST", body: {} });
  }

  authorizePass(missionId: string, input: { invitation_id: string; auth: SignatureEnvelope }): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/pass-intent`, {
      method: "POST",
      body: signedBody(input.auth, { invitation_id: input.invitation_id }),
    });
  }

  /** Active Mission HTTP branch records the broadcast at /missions/:id/broadcast. */
  recordBroadcast(missionId: string, invitationId: string, txHash: string): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/broadcast`, {
      method: "POST",
      body: { invitation_id: invitationId, tx_hash: txHash },
    });
  }

  reconcile(missionId: string): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/reconcile`, { method: "POST", body: {} });
  }

  private async request(path: string, options: { method?: string; body?: unknown; viewToken?: string } = {}): Promise<any> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    // Kept as a client boundary for the secure route-follow capability. The
    // active backend branch must enforce this token before this feature can be
    // called production-ready; the client never falls back to spoofable X-Wallet.
    if (options.viewToken) headers.Authorization = `Bearer ${options.viewToken}`;
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await response.text();
    const payload = text ? safeJson(text) : null;
    if (!response.ok) {
      const code = payload && typeof payload === "object" && "error" in payload ? String(payload.error) : `HTTP_${response.status}`;
      const message = payload && typeof payload === "object" && "message" in payload ? String(payload.message) : response.statusText;
      throw new CarryOneApiError(code, message, response.status);
    }
    return payload;
  }
}

export class CarryOneApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
    this.name = "CarryOneApiError";
  }
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); }
  catch { return { error: "INVALID_JSON_RESPONSE", message: "Carry One API returned non-JSON content" }; }
}
