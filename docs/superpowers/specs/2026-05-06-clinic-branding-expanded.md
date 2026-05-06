# Clinic Branding System Design Spec (Expanded)

## Goal
Enable Clinic Owners to customize their clinic's identity, visual theme, and web presence (Presence) through a dedicated branding dashboard and REST API.

## Data Model (Extensions to `clinics` table)
| Column | Type | Description |
|--------|------|-------------|
| `logo_url` | text | Public URL to the clinic logo in Supabase Storage |
| `primary_color` | text | Hex code for brand buttons/highlights (default: #0047FF) |
| `secondary_color` | text | Hex code for accents/backgrounds |
| `subdomain` | text | Unique subdomain (e.g., `mysmile.dentalhub.com`) |
| `seo_title` | text | Custom `<title>` for the booking page |
| `seo_description` | text | Custom `<meta name="description">` |

## REST API Endpoints
1. `PATCH /api/clinics/[id]/branding`
   - **Body**: `{ primaryColor, secondaryColor, subdomain, seoTitle, seoDescription }` (Zod validated)
   - **Auth**: `org:admin` only.
2. `POST /api/clinics/[id]/branding/logo`
   - **Body**: `FormData` containing the image file.
   - **Returns**: `{ logoUrl: string }`
   - **Storage**: Supabase Bucket `branding_assets`.

## Technical Architecture

### 1. Dynamic Theming
- **Mechanism**: Use React's inline `style` prop at the layout root of the booking flow.
- **CSS Variables**:
  ```html
  <div style={{ '--brand-primary': clinic.primaryColor }}>
    {children}
  </div>
  ```
- **Tailwind Integration**: Map `brand` color to `var(--brand-primary)` in `tailwind.config.ts`.

### 2. Presence & Subdomains
- **Next.js Middleware**: Resolve the clinic from the subdomain.
- **Routing**: `[subdomain].dentalhub.com` maps to a dynamic route like `app/(booking)/[tenantSlug]/page.tsx`.

### 3. Storage Utility
- A typed wrapper around `@supabase/supabase-js` to handle file uploads, size limits, and public URL generation.

## Tasks
1. **Schema**: Update `lib/db/schema.ts`.
2. **Storage**: Implement `lib/storage/supabase.ts`.
3. **API**: Implement endpoints in `app/api/clinics/[id]/branding/`.
4. **UI**: Build the "Branding" section in the dashboard with 3 tabs (Identity, Appearance, Presence).
5. **Theming**: Inject CSS variables in `app/(booking)/[tenantSlug]/layout.tsx`.

## Success Criteria
- Owners can update all branding/presence fields via the Dashboard.
- API rejects non-admins.
- Patient booking page reflects the custom colors, logo, and SEO metadata.
