# Rubric Picture Import Setup

This app includes a Teacher/Admin feature: **Upload Rubric Picture / Screenshot**.

The button is visible inside **Teacher/Admin > Admin Rubric Table Builder** after the teacher logs in.

## How it works

1. Teacher uploads a rubric picture.
2. The web app sends the image to a secure Firebase Function.
3. The function reads the image and returns structured rubric data:
   - Activity title
   - Instructions
   - Passing score
   - Criteria rows
   - Excellent / Good / Fair / Needs Improvement points and descriptions
   - Auto-check rules
4. The app fills the table.
5. Teacher reviews and clicks **Save Activity**.

## Why a Firebase Function is needed

Do not put AI/API keys in GitHub Pages. The browser frontend is public. Put the key in Firebase Functions secrets.

## Deploy steps

Install Firebase CLI, then inside this project folder:

```bash
firebase login
firebase init functions
```

When asked, use JavaScript and Node.js. You can keep/replace the generated functions folder with the included `functions` folder.

Set the secret:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

Deploy:

```bash
firebase deploy --only functions
```

After deployment, copy the HTTPS URL for `rubricImageImport` and paste it into `firebase-config.js`:

```js
window.MCS_RUBRIC_IMAGE_ENDPOINT = 'https://YOUR_FUNCTION_URL/rubricImageImport';
```

Then upload updated files to GitHub Pages.
