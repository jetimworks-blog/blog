# Backend Change Summary (2026-05-13)

## New Feature: Email Attachment Upload

### Overview
Added support for uploading attachments (up to 5MB) when sending single emails via AppExecutePayload. Attachments are uploaded separately before executing the email send.

---

## API Endpoints

### 1. Upload Attachments
**Endpoint:** `POST /app/attachments/upload`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- Field name: `files` (multiple files allowed)

**Success Response (200):**
```json
{
  "success": true,
  "upload_id": "550e8400-e29b-41d4-a716-446655440000",
  "files": [
    {
      "filename": "invoice.pdf",
      "size": 1048576,
      "path": "/tmp/email-attachments/550e8400.../invoice.pdf"
    }
  ],
  "error": ""
}
```

**Error Responses:**
- `400`: No files provided
- `400`: File exceeds 5MB limit
- `413`: Total request too large

**Note:** The `path` field contains the server-side path needed for the execute call.

---

### 2. Execute Email (with attachments)
**Endpoint:** `POST /app/execute/confirm`

**Authentication:** Required (Bearer token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "process": "email",
  "to": "user@example.com",
  "subject": "Your Invoice",
  "html": "<p>Please find the invoice attached.</p>",
  "attachments": [
    {
      "filename": "invoice.pdf",
      "path": "/tmp/email-attachments/550e8400.../invoice.pdf"
    }
  ]
}
```

**Attachment Object Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | Display name for the attachment |
| `path` | string | Yes | Server path returned from upload endpoint |

**Success Response (200):**
```json
{
  "success": true,
  "output": "email sent to user@example.com",
  "error": ""
}
```

**Note:** After successful email send, attachment files are automatically deleted from the server.

---

## All App Endpoints

### App Endpoints (protected)
- `POST /app/execute` - Generate HTML preview
- `POST /app/execute/confirm` - Send email (now supports attachments)
- `GET /app/processes` - List valid processes
- `POST /app/attachments/upload` - Upload attachments (NEW)

---

## Payload Changes

### AppExecutePayload (execute/confirm)
Added `attachments` field:

```json
{
  "process": "email",
  "to": "user@example.com",
  "to_list": [],
  "cc": [],
  "bcc": [],
  "subject": "Subject",
  "html": "<p>HTML content</p>",
  "html_file": "",
  "prompt": "",
  "from_email": "",
  "from_name": "",
  "attachments": []  // NEW: array of Attachment objects
}
```

### Attachment Object
```json
{
  "filename": "invoice.pdf",
  "path": "/tmp/email-attachments/550e8400.../invoice.pdf"
}
```

---

## Flow

1. Client uploads attachments via `POST /app/attachments/upload` (multipart/form-data)
2. Server stores files in `/tmp/email-attachments/{uploadID}/`
3. Server returns `upload_id` and file info including `path`
4. Client calls `POST /app/execute/confirm` with attachment paths in payload
5. Server reads local files, sends email via Resend, then deletes temp files

---

## Validation
- Max file size: 5MB per file
- Files stored temporarily in `/tmp/email-attachments/` and auto-deleted after send
- Supports PDF, images, documents (no executables)