export interface IDbAPI {
  listCustomers: () => void;
  getCustomer: () => void;
  addCustomer: () => void;
  editCustomer: () => void;
  deleteCustomer: () => void;
  getEverything: () => void;
  generatePdfInvoices: () => void;
}

declare global {
  interface Window {
    electron: IDbAPI;
  }
}
