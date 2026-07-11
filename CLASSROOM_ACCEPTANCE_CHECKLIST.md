# Classroom Acceptance Checklist

Use this checklist before calling the build final for live class use.

## Teacher setup

- [ ] Firebase Email/Password sign-in is enabled.
- [ ] Teacher account exists and matches `sirjr.mcsian@gmail.com` or the email is updated in both `firebase-config.js` and `firestore.rules`.
- [ ] `firestore.rules` is published in Firebase Console.
- [ ] Website files are uploaded to the repository root.
- [ ] Browser hard refresh completed after deploy.
- [ ] Installed phone PWA closed and reopened after deploy.

## Student account tests

- [ ] Add one student manually.
- [ ] Student logs in with Student ID and `123456`.
- [ ] Student is forced to change password.
- [ ] Student reaches My Projects dashboard.
- [ ] Student creates a project.
- [ ] Student edits HTML, CSS, and JavaScript.
- [ ] Student refreshes the page and project continues correctly.
- [ ] Student logs out and logs back in successfully.

## Save and recovery tests

- [ ] Autosave shows Saving then Saved.
- [ ] Manual save works when autosave is disabled by teacher.
- [ ] Offline banner appears when internet is disabled.
- [ ] Offline edits are protected locally.
- [ ] Reconnect triggers save retry.
- [ ] Browser close with unsaved work creates a recovery prompt.
- [ ] ZIP export downloads correct files.

## Mobile tests

- [ ] Android Chrome portrait works.
- [ ] Android Chrome landscape works.
- [ ] Installed Android PWA works.
- [ ] iPhone Safari works.
- [ ] iPhone Add to Home Screen works.
- [ ] Full Editor opens and exits.
- [ ] Preview fullscreen opens and exits.
- [ ] Buttons are visible and not covered by browser bars.

## Teacher tracker tests

- [ ] Import CSV class list.
- [ ] Invalid rows show readable warnings.
- [ ] Student appears in tracker after login.
- [ ] Project count updates after save.
- [ ] Teacher can view student project details.
- [ ] Section filter works.
- [ ] Activity/status filters work.

## Collaboration tests

- [ ] Host shares a project.
- [ ] Second student joins using code.
- [ ] Member appears in online list.
- [ ] Edits sync only when collaboration editing is allowed.
- [ ] Host can disable editing.
- [ ] Host can end the session.
- [ ] Non-host cannot manage the whole session.

## Load test target

- [ ] 10 students login and create projects.
- [ ] 20 students save within the same class period.
- [ ] 30+ students can use the app without UI lockups.
- [ ] Firestore free quota is monitored during testing.

## Final acceptance

Mark the build as classroom-final only after all major tests pass on actual devices and the school network.
