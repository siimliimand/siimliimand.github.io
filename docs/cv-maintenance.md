# CV maintenance guide

This guide explains how the CV page (`index.html`) is organized, how to edit it
safely, how to validate your changes, and how to export the page to PDF.
Read it before editing `index.html` or `styles.css`.

## How the page is put together

- `index.html` — the CV markup. All content lives here.
- `styles.css` — all styling, including the dark-mode and print rules.
- `test/validate-cv.js` — dependency-free Node script that guards the
  structural parts of the page (see "Validation commands" below).

The page layout is:

<nav>      in-page links to the five CV sections, plus an "Email me" mailto link
<nav>      in-page links to the five CV sections
<main>     the five CV sections, each a <section> with class "card"
<footer>   copyright and mailto link
```

## Where each CV section lives in index.html

Every CV section is a `<section>` element inside `<main>`, identified by an
`id` attribute. The `id` is what the navigation links point to and what the
validator checks for, so keep the ids stable when editing.

| Section   | Location in index.html            | Heading        | Contains |
|-----------|-----------------------------------|----------------|----------|
| Contact   | `<section id="contact">`          | `<h2>Contact</h2>` | Hero image, email / GitHub / location list, availability note. |
| Summary   | `<section id="summary">`          | `<h2>Summary</h2>` | Two paragraphs: profile overview and the AI-assisted development practice. |
| Skills    | `<section id="skills">`           | `<h2>Skills</h2>`  | Four `<h3>` groups: Languages, AI-Assisted Development, Servers and DevOps, Web Platforms — each with a `<ul>`. |
| Experience| `<section id="experience">`       | `<h2>Experience</h2>` | One `<article>` per role, each with an `<h3>`, a one-line dates/stack `<p>`, and a descriptive `<p>`. |
| Education | `<section id="education">`        | `<h2>Education</h2>`  | Two `<article>` entries: formal studies and continuous professional education. |

Exact locations (line numbers in the current `index.html`):

| Section    | Section tag        | Section heading     |
|------------|--------------------|---------------------|
| Contact    | line 29            | line 30             |
| Summary    | line 42            | line 43             |
| Skills     | line 56            | line 57             |
| Experience | line 97            | line 98             |
| Education  | line 139           | line 140            |

Notes:

- The mailto address appears in **three** places: the `<nav>` list
  ("Email me"), the contact section, and the `<footer>`. All three are
  required — the validator fails if any one of them disappears.
- Section ids are also asserted by `test/validate-cv.js`
  (`REQUIRED_SECTION_IDS`), so renaming an id (e.g. `#summary` → `#profile`)
  breaks the validator and any in-page anchors. Update the doc, the nav, and
  the validator constant together if a rename is ever unavoidable.

## Validation commands

Run both checks from the repository root before committing:

### 1. Structure/content checks — `node test/validate-cv.js`

Dependency-free (Node built-ins only, no packages needed):

```sh
node test/validate-cv.js
```

What it verifies:

- `index.html` has a `<title>`.
- All five required section ids exist: `contact`, `summary`, `skills`,
  `experience`, `education`.
- At least three `mailto:` links are present (nav, contact, footer).
- The `assets/favicon.svg` reference is present.
- `styles.css` still contains the `@media print` block and the
  `@media (max-width: 600px)` block.
- No `TODO` or `Lorem` placeholder markers remain in `styles.css`.
- The `:root` palette declares hex values for `--color-text` and
  `--color-background`, and their contrast ratio is at least 4.5:1.

Expected exit codes:

| Exit code | Meaning |
|-----------|---------|
| `0`       | All checks passed. The script prints `validate-cv: all checks passed (contrast ratio …)` and exits `0`. |
| `1`       | At least one check failed. Each failing check prints a `- <message>` line naming what is missing, then the script exits `1`. Exit `1` is also used when `index.html` or `styles.css` cannot be read. |

### 2. Markup lint — `npx html-validate index.html`

`html-validate` is fetched on demand via `npx` (no `package.json` is required
to run it):

```sh
npx html-validate index.html
```

Expected exit codes:

| Exit code | Meaning |
|-----------|---------|
| `0`       | No markup problems found. |
| `1`       | At least one rule violation (or a rule error) was reported; the offending line/column and rule name are printed. |
| other     | Non-zero exit codes other than `1` indicate the tool itself could not run (e.g. fetch/install failure or bad configuration) rather than a document problem. |

If either command exits non-zero, fix the reported problem and re-run before
committing. CI runs the same checks on every push.

## Editing checklist

1. Make your change in `index.html` (content) or `styles.css` (styling).
2. If you add, remove, or rename a section: update the `<nav>` links and the
   `REQUIRED_SECTION_IDS` list in `test/validate-cv.js` in the same commit.
3. Keep new colors as design tokens in the `:root` block of `styles.css`; the
   validator measures the text/background pair from that block.
4. Run `node test/validate-cv.js` and `npx html-validate index.html`; both
   must exit `0`.
5. Open `index.html` in a browser at desktop and narrow widths, and with
   dark mode enabled, before committing.

## Exporting the CV to PDF

`styles.css` contains an `@media print` block (starting at line 222) that
switches the page to a print palette, removes the shadows, and adjusts
spacing for paper. It applies automatically when the browser renders the
print view — you do not need to edit or enable anything.

Numbered procedure (any modern browser):

1. Open `index.html` in the browser (double-click the file, or use
   **File → Open File…** and select `index.html`).
2. Open the print dialog with **Ctrl+P** (Windows/Linux) or **Cmd+P**
   (macOS). The preview already reflects the print styling, because the
   `@media print` block applies automatically to the print rendering.
3. Set **Destination** to **Save as PDF** (in some browsers:
   "Microsoft Print to PDF" also works, but "Save as PDF" is preferred).
4. Set **Layout** to **Portrait**, **Paper size** to **A4** (or Letter),
   and make sure **Margins** are set to **Default**.
5. Leave **Headers and footers** unticked (browser-injected headers usually
   duplicate the footer already on the page) and tick **Background graphics**
   only if section card backgrounds should be printed.
6. Click **Save**, choose a filename (for example
   `Siim-Liimand-CV.pdf`), and pick a location.
7. Open the resulting PDF and check that all five sections (Contact, Summary,
   Skills, Experience, Education) are present, that nothing is clipped at
   page breaks, and that the palette matches the light print theme.

If the print preview looks wrong, re-run the validation commands — a missing
`@media print` block makes `node test/validate-cv.js` exit `1` with the
message `styles.css is missing the @media print block`.
