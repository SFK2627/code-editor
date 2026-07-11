# Sir JR Coding App

A classroom-ready HTML, CSS, and JavaScript workspace for Grade 8 MCSian students. It supports student accounts, cloud-saved projects, rubric scoring, teacher monitoring, live collaboration, responsive mobile use, and installable PWA behavior.

## Stability + Professional Polish Release

This build focuses on reliability and finish rather than adding another large feature set.

### Reliability improvements

- Revision-safe project saving prevents an older cloud save from marking newer edits as saved.
- Failed or offline edits receive a local recovery copy on the same device.
- Project lists are cached locally and can still be opened as an offline copy.
- Autosave retries use controlled delays instead of repeatedly spamming Firestore.
- Logout waits for pending saves and warns before leaving when cloud sync did not finish.
- Firebase loading now runs in parallel, has a timeout, and can retry after a failed first connection.
- Service-worker installation no longer fails because of one missing optional asset.
- Navigation requests and static assets now use safer offline caching strategies.
- Three competing mobile scroll-repair loops were replaced by one event-driven layout reconciler.
- Hidden duplicate JavaScript declarations were removed.
- Fixed a rubric-text parser recursion bug that could freeze import for non-table rubric text.
- Super Studio no longer replaces the core `runCode` function at runtime; it uses a safe hook.

### Professional polish improvements

- Complete 192 px and 512 px standard and maskable PWA icons.
- Clear online/offline status and pending-save messaging.
- Consistent focus-visible, disabled, loading, and pressed states.
- Better reduced-motion, forced-colors, safe-area, and touch-target support.
- Improved Firebase Hosting cache and security headers.
- Hardened collaboration rules so non-host students cannot manage the whole live-session document.
- Updated setup documentation to match the actual free-only architecture.

## Main student features

- Student ID login with default first password `123456`.
- Forced password change during first activation.
- My Projects dashboard with create, open, rename, delete, search, filter, score, and run count.
- Guest practice mode without permanent cloud saving.
- HTML, CSS, and JavaScript editor with syntax coloring, suggestions, indentation, undo/redo, zoom, and multiple files/pages.
- Run, Auto Run, Result, rubric-based feedback, Error Checker, Full Editor, and output fullscreen.
- ZIP export of the current website.
- Optional Super Studio and teacher-controlled assistance features.
- Optional live Share/Join collaboration.
- Responsive phone, tablet, desktop, and PWA layouts.

## Teacher/Admin features

- Firebase Email/Password teacher login.
- Activity and scale-based rubric builder.
- Manual 5-column rubric table entry.
- Rubric image reading with browser-side OCR when no secure endpoint is configured.
- Manual student registration and Excel/CSV roster import.
- Student, section, activity, login, project, and score tracking.
- Global assistance, autosave, autorun, collaboration, and Super Studio controls.

## Required deployment steps

1. Enable **Authentication > Email/Password** in Firebase.
2. Confirm the teacher account exists.
3. Publish the included `firestore.rules`.
4. Upload the website files and `icons/` folder.
5. Keep the Firebase project on Spark/no billing.
6. Hard refresh after deployment; close and reopen an installed PWA.

Read `FIREBASE_AND_GITHUB_SETUP.md` and `FREE_STUDENT_ACCOUNTS_SETUP.md` before the first class use.

## Main files

- `index.html` — app structure, entry screen, dashboards, editor, and Admin UI
- `style.css` — full desktop/mobile design and final accessibility layer
- `script.js` — editor, projects, saving, rubrics, tracker, collaboration, and PWA logic
- `firebase-config.js` — Firebase project and allowed teacher account
- `firestore.rules` — teacher, student, project, submission, and collaboration permissions
- `firebase.json` — Firebase Hosting and Firestore deployment configuration
- `service-worker.js` — install/offline cache behavior
- `manifest.webmanifest` — PWA metadata and icons
- `icons/` — standard and maskable app icons
- `STUDENT_IMPORT_TEMPLATE.csv` — roster import sample

## Keyboard shortcuts

- `Ctrl + S` — save/queue the current student project
- `Ctrl + Enter` — run code
- `Ctrl + Shift + Enter` — check result
- `Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3` — HTML/CSS/JavaScript tabs
- `Ctrl + Shift + F` — full editor
- `Esc` — close fullscreen or the active overlay

## Important limitations

- Firebase Spark quotas still apply. When quota is exhausted, cloud reads/writes can pause until reset.
- Firebase modules, the Excel reader, and rubric OCR are loaded from trusted CDNs, so those online features require internet access.
- Local recovery protects edits on the same browser/device; it is not a substitute for a completed cloud save.
- Live collaboration should still be trialed with the actual classroom Wi-Fi and expected number of simultaneous students before a graded activity.

See `STABILITY_AND_TEST_REPORT.md` for the automated checks completed for this release.

Release: 20260711-overall-100-readiness

## Maintainability 95 Source Workflow

This release adds a maintainable source layer while keeping static deployment simple.

For future edits, work from:

- `src/js/` for JavaScript modules
- `styles/` for CSS modules

Then run:

```bash
npm run build
npm run check
```

The browser still loads `script.js` and `style.css`, so GitHub Pages and Firebase Hosting remain simple and free-only.

Read `APP_ARCHITECTURE.md` and `MAINTAINABILITY_95_REPORT.md` before making major revisions.


## Mobile Experience 100 Readiness

This release adds a final mobile hardening layer for phone and installed-PWA use. It includes `viewport-fit=cover`, dynamic visual viewport CSS variables, keyboard-open handling, safe-area spacing, portrait/landscape classes, and a runtime mobile diagnostic function.

Run this on a phone browser console when available:

```js
window.MCS_RUN_MOBILE_HEALTH_CHECK()
```

See `MOBILE_EXPERIENCE_100_REPORT.md` for the full mobile readiness checklist.

## Overall 100-Readiness Release

Release: 20260711-overall-100-readiness

This build adds an all-category readiness gate for features, classroom usefulness, stability, professional polish, mobile experience, Firebase/security, PWA deployment, recovery, QA, and maintainability.

Before deployment, run:

```bash
npm run check
```

After deployment, the following runtime checks are available in the browser console:

```js
window.MCS_RUN_HEALTH_CHECK()
window.MCS_RUN_MOBILE_HEALTH_CHECK()
window.MCS_RUN_OVERALL_READINESS_CHECK()
```

The package is prepared for 100-readiness, but the final real-world score should be confirmed through actual classroom testing.
