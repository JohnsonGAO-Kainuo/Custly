# Custly

A full-featured CRM built with React, shadcn-admin-kit, and PocketBase (default). Supabase is still supported as an optional backend.

> 基于 [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm) 开源项目

https://github.com/user-attachments/assets/0d7554b5-49ef-41c6-bcc9-a76214fc5c99

## Features

- 📇 **Organize Contacts**: Keep all your contacts in one easily accessible place.
- ⏰ **Create Tasks & Set Reminders**: Never miss a follow-up or deadline.
- 📝 **Take Notes**: Capture important details and insights effortlessly.
- ✉️ **Capture Emails**: CC Atomic CRM to automatically save communications as notes.
- 📊 **Manage Deals**: Visualize and track your sales pipeline in a Kanban board.
- 🔄 **Import & Export Data**: Easily transfer contacts in and out of the system.
- 🔐 **Authentication**: Email/password by default; OAuth available when using Supabase.
- 📜 **Track Activity History**: View all interactions in aggregated activity logs.
- 🔗 **Integrate via API**: Connect seamlessly with other systems using our API.
- 🛠️ **Customize Everything**: Add custom fields, change the theme, and replace any component to fit your needs.
- 🌍 **Multi-language**: Support for English, Simplified Chinese, and Traditional Chinese.

## Installation

To run this project locally, you will need the following tools installed on your computer:

- Node 22 LTS
- Docker (only if you want to run Supabase locally)

Clone this repository locally:

```sh
git clone https://github.com/[username]/custly.git
```

Install dependencies:

```sh
cd custly
make install
```

Or use npm directly:

```sh
npm install
```

This installs the frontend dependencies. The backend runs separately (PocketBase or Supabase).

## Quick Start

**PocketBase (recommended)**
1. Start your PocketBase instance (local or Pockethost).
2. Set environment variables in `.env.development`:
   ```
   VITE_BACKEND=pocketbase
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   ```
3. Run the frontend:
   ```sh
   npm run dev
   ```

**Demo Mode** (no backend):
```sh
npm run dev:demo
```

Access the app via [http://localhost:5173/](http://localhost:5173/)

## 📚 Documentation

**For developers**, see **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** (中文) for:
- 项目架构和目录结构
- 开发命令和常见问题
- 多语言支持实现
- 当前进度和待办事项

**For product requirements**, see [requirements/atomic-crm-prd.md](./requirements/atomic-crm-prd.md)

**Upstream documentation**:
- [User Management](./doc/src/content/docs/users/user-management.mdx)
- [Import/Export Data](./doc/src/content/docs/users/import-contacts.mdx)
- [Inbound Email](./doc/src/content/docs/users/inbound-email.mdx)
- [Customizing](./doc/src/content/docs/developers/customizing.mdx)
- [Architecture](./doc/src/content/docs/developers/architecture-choices.mdx)

## 🌍 Multi-language Support

Custly supports 3 languages:
- 🇬🇧 English
- 🇨🇳 简体中文 (Simplified Chinese)  
- 🇹🇼 繁體中文 (Traditional Chinese)

Users can switch languages from the user menu.

## Deploying to Production

**Frontend (Vercel)**
- Set `VITE_BACKEND=pocketbase`
- Set `VITE_POCKETBASE_URL=https://your-instance.pockethost.io`

**Backend options**
- PocketBase on Pockethost (recommended for speed)
- Supabase (legacy option, see docs below)

Supabase docs (optional):
1. [Configuring Supabase](./doc/src/content/docs/developers/supabase-configuration.mdx)
2. [Configuring Inbound Email](./doc/src/content/docs/developers/inbound-email-configuration.mdx)

## Testing

Run unit tests:

```sh
make test
```

## Learn More

For more information about the upstream project:
- [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm)
- [Online Demo](https://marmelab.com/atomic-crm-demo)
- [React-Admin Documentation](https://marmelab.com/react-admin/documentation.html)

> [!WARNING]  
> If the `registry.json` misses some changes you made, you MUST update the `scripts/generate-registry.mjs` to include those changes.

## License

This project is licensed under the MIT License, courtesy of [Marmelab](https://marmelab.com). See the [LICENSE.md](./LICENSE.md) file for details.
