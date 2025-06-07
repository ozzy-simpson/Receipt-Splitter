import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, url }) => {
    // Get the receipt from the query parameters and parse it
    const receiptParam = url.searchParams.get('receipt');
    try {
        const receipt = receiptParam ? atob(decodeURIComponent(receiptParam)) : null;

        // If the receipt is provided, convert it from JSON string to Receipt object
        if (receipt) {
            // Get a short link to the page using tinyurl
            const shortLink = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url.href)}`;
            const response = await fetch(shortLink);
            const shortUrl = await response.text();

            return {
                receipt: JSON.parse(receipt),
                shortUrl: shortUrl
            };
        }
        // If no receipt is provided, redirect to home
        throw error(400, 'No receipt provided');
    } catch (e) {
        throw redirect(302, '/'); // Redirect to home if no receipt is provided
    }
};
