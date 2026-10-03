# Hoardly

React/Vite storefront, Express API, and Supabase Auth, Postgres, and Storage. Orders use cash on delivery.

## Functionality

- Account registration, login, password recovery, session refresh, profile and address management.
- Catalog search, categories, filtering, sorting, product details and purchase-verified reviews.
- Cart, wishlist, discount codes, checkout, order confirmation and order history.
- Role-protected administration for products, image uploads, categories, orders, discounts and store statistics.
- Optional order confirmation emails through Resend.

## Local Setup

Use Node.js 24. Install dependencies from the repository root:

```sh
npm run install:client
npm run install:server
```

Create private `client/.env` and `server/.env` files using their `.env.example` files. The root example is a combined reference; the two apps load their own files. Never put the Supabase service-role key in the client.

Run the SQL files in `database/migrations/` in numerical order through the Supabase SQL editor. Existing installations only need unapplied migrations. `005_cancelled_order_stock.sql` restores stock when an unshipped order is cancelled; it does not change historical orders. `database/seed.sql` is optional and intended for a fresh development database, not a live store.

Start the apps in separate terminals:

```sh
npm run dev:server
npm run dev:client
```

The storefront normally runs at `http://localhost:5173`; the API at `http://localhost:5000/api`. Create a normal account, then assign its `public.users.role` to `admin` through the Supabase SQL editor or table editor to grant administrator access. Customers cannot assign their own roles.

The local admin simulator is development-only and does not persist changes to Supabase. Production uses real accounts and data. The sample catalog fallback is disabled by default; `ALLOW_DEMO_CATALOG=true` enables it only for local database failures, never in production.

## Administrator Setup

The username `admin` is a server-side alias for `ADMIN_LOGIN_EMAIL`, which defaults to the demo address `admin@hoardly.example`. The account must authenticate with Supabase and have `public.users.role = 'admin'`; the username never bypasses authentication or grants permissions by itself. Administrators can manage the entire store, but do not receive Supabase project-owner credentials.

To provision this account against the configured Supabase project, set `ADMIN_INITIAL_PASSWORD` in a private process environment and run:

```sh
npm --prefix server run setup:admin
```

This creates the Auth user or resets the password of the account matching `ADMIN_LOGIN_EMAIL`, then assigns its store-admin role. Run it manually, not during deployment or on server startup. Clear `ADMIN_INITIAL_PASSWORD` afterward; never put it in source code, client variables, or build logs. Supabase password requirements still apply.

An account already provisioned in this Supabase project does not need to be recreated for Vercel. Set the same `ADMIN_LOGIN_EMAIL` on the API project. Sign out of any old local simulator session, then sign in with `admin` or the backing email. The reserved demo email cannot receive recovery messages; use an email you own and a strong unique password before using real customer data. Local simulators should use a different username, such as `local-admin`.

## Build

```sh
npm run build
npm run test
npm run lint
```

The build requires the client API and Supabase environment variables. No additional feature-by-feature tests are required.


Set these **API project** variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Exact storefront HTTPS origin, without a path |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role key |
| `ADMIN_LOGIN_EMAIL` | `admin@hoardly.example` for this demo, or your real admin email |
| `RESEND_API_KEY` | Resend key, if order emails are needed |
| `ORDER_CONFIRMATION_FROM` | Verified Resend sender, e.g. `Hoardly <orders@your-domain>` |

Set these **storefront project** variables:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | API HTTPS origin followed by `/api` |
| `VITE_SUPABASE_URL` | Same Supabase project URL as the API |
| `VITE_SUPABASE_ANON_KEY` | Same public anon key as the API |

Do not configure local simulator credentials on Vercel. `VITE_*` variables are public build-time values. Changing them requires rebuilding the storefront. Once the two project URLs are assigned, update `CLIENT_URL` and `VITE_API_URL`, then redeploy both projects. The API CORS policy allows only the configured storefront in production.

## Supabase and Email Setup

1. Apply SQL migrations, including the product image bucket and cancellation stock trigger.
2. Set the Supabase Auth Site URL to the storefront HTTPS URL. Add that URL and `/reset-password` to allowed redirect URLs. Add local URLs only to a development project.
3. Configure Supabase Auth SMTP for signup, recovery and email-change messages. Supabase auth emails and Resend order emails are separate services.
4. Configure a verified sender domain in Resend and the two API email variables when order emails are required. Email failures do not roll back an already-created order.
5. Use real product data and a real admin account in production; do not seed sample customers or grant public access to private tables.

## Backups and Release Notes

Enable the database backup option available for your Supabase plan in its dashboard, or schedule private logical exports with the Supabase CLI. Back up the `product-images` bucket separately: database backups include metadata, not image files. Keep exports outside this repository. See [Supabase backup guidance](https://supabase.com/docs/guides/platform/backups).

The installed React Router v6 dependency currently reports 2 moderate npm audit advisories; the suggested npm fix changes the router major version. This app uses client-side BrowserRouter, not SSR, and validates post-login redirect paths. A major upgrade is intentionally not included without approval; the dependency findings remain open.

After deployment, confirm the API health URL, refresh a product route, and complete one normal sign-in and shopping flow. Live domains, provider secrets, SMTP, backups, and actual publishing must be configured in the hosting/provider accounts; repository configuration does not perform those account changes.
