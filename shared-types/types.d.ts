export type ViteMode = "development" | "livedev" | "production";

export interface CustomerFormData {
  customer: {
    id: number | null;
    name: string;
    phone: string;
  };
  line_items: Array<{ name: string; rate: number; id: number | null; details: string }>;
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
  details: string;
}

interface InvoiceLineItem {
  id: number;
  name: string;
  rate: number;
  customer_id: number;
  quantity: number;
  amount: number;
  details: string;
}

export interface InvoiceTableData {
  customer: Customer;
  line_items: Array<InvoiceLineItem>;
  selected: boolean;
}

export interface GenerateInvoicesData {
  invoiceData: Array<InvoiceTableData>;
  message: string;
}
