import { randomBytes } from "node:crypto";
import { init as initMiniAppSdk } from "@nimiq/mini-app-sdk";
import type { ErrorResponse, NimiqProvider } from "@nimiq/mini-app-sdk";

/**
 * BROWSER/WEBVIEW ONLY. This wraps the provider `window.nimiq` injects when
 * the Carry One Mini App is running inside Nimiq Pay (the PRD's "Nimiq
 * Provider" box). It has no meaning on the server — the canonical relay
 * service never imports this file; it only ever reads the chain via
 * `./rpc-client.ts`. Do not construct `MiniAppSdkPayProvider` outside a Mini
 * App page context.
 */
export interface PassPaymentRequest {
  recipient: string;
  amountLuna: number;
  /** Optional compact baton/sequence tag — see `core/types.ts#batonDataTag`. */
  data?: string;
  validityStartHeight?: number;
}

export interface PassPaymentResult {
  txHash: string;
}

/**
 * Thrown when Nimiq Pay's native approval dialog is cancelled, or the
 * provider otherwise refuses the request. The SDK's `sendBasicTransaction*`
 * methods resolve (rather than reject) with an `ErrorResponse` object in
 * that case — this class re-surfaces that as a normal thrown error so
 * callers can use one control-flow path (try/catch) for both cases.
 */
export class UserCancelledPaymentError extends Error {
  constructor(public providerError: ErrorResponse["error"]) {
    super(`Nimiq Pay payment was not completed: ${providerError.type} — ${providerError.message}`);
  }
}

/** Transport-agnostic contract the relay/UI code depends on — swap in a mock for tests. */
export interface NimiqPayProvider {
  sendPass(request: PassPaymentRequest): Promise<PassPaymentResult>;
}

function isErrorResponse(x: string | ErrorResponse): x is ErrorResponse {
  return typeof x === "object" && x !== null && "error" in x;
}

/**
 * Real adapter over `@nimiq/mini-app-sdk`'s injected `NimiqProvider`.
 *
 * CAVEAT (verify before shipping): the SDK's shipped `.d.ts` documents every
 * `send*` method — including staking methods that clearly never touch this
 * flow — with the identical comment "@returns The serialized transaction",
 * which reads as boilerplate rather than a precise per-method contract. We
 * treat the resolved string as the broadcast transaction hash: that matches
 * standard wallet-provider convention for a method that both signs AND
 * *sends*, and it's the only value the relay actually needs (a handle to
 * hand to `NimiqRpcClient.getTransactionByHash`). If a real send comes back
 * with something that isn't a hash, `looksLikeTxHash` below will flag it
 * loudly instead of silently mis-tracking the hop.
 */
export class MiniAppSdkPayProvider implements NimiqPayProvider {
  private providerPromise: Promise<NimiqProvider> | null = null;

  constructor(private initTimeoutMs = 10_000) {}

  private provider(): Promise<NimiqProvider> {
    if (!this.providerPromise) {
      this.providerPromise = initMiniAppSdk({ timeout: this.initTimeoutMs });
    }
    return this.providerPromise;
  }

  async sendPass({ recipient, amountLuna, data, validityStartHeight }: PassPaymentRequest): Promise<PassPaymentResult> {
    const nimiq = await this.provider();

    const result = data
      ? await nimiq.sendBasicTransactionWithData({ recipient, value: amountLuna, data, validityStartHeight })
      : await nimiq.sendBasicTransaction({ recipient, value: amountLuna, validityStartHeight });

    if (isErrorResponse(result)) {
      throw new UserCancelledPaymentError(result.error);
    }
    if (!looksLikeTxHash(result)) {
      throw new Error(
        `Nimiq Pay send* returned a value that doesn't look like a transaction hash: "${result}". ` +
          `The SDK's own docs are ambiguous here (see MiniAppSdkPayProvider's doc comment) — re-verify ` +
          `against a real Nimiq Pay send before trusting this path.`
      );
    }
    return { txHash: result };
  }
}

/** Nimiq transaction hashes are 32-byte Blake2b digests, i.e. 64 lowercase hex chars. */
function looksLikeTxHash(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}

/** In-memory stand-in for tests and local development, no Nimiq Pay runtime required. */
export class MockPayProvider implements NimiqPayProvider {
  private nextHash: string | (() => string) | null = null;
  private nextError: ErrorResponse["error"] | null = null;

  /** Next call to sendPass resolves with this hash (or an auto-generated one if omitted). */
  queueApproval(hash?: string) {
    this.nextHash = hash ?? (() => randomBytes(32).toString("hex"));
    this.nextError = null;
  }

  /** Next call to sendPass resolves as if the user dismissed the native dialog. */
  queueCancellation(error: ErrorResponse["error"] = { type: "USER_REJECTED", message: "User closed the approval dialog" }) {
    this.nextError = error;
    this.nextHash = null;
  }

  async sendPass(_request: PassPaymentRequest): Promise<PassPaymentResult> {
    if (this.nextError) {
      const err = this.nextError;
      this.nextError = null;
      throw new UserCancelledPaymentError(err);
    }
    if (this.nextHash) {
      const hash = typeof this.nextHash === "function" ? this.nextHash() : this.nextHash;
      this.nextHash = null;
      return { txHash: hash };
    }
    throw new Error("MockPayProvider.sendPass called without queueApproval()/queueCancellation() first");
  }
}
