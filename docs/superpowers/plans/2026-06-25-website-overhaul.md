# Website Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `dharmsen.github.io` as an Astro static site with editorial-hybrid aesthetic, Markdown-driven academic content (publications, talks, teaching, supervision, notes), a two-level hobby blog, contact form, and comprehensive README.

**Architecture:** Astro + content collections (typed via Zod). Zero JS by default except theme toggle and contact form. Self-hosted fonts via `@fontsource`. Deployed to GitHub Pages via GitHub Actions. Single source of truth for design in `tokens.css`.

**Tech Stack:** Astro 5+, TypeScript, Zod (built into Astro content), `@astrojs/sitemap`, `@astrojs/check` + `typescript` (for `astro check`), `@fontsource/eb-garamond`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, Web3Forms (form backend, no signup), `linkinator` (link check), GitHub Actions (deploy).

## Global Constraints

Copied verbatim from the spec; every task implicitly includes these.

- **Node 20+** required by Astro 5.
- **No plaintext email anywhere** in any committed file — HTML, JS, images, encoded strings. Address lives only in Web3Forms dashboard, referenced by access key in `.env`.
- **Accent color:** `--accent: #1e3a5f` (light), `#8ab4dc` (dark, desaturated).
- **Background:** `--bg: #fbfaf5` (light), `#14140f` (dark, warm near-black).
- **Fonts:** EB Garamond (serif), Inter (sans), JetBrains Mono (mono), self-hosted via `@fontsource/*`.
- **Type scale:** 1.25 ratio. Body 1rem. Hero name `clamp(2rem, 5vw, 2.625rem)`.
- **Theme:** Default light. Manual sun/moon toggle. No-flash inline script in `<head>`. Dark tokens gated on `[data-theme="dark"]`. Persisted to `localStorage['theme']`.
- **Hairlines:** `1px solid var(--rule)` only, never thicker.
- **Section labels:** mono, `--text-xs`, `letter-spacing: 0.13em`, `text-transform: uppercase`, `var(--accent)` or `var(--text-faint)`.
- **Links:** `var(--accent)`, underline offset 3px, thickness 1px → 2px on hover.
- **Max widths:** `--container: 64rem` (lists), `--measure: 38rem` (prose).
- **Components stay under ~60 lines**, single-purpose.
- **Deletions:** all Jekyll files (`_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_data/`, `_pages/`, `_publications/`, `_talks/`, `_teaching/`, `_portfolio/`, `_posts/`, `_drafts/`, `Gemfile`, `Gemfile.lock`, `markdown_generator/`, `talkmap*`, `Dockerfile`, `docker-compose.yaml`, `.devcontainer/`) and root terminal portfolio (`index.html`, `style.css`, `art.txt`, `blog.html`, `projects.html`, `contact.html`). Happens in Task 13.

---

## File Structure

```
dharmsen.github.io/
├── astro.config.mjs              # Astro config: site URL, integrations
├── package.json                  # deps + scripts
├── tsconfig.json                 # Astro strict preset
├── README.md                     # comprehensive authoring guide (Task 13)
├── .env.example                  # WEB3FORMS_ACCESS_KEY=... (Task 11)
├── .github/
│   └── workflows/
│       └── deploy.yml            # build + deploy to Pages (Task 14)
├── public/
│   ├── favicon.svg               # site favicon (Task 1)
│   ├── cv.pdf                    # canonical CV PDF (Task 10, placeholder)
│   └── images/
│       └── hobby/                # hobby category images (Task 9)
├── src/
│   ├── content.config.ts         # all collection schemas (Task 3)
│   ├── content/
│   │   ├── publications/         # *.md (Task 5)
│   │   │   └── _example.md
│   │   ├── talks/                # *.md (Task 6)
│   │   │   └── _example.md
│   │   ├── teaching/             # *.md (Task 7)
│   │   │   └── _example.md
│   │   ├── supervision/          # *.md (Task 7)
│   │   │   └── _example.md
│   │   ├── notes/                # *.md (Task 8)
│   │   │   └── _example.md
│   │   ├── hobbies/              # category *.md (Task 9)
│   │   │   └── photography.md
│   │   ├── hobby-posts/          # post *.md (Task 9)
│   │   │   └── 2025-06-15-drenthe.md
│   │   ├── about.md              # long-form about (Task 10)
│   │   └── cv.md                 # Markdown CV (Task 10)
│   ├── data/
│   │   └── site.ts               # name, role, bio, socials, nav (Task 2)
│   ├── layouts/
│   │   └── BaseLayout.astro      # <html>, <head>, header, footer (Task 2)
│   ├── components/
│   │   ├── Header.astro          # name + nav + theme toggle (Task 2)
│   │   ├── Footer.astro          # socials + copyright (Task 2)
│   │   ├── ThemeToggle.astro     # sun/moon + no-flash script (Task 2)
│   │   ├── SectionLabel.astro    # mono uppercase accent label (Task 2)
│   │   ├── PaperRow.astro        # publications list entry (Task 5)
│   │   ├── TalkRow.astro         # talks list entry (Task 6)
│   │   ├── NoteRow.astro         # notes list entry (Task 8)
│   │   ├── HobbyPostRow.astro    # hobby post list entry (Task 9)
│   │   └── ContactForm.astro     # Web3Forms form (Task 11)
│   ├── pages/
│   │   ├── index.astro           # / (Task 4)
│   │   ├── 404.astro             # not found (Task 12)
│   │   ├── about.astro           # /about (Task 10)
│   │   ├── cv.astro              # /cv (Task 10)
│   │   ├── contact.astro         # /contact (Task 11)
│   │   ├── research/
│   │   │   ├── index.astro       # /research (Task 5)
│   │   │   └── [slug].astro      # /research/[slug] (Task 5)
│   │   ├── talks/
│   │   │   ├── index.astro       # /talks (Task 6)
│   │   │   └── [slug].astro      # /talks/[slug] (Task 6)
│   │   ├── teaching/
│   │   │   └── index.astro       # /teaching (Task 7)
│   │   ├── notes/
│   │   │   ├── index.astro       # /notes (Task 8)
│   │   │   └── [slug].astro      # /notes/[slug] (Task 8)
│   │   ├── hobby/
│   │   │   ├── index.astro       # /hobby (Task 9)
│   │   │   └── [category]/
│   │   │       ├── index.astro   # /hobby/[category] (Task 9)
│   │   │       └── [post].astro  # /hobby/[category]/[post] (Task 9)
│   │   └── rss.xml.js            # /rss.xml (Task 8)
│   └── styles/
│       ├── tokens.css            # color/type/spacing tokens (Task 1)
│       └── base.css              # reset, defaults (Task 1)
```

---

### Task 1: Astro project scaffold + design tokens

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `public/favicon.svg`
- Create: `src/pages/index.astro` (placeholder, replaced in Task 4)

**Interfaces:**
- Produces: `tokens.css` with the CSS custom properties listed in the spec under §7. All later components consume these via `var(--...)`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dharmsen-github-io",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "check:links": "linkinator dist --recurse --silent"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.2.1",
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.6.3",
    "@fontsource/eb-garamond": "^5.1.0",
    "@fontsource/inter": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.0"
  },
  "devDependencies": {
    "linkinator": "^6.1.2"
  },
  "engines": { "node": ">=20" }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dharmsen.github.io',
  integrations: [sitemap()],
  prefetch: true,
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `.env.example`**

```
# Web3Forms access key (get one at https://web3forms.com, no signup needed)
WEB3FORMS_ACCESS_KEY=your-access-key-here
```

- [ ] **Step 5: Create `src/styles/tokens.css` with the full token set**

```css
/* ============================================================
   DESIGN TOKENS — single source of truth for visual changes.
   Edit values here; everything else follows.
   ============================================================ */

:root {
  /* Color — light is default */
  --bg:          #fbfaf5;
  --bg-elev:     #ffffff;
  --text:        #1a1a1a;
  --text-soft:   #4a4a4a;
  --text-faint:  #8a8a8a;
  --rule:        #e3ddcd;
  --accent:      #1e3a5f;
  --accent-soft: #a8b6c6;

  /* Typography */
  --font-serif: 'EB Garamond', Georgia, serif;
  --font-sans:  'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', ui-monospace, monospace;

  /* Type scale (1.25 ratio) */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.25rem;
  --text-xl:   1.5rem;
  --text-2xl:  2rem;
  --text-3xl:  clamp(2rem, 5vw, 2.625rem);

  /* Layout */
  --measure:   38rem;
  --container: 64rem;
  --gutter:    1.5rem;

  /* Spacing (4px base) */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
}

[data-theme="dark"] {
  --bg:          #14140f;
  --bg-elev:     #1d1d17;
  --text:        #f5f3ea;
  --text-soft:   #c9c5b4;
  --text-faint:  #8a8675;
  --rule:        #3a3a30;
  --accent:      #8ab4dc;
  --accent-soft: #4a5a6e;
}
```

