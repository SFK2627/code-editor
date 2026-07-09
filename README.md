# Grade 8 MCSian Web Code Editor

A beginner-friendly HTML, CSS, and JavaScript code editor for students.

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

Teacher PIN is set inside `script.js` as `ADMIN_PIN`. It is no longer displayed on the admin screen.

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

Activities, rubrics, code, theme, and layout are saved in the browser only through `localStorage`. This means the activities are device/browser-specific for now.

For a real class deployment where the teacher controls activities for all students, the next recommended upgrade is Firebase or another backend.

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


## Latest admin layout update

- Teacher/Admin rubric builder now opens as a near full-screen workspace.
- Admin modal appears above the top toolbar.
- Rubric table has more room for criteria and rating descriptions.
- Save actions stay reachable at the bottom while editing.


## Latest fixes
- Admin/Teacher panel stays wide, but the PIN screen is now compact and centered.
- The Teacher PIN is no longer displayed on the admin screen.
- Light mode now uses a light editor background; dark mode uses a dark editor background.
- Default starter code is HTML only; CSS and JavaScript start blank.


## Clean Restore Build

This package was rebuilt from the uploaded stable files. It keeps the core editor, activity selector, rubric table builder, output preview, ZIP download, and mobile editor fixes. Teacher/Admin access uses Firebase Email/Password Authentication; any user manually added in Firebase Authentication can manage activities and rubrics.


## Rubric Picture Import

Teacher/Admin now has an Upload Rubric Picture feature. It requires a deployed Firebase Function endpoint to read image screenshots and fill the rubric table automatically. See `RUBRIC_IMAGE_IMPORT_SETUP.md`.
