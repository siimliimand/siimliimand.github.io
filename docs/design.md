# Design System

The page has exactly one stylesheet: [`styles.css`](../styles.css) at the repository root.
Everything it needs — palette, spacing, type, and layout — is declared as a CSS custom
property on `:root` and consumed with `var()`. There is no separate theme file: when the OS
asks for dark colors, a `@media (prefers-color-scheme: dark)` block re-declares the color
tokens on `:root` and restates the translucent `rgba()` colors whose alpha is baked into the
literal. The retired card-based stylesheet that used to live in the `css/` directory is
deleted; this document describes only what is in the root stylesheet today.

## Color tokens

Declared on `:root` (light palette) and re-declared inside
`@media (prefers-color-scheme: dark)`:

| Custom property      | Light value              | Dark value               | Used for                                                         |
| -------------------- | ------------------------ | ------------------------ | ---------------------------------------------------------------- |
| `--color-text`       | `#1b1d22`                | `#e8e8ee`                | Body copy, list items, footer text                               |
| `--color-background` | `#f6f7f9`                | `#101014`                | Page background (`body`) and the label color on `.button`        |
| `--color-surface`    | `#ffffff`                | `#1b1b21`                | Reserved surface token: declared, not yet referenced by any rule |
| `--color-accent`     | `oklch(49.2% 0.151 256)` | `oklch(80.7% 0.101 250)` | Links, `h1 .accent`, `h2`, `.button` fill, `:focus-visible` ring |

`--color-background` was renamed from `--color-bg` when the card grid came out, and its dark
value is now `#101014` — near-black with a slight blue cast. Both palettes are hex or `oklch`
literals so text-on-background contrast stays measurable.

### Translucent colors

The header background, the hero scrim, and the article dividers are alpha colors rather than
tokens, so each theme restates them as `rgba()` literals:

| Rule                        | Light                       | Dark                        |
| --------------------------- | --------------------------- | --------------------------- |
| `header` background         | `rgba(246, 247, 249, 0.72)` | `rgba(16, 16, 20, 0.72)`    |
| `header` border-bottom      | `rgba(27, 29, 34, 0.14)`    | `rgba(232, 232, 238, 0.16)` |
| `.hero::after` scrim        | `rgba(246, 247, 249, 0.55)` | `rgba(16, 16, 20, 0.55)`    |
| `article + article` divider | `rgba(27, 29, 34, 0.12)`    | `rgba(232, 232, 238, 0.14)` |

## Spacing scale

Five steps, palette-independent, so no dark override is declared:

| Custom property | Value     | Typical use                                                |
| --------------- | --------- | ---------------------------------------------------------- |
| `--space-1`     | `0.25rem` | Tight nav gaps (phone breakpoint)                          |
| `--space-2`     | `0.5rem`  | Header gaps, `ul` margins, button padding (block axis)     |
| `--space-3`     | `1rem`    | Header padding, section gutters, `h2` bottom margin        |
| `--space-4`     | `1.5rem`  | `h3` margins, article separation, footer padding           |
| `--space-5`     | `2rem`    | Section padding, hero padding                              |

## Type and layout tokens

| Custom property | Value                                                                               | Used for                        |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `--font-body`   | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | `body` font-family              |
| `--max-width`   | `48rem`                                                                             | Measure that `section` centers on |
| `color-scheme`  | `light dark`                                                                        | UA rendering of form controls and scrollbars |

## Typography scale

Type sizes are component rules, not tokens:

| Selector    | Size                          | Notes                                                                    |
| ----------- | ----------------------------- | ------------------------------------------------------------------------ |
| `h1`        | `clamp(2.75rem, 7vw, 5rem)`   | `line-height: 1.05`, `letter-spacing: -0.02em`, `font-weight: 800`; the second word is wrapped in `<span class="accent">` and takes `--color-accent` |
| `h2`        | `1.375rem`                    | `line-height: 1.2`, colored `--color-accent`                             |
| `h3`        | `1.0625rem`                   | Job titles and skill groups                                              |
| `.tagline`  | `1.125rem`                    | Hero subtitle                                                            |
| `footer p`  | `0.875rem`                    | Footer line                                                              |

