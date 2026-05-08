# 32 - Patient Management Module (Owner-Side)

## Goal
Transform the basic patient directory into a comprehensive Patient Management Module for Clinic Owners and Staff. This "Command Center" for patient data will provide a 360-degree view of every patient, including their full appointment history, clinical records, loyalty status, communication logs, and personal preferences, enabling high-touch patient care and efficient clinical operations.

## Domain Context & Boundaries
- **Patient Identity**: Anchored by the `patient_profiles` table and linked via Clerk `user_id`. Supports both registered users and "Guest" records derived from historical appointments.
- **Data Integration**: Aggregates data from `appointments`, `clinical_notes`, `communications_log`, `loyalty_transactions`, and `reviews`.
- **Privacy & Security**: Only authorized clinic staff (`org:admin`, `org:dentist`, `org:receptionist`) can access detailed patient records within their `tenant_id`.

## Architectural Decisions (/backend-architect)
1. **Unified Patient Schema**:
   - Ensure `patient_profiles` acts as the primary record. For patients who have booked but don't have a profile yet (e.g., guests), implement a "Lazy Profile" creation or a robust aggregation query.
2. **Patient Detail API**:
   - `GET /api/clinics/:id/patients/:patientId`: Returns a comprehensive payload including:
     - Demographics (Name, Email, Phone from Clerk/Profile).
     - Stats (Total visits, No-shows, Lifetime value).
     - Recent Activity (History of appointments and notes).
     - Loyalty Balance.
3. **Advanced Filtering & Search**:
   - Implement server-side search using PostgreSQL `ILIKE` or `tsvector` on `patient_name` and `patient_email`.
   - Filter by: `Last Visit Date`, `Patient Status` (New vs. Returning), `Insurance Provider` (if added later).
4. **Manual Patient Creation**:
   - `POST /api/clinics/:id/patients`: Allows staff to manually create a patient record for walk-ins, potentially inviting them to the platform via email.
5. **Strict Typing**: The `any` type is strictly forbidden. All API responses and database queries must use Zod schemas and Drizzle-inferred types.

## UI/UX Design (/frontend-developer)
1. **Enhanced Patient Directory**:
   - **Visuals**: A clean, borderless `Table` with "High-End Clinical" styling.
   - **Search Bar**: A prominent, elegant search input with `Outfit` font and `Surgical Sapphire` focus states.
   - **Quick Filters**: Minimalist toggle buttons for "Today's Patients", "Waitlisted", and "New Leads".
2. **Patient Profile "Command Center"**:
   - **Header**: Large `Playfair Display` name, status badge, and quick actions (`Book Appointment`, `Send Message`).
   - **Tabbed Interface**:
     - **Overview**: KPI cards (Total Visits, Points) and "Next Appointment" preview.
     - **History**: Vertical timeline of all past appointments and clinical notes.
     - **Medical Records**: Dedicated view for clinical notes and (future) file uploads.
     - **Communications**: Log of all automated and manual messages.
     - **Settings**: Notification preferences and loyalty point adjustments.
3. **Aesthetics**:
   - Use "Alabaster" backgrounds and "Pure White" floating cards.
   - Diffuse shadows (`rgba(0,0,0,0.08)`) instead of borders.
   - Surgical Sapphire for primary actions.

## Implementation Plan (/plan-writing)

### Phase 1: Data & API Refinement
- **Task 1**: Create the `getPatientDetails` query in `lib/admin/queries.ts` to aggregate all relevant data for a single patient. → Verify: Query returns a complete, typed patient object.
- **Task 2**: Implement the `GET /api/clinics/:id/patients/:patientId` endpoint with RBAC protection. → Verify: Only authorized staff can fetch details.
- **Task 3**: Implement a search-enabled `getPatients` query with pagination. → Verify: Search by name/email returns correct results.

### Phase 2: Enhanced Directory UI
- **Task 4**: Update `app/manage/[tenantSlug]/patients/page.tsx` with a search bar and advanced filtering logic. → Verify: UI updates in real-time as the user types.
- **Task 5**: Add a "Create Patient" dialog to allow manual entry for walk-ins. → Verify: New patients appear in the list immediately.

### Phase 3: Patient Profile (Command Center)
- **Task 6**: Build the detailed profile page `app/manage/[tenantSlug]/patients/[patientId]/page.tsx`. → Verify: Page displays all data correctly across tabs.
- **Task 7**: Implement the "Quick Actions" functionality (e.g., triggering the booking flow with the patient pre-selected). → Verify: Staff can easily book for a specific patient.

### Phase 4: Loyalty & Communications Integration
- **Task 8**: Build the "Loyalty History" component showing earned/redeemed points. → Verify: Points history matches the database.
- **Task 9**: Build the "Communications Log" component pulling from `communications_log`. → Verify: Sent emails are visible in the patient's profile.

## Done When
- [ ] Staff can search, filter, and manually add patients to the clinic.
- [ ] Every patient has a detailed "Command Center" profile view.
- [ ] Clinical notes, appointment history, and communications are unified in the profile.
- [ ] The "High-End Clinical" aesthetic is maintained with zero borders and diffuse shadows.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
