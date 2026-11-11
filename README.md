# Protocol Golf Lab

A test-lab sheet for golf gear. Version 1 covers hitting mats and launch monitors: published specs, the price on the source page, the day that page was read, and a 3-year cost. Lab scores are not issued yet. The badge says so.

The owner is a test engineer. The sheet is not an owner survey. Yardstick Golf, SimCosts, Golf Sim Caddie, and MyGolfSpy are other sites in this space. Their numbers are not copied here.

Three-year cost is the checked price plus three years of a subscription only when the maker says that subscription is required and publishes the annual price. Optional plans are shown next to the figure and are not added in.

## Stack

Next.js on Cloudflare Workers via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), with [D1](https://developers.cloudflare.com/d1/) as the only database. Cloudflare's free plan allows commercial use. This project does not target Vercel.

Cloudflare's current default for a brand-new Next.js Worker is [vinext](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). This repo uses OpenNext so the project keeps a Wrangler config, `wrangler d1` migrations, and `wrangler dev` against a local D1. Workers Builds' default deploy command is `npx wrangler deploy`, which reads that config.

## Local

```bash
npm install
cp .dev.vars.example .dev.vars
# Put a long random ADMIN_TOKEN in .dev.vars. Do not commit that file.

npm run db:migrate:local
npm run db:seed:local
npx opennextjs-cloudflare build
npx wrangler dev
```

`wrangler dev` serves the built Worker, with the local D1, at http://127.0.0.1:8787.

`npm run dev` is the Next.js dev server. It calls `initOpenNextCloudflareForDev()` so server code can see the same local D1 binding. Use `wrangler dev` when you want the Workers runtime.

Admin routes reject any request that does not send `Authorization: Bearer <ADMIN_TOKEN>`.

```bash
curl -i http://127.0.0.1:8787/api/admin/stats
curl -i -H "Authorization: Bearer $ADMIN_TOKEN" http://127.0.0.1:8787/api/admin/stats
```

`npm run check` validates the catalog (30+ sourced products, 3-year math) and the email block list.

## Deploy

The D1 id in `wrangler.jsonc` is a placeholder: `00000000-0000-0000-0000-000000000000`. Replace it before a remote migration or deploy. `database_name` stays `protocol-golf-lab`. The Worker `name` stays `protocol-golf-lab` so it matches the dashboard project.

1. Create the database.

```bash
npx wrangler login
npx wrangler d1 create protocol-golf-lab
```

2. Copy the printed `database_id` into `d1_databases[0].database_id` in `wrangler.jsonc`.

3. Set the public site URL in `vars.SITE_URL` to the real `https://protocol-golf-lab.<account>.workers.dev` host, or your custom domain. That value is used for canonical URLs, the sitemap, and Open Graph. It is not a secret.

4. Apply migrations to the remote database.

```bash
npm run db:migrate:remote
```

5. Seed the remote database. This replaces catalog rows and the open sponsor slot. It does not delete signups, reports, pageviews, or inquiries.

```bash
npm run db:seed:remote
```

6. Set secrets. Wrangler prompts for the value so it is not stored in the shell history as an argument if you paste it at the prompt.

```bash
npx wrangler secret put ADMIN_TOKEN
```

Resend is optional. Signups are stored in D1 either way. A contact is sent to Resend only when both secrets are present. Resend renamed audiences to segments in November 2025. Put the segment id in `RESEND_AUDIENCE_ID`. The app calls `POST https://api.resend.com/contacts` with that id in `segments`. If either secret is missing, the sync is skipped.

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_AUDIENCE_ID
```

7. Deploy.

```bash
npm run deploy
```

That runs `opennextjs-cloudflare build` and then `opennextjs-cloudflare deploy` (Wrangler under the adapter).

## Connect the GitHub repo for automatic builds

Workers Builds deploys when the production branch moves. Do this after the first manual deploy so the Worker `protocol-golf-lab` already exists and its name matches `wrangler.jsonc`.

1. In the Cloudflare dashboard, open **Workers & Pages**.
2. Open the Worker **protocol-golf-lab**.
3. Go to **Settings**, then **Builds**.
4. Choose **Connect** and authorize GitHub.
5. Select this repository. Set the production branch to `main`.
6. Set the build command to:

```bash
npx opennextjs-cloudflare build
```

7. Set the deploy command to:

```bash
npx wrangler deploy
```

The default deploy command is already `npx wrangler deploy`. The build command has to be the OpenNext build. `npm run build` only runs `next build` and does not produce `.open-next/worker.js`.

8. Leave D1 migrations and the seed as manual steps. A git push should not re-seed production.
9. Confirm the Worker name in the dashboard is `protocol-golf-lab`. A mismatch fails the build.
10. Push to `main` and confirm the build log.

Build variables, if you add any `NEXT_PUBLIC_` values later, are set under **Settings > Builds > Build variables and secrets**. `ADMIN_TOKEN` and the Resend keys are Worker secrets from `wrangler secret put`, not build variables.

Non-production branch builds use the preview command. The default is `npx wrangler preview`. Preview URLs are public until you add access controls.

## Data model

Tables: `categories`, `entries`, `submissions`, `owner_reports`, `signups`, `zero_result_searches`, `pageviews`, `sponsor_weeks`, `sponsor_clicks`, `sponsor_inquiries`, `errors`.

`categories.spec_schema` describes the columns and filters for that category. Mats and launch monitors are the only seeded categories. A later category (clubs, balls, shafts, grips, training aids) is a new category row plus entries whose `specs` JSON matches that schema. Gear submissions do not become entries on approve.

Every outbound link on the site is `/go/[slug]`. The handler logs the click in `sponsor_clicks`, then redirects. The seeded sponsor points at `/sponsors` so the bar is an open slot, not a fake brand.

## Admin API

Header: `Authorization: Bearer $ADMIN_TOKEN`. Missing or wrong token is `401`. If `ADMIN_TOKEN` is unset, every admin call is rejected.

| Method | Path | |
| --- | --- | --- |
| GET | `/api/admin/queue` | Pending gear submissions and owner reports |
| POST | `/api/admin/approve` | `{ "type": "submission" \| "owner_report", "id", "decision": "approve" \| "reject", "note"?, "entry_id"? }` |
| GET | `/api/admin/stats` | Signups, pageviews, clicks, queue depth |
| GET | `/api/admin/searches` | Zero-result searches |
| GET | `/api/admin/sponsors` | Sponsor weeks and click counts |
| POST | `/api/admin/sponsors` | `{ slug, name, tagline, url, starts_on, ends_on, active? }` |

Approving a gear submission only changes its status. It does not publish an entry. Approving an owner report makes it visible on the gear page when `entry_id` is set.

## What is real, and what is not

The seed is 19 hitting mats and 13 launch monitors. Prices were read from the maker's Shopify product JSON, or from the product HTML when that JSON was not available, on 2026-11-11. A field that was not on that source is null and renders as a dash. GSPro compatibility is taken from GSPro's own supported-monitor page, not from a guess that a similar model works.

Not done, on purpose:

- Lab scores. The badge is the whole feature.
- No owner reports are seeded. The queue starts empty.
- The sponsor row is the lab's open slot, not a paid sponsor.
- Outbound links are the source pages. They are not tagged with an affiliate id yet. Replace the `href` in the catalog and re-seed, or update the `links` JSON, and `/go` keeps logging the click.
- Resend sync no-ops until both secrets are set. A failed sync still keeps the signup.
- Formal test protocols are not written. `/how-we-test` says what they will be.
