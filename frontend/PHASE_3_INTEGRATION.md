# Phase 3: Context & Layout Integration - IN PROGRESS

**Status:** 🔄 IN PROGRESS - Contexts created, integrating PageLayout into pages

## What Was Completed

### ✅ ThemeContext (Complete)
**File:** `frontend/src/contexts/ThemeContext.tsx` (160 lines)

Provides theme switching (light/dark mode) with MUI theme management:

**Features:**
- Light/Dark mode toggle
- Persistent theme to localStorage
- System preference detection
- Full MUI theme customization
- Responsive component styling
- CssBaseline for consistent styles

**Usage:**
```typescript
import { useTheme } from '@/contexts'

function MyComponent() {
  const { mode, toggleTheme, isDark } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? 'light' : 'dark'} mode
    </button>
  )
}
```

**Theme Colors:**
- Primary: #2563eb (blue-600)
- Secondary: #0891b2 (cyan-600)
- Success: #16a34a (green-600)
- Warning: #d97706 (amber-600)
- Error: #dc2626 (red-600)
- Info: #0284c7 (sky-600)

### ✅ LayoutContext (Complete)
**File:** `frontend/src/contexts/LayoutContext.tsx` (120 lines)

Manages responsive layout state with sidebar management:

**Features:**
- Sidebar open/close state
- Responsive breakpoint detection (mobile, tablet, desktop)
- Auto-collapse sidebar on mobile
- Persistent state to localStorage
- Real-time resize listener

**Usage:**
```typescript
import { useLayout } from '@/contexts'

function Sidebar() {
  const { sidebarOpen, toggleSidebar, isMobile, isTablet } = useLayout()

  return (
    <aside style={{ width: sidebarOpen ? '250px' : '80px' }}>
      <button onClick={toggleSidebar}>Toggle</button>
      {!isMobile && <Navigation />}
    </aside>
  )
}
```

**Breakpoints:**
- **Mobile:** < 640px (xs)
- **Tablet:** 640px - 1024px (sm-md)
- **Desktop:** ≥ 1024px (lg+)

### ✅ App.tsx Updated
Integrated both contexts into the provider hierarchy:

```typescript
<ThemeContextProvider>
  <LayoutContextProvider>
    <AuthProvider>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </AuthProvider>
  </LayoutContextProvider>
</ThemeContextProvider>
```

**Provider Order (Bottom to Top):**
1. ThemeContextProvider - Must be outermost (applies MUI theme)
2. LayoutContextProvider - Responsive state
3. AuthProvider - Authentication & user state
4. ToastProvider - Toast notifications
5. Routes - Application routes

## Current Work: PageLayout Integration

Integrating `PageLayout` component (from Phase 1) into major pages.

### Pages to Update (High Priority)

1. **ConventionsPageMUI** (/pages/conventions/)
   - Status: QUEUED
   - Current: Manual header + stats
   - Action: Replace header section with PageLayout

2. **MarchesPage** (/pages/marches/)
   - Status: QUEUED
   - Current: Manual header
   - Action: Replace header with PageLayout

3. **ProjetsPage** (/pages/projets/)
   - Status: QUEUED
   - Current: Manual header
   - Action: Replace header with PageLayout

4. **DashboardSimple** (/pages/)
   - Status: QUEUED
   - Current: Simple layout
   - Action: Integrate with PageLayout

5. **DecomptesPageComplete** (/pages/decomptes/)
   - Status: QUEUED
   - Current: Manual header
   - Action: Replace header with PageLayout

### Pages to Update (Medium Priority)

6. **OrdresPaiementPageComplete** (/pages/paiements/)
7. **PaiementsPageComplete** (/pages/paiements/)
8. **ProfilePage** (/pages/)
9. **BudgetsPage** (/pages/budgets/)
10. **PlanAnalytiquePage** (/pages/parametrage/)

---

## Current Architecture

### Provider Composition
```
App
├── ThemeContextProvider (light/dark mode, MUI theme)
│   ├── ThemeMode: 'light' | 'dark'
│   ├── useTheme(): { mode, toggleTheme, isDark }
│   └── MUI theme with all colors and styling
│
├── LayoutContextProvider (responsive sidebar)
│   ├── sidebarOpen: boolean
│   ├── isMobile: boolean (< 640px)
│   ├── isTablet: boolean (640-1024px)
│   └── useLayout(): { sidebarOpen, toggleSidebar, isMobile, isTablet }
│
├── AuthProvider (authentication & user)
│   └── useAuth(): { user, isAuthenticated, login, logout, ... }
│
├── ToastProvider (notifications)
│   └── useToast(): { showToast, showSuccess, showError, ... }
│
└── Routes
    ├── /dashboard
    ├── /conventions
    ├── /marches
    ├── /projets
    └── ... (other routes)
```

