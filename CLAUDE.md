# Murdle Chart — Workplan

## Goal
Single-file HTML5 logic-grid (Murdle-style) deduction chart. Offline, no build step, no deps. Open `index.html` in a browser and solve.

## Constraints
- One file: `index.html` (inline CSS + JS). No CDN, no network.
- Works offline, mobile + desktop.
- State persists in `localStorage`.

## Core model
- N categories (default 3: Suspects / Weapons / Locations), each with M items (default 4).
- Grid = staircase of pairwise blocks: for categories `c0..c(N-1)`, block `(i,j)` exists for `i<j`, laid out Murdle-style (row-cats = c1..c(N-1) reversed, col-cats = c0..c(N-2)).
- Cell state cycles on click: `empty → ✗ → ✓ → empty`. Right-click / long-press = reverse cycle.
- Cell = `{catA, itemA, catB, itemB}` keyed pair; state stored in a Map, symmetric.

## Features
### v1 (must)
1. Editable category names + item names (click label to rename) **+ bulk "Names" editor**:
   modal with one text input (category name) + one textarea (items, one per line) per category.
   Paste a whole puzzle in one go; blank lines ignored, whitespace collapsed. Item count follows
   the longest list, clamped 3–6; when it changes, `resize()` runs first (out-of-range marks
   dropped, undo cleared) and the `nItems` select is re-synced. Missing lines keep the old item.
   Esc / backdrop click / Cancel closes without applying.
2. Configurable N categories × M items (2–5 cats, 3–6 items).
3. Click-cycle marking with clear ✓/✗ glyphs.
4. Auto-deduce (optional toggle): when a ✓ is set, fill the rest of that row/col in the block with ✗.
5. Reset / Clear grid.
6. Save/load to localStorage; autosave.
7. Responsive layout; rotated column headers.

### v2 (nice)
8. Undo/redo stack.
9. Notes panel for clue text.
10. Contradiction highlight (row/col with two ✓, or all ✗).
11. Solution summary table (derived from ✓s).
12. Print stylesheet.
13. Export/import puzzle as JSON.
14. Dark mode.

## Layout sketch (3×4)
```
              WEAPONS        LOCATIONS
           w1 w2 w3 w4     l1 l2 l3 l4
SUSPECTS s1 [] [] [] []    [] [] [] []
         s2 ...
LOCATIONS l1 [] [] [] []
          l2 ...
```

## iOS home-screen (Add to Home Screen)
- `index.html` is self-contained (icon inlined as base64) — but **iOS only offers "Add to Home Screen" for `http(s)` pages, not `file://`**. The folder must be served from a URL.
- Files: `index.html` (app), `sw.js` (offline cache), `icon-512.png` (manifest icon).
- Meta: `apple-mobile-web-app-capable`, `black-translucent` status bar, title "Murdle", inline `apple-touch-icon`, data-URI web manifest (`display:standalone`).
- Layout: `viewport-fit=cover` + `env(safe-area-inset-*)` padding, `-webkit-touch-callout:none` (long-press = reverse cycle, not iOS text callout), stacked sidebar under 760px, −/+ cell-size buttons (persisted).
- Zoom is locked (use −/+ instead): viewport `maximum-scale=1,user-scalable=no` (honored in
  standalone, ignored in Safari tabs), `touch-action:manipulation` on `html,body` (no double-tap
  zoom), `gesturestart/change/end` → `preventDefault()` (no pinch zoom), and 16px modal inputs
  (smaller fonts make iOS zoom on focus).
- Offline: service worker caches app shell; registers only over http(s).
- Update flow: `sw.js` does **not** `skipWaiting()` on install — a new build installs into a fresh
  cache and waits. The page detects `reg.waiting` / `updatefound` and shows a bottom toast
  ("New version available" + **Update**); the button posts `{type:"SKIP_WAITING"}`, and
  `controllerchange` then reloads (guarded by an `updating` flag so first install never reloads).
  `reg.update()` runs on load, on tab re-focus, and every 30 min, so a GitHub Pages deploy is
  picked up without a manual hard-refresh. Navigations are network-first (cache fallback);
  other assets stay cache-first. Bump `CACHE` when the shell asset list changes.

## Build order
1. Scaffold HTML + CSS grid shell.
2. Data model + render loop.
3. Click cycling + persistence.
4. Label editing + config controls.
5. Auto-deduce + contradiction check.
6. Polish: print, dark mode, export.

## Decisions
- Dimensions: configurable, 2–5 categories × 3–6 items (default 3×4).
- Style: authentic Murdle — heavy black block borders, white cells, bold condensed caps.
- Auto-deduce: ON by default, toggleable. Row/col ✗ fill within the block only (no cross-block transitive solving).
- Clues: editable clue list sidebar (add / edit / strike-when-used / delete), saved with the grid.
