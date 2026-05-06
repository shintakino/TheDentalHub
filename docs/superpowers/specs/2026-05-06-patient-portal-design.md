# Patient Portal Design Doc

## Goal
Implement a secure, global dashboard for patients to manage their appointments across all clinics on the platform.

## Architecture
- **Routing**: `app/(patient)/dashboard` (Global)
- **Data Model**:
  - Update `appointments` table to include `patient_id` (text, Clerk User ID).
- **Security**: 
  - Middleware to protect `/(patient)` routes.
  - Data fetching strictly scoped to `currentUser.id`.

## API Endpoints
### 1. `GET /api/patient/appointments`
- **Purpose**: Fetch all appointments for the current user.
- **Payload**:
  ```json
  [
    {
      "id": "uuid",
      "startTime": "ISO String",
      "endTime": "ISO String",
      "status": "confirmed | cancelled | ...",
      "clinic": { "name": "...", "logoUrl": "..." },
      "branch": { "name": "...", "address": "..." },
      "service": { "name": "...", "duration": 30 }
    }
  ]
  ```

### 2. `PATCH /api/appointments/:id/cancel`
- **Purpose**: Allow patients to self-serve cancellations.
- **Validation**:
  - Ownership: `appointment.patient_id === currentUser.id`.
  - State: Must be `confirmed`.
  - Timeframe: Must be > 24 hours before `startTime`.
- **Side Effects**:
  - Update status to `cancelled`.
  - Log to `audit_logs` (actor: patient).
  - (Optional) Trigger cancellation email.

## UI Components
- **Dashboard Layout**: Uses `app/(patient)/layout.tsx`.
- **Upcoming Card**: Prominent display of next appointment with "Cancel" option.
- **Appointments List**: Grouped by "Upcoming" and "Past".
- **Cancel Dialog**: Confirmation modal before cancelling.

## Testing Strategy
- **Unit Tests**: Test the cancellation logic and threshold (24h).
- **Integration Tests**: Verify the API returns only the user's own appointments.
- **Manual Verification**: Book an appointment as a patient, view it in the portal, and cancel it.
