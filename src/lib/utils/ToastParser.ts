import * as cheerio from 'cheerio';
import type { ReceiptParseResult, ReceiptItem } from './Receipts';

export function parseToastReceipt(html: string, url: string): ReceiptParseResult {

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
    let inItemsSection = false;

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

        // Start of items: skip lines until we hit a price (right side starts with a dollar sign)
        if (!inItemsSection && /^\$\d/.test(right)) {
            inItemsSection = true;
        }

        // Parse items
        if (inItemsSection && /^\$\d/.test(right)) {
            // Stop at subtotal/tax/tip/total
            if (/Subtotal|Tax|Tip|Total/i.test(left)) {
                inItemsSection = false;
            }
            else {
                // Parse item
                const qty = left.match(/^(\d+)\s+/);
                // If quantity is present, extract it
                const quantity = qty ? parseInt(qty[1], 10) : 1;
                const name = left.replace(/^\d+\s+/, '').trim();
                const price = parseFloat(right.replace(/[^0-9.]/g, ''));

                // Check if the item name is already in the list
                const existingItem = items.find(item => item.name === name);
                if (existingItem) {
                    // If it exists, update the quantity and price
                    existingItem.quantity = (existingItem.quantity || 1) + quantity;
                    existingItem.price += price;
                }
                else {
                    // Otherwise, add a new item
                    items.push({ name, price, quantity });
                }
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
        merchant: merchantName
    };
}
