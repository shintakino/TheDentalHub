# 06 - Supabase Setup & Data Seeding

## Goal
Set up Supabase as the primary PostgreSQL database and blob storage provider. Configure Drizzle ORM for type-safe database interactions and schema management, and implement a robust seeding strategy to populate the database with realistic test tenants, branches, and staff accounts mapped to Clerk identities.

## Domain Context & Boundaries
- **PostgreSQL Database**: The primary source of truth for all domain entities (Clinics, Branches, Staff, Services, Appointments, Audit Logs).
- **Supabase Storage**: Used for storing unstructured binary assets (e.g., clinic logos, branding images).
- **Drizzle ORM**: Manages schema definitions, generates migrations, and provides type-safe SQL queries.
- **Seeding**: A deterministic script to populate the database with a "known good" state, allowing developers to easily test RBAC, the scheduling engine, and UI components without manual data entry.

## Architectural Decisions
1. **Infrastructure**: Utilize a Supabase project for both the managed PostgreSQL instance and the Storage buckets.
2. **Schema Management**: Drizzle ORM will be the exclusive tool for schema definition (`db/schema.ts`) and migrations.
3. **Clerk Integration**: Identity is managed by Clerk. The database schema will store references to Clerk `user_id` and Clerk Organization `org_id` (used as `tenant_id`) rather than maintaining separate password/auth tables.
4. **Seed Strategy**: The seed script (`db/seed.ts`) will use Drizzle to clear existing data (in local/dev environments) and insert a Super Admin, a test Clinic (Tenant), a Branch, Services, and dummy Staff members. It will output the mapped Clerk IDs to the console for easy login testing.
5. **Connection Pooling**: Use Postgres.js or pg driver with connection pooling enabled for serverless compatibility in Next.js App Router.

## Tasks
- [ ] Task 1: Create a new Supabase project and securely configure the `DATABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`. → Verify: Can connect to the database via a standard Postgres client.
- [ ] Task 2: Install and configure Drizzle ORM (`drizzle-kit`, `postgres`). Create `drizzle.config.ts` and initialize the database connection in `lib/db/index.ts`. → Verify: `npm run db:generate` runs without configuration errors.
- [ ] Task 3: Define the core schema in `db/schema.ts` (e.g., `clinics`, `branches`, `services`, `staff`) ensuring all tenant-specific tables include a `tenant_id` column. → Verify: `npm run db:push` successfully creates the tables in Supabase.
- [ ] Task 4: Create a Supabase Storage bucket for clinic branding assets and configure public access policies. → Verify: Bucket exists and allows public read access.
- [ ] Task 5: Develop the seed script (`db/seed.ts`) to populate the database with a test clinic, branches, and staff accounts linked to predefined Clerk Organization IDs and User IDs. → Verify: Running `npm run db:seed` populates the Supabase tables successfully.

## Done When
- [ ] Setup environment variables in `.env.local`.
- [ ] Drizzle ORM is fully configured and can push schema changes to Supabase.
- [ ] Core database schema is defined with strict `tenant_id` columns.
- [ ] Supabase Storage bucket is created and accessible.
- [ ] The seed script successfully populates the database with realistic test data, enabling immediate testing of the app's core flows.
