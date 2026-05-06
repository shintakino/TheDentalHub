# Design Spec: Clinic Discovery Marketplace

**Date**: 2026-05-06  
**Status**: Draft  
**Feature**: 15 - Clinic Discovery & Marketplace

## 1. Overview
The Clinic Discovery Marketplace is the public-facing "front door" of the application. It allows patients to find dental clinics based on location, services, and immediate availability.

## 2. Goals
- Fast, map-driven search experience.
- Real-time (cached) availability previews.
- Seamless transition to specific clinic booking flows.
- Strict data isolation (only public branch/service data exposed).

## 3. Data Model Extensions

### `branches` table update
- `nextSlots`: `jsonb` - Stores an array of up to 3 upcoming available `startTime` strings.
- `availabilityUpdatedAt`: `timestamp` - Tracking when the cache was last refreshed.
- `rating`: `decimal` (optional/mocked for now) - Clinic rating for display.

## 4. API Design: `GET /api/marketplace/search`

### Request Parameters
- `lat`: `number` (required)
- `lng`: `number` (required)
- `radius`: `number` (default: 25, unit: km)
- `serviceId`: `uuid` (optional)
- `query`: `string` (optional, for clinic name/service name matching)

### Response Schema (`MarketplaceResultSchema`)
```typescript
interface MarketplaceResult {
  id: string; // branchId
  clinicId: string;
  clinicName: string;
  clinicLogoUrl: string | null;
  primaryColor: string;
  subdomain: string;
  branchName: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number; // calculated km
  nextAvailableSlot: string | null;
  services: string[]; // names of services offered
  rating: number;
}
```

## 5. Implementation Strategy

### Distance Calculation
We will use the Haversine formula within a Drizzle `sql` template to perform server-side filtering and sorting by distance. This avoids loading all clinics into memory.

### Availability Caching (The "Next Available" Logic)
1. **Fetch Step**: When the search API runs, it returns the `nextSlots[0]` from the `branches` table.
2. **Stale Check**: If `availabilityUpdatedAt` is > 15 minutes old, we trigger an asynchronous refresh.
3. **Refresh Logic**:
   - Call the existing `slot-generator.ts` logic for the branch.
   - Fetch availability for the next 7 days.
   - Store the first 3 valid slots back into the `branches` table.
   - Update `availabilityUpdatedAt`.

### Frontend Components
- `DiscoveryPage`: Main container, handles search state and URL sync.
- `DiscoveryMap`: Leaflet map. Uses `useMapEvents` to trigger search on `moveend`.
- `SidebarList`: Displays `ClinicCard` components.
- `ClinicCard`: Shows the cached "Next Available" slot and links to `/[subdomain]/book`.

## 6. Verification Plan
- **Unit Test**: Haversine SQL formula returns correct distances.
- **Integration Test**: API returns branches within radius and filters by service.
- **E2E**: Moving the map updates the sidebar list.
- **Performance**: Search response time < 200ms for 100+ simulated clinics.
