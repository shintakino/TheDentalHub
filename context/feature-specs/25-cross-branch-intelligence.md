# 25 - Cross-Branch Intelligence

## Goal
Leverage multi-branch data to optimize network-wide utilization. This feature ensures patients find the earliest possible care by intelligently routing demand across the clinic's entire physical network.

## Domain Context & Boundaries
- **Network Optimization**: Viewing the clinic as a distributed network of capacity rather than isolated shops.
- **Patient Retention**: Ensuring a patient never leaves the booking flow due to "No Availability" if another branch has a slot.

## Architectural Decisions (/backend-architect)
1. **Network Heatmap Query**:
   - Optimized PostgreSQL aggregation to calculate "Booking Density" per hour, per branch, for a 30-day window.
   - Result: A matrix of `[BranchID][Timestamp][DensityScore]`.
2. **"Next Best Slot" Router**:
   - A server-side utility that, when a branch has 0 slots for a requested date, automatically queries neighboring branches (sorted by distance) for the next 3 available slots.
3. **Strict Typing**: All density and routing data must use Zod schemas.

## UI/UX Design (/frontend-developer)
1. **The Network Heatmap**:
   - A visual "Calendar Map" using CSS Grid.
   - Cells use a Surgical Sapphire gradient: 
     - 0-30% Full: Transparent/White
     - 31-70% Full: Light Sapphire
     - 71-100% Full: Deep Sapphire
   - Interactive: Hovering over a cell shows the specific branch name and availability.
2. **"Smart Redirect" Component**:
   - When a patient selects a full day in the booking flow, a subtle, elegant banner appears: 
     - *"No slots at [Branch A] on Tuesday, but [Branch B] (2.4 miles away) has a 10:00 AM available."*
     - Button: `✨ Switch to [Branch B]`

## Implementation Plan (/plan-writing)
- **Task 1**: Develop the Heatmap aggregation query in `lib/analytics/queries.ts`.
- **Task 2**: Implement the "Next Best Slot" suggestion logic in the booking API.
- **Task 3**: Build the Heatmap visualization for the Clinic Owner Dashboard.
- **Task 4**: Add the "Smart Redirect" UI to the Patient Booking Flow.

## Done When
- [ ] Owners can visualize booking density across all branches via a heatmap.
- [ ] Patients are automatically offered slots at alternative branches when their primary choice is full.
- [ ] The "High-End Clinical" aesthetic is maintained for all complex data visualizations.
- [ ] `npm run build` succeeds with zero type errors.
