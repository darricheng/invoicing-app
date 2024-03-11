import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('dbAPI', {
  listCustomers: () => {
    ipcRenderer.invoke('list-customers');
  },
  getCustomer: () => {
    ipcRenderer.invoke('get-customer');
  },
  addCustomer: () => {
    ipcRenderer.invoke('add-customer');
  },
  editCustomer: () => {
    ipcRenderer.invoke('edit-customer');
  },
  deleteCustomer: () => {
    ipcRenderer.invoke('delete-customer');
  },
  getEverything: () => {
    ipcRenderer.invoke('get-everything');
  },
  generatePdfInvoices: () => {
    ipcRenderer.invoke('generate-pdf-invoices');
  },
});