- [ ] **Step 6: Create `src/styles/base.css`**

```css
@import '@fontsource/eb-garamond/400.css';
@import '@fontsource/eb-garamond/500.css';
@import '@fontsource/eb-garamond/600.css';
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; -webkit-text-size-adjust: 100%; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
a:hover { text-decoration-thickness: 2px; }

img, svg, video { display: block; max-width: 100%; height: auto; }

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

hr { border: 0; border-top: 1px solid var(--rule); }

::selection { background: var(--accent-soft); color: var(--bg); }
```

- [ ] **Step 7: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1e3a5f"/>
  <text x="16" y="22" font-family="Georgia, serif" font-size="18" fill="#fbfaf5" text-anchor="middle">d</text>
</svg>
```

- [ ] **Step 8: Create placeholder `src/pages/index.astro`**

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dalton Harmsen</title>
  </head>
  <body>
    <main style="max-width: 38rem; margin: 6rem auto; padding: 0 1.5rem;">
      <h1 style="font-family: var(--font-serif); font-size: var(--text-3xl);">Dalton Harmsen</h1>
      <p style="font-family: var(--font-mono); color: var(--text-faint); margin-top: 0.5rem;">scaffold works</p>
    </main>
  </body>
</html>
```

- [ ] **Step 9: Install dependencies**

Run: `cd /home/dalton/dharmsen.github.io && npm install`
Expected: completes without errors; `node_modules/` and `package-lock.json` created (both gitignored).

- [ ] **Step 10: Verify dev server runs**

Run: `npm run dev`
Expected: server starts at `http://localhost:4321`. Browser shows "Dalton Harmsen" in serif, "scaffold works" in mono on warm paper background. Stop with Ctrl+C.

- [ ] **Step 11: Verify build succeeds**

Run: `npm run build`
Expected: `dist/` created with `index.html`. No errors.

- [ ] **Step 12: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .env.example src/ public/
git commit -m "feat: scaffold astro project with design tokens"
```

---

### Task 2: Base layout, header, footer, theme toggle, site config

**Files:**
- Create: `src/data/site.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `src/components/SectionLabel.astro`
- Modify: `src/pages/index.astro` (replace placeholder)

**Interfaces:**
- Produces: `BaseLayout` (default export, prop: `{ title: string; description?: string; section?: string }`). All pages in later tasks consume this.
- Produces: `site` object from `src/data/site.ts` with shape: `{ name, role, shortBio, social: { scholar, github, linkedin, x }, nav: Array<{label, href}> }`.
- Produces: `SectionLabel` (prop: `{ label: string; accent?: boolean }`).

- [ ] **Step 1: Create `src/data/site.ts`**

```ts
export const site = {
  name: 'Dalton Harmsen',
  role: 'phd · ai foundation models · tue / openeurollm',
  shortBio:
    'PhD student at Eindhoven University of Technology working on efficient inference for large language models.',
  social: {
    scholar: 'https://scholar.google.com/citations?user=O5wWI0gAAAAJ',
    github: 'https://github.com/dharmsen',
    linkedin: 'https://www.linkedin.com/in/dalton-harmsen',
    x: 'https://x.com/daltonharmsen',
  },
  nav: [
    { label: 'research', href: '/research' },
    { label: 'talks', href: '/talks' },
    { label: 'teaching', href: '/teaching' },
    { label: 'notes', href: '/notes' },
    { label: 'hobby', href: '/hobby' },
  ],
} as const;

export type Site = typeof site;
```

- [ ] **Step 2: Create `src/components/ThemeToggle.astro`**

```astro
---
// Sun/moon toggle. Defaults to light (set by inline script in BaseLayout head).
---

<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle dark mode"
  class="toggle"
>
  <span class="icon icon-sun" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  </span>
  <span class="icon icon-moon" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </span>
</button>

<script>
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--text-soft);
    border-radius: 6px;
    transition: color 0.15s ease;
  }
  .toggle:hover { color: var(--accent); }
  .icon { display: none; }
  :global([data-theme='light']) .icon-sun { display: inline-flex; }
  :global([data-theme='dark']) .icon-moon { display: inline-flex; }
</style>
```

- [ ] **Step 3: Create `src/components/Header.astro`**

```astro
---
import { site } from '../data/site';
import ThemeToggle from './ThemeToggle.astro';

const { current } = Astro.props as { current?: string };
---

<header class="site-header">
  <div class="inner">
    <a href="/" class="brand">{site.name}</a>

    <button id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>

    <nav id="site-nav" class="nav" aria-label="Primary">
      {site.nav.map((item) => (
        <a
          href={item.href}
          class:list={['nav-item', { active: current === item.href }]}
        >{item.label}</a>
      ))}
      <ThemeToggle />
    </nav>
  </div>
</header>

<script>
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  btn?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(Boolean(open)));
  });
</script>

<style>
  .site-header {
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .inner {
    max-width: var(--container);
    margin: 0 auto;
    padding: var(--space-4) var(--gutter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }
  .brand {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    color: var(--text);
    text-decoration: none;
    font-weight: 500;
  }
  .nav { display: flex; align-items: center; gap: var(--space-6); }
  .nav-item {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: var(--text-faint);
    text-decoration: none;
    padding: var(--space-1) 0;
    border-bottom: 1px solid transparent;
  }
  .nav-item:hover { color: var(--text); }
  .nav-item.active { color: var(--accent); border-bottom-color: var(--accent); }
  .nav-toggle { display: none; color: var(--text); }

  @media (max-width: 640px) {
    .nav-toggle { display: inline-flex; }
    .nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
      background: var(--bg);
      border-bottom: 1px solid var(--rule);
      padding: var(--space-4) var(--gutter);
      display: none;
    }
    .nav.open { display: flex; }
  }
</style>
```

- [ ] **Step 4: Create `src/components/Footer.astro`**

```astro
---
import { site } from '../data/site';
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="inner">
    <nav class="socials" aria-label="Elsewhere">
      <a href={site.social.scholar}>scholar</a>
      <a href={site.social.github}>github</a>
      <a href={site.social.linkedin}>linkedin</a>
      <a href={site.social.x}>x</a>
    </nav>
    <p class="copy">© {year} {site.name}</p>
  </div>
</footer>

<style>
  .site-footer { border-top: 1px solid var(--rule); margin-top: var(--space-24); }
  .inner {
    max-width: var(--container);
    margin: 0 auto;
    padding: var(--space-6) var(--gutter);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    justify-content: space-between;
    align-items: center;
  }
  .socials { display: flex; gap: var(--space-4); }
  .socials a {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: var(--text-faint);
    text-decoration: none;
  }
  .socials a:hover { color: var(--accent); }
  .copy {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-faint);
  }
</style>
```

- [ ] **Step 5: Create `src/components/SectionLabel.astro`**

```astro
---
const { label, accent = true } = Astro.props as { label: string; accent?: boolean };
---

<div class:list={['section-label', { accent }]}>{label}</div>

<style>
  .section-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: var(--text-faint);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--rule);
  }
  .section-label.accent { color: var(--accent); }
</style>
```

- [ ] **Step 6: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { site } from '../data/site';

const {
  title,
  description = 'Personal website of Dalton Harmsen — PhD student in AI Foundation Models at TU Eindhoven.',
  section,
} = Astro.props as {
  title: string;
  description?: string;
  section?: string;
};

const fullTitle = title === site.name ? title : `${title} · ${site.name}`;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary" />
    <!-- No-flash theme init: must run before body paints -->
    <script is:inline>
      (function () {
        try {
          var t = localStorage.getItem('theme');
          document.documentElement.dataset.theme = (t === 'dark' || t === 'light') ? t : 'light';
        } catch (e) {
          document.documentElement.dataset.theme = 'light';
        }
      })();
    </script>
  </head>
  <body>
    <Header current={section} />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 7: Replace `src/pages/index.astro` placeholder**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../data/site';
