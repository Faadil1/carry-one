import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const html = readFileSync("web/index.html", "utf8");
const js = readFileSync("web/app.js", "utf8");
const compat = readFileSync("web/http-compat.js", "utf8");
const demoUx = readFileSync("web/demo-ux.js", "utf8");
const favicon = readFileSync("web/favicon.svg", "utf8");
const css = readFileSync("web/styles.css", "utf8");

describe("static Mini App skeleton", () => {
  it("ships a mobile-first app shell without external UI/script dependencies", () => {
    expect(html).toContain('name="viewport"');
    expect(html).toContain('src="/http-compat.js"');
    expect(html.indexOf('src="/http-compat.js"')).toBeLessThan(html.indexOf('src="/app.js"'));
    expect(html).toContain('src="/demo-ux.js"');
    expect(html.indexOf('src="/app.js"')).toBeLessThan(html.indexOf('src="/demo-ux.js"'));
    expect(html).toContain('href="/styles.css"');
    expect(html).toContain('href="/favicon.svg"');
    expect(html).not.toMatch(/https:\/\/.*\.(?:js|css)/);
  });
  it("implements the real wallet challenge/sign/send boundary and explicit fee 0", () => {
    expect(js).toContain('nimiq.sign(message)');
    expect(js).toContain('sendBasicTransactionWithData');
    expect(js).toContain('value: ONE_NIM, fee: 0');
    expect(js).toContain('co:v1:');
  });
  it("stores route-following capabilities in session storage and strips view tokens from the URL", () => {
    expect(js).toContain('sessionStorage.setItem(`carryone.view.${missionId}`, fromUrl)');
    expect(js).toContain('url.searchParams.delete("view")');
    expect(js).toContain('headers.Authorization = `Bearer ${viewToken}`');
  });
  it("adapts nested UI signatures to the active flat Mission HTTP envelope", () => {
    expect(compat).toContain("challenge_id: auth.challenge_id");
    expect(compat).toContain("public_key: auth.public_key");
    expect(compat).toContain("signature: auth.signature");
    expect(compat).not.toContain("challenge_id: auth.wallet");
  });
  it("adapts broadcast claims to the active invitation-bound endpoint", () => {
    expect(compat).toContain('path = `/missions/${encodeURIComponent(missionId)}/broadcast`');
    expect(compat).toContain("invitation_id: pass.invitationId");
    expect(compat).toContain('hop: { status: "FINAL", sequence: expected }');
  });
  it("keeps demo mode explicit and visually distinct from real mode", () => {
    expect(html).toContain("DEMO MODE — no wallet or network writes");
    expect(js).toContain('query.get("demo") === "1"');
  });
  it("makes successful demo acceptance visibly return to Mission Home", () => {
    expect(demoUx).toContain('query.get("demo") !== "1"');
    expect(demoUx).toContain('stored?.invitation?.status !== "ACCEPTED"');
    expect(demoUx).toContain('history.pushState({}, "", `/mission/${encodeURIComponent(missionId)}?demo=1`)');
    expect(demoUx).toContain('new PopStateEvent("popstate")');
  });
  it("ships a branded browser favicon", () => {
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('viewBox="0 0 64 64"');
    expect(favicon).toContain('Carry One');
  });
  it("honors reduced-motion at the CSS boundary", () => {
    expect(css).toContain("prefers-reduced-motion:reduce");
  });
});
