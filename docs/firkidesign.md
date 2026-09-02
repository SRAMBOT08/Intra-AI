version: alpha
name: "Fikri Studio – Portfolio Light"
description: "Fikri Studio's portfolio site uses a light, white-surface canvas anchored by a deep indigo (#272666) heading palette and a warm yellow (#FFDC39) accent ring on primary CTAs. The Sora typeface drives all display and body text with consistent negative letter-spacing, creating a tight editorial rhythm. Components favor large pill radii (100px+) and subtle drop shadows. The case-study page layout centers content in a wide column with generous vertical spacing, showcasing product screenshots in elevated card frames."
colors:
  pure-white: "#ffffff"
  light-surface: "#f4f5f6"
  teal-accent: "#7ed7cc"
  yellow-accent: "#ffdc39"
  deep-indigo: "#272666"
  muted-indigo: "#747198"
  pale-indigo: "#aeacc3"
  rich-black: "#000000"
typography:
  display-hero:
    fontFamily: "Sora"
    fontSize: "72px"
    fontWeight: "500"
    lineHeight: "86.4px"
    letterSpacing: "-2.16px"
  section-heading:
    fontFamily: "Sora"
    fontSize: "44px"
    fontWeight: "500"
    lineHeight: "61.6px"
    letterSpacing: "-1.32px"
  card-heading:
    fontFamily: "Sora"
    fontSize: "32px"
    fontWeight: "500"
    lineHeight: "38.4px"
    letterSpacing: "-0.96px"
  body-large:
    fontFamily: "Sora"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "25.2px"
    letterSpacing: "-0.54px"
  body-default:
    fontFamily: "Sora"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "22.4px"
    letterSpacing: "-0.48px"
  label-medium:
    fontFamily: "Sora"
    fontSize: "16px"
    fontWeight: "500"
    lineHeight: "21.12px"
    letterSpacing: "-0.48px"
  caption:
    fontFamily: "Sora"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "19.6px"
    letterSpacing: "-0.42px"
  overline:
    fontFamily: "Sora"
    fontSize: "14px"
    fontWeight: "500"
    lineHeight: "18.48px"
    letterSpacing: "-0.42px"
  ui-micro:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: "400"
rounded:
  pill-full: "99999px"
  pill-large: "101px"
  pill-100: "100px"
  rounded-xl: "35px"
  rounded-lg: "24px"
  rounded-md: "20px"
  rounded-sm: "16px"
  rounded-xs: "12px"
  rounded-2xs: "8px"
  rounded-3xs: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "40px"
  3xl: "56px"
  4xl: "60px"
  5xl: "64px"
  6xl: "68px"
  7xl: "72px"
  8xl: "150px"
---

## Overview

Fikri Studio's portfolio site uses a light, white-surface canvas anchored by a deep indigo (#272666) heading palette and a warm yellow (#FFDC39) accent ring on primary CTAs. The Sora typeface drives all display and body text with consistent negative letter-spacing, creating a tight editorial rhythm. Components favor large pill radii (100px+) and subtle drop shadows. The case-study page layout centers content in a wide column with generous vertical spacing, showcasing product screenshots in elevated card frames.

**Signature traits:**
- Dual typeface system: Pairs Sora and Inter across the type hierarchy.
- Soft, rounded geometry: Generous corner rounding up to 99999px.
- Layered elevation: Depth comes from 5 validated shadow tokens.

## Colors

The palette uses 8 validated color tokens across 1 theme profile. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

**Semantic naming:**
- **content-text** maps to `deep-indigo`: Role "text" is grounded by usage context "Primary headings, brand text, blockquote text".
- **action-primary** maps to `pure-white`: Role "primary" is grounded by usage context "Page surface, nav background, card surfaces, link hover text".
- **action-background** maps to `yellow-accent`: Role "background" is grounded by usage context "Primary CTA button ring/outline shadow, highlight accent".
- **surface-background** maps to `light-surface`: Role "background" is grounded by usage context "Section backgrounds, card fills, subtle surface tints".

