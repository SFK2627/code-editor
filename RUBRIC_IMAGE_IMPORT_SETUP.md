# Rubric Picture Import — Free-Only Setup

The app can read a rubric screenshot directly in the teacher's browser. This release does not require Cloud Functions, Cloud Storage, billing, or an OpenAI API key.

## How it works

1. Open **Teacher/Admin > Admin Rubric Table Builder**.
2. Choose a clear rubric image or screenshot.
3. Click **Read Image & Fill Table**.
4. The app loads Tesseract.js from a CDN and reads the image inside the browser.
5. It first tries the expected five-column format:
   - Criteria
   - Excellent
   - Good
   - Fair
   - Needs Improvement
6. Review every imported row, score, and description.
7. Click **Save Activity** only after checking the result.

## Requirements

- Internet access is needed the first time the OCR library loads.
- Use a straight, high-resolution screenshot with readable text.
- Crop unnecessary borders or surrounding content.
- English text works best.

## Manual fallback

When the image is unclear, paste or type the rubric into **Type Rubric Like a Table**. This is more reliable than forcing a poor OCR result.

## Optional secure endpoint

`window.MCS_RUBRIC_IMAGE_ENDPOINT` remains available in `firebase-config.js` for a future secure backend. Leave it blank for this free-only release. Never put private AI/API keys in `firebase-config.js`, `script.js`, GitHub Pages, or any browser-visible file.
