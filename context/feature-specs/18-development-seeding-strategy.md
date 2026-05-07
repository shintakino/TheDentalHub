# 18 - Development Seeding & Mock Data Strategy

## Goal
Establish a deterministic and robust data seeding strategy for local development. Because DentalHub relies on a combination of Clerk (for Authentication/Organizations) and Supabase/Drizzle (for Application Data), the seeding strategy must securely synchronize dummy Clerk User IDs with local PostgreSQL records to allow developers to instantly test all user roles (Super Admin, Clinic Owner, Staff, Patient).

## Domain Context & Boundaries
- **The Identity Problem**: You cannot simply `INSERT` a user into a local database and log in, because authentication is strictly handled by Clerk's servers. 
- **The Solution**: We can fully automate this process. Using the Clerk Backend SDK and our local `CLERK_SECRET_KEY`, our seed script can programmatically create the test users and organization, extract their IDs dynamically, and then use those IDs to generate corresponding application data (Clinics, Branches, Appointments) in Drizzle.

## Architectural Decisions
1. **Automated Clerk Provisioning**: The seed script will use `clerkClient` to programmatically provision exactly four static test accounts:
   - `superadmin@test.com` (Given `publicMetadata.role: 'super_admin'`)
   - `owner@test.com` (Given `org:admin` role in an automated test organization)
   - `staff@test.com` (Given `org:staff` role in that same organization)
   - `patient@test.com` (No organization memberships)
2. **Dynamic ID Extraction**: Instead of manually copy-pasting IDs into `.env.local`, the script will capture the returned IDs from the `clerkClient.users.createUser()` and `clerkClient.organizations.createOrganization()` calls directly in memory during execution.
3. **Idempotent Seed Script**: The `lib/db/seed.ts` script must be idempotent. When run (`npm run db:seed`), it should clear out existing test data and re-insert fresh branches, services, and appointments using the IDs from the `.env` file. This allows a developer to instantly reset their database to a "known good state".
4. **Strict Typing**: The seed script must use strictly typed Drizzle `insert` commands. No raw SQL strings containing `any` types.

## Tasks
- [x] Task 1: Update the `lib/db/seed.ts` script to import and configure the Clerk Backend SDK (`clerkClient`). → Verify: Script can authenticate with the local Clerk instance using `CLERK_SECRET_KEY`.
- [x] Task 2: Implement a teardown function in the script that deletes existing test users (e.g., searching for `%@test.com`) and their associated organizations from Clerk to ensure a clean slate. → Verify: Running the script doesn't result in duplicate user errors.
- [x] Task 3: Implement the user and organization creation logic using `clerkClient.users.createUser()` and `clerkClient.organizations.createOrganization()`. Capture the returned IDs in memory. → Verify: Test users appear in the Clerk dashboard.
- [x] Task 4: Pass the captured Clerk IDs into the Drizzle seeding logic to insert a Clinic record, at least two Branches, three Services, and a week's worth of available appointment slots. → Verify: Database is populated and perfectly mapped to the new Clerk users.
- [x] Task 4: Add `patient@test.com` mock bookings into the seed script to populate the Owner's dashboard with upcoming appointments. → Verify: The dashboard shows real-looking data upon logging in.
- [x] Task 5: Run a full type check on the seed script. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [x] Developers have a clear guide on setting up Clerk test accounts.
- [x] Running `npm run db:seed` provisions a fully functioning clinic with branches, staff, and appointments.
- [x] Logging in as `owner@test.com` immediately displays a populated dashboard.
- [x] Logging in as `patient@test.com` immediately displays their upcoming booked appointments.
- [x] End-to-end strict typing is implemented without using `any`.