---
<BaseLayout title={site.name}>
  <section style="max-width: var(--measure); margin: var(--space-16) auto; padding: 0 var(--gutter);">
    <h1 style="font-family: var(--font-serif); font-size: var(--text-3xl); font-weight: 500; letter-spacing: -0.015em;">{site.name}</h1>
    <p style="font-family: var(--font-mono); color: var(--text-faint); margin-top: var(--space-2);">{site.role}</p>
    <p style="margin-top: var(--space-6); color: var(--text-soft);">{site.shortBio}</p>
  </section>
</BaseLayout>
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: builds without errors.

- [ ] **Step 9: Verify dev rendering**

Run: `npm run dev`
Expected: page shows header (name + nav + theme toggle), hero with name in serif + role in mono + bio, footer with socials. Theme toggle switches light/dark on click. Mobile view (≤640px) shows menu button that opens nav.

- [ ] **Step 10: Commit**

```bash
git add src/data/site.ts src/layouts/ src/components/ src/pages/index.astro
git commit -m "feat: add base layout, header, footer, theme toggle"
```

---

### Task 3: Content collections schema + example entries

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/publications/_example.md`
- Create: `src/content/talks/_example.md`
- Create: `src/content/teaching/_example.md`
- Create: `src/content/supervision/_example.md`
- Create: `src/content/notes/_example.md`
- Create: `src/content/hobbies/_example.md`
- Create: `src/content/hobby-posts/_example.md`

**Interfaces:**
- Produces: typed collections exposed via `getCollection('publications')` etc. (used in Tasks 4–9).
- Produces: Zod schemas enforcing required vs optional fields per spec §4.

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number().int(),
    type: z.enum(['conference', 'journal', 'workshop', 'preprint', 'thesis']),
    pdf: z.string().optional(),
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    code: z.string().optional(),
    slides: z.string().optional(),
    highlight: z.boolean().default(false),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    date: z.coerce.date(),
    type: z.enum(['talk', 'poster', 'tutorial', 'invited']),
    location: z.string(),
    slides: z.string().optional(),
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/teaching' }),
  schema: z.object({
    course: z.string(),
    role: z.string(),
    institution: z.string(),
    year: z.number().int(),
    semester: z.string().optional(),
    url: z.string().optional(),
  }),
});

const supervision = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/supervision' }),
  schema: z.object({
    student: z.string(),
    level: z.enum(['BSc', 'MSc', 'PhD']),
    topic: z.string(),
    year: z.number().int(),
    role: z.string(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const hobbies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hobbies' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().int().optional(),
    image: z.string().optional(),
  }),
});

const hobbyPosts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hobby-posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    hobby: reference('hobbies'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content' }),
  schema: z.object({ title: z.string().optional() }),
});

const cv = defineCollection({
  loader: glob({ pattern: 'cv.md', base: './src/content' }),
  schema: z.object({ title: z.string().optional() }),
});

export const collections = {
  publications,
  talks,
  teaching,
  supervision,
  notes,
  hobbies,
  'hobby-posts': hobbyPosts,
  about,
  cv,
};
```

- [ ] **Step 2: Create `src/content/publications/_example.md`**

```markdown
---
title: "Sparse routing for mixture-of-experts"
authors: ["Dalton Harmsen", "Ada Lovelace"]
venue: "NeurIPS"
year: 2025
type: "conference"
pdf: "/papers/sparse-moe.pdf"
arxiv: "2501.12345"
code: "https://github.com/dharmsen/sparse-moe"
highlight: true
---

<!-- Delete this file once you've added your own publications. -->

Optional abstract or notes about the paper, in Markdown.
```

- [ ] **Step 3: Create `src/content/talks/_example.md`**

```markdown
---
title: "Efficient inference for LLMs"
venue: "NeurIPS Workshop on Efficient ML"
date: 2025-12-10
type: "talk"
location: "Vancouver, Canada"
slides: "/slides/efficient-inference.pdf"
---

<!-- Delete this file once you've added your own talks. -->
```

- [ ] **Step 4: Create `src/content/teaching/_example.md`**

```markdown
---
course: "Deep Learning (5IMA0)"
role: "Teaching Assistant"
institution: "Eindhoven University of Technology"
year: 2025
semester: "Q3"
url: "https://example.tue.nl/5ima0"
---

<!-- Delete this file once you've added your own teaching. -->
```

- [ ] **Step 5: Create `src/content/supervision/_example.md`**

```markdown
---
student: "Jane Doe"
level: "MSc"
topic: "Efficient attention mechanisms for long-context LLMs"
year: 2025
role: "co-supervisor"
---

<!-- Delete this file once you've added your own supervision. -->
```

- [ ] **Step 6: Create `src/content/notes/_example.md`**

```markdown
---
title: "Why sparsity matters for LLM inference"
date: 2025-06-12
description: "A short note on the compute economics of sparse model routing."
draft: true
tags: ["sparsity", "inference"]
---

<!-- Delete this file once you've added your own notes. -->

Replace this body with your write-up in Markdown.
```

- [ ] **Step 7: Create `src/content/hobbies/photography.md`** (real example, not placeholder)

```markdown
---
title: "Photography"
description: "Mostly 35mm film, occasionally digital."
order: 1
image: "/images/hobby/photography.jpg"
---

A short intro to this hobby. Replace with your own.
```

- [ ] **Step 8: Create `src/content/hobby-posts/2025-06-15-drenthe.md`** (real example)

```markdown
---
title: "A weekend in Drenthe"
date: 2025-06-15
hobby: photography
draft: false
tags: ["film", "roadtrip"]
---

A short post about a weekend of shooting in Drenthe. Replace with your own.
```

- [ ] **Step 9: Verify build still passes with collections**

Run: `npm run build`
Expected: builds without errors. Astro recognizes collections; type-checking on schemas passes.

- [ ] **Step 10: Verify dev picks up entries**

Run: `npm run dev`
Expected: no errors in console; homepage still loads (collection queries aren't used yet).

- [ ] **Step 11: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add typed content collections with example entries"
```

---

### Task 4: Homepage (hero + selected work)

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getCollection('publications')` from Task 3.
- Consumes: `BaseLayout`, `SectionLabel` from Task 2.

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { site } from '../data/site';
import { getCollection } from 'astro:content';

const pubs = (await getCollection('publications'))
  .filter((p) => p.data.highlight)
  .sort((a, b) => b.data.year - a.data.year);
---
<BaseLayout title={site.name}>
  <section class="hero">
    <h1 class="name">{site.name}</h1>
    <p class="role">{site.role}</p>
    <p class="bio">{site.shortBio}</p>
    <nav class="hero-links" aria-label="About">
      <a href="/about">about</a>
      <span aria-hidden="true">·</span>
      <a href="/cv">cv</a>
      <span aria-hidden="true">·</span>
      <a href="/contact">contact</a>
    </nav>
  </section>

  <section class="selected">
    <SectionLabel label="selected work" />
    {pubs.length === 0 ? (
      <p class="empty">No selected work yet — mark publications with <code>highlight: true</code>.</p>
    ) : (
      <ul class="pub-list">
        {pubs.map((p) => (
          <li class="pub-row">
            <span class="yr">'{String(p.data.year).slice(-2)}</span>
            <a href={`/research/${p.id}`} class="title">{p.data.title}</a>
            <span class="venue">{p.data.venue}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
</BaseLayout>

<style>
  .hero {
    max-width: var(--measure);
    margin: 0 auto;
    padding: var(--space-16) var(--gutter) var(--space-12);
  }
  .name {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.05;
  }
  .role {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-faint);
    margin-top: var(--space-2);
  }
  .bio {
    margin-top: var(--space-6);
    color: var(--text-soft);
    font-size: var(--text-lg);
    line-height: 1.5;
  }
  .hero-links {
    margin-top: var(--space-6);
    display: flex;
    gap: var(--space-3);
    align-items: center;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-faint);
  }
  .hero-links a { color: var(--accent); }
  .selected {
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 var(--gutter) var(--space-12);
  }
  .empty {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-faint);
  }
  .empty code { color: var(--accent); }
  .pub-list { list-style: none; }
  .pub-row {
    display: grid;
    grid-template-columns: 3rem 1fr auto;
    gap: var(--space-4);
    align-items: baseline;
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--rule);
  }
  .pub-row .yr {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-faint);
  }
  .pub-row .title {
    color: var(--text);
    text-decoration: none;
    border-bottom: 1px solid var(--accent-soft);
  }
  .pub-row .title:hover { color: var(--accent); }
  .pub-row .venue {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-faint);
  }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds; no type errors.

