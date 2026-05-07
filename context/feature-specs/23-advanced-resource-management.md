# 23 - Advanced Resource Management (Physical & Human Capital)

## Goal
Optimize clinic throughput by managing the two most constrained resources: physical space (Chairs/Rooms) and human capital (Staff Allocation). This ensures that appointments are only booked when both a qualified practitioner AND an available operatory room are present.

## Domain Context & Boundaries
- **Resource Constraints**: An appointment requires 1 Staff Member + 1 Chair/Room.
- **Floating Staff**: Practitioners may work at different branches on different days of the week.
- **Capacity**: Each branch has a fixed number of operatory rooms that limits concurrent appointments regardless of staff count.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - `branches`: Add `max_capacity` (integer) representing the number of dental chairs.
   - `staff_assignments`: 
     - `id`: UUID
     - `staff_id`: References `staff.id`
     - `branch_id`: References `branches.id`
     - `day_of_week`: Integer (0-6)
     - `start_time`: Time
     - `end_time`: Time
2. **Scheduling Engine Update**: Modify the Slot Generator (Feature 05) to check:
   - `count(active_appointments) < branch.max_capacity` for any given time slice.
   - `staff_assignment` exists for the requested branch and time.
3. **Strict Typing**: All assignment logic must use Zod schemas. The `any` type is strictly forbidden.

## UI/UX Design (/frontend-developer)
1. **Capacity Configuration**:
   - A "Resource Settings" section in the Branch Manager (Feature 22) to set the number of chairs.
2. **Staff Roster Grid**:
   - A drag-and-drop or checkbox-based grid showing days of the week vs. staff members to assign them to specific branches.
3. **Visual Alerts**:
   - Warn owners if they have more staff assigned to a branch than available chairs ("Over-capacity warning").

## Implementation Plan (/plan-writing)
- **Task 1**: Update `lib/db/schema.ts` with `max_capacity` and the `staff_assignments` table.
- **Task 2**: Refactor `lib/scheduling/slot-generator.ts` to incorporate physical capacity and staff location logic.
- **Task 3**: Build the Staff Roster management UI in the Clinic Dashboard.
- **Task 4**: Implement "Capacity Insights" on the branch cards to show chair utilization.

## Done When
- [ ] Appointments cannot be booked beyond the physical chair capacity of a branch.
- [ ] Staff can be assigned to different branches on different days.
- [ ] The scheduling engine correctly respects "Floating Staff" locations.
- [ ] `npm run build` succeeds with zero type errors.
