# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: KraftMail

KraftMail is an AI-powered email crafting application by Jetimworks. It helps professionals compose beautiful, professional emails using AI.

## Tech Stack

- **React 19** with Vite (SPA)
- **React Router 7** for routing
- **TailwindCSS 4** with `@tailwindcss/vite` plugin
- **Framer Motion** for animations
- **Sonner** for toast notifications
- **Lucide React** for icons
- **Axios** for HTTP with interceptors for auth token refresh

## Commands

```bash
npm run dev      # Start dev server (port 5173, binds to 0.0.0.0 for network access)
npm run build    # Production build to dist/
npm run lint      # ESLint
npm run preview  # Preview production build
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

## Architecture

### Auth Flow

Tokens are stored in `localStorage`:
- `access_token` — JWT for API auth
- `refresh_token` — used to rotate expired tokens via `api.js` interceptor

`AuthContext` (`src/context/AuthContext.jsx`) provides auth state to the app. `ProtectedRoute` (`src/components/auth/ProtectedRoute.jsx`) guards routes requiring auth.

### API Structure (`src/lib/api.js`)

Axios instance with automatic 401 retry using refresh token:
- `authAPI` — register, login, logout, me, refresh, deleteAccount
- `configAPI` — get/set/delete user config (includes `from_name`)
- `emailAPI` — execute (preview), confirm (send)
- `historyAPI` — get email history with pagination

### Email Workflow

1. **YoloEmailForm** (`src/pages/YoloEmailForm.jsx`) — 4-step quick send flow
2. **DetailedEmailForm** (`src/pages/DetailedEmailForm.jsx`) — more control

Flow:
1. User submits prompt → `emailAPI.execute({ process: 'gen', prompt })` → returns HTML preview
2. Prompt stored in `sessionStorage` as `pendingPrompt`
3. User confirms → `emailAPI.confirm({ process: 'email', to, subject, html, prompt })` → sends email
4. `pendingPrompt` cleared after successful send

### Prompt Enhancement

Both forms inject contextual information into the prompt before generation:
- **User message**: Phrased as: `In essence the email should say this: 'X'. Be very creative in delivering the best style, grammar, and beauty of the message.`
- **Key message** (Detailed form only): Phrased similarly: `In essence the key message should say this: 'X'. Be very creative in delivering the best style, grammar, and beauty of the key message.`
- **Recipient name**: Optional field; if not provided, extracted from email address (e.g., `john.doe@example.com` → `John Doe`). Injected as: `The Recipient name is X.`
- **Subject**: Injected as: `The expected subject for this email is 'XXX'. Use it in context for the email.`
- **Sender name**: Appended at the end as: `Sign the email that it is from {senderName}.`

### Routing (`src/App.jsx`)

Public routes: `/login`, `/register`, `/features` (LandingPage)
Protected routes (wrapped in `ProtectedRoute`): `/home`, `/send/yolo`, `/send/detailed`, `/result`, `/history`, `/settings`

Root `/` redirects to `/features`.
