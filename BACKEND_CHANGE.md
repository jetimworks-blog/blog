# Email Campaign Backend Integration Guide

## Overview

The campaign system is a complete email marketing solution with async sending via Redis queues, merge tag personalization, open/click tracking, and resumable batch processing.

**Base URL:** `/everything-app`
**Auth:** Bearer token (JWT) required on all `/campaigns/*` endpoints except tracking pixels

---

## Table of Contents

1. [Data Models](#1-data-models)
2. [Campaign Workflows](#2-campaign-workflows)
3. [API Endpoints](#3-api-endpoints)
4. [Request/Response Payloads](#4-requestresponse-payloads)
5. [Queue & Worker System](#5-queue--worker-system)
6. [Tracking System](#6-tracking-system)
7. [Merge Tags & Personalization](#7-merge-tags--personalization)
8. [Error Handling](#8-error-handling)
9. [Frontend Integration Checklist](#9-frontend-integration-checklist)

---

## 1. Data Models

### Campaign

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner (indexed) |
| `name` | string | Campaign name (max 255) |
| `status` | enum | `draft`, `scheduled`, `sending`, `completed`, `cancelled` |
| `subject` | string | Email subject line |
| `html_body` | text | Full HTML email content |
| `csv_filename` | *string | Original CSV filename |
| `csv_row_count` | *int | Number of recipients |
| `sent_count` | *int | Emails successfully sent |
| `failed_count` | *int | Emails that failed |
| `rate_limit` | int | Emails per minute (default 60) |
| `schedule_type` | enum | `one_time`, `recurring` |
| `scheduled_at` | *time | For one-time scheduled sends |
| `cron_expression` | *string | For recurring campaigns |
| `track_opens` | bool | Enable open tracking (default true) |
| `track_clicks` | bool | Enable click tracking (default true) |
| `created_at` | time | Creation timestamp |
| `updated_at` | time | Last update timestamp |

### CampaignRecipient

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `campaign_id` | UUID | FK to Campaign (indexed) |
| `email` | string | Recipient email address |
| `merge_data` | JSONB | Per-recipient merge variables |
| `status` | enum | `pending`, `sent`, `failed`, `bounced` |
| `sent_at` | *time | When email was sent |
| `opened_at` | *time | When open pixel fired |
| `clicked_at` | *time | When link was clicked |
| `error_message` | *string | Error if failed |

### CampaignSendJob (Redis Queue)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Job primary key |
| `campaign_id` | UUID | Target campaign |
| `status` | enum | `queued`, `running`, `done`, `failed` |
| `cursor` | int | Last processed recipient index (for resume) |
| `queued_at` | time | When job was enqueued |
| `started_at` | *time | When worker picked it up |
| `completed_at` | *time | When job finished |
| `locked_by` | string | Worker ID holding the lock |

---

## 2. Campaign Workflows

### Workflow A: Standard Campaign (Draft → Send Now)

```
[CREATE] → [UPLOAD_CSV] → [SEND] → [ASYNC_SENDING] → [COMPLETED]
```

1. **Create Campaign** (`POST /campaigns`) — Creates in `draft` status
2. **Upload CSV** (`POST /campaigns/{id}/upload`) — Attaches recipients
3. **Send Campaign** (`POST /campaigns/{id}/send`) — Status: `draft` → `sending`, enqueues job to Redis
4. **Worker processes** asynchronously — Batches of 70, respects rate limit
5. **Complete** — When all recipients processed, status stays `sending` (worker updates individual recipients)

### Workflow B: Scheduled Campaign (Draft → Scheduled → Send)

```
[CREATE] → [UPLOAD_CSV] → [SCHEDULE] → [SCHEDULED] → [SEND at scheduled time] → [ASYNC_SENDING]
```

1. **Create Campaign** (`POST /campaigns`)
2. **Upload CSV** (`POST /campaigns/{id}/upload`)
3. **Schedule Campaign** (`POST /campaigns/{id}/schedule`) — Status: `draft` → `scheduled`
4. **Send Campaign** (`POST /campaigns/{id}/send`) — Allowed from `scheduled` status
5. **Worker processes** asynchronously

### Workflow C: Cancel Campaign

```
[SCHEDULED|SENDING] → [CANCEL] → [CANCELLED]
```

- Cancel is allowed when status is `scheduled` or `sending`
- Worker periodically checks campaign status; stops if `cancelled`

### Workflow D: Recurring Campaign (Cron-based)

```
[CREATE] → [UPLOAD_CSV] → [SCHEDULE with cron_expression] → [SCHEDULED] → [auto-send on cron schedule]
```

- `schedule_type`: `recurring`
- `cron_expression`: standard 5-field cron (e.g., `"0 9 * * 1-5"` for 9am weekdays)
- Worker processes on schedule (requires external cron trigger in current implementation)

---

## 3. API Endpoints

All campaign endpoints require authentication via Bearer token in `Authorization` header.

### Campaigns CRUD

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/everything-app/campaigns` | Create new campaign |
| `GET` | `/everything-app/campaigns` | List user's campaigns (paginated) |
| `GET` | `/everything-app/campaigns/{id}` | Get single campaign |
| `PUT` | `/everything-app/campaigns/{id}` | Update campaign (draft only) |
| `DELETE` | `/everything-app/campaigns/{id}` | Delete campaign (draft only) |

### Campaign Actions

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/everything-app/campaigns/{id}/upload` | Upload recipient CSV |
| `POST` | `/everything-app/campaigns/{id}/schedule` | Schedule campaign |
| `POST` | `/everything-app/campaigns/{id}/send` | Trigger send immediately |
| `POST` | `/everything-app/campaigns/{id}/cancel` | Cancel campaign |
| `GET` | `/everything-app/campaigns/{id}/recipients` | List recipients (paginated) |
| `GET` | `/everything-app/campaigns/{id}/stats` | Get campaign statistics |

### Tracking (No Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/everything-app/t/{campaign_id}/{recipient_id}/open` | Open tracking pixel |
| `GET` | `/everything-app/t/{campaign_id}/{recipient_id}/redirect?url={base64}` | Click tracking redirect |

---

## 4. Request/Response Payloads

### POST /campaigns — Create Campaign

**Request:**
```json
{
  "name": "Summer Promo 2026",
  "subject": "Hi {{first_name}}, check out our summer sale!",
  "html_body": "<h1>Hello {{first_name}}</h1><p>Visit {{company}}...</p>",
  "rate_limit": 60,
  "track_opens": true,
  "track_clicks": true
}
```

**Response** (`201 Created`):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Summer Promo 2026",
  "status": "draft",
  "subject": "Hi {{first_name}}, check out our summer sale!",
  "html_body": "<h1>Hello {{first_name}}</h1><p>Visit {{company}}...</p>",
  "csv_filename": null,
  "csv_row_count": null,
  "sent_count": null,
  "failed_count": null,
  "rate_limit": 60,
  "schedule_type": "one_time",
  "scheduled_at": null,
  "cron_expression": null,
  "track_opens": true,
  "track_clicks": true,
  "created_at": "2026-05-03T10:00:00Z",
  "updated_at": "2026-05-03T10:00:00Z"
}
```

### PUT /campaigns/{id} — Update Campaign

Same request body as create. Only allowed when `status === "draft"`.

**Response:** `200 OK` with updated campaign object.

### POST /campaigns/{id}/upload — Upload CSV

**Request:** `multipart/form-data` with field `file`

```
Content-Disposition: form-data; name="file"; filename="recipients.csv"
Content-Type: text/csv
```

**CSV Format:**
```csv
email,first_name,company
john@example.com,John,Acme Inc
jane@example.com,Jane,TechCorp
```

- First column MUST be `email` (case-insensitive)
- Additional columns become merge variables
- Empty rows and malformed rows are skipped

**Response:** `200 OK` with updated campaign object. Now includes `csv_row_count`.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "csv_filename": "recipients.csv",
  "csv_row_count": 2,
  ...
}
```

### POST /campaigns/{id}/schedule — Schedule Campaign

**Request (one-time):**
```json
{
  "schedule_type": "one_time",
  "scheduled_at": "2026-06-01T09:00:00Z"
}
```

**Request (recurring):**
```json
{
  "schedule_type": "recurring",
  "cron_expression": "0 9 * * 1-5"
}
```

**Response:** `200 OK` with campaign status now `"scheduled"`.

### POST /campaigns/{id}/send — Send Campaign

**Request:** Empty body

**Response:** `200 OK` with campaign status now `"sending"`.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "sending",
  ...
}
```

**Behavior:**
- Status transitions to `sending` immediately
- `CampaignSendJob` is enqueued to Redis
- HTTP response returns immediately
- Worker processes job asynchronously

### POST /campaigns/{id}/cancel — Cancel Campaign

**Request:** Empty body

**Response:** `200 OK` with campaign status now `"cancelled"`.

### GET /campaigns/{id}/recipients — List Recipients

**Query params:** `limit` (default 20, max 100), `offset` (default 0)

**Response:**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "campaign_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "merge_data": {"first_name": "John", "company": "Acme Inc"},
      "status": "sent",
      "sent_at": "2026-05-03T10:05:00Z",
      "opened_at": "2026-05-03T10:10:00Z",
      "clicked_at": null,
      "error_message": null
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

### GET /campaigns/{id}/stats — Get Statistics

**Response:**
```json
{
  "total": 100,
  "sent": 85,
  "failed": 5,
  "csv_row_count": 100,
  "status": "sending"
}
```

### GET /campaigns — List Campaigns

**Query params:** `limit` (default 20, max 100), `offset` (default 0)

**Response:**
```json
{
  "data": [...],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

---

## 5. Queue & Worker System

### Job Flow

```
HTTP POST /campaigns/{id}/send
         │
         ▼
    CampaignStatus → "sending"
         │
         ▼
    Redis: Enqueue CampaignSendJob { status: "queued" }
         │
         ▼
    HTTP 200 OK (returns immediately)
         │
         ▼
    Worker (cmd/worker/main.go)
         │
         ├── DequeueJob() → finds "queued" job, atomically claims it
         │
         ├── Status: "queued" → "running"
         │
         ├── Lock: SETNX "campaign:lock:{job_id}:{worker_id}" TTL 5min
         │
         └── SendCampaign()
              │
              ├── Fetch recipients in batches of 70
              ├── Build batch email requests
              ├── Send via Resend Batch API
              ├── Update recipient status (pending → sent/failed)
              ├── Respect rate_limit (batches per minute)
              │
              └── Every 10 batches: RenewLock()
```

### Worker Lock Mechanism

- **Lock TTL:** 5 minutes
- **Lock key pattern:** `campaign:lock:{job_id}:{worker_id}`
- **Renewal:** Every 700 recipients (10 batches of 70)
- **If worker crashes:** Lock expires, other workers can pick up via `DequeueJob` Lua script

### Cursor & Resume

- `cursor` field tracks last processed recipient index
- If job is interrupted, new worker picks up from cursor position
- Cursor is updated via `UpdateCursor()` after each batch

### Job Status Transitions

```
queued → running → done
                 └──→ failed
```

### Rate Limiting

- `rate_limit` = batches per minute
- `delayPerBatch = 1 minute / rate_limit`
- Default unlimited if `rate_limit = 0`
- Default `rate_limit = 60` if not set

---

## 6. Tracking System

### Open Tracking

**How it works:**
1. When HTML is built, if `track_opens == true`, inject hidden 1x1 pixel image at end of body:
   ```html
   <img src="/t/{campaign_id}/{recipient_id}/open" width="1" height="1" style="display:none" alt="" />
   ```
2. When recipient opens email, their email client loads the pixel
3. Request hits `GET /t/{campaign_id}/{recipient_id}/open`
4. Handler updates `CampaignRecipient`:
   - `status` → `sent` (already set when sent)
   - `opened_at` → current time

**Note:** Some email clients block images by default; open tracking is best-effort.

### Click Tracking

**How it works:**
1. When HTML is built, if `track_clicks == true`, rewrite all `href="http..."` links:
   ```html
   <!-- Original -->
   <a href="https://example.com/promo">Click here</a>

   <!-- Rewritten -->
   <a href="/t/{campaign_id}/{recipient_id}/redirect?url=_base64_encoded_url">Click here</a>
   ```
2. When recipient clicks link:
   - Request hits redirect endpoint with encoded destination URL
   - Handler updates `CampaignRecipient`:
     - `clicked_at` → current time
   - Immediately redirects (302) to original URL

**Implementation:** Simple string replacement, not a full HTML parser. Works for basic HTML.

### Tracking Endpoint URLs

| Endpoint | Purpose |
|----------|---------|
| `/t/{campaign_id}/{recipient_id}/open` | 1x1 transparent GIF, fires open tracking |
| `/t/{campaign_id}/{recipient_id}/redirect?url={base64}` | Redirects to original URL, fires click tracking |

**These endpoints are public (no auth required)** — they must work for external email clients.

---

## 7. Merge Tags & Personalization

### Supported Merge Tags

Merge tags use Go `text/template` syntax: `{{variable_name}}`

### Template Variables

In your `subject` and `html_body`, use any column header from the CSV:

```csv
email,first_name,last_name,company
john@example.com,John,Doe,Acme Inc
```

```html
<h1>Hello {{first_name}} {{last_name}}</h1>
<p>Welcome to {{company}}!</p>
```

### How Merge Works

1. CSV upload stores per-recipient merge data as JSONB in `merge_data` column
2. When worker builds batch email requests, it:
   - Fetches `merge_data` for each recipient
   - Calls `MergeTemplate(subject, mergeData)`
   - Calls `MergeTemplate(htmlBody, mergeData)`
   - Substitutes `{{variable}}` with values from recipient's row

### Example

**Recipient row:**
```json
{"first_name": "John", "company": "Acme Inc"}
```

**Template:**
```html
<h1>Hello {{first_name}}</h1>
<p>Thanks for being a {{company}} customer!</p>
```

**Result:**
```html
<h1>Hello John</h1>
<p>Thanks for being a Acme Inc customer!</p>
```

---

## 8. Error Handling

### Campaign-Level Errors

| Error | HTTP Status | Cause |
|-------|-------------|-------|
| Campaign not found | 404 | Invalid campaign ID |
| Campaign not in draft | 400 | Update/delete attempted on non-draft |
| No recipients | 400 | Send attempted before CSV upload |
| Must be draft/scheduled | 400 | Send attempted from invalid status |

### CSV Upload Errors

| Error | HTTP Status | Cause |
|-------|-------------|-------|
| File required | 400 | No file uploaded |
| Parse error | 400 | Malformed CSV |
| Missing email column | 400 | CSV has no email column |

### Schedule Errors

| Error | HTTP Status | Cause |
|-------|-------------|-------|
| Invalid scheduled_at | 400 | Not RFC3339 format |
| Invalid cron_expression | 400 | Invalid cron syntax |
| No recipients | 400 | Trying to schedule without recipients |

### Worker Errors

- **Redis connection failure:** Logged, job stays `queued` for retry
- **Resend API failure:** Batch marked as failed, individual recipients updated with error
- **Campaign cancelled mid-send:** Worker checks status each batch and exits gracefully

### Queue Errors

- `EnqueueJob` failure after campaign set to `sending`: Logged but HTTP returns 200 (campaign already transitioned)
- Worker crash: Lock expires, job remains `running`, can be reclaimed

---

## 9. Frontend Integration Checklist

### Campaign Creation Flow

- [ ] POST `/campaigns` with name, subject, html_body, rate_limit, track_opens, track_clicks
- [ ] Store returned `id` and `status === "draft"`
- [ ] Display campaign editor with subject/html_body fields

### CSV Upload

- [ ] File input accepting `.csv`
- [ ] Multipart form upload with field name `file`
- [ ] Show upload progress
- [ ] Update UI with `csv_row_count` and `csv_filename` after success

### Scheduling

- [ ] Date/time picker for `scheduled_at` (RFC3339: `2026-06-01T09:00:00Z`)
- [ ] Cron expression input for `recurring` type
- [ ] Show campaign status as `scheduled` after scheduling

### Sending

- [ ] Send button enabled when `status === "draft"` or `status === "scheduled"`
- [ ] Confirm dialog before sending
- [ ] POST `/campaigns/{id}/send`
- [ ] Switch UI to "sending" state immediately (don't wait for completion)
- [ ] Poll `/campaigns/{id}/stats` every 10 seconds for progress
- [ ] Show sent_count and failed_count from stats

### Recipient Management

- [ ] List recipients via GET `/campaigns/{id}/recipients`
- [ ] Show status badges: pending (gray), sent (green), failed (red)
- [ ] Show opened_at / clicked_at timestamps if available
- [ ] Pagination with limit/offset

### Statistics

- [ ] GET `/campaigns/{id}/stats` for dashboard
- [ ] Show progress bar: `(sent_count + failed_count) / csv_row_count`
- [ ] Show failed_count if > 0

### Cancellation

- [ ] Cancel button enabled when `status === "scheduled"` or `status === "sending"`
- [ ] POST `/campaigns/{id}/cancel`
- [ ] Update UI to show `status === "cancelled"`

### Tracking Preview

- [ ] In email preview, show placeholder pixels for open tracking
- [ ] In email preview, show rewritten URLs for click tracking
- [ ] Clearly indicate tracking is enabled/disabled based on campaign settings

### Error States

- [ ] Display validation errors from API
- [ ] Show toast notifications for async failures
- [ ] Retry mechanism for failed sends (re-upload CSV and send again)

---

## Example Integration: Full Campaign Creation to Send

```javascript
// 1. Create campaign
const createRes = await fetch('/everything-app/campaigns', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Campaign',
    subject: 'Hello {{first_name}}!',
    html_body: '<p>Welcome to our service, {{first_name}}!</p>',
    rate_limit: 60,
    track_opens: true,
    track_clicks: true
  })
});
const campaign = await createRes.json();
// campaign.id = '...', campaign.status = 'draft'

// 2. Upload recipients CSV
const formData = new FormData();
formData.append('file', csvFile);
const uploadRes = await fetch(`/everything-app/campaigns/${campaign.id}/upload`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
const updatedCampaign = await uploadRes.json();
// updatedCampaign.csv_row_count = 150

// 3. Schedule (or send immediately)
const scheduleRes = await fetch(`/everything-app/campaigns/${campaign.id}/schedule`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schedule_type: 'one_time',
    scheduled_at: '2026-06-01T09:00:00Z'
  })
});
// scheduleRes.status = 200, campaign.status = 'scheduled'

// 4. Send
const sendRes = await fetch(`/everything-app/campaigns/${campaign.id}/send`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
// sendRes.status = 200, campaign.status = 'sending'

// 5. Poll for stats
setInterval(async () => {
  const statsRes = await fetch(`/everything-app/campaigns/${campaign.id}/stats`);
  const stats = await statsRes.json();
  console.log(`${stats.sent}/${stats.total} sent`);
  if (stats.sent + stats.failed >= stats.csv_row_count) {
    console.log('Sending complete!');
  }
}, 10000);
```

---

## Appendix: Status State Machine

```
                    ┌──────────────┐
                    │    draft     │
                    └──────┬───────┘
                           │ upload CSV
                           ▼
         ┌──────────────────────┐
         │      draft          │
         │ (has recipients)    │
         └──────────┬───────────┘
                    │ schedule()
                    ▼
    ┌───────────────┴───────────────┐
    │         scheduled            │
    └───────────────┬───────────────┘
                    │ send()
                    ▼
         ┌──────────────────┐
         │     sending      │◄──────────┐
         └────────┬────────┘           │
                  │                  │ send() (retry)
                  │ all processed    │
                  ▼                  │
         ┌──────────────────┐        │
         │   completed     │         │
         └──────────────────┘        │
                                    │
         ┌──────────────────┐       │
         │   cancelled      │────────┘
         └──────────────────┘
```

**Valid transitions:**
- `draft` → `scheduled` (via `schedule()`)
- `draft` → `sending` (via `send()`)
- `scheduled` → `sending` (via `send()`)
- `scheduled` → `cancelled` (via `cancel()`)
- `sending` → `cancelled` (via `cancel()`)
- `draft` → deleted (via `delete()` — only in draft)
