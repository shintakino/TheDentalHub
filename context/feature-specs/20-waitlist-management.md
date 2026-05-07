# 20 - Waitlist & Walk-in Management

## Goal
Implement a robust management system for clinic waitlists and walk-in patients. This module empowers clinic receptionists to capture demand outside of the fixed schedule, manage a real-time queue for physical arrivals, and optimize clinic utilization by seamlessly filling cancellations with waitlisted patients.

## Domain Context & Boundaries
- **Waitlist**: A prioritized list of patients requesting a "sooner" or "specific" time slot that is currently fully booked.
- **Walk-in Queue**: Real-time tracking of patients who arrive at the clinic without a pre-scheduled appointment and are waiting for the next available gap.
- **Conversion**: The process of promoting a waitlist or walk-in entry into a formal `Appointment` record.
- **Isolation**: Strictly scoped to `tenant_id` (Clinic) and `branch_id` (Location).

## Architectural Decisions (/backend-architect)
1. **Schema Additions**:
   - `waitlist_entries`: 
     - `id`: UUID (Primary Key)
     - `tenant_id`: References `clinics.id`
     - `branch_id`: References `branches.id`
     - `patient_id`: References `users.id` (Nullable for non-registered walk-ins)
     - `patient_name`: Text (For quick entry)
     - `patient_phone`: Text
     - `service_id`: References `services.id`
     - `preferred_days`: JSONB (Array of days/time ranges)
     - `status`: Enum (`waiting`, `notified`, `booked`, `cancelled`, `expired`)
     - `created_at`: Timestamp
   - `appointments`: Add `is_walk_in` (boolean, default false) to distinguish historical data.
2. **Matching Strategy**: When an appointment is cancelled, a server-side utility will query `waitlist_entries` for the same `branch_id` and `service_id` to identify eligible candidates.
3. **Atomic Transitions**: Converting a waitlist entry to an appointment must happen within a database transaction to ensure the slot remains available and the entry status is updated atomically.
4. **Strict Typing**: All Zod schemas and Drizzle queries must explicitly exclude the `any` type, maintaining end-to-end type safety.

## UI/UX Design (/frontend-developer)
1. **Waitlist Sidebar**: A sliding `Sheet` or dedicated tab within the `DailySchedule` dashboard (`app/(dashboard)/[tenantSlug]/page.tsx`) to manage the active queue.
2. **High-End Aesthetics**:
   - Use `Badge` components for wait times (e.g., "Waiting 15m") and priority levels.
   - Elegant typography using `Outfit` for list items and `Playfair Display` for section headers.
   - Subtle Surgical Sapphire indicators for "Notified" patients.
3. **Interactions**:
   - "Promote to Appointment" button that triggers a pre-filled `Dialog` with slot confirmation.
   - Real-time list updates using SWR/React Query revalidation when the database state changes.
4. **Mobile Experience**: Ensure the walk-in queue is easily manageable from a tablet/mobile device for front-desk staff.

## Implementation Plan (/plan-writing)

### Phase 1: Data Layer & APIs
- **Task 1**: Update `lib/db/schema.ts` with the `waitlist_entries` table and `is_walk_in` flag on `appointments`. → Verify: `npm run db:push` succeeds.
- **Task 2**: Implement CRUD API endpoints:
  - `GET /api/clinics/:id/waitlist`: Fetch active entries filtered by branch.
  - `POST /api/clinics/:id/waitlist`: Add a new entry (with Zod validation).
  - `PATCH /api/clinics/:id/waitlist/:entryId`: Update status or details.
- **Task 3**: Create a server-side utility `lib/waitlist/matcher.ts` to find eligible waitlist entries for a given open slot.

### Phase 2: Staff Dashboard Integration
- **Task 4**: Build the `WaitlistManager` component using shadcn/ui `Table` and `Sheet`.
- **Task 5**: Integrate the manager into the staff dashboard, ensuring it respects `tenant_id` isolation.
- **Task 6**: Implement the "Convert to Appointment" flow with atomic transactional checks.

### Phase 3: Notifications & Polish
- **Task 7**: Integrate with the existing Notification System (Feature 13) to alert patients when a slot is offered.
- **Task 8**: Add "Waitlist" metrics to the Analytics Dashboard (Feature 09) to track queue efficiency.

## Done When
- [ ] Staff can add, view, and manage patients in a branch-specific waitlist and walk-in queue.
- [ ] Cancellations in the schedule automatically highlight potential matches from the waitlist.
- [ ] Waitlist entries can be atomically converted into confirmed appointments.
- [ ] All data interactions are strictly typed, tenant-isolated, and follow the "High-End Clinical" design system.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