### Primary Brand
- **Pure White** (#ffffff): Page surface, nav background, card surfaces, link hover text. Role: primary. {authored: rgb(255, 255, 255), space: rgb}

### Text Scale
- **Deep Indigo** (#272666): Primary headings, brand text, blockquote text. Role: text. {authored: rgb(39, 38, 102), space: rgb}
- **Muted Indigo** (#747198): Secondary body text, captions, metadata labels. Role: text. {authored: rgb(116, 113, 152), space: rgb}

### Interactive
- **Pale Indigo** (#aeacc3): Disabled states, subtle borders, muted text. Role: border. {authored: rgb(174, 172, 195), space: rgb}
- **Rich Black** (#000000): Default body text, icon fills, border fallback. Role: border. {authored: rgb(0, 0, 0), space: rgb}

### Surface & Shadows
- **Light Surface** (#f4f5f6): Section backgrounds, card fills, subtle surface tints. Role: background. {authored: rgb(244, 245, 246), space: rgb, alpha: 0}
- **Teal Accent** (#7ed7cc): Decorative accent, avatar ring, highlight element. Role: background. {authored: rgb(126, 215, 204), space: rgb}
- **Yellow Accent** (#ffdc39): Primary CTA button ring/outline shadow, highlight accent. Role: background. {authored: rgb(255, 220, 57), space: rgb}

## Typography

Typography uses Sora, Inter across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Mixes Sora and Inter for visual contrast. Weight range spans medium, regular. Sizes range from 12px to 72px.

### Font Roles
- **Headline Font**: Sora
- **Body Font**: Sora

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Hero headline, largest display text | Sora | 72px | 500 | 86.4px | -2.16px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Case study title, section headings | Sora | 44px | 500 | 61.6px | -1.32px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Card titles, sub-section headings | Sora | 32px | 500 | 38.4px | -0.96px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Lead body copy, introductory paragraphs | Sora | 18px | 400 | 25.2px | -0.54px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Standard body text, descriptions | Sora | 16px | 400 | 22.4px | -0.48px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Button labels, nav items, emphasis text | Sora | 16px | 500 | 21.12px | -0.48px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Captions, metadata, secondary labels | Sora | 14px | 400 | 19.6px | -0.42px | Sora, Sora Placeholder, sans-serif | Extracted token |
| Category tags, overline labels | Sora | 14px | 500 | 18.48px | -0.42px | Sora, Sora Placeholder, sans-serif | Extracted token |
| UI micro-copy, nav links, button text at small scale | Inter | 12px | 400 | normal | normal | Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol | Extracted token |

## Layout

Responsive system uses 4 breakpoint tier(s): mobile, tablet, desktop, wide.

This system uses a 4px base grid with scale values 4, 8, 12, 16, 20, 24, 40, 56, 60, 64, 68, 72, 150.

### Responsive Strategy
- **mobile (<= 1023px)**: Constrain layout for small viewports and prioritize vertical stacking.
- **tablet (768-1023.98px)**: Increase spacing and column structure for medium-width viewports.
- **desktop (1024-1439.98px)**: Expand layout density and horizontal composition for wide viewports.
- **wide (1440-1799px)**: Stretch composition with generous gutters and wider layout spans.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| xs | 4px | 4 | Extracted spacing token |
| sm | 8px | 8 | Extracted spacing token |
| md | 12px | 12 | Extracted spacing token |
| base | 16px | 16 | Extracted spacing token |
| lg | 20px | 20 | Extracted spacing token |
| xl | 24px | 24 | Extracted spacing token |
| 2xl | 40px | 40 | Extracted spacing token |
| 3xl | 56px | 56 | Extracted spacing token |
| 4xl | 60px | 60 | Extracted spacing token |
| 5xl | 64px | 64 | Extracted spacing token |
| 6xl | 68px | 68 | Extracted spacing token |
| 7xl | 72px | 72 | Extracted spacing token |
| 8xl | 150px | 150 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| card-default | 1 | 0px 4px 4px 0px rgba(0, 0, 0, 0.12) |
| cta-yellow-ring | 2 | 0px 0px 0px 1.5px rgb(244, 193, 0) |
| button-subtle | 1 | 0px 4px 8px 0px rgba(31, 51, 71, 0.04) |
| overlay-lift | 1 | 0px 8px 24px 0px rgba(0, 0, 0, 0.15) |
| cta-teal-ring | 2 | 0px 0px 0px 1.5px rgb(116, 200, 190) |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | backdrop-filter | blur(0px) |
| Light | outline-color | rgb(0, 0, 0) ; rgb(0, 0, 238) ; rgb(39, 38, 102) |
| Light | outline-width | 3px |
| Light | outline-offset | 0px |
| Light | transform | matrix(1, 0, 0, 1, 0, 20) ; matrix(1, 0, 0, 1, -32, -32) ; matrix3d(0.94093, 0.106762, -0.305934, 0.000254945, 0.0051303, 0.944823, 0.34202, -0.000285017, 0.338896, -0.310059, 0.888497, -0.000740414, -18, -18, 0, 1) |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| rounded-3xs | 6px | 6 | Subtle corner |
| rounded-2xs | 8px | 8 | Control corner |
| rounded-xs | 12px | 12 | Control corner |
| rounded-sm | 16px | 16 | Card corner |
| rounded-md | 20px | 20 | Card corner |
| rounded-lg | 24px | 24 | Large surface corner |
| rounded-xl | 35px | 35 | Large surface corner |
| pill-100 | 100px | 100 | Large surface corner |
| pill-large | 101px | 101 | Large surface corner |
| pill-full | 99999px | 99999 | Large surface corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| pill-full | 99999px | px |
| pill-large | 101px | px |
| pill-100 | 100px | px |
| rounded-xl | 35px | px |
| rounded-lg | 24px | px |
| rounded-md | 20px | px |
| rounded-sm | 16px | px |
| rounded-xs | 12px | px |
| rounded-2xs | 8px | px |
| rounded-3xs | 6px | px |

## Components

(none detected)

## Do's and Don'ts

Guardrails protect Dual typeface system, Soft, rounded geometry, Layered elevation without adding unsupported visual claims.

| Do | Don't |
|----|---------|
| Do maintain consistent spacing using the base grid | Don't make unsupported claims about absent visual features |
| Do maintain WCAG AA contrast ratios (4.5:1 for normal text) | Don't mix rounded and sharp corners in the same view |
| Do use the primary color only for the single most important action per screen |  |
| Do verify evidence before writing new design-system guidance |  |

## Responsive Evidence

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Breakpoint 1 | <= 767.98px | (max-width: 767.98px) |
| Breakpoint 2 | <= 1023px | (max-width: 1023px) and (min-width: 0) |
| Tablet | 768-1023.98px | (min-width: 768px) and (max-width: 1023.98px) |
| Desktop | 1024-1439px | (max-width: 1439px) and (min-width: 1024px) |
| Desktop | 1024-1439.98px | (min-width: 1024px) and (max-width: 1439.98px) |
| Desktop | 1440-1799px | (max-width: 1799px) and (min-width: 1440px) |
| Desktop | >= 1800px | (min-width: 1800px) |
| Breakpoint 8 | Unknown | print |

## Agent Prompt Guide

### Example Component Prompts
- Create button component using validated primary color role and spacing tokens.
- Create card component with mapped radius role and evidence-backed elevation.
- Create form input component using inferred typography hierarchy and border roles.

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.