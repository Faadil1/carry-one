import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const html = readFileSync("web/index.html", "utf8");
const js = readFileSync("web/app.js", "utf8");
const compat = readFileSync("web/http-compat.js", "utf8");
const demoUx = readFileSync("web/demo-ux.js", "utf8");
const winning = readFileSync("web/winning-intelligence.js", "utf8");
const living = readFileSync("web/living-route.js", "utf8");
const livingCss = readFileSync("web/living-route.css", "utf8");
const favicon = readFileSync("web/favicon.svg", "utf8");
const mark = readFileSync("web/nimcarry-mark.svg", "utf8");
const manifest = readFileSync("web/manifest.webmanifest", "utf8");
const css = readFileSync("web/styles.css", "utf8");

describe("static Mini App skeleton", () => {
  it("ships a mobile-first app shell without external UI/script dependencies", () => {
    expect(html).toContain('name="viewport"');
    expect(html).toContain('src="/http-compat.js"');
    expect(html.indexOf('src="/http-compat.js"')).toBeLessThan(html.indexOf('src="/app.js"'));
    expect(html).toContain('src="/demo-ux.js"');
    expect(html.indexOf('src="/app.js"')).toBeLessThan(html.indexOf('src="/demo-ux.js"'));
    expect(html).toContain('src="/living-route.js"');
    expect(html.indexOf('src="/winning-intelligence.js"')).toBeLessThan(html.indexOf('src="/living-route.js"'));
    expect(html).toContain('href="/styles.css"');
    expect(html).toContain('href="/living-route.css"');
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
  it("ships route-native NimCarry browser and install branding", () => {
    expect(favicon).toContain('<svg');
    expect(favicon).toContain('aria-label="NimCarry"');
    expect(mark).toContain("NimCarry");
    expect(html).toContain('src="/nimcarry-mark.svg"');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(manifest).toContain('"short_name": "NimCarry"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('/social-card.svg');
  });
  it("turns the progress helper into a living route without inventing custody state", () => {
    expect(winning).toContain('className = "wi-flow"');
    expect(living).toContain('routePhaseFromNotice');
    expect(living).toContain('waiting for independent FINAL');
    expect(living).toContain('FINAL — custody moved and the verified route advanced.');
    expect(living).not.toContain('sendBasicTransactionWithData');
    expect(livingCss).toContain('.wi-flow-step::after');
    expect(livingCss).toContain('.wi-proof-step.lr-active');
  });
  it("adds product-useful micro-interactions and an ARRIVED receipt reveal", () => {
    expect(living).toContain('enhanceBridgeInvitation');
    expect(living).toContain('syncBusyButtons');
    expect(living).toContain('revealReceipt');
    expect(livingCss).toContain('.button.lr-pressed');
    expect(livingCss).toContain('.wi-receipt');
  });
  it("honors reduced-motion at both base and Living Route CSS boundaries", () => {
    expect(css).toContain("prefers-reduced-motion:reduce");
    expect(livingCss).toContain("prefers-reduced-motion:reduce");
  });
});
