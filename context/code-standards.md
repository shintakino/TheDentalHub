# Code Standards

## General
- **Surgical Changes**: Prefer minimal, focused edits.
- **Root Cause Fixes**: Avoid layering workarounds.
- **Single Responsibility**: Keep modules and components focused.

## TypeScript
- **Strict Mode**: Required.
- **No `any`**: Use explicit interfaces or types.
- **Type Guards**: Use for validating external input at boundaries.
- **Drizzle Schema**: Maintain strict alignment between DB schema and TypeScript types.

## Multi-Tenancy
- **Tenant Scoping**: All queries (except global admin) must explicitly filter by `tenantId`.
- **Validation**: Ensure `tenantId` is verified from the session/token before executing mutations.

## Scheduling Logic
- **Atomic Operations**: Use database transactions for booking to prevent race conditions.
- **UTC Storage**: All dates must be stored in UTC in the database.
- **Timezone Utilities**: Use a centralized library (e.g., date-fns or dayjs) for timezone conversions.

## React & Next.js
- **Server Components**: Use by default for data fetching.
- **Client Components**: Use only for interactive forms, calendars, or real-time state.
- **Server Actions**: Prefer Server Actions for form submissions and simple mutations.

## Audit Logging
- **Mandatory**: Every change to an appointment status or time must be accompanied by an audit log entry.
- **Pattern**: Use a middleware or a decorator pattern to ensure audit logs are never skipped.

## Styling
- **Tailwind**: Use utility classes. 
- **Theming**: Reference CSS variables for clinic-branded colors.
- **Consistency**: Follow the border-radius and spacing scales defined in `ui-context.md`.

## File Organization
- `db/` — Drizzle schema and migrations.
- `lib/` — Business logic (scheduling engine, RBAC, etc.).
- `app/` — Next.js routes and layouts.
- `components/` — UI components (Shared and Feature-specific).
