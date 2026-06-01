# CLAUDE.md — Torin Gunnell Digital

> Project context for Claude Code. Read this fully before writing any code.
> This file defines the goal, stack, conventions, and guardrails for the build.

---

## 1. What we're building

A premium wedding cinematography portfolio site for **Torin Gunnell Digital (TGD)** — a hand-coded, fast, editorial static site that positions Torin for **higher-budget destination and southern-Ontario weddings**, not just the Thunder Bay local market.

**Quality bar:** match the tier of top destination-wedding studios (clean semantic markup, full-bleed cinematic media, hover-to-play film previews, generous negative space, restrained motion). The goal is "worth flying in," not "convenient local option."

**This is an original site.** Use TGD's own brand, voice, venues, and footage. Do **not** copy any other studio's copy, names, identity, photos, or CSS. Reference sites are calibration for *quality and structure only*.

**Who's building it:** Torin is a non-traditional developer who builds production software via Claude Code without a traditional programming background. Explain commands and decisions plainly. Prefer small, reviewable commits over big sweeping ones. When something needs his action outside the editor (DNS, Vimeo upload, R2 bucket), say so explicitly with steps.

---

## 2. Stack & infrastructure

| Concern | Tool | Notes |
|---|---|---|
| Source / version control | **GitHub** | Single repo, this file at root. Small commits. |
| Hosting | **Render** (Static Site) | Auto-deploys on push to `main`. Build from repo. |
| Domain | **toringunnelldigital.com** | Currently on Wix. Migrating — see §3. |
| Full films | **Vimeo** | Embedded players. Films live on Vimeo, never in repo. |
| Images + hover clips | **Cloudflare R2** | Object storage, zero egress, served via CDN. Never in repo. |
| Search / verification | **Google Search Console** | Keep verification meta tag; submit sitemap post-launch. |
| Contact form | **Formspree or Basin** | Form posts to their endpoint; emails Torin. No backend needed. |

**Hard rule: no media files in Git.** No `.mp4`, no wedding photos. GitHub caps files at 100MB and chokes well before that, and the repo must stay light. Images and hover clips go to R2 and are referenced by URL. Full films go to Vimeo and are embedded. The repo holds only code and tiny static assets (logo SVG, favicons).

---

## 3. SEO migration rules (CRITICAL — we're moving off Wix)

The existing site has Thunder Bay SEO worth preserving as a free byproduct. Rankings live in the **domain, content, and backlinks** — not in Wix — so they transfer if we don't fumble the cutover. Follow these exactly:

1. **Keep the same domain.** Domain authority and backlinks carry over automatically.
2. **Match URLs, or 301-redirect old → new.** Inventory current ranking URLs from Search Console first. For every page that ranks, the new site has a page at the **same path** with the **same `<title>`, meta description, and `<h1>`/heading structure** and substantially the same core copy. Any path that changes gets a 301 in Render's `_redirects` file. **Never let an old ranking URL return a 404** — that is the one thing that actually kills rankings.
3. **Staging is `noindex`.** While the site lives on the temporary `*.onrender.com` URL, block indexing (robots `noindex`) so Google doesn't see a duplicate.
4. **Remove `noindex` at launch.** The instant the domain points to Render, strip the `noindex`. Forgetting this deindexes the whole site — it's the most common self-inflicted disaster. Make this a launch-checklist line item.
5. **Keep the Google verification meta tag** in `<head>` so Search Console stays connected.
6. **Submit `sitemap.xml`** in Search Console after cutover and request indexing on key pages.
7. Expect a small ranking wobble for 2–4 weeks; it settles if steps 2 and 3 were clean.

---

## 4. Site structure (information architecture)

Mirror this IA (the reference's structure, as TGD's own):

```
/                       Home — hero film, intro, featured portfolio, brand statement, about teaser, footer CTA
/wedding-films/         Full portfolio grid (all films, asymmetric layout, venue under each)
/films/{slug}/          Individual film page — Vimeo embed + short story + stills
/investment/            Pricing as "investment, starting at" — pre-qualifies, destination framing
/who-we-are/            Torin's story (solo filmmaker; Thunder Bay roots; films anywhere)
/contact/               Inquiry form (Formspree/Basin) + response expectations
/journal/               (Optional, later) blog for SEO + warmth
```

**Page intent notes:**
- **Home** opens with an autoplaying muted hero film (R2-hosted loop) behind a short, confident headline. Below: a few sentences of philosophy, a featured 3-up portfolio strip, a full-bleed mid-page film section, a brief about teaser, and a closing CTA.
- **Investment** is not a feature/price table. It's "starting at" framing that signals tier and pre-qualifies. Include destination/travel framing so a flown-in premium reads as intentional, not a surcharge.
- **Film pages** lead with the Vimeo player. Keep copy sparse. Name the venue prominently — the venue is the credential.
- **Contact** form must be wired and tested on staging *before* cutover so there's never a window where inquiries vanish.

---

## 5. Design system

A refined, editorial, warm-luxury direction. Commit to it consistently — restraint and precision over decoration. (This matches the header already built in `tgd-header.html`; keep everything cohesive with it.)

### Logo
- Primary mark: **TGD monogram**, inline SVG using `fill="currentColor"` so it inherits color per context (white in dark sections, ink in light). Files delivered: `TGD_logo.svg`, `TGD_logo_white.svg`, `TGD_logo_currentColor.svg`.
- Use the `currentColor` variant inline in the header/footer.

