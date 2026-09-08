# Carry One — Public Repository Safety Gate

Date: 2026-09-07

The repository is now public. Public visibility changes the release posture immediately: credentials must be treated as exposed if they ever enter reachable Git history, even if later deleted from the working tree.

## Repository rules

- `.env`, private keys, PEM files, seeds, mnemonics, keystores and runtime state remain gitignored.
- `.env.example` contains placeholders only.
- CI runs `scripts/secret-scan.mjs` before typecheck/tests/build.
- CI checkout uses full history so the scanner checks reachable commits, not only the current tree.
- The scanner reports only finding type/path/commit and intentionally never prints matched secret values.
- Any confirmed credential finding requires immediate revoke/rotation first, then history remediation; deleting only the latest file is insufficient.

Scanner coverage includes high-confidence PEM private keys, GitHub token shapes, AWS access-key identifiers, Slack token shapes, OpenAI-style secret shapes, plus suspicious current-tree assignments to common secret variables. This is an additional guard, not a claim that every possible secret format is detectable. GitHub-hosted secret scanning/alerts should remain enabled where available.

Public repository visibility does not authorize mainnet funds, public Early Access traffic, production secrets in repository files, or claims that pending real-device/testnet validations have passed.
