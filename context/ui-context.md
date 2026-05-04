# UI Context: High-End Clinical (Premium Light Mode)

## 1. Design Direction Summary
- **Aesthetic Name:** **High-End Clinical (Premium Light Mode)**
- **DFII Score:** 15 (Excellent)
- **Differentiation Anchor:** *Instead of generic boxed data tables and heavy dark-mode tech aesthetics, this uses a pristine "Alabaster and Pure White" foundation. Floating borderless panes with soft, diffuse, high-end photographic drop shadows (`rgba(0,0,0,0.08)`) over a subtle organic noise texture. It evokes the cleanliness, precision, and luxury of a high-end cosmetic dental clinic or a premium skincare brand (like Aesop).*
- **Key Inspiration:** High-end boutique dental clinics and luxury skincare brands.

## 2. Core Principles
1. **Pristine & Authoritative:** The interface must inspire absolute trust. It should look perfectly clean and sterile, never like a generic SaaS dashboard.
2. **Macro Whitespace:** Break the grid. Use enormous padding and negative space to frame content, rather than packing it tightly.
3. **Typography as Structure:** Use the modern serif (`Playfair Display`) strictly for brand-level headings or critical numbers. Use the highly geometric sans-serif (`Outfit`) for UI controls and dense data.

## 3. Design System Snapshot

### Typography
- **Display / Headings:** `Playfair Display` (injects an editorial, trustworthy, luxury feel).
- **Body / Data:** `Outfit` (geometric, clean, extremely legible at small sizes).
- **Schedules / Numerals:** Enable tabular numerals (`font-variant-numeric: tabular-nums`) on all numeric data tables and calendars.

### Color Palette & Theme
We strictly avoid standard "Tailwind Blue" and evenly balanced generic palettes.
The theme is anchored in a pristine "Alabaster" foundation, using "Pure White" surfaces and a striking "Surgical Sapphire" accent. Dark mode is deemphasized to enforce the clinical feel.

| Role             | Value              | Purpose                                   |
| ---------------- | ------------------ | ----------------------------------------- |
| Background       | `#FAFAFA` (Alabaster)| Main page background (softened white)     |
| Surface (Cards)  | `#FFFFFF` (Pure)   | Floating borderless panes                 |
| Primary Brand    | `#0047FF` (Sapphire)| Main action color, unapologetic and bold  |
| Text Primary     | `#0A1120` (Obsidian)| High readability against light backgrounds|
| Text Secondary   | `#64748B` (Slate)  | Subtle labels                             |
| Success (States) | `#00A86B` (Mint)   | Confirmed, Completed status               |
| Danger (States)  | `#E11D48` (Rose)   | Cancelled, No-show status                 |
| Warning (States) | `#D97706` (Amber)  | Rescheduled, Checked-in status            |

### Spatial Composition & Texture
- **Texture:** The main background features a subtle SVG noise overlay (`bg-noise`) to reduce digital harshness and create an organic, tactile feel.
- **Shadows vs Borders:** Surfaces (Cards, Dialogs) should have **no borders** (`border-none` or `border-transparent`). Instead, they rely on soft, diffused, wide drop shadows (`rgba(0,0,0,0.08)`) to separate them from the background.
- **Micro-motion:** Minimalist. A subtle scale-up on hover for primary actions, but zero "bounce" or playful animations.

## 4. Component Patterns
- **Booking Calendar:** Large, floating slots with status indicated by elegant, minimalist dots (Mint/Rose/Amber) rather than full-color background blocks.
- **Appointment Cards:** Borderless, diffuse shadow, high contrast serif typography for the patient's name.
- **Dashboard Widgets:** Pure white panes over Alabaster backgrounds with large serif numbers for statistics, avoiding generic chart borders.

> "This avoids generic UI by relying on pristine whitespace, extremely diffuse photographic shadows, and typography-driven hierarchy instead of heavy dark modes and default bordered cards."
