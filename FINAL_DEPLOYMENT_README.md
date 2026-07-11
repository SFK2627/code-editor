# Final Deployment Readme — Overall 100-Readiness Build

1. Upload or replace the repository root files.
2. Keep Firebase on Spark/no billing.
3. Publish `firestore.rules` in Firebase Console.
4. Enable Email/Password Authentication.
5. Run `npm run check` locally before committing if Node.js is available.
6. After upload, hard refresh the website.
7. On phones, close and reopen the installed PWA.
8. Open the browser console once and run:

```js
window.MCS_RUN_OVERALL_READINESS_CHECK()
```

If every runtime check passes, the deployment is ready for classroom pilot testing.
