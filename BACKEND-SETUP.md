# BloodBridge backend setup

The site is hosted on Vercel. Supabase provides Google/email authentication and the shared Postgres data API. The browser only receives the public Supabase URL and anon key; database row policies protect user data.

## 1. Create the Supabase database

Create a Supabase project, then open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). The script creates user profiles, blood bank listings, blood requests, notifications, and donation history with row-level security. It intentionally seeds example blood bank records; replace those with verified information before relying on them.

## 2. Enable Google sign-in

In Supabase, open **Authentication → Providers → Google** and enable Google. Create a Google OAuth web client and add the Supabase callback URL shown in the provider settings to Google's **Authorized redirect URIs**. Copy the Google client ID and secret into the Supabase Google provider settings; do not put the Google secret in the website or GitHub.

In **Authentication → URL Configuration**, set the Site URL to:

```text
https://bloodbridge-seven.vercel.app
```

Add these redirect URLs:

```text
https://bloodbridge-seven.vercel.app/**
http://localhost:5173/**
```

## 3. Connect Vercel

In the BloodBridge Vercel project, add the following variables to Production, Preview, and Development, using the values from Supabase **Project Settings → API**:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The anon key is intended for browser use and is limited by the database policies in `supabase/schema.sql`. Never add the `service_role` key to a `VITE_` variable or commit secrets to GitHub. Redeploy after saving the variables.

For local development, copy `.env.example` to `.env.local` and fill the same two public values. Add the localhost redirect URL in Supabase.

## Connected features

- Google sign-in and email/password registration/login
- Shared donor profile and availability status
- Blood bank search, details, and availability totals
- Shared public request summaries; patient name, contact number, and additional information are not selectable by public clients
- User-specific notification list and mark-as-read action
- User-specific donation history

The app keeps its browser-only preview mode when the Supabase variables are absent. In that mode, Google sign-in is disabled and changes do not sync between browsers. The seeded blood bank contact information and stock values are examples, not verified live data. Requests are user-submitted and unverified; contact the hospital or blood bank to confirm details.
