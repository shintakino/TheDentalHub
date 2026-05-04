# Navigation Layout (Sidebar & Navbar)

## 1. Design Direction Summary
- **Aesthetic Name:** High-End Clinical (Refined Minimalist)
- **DFII Score:** 13 (Impact 4 + Fit 5 + Feasibility 5 + Performance 4 - Consistency Risk 5)
- **Differentiation Anchor:** *Instead of a standard connected sidebar and top navbar, the navigation elements are floating, independent panes over the Alabaster noise-textured background. The active state is indicated by elegant typography weight changes and subtle Surgical Sapphire dots, avoiding heavy background color fills.*
- **Key Inspiration:** Luxury clinic wayfinding and editorial magazine indices.

## 2. Design System Snapshot
- **Fonts:** `Outfit` for all navigation links (clean, highly legible). `Playfair Display` for the clinic brand name in the Navbar.
- **Colors:** 
  - Background: Transparent with SVG noise (global).
  - Surfaces (Sidebar/Navbar): Pure White (`#FFFFFF`) with deep diffused shadows.
  - Active Link/Brand: Surgical Sapphire (`#0047FF`).
  - Inactive Links: Text Secondary (`#64748B`).
- **Spacing/Rhythm:** Macro whitespace. Links are generously spaced. The sidebar has massive padding.
- **Motion Philosophy:** CSS-first. A subtle color transition and a tiny X-axis shift (`translateX(4px)`) on hover. No bounces.

## 3. Goal
Implement a production-ready, highly crafted Sidebar and Navbar component that establishes the High-End Clinical aesthetic and provides navigation for the core user roles (Clinic Owner/Staff).

## 4. Component Requirements

### Sidebar Component
- **Visuals:** Floating vertical pane on the left, borderless with a soft diffused shadow.
- **Content:** Navigation links (e.g., Dashboard, Schedule, Patients, Analytics, Settings).
- **Interactions:** Hovering over links shifts them slightly right and darkens the text. The active link gets a Surgical Sapphire dot indicator to its left.
- **Responsiveness:** Collapses into a hamburger menu (mobile) or thin icon-only sidebar (tablet).

### Navbar Component
- **Visuals:** Floating horizontal pane at the top, separate from the sidebar (not touching it), borderless with a soft shadow.
- **Content:** 
  - Left: Clinic Brand Name (in `Playfair Display`).
  - Right: User Profile Menu (Avatar/Initials in an Outfit font circle) and a Notification bell.
- **Interactions:** Subtle scale-up on profile click.

## 5. Tasks
- [ ] Task 1: Create `Sidebar.tsx` component with pure white background, shadow, and semantic `<nav>` structure. → Verify: Component renders visually isolated from page edges.
- [ ] Task 2: Implement Sidebar links using `Outfit` font, macro-whitespace, and active state (Surgical Sapphire dot). → Verify: Hovering a link triggers a 4px shift; active route shows dot.
- [ ] Task 3: Create `Navbar.tsx` component with clinic branding (`Playfair Display`) and User Profile placeholder. → Verify: Top bar renders floating, brand uses serif font.
- [ ] Task 4: Integrate `Sidebar` and `Navbar` into a new `Layout` component (`app/(dashboard)/layout.tsx`). → Verify: Both components position correctly over the `bg-noise` background without overlapping.
- [ ] Task 5: Add responsive behavior (mobile hamburger toggle for Sidebar). → Verify: On screens < 768px, Sidebar hides and hamburger icon appears in Navbar.

## 6. Done When
- [ ] The Sidebar and Navbar render as floating panes without borders.
- [ ] The High-End Clinical aesthetic (Playfair/Outfit, Pure White, Shadows) is strictly applied.
- [ ] Navigation is functional and visually indicates the active route.
- [ ] The layout is fully responsive across desktop and mobile.
- [ ] New components compile without TypeScript errors
- [ ] No lint errors

> "This avoids generic UI by doing independent, floating, borderless panes and typography-driven active states instead of full-height connected sidebars and heavy active background colors."
