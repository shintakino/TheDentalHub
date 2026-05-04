# Hydration Error: Nested Buttons

## Issues

### 1. In HTML, `<button>` cannot be a descendant of `<button>`

**Error Description:**
A hydration error occurs in the application due to nested buttons. The error stack trace specifically points to the `SheetTrigger` in `Sidebar.tsx` and the `DropdownMenuTrigger` in `Navbar.tsx` wrapping the `Button` component:
`In HTML, <button> cannot be a descendant of <button>.`

**Root Cause:**
Shadcn UI has been configured to use Base UI under the hood for some primitives instead of Radix UI. Base UI's `Trigger` components (like `SheetPrimitive.Trigger` and `MenuPrimitive.Trigger`) use a `render` prop to specify the underlying DOM element, diverging from the typical Radix UI `asChild` pattern. 
When passing `asChild={true}` with a nested `<Button>`, the trigger ignores the `asChild` prop, renders its default `<button>` element, and then renders the nested `<Button>` (which is also a `<button>`) inside it. This results in `<button><button>...</button></button>`, which is invalid HTML and causes a hydration mismatch.

**Fix Applied:**
Replaced the `asChild` pattern with the `render` prop pattern in both layout components. The Base UI `render` prop correctly merges event handlers and replaces the default element.

```tsx
// Before (Causing Hydration Error)
<SheetTrigger asChild>
  <Button variant="ghost" />
</SheetTrigger>

// After (Fixed)
<SheetTrigger 
  render={<Button variant="ghost" />}
>
  {/* Children inside trigger */}
</SheetTrigger>
```

This fix has been successfully applied to:
- `components/layout/Sidebar.tsx` (`SheetTrigger`)
- `components/layout/Navbar.tsx` (`DropdownMenuTrigger`)
