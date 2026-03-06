# Custly CRM

A modern, lightweight CRM for small teams and growing businesses. Built with React, shadcn/ui, and PocketBase.

> Based on [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm) (MIT License)

🌐 **Live**: [custlycrm.com](https://custlycrm.com)

## Features

- 📇 **Contact Management** — Full CRUD, CSV import/export, merge duplicates
- 🏢 **Company Management** — Company profiles with linked contacts & industry tags
- 📊 **Deal Pipeline** — Kanban board with stage management & revenue tracking
- ⏰ **Task Management** — Tasks, reminders, and calendar view
- 📝 **Notes & Attachments** — Rich notes with file attachments and status markers
- 📜 **Activity History** — Full timeline of all interactions
- 🔐 **Authentication** — Email/password + OAuth (Google, GitHub)
- 🌍 **Multi-language** — English, 简体中文, 繁體中文
- 🧩 **Template Center** — Industry-specific templates (e-commerce, consulting, etc.)
- 💳 **Subscription Billing** — Stripe integration with multi-currency support (USD/HKD/CNY)
- 🎨 **Custom Theming** — Sage green identity with dark mode support

## Quick Start

```bash
# Install dependencies
npm install

# Run in demo mode (no backend needed)
npm run dev:demo

# Run with PocketBase backend
npm run dev
```

Access the app at [http://localhost:5173](http://localhost:5173)

### Environment Variables

Create `.env.development`:
```
VITE_BACKEND=pocketbase
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

### PocketBase Setup

```bash
POCKETBASE_URL=http://127.0.0.1:8090 \
POCKETBASE_ADMIN_EMAIL=you@example.com \
POCKETBASE_ADMIN_PASSWORD=yourpassword \
npm run pocketbase:init
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + React Admin v5 |
| UI | shadcn/ui + Radix UI |
| Backend | PocketBase |
| Payments | Stripe (multi-currency) |
| Deployment | Vercel + self-hosted PocketBase |
| Auth | PocketBase (Email + OAuth) |
| i18n | polyglot (EN / zh-CN / zh-TW) |

## Documentation

- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** — Full development guide (中文)
- **[CLAUDE.md](./CLAUDE.md)** — AI agent context

## Testing

```bash
npm test
```

## License

MIT License — courtesy of [Marmelab](https://marmelab.com). See [LICENSE.md](./LICENSE.md).
