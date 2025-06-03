export interface ReceiptItem {
    name: string;
    price: number;
    quantity?: number;
}

export interface ReceiptParseResult {
    url: string;
	guestCount: number | null;
	items: ReceiptItem[];
	tax: number;
	tip: number;
	merchant?: string;
	fees?: number;
}
