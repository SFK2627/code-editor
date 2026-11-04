// G8Code Messenger: same existing authenticated Apps Script bridge URL.
// Credentials remain in Apps Script Script Properties, NEVER in GitHub.
window.MCS_G8_MESSAGES_DRIVE_URL = String(window.MCS_APPS_SCRIPT_URL || '').trim();

// ImageKit is now the DEFAULT host for NEW private Messenger photo uploads
// from both teacher and student accounts. Existing Drive photos still load
// from Drive because each saved attachment retains its original provider.
// To pause NEW ImageKit uploads, change this to false and redeploy this file.
// That affects only NEW photo jobs, not already-sent messages or pending jobs.
window.MCS_G8_MESSAGES_IMAGEKIT_UPLOAD_ENABLED = true;
