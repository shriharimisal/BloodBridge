# BloodBridge

BloodBridge is a small React demo for finding blood banks, viewing sample stock, posting requests, and managing a donor profile.

## Run locally

Requirements: Node.js 22 or newer and pnpm 11.

```sh
pnpm install
pnpm dev
```

Create a demo account from **Become a Donor**. Demo accounts, requests, profile edits, availability, and read notifications are saved in this browser's local storage. Use the same browser to sign in again. Clear the site's local storage to reset the demo.

## Build and preview

```sh
pnpm build
pnpm preview
```

## Publish on GitHub Pages

Push this folder to a GitHub repository and enable **Settings → Pages → GitHub Actions**. The included workflow builds the app and publishes it. The app uses hash-based routes so nested pages also work on static hosting.

## Demo limitations

This is a front-end demonstration, not a live blood service. All blood bank names, phone numbers, distances, stock, requests, donor history, and notifications are sample data. Browser-local demo authentication is not secure and does not work across devices. There is no API, database, email/SMS delivery, OAuth sign-in, or emergency dispatch. Connect a properly secured backend and verified blood-bank data before using this for real people. In an emergency, contact a hospital or local emergency services.
