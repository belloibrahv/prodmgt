# TechVaults Design System & UI Style Guide
## Version 1.0.0

This design system establishes the visual standards, component patterns, and front-end coding guidelines for **TechVaults Limited** projects. It ensures brand consistency, accessibility, and high performance across all customer-facing and internal digital platforms.

---

## 1. Brand Identity & Visual Language
TechVaults' visual language represents **innovation, trust, precision, and warmth**. 
* **Precision**: Clean lines, defined borders, grid-aligned structures, and responsive stability.
* **Warmth**: High-contrast, friendly typography coupled with soft red/peach background tints.

---

## 2. Color System
We use custom CSS properties (variables) to maintain a unified color scale. All colors should be derived from this palette to ensure dark mode scalability and theme integrity.

```
┌────────────────────────────────────────────────────────┐
│                      CORE BRAND COLORS                 │
├───────────────────┬───────────────────┬────────────────┤
│ Primary Red       │ Dark Red (Hover)  │ Light Red Tint │
│ #bc0004           │ #a00003           │ #ffdad6        │
└───────────────────┴───────────────────┴────────────────┘
```

### Ⅰ. Primary Brand Colors
* **Primary Red** (`--tva-red`): `#bc0004` — Used for main brand accents, call-to-actions, primary buttons, and headers.
* **Dark Red** (`--tva-red-dk`): `#a00003` — Used for hovers, active states, and dark border lines.
* **Light Red Tint** (`--tva-red-lt`): `#ffdad6` — Used for avatar backdrops, block quotes, alert cards, and soft background panels.
* **Extra Light Red** (`--tva-red-xlt`): `#fff0ef` — Used for alternating rows or soft section highlights.
* **On-Red Accent** (`--tva-on-red`): `#ffffff` — Text/Icon color to overlay on primary red backgrounds.

### Ⅱ. Neutrals (Surfaces & Ink)
* **Ink Black** (`--tva-ink`): `#201a1a` — High-contrast dark grey/black for body copy, text inputs, and major headings.
* **Ink Medium** (`--tva-ink-m`): `#6b4f4f` — Secondary grey-red text color for labels, subheadings, and captions.
* **Surface Background** (`--tva-surface`): `#f7f2f2` — The default light background color of pages, sidebar panels, or lists.
* **Surface Card** (`--tva-surface-0`): `#ffffff` — The background color of elements that float above pages (cards, dialogs, dropdowns, inputs).
* **Border Color** (`--tva-border`): `#ddc8c8` — Soft grey-red borders for clean component grouping.

### Ⅲ. Semantic Accents
* **Success/Green**: `#25d366` (`--tva-wa` - WhatsApp Green) / `#1da851` (`--tva-wa-dk` - WhatsApp Dark).
* **Alert/Red**: `#e53935` — Used for error states, validation issues, and alert badges.
* **Online Indicator**: `#69f0ae` — Vibrant light green for online indicator dots.

---

## 3. Typography
We prioritize highly legible, clean sans-serif typography that displays consistently on both macOS/iOS and Windows/Android.

* **Primary Font Stack** (`--tva-font`): `'Google Sans', Roboto, Arial, sans-serif`

### Ⅰ. Size & Spacing Hierarchy
All sizes are calculated based on the standard `16px` base font size.

| Level | Size | Weight | Line Height | Purpose |
|-------|------|--------|-------------|---------|
| **Display / H1** | `24px` | `600` (Bold) | `1.25` | Page Headers, Large Panels |
| **Headline / H2** | `18px` | `600` (Bold) | `1.3` | Section Headings |
| **Subheading / H3** | `15px` | `600` (Bold) | `1.35` | Component Headers |
| **Body Large** | `14px` | `400` (Regular) | `1.65` | Main Chat/Paragraph Text |
| **Body Small** | `13px` | `400` (Regular) | `1.55` | Secondary text, forms |
| **Micro / Timestamp** | `11px` | `400` (Regular) | `1.0` | Helper text, times, badges |

---

## 4. Spacing & Borders
Consistent spacing tokens ensure layouts have professional "breathing room" without causing layout shifts.

### Ⅰ. Spacing Scale (Margins & Paddings)
* **Gap Extra Small**: `4px`
* **Gap Small**: `8px`
* **Gap Medium**: `12px`
* **Gap Large / Standard**: `16px`
* **Gap Double**: `32px`

### Ⅱ. Border Radii Scale (`--tva-r*`)
* **Small Radius** (`--tva-r4`): `4px` — Small details (arrows, tiny code boxes).
* **Medium Radius** (`--tva-r8`): `8px` — Inner field forms, cards within blocks.
* **Standard Radius** (`--tva-r12`): `12px` — Medium buttons, avatars, standard modules.
* **Large Radius** (`--tva-r16`): `16px` — Normal cards, chat bubbles, alert panels.
* **Panel Radius** (`--tva-r24`): `24px` — Large popups, sidebar widgets, main modals.
* **Pill Radius** (`--tva-r99`): `9999px` — Capsule buttons (WhatsApp, inputs, badges).

---

## 5. UI Components & Interaction Patterns

```
┌────────────────────────────────────────────────────────┐
│                BUTTON INTERACTION STATES               │
├───────────────────┬───────────────────┬────────────────┤
│ Default           │ Hover             │ Disabled       │
│ --tva-red         │ --tva-red-dk      │ Opacity 0.5    │
│ Scale 1.0         │ Scale 1.05        │ Cursor Blocked │
└───────────────────┴───────────────────┴────────────────┘
```

### Ⅰ. Primary Button Pattern
* **Base styling**: Pill shape (`border-radius: var(--tva-r99)`), background `var(--tva-red)`, text `color: #fff`, bold.
* **Interaction**: 
  * **Hover**: Background changes to `var(--tva-red-dk)` and scales up slightly (`transform: scale(1.05)`) with a transition duration of `0.15s`.
  * **Focus**: Shows a `3px` solid ring of `--tva-red` with an `outline-offset` of `3px`.
  * **Disabled**: Opacity reduced to `0.5`, cursor set to `not-allowed`.

### Ⅱ. Input Forms & Fields
* **Default state**: Flat borders (`1.5px solid var(--tva-border)`), light surface fill (`var(--tva-surface)`), padded (`10px 16px`).
* **Active/Focus state**: Border changes to `var(--tva-red)` and background fills white (`#fff`) with a transition duration of `0.18s`.
* **Error state**: Border changes to red `#e53935` (`.tva-err` class).

---

## 6. CSS Architecture & Best Practices

1. **Strict Scoping**:
   All CSS rules must be scoped under a unique root identifier (e.g. `#tva-root`) to prevent widget styles from bleeding out into the parent host website.
   * **Do**: `#tva-root .tva-wa { background: var(--tva-wa); }`
   * **Avoid**: `.tva-wa { background: var(--tva-wa); }`

2. **Never Use Universal Reset Selectors**:
   Do **NOT** write resets using wildcard selectors like `#tva-root #tva-panel * { margin: 0; padding: 0; }`. Doing so overrides custom styling classes and destroys layout predictability.
   * **Do**: List specific elements: `#tva-root p, #tva-root h1 { margin: 0; padding: 0; }`

3. **SVG Icons Integration**:
   Embed SVG icons inline instead of loading font icon files (like Material Symbols or FontAwesome). This prevents loading overhead and ensures widgets display consistently even if the host page overrides font stacks. Set SVG properties using CSS inherits:
   ```css
   #tva-root svg {
     fill: currentColor;
     stroke: currentColor;
     flex-shrink: 0;
     display: block;
   }
   ```
