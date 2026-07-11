# Sir JR Coding App

A Grade 8 HTML, CSS, and JavaScript editor with optional student accounts, cloud-saved projects, rubric scoring, and teacher monitoring.

## Student Entry Screen

Every visit begins with two choices:

1. **Log In as Student** – opens the student's saved projects.
2. **Practice Without Login** – opens the full editor without permanent project saving.

Guest header:

> Sir Jr's Grade 8 MCSian Web Code Editor

Logged-in header:

> Sir JR Coding App · Hi, Name!

## Student Accounts

- Students log in with their registered **Student ID**.
- New accounts use the default password **123456**.
- The first login requires a new password before the dashboard opens.
- Student IDs are converted internally to private app-only Firebase Authentication email addresses. Students never need to know those email addresses.
- Each student can access only their own profile and project folder through Firestore rules.

## My Projects

Logged-in students can:

- create a named project;
- open and continue unfinished work;
- rename or delete projects;
- save HTML, CSS, JavaScript, pages, file names, selected activity, run count, and rubric result;
- see project status, last-edited time, run attempts, and score;
- return to **My Projects** from the editor.

Changes are automatically queued for cloud saving while a student project is open. Guest practice uses temporary browser-session storage and is not shown in the teacher tracker.

## Teacher/Admin Student Accounts & Tracker

The existing hidden Admin area now includes **Student Accounts & Tracker**.

The teacher can:

- add one student using Student ID, full name, gender, and section;
- import an `.xlsx`, `.xls`, or `.csv` class list;
- download an import template from the Admin page;
- preview valid and invalid rows before importing;
- filter students by section and login/activity status;
- see total students, students who logged in, total projects, and students active today;
- view each student's projects, run attempts, last activity, and saved score.

Accepted import headings include common versions of:

- Student ID
- Name
- Gender or Sex
- Section

A ready CSV example is included as `STUDENT_IMPORT_TEMPLATE.csv`.

## Student Assistance Controls

The Admin page still includes switches for:

- master student assistance;
- code suggestions;
- Code Helper and error hints;
- rubric feedback.

Local changes can be applied on the current browser. A signed-in teacher can publish the settings to all devices.

## Mobile Preview Behavior

Phone behavior remains separate from desktop behavior:

- Split, Stacked, and Big Preview are hidden on phones.
- Phones use **Desktop View / Phone View** and **Full Screen**.
- Landscape phone fullscreen fits the 1366 × 768 desktop output with the Exit button below.
- Desktop computers retain Split, Stacked, Big Preview, and normal desktop fullscreen.

## Free-Only Architecture

This project uses only:

- static GitHub Pages or Firebase Hosting files;
- Firebase Email/Password Authentication;
- Cloud Firestore within the project's no-cost quota.

It does **not** include Cloud Functions, Cloud Storage uploads, a paid server, or a Blaze-only backend. Keep the Firebase project on the **Spark** plan and do not attach a billing account.

When the no-cost Firestore quota is exhausted, cloud reads/writes can pause until the quota resets; this build does not automatically upgrade the project or create a charge.

## Required Setup

Read `FIREBASE_AND_GITHUB_SETUP.md` and `FREE_STUDENT_ACCOUNTS_SETUP.md` before uploading.

The most important steps are:

1. Enable Firebase **Email/Password** sign-in.
2. Confirm the teacher account is `sirjr.mcsian@gmail.com`, or change it in both `firebase-config.js` and `firestore.rules`.
3. Publish the included `firestore.rules`.
4. Upload the updated frontend files.
5. Keep the project on Spark/no billing.

## Main Files

- `index.html` – entry screen, student login/dashboard, editor, and Admin UI
- `style.css` – responsive desktop/mobile/account/dashboard styles
- `script.js` – editor logic, student accounts, projects, autosave, Excel/CSV import, and tracker
- `firebase-config.js` – Firebase frontend project settings and allowed teacher email
- `firestore.rules` – teacher/student data access rules
- `service-worker.js` – updated offline cache
- `manifest.webmanifest` – installable app information

## Keyboard Shortcuts

- `Ctrl + S` – save locally / queue project save
- `Ctrl + Enter` – run code
- `Ctrl + Shift + Enter` – check result
- `Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3` – switch HTML/CSS/JavaScript
- `Ctrl + Shift + F` – full editor
- `Esc` – exit fullscreen/editor overlays
