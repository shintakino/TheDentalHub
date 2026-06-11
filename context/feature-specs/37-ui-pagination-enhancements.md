# Feature 37: UI Pagination & UX Enhancements

## 1. Overview
As the platform scales with more data (patients, appointments, logs, inventory), rendering all records on a single page degrades performance and creates a poor user experience. Furthermore, to elevate the platform from a "standard dashboard" to a premium, high-end clinical operating system, we need to implement seamless pagination and refined UI states.

This specification outlines the plan to implement URL-driven server-side pagination across all data-heavy views and applies premium UI polish (empty states, loading skeletons, refined table styling) to ensure the application feels fast, responsive, and professionally crafted.

## 2. Objectives
- **Performance**: Implement `limit` and `offset` at the database level to prevent massive payloads.
- **UX & Context Preservation**: Use URL Search Parameters (`?page=1&limit=10&branch=id`) for pagination and branch switching so that users can bookmark, share, refresh, and navigate across modules without losing their place or selected branch context.
- **Aesthetics**: Avoid "AI-generated" or generic looks. Enhance tables with sticky headers, soft hover states, rounded corners, and dynamic branding.
- **Feedback**: Provide skeleton loaders during data fetches and beautifully designed empty states when no data is present.

## 3. Scope of Implementation

### Phase 1: Foundation & Reusable Components
1. **Reusable Pagination Component**: Build a highly polished, shadcn-based `<Pagination />` component that reads from and writes to the URL query string.
2. **Global Branch Switcher Enhancement**: Refine the existing branch switcher UI and ensure its state is driven by the URL (`?branch=uuid`) to persist context universally.
3. **Server-Side Utilities**: Create standard Drizzle ORM query patterns for fetching data, applying branch filters, and retrieving total record counts simultaneously.
4. **Skeleton Components**: Create reusable `<TableSkeleton />` and `<ListSkeleton />` components.
5. **Empty State Component**: Create an `<EmptyState />` component with clinical, premium styling (e.g., using Lucide icons, soft muted colors, and a clear call-to-action).

### Phase 2: Applying Pagination & Branch State to Core Modules
Implement the new pagination, UI components, and URL-driven branch filtering across the following heavy data views:
1. **Patient Directory** (`/manage/[tenantSlug]/patients`)
2. **Waitlist & Walk-in Queue** (`/manage/[tenantSlug]/queue`)
3. **Audit Logs & System Monitoring** (`/manage/[tenantSlug]/settings` and Admin dashboard)
4. **Inventory Management** (`/manage/[tenantSlug]/inventory`)
5. **Staff Directory & Scheduling Views** (`/manage/[tenantSlug]/staff`)

### Phase 3: Premium UI Polish (The "Anti-AI" Look)
1. **Table Refinements**: 
   - Add sticky headers for long lists.
   - Ensure soft borders (`border-border/50`).
   - Add subtle row hover effects (`hover:bg-muted/50`).
   - Align text properly (numbers right-aligned, text left-aligned, actions centered).
2. **Transitions**: Add subtle `framer-motion` or CSS transitions when changing pages or switching branches.
3. **Typography & Spacing**: Increase row height for better readability, use `text-sm text-muted-foreground` for secondary data.

## 4. Technical Implementation Details

### URL-Driven State Pattern
Instead of `useState`, we will use Next.js App Router hooks (`useSearchParams`, `usePathname`, `useRouter`) to drive pagination and branch context.
```typescript
// Example hook usage in component
const searchParams = useSearchParams();
const page = Number(searchParams.get('page')) || 1;
const limit = Number(searchParams.get('limit')) || 10;
const branchId = searchParams.get('branch'); // Can be null if viewing "All Branches"
```

### Database Query Pattern (Drizzle)
```typescript
// Apply branch filter if present, alongside pagination limits
const baseQuery = db.select().from(patients).where(
  and(
    eq(patients.tenantId, tenantId),
    branchId ? eq(patients.branchId, branchId) : undefined
  )
);

const [data, totalCount] = await Promise.all([
  baseQuery.limit(limit).offset((page - 1) * limit),
  db.select({ count: sql`count(*)` }).from(patients).where(...) // Match base where clause
]);
```

## 5. Next Steps / Workflow Execution
1. Create the base UI components (`<Pagination />`, `<TableSkeleton />`, `<EmptyState />`).
2. Enhance the **Global Branch Switcher** to sync with URL parameters.
3. Integrate pagination and branch context into the **Patient Directory** as the first proof-of-concept.
4. Review and iterate on the UI/UX.
5. Roll out to all other modules defined in Phase 2.
