# BloodBridge

BloodBridge is a React app for finding blood banks, viewing blood availability, posting requests, and managing a donor profile. Vercel serves the web app. Supabase can provide shared authentication and database storage when configured.

## Run locally

Requirements: Node.js 22 or newer and pnpm 11.

```sh
pnpm install
pnpm dev
```

Without backend environment variables, the app runs in preview mode. Demo accounts, requests, profile edits, availability, and notifications are saved only in this browser's local storage. Google sign-in is disabled in preview mode.

## Connect the backend

Follow [BACKEND-SETUP.md](BACKEND-SETUP.md) to create a Supabase project, apply the database schema, configure Google sign-in, and add the public Supabase URL and anon key to Vercel. The backend is not live until those steps are completed. Never put a Supabase service-role key or Google client secret in the frontend or GitHub.

## Build and preview

```sh
pnpm build
pnpm preview
```

Run the service checks with `pnpm test`.

## Publish on GitHub Pages

Push this folder to a GitHub repository and enable **Settings → Pages → GitHub Actions**. The included workflow builds the app and publishes it. The app uses hash-based routes so nested pages also work on static hosting.

## Data and safety

All included blood bank names, phone numbers, distances, stock, requests, donor history, and notifications are sample data. Replace them with verified information before public use. Requests are user-submitted and unverified. The app does not provide medical advice, emergency dispatch, or email/SMS delivery. In an emergency, contact a hospital or local emergency services.
