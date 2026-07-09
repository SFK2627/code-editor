# Grade 8 MCSian Web Code Editor

A beginner-friendly HTML, CSS, and JavaScript code editor for Grade 8 MCSian students.

Developed by Sir JR.

## Main Features

- Cleaner student flow: **Choose Activity → Write Code → Run Output → See Result**
- HTML, CSS, and JavaScript tabs
- Runs even if the student only writes HTML
- HTML tab encourages a complete document structure:
  - `<!DOCTYPE html>`
  - `<html>`
  - `<head>`
  - `<title>`
  - `<body>`
- Live code suggestions while typing
- HTML tag suggestions include closing-tag indicators:
  - Red badge: the tag has a closing tag and clicking it inserts the pair
  - Green badge: the tag is self-closing
- Output preview options:
  - Split view
  - Stacked view
  - Big preview
  - Full screen preview
- Light and dark mode
- Student activity selector
- Teacher/Admin activity manager
- Multiple saved activities, each with its own instructions and rubric
- Per-activity saved student code using browser `localStorage`
- Automatic scoring based on the selected activity rubric
- Automatic student feedback after clicking **See Result**
- Keyboard-friendly editor controls

## Keyboard Shortcuts

- `Ctrl + Z` - Undo
- `Ctrl + Y` - Redo
- `Ctrl + S` - Save locally
- `Ctrl + Enter` - Run Code
- `Ctrl + Shift + Enter` - See Result
- `Ctrl + 1` - HTML tab
- `Ctrl + 2` - CSS tab
- `Ctrl + 3` - JavaScript tab
- `Tab` - Indent code
- Arrow keys + Enter - choose an autocomplete suggestion

## Student Flow

1. Choose an activity from the **Choose Activity** dropdown.
2. Read the selected activity instructions.
3. Type code in HTML, CSS, and/or JavaScript.
4. Click **Run Code** to view the output.
5. Click **See Result** to view the score, rubric breakdown, and generated feedback.

## Admin Access

Teacher/Admin now uses Firebase Authentication with Email/Password. The teacher email must be allowed in `firebase-config.js` and `firestore.rules`.

The admin can:

- Choose which saved activity to edit
- Create a new activity
- Duplicate an existing activity
- Delete an activity
- Edit activity title
- Edit activity instructions
- Edit passing score
- Add/edit/remove rubric criteria
- Set automatic checking rule per criterion
- Set points per criterion

## Important Note

This version is ready for GitHub Pages because it uses plain HTML, CSS, and JavaScript.

Activities and rubrics are synced through Firebase Firestore when Firebase is enabled. Student code, theme, and layout preferences are still saved locally in the browser.

## Suggested Next Improvements

- Firebase login for teacher and students
- Shared activities and rubrics online
- Student name/section input
- Save student submissions
- Export scores to CSV/Excel
- Teacher dashboard for all submitted results
- Code syntax highlighting
- More advanced HTML/CSS/JS error checking


## Latest improvements

- Matching HTML tag guide: click an opening or closing tag in the HTML editor to underline its matching pair.
- Missing closing/opening tags are marked with a red wavy underline helper.
- Self-closing HTML tags such as `img`, `br`, `input`, `meta`, and `link` are identified as tags that do not need closing tags.
- Editor zoom controls are included in the editor toolbar.
- Keyboard shortcuts for zoom: `Ctrl + +`, `Ctrl + -`, and `Ctrl + 0`.

## Latest Version 6 Improvements

- **Run Code** and **See Result** are now inside the editor area.
- Editor action bar is sticky, so the main buttons remain easy to access while scrolling.
- Clicking **Run Code** automatically scrolls to the output preview.
- The Step 1 activity card is hidden by default and opens/closes when Step 1 is clicked.
- Clicking Step 2 without selecting an activity highlights Step 1 in red and explains that score/feedback require a selected activity.
- Students can still run HTML-only code even without CSS or JavaScript.
- Default starter code is now a simple full HTML **Hello World** structure.
- CSS and JavaScript tabs start blank by default.

## Latest Version 7 Improvements

- Suggestions are now less intrusive and appear only while the student is actively typing.
- Suggestion popup is smaller, has a close button, and automatically hides after a short pause.
- Clicking inside the code editor hides suggestions so they do not stay stuck on screen.
- Added **Full Editor** mode so only the editor is visible while coding.
- Added **Exit Full** button and `Esc` support to return to the normal layout.
- Added shortcut: `Ctrl + Shift + F` for Full Editor mode.

## Latest Version 9 Improvements

