# regex.to — Monorepo

This repository contains:

| Package | Description |
|---------|-------------|
| [`regex-web/`](./regex-web) | Next.js 14 web application (regex.to) |
| [`regex-npm/`](./regex-npm) | `@regexto/validators` NPM package |

## Quick Start

```bash
# Web app
cd regex-web && npm install && npm run dev

# NPM package development
cd regex-npm && npm install && npm run build
```

## Architecture

- **Web**: Next.js App Router with full SSG for pattern pages (`/[slug]`)
- **NPM**: Zero-dependency TypeScript package with ESM + CJS dual output
- **Privacy**: 100% client-side regex processing — no user data is ever stored server-side

## Related

- [before.run](https://before.run) — SaaS waitlist platform
- [saas.garden](https://saas.garden) — SaaS discovery directory
