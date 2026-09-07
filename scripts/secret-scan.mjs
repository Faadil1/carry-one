import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const HIGH_CONFIDENCE = [
  ["private-key-pem", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["github-token", /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{30,}\b/],
  ["github-fine-grained-token", /\bgithub_pat_[A-Za-z0-9_]{30,}\b/],
  ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ["openai-style-secret", /\bsk-[A-Za-z0-9_-]{24,}\b/],
];
const SECRET_ASSIGNMENT = /\b(?:API[_-]?KEY|ACCESS[_-]?TOKEN|AUTH[_-]?TOKEN|SECRET|PRIVATE[_-]?KEY|MNEMONIC|PASSWORD)\b\s*[:=]\s*["']?([^\s"']{8,})/i;
const ALLOWED_VALUE = /^(?:<.*>|\$\{|process\.env|import\.meta\.env|example|your[-_]|replace[-_]|change[-_]|test[-_]|dummy|placeholder|none|null)/i;
const EXCLUDED = new Set(["scripts/secret-scan.mjs"]);
const git = (args, options = {}) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024, ...options });
const trackedFiles = () => git(["ls-files", "-z"]).split("\0").filter(Boolean);
function textFile(path) { try { const buffer = readFileSync(path); if (buffer.includes(0)) return null; return buffer.toString("utf8"); } catch { return null; } }

const findings = [];
for (const path of trackedFiles()) {
  if (EXCLUDED.has(path)) continue;
  const text = textFile(path); if (text === null) continue;
  for (const [name, regex] of HIGH_CONFIDENCE) if (regex.test(text)) findings.push({ scope: "working-tree", path, type: name });
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//") || line.startsWith("*") || line.startsWith("<!--")) continue;
    const match = line.match(SECRET_ASSIGNMENT); if (!match) continue;
    const value = match[1]; if (!ALLOWED_VALUE.test(value)) findings.push({ scope: "working-tree", path, type: "suspicious-secret-assignment" });
  }
}

if (process.env.CARRY_ONE_SCAN_HISTORY !== "0") {
  const commits = git(["rev-list", "--all"]).trim().split(/\s+/).filter(Boolean);
  const gitRegexes = [["private-key-pem", "-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"],["github-token", "gh(p|o|u|s|r)_[A-Za-z0-9]{30,}"],["github-fine-grained-token", "github_pat_[A-Za-z0-9_]{30,}"],["aws-access-key", "AKIA[0-9A-Z]{16}"],["slack-token", "xox[baprs]-[A-Za-z0-9-]{20,}"],["openai-style-secret", "sk-[A-Za-z0-9_-]{24,}"]];
  for (const commit of commits) for (const [name, expression] of gitRegexes) {
    try {
      const paths = git(["grep", "-I", "-l", "-E", "-e", expression, commit, "--", ".", ":(exclude)scripts/secret-scan.mjs"]).trim();
      if (paths) findings.push({ scope: "git-history", path: paths.split(/\r?\n/)[0], type: name, commit: commit.slice(0, 12) });
    } catch (error) { if (error?.status !== 1) throw error; }
  }
}

const unique = [...new Map(findings.map((item) => [`${item.scope}:${item.path}:${item.type}:${item.commit ?? ""}`, item])).values()];
if (unique.length > 0) {
  console.error(`Carry One secret scan: FAIL (${unique.length} potential finding${unique.length === 1 ? "" : "s"}).`);
  for (const item of unique) console.error(`- ${item.scope}: ${item.type} in ${item.path}${item.commit ? ` @ ${item.commit}` : ""}`);
  console.error("Matched secret values are intentionally never printed. Rotate/revoke any confirmed exposed credential before rewriting history.");
  process.exit(1);
}
console.log("Carry One secret scan: PASS — no high-confidence credential material found in tracked files or reachable Git history.");
