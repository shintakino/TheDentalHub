# Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router)  | Full-stack application framework                               |
| Auth             | Clerk                   | Multi-tenant identity and role management                      |
| Database         | PostgreSQL              | Primary relational data storage                                |
| ORM              | Drizzle ORM             | Type-safe database interactions                                |
| Cache/Queue      | Redis                   | Concurrency control and background notifications               |
| Storage          | Supabase Storage        | Clinic logos and branding assets                               |
| Styling          | Tailwind CSS            | Utility-first styling                                          |

## System Boundaries

- `app/(auth)` — Clerk authentication routes.
- `app/(dashboard)` — Authenticated layouts for Patients, Staff, and Owners.
- `app/api` — RESTful endpoints for booking, management, and audit logging.
- `db` — Drizzle schema definitions and migrations.
- `lib` — Shared logic for scheduling, RBAC, and tenant isolation.
- `components/booking` — Atomic components for the scheduling flow.

## Multi-Tenant Model

- **Data Isolation**: Every record (except Patients) must include a `tenant_id`. Middleware or RLS-equivalent logic in Drizzle queries must enforce this filter.
- **Tenant Resolution**: The tenant is identified by the sub-domain or a specific path segment.
- **RBAC**: Roles (Patient, Staff, Owner, Super Admin) are managed via Clerk metadata.

## Scheduling Engine Design

- **Slot Generation**: Computed on-the-fly or cached in Redis based on Branch operating hours and existing appointments.
- **Atomic Locking**: Uses PostgreSQL transactions or Redis-based locks to prevent double-booking at the moment of confirmation.
- **Timezone Logic**: All timestamps are stored in UTC. Display logic converts UTC to Branch local time for patients.

## Storage Model

- **PostgreSQL**: Stores Clinic, Branch, Staff, Service, Appointment, Clinic Branding, and Audit Log data.
- **Supabase Storage**: Stores binary assets like clinic logos.
- **Audit Logs**: Every mutation to an appointment must create an entry in the `audit_logs` table.

## Invariants

1. All data access (except for Super Admin) must be scoped by `tenant_id`.
2. No appointment can exist without a `confirmed` status at creation.
3. Cancellation must release the locked slot immediately.
4. Staff removal must not delete historical appointment records.
5. All status transitions must be logged in the audit trail.
