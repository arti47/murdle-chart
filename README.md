# Murdle Chart

A Murdle-style logic-grid deduction chart. One HTML file, no dependencies, works offline.

**Live:** https://arti47.github.io/murdle-chart/

## Use

- Click a cell: blank → **✗** → **✓** → **?** → blank. Right-click (desktop) or long-press (touch) cycles backwards.
- Keyboard: arrow keys move the cursor, `x` / `v` / `?` mark it, `Backspace` clears, `Space` cycles, `⌘/Ctrl+Z` undoes.
- Hovering a cell highlights its row, its column and the two names it joins.
- `Deduce` (on by default) fills in everything that follows from your marks — inside a block and
  across blocks — and draws those marks dimmed. Only your own marks are saved, so erasing one
  always erases what it implied.
- Click any category or item name to rename it, or use `Names` to paste a whole puzzle at once.
- `⋯ More` holds grid size, the puzzle library, theme, clear/reset, export/import and print.
- Everything autosaves to the browser, one save per puzzle. `Export` / `Import` moves a puzzle as JSON.

## Add to your iPhone / iPad home screen

1. Open the live URL in **Safari** (not Chrome — only Safari can install to the home screen).
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. Launch it from the icon: it opens fullscreen with no browser chrome, and works with no signal.

Puzzles are stored per-install, so the home-screen app and Safari keep separate saves.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — markup, CSS, JS, and the app icon inlined as base64 |
| `sw.js` | Service worker; caches the app shell for offline use |
| `icon-512.png` | Icon referenced by the web manifest |
| `CLAUDE.md` | Workplan and design decisions |

## Run locally

```bash
python3 -m http.server 8765 --directory murdle-chart
```

Then open http://localhost:8765. Opening `index.html` directly via `file://` works too, but iOS will not offer "Add to Home Screen" for a `file://` page.
