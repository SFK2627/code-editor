# Stability and Test Report

Release label: `20260711-quality-gate-v100`

## Automated checks completed

- JavaScript syntax check: passed for `script.js` and `service-worker.js`.
- ESLint critical rules: passed with no `no-undef`, `no-redeclare`, `no-unreachable`, duplicate-key, or function-reassignment errors.
- CSS parser check: passed with no stylesheet parse errors.
- JSON validation: passed for `firebase.json` and `manifest.webmanifest`.
- HTML ID audit: passed with no duplicate IDs.
- Local asset audit: passed with no missing referenced files.
- Desktop DOM smoke test: passed for entry screen, guest mode, editor load, Run, preview generation, tab switching, input, and rubric parsing.
- Phone DOM smoke test: passed for guest mode, editor visibility, tab layout, preview labels, Full Editor entry, and Escape exit.
- Offline-start DOM smoke test: passed with no runtime error and a clear offline banner.
- PWA icon audit: 192 px and 512 px standard/maskable files are present.

## High-impact defects fixed

1. Rubric parser fallback could recursively call itself for some text formats.
2. Firebase's first failed load could permanently block retry until refresh.
3. Multiple mobile polling loops repeatedly changed the same scroll classes.
4. Super Studio reassigned the core `runCode` function at runtime.
5. Service-worker installation could fail when one asset was unavailable.
6. Asset fetch failure could incorrectly return `index.html` for a missing JS/CSS request.
7. Collaboration rules allowed any signed-in user to update the whole session document.
8. Cloud save completion could clear the dirty state even when newer edits existed.

## Remaining real-device checks

The following depend on the deployed Firebase project, classroom network, and real browsers and therefore must be tested after deployment:

- Teacher and first-time student authentication.
- Firestore rule behavior using the live project.
- Two or more simultaneous collaboration participants.
- Save/reconnect behavior on the school's actual Wi-Fi.
- Installed Android and iOS PWA update behavior.
- Large class roster import and Firebase Spark quota usage.

The automated checks provide a strong release baseline, but no static build can honestly guarantee a numerical stability score without real classroom load testing.
