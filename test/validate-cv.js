#!/usr/bin/env node
'use strict';

/*
 * Dependency-free validation for the CV page.
 *
 * Uses only Node built-ins (no packages, no test runner), so it runs anywhere
 * Node is installed:
 *
 *     node test/validate-cv.js
 *
 * Exit status 0 means every check passed; exit status 1 means at least one
 * check failed (each failing check prints a message naming what is missing).
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const HTML_PATH = path.join(REPO_ROOT, 'index.html');
const CSS_PATH = path.join(REPO_ROOT, 'styles.css');
const REQUIRED_SECTION_IDS = ['contact', 'summary', 'skills', 'experience', 'education'];
const MIN_CONTRAST_RATIO = 4.5;

/* ------------------------------------------------------------------ color */

// sRGB channel -> linear light (WCAG 2.x formula)
function linearizeChannel(value) {
	const channel = value / 255;
	return channel <= 0.03928
		? channel / 12.92
		: Math.pow((channel + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
	const digits = hex.replace('#', '');
	const full = digits.length <= 4
		? digits.split('').map((d) => d + d).join('')
		: digits;
	const red = parseInt(full.slice(0, 2), 16);
	const green = parseInt(full.slice(2, 4), 16);
	const blue = parseInt(full.slice(4, 6), 16);

	return 0.2126 * linearizeChannel(red)
		+ 0.7152 * linearizeChannel(green)
		+ 0.0722 * linearizeChannel(blue);
}

function contrastRatio(hexA, hexB) {
	const a = relativeLuminance(hexA);
	const b = relativeLuminance(hexB);
	const lighter = Math.max(a, b);
	const darker = Math.min(a, b);
	return (lighter + 0.05) / (darker + 0.05);
}

// Value of a custom property as declared in the :root block of the stylesheet
// (the default palette; dark-mode and print overrides are ignored on purpose).
function rootCustomPropertyValue(css, propertyName) {
	const rootBlock = css.match(/:root\s*\{([^}]*)\}/);
	const scope = rootBlock ? rootBlock[1] : css;
	const declaration = scope.match(
		new RegExp('--' + propertyName + '\\s*:\\s*(#[0-9a-fA-F]{3,8})\\s*;')
	);
	return declaration ? declaration[1] : null;
}

/* ----------------------------------------------------------------- checks */

function validate({ html, css }) {
	const failures = [];
	function check(condition, message) {
		if (!condition) {
			failures.push(message);
		}
		return Boolean(condition);
	}

	/* --- index.html --- */

	check(
		/<title>\s*\S[^<]*<\/title>/.test(html),
		'index.html is missing the page title (<title>…</title>)'
	);

	for (const sectionId of REQUIRED_SECTION_IDS) {
		check(
			html.includes('id="' + sectionId + '"'),
			'index.html is missing the "' + sectionId + '" section (id="' + sectionId + '")'
		);
	}

	// The email address is deliberately surfaced in three places (navigation,
	// contact card, footer); require all three so removing any one is caught.
	const mailtoCount = (html.match(/href="mailto:[^"\s]+"/gi) || []).length;
	check(
		mailtoCount >= 3,
		'index.html is missing the mailto link (href="mailto:…"): it is expected in '
			+ 'the navigation, the contact section, and the footer, but only '
			+ mailtoCount + ' mailto link(s) were found'
	);

	check(
		/href="assets\/favicon\.svg"/.test(html),
		'index.html is missing the assets/favicon.svg reference (href="assets/favicon.svg")'
	);

	/* --- styles.css --- */

	check(
		/@media\s+print\s*\{/.test(css),
		'styles.css is missing the @media print block'
	);

	check(
		/@media\s*\(\s*max-width\s*:\s*600px\s*\)\s*\{/.test(css),
		'styles.css is missing the @media (max-width: 600px) block'
	);

	const leftovers = css.match(/TODO|Lorem/gi) || [];
	check(
		leftovers.length === 0,
		'styles.css contains ' + leftovers.length + ' TODO/Lorem placeholder marker(s): '
			+ Array.from(new Set(leftovers)).join(', ')
	);
	/* --- text/background contrast --- */

	const textColor = rootCustomPropertyValue(css, 'color-text');
	const backgroundColor = rootCustomPropertyValue(css, 'color-background');

	if (!check(textColor, 'styles.css does not declare a hex value for --color-text in :root')) {
		return { ok: false, failures };
	}
	if (!check(backgroundColor, 'styles.css does not declare a hex value for --color-background in :root')) {
		return { ok: false, failures };
	}

	const ratio = contrastRatio(textColor, backgroundColor);
	check(
		ratio >= MIN_CONTRAST_RATIO,
		'styles.css contrast ratio between --color-text (' + textColor + ') and '
			+ '--color-background (' + backgroundColor + ') is ' + ratio.toFixed(2)
			+ ':1, below the required ' + MIN_CONTRAST_RATIO + ':1'
	);

	return { ok: failures.length === 0, failures, ratio, textColor, backgroundColor };
}

/* ------------------------------------------------------------------- main */

function main() {
	let html;
	let css;
	try {
		html = fs.readFileSync(HTML_PATH, 'utf8');
	} catch (error) {
		console.error('validate-cv: cannot read index.html: ' + error.message);
		process.exitCode = 1;
		return;
	}
	try {
		css = fs.readFileSync(CSS_PATH, 'utf8');
	} catch (error) {
		console.error('validate-cv: cannot read styles.css: ' + error.message);
		process.exitCode = 1;
		return;
	}

	const result = validate({ html: html, css: css });

	if (!result.ok) {
		console.error('validate-cv: ' + result.failures.length + ' problem(s) found:');
		for (const failure of result.failures) {
			console.error('  - ' + failure);
		}
		process.exitCode = 1;
		return;
	}

	console.log(
		'validate-cv: all checks passed '
			+ '(contrast ratio ' + result.ratio.toFixed(2) + ':1 for '
			+ result.textColor + ' on ' + result.backgroundColor + ')'
	);
}

if (require.main === module) {
	main();
}

module.exports = { validate, contrastRatio, rootCustomPropertyValue, REQUIRED_SECTION_IDS };
