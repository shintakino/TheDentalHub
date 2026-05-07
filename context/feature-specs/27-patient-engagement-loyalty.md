# 27 - Patient Engagement & Loyalty System

## Goal
Drive patient retention and lifetime value by implementing a sophisticated engagement and loyalty system. This includes automated post-care follow-ups, a points-based loyalty program for elective services, and personalized health reminders, all while maintaining the "High-End Clinical" aesthetic.

## Domain Context & Boundaries
- **Loyalty Points**: Earned based on service value or frequency. Can be redeemed for discounts or "Premium" elective services (e.g., whitening).
- **Feedback Loops**: Automated "How was your visit?" requests sent via Feature 13.
- **Privacy**: Patient preference for communication frequency must be strictly respected.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - `patient_profiles`: 
     - `id`: UUID
     - `user_id`: References Clerk `user_id`
     - `loyalty_points`: Integer (Default 0)
     - `preferences`: JSONB (Strictly typed `{ email_marketing: boolean, sms_reminders: boolean }`)
   - `loyalty_transactions`:
     - `id`: UUID
     - `patient_id`: References `patient_profiles.id`
     - `amount`: Integer (Positive for earned, negative for redeemed)
     - `reason`: Text
2. **Automated Follow-up Worker**: 
   - A background job (Vercel Cron) that identifies `completed` appointments from the previous 24 hours and triggers feedback emails.
3. **Strict Typing**: All schemas must use Zod. No `any` types. Use Drizzle `InferSelectModel<typeof table>` for all data mapping.

## UI/UX Design (/frontend-developer)
1. **Loyalty Dashboard (Patient)**:
   - A "Loyalty Card" component in the Patient Portal showing point balance and "Next Reward" progress bar.
   - Elegant, minimal icons for points (e.g., a subtle Sapphire Star).
2. **Feedback Interface**:
   - A one-click rating system (1-5 stars) in the email template leading to a pristine, minimal review page.

## Implementation Plan (/plan-writing)
- **Task 1**: Add `patient_profiles` and `loyalty_transactions` to `schema.ts`.
- **Task 2**: Implement the loyalty calculation logic in the Appointment Lifecycle (`completed` status transition).
- **Task 3**: Build the Patient Loyalty UI in `app/(patient)/dashboard`.
- **Task 4**: Create the Automated Follow-up worker using the Notification System.

## Done When
- [ ] Patients earn points automatically upon completing appointments.
- [ ] Points balance and history are visible in the Patient Portal.
- [ ] Automated feedback requests are sent after visits.
- [ ] `npm run build` succeeds with zero type errors.