- [ ] **Step 3: Verify dev rendering**

Run: `npm run dev`
Expected: hero with name + role + bio + 3 links. "Selected work" section shows the one example publication (highlight: true). Clicking it navigates to `/research/_example` (will 404 until Task 5 — that's expected for now).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: homepage hero with selected publications"
```

---

### Task 5: Publications (research)

**Files:**
- Create: `src/components/PaperRow.astro`
- Create: `src/pages/research/index.astro`
- Create: `src/pages/research/[slug].astro`

**Interfaces:**
- Consumes: `getCollection('publications')`.
- Produces: `/research` and `/research/[slug]` routes.

- [ ] **Step 1: Create `src/components/PaperRow.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
const { entry } = Astro.props as { entry: CollectionEntry<'publications'> };
const { title, authors, venue, year, type } = entry.data;
---
<li class="row">
  <span class="yr">'{String(year).slice(-2)}</span>
  <div class="main">
    <a href={`/research/${entry.id}`} class="title">{title}</a>
    <span class="meta">{authors.join(', ')} · {venue}</span>
  </div>
  <span class="type">{type}</span>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: 3rem 1fr auto;
    gap: var(--space-4);
    align-items: baseline;
    padding: var(--space-4) 0;
    border-bottom: 1px solid var(--rule);
  }
  .yr { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .main { display: flex; flex-direction: column; gap: 0.25rem; }
  .title { color: var(--text); text-decoration: none; border-bottom: 1px solid var(--accent-soft); font-size: var(--text-base); }
  .title:hover { color: var(--accent); }
  .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .type {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-faint);
  }
</style>
```

- [ ] **Step 2: Create `src/pages/research/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import PaperRow from '../../components/PaperRow.astro';
import { getCollection } from 'astro:content';

const all = await getCollection('publications');
const types = ['all', 'conference', 'journal', 'workshop', 'preprint', 'thesis'] as const;
const activeType = (Astro.url.searchParams.get('type') ?? 'all') as (typeof types)[number];

const filtered = all
  .filter((p) => activeType === 'all' || p.data.type === activeType)
  .sort((a, b) => Number(b.data.highlight) - Number(a.data.highlight) || b.data.year - a.data.year);
---
<BaseLayout title="Research" section="/research">
  <section class="page">
    <SectionLabel label="research" />
    <h1>Publications</h1>
    <p class="intro">Selected papers on efficient inference for large language models.</p>

    <nav class="filters" aria-label="Filter by type">
      {types.map((t) => (
        <a
          href={t === 'all' ? '/research' : `/research?type=${t}`}
          class:list={['chip', { active: t === activeType }]}
        >{t}</a>
      ))}
    </nav>

    <ul class="list">
      {filtered.map((entry) => <PaperRow entry={entry} />)}
    </ul>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  h1 { font-size: var(--text-2xl); font-weight: 600; }
  .intro { color: var(--text-soft); margin-top: var(--space-2); max-width: var(--measure); }
  .filters { display: flex; gap: var(--space-2); flex-wrap: wrap; margin: var(--space-8) 0 var(--space-4); }
  .chip {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--rule);
    border-radius: 4px;
    color: var(--text-faint);
    text-decoration: none;
  }
  .chip:hover { color: var(--text); border-color: var(--text-faint); }
  .chip.active { color: var(--accent); border-color: var(--accent); }
  .list { list-style: none; }
</style>
```

- [ ] **Step 3: Create `src/pages/research/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const pubs = await getCollection('publications');
  return pubs.map((p) => ({ params: { slug: p.id }, props: { entry: p } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, authors, venue, year, type, pdf, arxiv, doi, code, slides } = entry.data;

const bibtex = `@${type}{${entry.id},
  title  = {${title}},
  author = {${authors.join(' and ')}},
  venue  = {${venue}},
  year   = {${year}},
}`;
---
<BaseLayout title={title} section="/research">
  <article class="paper">
    <p class="crumb"><a href="/research">research</a> ›</p>
    <h1>{title}</h1>
    <p class="authors">{authors.join(', ')}</p>
    <p class="meta">
      <span>{venue} {year}</span>
      <span>·</span>
      <span class="type">{type}</span>
    </p>

    {(pdf || arxiv || doi || code || slides) && (
      <nav class="links" aria-label="Paper links">
        {pdf && <a href={pdf}>pdf</a>}
        {arxiv && <a href={`https://arxiv.org/abs/${arxiv}`}>arxiv</a>}
        {doi && <a href={`https://doi.org/${doi}`}>doi</a>}
        {code && <a href={code}>code</a>}
        {slides && <a href={slides}>slides</a>}
      </nav>
    )}

    <details class="bibtex">
      <summary>Cite (BibTeX)</summary>
      <pre><code>{bibtex}</code></pre>
    </details>

    <div class="body">
      <Content />
    </div>

    <p class="back"><a href="/research">← back to research</a></p>
  </article>
</BaseLayout>

<style>
  .paper { max-width: var(--measure); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  .crumb { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .crumb a { color: var(--text-faint); }
  h1 { font-size: var(--text-2xl); font-weight: 600; margin-top: var(--space-2); }
  .authors { color: var(--text-soft); margin-top: var(--space-2); }
  .meta {
    display: flex; gap: var(--space-2); align-items: center;
    font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint);
    margin-top: var(--space-1);
  }
  .meta .type { text-transform: uppercase; letter-spacing: 0.1em; }
  .links { display: flex; gap: var(--space-4); margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-sm); }
  .bibtex { margin-top: var(--space-6); border-top: 1px solid var(--rule); padding-top: var(--space-4); }
  .bibtex summary { cursor: pointer; font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-faint); }
  .bibtex pre { margin-top: var(--space-3); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-soft); white-space: pre-wrap; }
  .body { margin-top: var(--space-8); }
  .back { margin-top: var(--space-12); font-family: var(--font-mono); font-size: var(--text-sm); }
</style>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds; `/research/index.html` and `/research/_example/index.html` generated.

- [ ] **Step 5: Verify dev rendering**

Run: `npm run dev`
Expected: `/research` shows filter chips + one paper row. Clicking the row → `/research/_example` with full detail page including BibTeX collapsible. Filter link `?type=conference` keeps the example visible; `?type=journal` hides it.

- [ ] **Step 6: Commit**

```bash
git add src/components/PaperRow.astro src/pages/research/
git commit -m "feat: research listing and detail pages"
```

---

### Task 6: Talks

**Files:**
- Create: `src/components/TalkRow.astro`
- Create: `src/pages/talks/index.astro`
- Create: `src/pages/talks/[slug].astro`

**Interfaces:**
- Consumes: `getCollection('talks')`.
- Produces: `/talks` and `/talks/[slug]` routes.

- [ ] **Step 1: Create `src/components/TalkRow.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
const { entry } = Astro.props as { entry: CollectionEntry<'talks'> };
const { title, venue, date, type, location } = entry.data;
const yr = date.getFullYear();
---
<li class="row">
  <span class="yr">{yr}</span>
  <div class="main">
    <a href={`/talks/${entry.id}`} class="title">{title}</a>
    <span class="meta">{venue} · {location}</span>
  </div>
  <span class="type">{type}</span>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: 4rem 1fr auto;
    gap: var(--space-4);
    align-items: baseline;
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--rule);
  }
  .yr { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .main { display: flex; flex-direction: column; gap: 0.25rem; }
  .title { color: var(--text); text-decoration: none; border-bottom: 1px solid var(--accent-soft); }
  .title:hover { color: var(--accent); }
  .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .type { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-faint); }
</style>
```

