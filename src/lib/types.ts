export interface CustomerFormData {
	customer: {
		name: string;
		phone: string;
	};
	line_items: Array<{ name: string; rate: number; id: number | null }>;
}

export interface Customer {
	id: number;
	name: string;
	phone: string;
}

export interface LineItem {
	id: number;
	name: string;
	rate: number;
	customer_id: number;
}
