# Design System — Choco Berry

## Product Context
- **What this is:** Business management / accounting system for a strawberry-dessert
  business ("Choco Berry") — POS/sales, inventory, BOM/recipes, payroll & attendance,
  cashbox, expenses, supplier purchases, daily reports, P&L/analytics.
- **Who it's for:** The business owner and staff (cashiers, accountants) in Dushanbe,
  Tajikistan, working with real money and inventory every day. Trust and clarity matter
  more than visual flair.
- **Space/industry:** Small-business back-office / accounting software.
- **Project type:** Dense data web app (dashboard + forms + tables), dark-mode-first.
- **Language:** Tajik (Cyrillic) is primary, with Russian and English also supported
  (i18next, 3 locales). **Every font choice must have full Cyrillic glyph coverage** —
  most trendy "indie" display fonts (Cabinet Grotesk, Clash Grotesk, Satoshi, General
  Sans, Fraunces, Instrument Serif/Sans) are Latin-only and silently fall back to the
  browser default for Tajik/Russian text, which would defeat the whole point of a
  typography upgrade. This ruled out several "obvious" choices.
- **Memorable thing:** "This looks like it was made *for* Choco Berry, not generated
  from a generic admin-dashboard template." The brand's existing warm chocolate/berry
  identity should be visible in the product, not just the mobile app icon.

## Aesthetic Direction
- **Direction:** Warm industrial-refined — a dense, function-first data app (tables,
  money, forms) that leans into the existing "Choco Berry" brand warmth instead of
  generic neutral-gray SaaS chrome.
- **Decoration level:** Minimal-to-intentional. No illustrations/gradients/blobs;
  warmth comes from color temperature and typography, not ornament.
- **Mood:** Trustworthy and precise (it's handling real money), but warm — like a
  well-run neighborhood bakery's books, not a cold enterprise dashboard.
- **What we are NOT changing:** the Radix/shadcn-style component primitives (Card,
  Dialog, Table, DataTable, forms) and the existing light/dark mode structure. This is
  a re-skin (color tokens + typography), not a rebuild — lower risk, faster, doesn't
  touch business logic or page structure.

## Typography
- **Display/Headings:** `Unbounded` — geometric, confident, distinctive, full Cyrillic
  support. Used for `<PageHeader>` titles and the sidebar brand wordmark.
- **Body/UI:** `Manrope` — clean modern grotesk, full Cyrillic support, far less
  overused than Inter/Roboto. Used for everything else: body text, labels, buttons,
  table cells.
- **Data/Money:** Same `Manrope`, with `font-variant-numeric: tabular-nums` (already
  defined as the `.money`/`.tabular-nums` utility in `index.css`) so amounts and dates
  align in columns — standard fintech practice, builds trust via alignment.
- **Loading:** Google Fonts `<link>` in `index.html`, Cyrillic + Latin subsets only
  (no need for Greek/Vietnamese/etc. subsets — keeps the font payload small).
- **Why not Inter/Roboto/system-ui:** system-ui was the *previous* state (no real
  typography at all). Inter/Roboto are explicitly avoided as the generic "default"
  choice every AI-generated dashboard reaches for — Manrope gives the same legibility
  without looking templated.

## Color
- **Approach:** Restrained — one warm accent (existing brand orange), warm neutrals
  instead of cool grays, no new accent colors introduced.
- **Primary/Accent:** `#E8593C` (existing `--primary`/`--accent`/brand-500) — **unchanged**.
  This is already shipped in the mobile app icon/splash and is what users recognize;
  changing it would cost more than it gains.
- **Neutrals:** Re-hued from cool blue-gray (hue 220°) to warm chocolate-brown (hue
  ~25°, matching the existing `chocolate` #4A2810 / `cream` #FFF5E6 tokens that were
  defined in `tailwind.config.js` but never actually used in the CSS variables). Same
  lightness/saturation curve as before — only the hue changes — so contrast ratios and
  dark/light mode behavior are preserved.
- **Semantic colors (success/warning/error/info, destructive):** unchanged — these are
  universal conventions (red = danger, etc.) and not part of the brand identity.
- **Chart colors (`--chart-1..5`):** unchanged — distinct hues are intentional there to
  separate data series, not a brand statement.

## Spacing
- **Base unit:** 4px (Tailwind default) — unchanged.
- **Density:** Comfortable for forms/cards, compact for data tables (sales, inventory,
  payroll lists) — this already matches the existing `DataTable`/`Card` components.

## Layout
- **Approach:** Unchanged — existing sidebar + content grid, Radix/shadcn component
  set. No new layout system.
- **Border radius:** Unchanged (`--radius` token already in place).

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension (hover,
  focus, dialog open/close). No new decorative animation introduced.

## Implementation Notes
- Color re-hue lives entirely in `chocoberry-frontend/src/index.css` (CSS variables) —
  every page consumes these via Tailwind's `bg-background`, `bg-card`,
  `border-border`, etc., so this one file changes the mood app-wide without touching
  individual page files.
- Typography: `tailwind.config.js` gets `fontFamily.sans` (Manrope) and
  `fontFamily.display` (Unbounded). `font-display` is applied at the few shared
  touchpoints that render page/section titles (`PageHeader`, `Sidebar` brand
  wordmark) rather than edited into every page individually.
- Per-page visual cleanup beyond tokens/typography (spacing inconsistencies, etc.) is
  out of scope for this pass and can be done incrementally per page.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-16 | Initial design system created | `/design-consultation`-style pass: keep existing brand accent (#E8593C) and component structure, re-hue neutrals toward chocolate-brown, add Cyrillic-safe typography (Unbounded + Manrope) since the app had no custom typography (system-ui) and no Cyrillic-aware font plan. |
