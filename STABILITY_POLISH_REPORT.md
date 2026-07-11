# Sir JR Coding App - Stability and Professional Polish Pass

Target release: `20260711-quality-gate-v100`

## What was improved

### Stability
- Repaired release structure and normalized uploaded filenames to deployable root names.
- Added safer autosave flow with revision tracking, in-flight save protection, queued saves, timeout handling, and retry behavior.
- Added local recovery snapshots for unsaved student work during offline use, failed saves, page close, and tab visibility changes.
- Added cached project-list fallback so students can still see their last loaded projects when the connection fails.
- Added offline banner and clearer save states such as `Saving`, `Unsaved`, `Offline pending`, and `Save failed retrying`.
- Removed duplicated JavaScript function declarations found during the audit.
- Replaced multiple interval-based mobile scroll fixes with one event-driven phone layout reconciler.
- Improved Practice Without Login reliability with a hard click fallback.
- Hardened the Service Worker install/update flow so optional cache items cannot break installation.
- Added Firebase Hosting headers for safer content handling and cache freshness.
- Strengthened Firestore collaboration rules so hosts manage sessions while members only update allowed fields.

### Professional polish
- Updated app metadata, favicon handling, manifest categories, and install icons.
- Added maskable PWA icons for better Android/iOS home-screen appearance.
- Added no-JavaScript fallback notice.
- Added consistent focus-visible styles, disabled/busy states, tap behavior, reduced-motion support, and forced-colors support.
- Added safe-area spacing for phones with notches/browser bars.
- Improved offline/status messaging and button readability on phone preview.

## Static checks performed
- `node --check script.js` passed.
- `firebase.json` parsed as valid JSON.
- `manifest.webmanifest` parsed as valid JSON.
- `style.css` brace balance passed.
- `index.html` duplicate-ID check passed.
- Local asset references in `index.html` and `service-worker.js` were checked.
- Duplicate JavaScript function declaration check passed.

## Deployment notes
- Upload/replace the files in the repository root.
- Keep Firebase on Spark/no billing.
- Publish `firestore.rules` in Firebase Console.
- Hard refresh the website after deployment.
- On installed PWA/mobile, close and reopen the app once after deployment.
