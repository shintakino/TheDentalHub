# 35 - Type Safety Enforcement & Zod Integration

## Goal
Ensure 100% type safety and robust runtime validation across the entire application. This specification formalizes the project-wide mandate to use strict TypeScript and Zod schemas for all data boundaries, completely eliminating the use of `any` and `unknown` types to prevent runtime errors and ensure long-term maintainability.

## Domain Context & Boundaries
- **API Boundaries**: All data entering or leaving the application via API routes.
- **Component Props**: All data passed between React components.
- **Database Layer**: All interactions with Supabase via Drizzle ORM.
- **State Management**: All client-side state (React hooks, context).
- **Prohibited Types**: `any`, `unknown`, `object` (as a type), and `any[]`.

## Architectural Decisions (/backend-architect)
1. **Zero-Tolerance for `any` & `unknown`**:
   - The use of `any` and `unknown` is strictly forbidden. 
   - For unknown error objects in `catch` blocks, use a type guard or cast to a known error interface (e.g., `Error`).
   - For generic objects, use `Record<string, T>` where `T` is a specific type.
2. **Mandatory Zod Validation**:
   - Every API endpoint must validate `req.body`, `req.query`, and `req.params` using Zod schemas defined in `lib/validations.ts`.
   - API responses must be structured and typed using `z.infer` to ensure the frontend receives predictable data.
3. **Drizzle Type Inference**:
   - Leverage Drizzle's `InferSelectModel` and `InferInsertModel` for all database interactions.
   - Any custom aggregation queries must have their result sets explicitly typed via Zod or custom interfaces.
4. **Strict Component Interfaces**:
   - All React components must define their props using `interface` or `type`.
   - Arrays of data must be typed as `T[]` where `T` is a specific domain model.

## UI/UX Design (/frontend-developer)
1. **Developer Experience (DX)**:
   - High-quality IntelliSense across the entire codebase.
   - Instant feedback on type mismatches during development.
2. **Form Validation**:
   - Use `react-hook-form` with `zodResolver` for all user-facing forms to provide immediate, typed validation feedback.
3. **Loading & Error States**:
   - Ensure loading and error states are correctly typed to avoid "undefined" access errors in the UI.

## Implementation Plan (/plan-writing)

### Phase 1: Audit & Refactor API Routes
- **Task 1**: Refactor `app/api/appointments/[id]/status/route.ts` to remove `any` from `updateData`. → Verify: Types are explicitly defined or inferred.
- **Task 2**: Refactor `app/api/clinics/[id]/campaigns/[campaignId]/route.ts` to remove `any` from `updateData`. → Verify: Types are explicitly defined or inferred.
- **Task 3**: Audit all remaining API routes for missing Zod validation on request parameters. → Verify: All `params` and `query` access is wrapped in a Zod parse.

### Phase 2: Refactor Frontend Components
- **Task 4**: Refactor `components/booking/BranchStep.tsx` and `ServiceStep.tsx` to replace `any[]` with specific types (e.g., `BranchPayload[]`). → Verify: Props are strictly typed.
- **Task 5**: Refactor `components/dashboard/OverviewComponents.tsx` to replace `any[]` and `any` with specific types. → Verify: Data mapping is type-safe.
- **Task 6**: Refactor `components/dashboard/InventoryManager.tsx` to handle errors type-safely in `catch` blocks. → Verify: No `error: any` remains.

### Phase 3: Global Configuration & CI
- **Task 7**: Ensure `tsconfig.json` has `strict: true` and all related flags enabled. → Verify: `tsc` catches all implicit `any` usage.
- **Task 8**: Add a lint rule (if not already present) to prevent the use of `any`. → Verify: `npm run lint` fails if `any` is introduced.

## Done When
- [ ] No instances of `any` or `unknown` exist in the `app/` and `components/` directories.
- [ ] All API boundaries are protected by Zod schemas.
- [ ] All database interactions use Drizzle's type inference.
- [ ] All React components have strict prop definitions.
- [ ] `npm run build` succeeds with zero type errors and zero warnings related to implicit types.
