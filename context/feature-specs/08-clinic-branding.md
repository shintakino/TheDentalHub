# 08 - Clinic Branding System

## Goal
Enable Clinic Owners to customize their patient-facing booking pages with bespoke branding. This includes uploading custom logos, selecting primary and secondary brand colors, and managing their clinic's display name, providing a premium, whitelabeled experience for their patients.

## Domain Context & Boundaries
- **Branding Configuration**: Each tenant (`clinic`) can define its own branding settings.
- **Asset Storage**: Clinic logos and other image assets are stored in a public Supabase Storage bucket (`branding_assets`).
- **Dynamic Theming**: The patient-facing booking application must dynamically read the clinic's branding configuration and apply it to the UI (e.g., mapping brand colors to Tailwind CSS variables).
- **Actors**: Only `org:admin` (Clinic Owner) and `super_admin` can modify branding settings.

## Architectural Decisions
1. **Schema Design**: Add branding columns directly to the `clinics` table: `logo_url` (text), `primary_color` (text, hex code), and `secondary_color` (text, hex code).
2. **Strict Typing**: The use of the `any` type is strictly forbidden. File uploads, API payloads, and database queries must use explicit types (e.g., Zod schemas for the branding payload, Drizzle schema types for database returns).
3. **Storage Strategy**: Use the `@supabase/supabase-js` client on the server or via secure presigned URLs on the client to upload images to Supabase Storage. Ensure the bucket has public read access so the booking page can display the logos.
4. **API Design**:
   - `POST /api/clinics/:id/branding/logo`: Handles the multipart form data for the image upload and returns the public URL.
   - `PATCH /api/clinics/:id/branding`: Updates the color hex codes and name.
5. **Dynamic Styling**: Use React's inline `style` prop to inject CSS variables (e.g., `--brand-primary: #123456`) at the layout root of the patient booking flow. Tailwind configuration should map arbitrary colors to these CSS variables using `theme: { extend: { colors: { brand: 'var(--brand-primary)' } } }` for seamless integration.

## Tasks
- [ ] Task 1: Update the database schema (`lib/db/schema.ts`) to add `logo_url`, `primary_color`, and `secondary_color` to the `clinics` table. → Verify: `npm run db:push` succeeds.
- [ ] Task 2: Create a strictly typed Supabase storage utility (`lib/storage/supabase.ts`) to handle uploading image files and generating public URLs. → Verify: Unit tests or manual test script successfully uploads an image to the bucket.
- [ ] Task 3: Implement the `POST /api/clinics/:id/branding/logo` and `PATCH /api/clinics/:id/branding` endpoints with strict RBAC (`org:admin` only) and Zod validation. → Verify: API successfully updates the clinic record and rejects unauthorized requests.
- [ ] Task 4: Build the "Branding Settings" UI for Clinic Owners, including a color picker and an image upload dropzone with local preview. → Verify: Owner can successfully save new branding configurations.
- [ ] Task 5: Implement the dynamic theming logic in the patient-facing layout (`app/(booking)/[tenantId]/layout.tsx`) to inject CSS variables and display the custom logo. → Verify: Booking page correctly reflects the database's configured brand colors and logo.

## Done When
- [ ] Database schema supports branding fields.
- [ ] Supabase Storage securely handles logo uploads.
- [ ] Clinic Owners can update their branding via the Dashboard UI.
- [ ] The patient-facing booking page dynamically adapts its Tailwind styles and logo to match the specific clinic's configuration.
- [ ] `npm run build` succeeds with zero type errors.
