# Firebase Auth + GitHub Setup

This version uses Firebase Authentication for the Teacher/Admin login.
The old visible/client-side PIN system has been removed.

## 1. Enable Firebase Authentication

1. Open Firebase Console.
2. Open project: `code-editor-f0f9d`.
3. Go to **Build > Authentication**.
4. Click **Get started** if needed.
5. Open **Sign-in method**.
6. Enable **Email/Password**.
7. Save.

## 2. Create the Teacher Account

Go to **Authentication > Users > Add user**.

Default teacher email used in this app and in `firestore.rules`:

```txt
sirjr.mcsian@gmail.com
```

Create that account with your chosen password.

If you want another email, change it in two files:

1. `firebase-config.js`
2. `firestore.rules`

## 3. Publish Firestore Rules

Go to **Firestore Database > Rules** and paste the content of `firestore.rules`.
Then click **Publish**.

## 4. Upload to GitHub

Upload these files to your GitHub repository root:

```txt
index.html
style.css
script.js
firebase-config.js
firebase.json
firestore.rules
README.md
FIREBASE_AND_GITHUB_SETUP.md
```

## 5. Test

1. Open the GitHub Pages link.
2. Click **Teacher/Admin**.
3. Login using the teacher email/password from Firebase Authentication.
4. Edit or create an activity.
5. Save.
6. Check Firebase Firestore if `webCodeEditor > grade8-mcsian` updates.
7. Open the site in another browser/device and check if the activity appears.

## Security

Students can read activities and create submissions.
Only the allowed teacher email can edit activities/rubrics and read/manage submissions.
