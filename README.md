# dharmsen.github.io

Personal academic website for Dalton Harmsen. Built with Astro, deployed to
GitHub Pages. The visual design lives in `src/styles/tokens.css` — that's
the single file to edit when you want to change colors, fonts, or spacing.

## 1. Overview & aesthetic

This is an academic-first personal site with a write-ups blog and a hobby
blog. The aesthetic is **editorial hybrid on warm paper**: serif name
(EB Garamond), sans body (Inter), mono labels/dates/venues (JetBrains Mono),
single configurable accent color (Ink).

## 2. Tech stack

- **Astro 5+** — static site generator, zero JS by default
- **Content collections** typed with Zod schemas
- **Self-hosted fonts** via `@fontsource/*`
- **GitHub Actions** builds and deploys to GitHub Pages on push to `main`
- **Web3Forms** handles the contact form (no signup needed)

## 3. Project structure

```
src/
  content/            Markdown entries, one folder per collection
  content.config.ts   Zod schemas for every collection
  data/site.ts        Site name, role, shortBio, socials, nav
  layouts/            BaseLayout.astro (html shell)
  components/         Header, Footer, PaperRow, TalkRow, etc.
  pages/              Routes map directly to URLs
  styles/
    tokens.css        Colors, fonts, type scale, spacing — edit this
    base.css          Reset, font imports, base styles
public/               Static assets (cv.pdf, favicon.svg, images/)
astro.config.mjs      Site URL, sitemap integration
tsconfig.json         Astro strict preset
.env (gitignored)     WEB3FORMS_ACCESS_KEY
```

## 4. Local development

```bash
npm install
npm run dev       # http://localhost:4321, hot reload
npm run build     # type-check + build to dist/
npm run preview   # serve the built dist/ locally
```

Node 20+ is required.

## 5. Authoring content

Every collection lives under `src/content/`. Each file is a Markdown file
with YAML frontmatter. Schemas are enforced — typos fail the build.

### Publications — `src/content/publications/*.md`

```yaml
---
title: "Sparse routing for mixture-of-experts"
authors: ["Dalton Harmsen", "Ada Lovelace"]
venue: "NeurIPS"
year: 2025
type: "conference"          # conference | journal | workshop | preprint | thesis
pdf: "/papers/sparse-moe.pdf"      # optional
arxiv: "2501.12345"                # optional
doi: "..."                         # optional
code: "https://github.com/..."     # optional
slides: "/slides/..."              # optional
highlight: false                   # optional — surfaces on homepage
---
Optional Markdown abstract or notes.
```

Set `highlight: true` to feature on the homepage. Delete `_example.md` once
you've added your own.

### Talks — `src/content/talks/*.md`

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

### Teaching — `src/content/teaching/*.md`

```yaml
---
course: "Deep Learning (5IMA0)"
role: "Teaching Assistant"
institution: "Eindhoven University of Technology"
year: 2025
semester: "Q3"              # optional
url: "..."                  # optional
---
```

### Supervision — `src/content/supervision/*.md`

```yaml
---
student: "Jane Doe"
level: "MSc"                # BSc | MSc | PhD
topic: "Efficient attention mechanisms"
year: 2025
role: "co-supervisor"
---
```

### Notes — `src/content/notes/*.md`

```yaml
---
title: "Why sparsity matters for LLM inference"
date: 2025-06-12
description: "A short note on the compute economics of sparse routing."
draft: false                # drafts hidden in prod build, visible in dev
tags: ["sparsity", "inference"]   # optional
---
Full Markdown body.
```

### Hobby categories — `src/content/hobbies/*.md`

```yaml
---
title: "Photography"
description: "Mostly 35mm film, occasionally digital."   # optional
order: 1                          # optional — if omitted, alphabetical
image: "/images/hobby/photography.jpg"   # optional
---
Optional intro Markdown for the category page.
```

### Hobby posts — `src/content/hobby-posts/*.md`

```yaml
---
title: "A weekend in Drenthe"
date: 2025-06-15
hobby: photography          # MUST match a hobbies/ filename (no extension)
draft: false
tags: ["film", "roadtrip"]  # optional
---
Markdown body.
```

If `hobby:` references a category that doesn't exist, the build fails with a
clear error naming the offending file.

### About — `src/content/about.md`

Single Markdown file rendered at `/about`. Standard headings (h2) are
auto-styled as mono section labels.

### CV — `src/content/cv.md`

Single Markdown file rendered at `/cv` with a "Download PDF" button linking
to `/cv.pdf`. Keep them visually in sync by hand.

