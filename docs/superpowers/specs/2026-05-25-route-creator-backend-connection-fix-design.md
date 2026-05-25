# Route Creator Backend Connection Fix - Design Spec

**Status:** Approved
**Date:** 2026-05-25

## Problem

The "创建新路线" feature is non-functional because:
1. The Express backend (port 5000) was not started — all API calls fail silently
2. `RouteCreator` and `Home` components swallow fetch errors with `console.error` only, showing empty states with no user feedback

## Solution

Add error state handling to API calls so users see a clear message when the backend is unreachable.

### Files Changed

| File | Change |
|------|--------|
| `src/components/RouteCreator/RouteCreator.tsx` | Add error state, error banner UI, retry logic |
| `src/pages/Home/Home.tsx` | Add search error state and error hint in search dropdown |

### RouteCreator Changes

1. **New state:** `const [error, setError] = useState<string | null>(null);`

2. **In each fetch catch block:** `setError('无法连接服务器');`

3. **Error banner UI** (rendered above the search results area):
   - Red-tinted background banner
   - Text: "无法连接服务器"
   - Retry button that clears error and re-fetches

4. **Error cleared on:** retry, close modal, successful fetch

### Home.tsx Changes

1. **Rename existing state:** `searchResults` stays, add error display inside the search dropdown when search fails

2. **In `handleSearchChange` catch:** Show "无法连接服务器" inline in the dropdown area instead of empty results

### Scope Boundaries

- **Not included:** Startup script changes (start-all.bat already works)
- **Not included:** Mock data fallback
- **Not included:** Backend code changes
