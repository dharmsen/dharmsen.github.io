# Website Overhaul — Design Spec

**Date:** 2026-06-25
**Branch:** `overhaul-website`
**Status:** Approved (pending final user review)

A from-scratch rebuild of `dharmsen.github.io` as an academic-first personal
site with a small write-ups section and a hobby blog. Simple-but-elegant
aesthetic, Markdown-driven content, easily adjustable via centralized design
tokens.

---

## 1. Purpose & audience

Primarily an **academic presence** (publications, talks, teaching,
supervision) with **personal sections** (write-ups blog, hobby blog).
Audience: other researchers, collaborators, recruiters, anyone curious about
work or hobbies.

## 2. Aesthetic direction

**Editorial hybrid on warm paper.** Synthesizes scholarly-serif warmth with
a techy-editorial structure. Single configurable accent.

- **Name / h1:** EB Garamond serif
- **Body / headings:** Inter sans
- **Labels, dates, venues, nav:** JetBrains Mono
- **Background:** warm paper (`#fbfaf5` light, `#14140f` dark)
- **Accent:** Ink — `#1e3a5f` light, `#8ab4dc` dark (desaturated light blue)
- **Hairlines:** `1px solid var(--rule)` only; never thicker

Source mockups: `.superpowers/brainstorm/` (gitignored).

## 3. Tech stack

**Astro** + Markdown content collections + GitHub Pages (via GitHub Actions).

- Zero JS by default; only the theme toggle and contact form submit have any.
- Self-hosted fonts via `@fontsource` (no Google Fonts CDN request).
- Typed content collections via Zod schemas (`src/content.config.ts`).
- `dist/` built by GitHub Action on push to `main`, deployed to Pages.

### Repository layout

```
dharmsen.github.io/
├── src/
│   ├── content/                # Markdown entries
│   │   ├── publications/
│   │   ├── talks/
│   │   ├── teaching/
│   │   ├── supervision/
│   │   ├── notes/
│   │   ├── hobbies/            # hobby categories
│   │   ├── hobby-posts/        # posts within a hobby
│   │   ├── about.md            # long-form about page
│   │   └── cv.md               # Markdown rendering of CV
│   ├── components/             # PaperRow, TalkRow, Header, Footer, etc.
│   ├── layouts/                # BaseLayout.astro
│   ├── pages/                  # routes
│   │   ├── index.astro         # /
│   │   ├── research/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── talks/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── teaching/index.astro
│   │   ├── notes/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── hobby/
│   │   │   ├── index.astro
│   │   │   ├── [category]/
│   │   │   │   ├── index.astro
│   │   │   │   └── [post].astro
│   │   ├── about.astro
│   │   ├── cv.astro
│   │   ├── contact.astro
│   │   ├── 404.astro
│   │   └── rss.xml.js
│   ├── data/
│   │   └── site.ts             # name, role, shortBio, social links
│   └── styles/
│       ├── tokens.css          # single source of colors, type, spacing
│       └── base.css            # reset, defaults
├── public/
│   ├── cv.pdf
│   ├── images/
│   └── favicon.svg
├── astro.config.mjs
├── package.json
├── .github/workflows/deploy.yml
├── README.md                   # authoring guide
└── .env                        # WEB3FORMS_ACCESS_KEY (gitignored)
```

### What gets deleted from the current repo

All Jekyll template files (`_config.yml`, `_layouts/`, `_includes/`, `_sass/`,
`_data/`, `_pages/`, `_publications/`, `_talks/`, `_teaching/`, `_portfolio/`,
`_posts/`, `_drafts/`, `Gemfile`, `Gemfile.lock`, `markdown_generator/`,
`talkmap*`, `Dockerfile`, `docker-compose.yaml`, `.devcontainer/`) and the
root-level terminal portfolio (`index.html`, `style.css`, `art.txt`,
`blog.html`, `projects.html`, `contact.html`).

**Kept:** `LICENSE`, `.gitignore` (extended with `.superpowers/` and Astro
artifacts), `.github/` (workflow added).

## 4. Content model

All collections live under `src/content/` and are registered in
`src/content.config.ts`. Every field beyond the required ones is optional
(`.optional()` in Zod). Seed content: one example entry per collection with
a `<!-- Delete this file once you've added your own -->` comment.

### `publications/*.md`

```yaml
---
title: "Sparse routing for mixture-of-experts"
authors: ["Dalton Harmsen", "..."]
venue: "NeurIPS"
year: 2025
type: "conference"          # conference | journal | workshop | preprint | thesis
pdf: "/papers/sparse-moe.pdf"      # optional
arxiv: "2501.12345"                # optional
doi: "..."                         # optional
code: "https://github.com/..."     # optional
slides: "/slides/..."              # optional
highlight: false                   # optional, surfaces on homepage
---
Optional Markdown abstract or notes (rendered on detail page).
```

