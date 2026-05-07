# 29 - Predictive Operations & AI Insights

## Goal
Leverage historical data to move from reactive to proactive clinic management. Use basic forecasting to predict no-show probabilities and suggest optimal scheduling blocks, enhancing the "Intelligence" layer of the platform.

## Domain Context & Boundaries
- **No-Show Probability**: Based on patient history (previous no-shows) and appointment type/time.
- **Smart Blocking**: Suggesting specific times for high-value services to maximize revenue during peak hours.

## Architectural Decisions (/backend-architect)
1. **Heuristic Engine**:
   - Create `lib/intelligence/forecaster.ts`.
   - Logic: `score = (patient.no_show_count * 2) + (is_monday_morning ? 1 : 0)`.
2. **Schema Enhancements**:
   - `appointments`: Add `risk_score` (decimal) calculated at time of booking.
3. **Strict Typing**: All prediction payloads must be typed. No `any`.

## UI/UX Design (/frontend-developer)
1. **Risk Indicators**:
   - A subtle "High Risk" badge on the `DailySchedule` for appointments with a high no-show probability.
2. **AI Action Bar**:
   - "Suggested Action" on high-risk appointments (e.g., "Send an extra reminder SMS").

## Implementation Plan (/plan-writing)
- **Task 1**: Implement the No-Show Risk scoring logic.
- **Task 2**: Update the scheduling UI to display risk badges.
- **Task 3**: Integrate with the Notification System for "High Priority" reminders.

## Done When
- [ ] Staff can identify high-risk appointments at a glance.
- [ ] The system suggests proactive actions to reduce no-shows.
- [ ] `npm run build` succeeds with zero type errors.
