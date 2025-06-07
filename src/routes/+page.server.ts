import type { PageServerLoad } from './$types';
import { parseToastReceipt } from '$lib/utils/ToastParser';

export const load: PageServerLoad = async ({ fetch, url }) => {
    // Get the receipt URL from the query parameters and parse it
    const receiptURL = url.searchParams.has('receipt')
        ? decodeURIComponent(url.searchParams.get('receipt')!)
        : null;

    // Parse the receipt if a URL is provided
    if (receiptURL) {
        const response = await fetch(receiptURL);
        const receiptData = parseToastReceipt(await response.text(), receiptURL);
        return {
            receipt: receiptData,
            loading: false
        };
    }
    return {
        loading: false
    };
};
