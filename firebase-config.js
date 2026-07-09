// Firebase setup for Grade 8 MCSian Web Code Editor
// Firebase is enabled using the Firebase project provided by Sir JR.
// Important: Firebase web config values are public identifiers.
// Real security is handled by Firebase Authentication and Firestore Rules.

window.MCS_FIREBASE_ENABLED = true;

window.MCS_FIREBASE_COLLECTION = 'webCodeEditor';
window.MCS_FIREBASE_DOCUMENT_ID = 'grade8-mcsian';
window.MCS_FIREBASE_SDK_VERSION = '10.12.5';

// Change this email if you will use a different teacher account in Firebase Authentication.
window.MCS_TEACHER_EMAILS = [
  'sirjr.mcsian@gmail.com'
];

window.MCS_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDuqBnvcIGbbUexKASjrWdinOqAQjnEQV0',
  authDomain: 'code-editor-f0f9d.firebaseapp.com',
  projectId: 'code-editor-f0f9d',
  storageBucket: 'code-editor-f0f9d.firebasestorage.app',
  messagingSenderId: '119616488399',
  appId: '1:119616488399:web:453b411fbf93a3b71e08ba'
};
