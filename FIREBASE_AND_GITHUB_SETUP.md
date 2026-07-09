# Firebase + GitHub Setup for Grade 8 MCSian Web Code Editor

Firebase is already enabled in `firebase-config.js` using project ID `code-editor-f0f9d`.

## Firebase Console steps

1. Open Firebase Console.
2. Open the project `code-editor-f0f9d`.
3. Go to Build > Firestore Database.
4. Click Create database.
5. Choose Start in test mode for classroom testing only.
6. Choose a nearby location, then create.
7. Go to Rules and paste the contents of `firestore.rules`.
8. Publish rules.

## GitHub Pages steps

1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: main, folder: /root.
6. Save.
7. Wait for the GitHub Pages link.

## Important security note

The Teacher/Admin PIN is still client-side and not secure for a public app. For real deployment, upgrade next to Firebase Authentication and private admin rules.
