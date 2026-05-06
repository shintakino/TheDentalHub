# 15 - Clinic Discovery Marketplace

## Goal
Provide patients with a centralized, map-based discovery marketplace to find dental clinics near them. Patients should be able to filter by services, view clinic locations on an interactive map, and see a preview of the "Next Available" appointment slot before entering the full booking flow.

## Domain Context & Boundaries
- **Global Discovery vs. Tenant Isolation**: The marketplace operates across all tenants. However, to maintain strict data isolation, the search queries must only aggregate public branch data (location, services) and available time slots. No patient data or private clinic settings will be exposed to the global search layer.
- **Geospatial Data**: Branches must have precise `latitude` and `longitude` coordinates (configured via Feature 10) to be plotted on the map and to support radius-based searching.

## Architectural Decisions
1. **Map Integration**: Use `react-leaflet` alongside standard `Leaflet` CSS to render the interactive map on the client side without heavy licensing costs (e.g., using OpenStreetMap tiles).
2. **Search API**: Create a specialized, globally accessible `GET /api/marketplace/search` endpoint. It accepts `latitude`, `longitude`, `radius`, and `serviceQuery` as parameters.
3. **"Next Available" Slot Calculation**: To display the "Next Available" slot on a search result card without executing heavy, real-time slot generation for every clinic simultaneously, implement an optimized query or a caching layer that pre-calculates the next 3 available slots for active branches every few minutes.
4. **Strict Typing**: The `any` type is strictly forbidden. The marketplace search response must be heavily typed (e.g., `MarketplaceResultSchema`) to ensure the frontend Leaflet markers and lists receive exactly what they expect.
5. **Routing**: The marketplace will serve as the root application route (`app/page.tsx`), acting as the primary entry point for patients before they are directed to the specific `/[tenantId]/book` routes.

## Tasks
- [ ] Task 1: Create the `GET /api/marketplace/search` endpoint. Use PostGIS extensions or the Haversine formula in Drizzle to filter branches by distance from the user's provided coordinates. → Verify: Endpoint returns branches sorted by distance with strict typing.
- [ ] Task 2: Implement the "Next Available" slot preview logic. If a branch matches the search, query the scheduling engine (or a cached aggregate table) for its upcoming availability. → Verify: API returns a valid upcoming timestamp or `null` if fully booked.
- [ ] Task 3: Build the interactive Map UI using `react-leaflet` on the root page. Include custom map markers for branches. → Verify: Map loads correctly and plots branches based on coordinates.
- [ ] Task 4: Build the Sidebar List UI that syncs with the map bounds, allowing users to filter by specific services or clinic names. → Verify: Filtering updates both the list and the map markers dynamically.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] Patients can view a map of all available clinic branches.
- [ ] Map markers and list cards display the "Next Available" slot.
- [ ] Patients can filter the map by location and services.
- [ ] Clicking a clinic directs the patient to that specific tenant's booking flow (Feature 11).
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