Body copy is `1rem` at `line-height: 1.6`, weight 400.

## Layout

**Sticky translucent header.** `header` is `position: sticky; top: 0; z-index: 10`, filled
with a 72%-alpha `rgba()` plus `backdrop-filter: blur(0.75rem)`, and separated from the page
by a 1px `border-bottom`. Content scrolls beneath it; `html { scroll-padding-top: 4.5rem; }`
keeps anchor targets clear of it.

**Hero.** The `#hero` section is one viewport tall: `min-height: 100vh`, immediately
overridden by `min-height: 100svh` where the small-viewport unit is supported, so mobile
browser chrome cannot push the hero's bottom edge off screen. Its `<img>` is pinned behind
the copy (`position: absolute; inset: 0; z-index: -2; object-fit: cover`), a `.hero::after`
scrim sits at `z-index: -1` for contrast, and `isolation: isolate` on `.hero` keeps those
negative layers inside the section. Copy and CTAs are centered and capped at `36rem`.

**Sections.** `main` is a full-width flex column (`flex: 1`); each `section` centers itself
on the measure (`max-width: var(--max-width)`, `margin-inline: auto`) with
`padding: var(--space-5) var(--space-3)`. `footer` is plain centered text separated by
whitespace, no border.

**Images** are fluid everywhere — `img { display: block; max-width: 100%; height: auto; }` —
except the hero image, which covers its box instead.

## The removed .card grid

The previous iteration boxed every content block in a `.card` surface: fixed `40px` padding,
a flex row of cards inside `main` that collapsed to one column at 900px and tightened again
at 480px. That grid is gone:

- no `.card` rules remain (`grep -c "\.card" styles.css` returns 0);
- content is flat and editorial — `article + article` is separated by a 1px `border-top` and
  `var(--space-4)` of spacing instead of a boxed surface;
- the 480px and 900px breakpoints collapsed into a single `max-width: 600px` query.

`test/responsive.spec.js` still selects `main .card` and predates the removal; it needs its
own update and is out of scope for this document.

## Breakpoints

Layout is desktop-first, with one viewport query and one print query.

### 600px — phones (`@media (max-width: 600px)`)

- `header` centers its content and tightens padding to `var(--space-2) var(--space-3)`.
- `nav ul` gaps tighten to `var(--space-1) var(--space-2)`.
- `.hero` gap tightens to `var(--space-2)`.
- `section` padding tightens to `var(--space-4) var(--space-2)`.

### `@media print`

- `@page` margins are `18mm 15mm`, body type drops to `11pt`, and the palette is forced to
  the light accent on a white or transparent background.
- `header` becomes static and transparent, `nav` is hidden, and the hero collapses
  (`min-height: auto`, image and scrim hidden) so the CV prints from the top of the page.
- `section` goes full width, `h2`/`h3` get `break-after: avoid`, `article` gets
  `break-inside: avoid`, and links switch to a real underline.

## Motion, focus, and interaction conventions

- **Transitions** are `180ms ease-out` and animate cheap properties only. Links grow an
  underline by animating `background-size` of a `linear-gradient(currentColor, currentColor)`
  strip instead of toggling `text-decoration`; `.button` lifts `translateY(-2px)` and
  brightens on hover/focus.
- **`:focus-visible`** has one global convention: `outline: 3px solid var(--color-accent);`
  with `outline-offset: 2px`. It is never suppressed and never restyled per component.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses every animation and
  transition to `0.01ms` (`!important`), forces `animation-iteration-count: 1`, and sets
  `scroll-behavior: auto`, so the hero, links, and buttons render instantly in place.
