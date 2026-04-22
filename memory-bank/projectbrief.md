# KraftMail - Project Brief

**AI-Powered Email Crafting by Jetimworks**

## Core Requirements

A React frontend application that connects to a Go backend for composing and sending emails via the Resend API. Features two email composition modes: "YOLO" quick send and "Detailed" multi-step wizard.

## App Identity

- **App Name**: KraftMail
- **Creator**: Jetimworks
- **Tagline**: AI-Powered Email Crafting

## Key Features

1. **User Authentication**
   - Register, Login, Logout with JWT tokens
   - Token stored in localStorage
   - Auto-redirect to homepage on successful login
   - Protected routes for authenticated pages

2. **Email Composition**
   - **YOLO Mode**: Multi-step quick email form (recipient, subject, body)
   - **Detailed Mode**: Multi-step wizard with tone/style/font/word count options

3. **History & Settings**
   - History page for past email requests (localStorage + backend)
   - Settings page for Resend API key configuration

## Technical Stack

- React 19 + Vite 8
- TailwindCSS v4 (via @tailwindcss/vite plugin)
- React Router v7
- Axios with JWT interceptors
- Framer Motion for animations
- Sonner for toast notifications
- Lucide React for icons

## Design System

- **Colors**: Navy (#1E3A5F), Blue (#2563EB), White (#FFFFFF), Black (#000000)
- **Typography**: Playfair Display (headings), Merriweather (body)
- **Style**: Playful but professional

## Backend Connection

- Base URL: `http://localhost:8080`
- JWT authentication with access/refresh tokens