- [ ] **Step 2: Create `src/pages/talks/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import TalkRow from '../../components/TalkRow.astro';
import { getCollection } from 'astro:content';

const talks = (await getCollection('talks'))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const byYear = new Map<number, typeof talks>();
for (const t of talks) {
  const y = t.data.date.getFullYear();
  if (!byYear.has(y)) byYear.set(y, []);
  byYear.get(y)!.push(t);
}
const years = [...byYear.keys()].sort((a, b) => b - a);
---
<BaseLayout title="Talks" section="/talks">
  <section class="page">
    <SectionLabel label="talks" />
    <h1>Talks & Posters</h1>
    <p class="intro">Conference talks, posters, tutorials, and invited presentations.</p>

    {years.map((year) => (
      <section class="year-block">
        <h2 class="year">{year}</h2>
        <ul class="list">
          {byYear.get(year)!.map((entry) => <TalkRow entry={entry} />)}
        </ul>
      </section>
    ))}
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  h1 { font-size: var(--text-2xl); font-weight: 600; }
  .intro { color: var(--text-soft); margin-top: var(--space-2); max-width: var(--measure); }
  .year-block { margin-top: var(--space-8); }
  .year { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); margin-bottom: var(--space-2); }
  .list { list-style: none; }
</style>
```

- [ ] **Step 3: Create `src/pages/talks/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const items = await getCollection('talks');
  return items.map((t) => ({ params: { slug: t.id }, props: { entry: t } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, venue, date, type, location, slides } = entry.data;
const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title={title} section="/talks">
  <article class="talk">
    <p class="crumb"><a href="/talks">talks</a> ›</p>
    <h1>{title}</h1>
    <p class="meta">
      <span>{fmt.format(date)}</span>
      <span>·</span>
      <span>{venue}</span>
      <span>·</span>
      <span>{location}</span>
      <span>·</span>
      <span class="type">{type}</span>
    </p>
    {slides && <p class="links"><a href={slides}>slides</a></p>}
    <div class="body"><Content /></div>
    <p class="back"><a href="/talks">← back to talks</a></p>
  </article>
</BaseLayout>

<style>
  .talk { max-width: var(--measure); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  .crumb { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .crumb a { color: var(--text-faint); }
  h1 { font-size: var(--text-2xl); font-weight: 600; margin-top: var(--space-2); }
  .meta { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .meta .type { text-transform: uppercase; letter-spacing: 0.1em; }
  .links { margin-top: var(--space-4); font-family: var(--font-mono); font-size: var(--text-sm); }
  .body { margin-top: var(--space-8); }
  .back { margin-top: var(--space-12); font-family: var(--font-mono); font-size: var(--text-sm); }
</style>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Verify dev rendering**

Run: `npm run dev`
Expected: `/talks` shows one year heading with the example talk. Detail page reachable.

- [ ] **Step 6: Commit**

```bash
git add src/components/TalkRow.astro src/pages/talks/
git commit -m "feat: talks listing and detail pages"
```

---

### Task 7: Teaching + Supervision (single page)

**Files:**
- Create: `src/pages/teaching/index.astro`

**Interfaces:**
- Consumes: `getCollection('teaching')`, `getCollection('supervision')`.

- [ ] **Step 1: Create `src/pages/teaching/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import { getCollection } from 'astro:content';

const teaching = (await getCollection('teaching')).sort((a, b) => b.data.year - a.data.year);
const supervision = (await getCollection('supervision')).sort((a, b) => b.data.year - a.data.year);
---
<BaseLayout title="Teaching" section="/teaching">
  <section class="page">
    <SectionLabel label="teaching" />
    <h1>Teaching & Supervision</h1>

    <h2 class="sub">Teaching</h2>
    <ul class="list">
      {teaching.map((t) => (
        <li class="row">
          <span class="yr">{t.data.year}</span>
          <div class="main">
            <span class="title">{t.data.course}</span>
            <span class="meta">{t.data.role} · {t.data.institution}{t.data.semester ? ` · ${t.data.semester}` : ''}</span>
            {t.data.url && <a class="link" href={t.data.url}>course page →</a>}
          </div>
        </li>
      ))}
    </ul>

    <h2 class="sub">Supervision</h2>
    <ul class="list">
      {supervision.map((s) => (
        <li class="row">
          <span class="yr">{s.data.year}</span>
          <div class="main">
            <span class="title">{s.data.student} <span class="level">({s.data.level})</span></span>
            <span class="meta">{s.data.topic} · {s.data.role}</span>
          </div>
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  h1 { font-size: var(--text-2xl); font-weight: 600; }
  .sub {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: var(--accent);
    margin-top: var(--space-12);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--rule);
  }
  .list { list-style: none; }
  .row { display: grid; grid-template-columns: 4rem 1fr; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--rule); }
  .yr { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .main { display: flex; flex-direction: column; gap: 0.25rem; }
  .title { color: var(--text); }
  .level { color: var(--text-faint); font-family: var(--font-mono); font-size: var(--text-xs); }
  .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .link { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent); }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Verify dev rendering**

Run: `npm run dev`
Expected: `/teaching` shows two sections (Teaching, Supervision), each with the example entry.

- [ ] **Step 4: Commit**

```bash
git add src/pages/teaching/
git commit -m "feat: teaching and supervision page"
```

---

### Task 8: Notes (write-ups) + RSS

**Files:**
- Create: `src/components/NoteRow.astro`
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[slug].astro`
- Create: `src/pages/rss.xml.js`

**Interfaces:**
- Consumes: `getCollection('notes')`.
- Produces: `/notes`, `/notes/[slug]`, `/rss.xml`.

- [ ] **Step 1: Create `src/components/NoteRow.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
const { entry } = Astro.props as { entry: CollectionEntry<'notes'> };
const { title, date, description } = entry.data;
const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---
<li class="row">
  <span class="date">{fmt.format(date)}</span>
  <div class="main">
    <a href={`/notes/${entry.id}`} class="title">{title}</a>
    <p class="desc">{description}</p>
  </div>
</li>

<style>
  .row { display: grid; grid-template-columns: 9rem 1fr; gap: var(--space-4); padding: var(--space-4) 0; border-bottom: 1px solid var(--rule); }
  .date { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); padding-top: 2px; }
  .main { display: flex; flex-direction: column; gap: 0.25rem; }
  .title { color: var(--text); text-decoration: none; font-size: var(--text-lg); border-bottom: 1px solid transparent; }
  .title:hover { color: var(--accent); border-bottom-color: var(--accent-soft); }
  .desc { color: var(--text-soft); font-size: var(--text-sm); }
</style>
```

- [ ] **Step 2: Create `src/pages/notes/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import NoteRow from '../../components/NoteRow.astro';
import { getCollection } from 'astro:content';

