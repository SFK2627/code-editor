# Firebase and GitHub Setup

## GitHub Pages

Upload these frontend files to the repository root:

- `index.html`
- `style.css`
- `script.js`
- `firebase-config.js`
- `manifest.webmanifest`
- `service-worker.js`
- `icons/`

After replacing the files, refresh the deployed site once. The new service-worker cache name removes the older cached version automatically.

## Firebase Authentication

1. Open Firebase Console.
2. Go to **Authentication > Sign-in method**.
3. Enable **Email/Password**.
4. Go to **Authentication > Users** and create the teacher account.
5. Add the GitHub Pages domain under **Authentication > Settings > Authorized domains** when needed.

## Firestore

1. Open **Firestore Database > Rules**.
2. Copy the complete contents of `firestore.rules`.
3. Publish the rules.

Students can read activities and global assistance controls and can create submissions. Only a signed-in Firebase teacher can change activities, rubrics, or publish assistance controls to every student device.

## Student Assistance Controls

The hidden Admin panel allows local changes without login through **Apply on This Device**. To update every student device, sign in with the teacher account and press **Publish to All Students**. Open student pages receive the global change through Firestore live sync.

## Optional Firebase Functions

The optional secure feedback and rubric-image endpoints are inside `functions/`.

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Set provider secrets through Firebase CLI. Never place a private API key in frontend files.
