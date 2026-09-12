import { init } from "/vendor/nimiq-mini-app-sdk.js";

let providerPromise;

export function getNimiqProvider() {
  if (!providerPromise) providerPromise = init({ timeout: 6000 });
  return providerPromise;
}
