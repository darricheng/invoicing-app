import {
  AddCustomer,
  DeleteCustomer,
  EditCustomer,
  GetCustomer,
  GetEverything,
  ListCustomers,
} from '../main/types';

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
    electron: IDbAPI;
  }
}
