# Design Spec: Clinic Discovery & Patient Booking (Feature 11)

## Goal
Deliver a frictionless marketplace where patients can discover dental clinics via an interactive map and search, followed by a branded, account-based booking experience.

## User Experience

### 1. Clinic Discovery (`app/(discovery)/page.tsx`)
A split-screen interface combining search results with a map.

- **Search & Filters**:
  - Global search bar for clinic names, services, or locations.
  - Filter by "Available Today" or specific service types.
- **Clinic Listings (Left Side)**:
  - Cards showing clinic name, logo, rating, and "Next Available" slot.
  - Clicking a card centers the map on that clinic.
- **Interactive Map (Right Side)**:
  - Uses **Leaflet** with custom styled markers.
  - Popups on markers show quick clinic info and a "Book Now" link.

### 2. Booking Wizard (`app/(booking)/[tenantSlug]/page.tsx`)
A multi-step interface driven by URL search parameters.

- **Step 1: Service Selection**
- **Step 2: Branch Selection** (If > 1 branch)
- **Step 3: Date & Time Selection** (Clinic Local Time)
- **Step 4: Review & Authentication** (Branded Sign-In)

### 3. Branded Patient Auth (`app/(booking)/[tenantSlug]/sign-in/page.tsx`)
- Clerk `<SignIn />` with custom theme injection.

### 4. Success Confirmation (`app/(booking)/[tenantSlug]/success/[id]/page.tsx`)

## Technical Architecture

### Discovery Logic
- **Geospatial Data**: Branch table updated with `latitude` and `longitude` (decimal).
- **Search API**: `GET /api/clinics/search?query=...&lat=...&lng=...`.
  - Performs simple distance-based sorting or text-based search.

### Mapping Integration
- **Leaflet**: Client-side component for map rendering.
- **Geocoding**: Seed data must include valid lat/lng coordinates for branches.

### Data Flow
1. **Discover**: Patient uses root `/` to find a clinic.
2. **Transfer**: "Book Now" links to `/[tenantSlug]/book`.
3. **Flow**: Standard booking wizard logic.

## Invariants
- **Discovery Privacy**: Search results only expose public clinic/branch info, never patient or appointment data.
- **Tenant Isolation**: Once the user enters the `/[tenantSlug]` path, all logic is strictly scoped to that clinic.

## Success Criteria
- Map renders correctly with Leaflet and displays all active clinic branches.
- Search filters clinics accurately by name and service.
- Transition from Discovery to Booking is seamless.
- `npm run build` completes with zero type errors.
