# Torin Gunnell Digital — website

A hand-coded, fast, editorial static site for **Torin Gunnell Digital (TGD)**.
See [`CLAUDE.md`](./CLAUDE.md) for the full project brief, design system, and
guardrails. This README is the practical "how it works + what's left" companion.

## Stack
- **Plain static HTML/CSS/JS** — no build step. What's in the repo is what ships.
- **Hosting:** Render (Static Site), auto-deploys on push to `main`.
- **Media:** photos + hover clips on **Cloudflare R2**; full films on **Vimeo**.
  No media lives in this repo (enforced by `.gitignore`).

## Project structure
```
/index.html                 Home
/wedding-films/index.html    Portfolio grid
/films/template-film/        Film-page TEMPLATE — duplicate per film
/investment/index.html       Pricing ("starting at" framing)
/who-we-are/index.html       Torin's story
/contact/index.html          Enquiry form
/styles/style.css            All styles (design tokens at the top)
/js/scripts.js               Header, menu, reveals, lazy video, year
/robots.txt  /sitemap.xml  /_redirects
```

## Working locally
It's just files — open `index.html` in a browser, or run any static server from
the repo root, e.g. `python3 -m http.server 8000` then visit
`http://localhost:8000`. (Clean URLs like `/contact/` resolve via each folder's
`index.html`, exactly as Render serves them.)

## Adding a film
1. Copy `films/template-film/` to `films/<slug>/` (e.g. `films/jane-sam/`).
2. In that new `index.html`, fill in the title, description, **canonical URL**,
   couple name, venue, the **Vimeo embed** (replace `VIMEO_ID`), the short story,
   and the stills (R2 URLs).
3. Add a card linking to it on the home page and `/wedding-films/`.
4. Add a `<url>` entry to `sitemap.xml`.

---

## ✅ Things only Torin can do (outside the editor)

These are wired up in the code with clear `TODO` markers — they need real values:

1. **Cloudflare R2** — create the bucket and a public custom domain. The code
   currently points media at `https://media.toringunnelldigital.com/...`. Either
   set R2's custom domain to that, or tell me the real domain and I'll swap it.
   Then upload posters/clips using the paths referenced in the HTML.
2. **Vimeo** — upload each full film, then paste its ID into the film page
   (`player.vimeo.com/video/VIMEO_ID`).
3. **Contact form** — create a Formspree (or Basin) form and replace `FORM_ID`
   in `/contact/index.html`. **Test a real submission on staging.**
4. **Favicons + social image** — add `favicon-16.png`, `favicon-32.png`,
   `apple-touch-icon.png`, and `images/social.jpg` (these are allow-listed in
   `.gitignore`).
5. **Logo** — the header/footer currently use a styled "TGD" text wordmark as a
   placeholder. Drop in the real `TGD_logo.svg` (currentColor variant) when ready.
6. **Social links** — replace the `#` placeholders with real Instagram/YouTube/
   Vimeo URLs.
7. **Google Search Console** — paste TGD's verification token into the commented
   meta tag in each page's `<head>` (or at least the home page).

---

## 🚦 Launch checklist (do these IN ORDER at cutover — CLAUDE.md §3, §9, §10)

1. Build `_redirects` from the Search Console URL inventory of the current Wix
   site. **Every old ranking URL must resolve — never 404.**
2. Confirm each page's `<title>`, meta description, and `<h1>` match the old
   ranking pages closely (preserves SEO).
3. Point the domain DNS to Render.
4. **Remove the `<meta name="robots" content="noindex, nofollow">` tag from
   every page's `<head>`.** (Currently present on all pages for staging.)
5. Swap `robots.txt` from the staging block to the production block (allow all +
   sitemap line). Both versions are in the file.
6. Submit `sitemap.xml` in Search Console and request indexing on key pages.
7. Watch rankings for 2–4 weeks; expect a small wobble that settles.
