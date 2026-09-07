export interface SignatureEnvelope {
  challenge_id: string;
  wallet: string;
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
    return this.request("/missions", { method: "POST", body: input });
  }

  getMission(missionId: string, viewToken?: string): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}`, { viewToken });
  }

  createInvitation(missionId: string, input: Record<string, unknown> & { auth: SignatureEnvelope }): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/invitations`, { method: "POST", body: input });
  }

  getInvitation(inviteToken: string): Promise<unknown> {
    return this.request(`/i/${encodeURIComponent(inviteToken)}`);
  }

  acceptInvitation(inviteToken: string, input: { auth: SignatureEnvelope; candidate_display_label?: string }): Promise<unknown> {
    return this.request(`/i/${encodeURIComponent(inviteToken)}/accept`, { method: "POST", body: input });
  }

  declineInvitation(inviteToken: string): Promise<unknown> {
    return this.request(`/i/${encodeURIComponent(inviteToken)}/decline`, { method: "POST", body: {} });
  }

  authorizePass(missionId: string, input: { invitation_id: string; auth: SignatureEnvelope }): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/pass-intent`, { method: "POST", body: input });
  }

  recordBroadcast(missionId: string, intentId: string, txHash: string): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/pass-intent/${encodeURIComponent(intentId)}/broadcast`, {
      method: "POST",
      body: { tx_hash: txHash },
    });
  }

  reconcile(missionId: string): Promise<unknown> {
    return this.request(`/missions/${encodeURIComponent(missionId)}/reconcile`, { method: "POST", body: {} });
  }

  private async request(path: string, options: { method?: string; body?: unknown; viewToken?: string } = {}): Promise<any> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
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
