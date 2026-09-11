import { Container, getContainer } from "@cloudflare/containers";
import { env as runtimeEnv } from "cloudflare:workers";

const REQUIRED_RUNTIME_CONFIG = [
  "CARRY_ONE_DATABASE_URL",
  "CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL",
  "CARRY_ONE_TARGET_HMAC_KEY_B64URL",
  "CARRY_ONE_CANONICAL_ORIGIN",
];

export class NimCarryContainer extends Container {
  defaultPort = 8787;
  sleepAfter = "2h";
  envVars = {
    NODE_ENV: "production",
    PORT: "8787",
    CARRY_ONE_REPOSITORY: "postgres",
    CARRY_ONE_LEGACY_RELAY_ENABLED: "false",
    CARRY_ONE_DATABASE_URL: runtimeEnv.CARRY_ONE_DATABASE_URL,
    CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL: runtimeEnv.CARRY_ONE_TARGET_ENCRYPTION_KEY_B64URL,
    CARRY_ONE_TARGET_HMAC_KEY_B64URL: runtimeEnv.CARRY_ONE_TARGET_HMAC_KEY_B64URL,
    CARRY_ONE_CANONICAL_ORIGIN: runtimeEnv.CARRY_ONE_CANONICAL_ORIGIN,
    NIMIQ_RPC_URL: runtimeEnv.NIMIQ_RPC_URL || "https://rpc.testnet.nimiqwatch.com",
    NIMIQ_RPC_URLS: runtimeEnv.NIMIQ_RPC_URLS || runtimeEnv.NIMIQ_RPC_URL || "https://rpc.testnet.nimiqwatch.com",
  };
}

function acceptsJson(request) {
  return (request.headers.get("accept") || "").toLowerCase().includes("application/json");
}

function shouldReachBackend(request, url) {
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (path === "/health" || path === "/usage") return true;
  if (path.startsWith("/auth/") || path.startsWith("/relay/")) return true;

  // `/mission/*` is always an SPA route; the canonical HTTP API is `/missions/*`.
  if (path === "/missions" || path.startsWith("/missions/")) {
    return method !== "GET" || acceptsJson(request);
  }

  // `/i/:token` is intentionally both an invite SPA route and an API endpoint.
  // Browser navigation wants HTML; the app's fetch() explicitly asks for JSON.
  if (path.startsWith("/i/")) {
    return method !== "GET" || acceptsJson(request);
  }

  return false;
}

function missingRuntimeConfig(env) {
  return REQUIRED_RUNTIME_CONFIG.filter((name) => !env[name]);
}

async function deepRuntimeHealth(backend, request, env, backendResponse) {
  const relayProbeUrl = new URL("/relay/__nimcarry_runtime_smoke__/intent", request.url);
  const relayResponse = await backend.fetch(
    new Request(relayProbeUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: "{}",
    })
  );

  let relayPayload = null;
  try {
    relayPayload = await relayResponse.clone().json();
  } catch {
    relayPayload = null;
  }

  const legacyRelayGatePass =
    relayResponse.status === 403 && relayPayload?.error === "LEGACY_RELAY_DISABLED";
  const pass = backendResponse.ok && legacyRelayGatePass;

  return Response.json(
    {
      status: pass ? "ok" : "degraded",
      runtime: {
        backend_http_status: backendResponse.status,
        repository_mode: "postgres",
        mission_http_bindings: "enabled",
        canonical_origin: env.CARRY_ONE_CANONICAL_ORIGIN,
        container_identity: "nimcarry-primary",
        max_instances_for_proof_gate: 1,
        legacy_relay_gate: {
          pass: legacyRelayGatePass,
          status: relayResponse.status,
          error: relayPayload?.error ?? null,
        },
      },
    },
    {
      status: pass ? 200 : 503,
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!shouldReachBackend(request, url)) {
      return env.ASSETS.fetch(request);
    }

    const missing = missingRuntimeConfig(env);
    if (missing.length > 0) {
      return Response.json(
        {
          error: "RUNTIME_NOT_CONFIGURED",
          message: "NimCarry Cloudflare runtime secrets are incomplete.",
          missing,
        },
        { status: 503 }
      );
    }

    // A stable Durable Object/container name keeps every API request in the
    // proof window on one process-local route-view/broadcast capability store.
    const backend = getContainer(env.NIMCARRY_API, "nimcarry-primary");
    const backendResponse = await backend.fetch(request);

    // `?deep=1` is a deterministic, read-safe production smoke check. The
    // synthetic legacy-relay POST is expected to fail closed with 403 before
    // request-body validation or any state mutation can occur.
    if (
      request.method.toUpperCase() === "GET" &&
      url.pathname === "/health" &&
      url.searchParams.get("deep") === "1" &&
      backendResponse.ok
    ) {
      return deepRuntimeHealth(backend, request, env, backendResponse);
    }

    return backendResponse;
  },
};
