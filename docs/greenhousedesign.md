---
version: alpha
name: Greenhouse
description: "Greenhouse's system reads as warm, confident B2B SaaS: a deep forest-green ink anchors nearly every surface and headline, paired with a soft cream surface tone and a fixed white navbar for contrast. A stately Untitled Serif carries hero statements and large display type, while Untitled Sans handles body copy, buttons and UI chrome at a comfortable, slightly loose line-height. Accent color is used sparingly — a minty green and a cool interactive blue mark links and CTAs — while pill-shaped buttons (24-25px radius) and a soft ambient shadow give the interface a rounded, approachable finish over an otherwise editorial, high-contrast green-and-cream palette."
colors:
  primary: "#15372C"
  primary-interactive: "#008561"
  secondary: "#4CB398"
  accent-blue: "#3574D6"
  surface: "#FFFFFF"
  surface-warm: "#FFECD4"
  ink: "#15372C"
  on-primary: "#FFFFFF"
typography:
  hero-display:
    fontFamily: Untitled Serif
    fontSize: 70px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.7px
  h1:
    fontFamily: Untitled Serif
    fontSize: 70px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.7px
  nav-link:
    fontFamily: Untitled Serif
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: normal
  body-lg:
    fontFamily: Untitled Sans
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: normal
  body-lg-tight:
    fontFamily: Untitled Sans
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: normal
  body:
    fontFamily: Untitled Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: normal
  body-sm:
    fontFamily: Untitled Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: normal
  button:
    fontFamily: Untitled Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -0.16px
  caption:
    fontFamily: Untitled Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: normal
  link-condensed:
    fontFamily: Untitled Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: normal
rounded:
  sm: 4px
  pill: 24px
  pill-lg: 25px
spacing:
  xs: 2px
  sm: 8px
  sm-alt: 9px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  xl-alt: 28px
  2xl: 30px
  3xl: 32px
  section: 60px
  header-height: 84px
components:
  navbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    height: 84px
    position: fixed
  footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    height: 1061px
    columns: "4"
  nav-link:
    textColor: "{colors.on-primary}"
    typography: "{typography.nav-link}"
  footer-link:
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg-tight}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    borderColor: "{colors.primary}"
    borderWidth: 1px
    rounded: "{rounded.pill-lg}"
    padding: 12px 24px
  card:
    backgroundColor: "{colors.surface-warm}"
    rounded: "{rounded.sm}"
    boxShadow: rgba(21, 55, 44, 0.1) 0px 0px 30px 0px
    padding: 32px
  input:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.ink}"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    padding: 8px 16px
    typography: "{typography.body-sm}"
  chip:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  link:
    textColor: "{colors.accent-blue}"
    typography: "{typography.body-sm}"
---

# Greenhouse

## Overview

