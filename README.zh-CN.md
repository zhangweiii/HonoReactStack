# Hono React 全栈应用模板

<p align="center">
  <img src="https://raw.githubusercontent.com/honojs/hono/main/docs/images/hono-title.png" width="500" alt="Hono + React">
</p>

<p align="center">
  <b>现代化、高性能的 Cloudflare Workers 全栈应用模板</b>
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#应用截图">应用截图</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#数据库支持">数据库支持</a> •
  <a href="#认证系统">认证系统</a> •
  <a href="#状态管理">状态管理</a> •
  <a href="#部署">部署</a> •
  <a href="#自定义">自定义</a>
</p>

<p align="center">
  <b>简体中文</b> | <a href="./README.md">English</a>
</p>

## 特性

这个模板提供了使用 [Hono](https://hono.dev/) 和 [React](https://react.dev/) 构建现代化全栈应用的完整解决方案，专为 Cloudflare Workers 环境优化。

- ⚡️ **高性能** - 基于 Hono 的轻量级、快速的 API 路由
- 🔄 **全栈 TypeScript** - 前后端共享类型定义，提供端到端类型安全
- 💾 **数据库支持** - 集成 Prisma ORM，同时支持 Cloudflare D1 和 MySQL 数据库
- 🔐 **认证系统** - 内置用户认证和基于角色的访问控制
- 🧩 **组件库** - 集成 [shadcn/ui](https://ui.shadcn.com/)，提供美观且可定制的 UI 组件
- 📦 **状态管理** - 使用 [Zustand](https://zustand-demo.pmnd.rs/) 进行简洁高效的状态管理
- 🎨 **主题切换** - 内置深色/浅色主题支持，带有持久化功能
- 🌐 **国际化** - 使用 i18next 的多语言支持，目前支持中文和英文
- 🔔 **通知系统** - 内置通知系统，提供友好的用户反馈
- 📱 **响应式设计** - 适配各种屏幕尺寸的现代化布局
- 🚀 **一键部署** - 轻松部署到 Cloudflare Workers

## 应用截图

### 首页
![首页](./docs/screenshots/zh-CN/home.png)

### 用户管理
![用户页面](./docs/screenshots/zh-CN/users.png)

### 关于页面
![关于页面](./docs/screenshots/zh-CN/about.png)

## 快速开始

### 前提条件

- [Node.js](https://nodejs.org/) 18 或更高版本
- [npm](https://www.npmjs.com/) 或 [pnpm](https://pnpm.io/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 安装

```bash
# 使用Cloudflare模板创建项目
npm create cloudflare@latest

# 选择 "Template from a GitHub repo"
# 然后键入: https://github.com/zhangweiii/HonoReactStack

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

现在，打开 [http://localhost:3000](http://localhost:3000) 即可查看你的应用。

## 项目结构

```
/
├── src/
│   ├── client/           # 前端 React 代码
│   │   ├── components/   # React 组件
│   │   ├── hooks/        # 自定义 React Hooks
│   │   ├── pages/        # 页面组件
│   │   ├── store/        # Zustand 状态管理
│   │   └── styles/       # CSS 样式文件
│   └── server/           # 后端 Hono 代码
│       ├── routes/       # API 路由定义
│       └── services/     # 数据库服务
├── prisma/               # Prisma 模式和迁移
├── migrations/           # D1 数据库迁移
├── public/               # 静态资源
├── wrangler.jsonc        # Cloudflare Workers 配置
└── package.json          # 项目依赖和脚本
```

## 数据库支持

本模板使用 Prisma ORM 提供数据库支持，同时兼容 Cloudflare D1 和 MySQL 数据库。

### Cloudflare D1 (默认)

Cloudflare D1 是一个无服务器 SQL 数据库，与 Cloudflare Workers 无缝集成。

#### 设置 D1

1. 创建 D1 数据库：
```bash
npx wrangler d1 create your-database-name
```

2. 在 `wrangler.jsonc` 中添加数据库绑定：
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "your-database-name",
    "database_id": "your-database-id"
  }
]
```

3. 创建并应用迁移：
```bash
# 创建迁移
npx wrangler d1 migrations create your-database-name migration_name

# 从 Prisma 模式生成 SQL
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/xxxx_migration_name.sql

# 在本地应用迁移
npx wrangler d1 migrations apply your-database-name --local

# 在生产环境应用迁移
npx wrangler d1 migrations apply your-database-name --remote
```

### MySQL 支持

要使用 MySQL 而不是 D1：

1. 更新你的 `.env` 文件：
```
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
DATABASE_PROVIDER="mysql"
```

2. 更新你的 Prisma 模式：
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

3. 生成 Prisma 客户端：
```bash
npx prisma generate
```

## 认证系统

模板包含内置的认证系统，支持基于角色的访问控制。

### 用户注册

本模板默认限制公开注册。只有使用管理员密钥才能创建账户。这有助于防止未经授权的注册，同时允许站点所有者保持控制权。

要创建管理员账户，在注册时使用密钥：
```json
{
  "name": "管理员",
  "email": "admin@example.com",
  "password": "securepassword",
  "secretKey": "admin-secret-key-2025"
}
```

管理员密钥存储在 `.env` 文件和 `wrangler.jsonc` 中，以提高安全性。在生产环境中，您应该更改此密钥。

### 用户登录

用户可以通过 `/api/auth/login` 端点登录：
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

#### 演示账号

为了演示目的，您可以使用以下账号：

**访客账号：**
```
email: guest@guest.com
password: guest123
```

### 管理员功能

管理员可以：
- 激活/禁用用户账户
- 创建新用户
- 更新用户角色
- 删除用户

## 状态管理

本模板使用 Zustand 进行状态管理，提供了三个主要的 store：

### 用户 Store

管理用户数据，包括获取、添加、更新和删除用户。

```tsx
import { useUserStore } from '@/store/userStore'

function Component() {
  const { users, fetchUsers, addUser } = useUserStore()

  // 使用 store 中的状态和方法
}
```

### 主题 Store

管理应用主题设置，支持浅色、深色和系统主题。

```tsx
import { useThemeStore } from '@/store/themeStore'

function Component() {
  const { theme, toggleTheme } = useThemeStore()

  // 使用 theme 状态和切换方法
}
```

### 国际化

应用使用 i18next 支持多语言：

```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t, i18n } = useTranslation()

  // 使用翻译函数
  return <h1>{t('welcome')}</h1>

  // 切换语言
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
}
```

#### 多语言错误消息

前端和后端的所有错误消息都支持国际化。系统会自动检测用户的语言偏好，并以适当的语言显示错误消息。这为整个应用提供了一致的用户体验。

### 通知 Store

管理应用内通知，支持不同类型的通知（成功、错误、警告、信息）。

```tsx
import { useNotifications } from '@/components/Notifications'

function Component() {
  const { showSuccess, showError } = useNotifications()

  // 显示通知
  showSuccess('操作成功')
  showError('发生错误')
}
```

## 部署

### 部署到 Cloudflare Workers

```bash
# 登录到 Cloudflare
npx wrangler login

# 编译前端代码
npm run build

# 部署应用
npm run worker:deploy
```

## 自定义

### 添加新页面

1. 在 `src/client/pages` 目录下创建新的页面组件
2. 在 `src/client/App.tsx` 中添加新的路由

### 添加新 API 端点

1. 在 `src/server/routes/api.ts` 中添加新的路由处理函数

### 修改主题

1. 编辑 `src/client/styles/globals.css` 中的 CSS 变量

### 添加新语言

1. 在 `src/client/i18n/locales/[语言代码]/` 中创建新的翻译文件
2. 更新 `src/client/i18n/LanguageSelector.tsx` 中的语言选择器组件

## 贡献

欢迎提交 Pull Request 和 Issue！

## 许可证

MIT
