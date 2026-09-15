# Design System

This document describes the design tokens and responsive breakpoints used by the UI.
All tokens are declared as CSS custom properties on `:root` in [`css/styles.css`](../css/styles.css).
The dark palette is not a separate theme file: a `@media (prefers-color-scheme: dark)` block
re-declares the same color properties on `:root`, so browsers pick the right set automatically.

## Color tokens

Declared on `:root` (light palette), overridden inside `@media (prefers-color-scheme: dark)`:

| Custom property   | Light value  | Dark value  | Used for                                   |
| ----------------- | ------------ | ----------- | ------------------------------------------ |
| `--color-bg`      | `#f6f7f9`    | `#15181e`   | Page background (`body`)                   |
| `--color-surface` | `#ffffff`    | `#1e232b`   | Cards, header, nav, footer surfaces        |
| `--color-text`    | `#1c2430`    | `#eceef1`   | Body copy, card paragraphs, footer text    |
| `--color-accent`  | `#1a5fb4`    | `#8ec5ff`   | Headings (`h1`, `.card h2`)                |
| `--color-border`  | `#d8dbe0`    | `#343b46`   | 1px separators under header/nav, above footer |

## Spacing scale

Four steps, used for padding and flex/grid gaps. These tokens are palette-independent,
so their value is identical in the light and dark themes (no dark override is declared).

| Custom property | Light value | Dark value |
| --------------- | ----------- | ---------- |
| `--space-1`     | `4px`       | same as light |
| `--space-2`     | `8px`       | same as light |
| `--space-3`     | `16px`      | same as light |
| `--space-4`     | `24px`      | same as light |

## Typography

| Custom property | Light value                                                                        | Dark value    |
| --------------- | ---------------------------------------------------------------------------------- | ------------- |
| `--font-body`   | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | same as light |

Font sizes are set in `rem` at the component level (`1.25rem` for `h1`, `1rem` for `.card h2`,
`0.875rem` for footer text) rather than as tokens.

## Breakpoints

Layout is desktop-first: the base rules apply to wide viewports, and two `max-width`
breakpoints adapt the page downward.

### 900px — tablet and below (`@media (max-width: 900px)`)

- `main` collapses the centered row into a single column
  (`flex-direction: column`, `align-items: stretch`, `justify-content: flex-start`).
- `.card` becomes fluid: `box-sizing: border-box`, `width: 100%`, centered with
  auto margins, and its fixed `40px` padding drops to `var(--space-3)`.

### 480px — phones (`@media (max-width: 480px)`)

- `header` and `footer` padding tightens to `var(--space-2) var(--space-3)`.
- `nav ul` stacks vertically (`flex-direction: column`) with `var(--space-2)` gaps.
- `main` padding tightens to `var(--space-3)`.
- `.card` padding becomes `var(--space-3) var(--space-2)` and `.card h2` shrinks to `0.9375rem`.

Images stay fluid at every width via the global `img { max-width: 100%; height: auto; }` rule.

## Before / after screenshots

The responsive rework is captured as a before/after screenshot pair stored under
`docs/design-assets/` (repo-relative paths `docs/design-assets/before-480.png` and
`docs/design-assets/after-480.png`), taken at the 480px phone breakpoint:

| Viewport        | Before                                        | After                                        |
| --------------- | --------------------------------------------- | -------------------------------------------- |
| 480px (phone)   | ![480px before](design-assets/before-480.png) | ![480px after](design-assets/after-480.png)  |

The same page at the 900px tablet breakpoint is documented by
[`docs/design-assets/before-900.png`](design-assets/before-900.png) and
[`docs/design-assets/after-900.png`](design-assets/after-900.png).
