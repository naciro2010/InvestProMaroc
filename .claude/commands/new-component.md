# /new-component - Create New React Component

Scaffold a micro-component following InvestPro patterns.

## Input

The user provides: component name, purpose, and props.

## Steps

1. Create component in the appropriate directory:
   - `components/core/` for reusable design system components
   - `components/[feature]/` for feature-specific components
   - `components/ui/` for generic UI widgets

2. Follow micro-frontend principles:
   - Single responsibility
   - < 300 lines
   - Independent data loading if it fetches data
   - Strong TypeScript typing for all props

3. Use design system tokens:
   - `colors`, `typography`, `spacing` from designSystem.ts
   - `componentStyles` for pre-built styles
   - No hardcoded colors or values

4. Add barrel export in the directory's `index.ts`

## Template
```tsx
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface MyComponentProps {
  // strongly typed props
}

export default function MyComponent({ ...props }: MyComponentProps) {
  return (...)
}
```
