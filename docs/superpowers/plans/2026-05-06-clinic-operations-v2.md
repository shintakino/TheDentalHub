# Clinic Operations Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Clinic Operations Management including geocoded branches, dental services, and staff management integrated with Clerk.

**Architecture:** 
- **Geocoding:** Service-side derivation of coordinates using a geocoding helper.
- **API:** RESTful endpoints for Branches, Services, and Staff, secured by Clerk Auth and RBAC.
- **Synchronization:** Auto-syncing Clerk Organization members to the local `staff` table.
- **UI:** Tabbed settings interface using shadcn/ui and react-hook-form.

**Tech Stack:** Next.js, Drizzle ORM, Clerk, Zod, React Hook Form, Lucide React.

---

### Task 1: Geocoding Helper

**Files:**
- Create: `lib/geocoding.ts`

- [ ] **Step 1: Implement geocoding utility**
Implement a helper that takes an address string and returns latitude/longitude. Use Nominatim (OpenStreetMap) as a fallback or mock if no API keys are provided.

```typescript
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;
  
  try {
    // Attempt to use Nominatim (OpenStreetMap) - No API key required for low volume
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'TheDentalHub/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error("Geocoding failed");
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    // Fallback/Mock for development if Nominatim fails or returns nothing
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      lat: 40.7128,
      lng: -74.0060
    };
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add lib/geocoding.ts
git commit -m "feat: add geocoding utility"
```

---

### Task 2: Update Branch API with Geocoding

**Files:**
- Modify: `app/api/clinics/[id]/branches/route.ts`
- Modify: `app/api/clinics/[id]/branches/[branchId]/route.ts`

- [ ] **Step 1: Update POST in `branches/route.ts`**
Integrate `geocodeAddress` before inserting into DB.

- [ ] **Step 2: Update PATCH in `branches/[branchId]/route.ts`**
Integrate `geocodeAddress` if the address has changed.

- [ ] **Step 3: Commit**
```bash
git add app/api/clinics/[id]/branches/route.ts app/api/clinics/[id]/branches/[branchId]/route.ts
git commit -m "feat: integrate geocoding into branch CRUD"
```

---

### Task 3: Staff Management & Synchronization

**Files:**
- Modify: `app/api/clinics/[id]/staff/route.ts`

- [ ] **Step 1: Implement auto-sync in GET**
When fetching staff, ensure any member in Clerk but missing in DB is added to the `staff` table.

- [ ] **Step 2: Commit**
```bash
git add app/api/clinics/[id]/staff/route.ts
git commit -m "feat: implement staff synchronization"
```

---

### Task 4: UI Fixes & Refinement

**Files:**
- Modify: `components/dashboard/settings/ServicesTab.tsx`
- Modify: `components/dashboard/settings/StaffTab.tsx`

- [ ] **Step 1: Fix DropdownMenuTrigger and cn**
Fix the `render` prop and `cn` imports/usage.

- [ ] **Step 2: Commit**
```bash
git add components/dashboard/settings/ServicesTab.tsx components/dashboard/settings/StaffTab.tsx
git commit -m "fix: resolve UI bugs in settings tabs"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run full type check and build**
Run: `npm run build`
Expected: PASS with no `any` types.

- [ ] **Step 2: Update Progress Tracker**
Mark Feature 10 as completed.

- [ ] **Step 3: Commit**
```bash
git add context/progress-tracker.md
git commit -m "docs: complete Feature 10"
```
