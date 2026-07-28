# LogBip

LogBip is a learning-in-public app: create focused paths, log progress by date, see streaks and activity, and share a public path URL.

## Local setup

Requires Node 20+ and Bun (or npm). Configure PostgreSQL plus Better Auth in `.env`:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="a-long-random-secret-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

For Google OAuth, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console. Add the equivalent HTTPS callback URL for production.

Then run:

```bash
bun install
bun run db:migrate
bun run dev
```

Open http://localhost:3000.

## Checks

```bash
bun run lint
bunx tsc --noEmit
bun run build
```

## Deployment

Deploy the Next.js app to Vercel or another Node-compatible host. Configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in the deployment environment, then run `bun run db:migrate` against the target database. No live deployment URL is configured in this repository yet.

## Demo walkthrough

1. Register an account.
2. Create a public path such as “Learn TypeScript”.
3. Add consecutive and non-consecutive entries to exercise streaks and the heatmap.
4. Open the public `/<slug>` URL while logged out.

5. Open **Settings** from the dashboard header to update your name, email, X handle, or avatar URL. The name and avatar are reflected on public path pages.

Private paths and all mutations use server-side session and ownership checks. Duplicate entries for a path/date are updated instead of duplicated.
