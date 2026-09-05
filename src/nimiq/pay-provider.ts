import { randomBytes } from "node:crypto";
import { init as initMiniAppSdk } from "@nimiq/mini-app-sdk";
import type { ErrorResponse, NimiqProvider } from "@nimiq/mini-app-sdk";
import { ONE_NIM_IN_LUNA } from "../core/types.js";

/** Reach Mission payment request. The server-authorized opaque commitment is mandatory. */
export interface PassPaymentRequest {
  expectedSender: string;
  recipient: string;
  amountLuna: number;
  data: string;
  validityStartHeight?: number;
  /** Carry One defaults to zero so a bridge holding exactly the received 1 NIM can forward it. */
  feeLuna?: number;
}

export interface PassPaymentResult {
  txHash: string;
}

export class UserCancelledPaymentError extends Error {
  constructor(public providerError: ErrorResponse["error"]) {
    super(`Nimiq Pay payment was not completed: ${providerError.type} — ${providerError.message}`);
  }
}

export class WrongWalletSelectionError extends Error {
  constructor(public expectedSender: string) {
    super(`The canonical holder wallet ${shortWallet(expectedSender)} is not available in this Nimiq Pay session. Select/import that wallet before passing.`);
  }
}

export interface NimiqPayProvider {
  sendPass(request: PassPaymentRequest): Promise<PassPaymentResult>;
}

function isErrorResponse(x: string | ErrorResponse): x is ErrorResponse {
  return typeof x === "object" && x !== null && "error" in x;
}

function normalizedWalletText(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function shortWallet(value: string): string {
  const clean = normalizedWalletText(value);
  return clean.length <= 10 ? clean : `${clean.slice(0, 6)}…${clean.slice(-4)}`;
}

/**
 * Real adapter over Nimiq Pay's injected provider. The provider cannot be
 * instructed which sender account to use for sendBasicTransactionWithData,
 * so Carry One performs an explicit account preflight. The server still
 * independently rejects a transaction whose actual sender is not the
 * canonical holder — this client check is UX protection, not trust.
 */
export class MiniAppSdkPayProvider implements NimiqPayProvider {
  private providerPromise: Promise<NimiqProvider> | null = null;

  constructor(private initTimeoutMs = 10_000) {}

  private provider(): Promise<NimiqProvider> {
    if (!this.providerPromise) this.providerPromise = initMiniAppSdk({ timeout: this.initTimeoutMs });
    return this.providerPromise;
  }

  async sendPass({
    expectedSender,
    recipient,
    amountLuna,
    data,
    validityStartHeight,
    feeLuna = 0,
  }: PassPaymentRequest): Promise<PassPaymentResult> {
    if (amountLuna !== ONE_NIM_IN_LUNA) {
      throw new Error(`Carry One canonical passes must send exactly ${ONE_NIM_IN_LUNA} Luna`);
    }
    if (!data.startsWith("co:v1:")) {
      throw new Error("Carry One canonical passes require an opaque co:v1 hop commitment");
    }
    if (feeLuna !== 0) {
      throw new Error("Carry One MVP requires an explicit zero-luna network fee so the received 1 NIM can be forwarded intact");
    }

    const nimiq = await this.provider();
    const accounts = await nimiq.listAccounts();
    if (!Array.isArray(accounts) || !accounts.some((account) => normalizedWalletText(account) === normalizedWalletText(expectedSender))) {
      throw new WrongWalletSelectionError(expectedSender);
    }

    const result = await nimiq.sendBasicTransactionWithData({
      recipient,
      value: amountLuna,
      fee: feeLuna,
      data,
      validityStartHeight,
    });

    if (isErrorResponse(result)) throw new UserCancelledPaymentError(result.error);
    if (!looksLikeTxHash(result)) {
      throw new Error(`Nimiq Pay sendBasicTransactionWithData returned a value that doesn't look like a transaction hash: "${result}"`);
    }
    return { txHash: result };
  }
}

function looksLikeTxHash(value: string): boolean {
  return /^[0-9a-f]{64}$/i.test(value);
}

/** In-memory stand-in for tests and local development. */
export class MockPayProvider implements NimiqPayProvider {
  private nextHash: string | (() => string) | null = null;
  private nextError: ErrorResponse["error"] | null = null;

  queueApproval(hash?: string) {
    this.nextHash = hash ?? (() => randomBytes(32).toString("hex"));
    this.nextError = null;
  }

  queueCancellation(error: ErrorResponse["error"] = { type: "USER_REJECTED", message: "User closed the approval dialog" }) {
    this.nextError = error;
    this.nextHash = null;
  }

  async sendPass(request: PassPaymentRequest): Promise<PassPaymentResult> {
    if (request.amountLuna !== ONE_NIM_IN_LUNA || !request.data.startsWith("co:v1:") || (request.feeLuna ?? 0) !== 0) {
      throw new Error("MockPayProvider received a non-canonical Carry One pass request");
    }
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