### Color tokens
```css
:root{
  --bg:        #f4efe7;          /* warm paper — primary background */
  --bg-deep:   #efe7da;          /* slightly deeper paper for gradients */
  --ink:       #1c1a17;          /* warm near-black — primary text */
  --ink-soft:  #6f6960;          /* muted text, captions, labels */
  --line:      rgba(28,26,23,.14);/* hairline borders */
  --accent:    #9a7b4f;          /* understated brass — hover, fine detail only */
  --dark:      #1c1a17;          /* dark sections / inverted blocks */
}
```
Dominant warm paper with sparing brass accent. Never let the accent get loud — it's a whisper, used on hover underlines and small detail.

### Typography
- **Display / headings:** Cormorant Garamond (400/500) — editorial, romantic, high-end.
- **UI / body / nav:** Jost (300/400/500) — clean geometric sans, wide letter-spacing for nav and labels.
- Load via Google Fonts with `preconnect`. Nav and eyebrow labels: uppercase, `letter-spacing: .2em–.28em`, small size. Headlines: large, tight line-height, generous size (`clamp()`).

### Motion (subtle, editorial)
- Header hides on scroll-down, reveals on scroll-up (already implemented in `tgd-header.html`).
- Fade/translate-in on scroll for sections and grid items (staggered).
- Hover: thumbnail swaps to a muted looping video; nav links grow a thin brass underline.
- No bounce, no flashy easing. Use `cubic-bezier(.4,0,.2,1)` and ~.35–.45s.
- Respect `prefers-reduced-motion`.

### Layout patterns
- **Header:** centered logo, nav split left/right, slim announcement bar, sticky + hide-on-scroll. Already built — reuse `tgd-header.html` as the starting component.
- **Portfolio grid:** asymmetric — mix row types (3-up, 2-up, 4-up) with some tiles larger than others, so it reads designed, not templated. Each tile: poster image + hover video + couple name + venue.
- **Media sections:** full-bleed image/video with overlaid headline and a light button.
- **Footer:** logo, explore links, "say hello", social, copyright. Closing full-bleed CTA above it.

---

## 6. Technical conventions

**Responsive images** — every photo uses `<picture>` with WebP + JPG fallbacks across widths (480/768/1024/1280/1600/1920), explicit `width`/`height` to prevent layout shift, and `sizes` matched to the layout slot. Hero/LCP image only: `loading="eager"` + `fetchpriority="high"`. Everything else: `loading="lazy"` + `decoding="async"`.

**Hover-video pattern** — poster `<picture>` plus a `<video muted loop playsinline preload="none">` whose source uses `data-src` (swapped to `src` by JS on hover/intersection) so clips don't download until needed. Clips are short, silent, compressed, R2-hosted.

**Full film embed (Vimeo)** — responsive iframe wrapper (padding-top aspect-ratio box). Use Vimeo player params to hide chrome and match brand. The full film is the only "heavy" playback and it streams from Vimeo, not us.

**Performance** — minify CSS/JS for production, `preconnect` to font + CDN hosts, keep the critical path tiny. Target fast LCP since couples bounce on slow galleries.

**Accessibility** — semantic landmarks (`header`/`nav`/`main`/`footer`), real `alt` text describing couple + venue, skip link, `aria-label`s on icon links, visible focus states, keyboard-operable nav.

**Browser storage** — n/a for a static marketing site; do not introduce localStorage dependencies.

---

## 7. Suggested repo structure

```
/CLAUDE.md
/index.html
/wedding-films/index.html
/films/<slug>/index.html        (one folder per film)
/investment/index.html
/who-we-are/index.html
/contact/index.html
/styles/style.css
/js/scripts.js
/images/                         (ONLY tiny static assets: logo, favicons, social.jpg)
/favicon-16.png  /favicon-32.png  /apple-touch-icon.png
/sitemap.xml
/robots.txt
/_redirects                      (Render 301 redirect map)
```
Reminder: wedding photos and clips are **not** in `/images/`. They live on R2 and are referenced by full CDN URL. `/images/` is only the logo, favicons, and the OG social-share image.

---

## 8. Media workflow (for Torin, outside the editor)

- **Full film →** upload to Vimeo → copy embed → paste into the film page. Done.
- **Hover clip / photo →** export small/compressed → upload to the R2 bucket → copy the file's URL → reference it in the HTML.
- **Never** drag a video into the repo. If a media file would be committed, stop and put it on R2/Vimeo instead.

---

## 9. Build order (milestones)

1. Scaffold repo, `CLAUDE.md`, design tokens, fonts, `robots.txt` (with staging `noindex`).
2. Header + footer components (start from `tgd-header.html`).
3. Home page (hero, intro, featured grid, mid-page film section, about teaser, CTA).
4. Portfolio grid page + one film-page template (`/films/<slug>/`).
5. Investment, Who We Are, Contact pages.
6. Wire the contact form (Formspree/Basin) and test it on staging.
7. Set up the R2 bucket; upload first clips/images; wire URLs. Add first Vimeo embeds.
8. Deploy to Render staging (`*.onrender.com`) with `noindex`. Test every page, link, form, mobile layout, load speed.
9. SEO prep: build `_redirects` from the Search Console URL inventory; write `sitemap.xml`; confirm titles/descriptions/headings match old pages; keep verification meta.
10. **Cutover:** point domain DNS to Render → **remove `noindex`** → submit sitemap + request indexing in Search Console. Watch rankings 2–4 weeks.

---

## 10. Guardrails recap

- No media in Git. Ever.
- Don't copy any other studio's copy, identity, photos, or CSS — TGD's own brand only.
- Don't change a ranking URL without a 301.
- Don't ship to the live domain with `noindex` still on.
- Keep commits small and explain anything that needs Torin's action outside the editor.
