import {
  type AddCustomer,
  type DeleteCustomer,
  type EditCustomer,
  type GetCustomer,
  type GetEverything,
  type ListCustomers,
  type SendInvoices,
} from '../../electron-app/src/main/types';

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

export interface IDbAPI {
  listCustomers: ListCustomers;
  getCustomer: GetCustomer;
  addCustomer: AddCustomer;
  editCustomer: EditCustomer;
  deleteCustomer: DeleteCustomer;
  getEverything: GetEverything;
}

export interface IPdfAPI {
  sendInvoices: SendInvoices;
}

declare global {
  interface Window {
    dbAPI: IDbAPI;
    pdfAPI: IPdfAPI;
  }
}
