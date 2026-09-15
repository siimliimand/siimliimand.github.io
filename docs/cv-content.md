# CV Content Draft — Siim Liimand

Draft copy and skill inventory for the public CV. Each section below maps one-to-one
to a section of the personal site, so the page and this document stay in sync.

## Contact

- **Name:** Siim Liimand
- **Email:** [siim.liimand@gmail.com](mailto:siim.liimand@gmail.com)
- **Location:** Estonia — remote-friendly, working with clients across time zones
- **Availability:** Freelance engagements, fixed-scope projects, and long-term maintenance retainers

## Summary

Freelance web developer with **15+ years of hands-on experience** building websites,
customer portals, and e-commerce shops for small businesses, agencies, and independent
clients. I take projects end to end: scoping and estimation, front-end and back-end
implementation, hosting and DNS setup, launch, and ongoing maintenance. My comfort zone
is the intersection of clean hand-written front-end code, pragmatic CMS/custom backends,
and well-run Linux servers — sites that stay fast, reachable, and easy to maintain years
after launch.

Recent work leans on AI-assisted development as a deliberate working practice: using
LLM-based tooling for boilerplate, refactoring suggestions, and test scaffolding, while
keeping architectural decisions, security review, and final quality control firmly human.

## Skills

### Core languages and runtimes

- **HTML5** — semantic, accessible markup, structured data (schema.org)
- **CSS** — custom-property design tokens, responsive layouts, `prefers-color-scheme` theming
- **JavaScript** — vanilla ES2015+, progressive enhancement, no framework unless it earns its place
- **PHP** — custom themes and plugins, WooCommerce integrations, legacy code rescue
- **Python** — scripting, data migrations, small services and build tooling
- **Node.js** — build pipelines, tooling, API glue and small servers

### Extended skill set

- **Linux server administration** — Nginx and Apache configuration, DNS management,
  SSL/TLS certificates issued and renewed via Let's Encrypt
- **CI/CD** — GitHub Actions pipelines for lint, build, and test on every push
- **Containers** — Docker for reproducible local environments and deployments
- **Version control** — Git, branching discipline, code review
- **Databases** — MySQL and PostgreSQL: schema design, migrations, query tuning
- **CMS** — WordPress (theme and plugin development, multisite, WooCommerce)
- **REST API integration** — consuming and exposing third-party APIs (payments,
  shipping, CRM, marketing tools)
- **Performance optimization** — asset budgets, caching layers, image pipelines,
  Core Web Vitals work
- **SEO** — technical SEO audits, crawlability, metadata, sitemaps, redirects
- **Accessibility** — WCAG 2.1 conformance work: keyboard navigation, contrast,
  landmarks and ARIA where they are actually needed
- **Security hardening** — TLS configuration, dependency updates, least-privilege
  server setup, spam and bot mitigations
- **Operations** — automated off-site backups, uptime and error monitoring,
  documented recovery procedures

### Working practice

- **AI-assisted development** is an explicit part of my workflow: LLM pairing for
  scaffolding and exploration, with human-owned review, security checks, and tests
  gating everything that ships.
- Design tokens documented before styling spreads (see [`design.md`](design.md)).
- Automated checks where they pay off: this site ships with a responsive layout
  test suite run in CI.

## Experience

### Freelance Web Developer — independent practice

**Role:** Sole developer, designer, and operator · **Tech stack:** HTML, CSS, JavaScript, PHP, Python, Node.js, MySQL, WordPress, Linux (Nginx/Apache), Let's Encrypt, Git, GitHub Actions · **Years:** 2009–present

Running a one-person consultancy for over 15 years: client acquisition, scoping,
fixed-price delivery, hosting, and long-term maintenance. Several clients have been
continuous relationships for a decade or more across multiple redesigns and platform
migrations.

### Web Developer / Maintainer — WordPress and WooCommerce builds

**Role:** Lead developer for client sites and shops · **Tech stack:** WordPress, WooCommerce, PHP, MySQL, JavaScript, CSS, REST API integration, Docker · **Years:** 2012–present

Custom themes, plugin development, and shop builds for retail and service clients.
Typical scope: migrating legacy sites into WordPress, wiring payments and shipping
through REST APIs, performance tuning, and keeping the estate patched and backed up
under maintenance agreements.

### Portal and Back-office Developer — custom web applications

**Role:** Full-stack developer · **Tech stack:** PHP, Python, Node.js, MySQL/PostgreSQL, REST APIs, Linux server administration, Git · **Years:** 2013–2023

Customer portals and internal tools: authenticated member areas, document delivery,
data imports from partner systems, and reporting views. Owned the full stack from
database schema to server configuration, including DNS cutover and SSL rollout.

### Site Reliability and Hosting — infrastructure side of client work

**Role:** Administrator · **Tech stack:** Linux, Nginx, Apache, Docker, Let's Encrypt, MySQL, PostgreSQL, shell scripting, monitoring and backup tooling · **Years:** 2010–present

Day-to-day operations for the servers behind client sites: provisioning, virtual host
configuration, certificate automation, cache tuning, hardening, and restore drills.
This is the practice that keeps 15+ years of launched sites actually online.

## Selected Projects

### Personal site and design system (this repository)

**Role:** Designer and developer · **Tech stack:** HTML, CSS (custom properties, `prefers-color-scheme`), vanilla JavaScript, GitHub Actions CI, Playwright responsive tests · **Years:** 2023–present

A deliberately dependency-free personal site: light/dark theming from a single set of
CSS custom properties, two mobile-first breakpoints documented in
[`design.md`](design.md), semantic landmarks and alt text throughout, and an automated
responsive layout test run in CI on every change.

### Multi-language e-commerce shop platform

**Role:** Lead developer · **Tech stack:** WordPress, WooCommerce, PHP, MySQL, JavaScript, REST API integrations (payments, shipping, ERP), Redis object cache, Docker · **Years:** 2018–2022

A shop serving multiple markets with localized catalogues and tax rules. Built the
theme and checkout flow, integrated payment and shipping providers over REST APIs,
and cut page load times roughly in half with image pipelines and object caching.
Still in production under a maintenance retainer.

### Member portal with document delivery

**Role:** Full-stack developer · **Tech stack:** PHP, PostgreSQL, Node.js (job queue), Nginx, Let's Encrypt, automated encrypted backups · **Years:** 2016–2019

An authenticated portal where members retrieve statements and documents pushed from
a back-office system. Designed the schema, built the nightly import pipeline, and
ran the server: TLS automation, least-privilege access, and verified restore
procedures before every major change.

### Accessibility and performance retrofit for an agency portfolio

**Role:** Consultant and implementing developer · **Tech stack:** HTML, CSS, JavaScript, Lighthouse and axe audits, WordPress, GitHub Actions · **Years:** 2021–2022

Took an existing agency site to WCAG 2.1 AA on the issues that matter in practice:
heading structure, focus order, contrast, and keyboard-operable navigation — then
fixed the performance findings from the same audit pass and locked both regressions
out with CI checks.

## Education

- **Diploma-level studies in informatics / software development** — Estonian university of applied sciences · **Years:** 2005–2008
- **Continuous professional education** · **Years:** 2009–present
  - Vendor and platform training in WordPress and WooCommerce development
  - Linux server administration and security coursework
  - Regular attendance at web-platform and accessibility conferences and meetups
  - Ongoing self-directed study tracking the front-end platform (CSS layout,
    JavaScript language features, tooling)
