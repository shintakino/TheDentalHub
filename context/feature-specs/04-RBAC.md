# 03 - Role-Based Access Control (RBAC)

## Goal
Implement a robust, secure, and multi-tenant Role-Based Access Control (RBAC) system for The Dental Hub using Clerk Organizations and custom metadata to enforce strict data isolation and permission boundaries across Super Admins, Clinic Owners, Staff, and Patients.

## Domain Context & Roles
- **Patient**: Independent user. Can book, view, and cancel their own appointments across different clinics. Not part of any specific Clerk Organization.
- **Clinic Owner (`org:admin`)**: Full administrative access over their tenant (Organization). Manages branches, services, branding, and staff.
- **Dentist (`org:dentist`)**: Staff member. Can view assigned appointments, add clinical notes, and manage their schedule.
- **Receptionist (`org:receptionist`)**: Staff member. Can manage appointments across the branch, check-in patients, and handle scheduling conflicts.
- **Super Admin**: System-wide administrator managed via Clerk `publicMetadata` (`role: super_admin`). Can override tenant data and monitor system logs.

## Architectural Decisions
1. **Tenant Isolation**: Use Clerk Organizations to represent Clinics. A user's active organization determines their current tenant context (`tenant_id`).
2. **Role Mapping**: Use Clerk's custom Organization Roles (`org:admin`, `org:dentist`, `org:receptionist`) for clinic staff.
3. **Patient Access**: Patients do not join Organizations. Their access is bounded by their `user_id` on appointment resources.
4. **Super Admin Access**: Managed via Clerk User `publicMetadata` since they operate above the tenant level.
5. **Route Protection**: Use Next.js Middleware (`proxy.ts` / `middleware.ts`) combined with Clerk's `auth()` helper to verify roles at the edge.

## Tasks
- [ ] Task 1: Configure Clerk Organizations in the Clerk Dashboard, enabling the feature and defining custom roles (`org:dentist`, `org:receptionist`). → Verify: Roles exist in the Clerk dashboard.
- [ ] Task 2: Implement role-checking middleware to route authenticated users appropriately (e.g. block Patients from `/dashboard`, block regular users from `/admin`). → Verify: Patient cannot access `/dashboard`.
- [ ] Task 3: Create server-side permission utility (`lib/auth/roles.ts`) to easily check `hasPermission(role)` for mutations and data fetching. → Verify: Utility correctly identifies current active organization role.
- [ ] Task 4: Define Tenant Context patterns for database queries to ensure strict data isolation (always filter by `tenant_id` mapped from the active Clerk Org ID). → Verify: Documented data fetching patterns requiring tenant ID.
- [ ] Task 5: Build UI role gates (e.g., using Clerk's `<Protect role="org:admin">` component) to conditionally render sensitive navigation items (like Clinic Settings) from regular staff. → Verify: Settings tab is invisible to Dentists and Receptionists.

## Done When
- [ ] Clerk Organizations are designated as the mechanism for representing individual clinics (tenants).
- [ ] Staff roles (`admin`, `dentist`, `receptionist`) accurately restrict UI and API access within a tenant.
- [ ] Patients can successfully use the app without being forced into an organization.
- [ ] Architectural data fetching patterns are set to enforce strict tenant isolation using the Clerk Organization ID as `tenant_id`.
