# /design-system - Add/Update Design System Tokens

Modify the centralized design system in `frontend/src/lib/designSystem.ts`.

## Input

The user provides: what to add/change (colors, component styles, status config, etc.)

## Steps

1. Read `frontend/src/lib/designSystem.ts`
2. Add/modify the requested tokens in the correct section:
   - `colors` - Color palette (primary, success, danger, warning, info, purple, neutral)
   - `typography` - Font sizes, weights, line heights
   - `spacing` - Spacing scale and MUI spacing
   - `shadows` - Box shadow definitions
   - `borders` - Border radius and styles
   - `componentStyles` - Pre-built component styles:
     - `.card`, `.cardElevated`, `.cardInteractive`
     - `.buttonPrimary`, `.buttonSecondary`, `.buttonDanger`, `.buttonGhost`
     - `.table.*` (container, header, row, cell)
     - `.statCard`
     - `.listPage.*` (container, header, toolbar, table styles, filter pills)
   - `getStatusConfig()` - Status badge colors and labels

3. Verify no hardcoded colors elsewhere: search for hex codes in components
4. Update any components using old values

## Rules
- All colors must be semantic (primary, success, danger, etc.)
- No gradients in content areas
- Follow Atlassian/Confluence flat design
- WCAG AA contrast minimum