- Rebuilt **Ctrl + Z** and **Ctrl + Y** with a custom editor history system.
- Undo/redo now works for normal typing, deleting, clearing, indentation, and inserted suggestions.
- Added support for `Ctrl + Shift + Z` as another redo shortcut.
- **Full Editor** now uses a true full-screen style and requests browser fullscreen when available.
- In Full Editor mode, the editor fills the whole screen/monitor area with no rounded floating box limit.

## Latest Version 10 Improvements

- Added **Download ZIP / Save ZIP** button for students.
- Clicking the ZIP button automatically downloads the current code as a ZIP file.
- ZIP includes:
  - `index.html`
  - `style.css`
  - `script.js`
  - `README.txt`
- The downloaded `index.html` automatically links to `style.css` and `script.js` when those tabs contain code.
- `Ctrl + S` still saves progress locally in the browser.


## Latest UI change

The app now opens directly to the editor after the compact header. Activity selection, guide, and extra instructions are hidden/collapsible so students can start coding immediately.

## Latest Admin Rubric Update

- Teacher/Admin rubric is now **scale-based**.
- Each criterion has four performance levels:
  - Excellent
  - Good
  - Fair
  - Needs Improvement
- Teacher can set the score and description for every level.
- The app still uses an auto-check basis to estimate the student's level when they click **Result**.
- Student results now show the level earned per criterion, score, and automatic feedback.


## Latest fix
- Default starter code is HTML only.
- CSS and JavaScript tabs now start blank.
- Code storage key was updated so old saved CSS/JS starter data will not reappear as the default.


## Latest update
- Latest update: Admin PIN is no longer displayed on the login screen or incorrect-PIN message.
- Light mode now uses a light editor background; dark mode uses the dark editor background.

## Latest default-code fix

- The first load now clears old saved student code from earlier versions so the old CSS/JS starter or test text will not appear again.
- Default HTML is only the required full structure.
- CSS and JavaScript tabs start blank.
- Teacher/Admin activities and rubrics are not cleared by this migration.


## Clean Uploaded Base Fix

- This build uses the uploaded files as the base.
- Starter code migration version was refreshed so old saved junk/test code from earlier browser storage will clear on first load.
- Default starter remains HTML only; CSS and JavaScript start blank.

## Latest Admin Modal Width Fix

- Teacher/Admin rubric builder is now much wider.
- The rubric table has more horizontal workspace for criteria and rating levels.
- The PIN screen stays compact and centered so it does not become oversized.

## Latest Admin View Fix

- Opening Teacher/Admin now hides the sticky student top panel.
- Admin Rubric Table Builder now uses almost the whole screen.
- The close **X** button stays visible at the top of the admin panel.

## Latest editor typing improvement

- Pressing `Enter` now keeps the same indentation as the current line.
- When the cursor is after an opening HTML tag such as `<body>` or `<div>`, the next line automatically indents by two spaces.
- When the cursor is between an opening and closing tag, the editor creates a neat inside line and keeps the closing tag aligned.
- CSS and JavaScript also indent automatically after `{`, `[`, or `(`.

## Latest Syntax Highlighting Update

- Added Notepad++-style syntax coloring inside the editor.
- HTML tags, brackets, attributes, strings, comments, and doctype now use different colors.
- CSS selectors, properties, values, numbers, and punctuation now use different colors.
- JavaScript keywords, functions, strings, comments, and numbers now use different colors.
- Syntax colors work in both light mode and dark mode.

## GitHub + Firebase-ready update

This ZIP is ready for GitHub Pages. It also includes optional Firebase files:

- `firebase-config.js` - paste your Firebase Web App config here and set `MCS_FIREBASE_ENABLED` to `true`.
- `firebase.json` - optional Firebase Hosting config.
- `firestore.rules` - demo rules for testing only.
- `FIREBASE_AND_GITHUB_SETUP.md` - quick setup guide.

When Firebase is enabled, activities/rubrics can sync through Firestore and student results can be saved online. When Firebase is disabled, the app still works normally using browser localStorage.

Important: the current Teacher/Admin PIN is client-side, so it is not secure for a public production system. For real class deployment, the next upgrade should be Firebase Authentication.


## Firebase Auth Teacher Login Update

- Teacher/Admin now uses Firebase Authentication with Email/Password.
- The old visible/client-side PIN login has been removed.
- Allowed teacher email is set in `firebase-config.js` and must match `firestore.rules`.
- Default allowed teacher email: `sirjr.mcsian@gmail.com`.
- Students can read activities/rubrics and create submissions.
- Only the teacher account can create, edit, delete, and save activities/rubrics.
