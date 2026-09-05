import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { RelayValidationError } from "../core/relay.js";
import { RpcVerificationDelayedError } from "../nimiq/resilient-rpc-client.js";
import type { CanonicalRelayService } from "./canonical-relay-service.js";

export function createHttpServer(service: CanonicalRelayService) {
  return createServer((req, res) => {
    handle(service, req, res).catch((err) => sendError(res, err));
  });
}

async function handle(service: CanonicalRelayService, req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] !== "relay" || !segments[1]) {
    return send(res, 404, { error: "NOT_FOUND", message: "Expected /relay/:batonId[...]" });
  }
  const batonId = decodeURIComponent(segments[1]);
  const tail = segments[2];

  if (req.method === "GET" && !tail) return send(res, 200, service.getPublicView(batonId));
  if (req.method === "GET" && tail === "history") return send(res, 200, service.getHistory(batonId));
  if (req.method === "POST" && tail === "intent") {
    const body = await readJsonBody(req);
    const { currentHolder, recipient } = body as { currentHolder?: string; recipient?: string };
    if (!currentHolder || !recipient) return send(res, 400, { error: "BAD_REQUEST", message: "currentHolder and recipient are required" });
    return send(res, 201, service.initiatePass(batonId, currentHolder, recipient));
  }
  if (req.method === "POST" && tail === "broadcast") {
    const body = await readJsonBody(req);
    const { txHash } = body as { txHash?: string };
    if (!txHash) return send(res, 400, { error: "BAD_REQUEST", message: "txHash is required" });
    return send(res, 201, service.recordBroadcast(batonId, txHash));
  }
  if (req.method === "POST" && tail === "cancel") {
    service.cancelPass(batonId);
    res.writeHead(204).end();
    return;
  }
  if (req.method === "POST" && tail === "reconcile") return send(res, 200, await service.reconcile(batonId));
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
