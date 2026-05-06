# Clinic Operations Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full CRUD management for Branches, Services, and Staff, restricted to Clinic Owners, following the "High-End Clinical" design system.

**Architecture:** 
- RESTful API endpoints in `app/api/clinics/[id]/...` guarded by Clerk RBAC.
- Data isolation via `tenant_id` scoping in all DB queries.
- UI built with `Tabs`, `Table`, and `Dialog` from shadcn/ui, styled with premium light-mode aesthetics.

**Tech Stack:** Next.js 15, Drizzle ORM, Clerk SDK, Zod, React Hook Form, Tailwind CSS.

---

### Task 1: Database Schema Updates

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Update schema for Branches, Services, and Staff**
Modify `lib/db/schema.ts` to:
1. Add `operatingHours` (JSONB) to `branches`.
2. Change `duration` in `services` from `text` to `integer` (minutes).
3. Ensure all management tables are correctly referenced.

```typescript
// lib/db/schema.ts updates
export const branches = pgTable("branches", {
  // ... existing fields
  operatingHours: jsonb("operating_hours").$type<{ day: number; open: string; close: string; active: boolean }[]>().default([]).notNull(),
  // ...
});

export const services = pgTable("services", {
  // ...
  duration: integer("duration").notNull(), // Change to integer for minutes
  // ...
});
```

- [ ] **Step 2: Apply schema changes**
Run: `npm run db:push`
Expected: Migration succeeds.

- [ ] **Step 3: Commit**
```bash
git add lib/db/schema.ts
git commit -m "schema: update branches and services for operations management"
```

---

### Task 2: Validations & Types

**Files:**
- Modify: `lib/validations.ts`

- [ ] **Step 1: Add Zod schemas for Operations CRUD**
Add schemas for Branch, Service, and Staff mutations.

```typescript
export const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  timezone: z.string().default("UTC"),
  operatingHours: z.array(z.object({
    day: z.number().min(0).max(6),
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    active: z.boolean()
  }))
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  duration: z.number().positive("Duration must be positive")
});

export const inviteStaffSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "dentist", "receptionist"]),
  name: z.string().min(1, "Name is required")
});
```

- [ ] **Step 2: Commit**
```bash
git add lib/validations.ts
git commit -m "types: add validations for clinic operations"
```

---

### Task 3: Branches API

**Files:**
- Create: `app/api/clinics/[id]/branches/route.ts`
- Create: `app/api/clinics/[id]/branches/[branchId]/route.ts`

- [ ] **Step 1: Implement GET/POST Branches**
Implement list and create with RBAC check.

- [ ] **Step 2: Implement PATCH/DELETE Branch**
Implement update and delete. Ensure deletion is blocked if active appointments exist.

- [ ] **Step 3: Commit**
```bash
git add app/api/clinics/[id]/branches
git commit -m "api: implement branches crud with rbac"
```

---

### Task 4: Services API

**Files:**
- Create: `app/api/clinics/[id]/services/route.ts`
- Create: `app/api/clinics/[id]/services/[serviceId]/route.ts`

- [ ] **Step 1: Implement GET/POST Services**
- [ ] **Step 2: Implement PATCH/DELETE Service**
Block deletion if active appointments exist.

- [ ] **Step 3: Commit**
```bash
git add app/api/clinics/[id]/services
git commit -m "api: implement services crud with rbac"
```

---

### Task 5: Staff API & Clerk Integration

**Files:**
- Create: `app/api/clinics/[id]/staff/route.ts`
- Create: `app/api/clinics/[id]/staff/invite/route.ts`
- Create: `app/api/clinics/[id]/staff/[userId]/route.ts`

- [ ] **Step 1: Implement Staff Listing**
Join `staff` table with Clerk organization members.

- [ ] **Step 2: Implement Staff Invite**
Wrap `clerkClient().organizations.createOrganizationInvitation`.

- [ ] **Step 3: Implement Staff Update/Remove**
Update role or remove from organization.

- [ ] **Step 4: Commit**
```bash
git add app/api/clinics/[id]/staff
git commit -m "api: implement staff management via clerk"
```

---

### Task 6: Settings UI Structure

**Files:**
- Create: `app/(dashboard)/settings/page.tsx`
- Create: `components/dashboard/settings/SettingsHeader.tsx`

- [ ] **Step 1: Create Main Settings Page**
Use `Tabs` for Branches, Services, Staff.

- [ ] **Step 2: Implement Settings Header**
Consistent with branding/analytics pages.

- [ ] **Step 3: Commit**
```bash
git add app/(dashboard)/settings components/dashboard/settings
git commit -m "ui: add settings layout and tabs"
```

---

### Task 7: Branches Management UI

**Files:**
- Create: `components/dashboard/settings/BranchesTab.tsx`
- Create: `components/dashboard/settings/BranchForm.tsx`
- Create: `components/dashboard/settings/OperatingHoursEditor.tsx`

- [ ] **Step 1: Implement Branch List**
Premium table with diffuse shadows.

- [ ] **Step 2: Implement Branch Create/Edit Dialog**
- [ ] **Step 3: Implement Operating Hours Editor**
Visual grid for day/time selection.

- [ ] **Step 4: Commit**
```bash
git add components/dashboard/settings
git commit -m "ui: implement branches management and hours editor"
```

---

### Task 8: Services Management UI

**Files:**
- Create: `components/dashboard/settings/ServicesTab.tsx`
- Create: `components/dashboard/settings/ServiceForm.tsx`

- [ ] **Step 1: Implement Service List & Form**
Simple table and dialog.

- [ ] **Step 2: Commit**
```bash
git add components/dashboard/settings
git commit -m "ui: implement services management"
```

---

### Task 9: Staff Management UI

**Files:**
- Create: `components/dashboard/settings/StaffTab.tsx`
- Create: `components/dashboard/settings/InviteStaffDialog.tsx`

- [ ] **Step 1: Implement Staff List**
Show name, email, role, status.

- [ ] **Step 2: Implement Invite Dialog**
- [ ] **Step 3: Commit**
```bash
git add components/dashboard/settings
git commit -m "ui: implement staff management ui"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run full type check**
Run: `npm run build`
Expected: Success with zero `any` types.

- [ ] **Step 2: Manual Verification**
Verify: Owner can manage all three sections.
Verify: Non-owner cannot access settings.

- [ ] **Step 3: Final Commit**
```bash
git commit -m "feat: complete clinic operations management module"
```