Sorting: `highlight` first, then `year` desc.

### `talks/*.md`

```yaml
---
title: "Efficient inference for LLMs"
venue: "NeurIPS Workshop on Efficient ML"
date: 2025-12-10
type: "talk"                # talk | poster | tutorial | invited
location: "Vancouver, Canada"
slides: "/slides/..."       # optional
---
```

Sorting: `date` desc.

### `teaching/*.md`

```yaml
---
course: "Deep Learning (5IMA0)"
role: "Teaching Assistant"  # Teaching Assistant | Instructor | Co-lecturer
institution: "Eindhoven University of Technology"
year: 2025
semester: "Q3"              # optional
url: "..."                  # optional course page
---
```

Sorting: `year` desc.

### `supervision/*.md`

```yaml
---
student: "Jane Doe"
level: "MSc"                # BSc | MSc | PhD
topic: "Efficient attention mechanisms"
year: 2025
role: "co-supervisor"       # supervisor | co-supervisor | daily supervisor
---
```

Sorting: `year` desc.

### `notes/*.md`

```yaml
---
title: "Why sparsity matters for LLM inference"
date: 2025-06-12
description: "A short note on..."   # used in listing + OG preview
draft: false
tags: ["sparsity", "inference"]     # optional
---
Full Markdown body.
```

Sorting: `date` desc. Drafts excluded from production builds, visible locally.

### `hobbies/*.md` — hobby categories

```yaml
---
title: "Photography"
description: "Mostly 35mm film, occasionally digital."   # optional
order: 2                          # optional — if omitted, alphabetical
image: "/images/hobby/photography.jpg"   # optional
---
Optional longer intro Markdown for the category page.
```

Sorting on `/hobby` landing: entries with `order` first (ascending by `order`),
then entries without `order` (alphabetical by title).

### `hobby-posts/*.md` — posts within a hobby

```yaml
---
title: "A weekend in Drenthe"
date: 2025-06-15
hobby: "photography"        # must match a hobbies/ filename (slug)
draft: false
tags: ["film", "roadtrip"]  # optional
---
Markdown body.
```

Sorting within a category: `date` desc. Build-time check verifies every
`hobby:` reference points to a real `hobbies/` file.

### `about.md`

Single file, no collection. Long-form about page content.

### `cv.md`

Single file, no collection. Markdown rendering of the CV. Kept visually in
sync with `/public/cv.pdf` by hand. "Download PDF" button at top of `/cv`
links to the PDF.

## 5. Site configuration

`src/data/site.ts` exports:

```ts
export const site = {
  name: "Dalton Harmsen",
  role: "phd · ai foundation models · tue / openeurollm",
  shortBio: "One sentence for the homepage hero.",
  social: {
    scholar: "https://scholar.google.com/citations?user=...",
    github: "https://github.com/dharmsen",
    linkedin: "https://www.linkedin.com/in/dalton-harmsen",
    x: "https://x.com/daltonharmsen",
  },
  nav: [
    { label: "research", href: "/research" },
    { label: "talks", href: "/talks" },
    { label: "teaching", href: "/teaching" },
    { label: "notes", href: "/notes" },
    { label: "hobby", href: "/hobby" },
  ],
};
```

## 6. Navigation & layout

**Header (every page):**
- Left: name in serif, links to `/`.
- Right: nav items (mono, lowercase). Active item gets accent color + thin underline.
- Theme toggle (sun/moon) at far right.
- Under ~640px: nav collapses to a `menu` button that toggles a vertical dropdown.

**Footer (every page):**
- Scholar / GitHub / LinkedIn / X links (mono).
- Copyright line.
- No email — see §8.

**Routes:**

| Route | Description |
|---|---|
| `/` | Hero (name, role, shortBio, optional avatar, links to about/cv/contact) + "Selected work" (publications with `highlight: true`) |
| `/about` | Long-form about page (prose width) |
| `/cv` | Markdown CV with "Download PDF" button (prose width) |
| `/research` | All publications, filter chips by `type`, optional year dropdown, URL-synced (`?type=conference`) |
| `/research/[slug]` | Single publication (metadata bar, abstract, optional BibTeX collapsible) |
| `/talks` | All talks, grouped by year heading |
| `/talks/[slug]` | Single talk (metadata, optional slides) |
| `/teaching` | One page, two sections: Teaching then Supervision |
| `/notes` | Notes listing, sorted by date desc |
| `/notes/[slug]` | Single note |
| `/hobby` | Hobby category grid (image, title, description, count, last-updated) |
| `/hobby/[category]` | Posts in one category, date desc |
| `/hobby/[category]/[post]` | Single hobby post |
| `/contact` | Contact form + social links |
| `/404` | Custom not-found |
| `/rss.xml` | Notes only |
| `/sitemap.xml` | Auto-generated |

