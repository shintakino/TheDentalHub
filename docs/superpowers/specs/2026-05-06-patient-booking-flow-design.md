# Patient Booking Flow Design Spec

## Overview
Deliver a frictionless, multi-step appointment booking experience for patients. The flow dynamically adapts to the clinic's configuration (e.g., skipping branch selection if only one branch exists) and ensures atomic, double-booking-proof confirmation.

## Goals
- **Frictionless UX**: Minimal steps, intuitive navigation.
- **Dynamic Branding**: Inject clinic-specific colors and logos.
- **Atomic Booking**: Prevent race conditions during slot selection.
- **Timezone Integrity**: Display slots in the clinic's local time.

## Architecture

### Routing & State Management
- **URL-Driven Wizard**: State is managed via URL search parameters (`step`, `serviceId`, `branchId`, `date`, `time`).
- **Dynamic Skipping**: If `branches.length === 1`, Step 2 (Branch Selection) is automatically skipped.
- **Route**: `app/(booking)/[tenantSlug]/page.tsx`.

### Data Model & Flow
1. **Fetch Clinic**: Server component fetches clinic by `tenantSlug`.
2. **Fetch Branches/Services**: Server component fetches available branches and services for the `tenantId`.
3. **Step Logic**:
    - **Step 1 (Service)**: Select a service from the list.
    - **Step 2 (Branch)**: Select a branch (skipped if only one).
    - **Step 3 (Time)**: Interactive calendar and slot picker. Fetches slots from `/api/branches/[branchId]/slots` (or similar) or generates them client-side using `lib/scheduling/slot-generator.ts`.
    - **Step 4 (Review)**: Final summary and "Confirm" button. Requires Clerk authentication.

### Component Breakdown
- **BookingWizard (Server)**: High-level layout and step routing.
- **ServiceSelection (Client)**: Searchable list of services.
- **BranchSelection (Client)**: List of branches with addresses.
- **SchedulingSection (Client)**: 
    - `Calendar`: For date selection.
    - `SlotGrid`: Fetches/Generates and displays available slots for the selected date/branch.
- **BookingSummary (Client)**: Review details and trigger final booking.

### API Endpoints
- **GET `/api/branches/[branchId]/slots?date=YYYY-MM-DD`**: Returns available slots using `generateSlots` logic.
- **POST `/api/appointments/book`**: 
    - **Payload**: `branchId`, `serviceId`, `startTime`, `endTime`, `patientId` (from Clerk).
    - **Logic**: Transactional check + insert.

## Technical Invariants
- **No `any`**: Strict TypeScript usage throughout.
- **Zod Validation**: All API payloads and search parameters validated.
- **Atomic Locking**: Final booking must use a DB transaction to prevent double-booking.

## Testing Strategy
- **Unit Tests**: Test `generateSlots` with various edge cases (buffer times, overlapping appointments).
- **Integration Tests**: Test the booking API for concurrency (simultaneous booking attempts for the same slot).
- **E2E Tests**: Walk through the wizard from Step 1 to the success page at `app/(booking)/[tenantSlug]/success/[id]/page.tsx`.
