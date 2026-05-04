# Clinic Branding System Design Spec

## Goal
Enable Clinic Owners to customize their clinic's identity, visual theme, and web presence through a dedicated branding dashboard.

## Dashboard Structure (Tabbed Interface)

### 1. Identity Tab
- **Logo Upload**: Drag-and-drop zone for PNG/JPG/SVG. Persisted to Supabase Storage.
- **Display Name**: Text input for the public-facing clinic name.
- **Description**: Textarea for clinic biography/overview.

### 2. Appearance Tab
- **Primary Color**: Hex/Picker input for brand buttons and highlights.
- **Secondary Color**: Hex/Picker input for accents and subtle backgrounds.
- **Preview Component**: A small "live preview" card showing how colors look on a button and header.

### 3. Presence Tab
- **Custom Subdomain**: Input for `[subdomain].dentalhub.com`. Must be unique.
- **SEO Title**: Text input for `<title>` tag.
- **SEO Description**: Textarea for `<meta name="description">` tag.
- **OG Image**: Image upload for social sharing cards.

## Technical Architecture

### Data Model (Drizzle)
```typescript
export const clinicBranding = pgTable("clinic_branding", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  logoUrl: text("logo_url"),
  displayName: text("display_name"),
  description: text("description"),
  primaryColor: text("primary_color").default("#00c8d4"), // Default Cyan
  secondaryColor: text("secondary_color").default("#111114"),
  subdomain: text("subdomain").unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
});
```

### Storage
- **Bucket**: `clinic-assets` in Supabase Storage.
- **Pathing**: `branding/{tenant_id}/logo.png`.

### Dynamic Theming
- **Mechanism**: Server-side style injection.
- **CSS Variables**:
  ```html
  <style>
    :root {
      --brand-primary: ${clinic.primaryColor};
      --brand-secondary: ${clinic.secondaryColor};
    }
  </style>
  ```

### Subdomain Middleware
- **Next.js Middleware**: Intercepts requests, extracts the subdomain, and resolves the `tenant_id`.
- **Fallback**: If no subdomain is present, routes to the landing page or a default clinic view.

## Success Criteria
- Clinic Owners can upload and save branding settings via the dashboard.
- Patient booking pages reflect the saved colors and logo.
- SEO tags correctly reflect the clinic's custom metadata.
- Subdomain routing correctly loads the specific clinic's data.
