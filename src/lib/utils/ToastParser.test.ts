import { describe, it, expect } from 'vitest';
import { parseToastReceipt } from './ToastParser';

describe('parseToastReceipt', () => {
	it('parses a Toast receipt correctly', async () => {
		const url = 'https://www.toasttab.com/receipts/V2GkERSOTAKl-x2bQHj5-w/gYsXrkW7HWjqm';
        const html = await fetch(url).then(res => res.text());
		const result = parseToastReceipt(html, url);

		// Update these expected values based on the actual receipt contents
        expect(result.url).toBe(url);
        expect(result.merchant).toBe('San Pancho');
		expect(result.guestCount).toBe(1);
		expect(result.items).toEqual([
			{ name: 'VEGAN SUPER BURRITO', price: 15.0, quantity: 1 },
			{ name: 'HIBISCUS AGUA FRESCA', price: 5.0, quantity: 1 }
		]);
		expect(result.tax).toEqual(1.2);
		expect(result.tip).toEqual(4.0);
	});
});
