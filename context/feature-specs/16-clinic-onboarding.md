# 16 - Clinic Onboarding Flow

## Goal
Deliver a frictionless, self-serve onboarding experience for new Clinic Owners. This flow handles the transition from a standard user sign-up to the creation of a multi-tenant Clerk Organization (`tenant_id`), automatically assigning the owner the `org:admin` role and provisioning their clinic in our database.

## Domain Context & Boundaries
- **User Intent**: Because DentalHub uses a single user pool for both Patients and Clinic Owners, the system relies on URL parameters (e.g., `?redirect_url=/onboarding/clinic`) from the marketing landing page to determine the user's intent to create a clinic.
- **Organization Creation**: The actual creation of the "Clinic" is handled by the Clerk Frontend API (`createOrganization`), which guarantees the user is immediately made the `org:admin` of that new tenant.
- **Database Synchronization**: Clerk acts as the source of truth for the organization's existence, but our local PostgreSQL database must be kept in sync via webhooks to create the corresponding `clinics` row so we can attach branding, branches, and appointments to it.

## Architectural Decisions
1. **Targeted Redirects**: The "For Clinics" or "List Your Clinic" call-to-action on the public site must link to `/sign-up?redirect_url=/onboarding/clinic`.
2. **Dedicated Onboarding Route**: Create `app/onboarding/clinic/page.tsx`. This route must be protected by Clerk to ensure only authenticated users who do *not* already have an active organization can access it.
3. **Webhook Synchronization**: Implement an endpoint (`POST /api/webhooks/clerk`) that listens for the `organization.created` event. Upon receiving this event, use Drizzle ORM to `INSERT` a new row into the `clinics` table using the `id` provided by Clerk as the `tenant_id`.
4. **Strict Typing**: The `any` type is strictly forbidden. The onboarding form must use `react-hook-form` with a Zod resolver (`ClinicOnboardingSchema` requiring a minimum string length for the clinic name). The webhook payload must be verified using Svix and strongly typed.

## Tasks
- [ ] Task 1: Create the secure `app/onboarding/clinic/page.tsx` route with a pristine, minimal UI asking for the Clinic's Name. → Verify: Only authenticated users without an organization can view this page.
- [ ] Task 2: Implement the form submission logic utilizing Clerk's `useOrganizationList().createOrganization()` hook to create the tenant. → Verify: Form successfully creates a Clerk organization and sets it as the active organization.
- [ ] Task 3: Implement the `POST /api/webhooks/clerk` endpoint using the `svix` package to verify the signature. Handle the `organization.created` event to insert the new clinic into the local database. → Verify: Creating an org in the frontend automatically results in a new row in the `clinics` database table.
- [ ] Task 4: Configure `proxy.ts` (or the post-creation redirect) to immediately route the user to `app/(dashboard)/[tenantId]/settings` so they can begin configuring branches and staff (Feature 10). → Verify: User is seamlessly dropped into their new dashboard.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] A new user can sign up and immediately be prompted to name their clinic.
- [ ] Submitting the clinic name creates a Clerk Organization and makes them the `org:admin`.
- [ ] The Clerk Webhook securely syncs the new organization into the local PostgreSQL database.
- [ ] The owner is successfully redirected to their clinic management dashboard.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