const isProd = import.meta.env.PROD;
const notes = (await getCollection('notes'))
  .filter((n) => !isProd || !n.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title="Notes" section="/notes">
  <section class="page">
    <SectionLabel label="notes" />
    <h1>Notes</h1>
    <p class="intro">Short write-ups, half-baked ideas, and reference posts.</p>
    <ul class="list">
      {notes.map((entry) => <NoteRow entry={entry} />)}
    </ul>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  h1 { font-size: var(--text-2xl); font-weight: 600; }
  .intro { color: var(--text-soft); margin-top: var(--space-2); max-width: var(--measure); }
  .list { list-style: none; margin-top: var(--space-8); }
</style>
```

- [ ] **Step 3: Create `src/pages/notes/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const notes = await getCollection('notes');
  return notes
    .filter((n) => !n.data.draft || !import.meta.env.PROD)
    .map((n) => ({ params: { slug: n.id }, props: { entry: n } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, date, description, tags } = entry.data;
const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title={title} description={description} section="/notes">
  <article class="note">
    <p class="crumb"><a href="/notes">notes</a> ›</p>
    <h1>{title}</h1>
    <p class="meta">
      <span>{fmt.format(date)}</span>
      {tags && tags.length > 0 && (
        <>
          <span>·</span>
          <span>{tags.join(', ')}</span>
        </>
      )}
    </p>
    <div class="body"><Content /></div>
    <p class="back"><a href="/notes">← back to notes</a></p>
  </article>
</BaseLayout>

<style>
  .note { max-width: var(--measure); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  .crumb { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .crumb a { color: var(--text-faint); }
  h1 { font-size: var(--text-2xl); font-weight: 600; margin-top: var(--space-2); }
  .meta { display: flex; gap: var(--space-2); margin-top: var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .body { margin-top: var(--space-8); }
  .back { margin-top: var(--space-12); font-family: var(--font-mono); font-size: var(--text-sm); }
</style>
```

- [ ] **Step 4: Create `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const notes = (await getCollection('notes'))
    .filter((n) => !n.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Dalton Harmsen — Notes',
    description: 'Short write-ups, half-baked ideas, and reference posts.',
    site: context.site,
    items: notes.map((n) => ({
      title: n.data.title,
      pubDate: n.data.date,
      description: n.data.description,
      link: `/notes/${n.id}/`,
    })),
  });
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds; `/rss.xml` generated.

- [ ] **Step 6: Verify dev rendering**

Run: `npm run dev`
Expected: `/notes` lists the example (visible because draft in dev mode). Clicking → detail. `/rss.xml` shows valid XML. (In `npm run build` + `preview`, the draft is excluded.)

- [ ] **Step 7: Commit**

```bash
git add src/components/NoteRow.astro src/pages/notes/ src/pages/rss.xml.js
git commit -m "feat: notes listing, detail, and rss feed"
```

---

### Task 9: Hobby (categories + posts, 2-level)

**Files:**
- Create: `src/components/HobbyPostRow.astro`
- Create: `src/pages/hobby/index.astro`
- Create: `src/pages/hobby/[category]/index.astro`
- Create: `src/pages/hobby/[category]/[post].astro`

**Interfaces:**
- Consumes: `getCollection('hobbies')`, `getCollection('hobby-posts')`.
- Produces: `/hobby`, `/hobby/[category]`, `/hobby/[category]/[post]`.
- Reference check: every `hobby-posts/*.md` `hobby:` field must reference a real `hobbies/` entry.

- [ ] **Step 1: Create `src/components/HobbyPostRow.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
const { entry, category } = Astro.props as {
  entry: CollectionEntry<'hobby-posts'>;
  category: string;
};
const { title, date } = entry.data;
const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---
<li class="row">
  <span class="date">{fmt.format(date)}</span>
  <a href={`/hobby/${category}/${entry.id}`} class="title">{title}</a>
</li>

<style>
  .row { display: grid; grid-template-columns: 9rem 1fr; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--rule); align-items: baseline; }
  .date { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .title { color: var(--text); text-decoration: none; border-bottom: 1px solid var(--accent-soft); }
  .title:hover { color: var(--accent); }
</style>
```

- [ ] **Step 2: Create `src/pages/hobby/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import { getCollection } from 'astro:content';

const hobbies = await getCollection('hobbies');
const posts = await getCollection('hobby-posts');

// Sort: those with `order` first (ascending by order), then alphabetical by title.
const sorted = [...hobbies].sort((a, b) => {
  const ao = a.data.order, bo = b.data.order;
  if (ao != null && bo != null) return ao - bo;
  if (ao != null) return -1;
  if (bo != null) return 1;
  return a.data.title.localeCompare(b.data.title);
});

const counts = new Map<string, { count: number; last: Date }>();
for (const p of posts) {
  const cat = String(p.data.hobby);
  const cur = counts.get(cat) ?? { count: 0, last: new Date(0) };
  cur.count += 1;
  if (p.data.date > cur.last) cur.last = p.data.date;
  counts.set(cat, cur);
}
---
<BaseLayout title="Hobby" section="/hobby">
  <section class="page">
    <SectionLabel label="hobby" />
    <h1>Off the clock</h1>
    <p class="intro">Things I do when I'm not thinking about sparse routing.</p>

    <ul class="grid">
      {sorted.map((h) => {
        const stat = counts.get(h.id);
        const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return (
          <li class="card">
            <a href={`/hobby/${h.id}`}>
              {h.data.image && <img src={h.data.image} alt="" class="img" loading="lazy" />}
              <div class="body">
                <h2 class="title">{h.data.title}</h2>
                {h.data.description && <p class="desc">{h.data.description}</p>}
                <p class="meta">
                  {stat ? `${stat.count} post${stat.count === 1 ? '' : 's'}` : 'no posts'}
                  {stat && ` · last ${fmt.format(stat.last)}`}
                </p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  h1 { font-size: var(--text-2xl); font-weight: 600; }
  .intro { color: var(--text-soft); margin-top: var(--space-2); max-width: var(--measure); }
  .grid { list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); margin-top: var(--space-8); }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
  .card a { display: block; color: inherit; text-decoration: none; border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; transition: border-color 0.15s ease; }
  .card a:hover { border-color: var(--accent); }
  .img { aspect-ratio: 16 / 10; object-fit: cover; background: var(--bg-elev); }
  .body { padding: var(--space-4); }
  .title { font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 500; }
  .desc { color: var(--text-soft); font-size: var(--text-sm); margin-top: var(--space-2); }
  .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); margin-top: var(--space-3); }
</style>
```

- [ ] **Step 3: Create `src/pages/hobby/[category]/index.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import SectionLabel from '../../../components/SectionLabel.astro';
import HobbyPostRow from '../../../components/HobbyPostRow.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const hobbies = await getCollection('hobbies');
  return hobbies.map((h) => ({ params: { category: h.id }, props: { hobby: h } }));
}

const { hobby } = Astro.props;
const isProd = import.meta.env.PROD;

const posts = (await getCollection('hobby-posts'))
  .filter((p) => String(p.data.hobby) === hobby.id)
  .filter((p) => !isProd || !p.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout title={hobby.data.title} section="/hobby">
  <section class="page">
    <p class="crumb"><a href="/hobby">hobby</a> ›</p>
    <SectionLabel label={hobby.data.title} />
    {hobby.data.description && <p class="intro">{hobby.data.description}</p>}
    <ul class="list">
      {posts.map((entry) => <HobbyPostRow entry={entry} category={hobby.id} />)}
    </ul>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  .crumb { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); margin-bottom: var(--space-2); }
  .crumb a { color: var(--text-faint); }
  .intro { color: var(--text-soft); max-width: var(--measure); margin-bottom: var(--space-6); }
  .list { list-style: none; }
</style>
```

- [ ] **Step 4: Create `src/pages/hobby/[category]/[post].astro`** with build-time reference check

```astro
---
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const [posts, hobbies] = await Promise.all([
    getCollection('hobby-posts'),
    getCollection('hobbies'),
  ]);
  const hobbyIds = new Set(hobbies.map((h) => h.id));

  // Build-time reference check: every post's `hobby` must point to a real hobby.
  for (const p of posts) {
    const ref = String(p.data.hobby);
    if (!hobbyIds.has(ref)) {
      throw new Error(
        `hobby-posts/${p.id}.md references hobby "${ref}" which does not exist in src/content/hobbies/.`
      );
    }
  }

  return posts
    .filter((p) => !p.data.draft || !import.meta.env.PROD)
    .map((p) => ({
      params: { category: String(p.data.hobby), post: p.id },
      props: { entry: p },
    }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, date, tags } = entry.data;
const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---
<BaseLayout title={title} section="/hobby">
  <article class="post">
    <p class="crumb">
      <a href="/hobby">hobby</a> › <a href={`/hobby/${entry.data.hobby}`}>{String(entry.data.hobby)}</a> ›
    </p>
    <h1>{title}</h1>
    <p class="meta">
      <span>{fmt.format(date)}</span>
      {tags && tags.length > 0 && (
        <>
          <span>·</span>
          <span>{tags.join(', ')}</span>
        </>
      )}
    </p>
    <div class="body"><Content /></div>
    <p class="back"><a href={`/hobby/${entry.data.hobby}`}>← back to {String(entry.data.hobby)}</a></p>
  </article>
</BaseLayout>

<style>
  .post { max-width: var(--measure); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  .crumb { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-faint); }
  .crumb a { color: var(--text-faint); }
  h1 { font-size: var(--text-2xl); font-weight: 600; margin-top: var(--space-2); }
  .meta { display: flex; gap: var(--space-2); margin-top: var(--space-2); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-faint); }
  .body { margin-top: var(--space-8); }
  .back { margin-top: var(--space-12); font-family: var(--font-mono); font-size: var(--text-sm); }
</style>
```

- [ ] **Step 5: Add a placeholder hobby image at `public/images/hobby/photography.jpg`**

Run: `mkdir -p public/images/hobby && curl -sL -o public/images/hobby/photography.jpg https://placehold.co/640x400/fbfaf5/1e3a5f/png?text=photography`
Expected: file exists. (If offline, any 640×400 JPEG placeholder works; the spec image is referenced from `hobbies/photography.md`.)

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds. Reference check passes (photography exists). `/hobby/photography/index.html` and `/hobby/photography/2025-06-15-drenthe/index.html` generated.

- [ ] **Step 7: Verify reference check fails on bad input**

Temporarily edit `src/content/hobby-posts/2025-06-15-drenthe.md` and change `hobby: photography` to `hobby: nonexistent`. Run: `npm run build`.
Expected: build FAILS with the error message naming the bad file and reference. Restore the file to `hobby: photography`. Re-run build. Expected: succeeds.

- [ ] **Step 8: Verify dev rendering**

Run: `npm run dev`
Expected: `/hobby` shows the Photography card with image, post count "1 post · last Jun 15, 2025". Clicking → category page with one post. Clicking the post → detail page.

- [ ] **Step 9: Commit**

```bash
git add src/components/HobbyPostRow.astro src/pages/hobby/ public/images/
git commit -m "feat: hobby category and post pages with reference check"
```

---

### Task 10: About + CV pages

**Files:**
- Create: `src/content/about.md`
- Create: `src/content/cv.md`
- Create: `src/pages/about.astro`
- Create: `src/pages/cv.astro`
- Create: `public/cv.pdf` (placeholder)

**Interfaces:**
- Consumes: `about` and `cv` singleton collections declared in Task 3. Rendered via `getEntry()` + `render()` from `astro:content`.

- [ ] **Step 1: Create `src/content/about.md`**

```markdown
---
title: "About"
---

# About me

I'm a PhD student at Eindhoven University of Technology working on efficient
inference for large language models. My research focuses on sparsity, routing,
and the trade-offs between quality and compute.

Replace this with your full about page — research statement, background,
interests, etc.
```

- [ ] **Step 2: Create `src/content/cv.md`**

```markdown
---
title: "Curriculum Vitae"
---

# Dalton Harmsen

PhD student in AI Foundation Models, Eindhoven University of Technology.

## Education

- **MSc, Computer Science** — Example University, 2023
- **BSc, Computer Science** — Example University, 2021

## Experience

- **PhD Researcher (AI Foundation Models)** — TU Eindhoven, 2023–present

## Publications

See [/research](/research).

## Skills

- ML: PyTorch, JAX, distributed training
- Systems: C++, CUDA, Triton

Replace this with your full CV in Markdown. Keep it visually in sync with the
canonical `/public/cv.pdf`.
```

- [ ] **Step 3: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { getEntry, render } from 'astro:content';

const entry = await getEntry('about');
const { Content } = await render(entry);
---
<BaseLayout title="About" section="/about">
  <section class="page">
    <SectionLabel label="about" />
    <article class="prose">
      <Content />
    </article>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--measure); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  :global(.prose h1) { font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-4); }
  :global(.prose h2) { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.13em; color: var(--accent); margin-top: var(--space-8); padding-bottom: var(--space-2); border-bottom: 1px solid var(--rule); }
  :global(.prose p) { margin-top: var(--space-4); color: var(--text-soft); }
  :global(.prose ul) { margin-top: var(--space-4); padding-left: var(--space-6); }
  :global(.prose li) { margin-top: var(--space-2); color: var(--text-soft); }
</style>
```

- [ ] **Step 4: Create `src/pages/cv.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { getEntry, render } from 'astro:content';

const entry = await getEntry('cv');
const { Content } = await render(entry);
---
<BaseLayout title="CV">
  <section class="page">
    <SectionLabel label="cv" />
    <a href="/cv.pdf" class="pdf">download pdf ↓</a>
    <article class="prose">
      <Content />
    </article>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--measure); margin: 0 auto; padding: var(--space-12) var(--gutter); position: relative; }
  .pdf {
    position: absolute;
    top: var(--space-12);
    right: var(--gutter);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
  }
  :global(.prose h1) { font-size: var(--text-2xl); font-weight: 600; margin-bottom: var(--space-4); }
  :global(.prose h2) { font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.13em; color: var(--accent); margin-top: var(--space-8); padding-bottom: var(--space-2); border-bottom: 1px solid var(--rule); }
  :global(.prose p), :global(.prose ul) { color: var(--text-soft); margin-top: var(--space-4); }
  :global(.prose ul) { padding-left: var(--space-6); }
  :global(.prose li) { margin-top: var(--space-2); }
</style>
```

- [ ] **Step 5: Create a placeholder `public/cv.pdf`**

Run: `printf '%%PDF-1.4\nplaceholder cv.pdf — replace with the real canonical PDF.\n%%%%EOF\n' > public/cv.pdf`
Expected: file exists at `public/cv.pdf` (~60 bytes). Replace with real PDF later.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds; `/about/index.html` and `/cv/index.html` generated; `cv.pdf` copied to `dist/`.

- [ ] **Step 7: Verify dev rendering**

Run: `npm run dev`
Expected: `/about` renders Markdown as styled prose with section headings. `/cv` renders Markdown with a "download pdf ↓" link in the top-right; clicking downloads the placeholder.

- [ ] **Step 8: Commit**

```bash
git add src/content/about.md src/content/cv.md src/pages/about.astro src/pages/cv.astro public/cv.pdf
git commit -m "feat: about and cv pages"
```

---

### Task 11: Contact page (Web3Forms)

**Files:**
- Create: `src/components/ContactForm.astro`
- Create: `src/pages/contact.astro`

**Interfaces:**
- Consumes: `WEB3FORMS_ACCESS_KEY` from `import.meta.env`.
- Produces: `/contact` with a form that POSTs to Web3Forms.

- [ ] **Step 1: Create `src/components/ContactForm.astro`**

```astro
---
const accessKey = import.meta.env.WEB3FORMS_ACCESS_KEY;
---
<form
  action="https://api.web3forms.com/submit"
  method="POST"
  class="form"
  data-form
>
  <input type="hidden" name="access_key" value={accessKey} />
  <input type="hidden" name="subject" value="New message via dharmsen.github.io" />
  <input type="checkbox" name="botcheck" class="honeypot" tabindex="-1" autocomplete="off" />

  <label class="field">
    <span>name</span>
    <input type="text" name="name" required autocomplete="name" />
  </label>

  <label class="field">
    <span>reply-to</span>
    <input type="email" name="email" required autocomplete="email" />
  </label>

  <label class="field">
    <span>message</span>
    <textarea name="message" rows="6" required></textarea>
  </label>

  <button type="submit" class="submit">send →</button>

  <p class="status" data-status hidden></p>
</form>

<script>
  const form = document.querySelector<HTMLFormElement>('[data-form]');
  const status = document.querySelector<HTMLParagraphElement>('[data-status]');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status || !form) return;
    status.hidden = false;
    status.textContent = 'sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const json = await res.json();
      if (json.success) {
        form.reset();
        status.textContent = 'thanks — your message is on its way.';
      } else {
        status.textContent = 'something went wrong. please try again.';
      }
    } catch {
      status.textContent = 'network error. please try again.';
    }
  });
