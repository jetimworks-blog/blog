# Backend API Change (2026-05-13)

## Summary
Removed the `/everything-app` prefix from all API endpoints.

## Endpoint Changes

### Auth Endpoints
- `POST /auth/register` (public)
- `POST /auth/login` (public)
- `POST /auth/refresh` (public)
- `POST /auth/forgot-password` (public)
- `POST /auth/reset-password` (public)
- `GET /auth/me` (protected)
- `POST /auth/logout` (protected)
- `DELETE /auth/account` (protected)

### Config Endpoints (protected)
- `PUT /config`
- `GET /config`
- `DELETE /config`

### App Endpoints (protected)
- `POST /app/execute`
- `POST /app/execute/confirm`
- `GET /app/processes`

### Email History Endpoints (protected)
- `GET /email-history`

### Campaign Endpoints (protected)
- CRUD `/campaigns`
- Additional campaign routes (upload, schedule, send, cancel)

### Tracking Endpoints (public)
- `/t/{campaignID}/{recipientID}/open`
- `/t/{campaignID}/{recipientID}/redirect`

### Other
- `GET /` (welcome endpoint)
- Health check endpoint