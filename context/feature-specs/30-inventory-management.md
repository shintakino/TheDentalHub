# 30 - Clinical Inventory & Supply Chain Management

## Goal
Enable clinics to track and manage their physical supplies (e.g., anesthetics, composite resins, PPE, surgical kits) across multiple branches. This ensures that clinical operations never stall due to missing supplies and provides owners with insights into supply consumption and costs.

## Domain Context & Boundaries
- **Inventory Items**: Individual products or supplies used in treatments.
- **Stock Levels**: Tracked per branch. A "Central Warehouse" model can be supported by treating one branch as a hub.
- **Consumption**: Items can be "deducted" manually or automatically linked to specific `service` types (e.g., a "Cleaning" service automatically deducts 1 set of PPE).
- **Alerts**: Notifications when stock falls below a configured threshold.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - `inventory_items`:
     - `id`: UUID
     - `tenant_id`: References `clinics.tenant_id`
     - `name`: Text
     - `category`: Text (e.g., 'Consumables', 'Equipment', 'Medication')
     - `unit`: Text (e.g., 'Box', 'Vial', 'Unit')
   - `inventory_stock`:
     - `id`: UUID
     - `item_id`: References `inventory_items.id`
     - `branch_id`: References `branches.id`
     - `quantity`: Decimal (Precision 10, Scale 2)
     - `low_stock_threshold`: Decimal
   - `inventory_logs`:
     - `id`: UUID
     - `item_id`: References `inventory_items.id`
     - `branch_id`: References `branches.id`
     - `change_amount`: Decimal
     - `reason`: Text (e.g., 'Usage', 'Restock', 'Waste', 'Correction')
     - `performed_by`: Clerk User ID
2. **Strict Typing**: All inventory movements must be wrapped in transactions to ensure stock consistency. Use Zod schemas for `InventoryAdjustmentSchema`. No `any` types.

## UI/UX Design (/frontend-developer)
1. **Inventory Dashboard**:
   - A unified list of supplies with a "Status" badge: `In Stock`, `Low Stock` (Amber), `Out of Stock` (Red).
   - High-End Clinical aesthetic: Clean tables with macro-whitespace and subtle category icons.
2. **Branch Stock View**:
   - Ability to toggle stock levels between branches to see where supplies are most needed.
3. **Quick Adjustment Dialog**:
   - A simple, elegant modal to "Restock" or "Deduct" items with a mandatory reason field.

## Implementation Plan (/plan-writing)
- **Task 1**: Add `inventory_items`, `inventory_stock`, and `inventory_logs` to `schema.ts`. → Verify: `npm run db:push` succeeds.
- **Task 2**: Implement CRUD APIs for managing the inventory catalog and branch-specific stock levels.
- **Task 3**: Create the `InventoryManager` component in the Clinic Dashboard.
- **Task 4**: Add a "Low Stock" widget to the Owner Overview page (Feature 21).

## Done When
- [ ] Staff can track stock levels for all clinical supplies per branch.
- [ ] Low stock levels are visually flagged for the owner.
- [ ] Every inventory change is recorded in an audit-ready log.
- [ ] `npm run build` succeeds with zero type errors.
