# Clinic Operations Management Design Spec

**Date:** 2026-05-06
**Status:** Approved

## Goal
Provide Clinic Owners (`org:admin`) with tools to manage branches, services, and staff, ensuring strict data isolation and adherence to the "High-End Clinical" design system.

## Domain Model

### Branches
- **Table:** `branches`
- **Fields:**
    - `id` (UUID, PK)
    - `tenant_id` (Text, FK to clinics)
    - `name` (Text, Not Null)
    - `address` (Text)
    - `timezone` (Text, default "UTC")
    - `operating_hours` (JSONB): Array of objects `{ day: number, open: string, close: string, active: boolean }`.
- **Invariants:**
    - Every branch must belong to a tenant.
    - Soft-deletion logic for branches with active appointments (restricted deletion).

### Services
- **Table:** `services`
- **Fields:**
    - `id` (UUID, PK)
    - `tenant_id` (Text, FK to clinics)
    - `name` (Text, Not Null)
    - `duration` (Integer, minutes)
- **Invariants:**
    - Every service must belong to a tenant.
    - Restricted deletion if active appointments exist.

### Staff
- **Clerk Integration:** Primary source of truth for identity and roles.
- **Table:** `staff` (Synchronized cache)
- **Fields:**
    - `id` (UUID, PK)
    - `tenant_id` (Text, FK to clinics)
    - `user_id` (Text, Clerk User ID)
    - `name` (Text)
    - `role` (Text)
    - `target_daily_hours` (Integer)

## API Architecture

### Middleware & Security
- All management routes (`/api/clinics/:id/...`) must verify the user has the `org:admin` role within the organization corresponding to the `tenant_id`.
- Tenant isolation enforced via `where(eq(schema.table.tenantId, currentTenantId))`.

### Endpoints
- `GET /api/clinics/[id]/branches`: List branches.
- `POST /api/clinics/[id]/branches`: Create branch.
- `PATCH /api/clinics/[id]/branches/[branchId]`: Update branch.
- `DELETE /api/clinics/[id]/branches/[branchId]`: Delete branch.
- `GET /api/clinics/[id]/services`: List services.
- `POST /api/clinics/[id]/services`: Create service.
- `PATCH /api/clinics/[id]/services/[serviceId]`: Update service.
- `DELETE /api/clinics/[id]/services/[serviceId]`: Delete service.
- `GET /api/clinics/[id]/staff`: List staff (DB + Clerk join).
- `POST /api/clinics/[id]/staff/invite`: Invite staff member via Clerk.
- `PATCH /api/clinics/[id]/staff/[userId]`: Update staff role in Clerk & DB.
- `DELETE /api/clinics/[id]/staff/[userId]`: Remove staff from Org.

## UI Design

### Layout
- Route: `/app/(dashboard)/settings/page.tsx`
- Component: `Tabs` with "Branches", "Services", "Staff".

### Branches Tab
- Table displaying branch name and address.
- "Manage Hours" action opening a detailed editor.
- Form validation via Zod: Name required, Address optional, Timezone required.

### Services Tab
- Table displaying service name and duration.
- Inline editing or Dialog-based creation.
- Validation: Name required, Duration > 0.

### Staff Tab
- List showing Member Name, Email, Role.
- Status indicator (Joined/Invited).
- "Invite" Dialog: Email + Role selection.

## Implementation Details
- Use `react-hook-form` for all management forms.
- Use `lucide-react` for icons.
- Ensure all numbers use tabular numerals as per `ui-context.md`.
- Error handling: Toast notifications for success/failure.
