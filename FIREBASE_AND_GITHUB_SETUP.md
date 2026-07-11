# Firebase + GitHub Setup — Free-Only Version

This version is designed for Firebase's **Spark/no-billing** setup. Do not deploy Cloud Functions and do not attach a billing account.

## 1. Confirm the Firebase Project

The included `firebase-config.js` currently points to:

- Project ID: `code-editor-f0f9d`
- Teacher email: `sirjr.mcsian@gmail.com`

If this is the correct project and teacher account, keep the file as-is.

If the teacher email is different, replace it in both:

1. `firebase-config.js`
2. `firestore.rules`

The two values must match exactly.

## 2. Enable Student and Teacher Login

In Firebase Console:

1. Open **Authentication**.
2. Open **Sign-in method**.
3. Enable **Email/Password**.
4. Under **Users**, make sure the teacher account exists.
5. Add your GitHub Pages/custom website domain under Authentication authorized domains when Firebase asks for it.

Do not enable phone/SMS login. Student IDs use normal Email/Password Authentication internally.

## 3. Publish Firestore Rules

1. Open **Firestore Database > Rules**.
2. Replace the existing rules with the complete contents of `firestore.rules`.
3. Click **Publish**.

The included rules allow:

- guests to read activities, rubrics, and assistance settings;
- the teacher account to manage all student profiles and inspect projects;
- each student to read their own profile and manage only their own projects;
- no student to open another student's project folder;
- only the live-session host can manage the whole collaboration session;
- other signed-in members can update their own presence and can edit shared code only when the host enables editing.

## 4. Upload the Website

Replace the deployed copies of:

- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`
- `firestore.rules`
- `service-worker.js`
- `manifest.webmanifest`
- `favicon.png`
- `STUDENT_IMPORT_TEMPLATE.csv`
- the complete `icons/` folder

For GitHub Pages, commit and push the files to the published branch.

For Firebase Hosting, the included `firebase.json` contains Hosting, cache/security headers, and Firestore rules only. It has no Functions configuration.

Recommended command:

```bash
firebase deploy --only hosting,firestore:rules
```

## 5. Clear the Old Cached App

After deployment:

1. Open the website.
2. Hard refresh the page.
3. On a phone, close and reopen the installed PWA/browser tab.
4. If the old screen remains, clear the site's cached data once.

The service-worker cache name has already been changed for this release.

## 6. Register Students

1. Open the hidden Admin area.
2. Log in with the teacher Firebase account.
3. Open **Student Accounts & Tracker**.
4. Add one student manually, or use **Import Excel / CSV**.
5. New accounts automatically use `123456`.
6. Students must replace that password on first login.

## 7. Keep It Free

- Keep the Firebase project on **Spark**.
- Do not link a billing account.
- Do not deploy the removed `functions/` folder.
- Do not add paid Google Cloud services.

This app uses only Authentication and Firestore for account/project data. If the free Firestore quota is reached, saves or tracker loading may temporarily stop instead of this project silently enabling paid usage.
