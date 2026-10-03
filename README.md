# Hoardly

Hoardly is a full-stack e-commerce application built with a React/Vite storefront, an Express API, and Supabase for authentication, database, and file storage. Orders use cash on delivery.

## Features

### Storefront

- Account registration, sign-in, password recovery, profile management, and saved addresses.
- Product search, categories, filters, sorting, product details, and purchase-verified reviews.
- Cart, wishlist, discount codes, checkout, order confirmation, and order history.

### Administration

- Role-protected management of products, product images, categories, orders, discounts, and store statistics.
- Server-side administrator role checks backed by Supabase Auth and the application database.

### Services

- Supabase Auth, Postgres, and Storage integration.
- Optional order confirmation emails through Resend.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Client | React, Vite, React Router, Tailwind CSS |
| API | Node.js, Express |
| Data and authentication | Supabase Auth, Postgres, Storage |
| Email | Resend (optional) |

## Local Development

### Requirements

- Node.js 24
- A Supabase project

### Install

Install the client and server dependencies from the repository root:

```sh
npm run install:client
npm run install:server
```

### Configure

Create private `client/.env` and `server/.env` files from their respective `.env.example` files. The root `.env.example` is only a combined reference.

Keep `SUPABASE_SERVICE_ROLE_KEY` in the server environment only. Never expose it through client variables or source code.

### Database

Run the SQL files in `database/migrations/` in numerical order through the Supabase SQL Editor. `database/seed.sql` is optional and intended for a fresh development database.

### Run

Start the API and storefront in separate terminals:

```sh
npm run dev:server
npm run dev:client
```

The storefront runs at `http://localhost:5173` and the API at `http://localhost:5000/api` by default.

## Administrator Access

The username `admin` is a server-side alias for `ADMIN_LOGIN_EMAIL`, which defaults to `admin@hoardly.example`. It still authenticates through Supabase and requires the application `admin` role; the alias does not bypass authentication or grant permissions on its own.

Provision or reset the configured administrator account by setting `ADMIN_INITIAL_PASSWORD` in a private process environment and running:

```sh
npm --prefix server run setup:admin
```

This command creates or updates the matching Supabase Auth account and assigns its store-admin role. Clear `ADMIN_INITIAL_PASSWORD` after use and keep it out of source code, client variables, and logs.

The local administrator simulator is development-only and does not persist changes to Supabase. Use a real account for normal application use.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev:client` | Start the Vite storefront |
| `npm run dev:server` | Start the Express API |
| `npm run build` | Build the storefront |
| `npm run test` | Run server tests |
| `npm run lint` | Run lint checks |
| `npm --prefix server run setup:admin` | Provision the configured administrator account |

## Project Structure

```text
client/       React storefront
server/       Express API
database/     Supabase migrations and optional seed data
```
