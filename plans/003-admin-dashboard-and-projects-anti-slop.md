# Plan 003: Admin Dashboard & Projects Anti-Slop Craft Upgrade

- **Commit**: `4023ee2`
- **Severity**: HIGH
- **Categories**: Purpose & Frequency, Anti-Slop Craft, Radii Math & Skeletons
- **Target Files**:
  - `components/admin/admin-dashboard.tsx`
  - `app/admin/projects/page.tsx`

## Findings Addressed
1. `components/admin/admin-dashboard.tsx:96, 114-210, 352` uses a cheesy yellow `<Crown />` icon, 600ms entrance animations (`duration: 0.6`), and 600ms tab-switch animations on a high-frequency workspace.
2. `app/admin/projects/page.tsx:68, 109, 132-143` uses a heavy full-page spinner instead of progressive geometry-matched skeletons, harsh rainbow status badges (`bg-green-100`, `bg-yellow-100`, `bg-blue-100`), and mismatched inner/outer border radii.
