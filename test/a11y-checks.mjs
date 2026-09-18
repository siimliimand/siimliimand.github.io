#!/usr/bin/env node
/*
 * a11y-checks: dependency-free accessibility assertions for this repo.
 *
 * Uses only Node built-ins (no packages, no test runner):
 *
 *     node test/a11y-checks.mjs contrast <foreground> <background> [--min <ratio>]
 *     node test/a11y-checks.mjs hero <fixture-directory>
 *     node test/a11y-checks.mjs help
 *
 * Exit status 0 = assertions passed, 1 = at least one assertion failed,
 * 2 = the command line or its input could not be parsed (usage error).
 * Keeping parse errors (2) distinct from failed assertions (1) lets CI tell
 * "this page is inaccessible" apart from "this check is broken".
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const PROGRAM = 'a11y-checks';
const DEFAULT_MIN_RATIO = 4.5;
const LAYER_NAME = 'background-name';
const MAX_LAYER_OPACITY = 0.12;

const USAGE = [
	'usage: node test/a11y-checks.mjs <command> [arguments]',
	'',
	'commands:',
	'  contrast <foreground> <background> [--min <ratio>]',
	'      Print the WCAG 2.x contrast ratio between two colours and fail',
	'      when it is below --min (default ' + DEFAULT_MIN_RATIO + ').',
	'      Colours accept #rgb, #rgba, #rrggbb, #rrggbbaa and rgb() forms.',
	'  hero <fixture-directory>',
	'      Check that the fixture\'s "' + LAYER_NAME + '" hero layer declares',
	'      opacity <= ' + MAX_LAYER_OPACITY + ' and a z-index strictly below the headline\'s,',
	'      so it stays a faint backdrop behind the name instead of competing',
	'      with it. A fixture is index.html plus any <style> block or',
	'      styles.css / hero.css beside it.',
	'  help',
	'      Print this message.',
	'',
	'exit status: 0 all checks passed, 1 a check failed, 2 usage error',
].join('\n');

/* ------------------------------------------------------- colour + contrast */

function parseColor(raw) {
	const text = String(raw).trim().toLowerCase();

	if (text.startsWith('#')) {
		const digits = text.slice(1);
		if (!/^[0-9a-f]{3}$|^[0-9a-f]{4}$|^[0-9a-f]{6}$|^[0-9a-f]{8}$/.test(digits)) {
			return null;
		}
		const full = digits.length <= 4
			? digits.split('').map((digit) => digit + digit).join('')
			: digits;
		return {
			red: parseInt(full.slice(0, 2), 16),
			green: parseInt(full.slice(2, 4), 16),
			blue: parseInt(full.slice(4, 6), 16),
			alpha: full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
		};
	}

	const rgb = text.match(/^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)(?:[\s,/]+([0-9.]+%?))?\s*\)$/);
	if (!rgb) {
		return null;
	}
	const channel = (value, label) => {
		const number = Number(value);
		if (label === '%') {
			return Math.round(Math.min(Math.max(number, 0), 100) * 2.55);
		}
		return Math.round(Math.min(Math.max(number, 0), 255));
	};
	return {
		red: channel(rgb[1]),
		green: channel(rgb[2]),
		blue: channel(rgb[3]),
		alpha: rgb[4] === undefined ? 1 : (rgb[4].endsWith('%') ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4])),
	};
}

// sRGB channel -> linear light (WCAG 2.x formula)
function linearizeChannel(value) {
	const channel = value / 255;
	return channel <= 0.03928
		? channel / 12.92
		: Math.pow((channel + 0.055) / 1.055, 2.4);
}

function relativeLuminance(color) {
	return 0.2126 * linearizeChannel(color.red)
		+ 0.7152 * linearizeChannel(color.green)
		+ 0.0722 * linearizeChannel(color.blue);
}

// A translucent foreground is read against the backdrop it paints over.
function compositeOver(foreground, background) {
	const alpha = Math.min(Math.max(foreground.alpha, 0), 1);
	return {
		red: Math.round(foreground.red * alpha + background.red * (1 - alpha)),
		green: Math.round(foreground.green * alpha + background.green * (1 - alpha)),
		blue: Math.round(foreground.blue * alpha + background.blue * (1 - alpha)),
		alpha: 1,
	};
}

