# Clinic Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive branding dashboard for Clinic Owners to customize their clinic's identity, theme, and web presence.

**Architecture:** Use Next.js Server Actions for mutations, Drizzle ORM for database persistence, and a tabbed UI for organizing settings. Theme settings will be injected into the patient-facing pages via CSS variables.

**Tech Stack:** Next.js 16, Drizzle ORM, Clerk, Supabase Storage, Tailwind CSS, shadcn/ui.

---

### Task 1: Foundation Setup

**Files:**
- Modify: `package.json`
- Create: `db/schema.ts`
- Create: `lib/db.ts`

- [ ] **Step 1: Install dependencies**
Run: `npm install drizzle-orm pg clerk-nextjs lucide-react`
Run: `npm install -D drizzle-kit @types/pg`

- [ ] **Step 2: Define Database Schema**
Create `db/schema.ts`:
```typescript
import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clinicBranding = pgTable("clinic_branding", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  logoUrl: text("logo_url"),
  displayName: text("display_name"),
  description: text("description"),
  primaryColor: text("primary_color").default("#00c8d4"),
  secondaryColor: text("secondary_color").default("#111114"),
  subdomain: text("subdomain").unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 3: Setup Drizzle Client**
Create `lib/db.ts`:
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

- [ ] **Step 4: Commit**
```bash
git add package.json db/schema.ts lib/db.ts
git commit -m "feat: setup database schema and drizzle client"
```

---

### Task 2: Branding Server Actions

**Files:**
- Create: `lib/actions/branding.ts`

- [ ] **Step 1: Create update branding action**
Create `lib/actions/branding.ts`:
```typescript
"use server"

import { db } from "@/lib/db";
import { clinicBranding } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateBranding(tenantId: string, data: Partial<typeof clinicBranding.$inferSelect>) {
  await db.update(clinicBranding)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clinicBranding.tenantId, tenantId));
  
  revalidatePath("/clinic/branding");
}
```

- [ ] **Step 2: Commit**
```bash
git add lib/actions/branding.ts
git commit -m "feat: add branding server actions"
```

---

### Task 3: Branding Dashboard UI (Tabs)

**Files:**
- Create: `app/(dashboard)/clinic/branding/page.tsx`
- Create: `components/branding/branding-tabs.tsx`

- [ ] **Step 1: Create Branding Page**
Create `app/(dashboard)/clinic/branding/page.tsx`:
```tsx
import { BrandingTabs } from "@/components/branding/branding-tabs";

export default function BrandingPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Clinic Branding</h1>
      <BrandingTabs />
    </div>
  );
}
```

- [ ] **Step 2: Create Tab Component**
Create `components/branding/branding-tabs.tsx`:
```tsx
"use client"

import { useState } from "react";
import { IdentityTab } from "./identity-tab";
import { AppearanceTab } from "./appearance-tab";
import { PresenceTab } from "./presence-tab";

export function BrandingTabs() {
  const [activeTab, setActiveTab] = useState("identity");

  return (
    <div className="space-y-6">
      <div className="flex border-b border-default">
        {["identity", "appearance", "presence"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab ? "border-b-2 border-brand text-brand" : "text-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeTab === "identity" && <IdentityTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "presence" && <PresenceTab />}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/(dashboard)/clinic/branding/page.tsx components/branding/branding-tabs.tsx
git commit -m "feat: implement branding dashboard layout and tabs"
```

---

### Task 4: Identity Tab Implementation

**Files:**
- Create: `components/branding/identity-tab.tsx`

- [ ] **Step 1: Create Identity Tab Form**
Create `components/branding/identity-tab.tsx`:
```tsx
"use client"

export function IdentityTab() {
  return (
    <div className="max-w-2xl space-y-6 bg-surface p-6 rounded-2xl border border-default">
      <div className="space-y-2">
        <label className="text-sm font-medium">Clinic Logo</label>
        <div className="border-2 border-dashed border-default rounded-xl p-8 text-center hover:border-brand cursor-pointer transition-colors">
          <p className="text-muted">Drag & drop or click to upload logo</p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Display Name</label>
        <input className="w-full bg-base border border-default rounded-xl px-4 py-2" placeholder="e.g. Smile Dental Clinic" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea className="w-full bg-base border border-default rounded-xl px-4 py-2 h-32" placeholder="Tell patients about your clinic..." />
      </div>
      <button className="bg-brand text-white px-6 py-2 rounded-xl font-medium">Save Identity</button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add components/branding/identity-tab.tsx
git commit -m "feat: implement identity tab for branding"
```

---

### Task 5: Appearance and Presence Tabs

**Files:**
- Create: `components/branding/appearance-tab.tsx`
- Create: `components/branding/presence-tab.tsx`

- [ ] **Step 1: Create Appearance Tab**
Create `components/branding/appearance-tab.tsx`:
```tsx
"use client"

export function AppearanceTab() {
  return (
    <div className="max-w-2xl space-y-6 bg-surface p-6 rounded-2xl border border-default">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Color</label>
          <div className="flex gap-2">
            <input type="color" className="h-10 w-10 rounded-lg cursor-pointer bg-transparent" defaultValue="#00c8d4" />
            <input className="flex-1 bg-base border border-default rounded-xl px-4 py-2 font-mono" defaultValue="#00c8d4" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Secondary Color</label>
          <div className="flex gap-2">
            <input type="color" className="h-10 w-10 rounded-lg cursor-pointer bg-transparent" defaultValue="#111114" />
            <input className="flex-1 bg-base border border-default rounded-xl px-4 py-2 font-mono" defaultValue="#111114" />
          </div>
        </div>
      </div>
      <button className="bg-brand text-white px-6 py-2 rounded-xl font-medium">Save Appearance</button>
    </div>
  );
}
```

- [ ] **Step 2: Create Presence Tab**
Create `components/branding/presence-tab.tsx`:
```tsx
"use client"

export function PresenceTab() {
  return (
    <div className="max-w-2xl space-y-6 bg-surface p-6 rounded-2xl border border-default">
      <div className="space-y-2">
        <label className="text-sm font-medium">Custom Subdomain</label>
        <div className="flex items-center gap-2">
          <input className="flex-1 bg-base border border-default rounded-xl px-4 py-2" placeholder="clinic-name" />
          <span className="text-muted">.dentalhub.com</span>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">SEO Title</label>
        <input className="w-full bg-base border border-default rounded-xl px-4 py-2" placeholder="e.g. Best Dental Clinic in London" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">SEO Description</label>
        <textarea className="w-full bg-base border border-default rounded-xl px-4 py-2 h-24" placeholder="Brief summary for search engines..." />
      </div>
      <button className="bg-brand text-white px-6 py-2 rounded-xl font-medium">Save Presence</button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add components/branding/appearance-tab.tsx components/branding/presence-tab.tsx
git commit -m "feat: implement appearance and presence tabs"
```
