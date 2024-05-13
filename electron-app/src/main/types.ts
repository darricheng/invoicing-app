import { type GenerateInvoicesData } from '../../../shared-types/types';

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

export interface FullCustomerWithLineItems {
  customer: Customer;
  line_items: Array<LineItem>;
}

interface BaseCustomerForm {
  id: number | null;
  name: string;
  phone: string;
}

export interface LineItemForm {
  id: number | null;
  name: string;
  rate: number;
  customer_id: number | null;
  details: string;
}

export interface FullCustomerForm {
  customer: BaseCustomerForm;
  line_items: Array<LineItemForm>;
}

export type ListCustomers = () => Promise<Array<Customer>>;
export type GetCustomer = (id: number) => Promise<[Customer, Array<LineItem>]>;
export type AddCustomer = (data: FullCustomerForm) => Promise<[number, number]>; // [customer_id, number_of_line_items]
export type EditCustomer = (data: FullCustomerForm) => Promise<[number, number]>; // [customer_rows_updated, line_item_rows_updated]
export type DeleteCustomer = (id: number) => Promise<number>; // should just return 1 on successful delete
export type GetEverything = () => Promise<Array<FullCustomerWithLineItems>>;
export type SendInvoices = (data: GenerateInvoicesData) => Promise<number>;
