# Accessibility: header and hero color pairs

Every foreground/background pair used by the sticky header and the full-viewport hero,
with the exact ratio printed by the repo's checker:

```sh
node test/a11y-checks.mjs contrast <foreground> <background> [--min <ratio>]
```

Ratios are WCAG 2.x relative-luminance ratios, rounded by the checker to two decimals.
Body text pairs are held to **≥ 4.5:1**; the nav active-page indicator (an underline plus
color, not color alone) is held to the non-text minimum **≥ 3:1** (WCAG 1.4.11). All
thresholds below are met in both themes.

## Resolved values

The stylesheet declares the accents as `oklch()`, which the checker cannot parse, so the
sRGB equivalents a browser computes are given once and used in every command:

| Token | Light | Dark |
| --- | --- | --- |
| `--color-accent` | `oklch(49.2% 0.151 256)` → `rgb(24, 95, 180)` | `oklch(80.7% 0.101 250)` → `rgb(141, 197, 255)` |
| `--color-text` | `#1b1d22` | `#e8e8ee` |
| `--color-background` / `--header-bg` | `#f6f7f9` | `#101014` |
| `--nav-link-color` | `#1a5fb4` | `#8ec5ff` |
| `--nav-link-hover-color` / `--nav-active-color` | `#0f3d75` | `#a8d4ff` |

The header is **opaque** (`--header-bg`), so its pairs are checked against that flat color.
The hero is layered: a full-bleed image at `z-index: -3`, the decorative
`.hero-background-name` at `-2` (opacity `0.12`, `aria-hidden`, so exempt from contrast),
and the `.hero::after` scrim at `-1`. The scrim is 55%-alpha over the page background, so
the hero's **effective text background is the page background itself**: `rgba(246, 247, 249, 0.55)`
over `#f6f7f9` composites back to `#f6f7f9` in the light theme, and
`rgba(16, 16, 20, 0.55)` over `#101014` composites back to `#101014` in the dark theme.
The commands below use those effective backgrounds.

## Header — light theme

| Pair | Command | Ratio | Min |
| --- | --- | --- | --- |
| nav link | `node test/a11y-checks.mjs contrast #1a5fb4 #f6f7f9` | **5.87:1** | 4.5 |
| nav hover / focus / active link | `node test/a11y-checks.mjs contrast #0f3d75 #f6f7f9` | **10.07:1** | 4.5 |
| nav active-page indicator | `node test/a11y-checks.mjs contrast #0f3d75 #f6f7f9 --min 3` | **10.07:1** | 3 |
| site name | `node test/a11y-checks.mjs contrast #1b1d22 #f6f7f9` | **15.73:1** | 4.5 |
| nav focus ring (`--nav-link-color`) | `node test/a11y-checks.mjs contrast #1a5fb4 #f6f7f9 --min 3` | **5.87:1** | 3 |

## Header — dark theme

| Pair | Command | Ratio | Min |
| --- | --- | --- | --- |
| nav link | `node test/a11y-checks.mjs contrast #8ec5ff #101014` | **10.47:1** | 4.5 |
| nav hover / focus / active link | `node test/a11y-checks.mjs contrast #a8d4ff #101014` | **12.23:1** | 4.5 |
| nav active-page indicator | `node test/a11y-checks.mjs contrast #a8d4ff #101014 --min 3` | **12.23:1** | 3 |
| site name | `node test/a11y-checks.mjs contrast #e8e8ee #101014` | **15.56:1** | 4.5 |
| nav focus ring (`--nav-link-color`) | `node test/a11y-checks.mjs contrast #8ec5ff #101014 --min 3` | **10.47:1** | 3 |

## Hero — light theme (effective background `#f6f7f9`)

| Pair | Command | Ratio | Min |
| --- | --- | --- | --- |
| `h1` first word, tagline, body | `node test/a11y-checks.mjs contrast #1b1d22 #f6f7f9` | **15.73:1** | 4.5 |
| `h1 .accent`, hero links | `node test/a11y-checks.mjs contrast rgb(24, 95, 180) #f6f7f9` | **5.87:1** | 4.5 |
| button label on `.button` fill | `node test/a11y-checks.mjs contrast #f6f7f9 rgb(24, 95, 180)` | **5.87:1** | 4.5 |
| `.button` hover ring (`--color-accent`) | `node test/a11y-checks.mjs contrast rgb(24, 95, 180) #f6f7f9 --min 3` | **5.87:1** | 3 |

## Hero — dark theme (effective background `#101014`)

| Pair | Command | Ratio | Min |
| --- | --- | --- | --- |
| `h1` first word, tagline, body | `node test/a11y-checks.mjs contrast #e8e8ee #101014` | **15.56:1** | 4.5 |
| `h1 .accent`, hero links | `node test/a11y-checks.mjs contrast rgb(141, 197, 255) #101014` | **10.45:1** | 4.5 |
| button label on `.button` fill | `node test/a11y-checks.mjs contrast #101014 rgb(141, 197, 255)` | **10.45:1** | 4.5 |
| `.button` hover ring (`--color-accent`) | `node test/a11y-checks.mjs contrast rgb(141, 197, 255) #101014 --min 3` | **10.45:1** | 3 |

## Decorative layers (contrast-exempt)

These are not text and convey no information, so no minimum applies; the ratios are listed
for completeness. The `.hero-background-name` layer is additionally `aria-hidden="true"`,
`opacity: 0.12`, and pinned below the headline (`z-index: -2` vs the headline's `0`) — the
invariants checked by `node test/a11y-checks.mjs hero test/fixtures/hero-pass`.

| Pair | Command | Ratio |
| --- | --- | --- |
| background name, light | `node test/a11y-checks.mjs contrast rgba(27, 29, 34, 0.12) #f6f7f9` | **1.27:1** |
| background name, dark | `node test/a11y-checks.mjs contrast rgba(232, 232, 238, 0.12) #101014` | **1.33:1** |

The 1px header `border-bottom` (`rgba(27, 29, 34, 0.14)` light / `rgba(232, 232, 238, 0.16)`
dark, 1.33:1 / 1.51:1) is a purely decorative separator with no information content, so the
1.4.11 non-text minimum is not applied to it.

## Worst case behind the scrim

The hero image (`hero.svg`) is a gradient whose brightest pixel is pure white (the radial
glow's center). Because the checker composites translucent colors over the background they
paint, the harshest real backdrop is the scrim at 55% alpha over that white — light theme
`rgb(250, 251, 252)`, dark theme `rgb(124, 124, 126)`. The light-theme hero text clears
4.5:1 against even that (15.63:1 body, 6.02:1 accent). The dark theme does **not** clear it
there (3.35:1 body, 2.23:1 accent), which is exactly why the dark scrim is a dark veil:
with it, the effective backdrop is `#101014` and every dark-theme pair above passes. Do not
lighten `rgba(16, 16, 20, 0.55)` without re-running these commands.

## Reproducing

```sh
for pair in "#1a5fb4 #f6f7f9" "#0f3d75 #f6f7f9" "#1b1d22 #f6f7f9" \
            "#8ec5ff #101014" "#a8d4ff #101014" "#e8e8ee #101014" \
            "rgb(24, 95, 180) #f6f7f9" "rgb(141, 197, 255) #101014"; do
	node test/a11y-checks.mjs contrast $pair
done
```

Every command above exits `0`. The ratios in the tables are the literal two-decimal values
the checker prints; if a palette token changes in `styles.css`, re-run the commands and
update this page in the same change.
