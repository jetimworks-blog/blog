# System Patterns

## Project Identity

- **App Name**: KraftMail
- **Creator**: Jetimworks
- **Tagline**: AI-Powered Email Crafting

## Architecture

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Input, Card, etc.)
│   ├── layout/      # Navbar, Footer, Layout wrappers
│   └── auth/        # Auth-specific components (ProtectedRoute)
├── context/         # React Context (AuthContext)
├── hooks/           # Custom hooks (useAuth)
├── lib/             # Utilities (api, auth, validation)
└── pages/           # Page components
```

## API Integration

- **Axios instance**: `src/lib/api.js`
- **Base URL**: `http://172.20.10.3:8080` (network) or `http://localhost:8080` (local fallback)
- **Auth interceptors**: Automatic JWT token injection
- **Refresh token handling**: Automatic token refresh

## Two-Step Email Workflow

The email sending is split into two steps for user preview:

### Step 1: Generate Preview
- **Endpoint**: `POST /app/execute`
- **Payload**: `{ process: "gen", prompt: "..." }`
- **Response**: `{ success: true, output: "HTML content", error: "" }`
- **Purpose**: Generate HTML email preview without sending

### Step 2: Confirm Send
- **Endpoint**: `POST /app/execute/confirm`
- **Payload**: `{ process: "email", to, subject, html }`
- **Response**: `{ success: true, output: "...", error: "" }`
- **Purpose**: Send email with pre-generated HTML

### API Methods
```javascript
emailAPI.execute(data)     // Step 1: Generate preview
emailAPI.confirm(data)     // Step 2: Send email
```

## Authentication Flow

1. User submits credentials
2. Backend returns access_token + refresh_token
3. Tokens stored in localStorage
4. Axios interceptor adds Authorization header
5. ProtectedRoute checks auth state

## TailwindCSS v4 Setup

- Uses `@tailwindcss/vite` plugin (NOT postcss)
- No tailwind.config.js file
- Custom theme in `src/index.css` using `@theme`
- Fonts: Playfair Display (headings), Merriweather (body)

## GitHub Pages Deployment

- **Repository**: `jetimworks-blog/jetimworks-blog.github.io`
- **Vite config**: Uses `command === 'serve'` check for base path
  - Development (`npm run dev`): base = `/`
  - Production (`npm run build`): base = `/`
- **Workflow**: `.github/workflows/deploy.yml`
  - Triggers on push to `main`
  - Uses `actions/deploy-pages@v4`
- **Build output**: `dist/` folder
- **Environment vars**: Set via GitHub Actions Variables (`API_BASE_URL`)