Greenhouse presents as a warm, editorial B2B SaaS surface built for HR and recruiting audiences — closer to a thoughtful publishing site than a typical dashboard-blue SaaS product. A single deep forest-green, **Ink** ({colors.primary} / {colors.ink} — #15372C), does almost all of the heavy lifting: it is the dominant text color, the footer surface, and the primary button fill. Against it sits **Parchment** ({colors.surface-warm} — #FFECD4), a soft peach-cream used for card surfaces, while a crisp white ({colors.surface} — #FFFFFF) anchors the fixed navbar and page background for contrast. Hierarchy is built almost entirely through typeface and scale rather than color variety: a stately serif ({typography.hero-display}, {typography.h1} — Untitled Serif at 70px) carries hero statements, dropping straight down to a comfortable sans-serif body ({typography.body}, {typography.body-lg}) for everything else.

Density is generous, not compact. Section rhythm runs on a 60px beat ({spacing.section}), hero copy sprawls at 70px with tight -0.7px tracking, and the hero composition (per the screenshots) scatters photography and small floating UI cards asymmetrically around the headline rather than locking to a strict grid — an editorial collage, not a product-tour layout. Corners are rounded almost everywhere interactive (pill buttons, chip tags) but stay tight and architectural on containers (cards, inputs), which keeps the system feeling soft in its calls-to-action and structured in its content blocks.

Accent color is used with real restraint: **Mint** ({colors.secondary} — #4CB398) and **Interactive Blue** ({colors.accent-blue} — #3574D6) appear only on links, chip text, and small interactive borders, never as large fills. This scarcity is what makes the green-and-cream palette read as confident rather than busy — accent color signals "you can click this," nothing else.

**Key Characteristics:**
- Two-typeface system: Untitled Serif for display/hero moments, Untitled Sans for everything functional (UI, body, buttons).
- One dominant ink color ({colors.primary} #15372C) doing triple duty as text, footer fill, and primary button background.
- Warm cream/peach surface ({colors.surface-warm} #FFECD4) reserved for card content, distinct from the white ({colors.surface}) navbar/page base.
- Pill-shaped buttons and chips (24–25px radius) contrast with near-square cards and inputs (4px radius) — soft controls, structured containers.
- A single soft ambient shadow (`rgba(21, 55, 44, 0.1) 0px 0px 30px 0px`) is the only elevation device in the system — no layered shadow scale.
- Accent colors (mint, interactive blue) are link/chip-only — never used as large background fills.
- Generous, loose line-heights (1.7 for body copy) and negative tracking only at large display sizes (-0.7px, -0.16px).
- Fixed 84px white navbar ({components.navbar.height}) floats over a green-and-cream page, giving the header its own distinct, high-contrast layer.

## Colors

The palette is a two-color system (deep green + warm cream) with two narrow-use accents; there are no gradients anywhere in the evidence — every fill is a flat, solid color.

### Brand & Ink
- **Ink / Forest** ({colors.primary}, doubled as {colors.ink} — #15372C): the system's workhorse color — body text, headline text, footer background, and primary button fill all draw from this single value.
- **Interactive Green** ({colors.primary-interactive} — #008561): a brighter, more saturated green reserved for interactive accents/borders (observed on interactive-role swatches); do not substitute this for {colors.primary} in text or large fills.
- **Mint** ({colors.secondary} — #4CB398): a lighter, cooler green used specifically as chip/tag text ({components.chip.textColor}) — never as a background or headline color.
- **Interactive Blue** ({colors.accent-blue} — #3574D6): the one non-green accent in the system, used exclusively for hyperlinks ({components.link.textColor}) and small interactive borders. It reads as "the click color" precisely because nothing else uses it.

### Surface
- **White** ({colors.surface} — #FFFFFF): the base page background and the fixed navbar fill ({components.navbar.backgroundColor}); also the button-secondary and input background.
- **Parchment** ({colors.surface-warm} — #FFECD4): a warm cream reserved for card surfaces ({components.card.backgroundColor}) and chip backgrounds ({components.chip.backgroundColor}) — this is what gives content blocks their organic, non-clinical warmth against the stark white nav.

### Text
- Primary text runs in **Ink** ({colors.ink} — #15372C) at essentially every text weight measured (dominant by a wide margin in the evidence — over 500 weighted text occurrences vs. ~60 for white).
- **On-Primary White** ({colors.on-primary} — #FFFFFF) is the inverse text color used wherever the background flips to Ink — footer copy, primary button labels, and nav-link text in dark overlay contexts.

### Hairlines & Borders
- The only structural border in the system is a 1px stroke in **Ink** ({colors.ink}), used on `input` and `button-secondary` — there is no separate "border" token; borders reuse the text/ink color at 1px.
- Notably, the fixed navbar and footer both measure `borderWidth: 0px` — there is no hairline separating the header from page content; separation comes entirely from the white-vs-green/cream color shift, not from a rule.

### Dark Mode
No dark-mode token block exists in this system — every surface, text, and component color is a single fixed value. Treat this as a light-only design system; do not infer a dark theme from the deep-green palette, as {colors.primary} is used as an *ink* and *footer* color, not a dark-mode surface swap.

## Typography

### Font Family
- **Untitled Serif** — reserved for high-impact display type: hero statements ({typography.hero-display}, 70px/500) and page headlines ({typography.h1}, 70px/400), plus, distinctively, the expanded navigation link style ({typography.nav-link}, 28px/400) — an unusual choice that gives even navigation chrome an editorial voice rather than a purely utilitarian one.
- **Untitled Sans** — everything else: body copy at multiple densities ({typography.body-lg}, {typography.body}, {typography.body-sm}), buttons ({typography.button}), captions ({typography.caption}), and condensed links ({typography.link-condensed}).

### Hierarchy
| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| {typography.hero-display} | 70px | 500 | 1.05 | -0.7px | Hero statement, emphasized (strong) headline text |
| {typography.h1} | 70px | 400 | 1.05 | -0.7px | Primary page headline |
| {typography.nav-link} | 28px | 400 | 1.25 | normal | Navigation link / mega-menu label |
| {typography.body-lg} | 19px | 400 | 1.7 | normal | Lead/intro paragraph copy |
| {typography.body-lg-tight} | 19px | 400 | 1.3 | normal | Footer links, compact large text |
| {typography.body} | 15px | 400 | 1.7 | normal | Default paragraph copy |
| {typography.body-sm} | 14px | 400 | 1.45 | normal | List items, secondary links, input text |
| {typography.button} | 16px | 400 | 1.6 | -0.16px | Button labels |
| {typography.caption} | 14px | 400 | 1.0 | normal | Micro-labels, tags |
| {typography.link-condensed} | 16px | 400 | 0.9 | normal | Condensed inline links |

### Principles
- Only two weights exist in the entire system: **400** (everything) and **500** (exclusively the emphasized/`strong` hero-display span). Do not introduce 300, 600, or 700 — the system deliberately avoids a heavy bold voice.
- Letter-spacing is neutral (`normal`) everywhere except the two largest/most controlled reading contexts — display type (-0.7px) and buttons (-0.16px) — where tight tracking counteracts the optical looseness of large serif letterforms and compensates for the pill button's rounded label.
- Line-height strategy is bimodal: long-form reading copy runs loose (1.7 for {typography.body} and {typography.body-lg}) for an airy, magazine feel, while compact UI elements (nav-link 1.25, caption 1.0, link-condensed 0.9) run tight since they wrap to a single line.

### Note on Font Substitutes
Untitled Sans and Untitled Serif are proprietary faces (Colophon Foundry / ATP). For an open-source rebuild, pair **Inter** or **General Sans** for Untitled Sans (matching its neutral, slightly humanist grotesque proportions), and **Fraunces** or **Freight Text** for Untitled Serif — both have the same warm, slightly editorial serif contrast needed at 70px display sizes. Tune Fraunces' optical-size axis toward its display cut to match the -0.7px tight tracking observed at hero scale.

## Layout

### Spacing System
The scale is not a strict 8px grid — it mixes clean multiples with hand-tuned outliers, implying visual tuning over rigid systemization: {spacing.xs} 2px, {spacing.sm} 8px, {spacing.sm-alt} 9px, {spacing.md} 12px, {spacing.base} 16px, {spacing.lg} 20px, {spacing.xl} 24px, {spacing.xl-alt} 28px, {spacing.2xl} 30px, {spacing.3xl} 32px, {spacing.section} 60px, and a fixed {spacing.header-height} of 84px for the navbar. The 60px section value is the most heavily used spacing figure in the evidence, confirming it as the primary rhythm for separating major page sections; smaller values (8/12/16/24/32px) handle internal component padding (buttons at 12px/24px, cards at 32px, inputs at 8px/16px).

### Grid & Container
The fixed navbar spans the full viewport width at {spacing.header-height} (84px) and sits above content ({components.navbar.position}: fixed) rather than scrolling with the page. The footer runs as a tall, 4-column block ({components.footer.columns}) at roughly 1061px of content height — the widest and deepest structural landmark measured, indicating a substantial link directory rather than a lightweight footer. The hero itself, per the screenshots, is not built on a conventional multi-column grid: it's an asymmetric collage of a centered headline with photography and floating UI-snippet cards placed at varying positions and depths around it, more art-directed than systematized. Treat the hero as a bespoke composition rather than a reusable grid pattern.

### Whitespace Philosophy
Whitespace is generous and used to slow the reading pace: large body line-heights (1.7), a 60px section beat, and a spacious 32px card padding all reinforce an unhurried, editorial pace appropriate to a considered B2B purchase decision rather than a dense dashboard. On mobile, this loose collage compresses into a tighter, linear stack (per the visual analysis) — whitespace shrinks but the same rounded-card, pill-tag vocabulary persists at reduced scale.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Page background, navbar ({components.navbar}), footer ({components.footer}) — both landmarks measure `borderWidth: 0px` |
| Hairline (border-only) | 1px solid {colors.ink} | `input` and `button-secondary` outlines — a stroke, not a shadow |
| Ambient shadow | `rgba(21, 55, 44, 0.1) 0px 0px 30px 0px` | `card` surfaces only — the single shadow value in the entire system |

**Shadow philosophy.** Greenhouse uses exactly one elevation device — a wide, very soft, tinted ambient shadow (colored with the brand's own ink at 10% opacity, not neutral black) applied only to cards. There is no shadow scale, no hover-elevation tier, and no shadow on the navbar or footer despite the navbar being fixed/floating over content — separation there comes purely from the white-vs-green/cream color break, not from depth cues. When adding new floating elements (tooltips, dropdowns, modals), reuse this exact shadow value rather than inventing a second tier; the system's restraint (one shadow, used sparingly) is itself the design decision.

## Shapes

### Border Radius Scale
| Token | Value | Use |
|---|---|---|
| {rounded.sm} | 4px | Cards, inputs — near-square, structural containers |
| {rounded.pill} | 24px | Primary buttons, chips/tags — full pill on their height |
| {rounded.pill-lg} | 25px | Secondary (outlined) buttons — a hairline larger radius than primary, likely to keep the visual pill-cap consistent given the added 1px border |

The geometry is deliberately bimodal: interactive controls (buttons, chips) are full pills, rounded to their own height, giving them a soft, tactile, almost tag-like quality; content containers (cards, inputs) use a conservative 4px radius that reads as nearly square. This split means roundness signals "interactive/actionable" in this system, while flatter corners signal "content region." There is no true circle usage in the tokens (e.g., avatar/logo marks noted in the screenshots aren't tokenized), so treat circular elements as one-off, not systematized.

## Components

### Navigation
- **`navbar`** — A fixed, full-width white bar ({components.navbar.backgroundColor} #FFFFFF) at exactly 84px tall ({components.navbar.height} / {spacing.header-height}), pinned above content (`position: fixed`) with no backdrop blur and no bottom hairline (`borderWidth: 0px`) — separation from the page below relies entirely on the white-vs-cream/green color break. Base text color is {components.navbar.textColor} (Ink, #15372C). A CTA button is present in the header (`hasCtaButton: true`), consistent with a primary conversion action (e.g., "Request a demo") living directly in the nav.
- **`nav-link`** — Set in {typography.nav-link} (Untitled Serif, 28px/400, line-height 1.25), with text color {components.nav-link.textColor} (on-primary white). The large serif treatment and white text color indicate these links render inside a dark overlay/mega-menu panel rather than directly on the white top bar — the evidence shows a high link count (44), consistent with an expanded dropdown/mega-menu rather than a flat 4–5 item nav.

### Buttons
- **`button-primary`** — Filled {colors.primary} (Ink) background, {colors.on-primary} (white) label text in {typography.button} (16px/400, -0.16px tracking), fully pill-shaped at {rounded.pill} (24px), padded 12px/24px ({spacing.md}/{spacing.xl}). This is the system's highest-contrast, most prominent action style — use for the single primary CTA per view.
- **`button-secondary`** — White ({colors.surface}) fill, {colors.primary} text, 1px {colors.primary} border, radius {rounded.pill-lg} (25px), same 12px/24px padding as primary. The near-identical pill geometry but outlined treatment makes this a clear "secondary" step-down without changing scale or type.

### Cards & Containers
- **`card`** — {colors.surface-warm} (Parchment, #FFECD4) background, conservative {rounded.sm} (4px) radius, generous 32px padding, lifted only by the system's single ambient shadow (`rgba(21, 55, 44, 0.1) 0px 0px 30px 0px`). Used for the floating product-UI snippets and feature panels seen scattered through the hero collage.

### Inputs & Forms
- **`input`** — White background, 1px {colors.ink} border, {rounded.sm} (4px) radius, 8px/16px padding, text set in {typography.body-sm} (14px/400/1.45). The square-ish radius and dark hairline border keep form fields visually distinct from the pill-shaped buttons beside them.

### Badges & Chips
- **`chip`** — {colors.surface-warm} background with {colors.secondary} (Mint, #4CB398) text, fully pill-shaped at {rounded.pill} (24px), 8px/16px padding. Used for short feature callouts ("Interview smarter," "Get data-backed insights" per the screenshots) — the only place Mint appears as a visible color.

### Links
- **`link`** — {colors.accent-blue} (#3574D6) text in {typography.body-sm} (14px/400). This is the sole use of the interactive-blue accent color in the palette, marking inline hyperlinks distinctly from the green-dominant surrounding copy.

### Footer
- **`footer`** — A very tall, 4-column block ({components.footer.columns}) filled with {colors.primary} (Ink green) and {colors.on-primary} (white) text, measuring roughly 1061px in the capture — indicating a dense, multi-section link directory rather than a minimal legal footer. Static positioned (not fixed), no CTA button, and no visible border/hairline at its top edge (`borderWidth: 0px`) — the color shift from cream/white to solid Ink is what signals the footer boundary.
- **`footer-link`** — Set in {typography.body-lg-tight} (19px/400, line-height 1.3) with {colors.on-primary} (white) text — noticeably larger and looser than the site's default body copy, giving the footer's ~52 links a more legible, spacious directory feel rather than cramped legal-style type.

## Do's and Don'ts

### Do
- Do use only the three observed radii — {rounded.sm} (4px) for containers, {rounded.pill} (24px) and {rounded.pill-lg} (25px) for pill controls — and nothing in between.
- Do keep the two-typeface split intact: Untitled Serif ({typography.hero-display}, {typography.h1}, {typography.nav-link}) for display/nav, Untitled Sans for everything else.
- Do reuse the single ambient card shadow (`rgba(21, 55, 44, 0.1) 0px 0px 30px 0px`) for any new floating surface rather than inventing a new shadow depth.
- Do reserve {colors.accent-blue} (#3574D6) strictly for links/interactive borders — it should never appear as a large fill or heading color.//- Do use {colors.surface-warm} (#FFECD4) for card and chip backgrounds, keeping {colors.surface} (#FFFFFF) for the navbar and page base so the two whites/creams stay distinguishable.
- Do build the primary CTA in {components.button-primary} (filled Ink, pill, white label) and demote any secondary action to {components.button-secondary} (outlined, same pill footprint).
- Do keep letter-spacing neutral except at hero/display and button scale, where the tight -0.7px / -0.16px values are load-bearing for legibility.

### Don't
- Don't introduce a third font family — the system's editorial character depends on exactly two (Untitled Serif + Untitled Sans).
- Don't add font weights beyond 400 and 500 — there is no bold (600/700) cut anywhere in the evidence; emphasis is carried by size and color, not weight.
- Don't add hairline borders to the navbar or footer — both measure `borderWidth: 0px` in the evidence; their separation is color-based, not stroke-based.
- Don't use {colors.primary} (Ink) as a dark-mode surface swap — it functions here as text/footer ink, not a theming primitive, and no dark-mode token block exists.
- Don't apply the card shadow to buttons, chips, or nav — shadow is reserved for elevated card content only.
- Don't mix {colors.secondary} (Mint) into headline or body text — its only observed role is chip text.
- Don't square off the primary/secondary buttons — their identity depends on being fully pill-shaped at button height.

## Responsive Behavior

This analysis is based on two captured viewports (desktop and mobile) only — no tablet or intermediate breakpoint evidence exists, so exact breakpoint pixel values cannot be stated and shouldn't be inferred.

Between the two viewports, the visual analysis shows clear structural changes: the desktop navbar's expanded link set collapses into a hamburger/search icon pair on mobile, and the hero's asymmetric collage — headline plus scattered photography and floating UI cards — restructures into a narrower single-column stack with a smaller serif headline and a condensed horizontal row of small cards beneath the copy. The rounded-card and pill-tag vocabulary ({rounded.pill}, {components.card}) persists at both sizes, just at reduced scale on mobile, indicating the component shape language is stable across breakpoints even as layout composition changes substantially.

On touch sizing: {components.button-primary} and {components.button-secondary} both use 12px/24px padding ({spacing.md}/{spacing.xl}) around 16px type ({typography.button}), which combined with their pill shape yields a comfortable ~40–48px tap target — adequate for mobile touch without needing a separate mobile button spec. No separate mobile-specific token values (type sizes, spacing) were captured, so assume the same token set applies at both viewports with layout reflow handling the size difference.

## Iteration Guide

1. Preserve the two-color dominance: {colors.primary} (Ink) for nearly all text/footer/primary-button surfaces, {colors.surface-warm} for card backgrounds. Any new component should default to Ink text on white or cream — do not introduce a new neutral gray text color.
2. When adding a new interactive element, choose its accent from the existing three: {colors.accent-blue} for links, {colors.secondary} for chip/tag text, {colors.primary-interactive} for other interactive borders/accents. Do not create a fourth accent hue.
3. All new buttons must resolve to one of the two existing variants — {components.button-primary} (filled, pill) or {components.button-secondary} (outlined, pill) — reusing {typography.button} and the 12px/24px padding pattern; do not create a third button style or a non-pill button.
4. Radius decisions follow function, not preference: interactive controls (buttons, chips) → {rounded.pill}/{rounded.pill-lg}; content containers (cards, inputs) → {rounded.sm}. Never apply pill radius to a card or sm radius to a button.
5. Elevation is binary in this system: flat (nav, footer, page) or the single ambient card shadow. New floating UI (modals, tooltips, popovers) should reuse the exact card shadow value rather than escalating to a heavier/darker shadow.
6. Typography edits must stay within the existing ladder — reuse an existing token (e.g., {typography.body-sm} for secondary UI text) rather than defining a new size/weight/line-height combination; the system explicitly avoids weights above 500.
7. The navbar height ({spacing.header-height}, 84px) and its fixed position are structural constants — any new header content must fit within that band without changing its fixed behavior, since page content is designed to scroll underneath it.

## Known Gaps

- Only one page (the homepage) was captured, so component coverage — pricing tables, in-app product screens, blog/article templates, forms beyond the header search — is unverified; the token set should be treated as representative, not exhaustive.
- Interaction states (hover, focus, active, disabled) were not observable in static screenshots; button, link, and input state colors/shadows are inferred defaults only, not confirmed variants.
- The navbar's nav-link token (Untitled Serif, 28px, white text) conflicts in scale/color with what a static top bar visually shows (Ink text on white) — this strongly suggests the 28px white serif style belongs to an expanded mega-menu/dropdown overlay that wasn't captured open; treat the mega-menu's actual visual structure as unverified.
- No dark-mode block exists in the extracted tokens; it's unknown whether Greenhouse offers a dark theme anywhere in the authenticated product (as opposed to the marketing site).
- Only two viewports (desktop, mobile) were analyzed — no tablet/intermediate breakpoint behavior or exact breakpoint pixel values could be confirmed.
- Animation and motion design (transitions, hover lifts, scroll effects hinted at by the collage layout) were not captured by static screenshots and are entirely unknown.
- Auth-walled product surfaces (the actual ATS/recruiting dashboard UI) were not accessible in this extraction; all tokens describe the public marketing site only, which may differ substantially from the logged-in product's design language.
- No gradient, pattern, or illustration-fill tokens were found — confirmed by evidence as absent rather than simply unmeasured, since all sampled colors are flat.
