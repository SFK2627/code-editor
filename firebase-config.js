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


# AI Feedback Setup

The website can show rubric-based feedback locally even without a paid AI endpoint. For real rubric feedback, deploy a secure backend/Firebase Function and paste its HTTPS URL in `firebase-config.js`:

```js
window.MCS_AI_FEEDBACK_ENDPOINT = 'https://YOUR_FUNCTION_URL/aiReview';
```

Never put AI API keys in `index.html`, `script.js`, or `firebase-config.js` because GitHub Pages is public.

A sample Firebase Function is included in the `functions/` folder. Set your feedback provider key as a server environment variable, then deploy the function.

## Real Rubric Review with Firebase Functions

The app already has an Rubric Review panel. Without a deployed AI endpoint, it uses a local smart review based on the rubric and error checker.

To enable real rubric feedback:

1. Install Firebase CLI if you have not installed it yet.
2. Login:

```bash
firebase login
```

3. Set the project:

```bash
firebase use code-editor-f0f9d
```

4. Install function dependencies:

```bash
cd functions
npm install
cd ..
```

5. Set the AI API key as a Firebase Functions parameter. Do not put this key in frontend files.

The included function uses a Firebase Secret named `OPENAI_API_KEY`. Run this once before deploying:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

When prompted, paste your AI API key.

Optional model parameter: `OPENAI_MODEL` defaults to `gpt-4o-mini`. You may keep the default.

6. Deploy the function:

```bash
firebase deploy --only functions
```

7. Copy the deployed `aiReview` HTTPS URL from the terminal.

8. Open `firebase-config.js` and paste the URL:

```js
window.MCS_AI_FEEDBACK_ENDPOINT = 'https://YOUR_FUNCTION_URL/aiReview';
```

9. Upload the updated files to GitHub again.

Important: Firebase Functions may require billing depending on your Firebase project setup and region. If you are not ready for billing, keep `MCS_AI_FEEDBACK_ENDPOINT` blank; the local smart review will still work.

## Fix: "Firebase is not ready" during Teacher Login

If Teacher/Admin login says **Firebase is not ready**, check these first:

1. Make sure these files are uploaded to GitHub root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `firebase-config.js`

2. Open this in browser to confirm the config file exists:
   `https://sfk2627.github.io/code-editor/firebase-config.js`

3. In Firebase Console, enable:
   Authentication > Sign-in method > Email/Password

4. In Firebase Console, add your teacher accounts:
   Authentication > Users > Add user

5. In Firebase Console, add the authorized domain:
   Authentication > Settings > Authorized domains > Add domain:
   `sfk2627.github.io`

This latest version also includes a built-in Firebase fallback config inside `script.js`, so login can still work even if `firebase-config.js` was cached or missing.
