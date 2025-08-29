# Meeting List Component: Dual Source Integration

## Overview
This document describes the enhancements made to the `meeting-list` component in the Meeting Manager application. The component now displays meetings from both the Meeting Manager backend and the n8n automation platform, providing users with a unified view of all meetings.

## Features
### 1. Dual Source Meeting Retrieval
- **Meeting Manager Backend:** Meetings are fetched using the existing service (`MeetingService`).
- **n8n Workflow Integration:** Meetings created in n8n are retrieved via a POST request to `https://g37-ventures1.app.n8n.cloud/webhook/operations` (the n8n webhook endpoint) with the payload `{ action: 'get_events' }`.

### 2. Merging and Sorting
- Meetings from both sources are merged into a single list.
- The list is sorted by newest first (based on meeting date/time).

### 3. Source Distinction in UI
- Each meeting displays a badge indicating its source:
  - **Meeting Manager:** A blue Angular Material chip labeled "Meeting Manager".
  - **n8n:** An accent-colored chip labeled "n8n".

### 4. Error Handling
- If the n8n API is unreachable, only local meetings are shown.
- A user-friendly error message is displayed: "Only meetings created locally (within the tool) are currently visible due to lost connection."

### 5. Filtering and Actions
- Existing filtering and sorting features remain functional.
- Edit actions are only available for meetings created in Meeting Manager.

## Technical Details
- The component uses Angular's `HttpClient` to make API calls.
- TypeScript type annotations were added for improved type safety.
- Required Angular modules (`@angular/material`, `@angular/common`, `@angular/router`, `tslib`) were installed.

## UI Example
| Title                | Date       | Source          | Actions |
|----------------------|------------|-----------------|---------|
| Project Kickoff      | 2025-09-01 | Meeting Manager | Edit    |
| Sales Sync           | 2025-09-02 | n8n             |         |

## How It Works
1. On component initialization, meetings are fetched from both sources.
2. Meetings are merged, sorted, and displayed with source badges.
3. If n8n is unavailable, the user is notified and only local meetings are shown.

## Extensibility
- The integration pattern allows for additional sources to be added in the future.
- UI badges can be customized for new sources.

## File Changes
- `meeting-list.component.ts`: Logic for dual API calls, merging, sorting, error handling, and source distinction.
- `meeting-list.component.html`: UI updates for badges and error messages.

---
For further details or to extend this functionality, see the code comments in the component files.
