Wire Clerk into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Follow the **High-End Clinical (Refined Minimalist)** design system (`context/ui-context.md`).

Override Clerk appearance variables using the app’s existing CSS variables. Do not hardcode colors.

Sign-in and sign-up pages:
- **Large screens**: A pristine two-panel layout.
  - Left panel: Uses macro whitespace. Features a prominent `Playfair Display` heading for the clinic/platform name and a short, elegant tagline.
  - Right panel: Centered Clerk form.
- **Small screens**: Form only.
- **Component Styling**:
  - The Clerk form must be a floating, borderless pane with a deep, soft drop shadow, sitting over the `bg-noise` textured background.
  - Override Clerk's default fonts: Use `Outfit` for all labels, inputs, and standard text. Use `Playfair Display` for the form's primary heading if customizable.
  - Colors: Use "Alabaster" or "Obsidian" backgrounds, with "Surgical Sapphire" (`#0047FF`) for the primary action buttons.
- **Strictly Avoid**: Gradients, oversized hero images, generic default borders (`border-none`), and SaaS tropes.

Keep the layout minimal, authoritative, and visually memorable.

## Implementation

Wrap the root layout with `ClerkProvider`, applying theme adjustments via the `appearance` prop to enforce the High-End Clinical design system.

Create sign-in (`/sign-in`) and sign-up (`/sign-up`) pages using Clerk components.

Use `proxy.ts` at the project root for routing (as referenced in the architectural template), instead of `middleware.ts`.

Define public routes explicitly (e.g., `/sign-in`, `/sign-up`, and potentially the landing page). Protect all other routes (like `/dashboard`) by default.

Update the root route `/`:
- Authenticated users redirect to `/dashboard`.
- Unauthenticated users redirect to `/sign-in`.

Add Clerk’s built-in `UserButton` to the `Sidebar` or `Navbar` for profile settings and logout.

Keep Clerk’s default user menu and profile flows intact. Do not rebuild or heavily customize Clerk internals, just style them via `appearance`.

Use standard Clerk environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, etc.).

## Dependencies

- `@clerk/nextjs`
- `@clerk/themes` (for dark theme base)

## Check When Done
- `proxy.ts` is used for routing instead of `middleware.ts` at the root of the project.
- Route protection is active (unauthenticated users cannot reach `/dashboard`).
- Auth pages accurately reflect the High-End Clinical aesthetic (Surgical Sapphire, Playfair Display/Outfit, borderless panes with deep shadows, noise texture).
- `ClerkProvider` wraps the root layout without breaking existing hydration or styling.
- `npm run build` passes with no TypeScript or linting errors.
