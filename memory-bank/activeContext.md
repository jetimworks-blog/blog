# Active Context

## Branding Update (April 22, 2026)

The app has been rebranded from "Email Crafter" to **KraftMail** by **Jetimworks**.

Updated files:
- src/components/layout/Navbar.jsx - Changed app name to KraftMail
- src/components/layout/Footer.jsx - Changed app name and copyright
- src/pages/LandingPage.jsx - Changed app name, heading, and footer
- index.html - Updated title to "KraftMail - AI-Powered Email Crafting by Jetimworks"
- README.md - Completely rewritten with KraftMail branding
- CLAUDE.md - Updated project name
- public/favicon.svg - New "K" letter icon
- memory-bank/ - All documentation updated

## Current Status

✅ **Build passing** - All critical issues resolved as of April 2026

## Recent Changes

1. Updated .env.production (April 17, 2026):
   - Updated staging API URL to `https://mobile-api-staging.omitsfx.com`
   - Simplified variable comments

2. Fixed PostCSS/TailwindCSS v4 configuration
   - Removed conflicting postcss.config.js
   - Using @tailwindcss/vite plugin exclusively

3. Fixed AuthContext export
   - Added `export` keyword to AuthContext

4. Fixed UI issues (April 11, 2026):
   - Button centering on LoginPage and RegisterPage
   - Password strength counter color at 5/5 (now green, not disappearing)
   - Password requirements now always visible with green checkmarks
   - Moved "By Jetimworks" to footer copyright section

5. Fixed EmailResult page error handling
   - Now shows proper error state with retry options when API fails

6. Added Sender Configuration (April 11, 2026):
   - Added `validateSenderEmail()` to validation.js
   - Added Sender Information section to SettingsPage
   - Includes from_email and from_name fields
   - Independent "Save Sender Information" button
   - Backend API: POST/GET /v1/config supports from_email/from_name

7. Fixed Email Send Success Handling (April 11, 2026):
   - Fixed YoloEmailForm and DetailedEmailForm to handle empty output
   - API returns `{"success": true, "output": ""}` on successful send
   - Now shows "Email sent!" toast and navigates to result page
   - Falls back to "Email sent successfully!" when output is empty

8. Backend API Changes (April 11, 2026):
   - YoloEmailForm now sends `process: 'gen-email'` (same as Detailed form)
   - History page: cards are fully clickable, resend preloads form data
   - Error handling: forms redirect to /result with error state on API failure
   - EmailResult page: never blank, shows "Something went wrong" with navigation options

9. Enhanced MagicLoader (April 12, 2026):
   - Expanded from 4 to 6 progress steps for more detailed feedback
   - Added "Generate email from prompt" and "Send email" steps
   - New fun facts section that rotates every 4 seconds with email statistics
   - Smaller icon sizes (20px) for better mobile responsiveness
   - Better responsive layout with flex-wrap and max-width constraints

10. Variable Loading Animation (April 12, 2026):
    - Both YOLO and Detailed forms now use setTimeout (not setInterval)
    - Variable step durations: steps 2 & 5 take 10s, others take 5s
    - Total animation duration: 40 seconds (5+10+5+5+10+5)
    - Submit buttons now have `disabled={isLoading}` to prevent double-submit

11. Two-Step Email Workflow (April 12, 2026):
    - Backend now splits email execution into preview and confirm steps
    - **Preview Step**: POST /app/execute with `process: "gen"` generates HTML without sending
    - **Confirm Step**: POST /app/execute/confirm with `process: "email"`, `to`, `subject`, `html` sends email
    - Both YoloEmailForm and DetailedEmailForm now show HTML preview before sending
    - Users can regenerate preview with updated prompt
    - Added `emailAPI.confirm()` method to api.js

12. Network Configuration (April 12, 2026):
    - Added `server.host: '0.0.0.0'` to vite.config.js for network access
    - Updated API base URL to `http://172.20.10.3:8080` for network development
    - Updated memory bank documentation with network configuration details
    - Normalized escaped quotes in page components to proper apostrophes

13. Default Sender Information (April 15, 2026):
    - Updated HomePage banner to show users can send emails from "free-email@jetimworks.com"
    - Updated SettingsPage hint text: "free-email@jetimworks.com" with sender name "Anonymous"
    - Sender Information fields now pre-fill with defaults: email = "free-email@jetimworks.com", name = "Anonymous"

