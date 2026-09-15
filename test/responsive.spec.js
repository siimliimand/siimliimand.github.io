import { test, expect } from '@playwright/test';

// Server under test: any static file server bound to port 8080
// (e.g. `python3 -m http.server 8080` or `npx serve -l 8080 .`).
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const MOBILE_VIEWPORT = { width: 375, height: 667 };

test.describe('responsive layout', () => {
	test.describe.configure({ mode: 'serial' });

	test.use({ viewport: MOBILE_VIEWPORT });

	test('has no horizontal overflow at a 375px viewport', async ({ page }) => {
		await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });

		await expect(page.locator('main .card')).toBeVisible();

		const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(scrollWidth).toBeLessThanOrEqual(375);
	});

	test('collapses to a single column below 900px', async ({ page }) => {
		await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });

		const layout = await page.evaluate(() => {
			const main = getComputedStyle(document.querySelector('main'));
			const card = document.querySelector('main .card').getBoundingClientRect();
			return {
				flexDirection: main.flexDirection,
				cardWidth: card.width,
				viewportWidth: document.documentElement.clientWidth,
			};
		});

		expect(layout.flexDirection).toBe('column');
		expect(layout.cardWidth).toBeLessThanOrEqual(layout.viewportWidth);
	});

	test('scales the contact image down to the container width', async ({ page }) => {
		await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });

		const image = await page.evaluate(() => {
			const img = document.querySelector('main .card img');
			const card = document.querySelector('main .card').getBoundingClientRect();
			return { imgWidth: img.getBoundingClientRect().width, cardWidth: card.width };
		});

		expect(image.imgWidth).toBeGreaterThan(0);
		expect(image.imgWidth).toBeLessThanOrEqual(image.cardWidth);
	});
});
