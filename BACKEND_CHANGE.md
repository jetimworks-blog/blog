# Backend Changes Summary (Last 3 Commits)

## New Endpoints

### POST /api/v1/auth/forgot-password
- **Payload**: `{ "email": "string" }`
- **Behavior**:
  - Checks rate limit for email
  - Generates OTP and sends email
  - Always returns: `{ "message": "If that email exists, an OTP has been sent" }`
- **Errors**: `rate_limit_exceeded` (429)

### POST /api/v1/auth/reset-password
- **Payload**:
```json
{
  "email": "string",
  "otp": "string (6 digits)",
  "new_password": "string (min 8 chars)"
}
```
- **Behavior**:
  - Checks attempt rate limit
  - Validates OTP
  - Validates password strength (min 8 chars)
  - Updates user password
  - Deletes OTP after successful validation
- **Errors**:
  - `too_many_attempts` (429)
  - `invalid_otp` (400)
  - `password_too_short` (400)

## New Error Types
- `ErrRateLimitExceeded` (429)
- `ErrTooManyAttempts` (429)
- `ErrInvalidOTP` (400)
- `ErrOTPExpired` (400)

## Services Required
- `OTPService` - methods: `CheckRateLimit`, `Generate`, `Validate`, `Delete`, `IncrementAttempt`, `ClearAttempts`
- `EmailService` - methods: `SendOTP`

## File Changes
- `cmd/main.go` - wire up integrations
- `domain/errors.go` - new error types
- `internal/rest/auth.go` - forgot-password and reset-password handlers
- `internal/rest/handler.go` - Utils struct updated with OTPService and EmailService
- `pkg/auth/password.go` - new `ValidatePasswordStrength` function
