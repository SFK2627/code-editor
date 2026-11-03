// G8Code Messages private Workspace Drive bridge — same Apps Script deployment.
// Reuses the existing secure Code.gs backend URL; no second Apps Script project.
// Keep Google Drive folder ID and all server credentials ONLY in Apps Script properties.
window.MCS_G8_MESSAGES_DRIVE_URL = String(window.MCS_APPS_SCRIPT_URL || '').trim();
