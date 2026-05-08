# Reach Screens 2.0

A premium light-theme rebuild of [reachscreens.ca](https://reachscreens.ca) — same brand, same content, all-new look and motion. Production v1 is **untouched and unaffected** by this folder.

## Open it locally

```bash
cd "/Users/nicholasconnelly/Applications/Reach Site 2.0"
python3 -m http.server 8091
# then visit http://localhost:8091/index.html
```

Or, since the existing dev server on port 8090 (`/Users/nicholasconnelly/Applications`) is already running, you can also reach it at:
`http://localhost:8090/Reach%20Site%202.0/index.html`

## What's new vs. v1

| | v1 (live) | v2 (this folder) |
|---|---|---|
| **Theme** | Dark navy | Warm light/paper |
| **Type** | Inter only | Fraunces (serif display) + Inter + JetBrains Mono |
| **Hero** | Big bold sans | Word-by-word reveal serif headline with floating "orbit" cards |
| **Layout** | Standard grid sections | Bento grids (12-col), asymmetric, multi-tone cards |
| **Motion** | Reveal + counter | Reveal + counter + custom cursor + magnetic buttons + sticky-scroll process + word stagger |
| **Background** | Static dark | Animated aurora blobs + paper-grain noise overlay |
| **Process page** | Two timeline columns | Sticky-scroll image that swaps as steps activate |
| **CTA** | Floating screen mockups | Aurora-glow inside dark card, gradient headline accent |

## Pages

- `index.html` — hero, stats, logo marquee, bento "why it works", tag band, gallery, map, feature split, comparison, quote, FAQ, CTA
- `how-it-works.html` — sticky-scroll process for advertisers + hosts (tabbed)
- `pricing.html` — "Get a Recommendation" three-things bento + every-plan-includes
- `host.html` — host-side hero + benefits bento + ideal-hosts grid
- `about.html` — split intro + by-the-numbers + values bento + differentiators
- `contact.html` — same form as v1, hits the same `forms-api.reachscreens.ca/submit` endpoint
- `locations.html` — full venue list

## Design system

All tokens live in `:root` at the top of `styles.css`:

- **Brand**: teal `#0EB8A8` (deep), `#5CE0D2` (glow); accent gold + plum
- **Paper**: `#FAFAF7` warm, `#F4F3EE` mute, `#FFFFFF` surface
- **Ink**: `#0B1220` primary text, slate ramp for secondary
- **Type**: Fraunces variable for headlines (with `opsz` + `SOFT` axes), Inter for body, JetBrains Mono for eyebrows/labels
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` for everything except pop springs
- **Radii**: 8 / 12 / 16 / 22 / 28 / pill

## Motion primitives in `main.js`

- `splitHeroWords()` — splits hero h1 into per-word spans, animates with stagger
- `initCursor()` — desktop-only dot + ring follower with pop-on-CTA
- `initMagnetic()` — `.magnet` wrapper translates with cursor proximity
- `initReveal()` — IntersectionObserver toggles `.visible` on `.reveal`/`.stagger`/etc
- `initCounters()` — eased number ticker on `[data-count]`
- `initStickyProcess()` — `.process-step` becomes active when its center hits viewport center; swaps `[data-stuck-art]` images
- `initFaq()`, `initTabs()`, `initContactForm()` — same behaviour as v1

## Assets

Logos and photos copied from the v1 build. A new `logo-dark.webp` was generated (white parts replaced with navy, cyan kept) so the wordmark reads on the light theme.

## Form submissions

Contact form posts to the **same** Coolify-hosted forms-api: `https://forms-api.reachscreens.ca/submit`. Submissions land in the same SQLite DB, the same Resend emails, the same HubSpot pipeline. v1 and v2 are interchangeable from the back-end's point of view.

## When you're ready to go live with v2

The fastest path on the same Coolify stack:

1. New GitHub repo (e.g. `reach-site-2`).
2. New Coolify static-site app pointed at it, FQDN `reach2.reachscreens.ca`.
3. DNS A record at Namecheap: `reach2` → `178.156.206.50` (the wildcard `*` already covers it, but explicit is fine).
4. Add `https://reach2.reachscreens.ca` to `ALLOWED_ORIGINS` env on `forms-api-site` so the form keeps working from the new domain.
