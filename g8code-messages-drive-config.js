// G8Code Messenger — existing Apps Script bridge URL, unchanged.
// Credentials stay in Google Apps Script Script Properties (never in GitHub).
window.MCS_G8_MESSAGES_DRIVE_URL = String(window.MCS_APPS_SCRIPT_URL || '').trim();

// ImageKit STEP 4C: SAFE PILOT ONLY.
// Teacher/admin must intentionally open messages.html?from=admin&imagekitPilot=1.
// Student uploads and normal Messenger visits stay with Google Drive.
// IMPORTANT: private ImageKit images can still be VIEWED regardless of pilot mode.
window.MCS_G8_MESSAGES_IMAGEKIT_PILOT_ENABLED = true;
