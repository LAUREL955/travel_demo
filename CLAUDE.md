# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start Vite dev server (port 5173, auto-opens browser)
npm run build            # TypeScript check + Vite production build
npm run preview          # Preview production build (port 4173)
npm run lint             # ESLint (ts,tsx only, zero-warnings policy)
npm run lint:fix         # ESLint auto-fix
npm run type-check       # tsc --noEmit (useful without a full build)
npm run format           # Prettier on src/**/*.{ts,tsx,css}
npm run clean            # Remove dist and Vite cache
node diagnose.js         # Project diagnostic tool (checks env, config, file structure)
```

**Full-stack development** (frontend + Express backend on port 5000):
```bash
bash start-all.sh        # Starts both backend (port 5000) and frontend (port 5173)
```

**Backend only:**
```bash
cd server && npm run dev # ts-node-dev with hot reload on port 5000
```

## Architecture

This is a **travel route planner** (旅行路线规划小程序) — a React SPA that plans optimal multi-stop travel routes using nearest-neighbor + 2-opt algorithms, with a natural-language trip planning flow and user preference-based itinerary generation.

### Frontend stack

- **React 18 + TypeScript 5** (strict mode) with **Vite 5**
- **Redux Toolkit** (single reducer `state.route`, see `src/store/slices/routeSlice.ts`)
- **Tailwind CSS 3.4** with `darkMode: 'class'` (toggle via Redux `theme` state)
- **lucide-react** for icons
- **Supabase JS client** (`@supabase/supabase-js`) for auth

### Path aliases (defined in both `vite.config.ts` and `tsconfig.json`)

| Alias | Path |
|-------|------|
| `@/` | `src/` |
| `@components/` | `src/components/` |
| `@pages/` | `src/pages/` |
| `@store/` | `src/store/` |
| `@utils/` | `src/utils/` |
| `@services/` | `src/services/` |
| `@types/` | `src/types/` |

### Backend (Express, port 5000)

A thin REST API in `server/index.ts` serving in-memory attraction data:
- `GET /api/attractions` — search by query, category, lat/lng/radius
- `GET /api/attractions/popular` — top 10 by rating
- `GET /api/attractions/:id` — single attraction
- `GET /api/categories` — static category list

Distance filtering uses the **Haversine formula** (copied in both server and client).

### Redux state shape

All application state lives in `state.route` (a single `routeSlice`). Key state branches:

- **Route data:** `destinations`, `currentRoute`, `routeHistory` (last 10), `userLocation`
- **UI state:** `theme`, `searchQuery`, `showSettings`, `showNaturalLanguageInput`, `showPreferenceSettings`, `showPersonalizedItinerary`, `showRouteHistory`, `showAuth`
- **User profile:** `userPreferences` (attractionTypes, transportation, cuisine, shopping, physicalLevel, budget), `historyBehavior` (viewed/selected/completed/searchHistory)
- **Auth:** `isAuthenticated`, `user`, `showAuth`
- **Customization:** `stickers`, `selectedColor`, `parsedInputData`

### Core route planning algorithm

Located in `src/utils/algorithms/`:
1. **`nearestNeighbor.ts`** — Greedy nearest-neighbor starting from user's location using Haversine distance
2. **`twoOpt.ts`** — 2-opt iterative improvement by reversing route segments
3. **`routePlanner.ts`** — Orchestrates both: `nearestNeighborAlgorithm` → `twoOptAlgorithm`

### Key component flows

**Route creation:** `RouteCreator` (modal) fetches attractions from backend → user selects with optional time-slot (上午/下午) and sticker assignments → `planOptimalRoute()` runs → result dispatched to Redux as `currentRoute` + added to `routeHistory`.

**Smart trip planning (3-step wizard):** `NaturalLanguageInput` (regex-based NL parsing of destination/duration/budget/preferences) → `PreferenceSettings` (user confirms/edits preferences) → `PersonalizedItinerary` (generates a daily itinerary with attraction selection, then displays scheduled days).

**Auth:** `AuthPage` modal shown when `showAuth && !isAuthenticated`. Supabase client initialized in `src/lib/supabase.ts`.

### Utility modules

- `performanceMonitor.ts` — `performance.mark`/`measure` wrappers
- `networkMonitor.ts` — `navigator.onLine` + NetworkInformation API subscription
- `cacheManager.ts` — In-memory cache with TTL expiration
- `eventOptimizer.ts` — Debounce/throttle helpers
- `compatibility.ts` — Browser feature detection + polyfill application
- `VirtualList.tsx` — Virtualized list rendering component
- `ErrorBoundary.tsx` — Class-based React error boundary (catches render errors)

### Important notes

- **Supabase credentials are hardcoded** in `src/lib/supabase.ts` — the publishable key and project URL are in plain text. This is the anon key, but be aware when modifying auth logic.
- The `Destination` type in `src/types/index.ts` does not have a `timeSlot` property, but `Home.tsx` and `RouteCreator.tsx` access `dest.timeSlot` on destination objects at runtime.
- The `test` script in `package.json` is a no-op (`echo "暂无测试配置"`). There is no test framework configured.
- Vite build config drops all `console.log/info/debug` in production via terser `pure_funcs`.
- `destinations` in Redux and `destinations` in the route-planning output are the same array but may carry extra runtime properties (like `timeSlot`) not declared in the type.
