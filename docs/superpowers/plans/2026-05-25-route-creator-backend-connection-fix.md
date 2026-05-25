# Route Creator Backend Connection Fix - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add error feedback UI when backend API calls fail in RouteCreator and Home components.

**Architecture:** Add React error state to 2 existing components. When fetch fails, set error string; render a red banner with message and retry button. No new files, no new dependencies.

**Tech Stack:** React 18 + TypeScript 5

**Note:** This project has no test framework (`npm test` is a no-op), so verification uses manual browser testing and build checks.

---

### Task 1: Add error handling to RouteCreator

**Files:**
- Modify: `src/components/RouteCreator/RouteCreator.tsx`

- [ ] **Step 1: Add error state and retry handler**

Add the error state declaration after existing state declarations (after line 43, `const [showSuccessPage, setShowSuccessPage] = useState(false);`):

```tsx
const [error, setError] = useState<string | null>(null);
```

Add a `handleRetry` function after the `fetchCategories` useCallback (after line 90):

```tsx
const handleRetry = useCallback(() => {
  setError(null);
  fetchCategories();
  fetchPopularAttractions();
  if (searchQuery || selectedCategory !== 'all') {
    fetchAttractions();
  }
}, [fetchCategories, fetchPopularAttractions, fetchAttractions, searchQuery, selectedCategory]);
```

- [ ] **Step 2: Add setError in fetch catch blocks**

In `fetchAttractions` catch block (line 59-60), add `setError`:

```tsx
} catch (error) {
  setError('无法连接服务器');
  console.error('Error fetching attractions:', error);
}
```

In `fetchPopularAttractions` catch block (line 74-75), add `setError`:

```tsx
} catch (error) {
  setError('无法连接服务器');
  console.error('Error fetching popular attractions:', error);
}
```

In `fetchCategories` catch block (line 87-88), add `setError`:

```tsx
} catch (error) {
  setError('无法连接服务器');
  console.error('Error fetching categories:', error);
}
```

- [ ] **Step 3: Clear error on successful fetches**

In `fetchAttractions` try block, after line 57 (`if (data.success) {`), add error clear before setting data:

```tsx
if (data.success) {
  setError(null);
  setAttractions(data.data);
}
```

In `fetchPopularAttractions` try block, after line 71 (`if (data.success) {`):

```tsx
if (data.success) {
  setError(null);
  setPopularAttractions(data.data);
}
```

In `fetchCategories` try block, after line 84 (`if (data.success) {`):

```tsx
if (data.success) {
  setError(null);
  setCategories(data.data);
}
```

- [ ] **Step 4: Clear error on modal close**

In the `onClose` handler (the close button `onClick` at line 255-258), since the modal is controlled by parent via `onClose` prop, add error clear in a wrapper or in the close button's onClick. The simplest approach: clear error when `showSuccessPage` changes or when modal unmounts.

Add a `useEffect` for cleanup, after the existing useEffects (after line 105):

```tsx
useEffect(() => {
  setError(null);
}, [searchQuery, selectedCategory]);
```

This effectively clears the error whenever the user changes search or category — which serves as implicit retry.

- [ ] **Step 5: Add error banner UI**

Insert the error banner after the header section close `</div>` (after line 291, the category buttons closing `</div>`) and before the content area `<div className={`p-6 ${showSuccessPage ? '' : 'flex-1 overflow-y-auto'}`}>` (line 294):

```tsx
{error && (
  <div className="mx-6 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl rounded-xl border border-red-200/50 dark:border-red-700/50 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</span>
    </div>
    <button
      onClick={handleRetry}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
    >
      重试
    </button>
  </div>
)}
```

- [ ] **Step 6: Verify RouteCreator changes**

Run: `npm run type-check`
Expected: PASS (no TypeScript errors)

Run: `npm run build`
Expected: PASS (build succeeds)

Manual test:
1. Start frontend only (`npm run dev`) — do NOT start backend
2. Open the app, click "创建新路线"
3. Expected: Red banner "无法连接服务器" appears with "重试" button
4. Start backend (`cd server && npm run dev`)
5. Click "重试"
6. Expected: Error banner disappears, popular attractions and categories load

- [ ] **Step 7: Commit RouteCreator changes**

```bash
git add src/components/RouteCreator/RouteCreator.tsx
git commit -m "fix: add error feedback when backend unreachable in RouteCreator"
```

---

### Task 2: Add search error handling to Home

**Files:**
- Modify: `src/pages/Home/Home.tsx`

- [ ] **Step 1: Add search error state**

After line 69 (`const [isSearching, setIsSearching] = useState(false);`), add:

```tsx
const [searchError, setSearchError] = useState<string | null>(null);
```

- [ ] **Step 2: Set error on search failure**

In `handleSearchChange` catch block (line 203), add `setSearchError`:

```tsx
} catch (error) {
  setSearchError('无法连接服务器');
  console.error('搜索失败:', error);
  setSearchResults([]);
}
```

- [ ] **Step 3: Clear error on new search**

In `handleSearchChange`, at the beginning of the function (after line 189, the dispatch call), add:

```tsx
setSearchError(null);
```

- [ ] **Step 4: Add error display in search dropdown**

Replace the empty search results area. The current code at lines 322-361 renders `searchResults` dropdown or `isSearching` spinner. Add an error display between the search results and the loading spinner sections.

After line 352 (`)}`) — which closes the search results div — and before line 354 (`{isSearching && (`) — the loading spinner, insert:

```tsx
{searchError && searchQuery.trim().length > 0 && (
  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-4 z-50">
    <p className="text-sm text-red-600 dark:text-red-400 text-center">{searchError}</p>
  </div>
)}
```

- [ ] **Step 5: Verify Home changes**

Run: `npm run type-check`
Expected: PASS

Run: `npm run build`
Expected: PASS

Manual test:
1. Start frontend only — do NOT start backend
2. Type a search query in the main search bar
3. Expected: After debounce, dropdown shows "无法连接服务器" in red
4. Start backend, clear and re-type search
5. Expected: Normal search results appear, no error

- [ ] **Step 6: Commit Home changes**

```bash
git add src/pages/Home/Home.tsx
git commit -m "fix: add search error feedback in Home when backend unreachable"
```
