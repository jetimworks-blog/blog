# Backend API Changes Summary (2026-05-17)

## New Feature: ClientPrompt and ClientCategory for Preview Endpoint

### Overview
Added `client_prompt` and `client_category` fields to the preview endpoint payload. These are stored in email history alongside the generated HTML. When generating the email, `client_prompt` is prepended to the normal prompt.

---

## API Endpoints

### 1. Preview (Generate HTML)
**Endpoint:** `POST /everything-app/app/execute`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "process": "gen",
  "prompt": "Write an email about our new product",
  "client_prompt": "Use a friendly tone",
  "client_category": "detail"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "output": "<html>...</html>",
  "error": ""
}
```

### 2. Confirm (Send Email)
**Endpoint:** `POST /everything-app/app/execute/confirm`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "process": "email",
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<html>...</html>",
  "client_prompt": "Use a friendly tone",
  "client_category": "detail"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "output": "email sent to recipient@example.com",
  "error": ""
}
```

### 3. Email History
**Endpoint:** `GET /everything-app/email-history`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `limit` (int, optional)
- `offset` (int, optional)

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "process": "email",
      "to": "recipient@example.com",
      "to_list": [],
      "cc": [],
      "bcc": [],
      "subject": "Email Subject",
      "prompt": "Write an email about our new product",
      "client_prompt": "Use a friendly tone",
      "client_category": "detail",
      "generated_html": "<html>...</html>",
      "success": true,
      "error_message": null,
      "duration_ms": 1234,
      "created_at": "2026-05-17T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

## Payload Changes

### AppExecutePayload Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `process` | string | Yes | "gen" for preview, "email" for confirm |
| `prompt` | string | Yes for gen | The main prompt for HTML generation |
| `client_prompt` | string | No | Prepended to prompt before sending to AI |
| `client_category` | string | No | Either "yolo" or "detail" |
| `to` | string | For email | Primary recipient |
| `subject` | string | For email | Email subject |
| `html` | string | For email | Pre-generated HTML from preview |

### How ClientPrompt Works
The `client_prompt` is concatenated with the normal `prompt` before sending to the HTML generation AI:
```
client_prompt + "\n\n" + prompt
```

Example: If `client_prompt` = "Use a friendly tone" and `prompt` = "Write an email about our product", the AI receives:
```
Use a friendly tone

Write an email about our product
```

---

## All App Endpoints

- `POST /everything-app/app/execute` - Generate HTML preview (NOW SUPPORTS client_prompt, client_category)
- `POST /everything-app/app/execute/confirm` - Send email (NOW STORES client_prompt, client_category in history)
- `GET /everything-app/app/processes` - List valid processes
- `POST /everything-app/app/attachments/upload` - Upload attachments
- `GET /everything-app/email-history` - Get email history (NOW RETURNS client_prompt, client_category)