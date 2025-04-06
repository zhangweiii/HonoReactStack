# Hono React Full-Stack Template

<p align="center">
  <img src="https://raw.githubusercontent.com/honojs/hono/main/docs/images/hono-title.png" width="500" alt="Hono + React">
</p>

<p align="center">
  <b>Modern, High-Performance Full-Stack Template for Cloudflare Workers</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#database-support">Database Support</a> •
  <a href="#authentication">Authentication</a> •
  <a href="#state-management">State Management</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#customization">Customization</a>
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> | <b>English</b>
</p>

## Features

This template provides a complete solution for building modern full-stack applications using [Hono](https://hono.dev/) and [React](https://react.dev/), optimized for the Cloudflare Workers environment.

- ⚡️ **High Performance** - Lightweight, fast API routes based on Hono
- 🔄 **Full-Stack TypeScript** - Shared type definitions between frontend and backend for end-to-end type safety
- 💾 **Database Support** - Integrated Prisma ORM with support for both Cloudflare D1 and MySQL databases
- 🔐 **Authentication** - Built-in user authentication with role-based access control
- 🧩 **Component Library** - Integrated [shadcn/ui](https://ui.shadcn.com/) for beautiful and customizable UI components
- 📦 **State Management** - Clean and efficient state management with [Zustand](https://zustand-demo.pmnd.rs/)
- 🎨 **Theme Switching** - Built-in dark/light theme support with persistence
- 🌐 **Internationalization** - Multi-language support with i18next, currently supporting English and Chinese
- 🔔 **Notification System** - Built-in notification system for friendly user feedback
- 📱 **Responsive Design** - Modern layout that adapts to various screen sizes
- 🚀 **One-Click Deployment** - Easy deployment to Cloudflare Workers

## Screenshots

### Home Page
![Home Page](./docs/screenshots/en/home.png)

### Users Management
![Users Page](./docs/screenshots/en/users.png)

### About Page
![About Page](./docs/screenshots/en/about.png)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

```bash
# Create project using Cloudflare template
npm create cloudflare@latest

# Select "Template from a GitHub repo"
# Then type: https://github.com/zhangweiii/HonoReactStack

# Install dependencies
npm install

# Start the development server
npm run dev
```

Now, open [http://localhost:3000](http://localhost:3000) to view your application.

## Project Structure

```
/
├── src/
│   ├── client/           # Frontend React code
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand state management
│   │   └── styles/       # CSS style files
│   └── server/           # Backend Hono code
│       ├── routes/       # API route definitions
│       └── services/     # Database services
├── prisma/               # Prisma schema and migrations
├── migrations/           # D1 database migrations
├── public/               # Static assets
├── wrangler.jsonc        # Cloudflare Workers configuration
└── package.json          # Project dependencies and scripts
```

## Database Support

This template includes database support using Prisma ORM, with compatibility for both Cloudflare D1 and MySQL databases.

### Cloudflare D1 (Default)

Cloudflare D1 is a serverless SQL database that works seamlessly with Cloudflare Workers.

#### Setting up D1

1. Create a D1 database:
```bash
npx wrangler d1 create your-database-name
```

2. Update your `wrangler.jsonc` with the database binding:
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "your-database-name",
    "database_id": "your-database-id"
  }
]
```

3. Create and apply migrations:
```bash
# Create a migration
npx wrangler d1 migrations create your-database-name migration_name

# Generate SQL from Prisma schema
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/xxxx_migration_name.sql

# Apply migration locally
npx wrangler d1 migrations apply your-database-name --local

# Apply migration to production
npx wrangler d1 migrations apply your-database-name --remote
```

### MySQL Support

To use MySQL instead of D1:

1. Update your `.env` file:
```
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
DATABASE_PROVIDER="mysql"
```

2. Update your Prisma schema:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

3. Generate Prisma client:
```bash
npx prisma generate
```

## Authentication

The template includes a built-in authentication system with role-based access control.

### User Registration

This template restricts public registration by default. Only admin accounts can be created using a secret key. This helps prevent unauthorized registrations while allowing the site owner to maintain control.

To create an admin account during registration, use the secret key:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "secretKey": "admin-secret-key-2025"
}
```

The admin secret key is stored in the `.env` file and `wrangler.jsonc` for better security. You should change this key in production environments.

### User Login

Users can log in through the `/api/auth/login` endpoint:
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

#### Demo Accounts

For demonstration purposes, you can use the following accounts:

**Guest Account:**
```
email: guest@guest.com
password: guest123
```

### Admin Functions

Administrators can:
- Activate/deactivate user accounts
- Create new users
- Update user roles
- Delete users

## State Management

This template uses Zustand for state management, providing three main stores:

### User Store

Manages user data, including fetching, adding, updating, and deleting users.

```tsx
import { useUserStore } from '@/store/userStore'

function Component() {
  const { users, fetchUsers, addUser } = useUserStore()

  // Use state and methods from the store
}
```

### Theme Store

Manages application theme settings, supporting light, dark, and system themes.

```tsx
import { useThemeStore } from '@/store/themeStore'

function Component() {
  const { theme, toggleTheme } = useThemeStore()

  // Use theme state and toggle method
}
```

### Internationalization

The application supports multiple languages using i18next:

```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t, i18n } = useTranslation()

  // Use translation function
  return <h1>{t('welcome')}</h1>

  // Change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
}
```

#### Multilingual Error Messages

All error messages in both frontend and backend are internationalized. The system automatically detects the user's language preference and displays error messages in the appropriate language. This provides a consistent user experience across the entire application.

### Notification Store

Manages in-app notifications, supporting different types of notifications (success, error, warning, info).

```tsx
import { useNotifications } from '@/components/Notifications'

function Component() {
  const { showSuccess, showError } = useNotifications()

  // Show notifications
  showSuccess('Operation successful')
  showError('An error occurred')
}
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Login to Cloudflare
npx wrangler login

# Build the frontend code
npm run build

# Deploy the application
npm run worker:deploy
```

## Customization

### Adding New Pages

1. Create a new page component in the `src/client/pages` directory
2. Add a new route in `src/client/App.tsx`

### Adding New API Endpoints

1. Add a new route handler in `src/server/routes/api.ts`

### Modifying Themes

1. Edit the CSS variables in `src/client/styles/globals.css`

### Adding New Languages

1. Create new translation files in `src/client/i18n/locales/[language-code]/`
2. Update the language selector component in `src/client/i18n/LanguageSelector.tsx`

## Contributing

Pull Requests and Issues are welcome!

## License

MIT
