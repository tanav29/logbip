# LogBip — MVP Plan

## Goal

Build a simple learning-in-public app where authenticated users create learning paths, log daily progress, and share a public progress page.

## MVP scope

1. **Authentication**
   - Add email/password sign-up, sign-in, sign-out, and protected dashboard access.
2. **Learning paths**
   - Create, edit, and list multiple paths with a title, description, unique slug, and public/private status.
3. **Daily logs**
   - Add a dated progress entry with content and an optional note.
   - Prevent duplicate entries for the same path and date unless the user edits the existing entry.
4. **Dashboard**
   - Show the user’s paths, current streak, longest streak, recent activity, and a calendar heatmap.
5. **Public sharing**
   - Render each public path at `/<slug>` without requiring login.
   - Show path details, entries, streak statistics, and a share/copy-link action.
6. **Quality and delivery**
   - Validate forms and authorization on the server.
   - Add empty, loading, error, and not-found states.
   - Update the README with setup, database, deployment, live URL, and demo notes.

## Data model

Use the existing Drizzle/libSQL database with `users`, `paths`, and `entries`. Add session storage/handling and database indexes/constraints needed for secure lookups and one entry per path/date.

## Implementation order

1. Finalize auth and session middleware.
2. Complete database constraints and migrations.
3. Build path and log server actions/API routes.
4. Build dashboard and public path pages.
5. Calculate streaks/heatmap from stored dates and test edge cases.
6. Polish responsive UI, run lint/build checks, deploy, and record the walkthrough.

## Acceptance criteria

- A new user can register, create multiple paths, and add daily logs.
- Streak and heatmap values are correct across gaps, consecutive days, and timezone-safe dates.
- A public slug works when logged out and exposes only public path data.
- Users cannot read or modify another user’s private paths or logs.
- The app is deployed with a working URL and documented setup.

## Deferred ideas

X profiles, avatars, leaderboard, badges, quotes, analytics, and share cards are post-MVP enhancements.
