import {
  AddCustomer,
  DeleteCustomer,
  EditCustomer,
  GetCustomer,
  GetEverything,
  ListCustomers,
} from '../electron/main/types.ts';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

export interface IDbAPI {
  listCustomers: ListCustomers;
  getCustomer: GetCustomer;
  addCustomer: AddCustomer;
  editCustomer: EditCustomer;
  deleteCustomer: DeleteCustomer;
  getEverything: GetEverything;
  generatePdfInvoices: () => void; // TODO: add type for pdf invoices function
}

declare global {
  interface Window {
    dbAPI: IDbAPI;
  }
}
