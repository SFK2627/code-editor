# Free Student Accounts — Quick Teacher Guide

## Student Login

- Username: the exact Student ID registered by the teacher
- First password: `123456`
- First-login action: create a different password with at least 6 characters

## Manual Registration

In Admin, enter:

- Student ID
- Full Name
- Gender
- Section

Then click **Add Student Account**.

## Excel / CSV Registration

Use one row per learner with these columns:

| Student ID | Name | Gender | Section |
|---|---|---|---|
| 2026-001 | Juan Dela Cruz | Male | Grade 8 - Rizal |

The Admin import screen checks:

- missing ID;
- missing name;
- missing section;
- duplicate ID in the file;
- an ID already registered in the tracker.

Only valid rows are created.

## Tracker Meaning

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

This no-server version can create new accounts, but it does not include an in-app teacher password-reset tool. If a student forgets a changed password, manage that user from Firebase Authentication Console. This avoids Cloud Functions and paid backend requirements.
