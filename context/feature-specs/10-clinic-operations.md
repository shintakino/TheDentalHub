# 10 - Clinic Operations Management

## Goal
Provide Clinic Owners (`org:admin`) with a secure, intuitive settings module to manage the core operational data of their clinic. This includes managing multiple branches, setting branch operating hours, configuring available dental services, and inviting/managing staff members.

## Domain Context & Boundaries
- **Branches**: Physical locations of the clinic. Each branch has its own operating hours (which dictate slot generation) and precise geographical coordinates (`latitude`, `longitude`) for map-based discovery.
- **Services**: The dental treatments offered (e.g., Consultation, Cleaning, Root Canal). Each service has a defined `duration` (in minutes) which the Scheduling Engine uses to reserve time.
- **Staff Management**: Inviting new dentists or receptionists to the clinic's Clerk Organization and assigning them the appropriate roles.
- **Permissions**: Only users with the `org:admin` role can access and mutate these configurations.

## Architectural Decisions
1. **API Structure**:
   - `CRUD /api/clinics/:id/branches`
   - `CRUD /api/clinics/:id/services`
   - Staff management will heavily leverage the Clerk Backend SDK (`clerkClient.organizations`) to invite users and manage roles, synchronizing necessary data to our database via webhooks or inline API calls.
2. **Strict Typing**: The use of the `any` type is strictly forbidden. All configuration payloads must be validated using Zod schemas (e.g., `BranchSchema`, `ServiceSchema`).
3. **Operating Hours Data Structure**: Store operating hours as a structured JSON object (or dedicated `operating_hours` table) linked to the branch, defining open/close times for each day of the week (e.g., `1 = Monday, open: "09:00", close: "17:00"`).
4. **Data Integrity**: Deleting a branch or service should implement soft-deletion or strict foreign-key constraints to prevent orphaning historical `appointments` and `audit_logs`. For the MVP, we will restrict deletion if active appointments exist.
5. **Geocoding**: When a Clinic Owner creates or updates a branch address, the backend must use a Geocoding service (e.g., Google Maps API or Mapbox) to derive and store the `latitude` and `longitude`.

## Tasks
- [ ] Task 1: Update the database schema (`lib/db/schema.ts`) to support Branch operating hours and geolocation coordinates (`latitude` and `longitude` numeric fields). → Verify: `npm run db:push` succeeds.
- [ ] Task 2: Implement the strictly-typed CRUD API endpoints for Branches and Services, ensuring operations are guarded by `tenant_id` and `org:admin` checks. Integrate server-side Geocoding for branch creation/updates. → Verify: Owner can create branches with valid coordinates; unauthorized access is rejected.
- [ ] Task 3: Implement Staff Management logic wrapping the Clerk SDK to invite users to the Organization and assign roles. → Verify: Owner can invite a new Dentist.
- [ ] Task 4: Build the "Clinic Settings" UI (`app/(dashboard)/[tenantId]/settings/page.tsx`) with separate tabs for Branches, Services, and Staff. → Verify: Forms use `react-hook-form` and `@hookform/resolvers/zod` for strict client-side validation.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] Clinic Owners can fully manage branches, including daily operating hours.
- [ ] Clinic Owners can configure services and their durations.
- [ ] Clinic Owners can invite staff and assign them roles.
- [ ] Deletion constraints successfully protect historical appointment data.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] npm run build for verification