## 6. Adding a new collection

1. Create `src/content/<name>/` and drop a `.md` file in it.
2. Add ~5 lines to `src/content.config.ts`:

```ts
const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    year: z.number().int(),
  }),
});

export const collections = { /* existing */, courses };
```

3. Add the listing route `src/pages/<name>/index.astro` (copy any existing
   one as a template).
4. (Optional) add a nav entry in `src/data/site.ts`.

No build config changes, no plugin registration.

## 7. Adding a new page (not a collection)

Drop a `.md` or `.astro` file in `src/pages/`. The filename becomes the URL.
`src/pages/uses.md` → `/uses`. For Markdown files, frontmatter is optional.

## 8. Adjusting the design

Every visual change has exactly one place to make it:

| Change                     | File                              |
|----------------------------|-----------------------------------|
| Colors (light/dark)        | `src/styles/tokens.css`           |
| Fonts                      | `src/styles/tokens.css` + `@fontsource/*` in `base.css` |
| Type sizes                 | `src/styles/tokens.css` (`--text-*`) |
| Spacing                    | `src/styles/tokens.css` (`--space-*`) |
| Page width / prose width   | `src/styles/tokens.css` (`--container`, `--measure`) |
| Site name / role / bio     | `src/data/site.ts`                |
| Social links               | `src/data/site.ts`                |
| Nav items                  | `src/data/site.ts`                |
| Default theme              | `<html data-theme="light">` in `BaseLayout.astro` |
| Homepage hero layout       | `src/pages/index.astro`           |
| A list row's appearance    | the matching `*Row.astro` in `src/components/` |
| A detail page's layout     | the matching `[slug].astro` in `src/pages/<section>/` |

### Color tokens

The full set lives at the top of `tokens.css`. Light is the default; dark is
under `[data-theme="dark"]`. Edit only the values — the rest of the site
reads them via `var(--bg)`, `var(--accent)`, etc.

### Design principles (conventions to preserve)

- **Hairlines** are `1px solid var(--rule)` — never thicker.
- **Section labels** are mono, `--text-xs`, uppercase, `letter-spacing: 0.13em`.
- **Links** are `var(--accent)`, underline offset 3px, thickness 1px → 2px on hover.
- **Type scale** is 1.25 ratio. Hero name uses `clamp(2rem, 5vw, 2.625rem)`.
- **Container width** is 64rem (lists); **prose width** is 38rem (long-form).
- **Components stay under ~60 lines.** Single-purpose. When one grows past
  that, it's doing too much — split it.

## 9. Theme toggle

The site defaults to **light**. A sun/moon button in the header switches to
dark. The choice persists in `localStorage['theme']`. An inline script in
`BaseLayout.astro`'s `<head>` applies the theme before paint (no flash).

Dark tokens are gated on `[data-theme="dark"]`. The site does NOT auto-follow
the OS preference — default is always light unless the user toggles.

## 10. Email / contact

**There is no plaintext email anywhere in this repo.** Not in HTML, not in
JS, not encoded. This is by design — the address is impossible to scrape
because it isn't here.

- `/contact` hosts a form backed by Web3Forms. The access key is read from
  `WEB3FORMS_ACCESS_KEY` in `.env` (gitignored — see `.env.example`).
- The real address lives only in the Web3Forms dashboard.
- Footer links to Scholar, GitHub, LinkedIn, X cover the "I just want to
  find you" path.

## 11. Deployment

Push to `main`:

```bash
git push origin main
```

The GitHub Actions workflow at `.github/workflows/deploy.yml` runs
`npm run build` and uploads `dist/` to GitHub Pages. Build failures block
deploy and email the repo owner. First-time setup:
1. Enable Actions and Pages in the repo settings (Pages → source: GitHub Actions).
2. Create a Web3Forms access key at https://web3forms.com (no signup needed).
3. Add it as a repository secret named `WEB3FORMS_ACCESS_KEY` (Settings →
   Secrets and variables → Actions → New repository secret). Without this,
   the contact form renders but submissions silently fail.

## 12. Verification commands

```bash
npm run build            # Type-check + build. Fails on any schema/import error.
npm run check:links      # Walks dist/, fails on any 404.
```

(For periodic Lighthouse audits: `npx lighthouse http://localhost:4321 --view`.
Not bundled — install on demand.)

The build IS the test suite for a static site — no unit tests, no business
logic to test. Run `check:links` before merging.

## 13. Where to learn more

The full design rationale lives in
`docs/superpowers/specs/2026-06-25-website-overhaul-design.md`. Read it if
you want the "why" behind any decision.
