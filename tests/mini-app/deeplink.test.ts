import { describe, expect, it } from "vitest";
import { buildCarryOneInviteLinks } from "../../src/mini-app/deeplink.js";

const TOKEN = "a".repeat(43);

describe("Carry One Nimiq Pay invite deeplinks", () => {
  it("keeps the private invite token inside the Carry One URL opened by Nimiq Pay", () => {
    const links = buildCarryOneInviteLinks("https://carry.example", TOKEN);
    expect(links.webInviteUrl).toBe(`https://carry.example/i/${TOKEN}`);
    expect(links.nimiqPayCustomScheme).toBe(
      `nimiqpay://miniapp?url=${encodeURIComponent(`https://carry.example/i/${TOKEN}`)}`
    );
  });

  it("rejects weak tokens and insecure public origins", () => {
    expect(() => buildCarryOneInviteLinks("https://carry.example", "short")).toThrow(/high-entropy/);
    expect(() => buildCarryOneInviteLinks("http://carry.example", TOKEN)).toThrow(/HTTPS/);
  });
});
