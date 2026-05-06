# Super Admin Dashboard Design - 2026-05-06

## Goal
Implement a centralized, highly-privileged dashboard for platform administrators to monitor health, manage tenants, and perform emergency interventions.

## Architecture & Routing

### Dedicated Route Group
- **Path**: `app/(super-admin)/admin`
- **Layout**: `app/(super-admin)/layout.tsx`
  - Performs server-side role verification using `lib/auth/roles.ts#isSuperAdmin`.
  - Provides a consistent navigation sidebar distinct from the tenant dashboard.
- **Middleware**: `proxy.ts` already protects `/admin(.*)` and redirects unauthorized users.

### Privileged Data Layer
- **Location**: `lib/admin/queries.ts`
- **Pattern**: These functions will be the only place in the codebase where Drizzle queries are executed *without* the standard `tenant_id` scoping logic.
- **Functions**:
  - `getAllTenants()`: Aggregates clinic data, branch counts, and appointment metrics.
  - `getGlobalAuditLogs(filters: LogFilters)`: Fetches audit logs across all tenants with support for pagination and filtering.

## Core Components & Pages

### 1. Tenants Overview (`/admin/tenants`)
- **UI**: `DataTable` with the following columns:
  - **Clinic**: Logo + Name + Tenant ID.
  - **Branches**: Total count.
  - **Activity**: Total appointments + Appointments today.
  - **Status**: Visual indicator of platform usage.
  - **Actions**: "View Logs", "Impersonate" (future), "Manage Settings".

### 2. Global Audit Logs (`/admin/logs`)
- **UI**: A unified chronological feed of system mutations.
- **Filtering**:
  - **Tenant**: Select dropdown populated from registered clinics.
  - **Action**: Filter by `appointment.confirmed`, `appointment.cancelled`, etc.
  - **Override**: Toggle to show only Admin Overrides.

### 3. Emergency Override Tool
- **Mechanism**: A dialog triggered from an appointment view or log entry.
- **Validation**: Requires a "Reason for Override" text input.
- **State Machine Bypass**: Allows transitioning an appointment to *any* valid status regardless of its current state.

## API Endpoints

### Appointment Override
- **Path**: `POST /api/admin/appointments/[id]/override`
- **Payload**:
  ```typescript
  {
    newStatus: AppointmentStatus,
    reason: string
  }
  ```
- **Action**:
  1. Verify `super_admin` role.
  2. Update appointment status in `appointments` table.
  3. Create `audit_logs` entry with `userId`, `action: 'ADMIN_OVERRIDE'`, and `payload: { oldStatus, newStatus, reason }`.

## Type Safety & Standards
- **Zod Schemas**: Every admin API payload must be validated.
- **No `any`**: Explicitly type all cross-tenant query results.
- **Audit Requirement**: Every admin action MUST result in an audit log entry.

## Success Criteria
- Only users with `super_admin` role can access `/admin` routes.
- Cross-tenant data is accurately aggregated.
- Overrides are correctly applied and audited.
- `npm run build` passes without type errors.
