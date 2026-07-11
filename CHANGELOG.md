# Changelog

## 20260711-overall-100-readiness

- Added all-category 100-readiness release label.
- Added overall runtime readiness check: `window.MCS_RUN_OVERALL_READINESS_CHECK()`.
- Added final overall audit: `tools/overall-readiness-audit.js`.
- Added final accessibility/mobile/print polish CSS layer.
- Added `OVERALL_100_READINESS_REPORT.md` and `FINAL_DEPLOYMENT_README.md`.
- Updated `npm run check` to include build sync, source integrity, quality audit, and overall readiness audit.

## 2026-07-11 — Stability + Professional Polish

### Fixed
- Removed duplicate function declarations and unsafe runtime function replacement.
- Fixed rubric text parser recursion.
- Made Firebase initialization retryable after connection failure.
- Added Firebase loading timeout and parallel module loading.
- Added revision-safe save completion and queued-save handling.
- Added offline recovery copies and local project-list cache.
- Added controlled autosave retries and safer logout flushing.
- Replaced repeated mobile repair polling with one event-driven reconciler.
- Rebuilt service-worker caching and missing-asset behavior.
- Hardened live collaboration Firestore permissions.

### Improved
- Added online/offline banner and clearer save states.
- Added standard and maskable PWA icons.
- Added focus-visible, disabled, reduced-motion, forced-colors, and phone safe-area styling.
- Added Firebase Hosting cache/security headers.
- Updated all setup and deployment documentation.


## 20260711-overall-100-readiness

- Added final mobile experience CSS layer.
- Added mobile runtime controller for visualViewport, keyboard, orientation, safe-area, and PWA diagnostics.
- Added `viewport-fit=cover` and mobile color-scheme metadata.
- Added `MOBILE_EXPERIENCE_100_REPORT.md`.
- Expanded source-integrity and quality-audit checks for mobile readiness.
