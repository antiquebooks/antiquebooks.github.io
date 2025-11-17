# AntiqueBooks — GitHub Pages Starter

This repository contains a static, production-start template for the "High-End Antique Book Store" technical specification you provided. It's designed to be deployed to GitHub Pages (https://antiquebooks.github.io/) as a static site without a build step.

What I created for you
- A lightweight static site layout with:
  - Homepage, Collection, Item detail, Shop, Cart, Checkout, About, Contact, and basic Account paths.
  - Client-side internationalization (EN / SK / DE) using JSON files.
  - A simple client-side cart (localStorage).
  - Data files for items and categories (`data/*.json`) so you can manage inventory in-place.
  - Hreflang links pointing to language versions (using query param approach for this static starter).
  - Minimal CSS for a clean, content-focused, high-end aesthetic inspired by your spec.
  - Guidance comments and placeholders where you should integrate payment gateway (Stripe/Shopify) or a Headless CMS in the future.

How to deploy to GitHub Pages
1. Create or use the repository named exactly `antiquebooks.github.io` under your GitHub account `antiquebooks`.
2. Commit all files at the repository root (`index.html`, `collection.html`, `item.html`, `shop.html`, etc.), plus the `assets`, `data`, and `i18n` folders.
3. Push to the default branch (usually `main` or `master`). GitHub Pages will serve from the root automatically.
4. Visit https://antiquebooks.github.io/

Notes on URLs and pretty routes
- This starter uses real files (collection.html, item.html) and query params (e.g., `item.html?id=baudelaire-1857`) to keep everything static and compatible with GitHub Pages.
- If you prefer pretty URLs like `/collection/old-prints/baudelaire-1857/`, consider:
  - Using a static site generator (Next.js with `next export`, Hugo, Eleventy) to pre-generate those paths, or
  - Pre-render a file per item/category under folders (requires build or scripting locally).

Customizing content
- Add and edit items at `data/items.json`. Each item includes localized titles & descriptions.
- Add categories at `data/categories.json`.
- Edit translations under `i18n/*.json`.
- Add high-resolution images under `assets/images/` (referenced from `data/items.json`).

Integrating a real CMS / e-commerce backend
- For a proper production workflow, I recommend:
  - CMS: Contentful, Strapi, or Netlify CMS (with a static generator) — these support multilingual fields and allow editors to manage items & categories.
  - E-commerce / Checkout: Shopify (Buy SDK or Checkout link), or Stripe Checkout/Payment Intents. Server-side integration is required for secure payments and order management.
  - Hosting: GitHub Pages is fine for static content; if you need serverless functions (webhooks, checkout sessions), consider Netlify or Vercel while keeping the static pages on GitHub Pages.

Next steps I can help with
- Convert this starter to a generator (Next.js / Eleventy / Hugo) so you can have pretty URLs and build-time rendering.
- Add Netlify CMS or Contentful wiring so non-technical editors can manage the catalog.
- Add a Stripe Checkout serverless example to securely handle payments.
- Pre-generate per-category and per-item files for SEO-friendly pretty URLs and separate hreflang pages.

If you want, I can now:
- Produce a commit-ready zip of these files for you to drop in your `antiquebooks.github.io` repository, or
- Convert the project to a static-site generator of your choice (Next.js export / Eleventy / Hugo) to enable prettier URLs and an easier CMS integration.

Tell me which next step you'd like and I'll generate the files accordingly.