### PageLayout Component Integration

**Pattern for page integration:**

```typescript
import { PageLayout } from '@/components/layout/PageLayout'
import { useLayout } from '@/contexts'

function MyPage() {
  const { isMobile } = useLayout()

  return (
    <PageLayout
      title="Page Title"
      subtitle="Page description"
      actions={<Button onClick={handleCreate}>New Item</Button>}
      breadcrumbs={[
        { label: 'Home', href: '/dashboard' },
        { label: 'Current Page' }
      ]}
    >
      {/* Page content */}
    </PageLayout>
  )
}
```

---

## Planned Improvements (Phase 3+)

### Responsive AppLayout
- Update AppLayout.tsx to use LayoutContext
- Sidebar collapse/expand on desktop
- Mobile-friendly navigation drawer
- Hamburger menu on mobile

### Theme Toggle Button
- Add theme toggle to navbar
- Show current theme mode
- Smooth transition between themes

### Persistent Layout
- Save sidebar state per user (optional)
- Remember user's theme preference
- Responsive breakpoint handling

### Full Page Integration
- Update all 23 pages to use PageLayout
- Consistent header styling across app
- Breadcrumb navigation on all pages
- Action buttons in page headers

---

## Build Status

✅ **TypeScript Compilation:** PASS
✅ **Vite Production Build:** PASS (2.85MB)
✅ **No Type Errors:** Clean
✅ **No Runtime Errors:** Verified

---

## Next Steps

1. ✅ Create ThemeContext (COMPLETE)
2. ✅ Create LayoutContext (COMPLETE)
3. ✅ Update App.tsx with providers (COMPLETE)
4. 🔄 Integrate PageLayout into 5-10 major pages (IN PROGRESS)
   - [ ] ConventionsPageMUI
   - [ ] MarchesPage
   - [ ] ProjetsPage
   - [ ] DashboardSimple
   - [ ] DecomptesPageComplete
5. [ ] Update AppLayout to use LayoutContext
6. [ ] Add theme toggle to navbar
7. [ ] Test responsive behavior
8. [ ] Deploy Phase 3

---

## File Structure

```
frontend/src/
├── contexts/
│   ├── ThemeContext.tsx ............ Light/dark mode + MUI theme
│   ├── LayoutContext.tsx ........... Responsive sidebar state
│   ├── AuthContext.tsx ............ (existing) Authentication
│   ├── ToastContext.tsx ........... (existing) Notifications
│   └── index.ts .................... Exports all contexts
│
├── components/
│   ├── layout/
│   │   ├── PageLayout.tsx ......... (Phase 1) Page header wrapper
│   │   ├── SimplePageLayout.tsx ... (variant)
│   │   └── DetailPageLayout.tsx ... (variant)
│   │
│   └── ... (other components)
│
└── pages/
    ├── conventions/ConventionsPageMUI.tsx (TO UPDATE)
    ├── marches/MarchesPage.tsx (TO UPDATE)
    ├── projets/ProjetsPage.tsx (TO UPDATE)
    ├── decomptes/DecomptesPageComplete.tsx (TO UPDATE)
    └── DashboardSimple.tsx (TO UPDATE)
```

---

## Type Safety

All contexts are fully typed:

```typescript
// ThemeContext types
export type ThemeMode = 'light' | 'dark'

interface IThemeContext {
  mode: ThemeMode
  toggleTheme: () => void
  isDark: boolean
}

// LayoutContext types
interface ILayoutContext {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
  isTablet: boolean
}
```

---

## Lessons Learned

1. **Provider Order Matters** - ThemeContextProvider must wrap everything else because it provides MUI theme
2. **Hydration Issues** - Check `isHydrated` state to prevent localStorage mismatches between client/server
3. **Responsive Design** - Use context-based breakpoints instead of CSS media queries for shared state
4. **localStorage Persistence** - Save state on change, restore on mount for better UX

---

**Completion Target:** January 16-17, 2026
**Estimated Time for Full Phase 3:** 3-4 hours
**Priority:** HIGH - Requires before production deployment
