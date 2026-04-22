# Product Context

## Why This Project Exists

KraftMail provides a user-friendly interface for composing professional emails through an AI-powered backend. It simplifies email creation by offering two modes:

1. **YOLO Mode**: For users who want quick, straightforward email composition
2. **Detailed Mode**: For users who want fine-grained control over tone, style, and formatting

## Problems It Solves

- Complex email composition made simple
- Consistent professional email output
- History tracking for repeated communications
- API key management for Resend integration

## User Experience Goals

- Seamless authentication flow
- Intuitive step-by-step email forms
- Real-time feedback during email generation
- Beautiful, professional interface

## Branding

- **App Name**: KraftMail
- **Creator**: Jetimworks
- **Personality**: Professional yet approachable

## Architecture

- Frontend: React SPA connecting to Go backend
- State: React Context for auth, localStorage for persistence
- API: RESTful with JWT authentication
