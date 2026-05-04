# UI Context: High-End Clinical

## 1. Design Direction Summary
- **Aesthetic Name:** **High-End Clinical (Refined Minimalist)**
- **DFII Score:** 15 (Excellent)
- **Differentiation Anchor:** *Instead of generic boxed data tables and standard calendars, schedules and patient profiles are floating, deeply-shadowed, borderless panes over a subtle, noise-textured background. Headings use an elegant modern serif to convey established trust, while data remains highly legible.*
- **Key Inspiration:** High-end boutique dental clinics and luxury skincare brands (e.g., Aesop).

## 2. Core Principles
1. **Pristine & Authoritative:** The interface must inspire absolute trust. It should not look like a generic SaaS dashboard.
2. **Macro Whitespace:** Break the grid. Use enormous padding and negative space to frame content, rather than packing it tightly.
3. **Typography as Structure:** Use the modern serif (`Playfair Display`) strictly for brand-level headings or critical numbers. Use the highly geometric sans-serif (`Outfit`) for UI controls and dense data.

## 3. Design System Snapshot

### Typography
- **Display / Headings:** `Playfair Display` (injects an editorial, trustworthy, luxury feel).
- **Body / Data:** `Outfit` (geometric, clean, extremely legible at small sizes).
- **Schedules / Numerals:** Enable tabular numerals (`font-variant-numeric: tabular-nums`) on all numeric data tables and calendars.

### Color Palette & Theme
We strictly avoid standard "Tailwind Blue" and evenly balanced generic palettes.
The theme is anchored in high contrast between "Alabaster/Obsidian" and a striking "Surgical Sapphire" accent.

| Role             | Light Mode Value   | Dark Mode Value   | Purpose                                   |
| ---------------- | ------------------ | ----------------- | ----------------------------------------- |
| Background       | `#FAFAFA` (Alabaster)| `#050B14` (Obsidian)| Main page background (softened white/black) |
| Surface (Cards)  | `#FFFFFF` (Pure)   | `#0A1120` (Navy)  | Floating borderless panes                 |
| Primary Brand    | `#0047FF` (Sapphire)| `#0047FF` (Sapphire)| Main action color, unapologetic and bold|
| Text Primary     | `#0A1120`          | `#FAFAFA`         | High readability                          |
| Text Secondary   | `#64748B`          | `#94A3B8`         | Subtle labels                             |
| Success (States) | `#00A86B` (Mint)   | `#00A86B`         | Confirmed, Completed status               |
| Danger (States)  | `#E11D48` (Rose)   | `#E11D48`         | Cancelled, No-show status                 |
| Warning (States) | `#D97706` (Amber)  | `#D97706`         | Rescheduled, Checked-in status            |

### Spatial Composition & Texture
- **Texture:** The main background features a subtle SVG noise overlay (`bg-noise`) to reduce digital harshness and create an organic, tactile feel.
- **Shadows vs Borders:** Surfaces (Cards, Dialogs) should have **no borders** (`border-none` or `border-transparent`). Instead, they rely on soft, diffused drop shadows to separate them from the background.
- **Micro-motion:** Minimalist. A subtle scale-up on hover for primary actions, but zero "bounce" or playful animations.

## 4. Component Patterns
- **Booking Calendar:** Large, floating slots with status indicated by elegant, minimalist dots (Mint/Rose/Amber) rather than full-color background blocks.
- **Appointment Cards:** Borderless, deep shadow, high contrast serif typography for the patient's name.
- **Dashboard Widgets:** Pure white panes with large serif numbers for statistics, avoiding generic chart borders.

> "This avoids generic UI by relying on deep shadows and typography-driven hierarchy instead of default bordered cards and system fonts."
