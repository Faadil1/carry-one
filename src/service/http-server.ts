import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { RelayValidationError } from "../core/relay.js";
import { RpcVerificationDelayedError } from "../nimiq/resilient-rpc-client.js";
import type { CanonicalRelayService } from "./canonical-relay-service.js";

export interface LegacyRelayOptions {
  /**
   * When false, legacy `/relay` mutation endpoints (intent/broadcast/cancel/
   * reconcile) are rejected 403 so the authenticated Reach Mission HTTP surface
   * cannot be bypassed. Defaults to `CARRY_ONE_LEGACY_RELAY_ENABLED` (false in
   * production).
   */
  legacyRelayEnabled?: boolean;
}

/**
 * Resolve the legacy `/relay` mutation gate. Explicit opt-in wins; otherwise the
 * legacy mutation surface is enabled outside production (dev/test/CI) and
 * disabled inside production.
 */
export function legacyRelayEnabledFromEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.CARRY_ONE_LEGACY_RELAY_ENABLED;
  if (raw !== undefined && raw.trim() !== "") {
    const normalized = raw.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return env.NODE_ENV !== "production";
}

export function createHttpServer(service: CanonicalRelayService, options: LegacyRelayOptions = {}) {
  return createServer((req, res) => {
    handleRelayRequest(service, req, res, options).catch((err) => sendError(res, err));
  });
}

/** Relay route handler, exported so the mission/application server can mount it as its /relay prefix. */
export async function handleRelayRequest(
  service: CanonicalRelayService,
  req: IncomingMessage,
  res: ServerResponse,
  options: LegacyRelayOptions = {}
) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] !== "relay" || !segments[1]) {
    return send(res, 404, { error: "NOT_FOUND", message: "Expected /relay/:batonId[...]" });
  }
  const batonId = decodeURIComponent(segments[1]);
  const tail = segments[2];

  const legacyRelayEnabled = options.legacyRelayEnabled ?? legacyRelayEnabledFromEnv();
  if (req.method === "POST" && !legacyRelayEnabled) {
    return send(res, 403, {
      error: "LEGACY_RELAY_DISABLED",
      message: "Legacy /relay mutation endpoints are disabled; use the Reach Mission HTTP surface",
    });
  }

  if (req.method === "GET" && !tail) return send(res, 200, service.getPublicView(batonId));
  if (req.method === "GET" && tail === "history") return send(res, 200, service.getHistory(batonId));
  if (req.method === "POST" && tail === "intent") {
    const body = await readJsonBody(req);
    const { currentHolder, recipient } = body as { currentHolder?: string; recipient?: string };
    if (!currentHolder || !recipient) return send(res, 400, { error: "BAD_REQUEST", message: "currentHolder and recipient are required" });
    const intent = service.initiatePass(batonId, currentHolder, recipient);
    await service.flushDurability();
    return send(res, 201, intent);
  }
  if (req.method === "POST" && tail === "broadcast") {
    const body = await readJsonBody(req);
    const { txHash } = body as { txHash?: string };
    if (!txHash) return send(res, 400, { error: "BAD_REQUEST", message: "txHash is required" });
    try {
      const hop = service.recordBroadcast(batonId, txHash);
      await service.flushDurability();
      return send(res, 201, hop);
    } catch (error) {
      // A stale-intent rejection can itself mutate relay state; persist that
      // cancellation before surfacing the error.
      await service.flushDurability();
      throw error;
    }
  }
  if (req.method === "POST" && tail === "cancel") {
    try {
      service.cancelPass(batonId);
    } finally {
      await service.flushDurability();
    }
    res.writeHead(204).end();
    return;
  }
  if (req.method === "POST" && tail === "reconcile") {
    try {
      const reconciled = await service.reconcile(batonId);
      await service.flushDurability();
      return send(res, 200, reconciled);
    } catch (error) {
      await service.flushDurability();
      throw error;
    }
  }
  return send(res, 404, { error: "NOT_FOUND", message: `No route for ${req.method} ${url.pathname}` });
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new RelayValidationError("BAD_JSON", "Request body is not valid JSON")); }
    });
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body ?? null);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

function sendError(res: ServerResponse, err: unknown) {
  if (err instanceof RelayValidationError) {
    return send(res, 409, { error: err.reason, message: err.message });
  }
  if (err instanceof RpcVerificationDelayedError) {
    return send(res, 503, {
      error: "VERIFICATION_DELAYED",
      message: "Nimiq verification is temporarily delayed. The pass remains pending; custody has not changed.",
    });
  }
  const message = err instanceof Error ? err.message : String(err);
  send(res, 500, { error: "INTERNAL_ERROR", message });
}
