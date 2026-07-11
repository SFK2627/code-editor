# Changelog

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
