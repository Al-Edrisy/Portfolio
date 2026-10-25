# Plan 002: Tactile Button Press Feedback, Alpha Borders & Translucent Materials

- **Commit**: `4023ee2`
- **Severity**: HIGH
- **Categories**: Physicality & Origin, Performance, Apple Materials
- **Target Files**:
  - `components/ui/button.tsx`
  - `components/ui/card.tsx`
  - `components/ui/dialog.tsx`
  - `components/ui/navigation.tsx`

## Findings Addressed
1. `components/ui/button.tsx:8` uses `transition-all` (off-GPU layout/paint hazard) and lacks `:active` press scaling (`active:scale-[0.97]`).
2. `components/ui/card.tsx:10` uses a harsh `border` instead of subtle alpha-blended `border-border/60 dark:border-white/[0.08]`.
3. `components/ui/dialog.tsx:41, 63` lacks translucent backdrop blur on the scrim and uses generic easing instead of `--ease-out`.
4. `components/ui/navigation.tsx:97, 136` uses `transition-all` and `easeInOut` on header reveal instead of `cubic-bezier(0.23, 1, 0.32, 1)`.
