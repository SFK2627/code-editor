// Grade 8 MCSian Web Code Editor - Firebase Frontend Config
window.MCS_FIREBASE_ENABLED = true;
window.MCS_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDuqBnvcIGbbUexKASjrWdinOqAQjnEQV0',
  authDomain: 'code-editor-f0f9d.firebaseapp.com',
  projectId: 'code-editor-f0f9d',
  storageBucket: 'code-editor-f0f9d.firebasestorage.app',
  messagingSenderId: '119616488399',
  appId: '1:119616488399:web:453b411fbf93a3b71e08ba'
};
window.MCS_FIREBASE_COLLECTION = 'webCodeEditor';
window.MCS_FIREBASE_DOCUMENT_ID = 'grade8-mcsian-blank-v1';
// Only these Firebase Authentication emails can open teacher/admin controls.
window.MCS_TEACHER_EMAILS = ['sirjr.mcsian@gmail.com'];
window.MCS_FIREBASE_SDK_VERSION = '10.12.5';

// Optional Firebase Realtime Database URL for low-quota transient features.
// Create Realtime Database in Firebase Console, then paste the EXACT database URL here.
// Example formats:
// https://PROJECT_ID-default-rtdb.firebaseio.com
// https://PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app
window.MCS_FIREBASE_DATABASE_URL = 'https://code-editor-f0f9d-default-rtdb.asia-southeast1.firebasedatabase.app';

// Hybrid backend switches. Keep enabled after the matching backend is deployed.
window.MCS_USE_RTDB_PRESENCE = true;
window.MCS_MINI_GAME_REWARDS_VIA_APPS_SCRIPT = true;

// Leave blank if you do not have a deployed secure backend endpoint.
window.MCS_AI_FEEDBACK_ENDPOINT = '';
// Optional secure endpoint for AI-assisted error checking. Leave blank to use the improved local checker.
window.MCS_AI_CHECKER_ENDPOINT = '';
window.MCS_AI_CHECKER_ENABLED = true;
window.MCS_RUBRIC_IMAGE_IMPORT_ENABLED = true;
window.MCS_RUBRIC_IMAGE_ENDPOINT = '';


// Optional, free Google Drive direct-upload setup for the Lesson Viewer.
// Create a Web OAuth Client ID in Google Cloud Console, enable Google Drive API,
// and paste the client ID below. No billing account or card is required.
window.MCS_GOOGLE_DRIVE_CLIENT_ID = '485615856896-dt2spv7cp7ccop2347qktcb3l17ne8ml.apps.googleusercontent.com';


// Secure Apps Script Web App URL for password reset, Smart Review, and hybrid Mini-Game XP claims.
// Keep the deployed /exec URL here after updating the supplied Apps Script.
// If blank, Mini-Game XP safely falls back to the legacy Firestore path during rollout.
window.MCS_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwA7YTR1SmZHk17XfJ4f4jfR63SdZejxCm10R6uHFD98vQyuB5NsJkBSjRj70GQ6qoN/exec';