**Shared page anatomy** (every page except the homepage hero):

```
[ page-section-label ]   mono, uppercase, accent
[ Page title (h2)    ]   sans, 2rem
[ optional intro     ]   sans, text-soft, max --measure
[ page body              container width (64rem) for lists,
   |                       prose width (38rem) for long-form
   v                     ]
```

**List row pattern** (consistent across `/research`, `/talks`, `/notes`,
`/teaching`, `/hobby/[category]`):

```
[ year/date · mono ]  [ title · sans ]  [ venue/meta · mono, right-aligned ]
```

## 7. Visual design system

All tokens live in `src/styles/tokens.css`. Editing this one file is the
single surface for visual changes.

### Color tokens

```css
:root {
  --bg:          #fbfaf5;   /* warm paper */
  --bg-elev:     #ffffff;   /* cards, header bg */
  --text:        #1a1a1a;
  --text-soft:   #4a4a4a;   /* body secondary */
  --text-faint:  #8a8a8a;   /* metadata, dates, mono labels */
  --rule:        #e3ddcd;   /* hairlines */
  --accent:      #1e3a5f;   /* Ink — light mode */
  --accent-soft: #a8b6c6;
}
[data-theme="dark"] {
  --bg:          #14140f;
  --bg-elev:     #1d1d17;
  --text:        #f5f3ea;
  --text-soft:   #c9c5b4;
  --text-faint:  #8a8675;
  --rule:        #3a3a30;
  --accent:      #8ab4dc;   /* Ink — dark mode, desaturated */
  --accent-soft: #4a5a6e;
}
```

**Theme switching:** Sun/moon toggle in header. Defaults to light. Inline
no-flash script in `<head>` reads `localStorage['theme']`; falls back to
`'light'` if unset; sets `document.documentElement.dataset.theme` before
paint. Dark tokens are gated on `[data-theme="dark"]` (no
`prefers-color-scheme` auto-switching). Toggle persists to `localStorage`.

### Typography

```css
--font-serif: 'EB Garamond', Georgia, serif;
--font-sans:  'Inter', system-ui, sans-serif;
--font-mono:  'JetBrains Mono', ui-monospace, monospace;
```

Loaded self-hosted via `@fontsource/eb-garamond`, `@fontsource/inter`,
`@fontsource/jetbrains-mono`.

### Type scale

```
--text-xs   0.75rem    mono labels, footer
--text-sm   0.875rem   metadata, captions
--text-base 1rem       body
--text-lg   1.25rem    lead paragraph
--text-xl   1.5rem     h3 (in-page section labels)
--text-2xl  2rem       h2 (page titles)
--text-3xl  clamp(2rem, 5vw, 2.625rem)   h1 (hero name)
```

### Layout

```
--measure:   38rem    max prose line length
--container: 64rem    max page width
--gutter:    1.5rem   page side padding (3rem on wide screens)
```

### Spacing

4px base: `0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6rem`.

### Component conventions

- Hairlines: `1px solid var(--rule)` only.
- Section labels: mono, `--text-xs`, `letter-spacing: 0.13em`,
  `text-transform: uppercase`, `var(--accent)` when accenting, otherwise
  `var(--text-faint)`.
- Links: `var(--accent)`, `text-decoration: underline`,
  `text-underline-offset: 3px`, `text-decoration-thickness: 1px`. Hover:
  thickness → 2px.

### Component inventory

- `BaseLayout.astro` — `<html>`, `<head>`, header, footer, `<slot/>`.
- `Header.astro` — name + nav + theme toggle.
- `ThemeToggle.astro` — sun/moon button + inline no-flash script.
- `Footer.astro` — social links + copyright.
- `SectionLabel.astro` — mono uppercase accent label.
- `PaperRow.astro`, `TalkRow.astro`, `NoteRow.astro`, `HobbyPostRow.astro`
  — list entry patterns.
- `PaperDetail.astro`, `ProsePage.astro` — detail page shells.
- `ContactForm.astro` — Web3Forms form.

Each component stays under ~60 lines. Single-purpose.

## 8. Email / contact

**No plaintext email anywhere in the site source.** Not in HTML, JS, images,
or encoded form. The address does not exist in the repo.

