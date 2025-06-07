export interface ReceiptItem {
    name: string;
    price: number;
    quantity?: number;
    people?: string[];
}

export interface Receipt {
    url: string;
    guestCount: number | null;
    items: ReceiptItem[];
    tax: number;
    tip: number;
    merchant?: string;
    fees?: number;
}
