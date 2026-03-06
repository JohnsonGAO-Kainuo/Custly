# Custly CRM — Agent Context

## Project
- **Product**: Custly CRM — lightweight CRM for small teams
- **Company**: Kainuo Innovision Tech Co., Limited
- **Domain**: https://custlycrm.com
- **Based on**: marmelab/atomic-crm (MIT)

## Tech Stack
- **Frontend**: Vite + React + React Admin v5 + shadcn/ui
- **Backend**: PocketBase at `https://pb-custly.kainuotech.com`
- **Payments**: Stripe (Live mode, HKD settlement, multi-currency via `currency_options`)
- **Deployment**: Vercel (frontend) + self-hosted PocketBase
- **Auth**: Email/password + OAuth (Google, GitHub) via PocketBase
- **i18n**: EN, zh-CN, zh-TW

## Key Directories
- `src/components/atomic-crm/` — Main app code
- `src/i18n/` — Translation files (marketing + CRM)
- `api/` — Vercel serverless functions (create-checkout, stripe-webhook, customer-portal)
- `scripts/` — Only 5 active scripts (see package.json)
- `_archive/` — Archived files (gitignored, not part of active project)

## Important Files
- `api/create-checkout.ts` — Stripe Checkout session creation
- `api/stripe-webhook.ts` — Stripe webhook handler (subscription lifecycle)
- `src/components/atomic-crm/subscription/` — Subscription context & service
- `src/components/atomic-crm/login/` — Marketing pages, login, signup

## Conventions
- Internal directory name `atomic-crm` preserved to avoid path-breaking refactor
- Demo mode via `?demo=true` uses fakerest data provider
- All phases (1-4) are 100% complete
- Supabase code still exists but is not used (PocketBase is active backend)
