Read `AGENTS.md` and `context/ui-context.md` before starting.

We're adding the design system and UI primitive components.

Install and configure `shadcn/ui`.

Add these shadcn components:

- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea
- Calendar (For slot selection and schedule viewing)
- Popover (For date pickers and floating menus)
- Select (For branch, service, and staff selection)
- Badge (For appointment status indicators)
- Table (For staff management and appointment lists)
- Form & Label (For validated data entry)
- Checkbox & Switch (For settings and toggles)
- Avatar (For user and staff profiles)
- Dropdown Menu (For contextual actions)
- Skeleton (For loading states)
- Sonner (For toast notifications)
- Sheet (For mobile navigation and side panels)
- Tooltip (For informative hints)

Do not modify the generated `components/ui/*` files after installation.

Also Install `lucide-react`.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

Ensure all components match the existing dark theme in `globals.css`.

### Typography

- Primary Font: Geist Sans (default).
- Schedules/Data: Use tabular numerals (`font-variant-numeric: tabular-nums`) for alignment in calendars and appointment lists.

### Check when done

- All components import without errors
- `cn()` works properly
- No default light styling appears