- `/contact` page hosts a form (Web3Forms). Real address lives only in the
  Web3Forms dashboard, identified by an access key in `.env`
  (`WEB3FORMS_ACCESS_KEY`).
- Footer links to Scholar / GitHub / LinkedIn / X covers indirect reach.

## 9. Adjustability

The discipline is clean separation of concerns — content in `src/content/`,
components in `src/components/`, layouts in `src/layouts/`, tokens in
`src/styles/`. No config-driven page generation. No plugin system.

| Change | Touches |
|---|---|
| Colors | `tokens.css` (one block per theme) |
| Fonts | `tokens.css` `--font-*` + `@fontsource` package |
| Type/spacing scale | `tokens.css` |
| Site name/role/bio/socials | `src/data/site.ts` |
| Homepage hero | `src/pages/index.astro` |
| Add a publication/talk/note/post | One `.md` file in the right folder |
| Add a new collection | Folder + ~5 lines in `content.config.ts` + route page (documented in README) |
| List row pattern | One `.astro` component |
| Add a whole new page | One `.md` or `.astro` in `src/pages/` |
| Switch default theme | Move block contents in `tokens.css` |

## 10. Verification

**Every change:**
- `npm run build` — Astro + Zod catch frontmatter errors, broken imports,
  type mismatches. Fail = no deploy.
- `npm run dev` — local preview at `localhost:4321`, hot reload.

**Pre-deploy:**
- `npm run check:links` — walks built site, fails on any 404.
- `npm run check:lighthouse` — targets: performance ≥ 95, accessibility
  ≥ 95, SEO ≥ 95. Regression warning, not a hard gate.

**Tests:** none in the unit-test sense — no business logic, only rendering.
The build IS the test for a static site. (A Playwright smoke test was
considered and skipped as overkill.)

**Deploy:** push to `main` → GitHub Action runs `npm run build` → uploads
`dist/` to GitHub Pages via `actions/deploy-pages`. Build failures block
deploy and email the repo owner.

## 11. Deliverables

- Astro project per §3.
- All components per §7.
- Empty content collections with one example entry each (per §4).
- Real placeholder content for: about.md, cv.md, contact.astro, homepage hero.
- `README.md` — **comprehensive**, the primary reference for working with
  the site. Covers everything needed to maintain and adjust it without
  reading the design doc. Sections:
  1. **Overview & aesthetic** — what the site is, the editorial-hybrid-on-warm-paper direction, single-accent philosophy.
  2. **Tech stack** — Astro, content collections, GitHub Pages via Actions, self-hosted fonts.
  3. **Project structure** — annotated tree of `src/`, `public/`, config files.
  4. **Local development** — `npm install`, `npm run dev`, `npm run build`, port, hot reload.
  5. **Authoring content** — one subsection per collection (publications, talks, teaching, supervision, notes, hobbies, hobby-posts, about, cv) with full frontmatter examples.
  6. **Adding a new collection** — the 5-line `content.config.ts` pattern, with worked example.
  7. **Adding a new page** — drop a `.md` or `.astro` in `src/pages/`, done.
  8. **Adjusting the design** — the adjustability table from §9 of this spec, verbatim: every "I want to change X → touch Y" pair. Plus where each token lives in `tokens.css`.
  9. **Design principles** — the conventions from §7: hairline rules, section label style, link style, type scale, container/measure widths, component size cap (~60 lines), single-purpose components.
  10. **Site configuration** — editing `src/data/site.ts` (name, role, shortBio, socials, nav).
  11. **Theme toggle** — defaults to light, persists to localStorage, where the inline script lives.
  12. **Email / contact** — why no email is in source, how Web3Forms works, where the access key goes.
  13. **Deployment** — push to `main` → GitHub Action → Pages. Build failures block deploy.
  14. **Verification** — `npm run build` / `dev` / `check:links` / `check:lighthouse` and what each catches.
  15. **Where to learn more** — link back to this design doc for rationale.
- `.github/workflows/deploy.yml` GitHub Pages deploy workflow.
- `.env.example` showing `WEB3FORMS_ACCESS_KEY`.
- `tokens.css`, `base.css`, `site.ts` configured with Ink theme and real
  site values.

## 12. Out of scope (YAGNI)

- Search across notes/publications.
- Comments on notes.
- Newsletter signup.
- Multi-language.
- CMS integration (Decap, Tina, etc.).
- Image optimization pipeline beyond Astro's built-in `<Image>`.
- Analytics (can be added later by editing `BaseLayout.astro`).
- Unit tests / Playwright smoke tests.
