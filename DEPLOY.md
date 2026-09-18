# Deploying

The site is set up for **Netlify**, on the `tradevault` team, as the project
**walker-good-homes-hoyle-ing**:

- Dashboard: https://app.netlify.com/projects/walker-good-homes-hoyle-ing
- Live URL once deployed: https://walker-good-homes-hoyle-ing.netlify.app

`netlify.toml` holds the build config. Netlify detects Next.js and turns the
app's route handlers into functions, so `/api/enquiry`, `/api/visit` and the
buyer-area endpoints work as they do locally.

## Deploy it

Two ways. **Connect the repository** is the one to set up once and forget.

### Connect the repository (recommended)

In the dashboard: **Project configuration → Build & deploy → Link repository**,
pick `brickywalker-arch/Walkergoodhomes`, and set the production branch. Netlify
then builds on every push — no command to remember, and every branch gets a
deploy preview. Build settings come from `netlify.toml`, so leave them as they
are.

### One-off deploy from a checkout

From the repository root:

```shell
npx -y @netlify/mcp@latest --site-id 8315a967-b1a4-4c2c-a52c-6f2df343b659
```

This uploads the checkout and builds it on Netlify. Add `--no-wait` to return
without waiting for the build.

## Environment variables

Already set on the project:

| Key | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://walker-good-homes-hoyle-ing.netlify.app` | Canonical and Open Graph URLs |
| `LEAD_TO_EMAIL` | `walkergoodhomesltd@gmail.com` | Where enquiries go once email is switched on |

Set these under **Project configuration → Environment variables**. Change
`NEXT_PUBLIC_SITE_URL` when a custom domain is added.

### Where enquiries go

A function's filesystem does not survive a redeploy, so on Netlify each
enquiry and site-visit booking is written to **Netlify Blobs** — stores
`wgh-enquiries` and `wgh-visits`, one JSON record per enquiry, keyed by its
reference. Nothing is lost, and this needs no extra account or key.

Nobody is **notified**, though, until email is configured. To turn that on:

| Key | Value |
|---|---|
| `RESEND_API_KEY` | an API key from the Resend account |
| `LEAD_FROM_EMAIL` | an address at a **verified** Resend domain |

The from-address has to be at a domain verified in Resend. The account
currently has `tradevaultapp.co.uk` verified; sending Walker Good Homes
enquiries from it works, but the raw sender shows a TradeVault domain. Adding
`walkergoodhomes.co.uk` to Resend and its DNS records at the registrar is the
tidier option.

With email configured, an enquiry is considered captured if **either** the blob
write or the email succeeds. If both fail the endpoint answers 503 and the form
tells the visitor to email directly, rather than reporting "sent" over a lost
enquiry.

### Reserved-buyer area

`/buyers` stays closed until **both** of these are set, and says so on the page
rather than letting anyone in:

| Key | Value |
|---|---|
| `BUYER_ACCESS_CODE` | the code printed on the reservation agreement |
| `BUYER_SESSION_SECRET` | 32+ characters, e.g. `openssl rand -base64 48` |

Mark both as **secret** in the Netlify UI. Sign-in sets a 12-hour HMAC-signed
httpOnly cookie; the code is compared in constant time.

## Custom domain

**Domain management → Add a domain**, then point the registrar at Netlify.
Netlify issues the TLS certificate. Afterwards update
`NEXT_PUBLIC_SITE_URL` and redeploy so the canonical URLs and the sitemap
follow.

## Before the first public deploy

- [ ] Confirm bedroom 2's width with the architect — the approved copy quotes
      both 2.56 m and 3.93 m, and sheet 03 dimensions it at 3930 mm. Flagged in
      `src/data/interior.ts`.
- [ ] Decide the enquiry from-address (above), or accept that leads sit in
      Blobs unread.
- [ ] Check the visit slots in `src/data/development.ts` are dates you can
      actually host.
- [ ] Check the build status in `src/data/buyers.ts` and the timeline in
      `src/data/development.ts` still match the site.

## Checks

```shell
npm run check    # typecheck, lint, and asset coverage
npm run build    # the production build Netlify runs
```

`npm run check` includes `verify:assets`, which walks every finish selection a
visitor can make and asserts each resolves to a render that exists on disk.
