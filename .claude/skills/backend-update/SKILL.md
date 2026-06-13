---
name: backend-update
description: Use when frontend needs to implement API changes documented in BACKEND_CHANGE.md — manually invoked only
---

# Backend Update

## Overview

Manually invoked skill that reads BACKEND_CHANGE.md, identifies frontend-relevant changes, and implements them. Skips changes already implemented in the frontend codebase.

## When to Use

Manually invoked via `Skill` tool when BACKEND_CHANGE.md contains new changes to implement.

## Process

### 1. Read BACKEND_CHANGE.md

Read the file at project root: `BACKEND_CHANGE.md`

### 2. Identify Changes

Extract:
- New payload fields (what to send)
- New response fields (what to expect back)
- Which endpoints are affected
- Request/response format changes

### 3. Check What's Already Implemented

Search the frontend codebase for each change:
- Look for field names in API payloads
- Look for field names in response handling
- Note which changes are missing

### 4. Implement Missing Changes

For each unimplemented change:

**API layer** (`src/lib/api.js`):
- Update function signatures if needed
- Add new fields to payloads

**Form components** (in `src/pages/`):
- Add new fields to API payloads (execute, confirm)
- Handle new response fields if displayed

**Other components** as needed:
- History display, result pages, etc.

### 5. Skip Already-Implemented

If a field is already being passed or handled, leave it as-is.

## Implementation Rules

- Only add new fields — don't modify existing working code
- Keep same data types and formats as documented
- Use same field names as documented in BACKEND_CHANGE.md
- Maintain consistency across both preview and confirm payloads