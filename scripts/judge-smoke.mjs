#!/usr/bin/env node

const base = (process.argv[2] || process.env.NIMCARRY_JUDGE_URL || "").replace(/\/$/, "");
if (!base) {
  console.error("Usage: node scripts/judge-smoke.mjs <base-url> or set NIMCARRY_JUDGE_URL");
  process.exit(2);
}

const checks = [];

async function get(path) {
  const url = `${base}${path}`;
  const started = Date.now();
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
  const text = await response.text();
  return { url, response, text, ms: Date.now() - started };
}

function record(name, pass, detail) {
  checks.push({ name, pass, detail });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  const root = await get("/");
  record("root-http-200", root.response.ok, `${root.response.status} in ${root.ms}ms`);
  record("public-brand-visible", /NimCarry/.test(root.text), "NimCarry must be visible in served HTML");
  record("final-only-proof-copy", /Only FINAL changes custody/.test(root.text), "judge-facing custody law must remain visible");

  const health = await get("/health.json");
  let payload = null;
  try { payload = JSON.parse(health.text); } catch {}
  record("health-http-200", health.response.ok, `${health.response.status} in ${health.ms}ms`);
  record("health-contract", payload?.service === "nimcarry-web" && payload?.status === "ok" && payload?.proof_model === "FINAL_ONLY_CUSTODY", "static judge-window health contract");
} catch (error) {
  record("request-path", false, error instanceof Error ? error.message : String(error));
}

const failed = checks.filter((check) => !check.pass);
console.log(`\nNimCarry judge smoke: ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length - failed.length}/${checks.length} checks)`);
if (failed.length > 0) process.exit(1);