</script>

<style>
  .form { display: flex; flex-direction: column; gap: var(--space-4); max-width: var(--measure); }
  .honeypot { display: none; }
  .field { display: flex; flex-direction: column; gap: var(--space-2); }
  .field span {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-faint);
  }
  .field input, .field textarea {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    background: var(--bg-elev);
    color: var(--text);
    border: 1px solid var(--rule);
    border-radius: 4px;
    padding: var(--space-3);
  }
  .field input:focus, .field textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: 0;
    border-color: var(--accent);
  }
  .submit {
    align-self: flex-start;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--bg);
    background: var(--accent);
    padding: var(--space-3) var(--space-6);
    border-radius: 4px;
  }
  .submit:hover { background: var(--text); }
  .status { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-soft); }
</style>
```

- [ ] **Step 2: Create `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import ContactForm from '../components/ContactForm.astro';
import { site } from '../data/site';
---
<BaseLayout title="Contact">
  <section class="page">
    <SectionLabel label="contact" />
    <h1>Contact</h1>
    <p class="intro">The fastest way to reach me is the form below.</p>

    <ContactForm />

    <p class="elsewhere">
      Or find me on
      <a href={site.social.scholar}>scholar</a>,
      <a href={site.social.github}>github</a>,
      <a href={site.social.linkedin}>linkedin</a>,
      <a href={site.social.x}>x</a>.
    </p>
  </section>
</BaseLayout>

<style>
  .page { max-width: var(--container); margin: 0 auto; padding: var(--space-12) var(--gutter); }
  h1 { font-size: var(--text-2xl); font-weight: 600; }
  .intro { color: var(--text-soft); margin-top: var(--space-2); max-width: var(--measure); }
  .elsewhere {
    margin-top: var(--space-12);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-faint);
  }
  .elsewhere a { color: var(--accent); }
