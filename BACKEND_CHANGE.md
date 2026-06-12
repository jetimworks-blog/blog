# Backend API Changes Summary (2026-06-11)

## New Feature: Style Check for HTML Generation

### Overview
Added `style` boolean field to the preview endpoint payload. When `style: true`, after the semantic check passes, a design check is performed to verify proper styling (colors, visual hierarchy, professional appearance). If design check fails, generation retries with lower temperature.

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
  "client_category": "detail",
  "style": true
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
      "created_at": "2026-06-11T12:00:00Z"
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
| `style` | boolean | No | Enable design check after semantic check (default: false) |
| `to` | string | For email | Primary recipient |
| `subject` | string | For email | Email subject |
| `html` | string | For email | Pre-generated HTML from preview |

### How Style Check Works
When `style: true`:
1. Generate HTML with temperature sweep (0.2 → 0.1 → 0.0)
2. Validate HTML structure
3. Semantic check (score >= 7 required)
4. **Design check** (score >= 7 required) - only if style=true
5. Return HTML or retry on failure

Design check evaluates:
- Visual styling (not just bare HTML tables)
- Colors for hierarchy and emphasis
- Fonts, spacing, layout
- Professional/polished appearance
- Alignment with original prompt's intent

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

- `POST /everything-app/app/execute` - Generate HTML preview (SUPPORTS client_prompt, client_category, style)
- `POST /everything-app/app/execute/confirm` - Send email (STORES client_prompt, client_category in history)
- `GET /everything-app/app/processes` - List valid processes
- `POST /everything-app/app/attachments/upload` - Upload attachments
- `GET /everything-app/email-history` - Get email history (RETURNS client_prompt, client_category)
