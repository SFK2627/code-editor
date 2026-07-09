# Firebase + GitHub Setup

## 1. Firebase Authentication

1. Open Firebase Console.
2. Open your project: `code-editor-f0f9d`.
3. Go to **Build > Authentication**.
4. Click **Get started** if needed.
5. Open **Sign-in method**.
6. Enable **Email/Password**.
7. Go to **Users**.
8. Click **Add user**.
9. Add the teacher/admin email accounts and passwords you want to use. Any account listed in Firebase Authentication can login because the app has no sign-up form.

The app has no sign-up page, so only accounts you manually create in Firebase Authentication can log in.

## 2. Authorized Domain

Go to **Authentication > Settings > Authorized domains**.

Make sure this domain is included:

```txt
sfk2627.github.io
```

If login says the domain is unauthorized, add it there.

## 3. Firestore Rules

Go to **Firestore Database > Rules** and paste the contents of `firestore.rules`.

Then click **Publish**.

## 4. GitHub Pages

Upload all files to your GitHub repository root:

```txt
index.html
style.css
script.js
firebase-config.js
firestore.rules
firebase.json
README.md
FIREBASE_AND_GITHUB_SETUP.md
```

Your GitHub Pages URL is:

```txt
https://sfk2627.github.io/code-editor/
```

## 5. Test

1. Open the GitHub Pages link.
2. Click **Teacher/Admin**.
3. Login using any teacher/admin account you created in Firebase Authentication.
4. Edit or create an activity.
5. Click **Save Activity**.
6. Check Firestore Database > Data. The document `webCodeEditor/grade8-mcsian` should update.
