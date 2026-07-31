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
- Cell state cycles on click: `empty → ✗ → ✓ → ? → empty`. Right-click / long-press = reverse cycle.
  `?` is a pencil mark: ignored by "solved", counted as unknown by deduction.
- Cell = `{catA, itemA, catB, itemB}` keyed pair; state stored in a Map, symmetric.
- **Two mark layers.** `state.marks` holds only what the player entered and is the only thing
  persisted/undone. `view` = `state.marks` + everything `deduce()` derives, rebuilt from scratch
  at the top of every `refresh()`. Derived cells render with `.auto` (dimmed) and are never
  written back, so erasing a mark can't leave a stale deduction behind and a derived ✗ can never
  block a later ✓. Derived writes refuse to overwrite a player mark.

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
4. **Deduce** (optional toggle, ON by default) — full propagation to a fixpoint (≤16 passes):
   R1 a ✓ crosses out the rest of its block row/column; R2 `m-1` ✗ in a line ⇒ the survivor is ✓;
   R3 ✓(a,b) + ✓(b,c) ⇒ ✓(a,c); R4 ✓(a,b) + ✗(b,c) ⇒ ✗(a,c). Runs over both category orders,
   since R4 isn't symmetric.
5. Reset / Clear grid — no `confirm()`; both snapshot first and offer **Undo** in the toast.
6. Save/load to localStorage; autosave. **Puzzle library**: `murdle-lib-v1` =
   `{active, puzzles:[{id,name,updated,state}], prefs:{theme}}`; the old single-slot
   `murdle-chart-v1` save is migrated on first boot. New / Copy / Rename / Delete (delete is
   undoable via toast) live in the Puzzles modal; Import lands as a *new* puzzle, never an
   overwrite.
7. Responsive layout; rotated column headers; row labels + row category bar are
   `position:sticky` so they survive horizontal scroll on 4–5 category grids.

### v2 (done)
8. Undo/redo of the **whole state** — marks, names, clues, category/item count — 80 deep,
   `⌘/Ctrl+Z` and `⇧⌘Z` / `Ctrl+Y`. `resize()` no longer clears the stack.
9. Clue list (add / edit / strike-when-used / delete, delete is undoable).
10. Contradiction highlight: two ✓ in a line, a fully crossed line, **and** cross-block conflicts
    (✓(a,b)+✓(b,c)+✗(a,c) and the mirror).
11. Solution summary table (derived from the merged view, so deductions show up in it).
12. Print stylesheet: landscape `@page`, forced light vars, smaller cells, sidebar printed below
    the grid.
13. Export/import puzzle as JSON (export carries the puzzle name; import creates a new puzzle).
14. Dark mode: `prefers-color-scheme` by default, `Theme: Auto → Light → Dark` button pins it in
    `lib.prefs.theme`; all colors are CSS vars (`--ink/--paper/--edge/--hdrbg/--hl/...`).

### v3 (done)
15. Crosshair: hovering or cursoring a cell tints its whole grid row and column plus the two item
    labels it joins.
16. Keyboard: arrows move a cursor (skipping empty blocks), `x` / `v` / `?`(or `m`) mark it,
    `Backspace`/`Delete`/`0` clear, `Space`/`Enter` cycle.
17. Incremental repaint: `render()` rebuilds the DOM only for structural changes; marking calls
    `refresh()`, which repaints existing cells from caches (`cellEls`, `posKey`, `rowCells`,
    `colCells`, `rowLabs`, `colLabs`).
18. Toolbar reduced to Deduce / Undo / Redo / − / + / Names / ⋯ More; sizes, Puzzles, Theme,
    Clear, Reset, Export, Import, Print live in the ⋯ menu.
19. Mobile: clues + solution become a bottom drawer (46px peek, tap to open, shows how many clues
    are left).

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
  zoom), `gesturestart/change/end` → `preventDefault()` (no pinch zoom), and 16px editables
  (smaller fonts make iOS zoom on focus): modal inputs and clue text are plain 16px, while grid
  labels go 16px **only while focused** and are scaled back down (`transform:scale()`, box grown
  by 1/scale) so glyph and box size are unchanged on screen.
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
- Deduce: ON by default, toggleable, full cross-block propagation; results live only in `view`.
- Clues: editable clue list sidebar (add / edit / strike-when-used / delete), saved with the grid.
- No `confirm()` anywhere — destructive actions snapshot and offer Undo in the toast.