</style>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds. No warning about missing `WEB3FORMS_ACCESS_KEY` (only fails at runtime submit if unset — by design; the key is read from env at build time and inlined into the HTML, so set it before deploy).

- [ ] **Step 4: Verify dev rendering (no key set)**

Without `.env`, run: `npm run dev`
Expected: form renders with the hidden access_key value empty. Submit returns Web3Forms "access key required" error → status shows "something went wrong" — that's expected without a key.

- [ ] **Step 5: Verify dev rendering (with key set)**

Create `.env` with `WEB3FORMS_ACCESS_KEY=test-key-from-web3forms`. Run: `npm run dev`. Submit the form with a real message + your email.
Expected: success state, "thanks — your message is on its way." You should receive the message in your inbox. Delete `.env` after testing (it's gitignored).

- [ ] **Step 6: Commit**

```bash
git add src/components/ContactForm.astro src/pages/contact.astro
git commit -m "feat: contact page with web3forms backend"
```

---

### Task 12: 404 page + sitemap verification

**Files:**
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: Astro's automatic `@astrojs/sitemap` integration from Task 1.

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Not found">
  <section class="nf">
    <p class="code">404</p>
    <p class="msg">This page doesn't exist.</p>
    <a href="/" class="home">← go home</a>
  </section>
</BaseLayout>

<style>
  .nf {
    max-width: var(--measure);
    margin: var(--space-24) auto;
    padding: 0 var(--gutter);
    text-align: center;
  }
  .code { font-family: var(--font-mono); font-size: var(--text-3xl); color: var(--accent); }
  .msg { color: var(--text-soft); margin-top: var(--space-2); }
  .home {
    display: inline-block;
    margin-top: var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
</style>
```

- [ ] **Step 2: Verify build generates sitemap and 404**

Run: `npm run build`
Expected: `dist/404.html` and `dist/sitemap-index.xml` generated.

- [ ] **Step 3: Verify dev rendering**

Run: `npm run dev`
Visit: `http://localhost:4321/some-nonexistent-page`
Expected: 404 page renders with mono `404` and "go home" link.

- [ ] **Step 4: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: 404 page"
```

---

### Task 13: Cleanup old files + comprehensive README

**Files:**
- Delete: all files listed in Global Constraints "Deletions"
- Create: `README.md`

**Interfaces:**
- None. This task removes the old Jekyll template and root terminal portfolio, then writes the comprehensive authoring README.

- [ ] **Step 1: Delete old Jekyll template and root terminal portfolio**

Run, one line:

```bash
git rm -r _config.yml _layouts _includes _sass _data _pages _publications _talks _teaching _portfolio _posts _drafts Gemfile Gemfile.lock markdown_generator talkmap* Dockerfile docker-compose.yaml .devcontainer index.html style.css art.txt blog.html projects.html contact.html
```

Expected: all listed paths removed. If any path doesn't exist (e.g. `_drafts`), `git rm -r` will warn; remove the missing path from the command and re-run. (The current repo's git status shows all of these exist except possibly `_drafts`.)

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: succeeds. No Jekyll references anywhere; no broken imports.

- [ ] **Step 3: Verify dev server works**

Run: `npm run dev`
Expected: all routes work (`/`, `/research`, `/talks`, `/teaching`, `/notes`, `/hobby`, `/about`, `/cv`, `/contact`).

- [ ] **Step 4: Create `README.md`**

Write the comprehensive authoring guide. Full content:

````markdown
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
to `/public/cv.pdf`. Keep them visually in sync by hand.

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
deploy and email the repo owner. First-time setup: enable Actions and Pages
in the repo settings (Pages → source: GitHub Actions).

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
````

- [ ] **Step 5: Verify README renders**

Open `README.md` in a Markdown previewer. Confirm all 13 sections render and
code blocks are valid.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove jekyll template, add comprehensive README"
```

---

### Task 14: GitHub Actions deploy workflow + npm scripts verification

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `package.json` scripts from Task 1.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          WEB3FORMS_ACCESS_KEY: ${{ secrets.WEB3FORMS_ACCESS_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add `WEB3FORMS_ACCESS_KEY` to GitHub repo secrets**

In the GitHub repo: Settings → Secrets and variables → Actions → New repository secret. Name: `WEB3FORMS_ACCESS_KEY`, value: your real access key from https://web3forms.com. (User action — not automatable from CLI.)

- [ ] **Step 3: Enable GitHub Pages with Actions source**

In the GitHub repo: Settings → Pages → Build and deployment → Source: `GitHub Actions`. (User action — not automatable from CLI.)

- [ ] **Step 4: Verify `check:links` script works locally**

Run: `npm run build && npm run check:links`
Expected: `linkinator` walks `dist/`, all internal links resolve, exit 0.

- [ ] **Step 5: Verify workflow file is valid YAML**

Run: `npx --yes --package=ajv-cli -- ajv compile -s .github/workflows/deploy.yml 2>/dev/null || node -e "const y = require('fs').readFileSync('.github/workflows/deploy.yml', 'utf8'); console.log('YAML has', y.split('\\n').length, 'lines');"`
(Fallback: visually inspect for consistent 2-space indentation and the `on:`, `jobs:`, `steps:` keys.)

Expected: file parses as valid YAML with no syntax errors.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to github pages via actions"
```

- [ ] **Step 7: Push and confirm deploy**

Run: `git push origin overhaul-website` (then open a PR to `main` via `gh pr create`).
Expected: GitHub Actions tab shows the workflow running; first build succeeds; site appears at `https://dharmsen.github.io` within ~1 minute of merge.

---

## Self-Review Notes

### Spec coverage check

| Spec section | Covered by |
|---|---|
| §1 Purpose | Plan goal |
| §2 Aesthetic (editorial hybrid) | Task 1 (tokens), Task 2 (layout/components) |
| §3 Tech stack | Tasks 1, 14 |
| §3 Repo layout | File Structure section |
| §3 Deletions | Task 13 |
| §4 Publications schema | Task 3 + Task 5 |
| §4 Talks schema | Task 3 + Task 6 |
| §4 Teaching schema | Task 3 + Task 7 |
| §4 Supervision schema | Task 3 + Task 7 |
| §4 Notes schema | Task 3 + Task 8 |
| §4 Hobbies schema | Task 3 + Task 9 |
| §4 Hobby-posts schema | Task 3 + Task 9 (reference check) |
| §4 about.md | Task 10 |
| §4 cv.md | Task 10 |
| §5 Site config (site.ts) | Task 2 |
| §6 Nav & layout | Task 2 (Header/Footer), Task 4 (hero) |
| §6 Routes | Tasks 4–12 (each route covered) |
| §7 Visual design system | Task 1 (tokens.css), Task 2 (component conventions) |
| §7 Theme switching | Task 2 (ThemeToggle + BaseLayout inline script) |
| §7 Component inventory | Tasks 2, 5, 6, 8, 9, 11 |
| §8 Email/contact | Task 11 |
| §9 Adjustability | Task 13 README §8 |
| §10 Verification | Task 14 + per-task build steps |
| §11 Deliverables (README) | Task 13 |
| §12 Out of scope (YAGNI) | Not implemented — by design |

No gaps.

### Placeholder scan

No "TBD", "TODO", or "implement later" in any task. Every code block is
complete. Each step has a verifiable command and expected output.

### Type consistency

- `site` export used in Tasks 2, 4, 11 — same shape throughout.
- `PaperRow`, `TalkRow`, `NoteRow`, `HobbyPostRow` all take `entry: CollectionEntry<'...'>` — consistent.
- `getStaticPaths` returns `{ params, props }` consistently in Tasks 5, 6, 8, 9.
- `render(entry)` from `astro:content` used consistently in Tasks 5, 6, 8, 9, 10.
- `reference('hobbies')` in Task 3 produces `hobby` field accessed as `String(p.data.hobby)` in Task 9 — consistent.

### Known caveats (documented in tasks, not hidden)

- Task 11 needs `WEB3FORMS_ACCESS_KEY` set before deploy. Documented in Task 14 Step 2.
- Task 13 deletes files; `git rm -r` may warn on missing paths. Documented in Step 1.
- Task 9 placeholder image fetched via `curl` from `placehold.co`; if offline, any JPEG works. Documented in Step 5.
