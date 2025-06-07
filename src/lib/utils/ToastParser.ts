import * as cheerio from 'cheerio';
import type { Receipt, ReceiptItem } from './Receipts';

export function parseToastReceipt(html: string, url: string): Receipt {
	const $ = cheerio.load(html);

	// Find the merchant name
	const merchantName = $('title')
		.text()
		.replace(/Your Receipt for\s*/i, '')
		.trim();

	// Find the receipt table
	const rows = $('.receipt-body table tr');

	let guestCount = null;
	let items: ReceiptItem[] = [];
	let tax = 0;
	let tip = 0;
	let fees = 0;
	let inItemsSection = false;
	let itemsFinished = false;

	rows.each((_, row) => {
		const tds = $(row).find('td');
		if (tds.length < 2) return;

		const left = $(tds[0]).text().trim();
		const right = $(tds[1]).text().trim();

		// Guest count
		if (/Guest Count/i.test(left)) {
			const match = left.match(/Guest Count:\s*(\d+)/i);
			if (match) guestCount = parseInt(match[1], 10);
		}

		// Start of items: skip lines until we hit a price (right side contains a dollar sign)
		if (!inItemsSection && right.includes('$')) {
			inItemsSection = true;
		}

		// Parse items
		if (inItemsSection && !itemsFinished && right.includes('$')) {
			// Items stop when we hit a subtotal line
			if (/Subtotal/i.test(left)) {
				inItemsSection = false;
				itemsFinished = true;
			}
			// If the line item has a % in it or has "surcharge" in it, treat it as a fee
			else if (/Fee|Surcharge/i.test(left) || left.includes('%')) {
				// Parse fee
				const feeAmount = parseFloat(right.replace(/[^0-9.-]/g, ''));
				fees += feeAmount;
			} else {
				// Parse item
				const qty = left.match(/^(\d+)\s+/);
				// If quantity is present, extract it
				const quantity = qty ? parseInt(qty[1], 10) : 1;
				const name = left.replace(/^\d+\s+/, '').trim();

				// Extract price, removing any non-numeric characters except for the decimal point
				const price = parseFloat(right.replace(/[^0-9.-]/g, ''));

				items.push({ name, price, quantity });
			}
		}

		// Tax
		if (/^Tax$/i.test(left)) {
			tax = parseFloat(right.replace(/[^0-9.]/g, ''));
		}

		// Tip
		if (/^Tip$/i.test(left)) {
			tip = parseFloat(right.replace(/[^0-9.]/g, ''));
		}
	});

	return {
		url,
		guestCount,
		items,
		tax,
		tip,
		merchant: merchantName,
		fees: fees || 0
	};
}
