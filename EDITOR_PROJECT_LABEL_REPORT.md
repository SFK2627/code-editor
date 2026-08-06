# Step 254 - Editor Project Name Label

Added a small current-project header inside the code editor panel so students and the teacher can clearly see which project is being edited.

## What changed

- Added a non-editable project label above the code editor area.
- Displays the current project name, selected activity/rubric, and save status.
- Uses ellipsis on long project/activity names so the layout does not break.
- Responsive mobile layout stacks the label cleanly above the editor.
- The label is outside the textarea and syntax-highlight layers, so it does not affect cursor, typing, scrolling, copy/paste, or code coloring.
- Updated service worker cache version to Step 254.
