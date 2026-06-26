---
name: EE Solver architecture
description: Key decisions and quirks for the EE Solver artifact (artifacts/ee-solver)
---

## Routing
- Uses `wouter` with `<Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>` so sub-paths work correctly behind Replit's path-based proxy.
- Routes: `/`, `/equation-library`, `/equation-library/:id`, `/smart-solver`, `/recently-solved`.

## localStorage (recently solved)
- Key: `"ee-recently-solved"` — stores a JSON array of `RecentlySolved` objects (max 10, newest first).
- Backward-compat: `getAllRecentlySolved()` accepts old single-object format (returns `[obj]`).
- Shape validation: `isValidRecent()` guard strips invalid/null entries on read and re-persists cleaned list.
- Cross-tab sync: functions dispatch `"ee-recents-updated"` CustomEvent and callers also listen to `"storage"`.

## SmartSolver unit picker
- When `varSymbol` is empty → `getUnitsForSymbol("")` returns `ALL_UNITS` (all ~40 units).
- When `varSymbol` matches a known `EE_VARIABLES` entry → returns only that variable's units.
- Symbol auto-select also sets the default unit to the variable's primary unit.

## Design system
- Dark mode default; HSL CSS variables in `index.css`; Space Grotesk (serif) + Inter (sans).
- No backend; no auth; no external API calls except an Unsplash image URL for the hero background.

**Why:** Needed to document these after a multi-session port from GitHub; these decisions are not obvious from the code alone.
