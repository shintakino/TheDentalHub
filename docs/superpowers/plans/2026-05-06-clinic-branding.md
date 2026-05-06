# Clinic Branding System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Identity, Appearance, and Presence settings for clinics via REST API and a dashboard UI, with dynamic theming for patient-facing pages.

**Architecture:** Extend the `clinics` table with branding fields. Use Supabase Storage for logo uploads. Provide a tabbed dashboard UI and REST API endpoints for updates. Inject CSS variables for dynamic theming.

**Tech Stack:** Next.js 16, Drizzle ORM, Clerk, Supabase Storage, Tailwind CSS 4, shadcn/ui.

---

### Task 1: Database Schema & Validations

**Files:**
- Modify: `lib/db/schema.ts`
- Modify: `lib/validations.ts`

- [ ] **Step 1: Update Clinics Table**
Add branding columns to the `clinics` table.
```typescript
// lib/db/schema.ts
export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#0047FF"),
  secondaryColor: text("secondary_color"),
  subdomain: text("subdomain").unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Add Branding Zod Schemas**
Define validation schemas for branding updates.
```typescript
// lib/validations.ts
import { z } from "zod";

export const updateBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  subdomain: z.string().min(3).max(32).regex(/^[a-z0-9-]+$/).optional().nullable(),
  seoTitle: z.string().max(60).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
});
```

- [ ] **Step 3: Run Database Migration**
Run: `npm run db:push`
Expected: Database schema updated with new columns.

- [ ] **Step 4: Commit**
```bash
git add lib/db/schema.ts lib/validations.ts
git commit -m "feat: add branding columns to schema and validations"
```

---

### Task 2: Supabase Storage Utility

**Files:**
- Create: `lib/storage/supabase.ts`

- [ ] **Step 1: Implement Storage Wrapper**
Create a utility to handle file uploads to Supabase.
```typescript
// lib/storage/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadClinicLogo(tenantId: string, file: File) {
  const fileName = `logos/${tenantId}-${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("branding_assets")
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from("branding_assets")
    .getPublicUrl(data.path);

  return publicUrl;
}
```

- [ ] **Step 2: Commit**
```bash
git add lib/storage/supabase.ts
git commit -m "feat: add supabase storage utility for logos"
```

---

### Task 3: Branding REST API Endpoints

**Files:**
- Create: `app/api/clinics/[id]/branding/route.ts`
- Create: `app/api/clinics/[id]/branding/logo/route.ts`

- [ ] **Step 1: Implement Branding Update API**
```typescript
// app/api/clinics/[id]/branding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateBrandingSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { orgId, orgRole } = await auth();
  if (!orgId || orgId !== params.id || orgRole !== "org:admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = updateBrandingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }

  await db.update(clinics)
    .set({ ...validation.data, updatedAt: new Date() })
    .where(eq(clinics.tenantId, params.id));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Implement Logo Upload API**
```typescript
// app/api/clinics/[id]/branding/logo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadClinicLogo } from "@/lib/storage/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { orgId, orgRole } = await auth();
  if (!orgId || orgId !== params.id || orgRole !== "org:admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const logoUrl = await uploadClinicLogo(params.id, file);

  await db.update(clinics)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(clinics.tenantId, params.id));

  return NextResponse.json({ logoUrl });
}
```

- [ ] **Step 3: Commit**
```bash
git add app/api/clinics/
git commit -m "feat: implement branding and logo upload API endpoints"
```

---

### Task 4: Branding Dashboard UI

**Files:**
- Create: `app/(dashboard)/branding/page.tsx`
- Create: `components/dashboard/branding/IdentityTab.tsx`
- Create: `components/dashboard/branding/AppearanceTab.tsx`
- Create: `components/dashboard/branding/PresenceTab.tsx`

- [ ] **Step 1: Create Identity Tab**
Implement logo upload and name editing.

- [ ] **Step 2: Create Appearance Tab**
Implement color pickers for primary/secondary colors.

- [ ] **Step 3: Create Presence Tab**
Implement subdomain and SEO fields.

- [ ] **Step 4: Create Main Branding Page**
Assemble tabs into a single dashboard page.

- [ ] **Step 5: Commit**
```bash
git add app/(dashboard)/branding/ components/dashboard/branding/
git commit -m "feat: implement branding dashboard UI with Identity, Appearance, and Presence tabs"
```

---

### Task 5: Dynamic Theming & Patient Layout

**Files:**
- Create: `app/(booking)/[tenantSlug]/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add Brand CSS Variables**
Update `app/globals.css` to use variables for primary colors.
```css
:root {
  --brand-primary: #0047FF;
  --brand-secondary: #F1F5F9;
}
```

- [ ] **Step 2: Implement Booking Layout**
Create a layout that fetches clinic branding and injects CSS variables.
```tsx
// app/(booking)/[tenantSlug]/layout.tsx
import { db } from "@/lib/db";
import { clinics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function BookingLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const clinic = await db.query.clinics.findFirst({
    where: eq(clinics.subdomain, params.tenantSlug)
  });

  const brandStyles = {
    "--brand-primary": clinic?.primaryColor || "#0047FF",
    "--brand-secondary": clinic?.secondaryColor || "#F1F5F9",
  } as React.CSSProperties;

  return (
    <div style={brandStyles} className="min-h-screen">
      <nav className="p-4 border-b">
        {clinic?.logoUrl && <img src={clinic.logoUrl} alt={clinic.name} className="h-8" />}
        {!clinic?.logoUrl && <span className="font-bold">{clinic?.name}</span>}
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/(booking)/ app/globals.css
git commit -m "feat: implement dynamic theming and patient-facing booking layout"
```