function contrastRatio(foreground, background) {
	const front = compositeOver(foreground, background);
	const lighter = Math.max(relativeLuminance(front), relativeLuminance(background));
	const darker = Math.min(relativeLuminance(front), relativeLuminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

/* ------------------------------------------------------------ CSS scanning */

function stripCssComments(css) {
	return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function parseDeclarations(body) {
	const declarations = {};
	for (const chunk of body.split(';')) {
		const splitAt = chunk.indexOf(':');
		if (splitAt === -1) {
			continue;
		}
		const property = chunk.slice(0, splitAt).trim().toLowerCase();
		const value = chunk.slice(splitAt + 1).trim();
		if (property && value) {
			declarations[property] = value;
		}
	}
	return declarations;
}

// Flattens a stylesheet into { selector, declarations } pairs, descending into
// at-rules such as @media so overrides inside them are still visible.
function parseCssRules(css) {
	const rules = [];
	const text = stripCssComments(css);

	function walk(chunk, prefix) {
		let cursor = 0;
		while (cursor < chunk.length) {
			const open = chunk.indexOf('{', cursor);
			if (open === -1) {
				break;
			}
			const selector = chunk.slice(cursor, open).trim();
			let depth = 1;
			let end = open + 1;
			while (end < chunk.length && depth > 0) {
				if (chunk[end] === '{') {
					depth += 1;
				} else if (chunk[end] === '}') {
					depth -= 1;
				}
				end += 1;
			}
			const body = chunk.slice(open + 1, depth === 0 ? end - 1 : end);
			const scoped = prefix ? prefix + ' ' + selector : selector;
			if (body.includes('{')) {
				walk(body, scoped);
			} else {
				rules.push({ selector: scoped, declarations: parseDeclarations(body) });
			}
			cursor = end;
		}
	}

	walk(text, '');
	return rules;
}

function escapeRegExp(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function selectorNames(selector) {
	return selector.split(',').map((part) => part.trim().toLowerCase());
}

function selectorTargets(selector, name) {
	return selectorNames(selector).some((part) => {
		return part.includes('[data-hero-layer="' + name + '"]')
			|| part.includes("[data-hero-layer='" + name + "']")
			|| new RegExp('[.#][a-z0-9_-]*' + escapeRegExp(name) + '[a-z0-9_-]*').test(part);
	});
}

function inlineStyleDeclarations(tagAttributes) {
	const match = tagAttributes.match(/style\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
	if (!match) {
		return {};
	}
	return parseDeclarations(match[1] || match[2] || '');
}

// Opening tags of the document, as { name, attributes }.
function findTags(html) {
	const tags = [];
	const pattern = /<([a-z][a-z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
	let match;
	while ((match = pattern.exec(html)) !== null) {
		tags.push({ name: match[1].toLowerCase(), attributes: match[2] || '' });
	}
	return tags;
}

function taggedLayer(tags, name) {
	return tags.find((tag) => tag.attributes.includes('data-hero-layer="' + name + '"')
		|| tag.attributes.includes("data-hero-layer='" + name + "'"))
		|| null;
}

function taggedHeadline(tags) {
	return tags.find((tag) => tag.name === 'h1'
		|| tag.attributes.includes('data-hero-layer="headline"')
		|| /class\s*=\s*("[^"]*|\S*)?hero-headline/.test(tag.attributes))
		|| null;
}

// Declarations for a tag: matching stylesheet rules in source order, then the
// inline style attribute (which wins, as in the cascade).
function declarationsForTag(tag, rules, name) {
	const merged = {};
	if (tag) {
		for (const rule of rules) {
			const isMatch = selectorTargets(rule.selector, name)
				|| (tag.name !== 'div' && selectorNames(rule.selector).some((part) => part === tag.name));
			if (isMatch) {
				Object.assign(merged, rule.declarations);
			}
		}
		Object.assign(merged, inlineStyleDeclarations(tag.attributes));
	}
	return merged;
}

/* ------------------------------------------------------------ hero command */

function readFixture(fixturePath) {
	const resolved = path.resolve(fixturePath);
	if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
		return { error: 'not a directory: ' + fixturePath };
	}
	const htmlPath = path.join(resolved, 'index.html');
	if (!existsSync(htmlPath)) {
		return { error: 'fixture has no index.html: ' + fixturePath };
	}
	let html;
	try {
		html = readFileSync(htmlPath, 'utf8');
	} catch (error) {
		return { error: 'cannot read ' + fixturePath + '/index.html: ' + error.message };
	}

	let css = '';
	for (const block of html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []) {
		css += block.replace(/<\/?style[^>]*>/gi, '') + '\n';
	}
	for (const fileName of ['styles.css', 'hero.css']) {
		const cssPath = path.join(resolved, fileName);
		if (existsSync(cssPath)) {
			try {
				css += readFileSync(cssPath, 'utf8') + '\n';
			} catch (error) {
				return { error: 'cannot read ' + fixturePath + '/' + fileName + ': ' + error.message };
			}
		}
	}
	return { html: html, css: css };
}

function checkHeroFixture(fixturePath) {
	const fixture = readFixture(fixturePath);
	if (fixture.error) {
		return { usageError: fixture.error };
	}

	const tags = findTags(fixture.html);
	const rules = parseCssRules(fixture.css);
	const layer = taggedLayer(tags, LAYER_NAME);
	const headline = taggedHeadline(tags);
	const layerDeclarations = declarationsForTag(layer, rules, LAYER_NAME);
	const headlineDeclarations = declarationsForTag(headline, rules, 'headline');

	const details = [];
	const failures = [];
	function report(message) {
		details.push(message);
	}

	if (!layer) {
		report('no <' + LAYER_NAME + '> hero layer found: expected an element with '
			+ 'data-hero-layer="' + LAYER_NAME + '"');
		failures.push('the "' + LAYER_NAME + '" hero layer is missing');
	} else {
		/* --- opacity: the backdrop must stay faint --- */
		const opacity = layerDeclarations.opacity;
		if (opacity === undefined) {
			report('layer declares no opacity (expected <= ' + MAX_LAYER_OPACITY + ')');
			failures.push('the "' + LAYER_NAME + '" layer does not declare opacity');
		} else {
			const value = Number.parseFloat(opacity);
			if (!Number.isFinite(value) || value < 0 || value > 1) {
				report('layer opacity "' + opacity + '" is not a number between 0 and 1');
				failures.push('the "' + LAYER_NAME + '" layer opacity "' + opacity + '" is not usable');
			} else if (value <= MAX_LAYER_OPACITY) {
				report('opacity ' + value + ' <= ' + MAX_LAYER_OPACITY);
			} else {
				report('opacity ' + value + ' > ' + MAX_LAYER_OPACITY);
				failures.push('the "' + LAYER_NAME + '" layer opacity is ' + value
					+ ', above the maximum ' + MAX_LAYER_OPACITY);
			}
		}

		/* --- z-index: strictly below the headline, so behind it --- */
		const layerZ = layerDeclarations['z-index'];
		if (layerZ === undefined) {
			report('layer declares no z-index (expected below the headline)');
			failures.push('the "' + LAYER_NAME + '" layer does not declare z-index');
		} else {
			const layerValue = Number.parseInt(layerZ, 10);
			const headlineZ = headlineDeclarations['z-index'];
			const headlineValue = headlineZ === undefined || /^\s*auto\s*$/i.test(headlineZ)
				? 0
				: Number.parseInt(headlineZ, 10);
			if (!Number.isFinite(layerValue)) {
				report('layer z-index "' + layerZ + '" is not an integer');
				failures.push('the "' + LAYER_NAME + '" layer z-index "' + layerZ + '" is not an integer');
			} else if (!Number.isFinite(headlineValue)) {
				report('headline z-index "' + headlineZ + '" is not an integer');
				failures.push('the headline z-index "' + headlineZ + '" is not an integer');
			} else if (layerValue < headlineValue) {
				report('z-index ' + layerValue + ' < headline z-index ' + headlineValue);
			} else {
				report('z-index ' + layerValue + ' is not below headline z-index ' + headlineValue);
				failures.push('the "' + LAYER_NAME + '" layer z-index ' + layerValue
					+ ' is not below the headline z-index ' + headlineValue);
			}
		}
	}

	if (!headline) {
		details.push('no headline found (expected <h1>, data-hero-layer="headline" or .hero-headline)');
	}

	return {
		details: details,
		failures: failures,
		layerFound: Boolean(layer),
	};
}

/* ------------------------------------------------------- contrast command */

function parseRatioArgument(raw) {
	if (!/^[0-9]+(\.[0-9]+)?$/.test(raw)) {
		return null;
	}
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) && value >= 0 ? value : null;
}

/* ------------------------------------------------------------------- main */

function usageError(message) {
	console.error(PROGRAM + ': ' + message);
	console.error(USAGE);
	return 2;
}

function runContrast(arguments_) {
	const positional = [];
	let minimum = DEFAULT_MIN_RATIO;

	for (let index = 0; index < arguments_.length; index += 1) {
		const argument = arguments_[index];
		if (argument === '--min') {
			const next = arguments_[index + 1];
			if (next === undefined) {
				return usageError('--min needs a ratio, e.g. --min 4.5');
			}
			const parsed = parseRatioArgument(next);
			if (parsed === null) {
				return usageError('--min got "' + next + '", expected a number such as 4.5');
			}
			minimum = parsed;
			index += 1;
		} else if (argument.startsWith('--')) {
			return usageError('unknown option "' + argument + '" for contrast');
		} else {
			positional.push(argument);
		}
	}

	if (positional.length === 0) {
		return usageError('contrast needs a foreground and a background colour');
	}
	if (positional.length > 2) {
		return usageError('contrast takes exactly two colours, got ' + positional.length);
	}

	const foreground = parseColor(positional[0]);
	if (!foreground) {
		return usageError('"' + positional[0] + '" is not a colour (use #rgb, #rrggbb or rgb())');
	}
	const background = parseColor(positional[1]);
	if (!background) {
		return usageError('"' + positional[1] + '" is not a colour (use #rgb, #rrggbb or rgb())');
	}

	const ratio = contrastRatio(foreground, background);
	const rounded = ratio.toFixed(2);
	if (ratio >= minimum) {
		console.log(positional[0] + ' on ' + positional[1] + ': contrast ratio '
			+ rounded + ':1 (minimum ' + minimum + ':1) — PASS');
		return 0;
	}
	console.log(positional[0] + ' on ' + positional[1] + ': contrast ratio '
		+ rounded + ':1 (minimum ' + minimum + ':1) — FAIL');
	console.error(PROGRAM + ': contrast ratio ' + rounded + ':1 is below the required ' + minimum + ':1');
	return 1;
}

function runHero(arguments_) {
	const positional = [];
	for (const argument of arguments_) {
		if (argument.startsWith('--')) {
			return usageError('unknown option "' + argument + '" for hero');
		}
		positional.push(argument);
	}
	if (positional.length !== 1) {
		return usageError('hero needs exactly one fixture directory');
	}

	const result = checkHeroFixture(positional[0]);
	if (result.usageError) {
		return usageError(result.usageError);
	}

	for (const detail of result.details) {
		console.log('  ' + detail);
	}
	if (result.failures.length > 0) {
		console.log(positional[0] + ': hero layering — FAIL');
		for (const failure of result.failures) {
			console.error('  - ' + failure);
		}
		return 1;
	}
	console.log(positional[0] + ': hero layering — PASS');
	return 0;
}

export function main(argv) {
	const [command, ...rest] = argv;

	if (command === undefined) {
		return usageError('a command is required');
	}
	if (command === 'help' || command === '-h' || command === '--help') {
		console.log(USAGE);
		return 0;
	}
	if (command === 'contrast') {
		return runContrast(rest);
	}
	if (command === 'hero') {
		return runHero(rest);
	}
	return usageError('unknown command "' + command + '"');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
	process.exitCode = main(process.argv.slice(2));
}
