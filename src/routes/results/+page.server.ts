import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Get the receipt from the query parameters and parse it
	const receipt = url.searchParams.has('receipt') ? atob(url.searchParams.get('receipt')!) : null;

	// If the receipt is provided, convert it from JSON string to Receipt object
	if (receipt) {
		return {
			receipt: JSON.parse(receipt)
		};
	}
	return {
		receipt: null
	};
};
