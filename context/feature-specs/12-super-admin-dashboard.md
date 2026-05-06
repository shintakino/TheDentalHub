# 12 - Super Admin Dashboard

## Goal
Provide a centralized, highly-privileged dashboard exclusively for system administrators (`super_admin` role). This interface enables oversight of all multi-tenant operations, allowing the Super Admin to monitor system health, manage clinic tenants, review system-wide audit logs, and perform emergency interventions (e.g., overriding appointments).

## Domain Context & Boundaries
- **Access Control**: This module is strictly protected. Only users possessing the `super_admin` role in the root Clerk instance can access these routes and API endpoints.
- **Global Visibility**: Unlike clinic owners or staff who are isolated by `tenant_id`, the Super Admin has unrestricted read/write access across all tenants.
- **Audit Logging**: Actions taken by the Super Admin must be rigorously logged in the `audit_logs` table, explicitly flagging that the action was a system override.

## Architectural Decisions
1. **Dedicated Routing**: House the Super Admin dashboard under a unique route group (e.g., `app/(super-admin)`) to completely isolate it from the tenant-specific `app/(dashboard)/[tenantId]` routing.
2. **Middleware Protection**: The Next.js middleware and API route handlers must explicitly verify the `super_admin` role claim from the Clerk token before granting access.
3. **Strict Typing**: The `any` type remains strictly forbidden. All cross-tenant queries and administrative payloads must use explicit Zod schemas and Drizzle inferred types.
4. **Emergency Overrides**: Super Admins can transition appointments to any state (e.g., forcing a cancellation without triggering standard clinic-level restrictions).

## Tasks
- [ ] Task 1: Create the secure routing group `app/(super-admin)/layout.tsx` and ensure it validates the `super_admin` Clerk role, redirecting unauthorized users to a 404 or Not Authorized page. → Verify: Only Super Admins can access the layout.
- [ ] Task 2: Build the "Tenants Overview" page to list all registered clinics, their status, and basic aggregate metrics (e.g., total branches, total appointments). → Verify: Super Admin can view all clinics.
- [ ] Task 3: Develop the "Global Audit Logs" view with filtering capabilities (by `tenant_id`, action type, or date) to monitor system-wide activity. → Verify: Logs correctly reflect cross-tenant actions.
- [ ] Task 4: Implement the Appointment Override API (`POST /api/admin/appointments/:id/override`) bypassing standard state-machine rules but strictly requiring a reason for the audit log. → Verify: Super Admin can cancel any appointment across any tenant.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] The Super Admin dashboard is fully isolated and secured by strict role checks.
- [ ] Super Admins can view and manage all clinic tenants.
- [ ] System-wide audit logs are accessible and searchable.
- [ ] Emergency appointment overrides can be performed and are securely audited.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