14. HTML Preview Improvements (April 15, 2026):
    - Made HTML preview containers 100% wide in YoloEmailForm and DetailedEmailForm
    - Added `[&_table]:w-full [&_*]:max-w-full` CSS classes for full-width rendering

15. History Page Improvements (April 15, 2026):
    - Removed All/YOLO/Detailed filter tabs
    - History items now show all records together
    - Prompt is now always visible in history cards (shows first 2 lines with line-clamp-2)

16. Backend Fix (April 15, 2026):
    - Backend now saves prompts in email history when using preview endpoint
    - No frontend changes needed - backend fix ensures prompts are persisted

17. Sender Name in Email Prompt (April 17, 2026):
    - Added "Sign the email that it is from [name]" instruction to AI-generated prompts
    - Both YoloEmailForm and DetailedEmailForm now append this instruction
    - If from_name is "Anonymous" or empty, extracts name from user's email (e.g., "john.doe@gmail.com" → "John Doe")
    - Uses `configAPI.get()` to fetch sender configuration on mount
    - Helper functions: `extractNameFromEmail()` and `getSenderName()` added to both forms

18. Prompt in Confirm Payload (April 17, 2026):
    - Added prompt to confirm payload sent to backend
    - Saves enhancedPrompt to `sessionStorage.setItem('pendingPrompt', enhancedPrompt)` after HTML generation
    - On send, includes `prompt: savedPrompt` in confirmPayload
    - Clears sessionStorage with `sessionStorage.removeItem('pendingPrompt')` after successful send
    - Applies to both YoloEmailForm and DetailedEmailForm
    - Confirm payload now: `{ process: "email", to, subject, html, prompt }`

19. Custom Tone Only (April 17, 2026):
    - When user selects "Describe my own" in DetailedEmailForm, only their custom description is used
    - Preset styles (Style, Font, Color, Feel, Width, Border, Shadow, Spacing, Header) are skipped
    - Word count, key message, CTA, and sender name are always included

20. Branding Update (April 22, 2026):
    - Rebranded from "Email Crafter" to "KraftMail"
    - Updated all UI components, documentation, and favicon

## Current Focus

- Application is built and ready for testing
- Backend should be running on port 8080
- Remote development workflow with network access enabled

## Next Steps

1. Test authentication flow
2. Verify email composition modes work (with new preview workflow)
3. Test history and settings pages
4. Test sender configuration persists
5. Test two-step workflow: generate preview → review → send
6. Test network access from remote devices

## Important Patterns

- Always use `export const` for context exports
- TailwindCSS v4 uses `@theme` directive (not tailwind.config.js)
- No PostCSS config needed when using @tailwindcss/vite
- Password strength uses `checks` object with: length, lowercase, uppercase, number, special
- Email API success: `response.data.success === true || response.status === 200`
- Sender config payload: `{ from_email, from_name }` (optional fields)
- Result page handles missing state gracefully - redirects to home
- Loading animation uses setTimeout chain: `stepDurations = [5000, 10000, 5000, 5000, 10000, 5000]`
- **Two-step email workflow**: Generate preview first, then confirm to send
- Preview payload: `{ process: "gen", prompt: "..." }`
- Confirm payload: `{ process: "email", to, subject, html, prompt }`
- Prompt persistence: `sessionStorage.setItem('pendingPrompt', ...)` after generation, cleared after send
- **Network development**: Vite server accessible at `http://0.0.0.0:5173`, API at `http://172.20.10.3:8080`
- **Default sender**: emails come from `free-email@jetimworks.com` with name `Anonymous`
- **History page**: no filter tabs, all items shown together, prompt always visible
- **Branding**: App name is "KraftMail", created by "Jetimworks"

## New User Onboarding Flow (April 17, 2026)
- Registration sets `localStorage.setItem('justSignedUp', 'true')`
- HomePage checks for `justSignedUp` + `!settingsUpdated` to show "Update Your Sender Details" warning
- SettingsPage saves `localStorage.setItem('settingsUpdated', 'true')` on successful save
- SettingsPage has advisory: "Only change Sender Name if no valid Resend API Key"
- Warning cleared after first settings save

## Password Reset Flow (April 22, 2026)
- Added ForgotPasswordPage and ResetPasswordPage routes in App.jsx
- Added `forgotPassword()` and `resetPassword()` functions to AuthContext
- API endpoints: `POST /auth/forgot-password`, `POST /auth/reset-password`
- Forgot Password link added to LoginPage
- OTP-based reset with rate limiting
- Always returns success to prevent email enumeration
