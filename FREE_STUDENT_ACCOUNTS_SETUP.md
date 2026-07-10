# Free Student Accounts — Quick Teacher Guide

## Why import no longer creates all Auth accounts at once

Firebase Authentication has a creation rate limit from the same IP address. To stay free-only and avoid the `Firebase temporarily limited account creation` message, the Admin import now saves **student records/roster only**.

The student's Firebase Auth account is created only when that student logs in for the first time with the default password.

## Student Login

- Username: the exact Student ID registered by the teacher
- First password: `123456`
- First-login action: create a different password with at least 6 characters

Flow:

1. Teacher imports or manually adds Student ID, Name, Gender, and Section.
2. Student opens the app and logs in with Student ID + `123456`.
3. The app activates that student's Firebase Auth account.
4. The student must change the password.
5. The student can now save projects and continue later.

## Manual Registration

In Admin, enter:

- Student ID
- Full Name
- Gender
- Section

Then click **Add Student Record**.

## Excel / CSV Registration

Use one row per learner with these columns:

| Student ID | Name | Gender | Section |
|---|---|---|---|
| 2026-001 | Dela Cruz, Juan Miguel | Male | Grade 8 - Rizal |

The Admin import screen checks:

- missing ID;
- missing name;
- missing section;
- duplicate ID in the file;
- an ID already registered in the tracker.

Only valid rows are imported as student records. No Firebase Auth account is created during import.

## Tracker Meaning

- **Ready for First Login** – the student record is imported, but the student has not activated the account yet.
- **Password Change Needed** – the student logged in with `123456` but has not changed the password yet.
- **Active** – the student changed the password successfully.
- **Logged In** – the student has successfully opened the account at least once.
- **Projects** – the number of saved projects.
- **Active Today** – the account logged in, ran code, edited, or saved a project today.
- **Last Activity** – latest recorded account/project activity.
- **View Projects** – project names, status, attempts, last edit, and latest rubric score.

## Guest Practice

A guest can use the editor and preview normally, but:

- there is no cloud project;
- the work does not appear in the tracker;
- it cannot be continued from another device;
- temporary code is cleared when a fresh browser session starts.

## Important Free-Only Limitation

This no-server version avoids Cloud Functions, Storage, and billing. Because it stays free-only, the app cannot bypass Firebase Authentication rate limits for many same-IP first logins. If hundreds of students activate accounts at the exact same time on the same school Wi-Fi, Firebase may still ask some of them to wait. The import itself should no longer hit that limit because it saves Firestore roster records only.

If a student forgets a changed password, manage that user from Firebase Authentication Console. This avoids Cloud Functions and paid backend requirements.
