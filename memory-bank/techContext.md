# Tech Context

## Project Identity

- **App Name**: KraftMail
- **Creator**: Jetimworks
- **Tagline**: AI-Powered Email Crafting

## Technologies

- **React**: 19.x with Vite
- **TailwindCSS**: v4 (via @tailwindcss/vite)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Notifications**: Sonner
- **Icons**: Lucide React

## Development Setup

```bash
npm install     # Install dependencies
npm run dev     # Start dev server
npm run build   # Production build
```

## Environment Variables

- `VITE_API_BASE_URL=http://172.20.10.3:8080` (network backend URL)
- `.env.production`: `https://mobile-api-staging.omitsfx.com/everything-app` (staging)
- Default: `http://localhost:8080` (fallback)

## Network Configuration

- **Vite dev server**: `0.0.0.0:5173` (accessible on network)
- **Backend API**: `http://172.20.10.3:8080`
- To run over network: `npm run dev`

## Backend Requirements

- Go backend running on port 8080
- PostgreSQL database
- Resend API integration
