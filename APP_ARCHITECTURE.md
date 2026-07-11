# Sir JR Coding App Architecture

Release: `20260711-overall-100-readiness`

This release keeps the app free-only and deployment-friendly while making the codebase easier to maintain.

## Source of truth

The browser still loads these generated files:

- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`
- `service-worker.js`
- `manifest.webmanifest`

For editing and maintenance, use these source folders:

- `src/js/` for JavaScript features
- `styles/` for CSS/layout features

After editing source modules, run:

```bash
npm run build
npm run check
```

## JavaScript module map

| Area | Source file |
|---|---|
| DOM references, config, constants, starter code | `src/js/00-bootstrap-dom-config-state.js` |
| Utilities, storage, student assistance controls | `src/js/10-utilities-storage-assistance.js` |
| File/page management and activity normalization | `src/js/20-files-pages-activities.js` |
| Firebase, teacher login, admin dialogs | `src/js/30-firebase-admin-dialogs.js` |
| Student auth, projects, autosave, tracker import | `src/js/40-student-auth-projects-tracker.js` |
| Editor, syntax coloring, suggestions, history | `src/js/50-editor-syntax-suggestions.js` |
| Preview runtime, checker, PWA install | `src/js/60-preview-runtime-checker-pwa.js` |
| Rubric grading, feedback, results, preview controls | `src/js/70-rubric-feedback-results.js` |
| Fullscreen editor, admin builder, rubric import | `src/js/80-fullscreen-admin-builder-import.js` |
| Download ZIP, shortcuts, inline hints | `src/js/90-download-shortcuts-hints.js` |
| Event bindings and base mobile preview sizing | `src/js/95-event-bindings-mobile-preview-base.js` |
| Super Studio tools | `src/js/96-super-studio-tools.js` |
| Share/join collaboration sessions | `src/js/97-collaboration-live-sessions.js` |
| Reliability lifecycle and mobile reconciliation | `src/js/98-reliability-lifecycle-fixes.js` |
| Quality diagnostics and health check | `src/js/99-quality-diagnostics-health-check.js` |

## CSS module map

| Area | Source folder/file |
|---|---|
| Base design tokens, layout, editor shell | `styles/00-base-layout-editor.css` |
| Preview layout and activity manager | `styles/10-preview-activity.css` |
| Guided flow and early editor tools | `styles/20-guided-editor-tools.css` |
| Full editor core behavior | `styles/30-full-editor-core.css` |
| Editor-first layout and scale rubric | `styles/40-editor-first-scale-rubric.css` |
| Admin/rubric/teacher auth styling | `styles/50-admin-rubric-auth.css` |
| Mobile and admin layout baseline | `styles/60-mobile-admin-layout.css` |
| Error checker, AI review, rubric dialogs | `styles/70-error-ai-rubric-dialogs.css` |
| Dialogs, code helper, header polish | `styles/80-dialog-helper-header-polish.css` |
| Fullscreen rename/layering fixes | `styles/90-fullscreen-rename-layering.css` |
| Fullscreen action bars and transitions | `styles/100-fullscreen-actions-transitions.css` |
| Fullscreen preview/result behavior | `styles/110-fullscreen-preview-result.css` |
| Multi-page/tabs/mobile preview controls | `styles/120-multi-page-mobile-tabs.css` |
| Phone desktop monitor preview | `styles/130-mobile-desktop-preview.css` |
| Student accounts and dashboard | `styles/140-student-accounts-dashboard.css` |
| Admin tabs, student tracker, hints | `styles/150-admin-tabs-students-hints.css` |
| CodePen polish, Studio readability | `styles/160-codepen-studio-readability.css` |
| Premium fullscreen and Studio UX | `styles/170-premium-fullscreen-studio.css` |
| Critical mobile and homepage fixes | `styles/180-critical-mobile-home-fixes.css` |
| Responsive header/home/control fixes | `styles/190-responsive-header-home-controls.css` |
| Collaboration UI and safe-area compatibility | `styles/200-collaboration-ui.css` |

## Safe change workflow

1. Edit the smallest relevant source module.
2. Run `npm run build`.
3. Run `npm run check`.
4. Test the affected user flow in the browser.
5. Upload the generated static files only.

## Runtime health check

Open the app in the browser console and run:

```js
MCS_RUN_HEALTH_CHECK()
```

This verifies important runtime elements, service worker availability, Firebase config visibility, save state, and release metadata.


## Mobile Experience 100 layer

The final mobile hardening layer is intentionally isolated at the end of the source order:

- `src/js/100-mobile-experience-controller.js` handles phone visual viewport, keyboard-open state, orientation classes, installed-PWA state, and runtime mobile diagnostics.
- `styles/210-mobile-experience-100.css` applies last-layer mobile overrides for safe areas, keyboard layout, touch targets, dashboard/admin/dialog scrolling, preview fullscreen, and suggestion positioning.

Keep these files last unless a future change intentionally supersedes mobile behavior.
