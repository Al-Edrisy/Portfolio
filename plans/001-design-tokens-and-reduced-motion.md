# Plan 001: Custom Easing Tokens, Hover Gating & Non-Destructive Reduced Motion

- **Commit**: `4023ee2`
- **Severity**: HIGH
- **Categories**: Easing & Duration, Accessibility, Cohesion & Tokens
- **Target Files**:
  - `app/globals.css`
  - `styles/skills-animations.css`

## Findings Addressed
1. `app/globals.css:35-43` uses a blanket `transition-duration: 0.01ms !important` on `*` under `@media (prefers-reduced-motion: reduce)`, which destroys comprehension-aiding opacity and color cross-fades instead of selectively disabling spatial movement (`transform`).
2. `app/globals.css:81` lacks shared custom easing tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`), causing components to fall back to weak browser default easings.
3. `styles/skills-animations.css:62-64, 110-121` triggers `:hover` 3D tilt, icon rotation, and magnetic translation without `@media (hover: hover) and (pointer: fine)`, causing sticky false-positive hover jumps on touch devices.

## Exact Target Values
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);`
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);`
- Gate hover transforms behind `@media (hover: hover) and (pointer: fine)`.
