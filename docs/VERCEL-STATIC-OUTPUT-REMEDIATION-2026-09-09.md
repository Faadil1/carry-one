# NimCarry — Vercel static output remediation

Date: 2026-09-09

## Observed failure

The production deployment for main commit `4bb44455790a643f34b06a0c1b4c4468ce6bceac` completed `npm run build` successfully but Vercel then failed with:

`No Output Directory named "public" found after the Build completed.`

This was a hosting-configuration mismatch. The browser Mini App is served from the repository `web/` directory; it is not generated into `public/` by the TypeScript build.

## Remediation

PR #22 adds repository-level `vercel.json` with:

- `buildCommand: npm run build`;
- `outputDirectory: web`;
- SPA rewrites for `/create`, `/mission/:path*`, and `/i/:path*` back to `/index.html` while leaving static assets addressable normally.

PR #22 was merged to `main` as `90673c060e7afbd1e3102326b845b2c1768584b3` after green GitHub CI.

## Truth / verification boundary

The repository-side configuration defect is remediated. Do **not** call the public Vercel deployment healthy until a post-merge Production deployment is observed as Ready and the public URL is smoke-tested. The connected Vercel tool is not currently exposing this Hobby project, so production verification must use the Vercel deployment UI/public URL until connector visibility is restored.
