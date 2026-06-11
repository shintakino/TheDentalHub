# Feature 40: In-App Notifications in Navbar

## Overview
Implement a global, real-time in-app notification center accessible directly from the dashboard navbar (top bar or sidebar). This will keep clinic staff and owners instantly informed about critical events like new patient bookings, cancellations, low inventory stock, and emergency branch status changes without navigating away from their current workspace.

## Scope & Requirements
- **Notification Bell UI**: Add a bell icon to the global navigation bar with an unread badge counter.
- **Dropdown/Popover**: Clicking the bell opens a scrollable popover displaying recent notifications.
- **Notification Items**: 
  - Title and descriptive message.
  - Timestamp (relative, e.g., "5 mins ago").
  - Read/Unread visual state (e.g., unread has a blue dot or highlighted background).
  - Importance level (Low, Medium, High).
- **Interactivity**:
  - Click a notification to mark it as read.
  - "Mark all as read" button.
- **Data Source**: Pull from the existing `notifications` table in the database.
- **Real-time Synchronization**: Use polling (e.g., SWR with a 15-30s interval or `router.refresh()`) to keep the unread badge updated.

## Implementation Steps

### 1. Backend / API Layer
- **GET `/api/notifications`**: Fetch the current user's notifications, ordered by `createdAt` descending.
- **PATCH `/api/notifications/read`**: Accept an array of notification IDs or a "mark all" flag to update the `isRead` boolean in the database.

### 2. Frontend Component (`NotificationCenter.tsx`)
- Build a standalone client component using `shadcn/ui`'s `Popover` or `DropdownMenu`.
- Fetch data using `useSWR` mapped to the `/api/notifications` endpoint.
- Display the unread count in a `<Badge>` overlaid on the bell icon.
- Render the list of notifications, applying distinct styles for different importance levels (e.g., High = Red, Medium = Amber, Low = Blue/Slate).
- Implement the "Mark all as read" mutation function and trigger optimistic UI updates.

### 3. Integration
- Embed `<NotificationCenter />` into the global `Sidebar` or the top header (if a top header exists). 
- *Note: Since the dashboard heavily relies on the left Sidebar, the bell might sit nicely at the top or bottom of the `Sidebar.tsx`, or inside a floating header bar.*

## Impact on Existing Architecture
- Minimal. Just builds upon the existing `notifications` table defined in `lib/db/schema.ts` and adds a new interactive element to the persistent layout structure.

## Definition of Done
- Staff and Admins can see the bell icon on the dashboard.
- Unread count accurately reflects the database state.
- The popover gracefully handles empty states ("No new notifications").
- Clicking "Mark all as read" instantly clears the unread badge and updates the database.
