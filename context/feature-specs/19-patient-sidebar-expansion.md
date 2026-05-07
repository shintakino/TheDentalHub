# 19 - Patient Sidebar Expansion

## Goal
Expand the patient navigation sidebar to provide a more comprehensive and professional experience. This includes adding links for Medical Records (Visit History), Notifications, and Account Settings, aligning the UI with the core patient features defined in the PRD.

## Domain Context & Boundaries
- **Patient Experience**: The sidebar is the primary navigation tool for patients. It should feel authoritative and provide easy access to all relevant patient data.
- **Data Isolation**: Any new pages (Records, Notifications) must strictly filter data by the authenticated patient's Clerk ID.
- **Future Proofing**: "Medical Records" will initially serve as a detailed visit history, with placeholders for clinical notes or attachments as defined in future phases.

## Architectural Decisions
1. **Sidebar Links**: Update `components/layout/Sidebar.tsx` to include the new navigation items for the patient role.
2. **New Routes**:
   - `app/(patient)/records/page.tsx`: A more detailed view of past appointments and clinic interactions.
   - `app/(patient)/notifications/page.tsx`: A centralized place for in-app notifications (e.g., booking confirmations, reminders).
   - `app/(patient)/settings/page.tsx`: Link to user profile management (can leverage Clerk's `<UserProfile />`).
3. **Icons**: Use `lucide-react` icons consistent with the existing UI (`FileText`, `Bell`, `UserGear`).
4. **Strict Typing**: The `any` type is strictly forbidden. Any new data fetching for records or notifications must use explicit types.

## Tasks
- [ ] Task 1: Update `patientNavigation` in `components/layout/Sidebar.tsx` to include "Medical Records", "Notifications", and "Settings". → Verify: Sidebar renders new items with correct icons.
- [ ] Task 2: Create the placeholder page `app/(patient)/records/page.tsx` that fetches a detailed history of the patient's interactions. → Verify: Page renders and correctly filters by `patientId`.
- [ ] Task 3: Create the placeholder page `app/(patient)/notifications/page.tsx` for in-app alerts. → Verify: Page is accessible via sidebar.
- [ ] Task 4: Create `app/(patient)/settings/page.tsx` and integrate Clerk's `<UserProfile />` component or a custom profile form. → Verify: Patient can view their account settings.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] The patient sidebar features "My Appointments", "Find a Clinic", "Medical Records", "Notifications", and "Settings".
- [ ] All new navigation items lead to functional (even if initial/placeholder) pages.
- [ ] Navigation is responsive and maintains the "High-End Clinical" aesthetic.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
