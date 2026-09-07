import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const html = readFileSync("web/index.html", "utf8");
const js = readFileSync("web/app.js", "utf8");
const compat = readFileSync("web/http-compat.js", "utf8");
const css = readFileSync("web/styles.css", "utf8");

describe("static Mini App skeleton", () => {
  it("ships a mobile-first app shell without external UI/script dependencies", () => {
    expect(html).toContain('name="viewport"');
    expect(html).toContain('src="/http-compat.js"');
    expect(html.indexOf('src="/http-compat.js"')).toBeLessThan(html.indexOf('src="/app.js"'));
    expect(html).toContain('href="/styles.css"');
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
  it("honors reduced-motion at the CSS boundary", () => {
    expect(css).toContain("prefers-reduced-motion:reduce");
  });
});
