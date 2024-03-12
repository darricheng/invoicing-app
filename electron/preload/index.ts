import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('dbAPI', {
  listCustomers: () => {
    return ipcRenderer.invoke('list-customers');
  },
  getCustomer: () => {
    return ipcRenderer.invoke('get-customer');
  },
  addCustomer: () => {
    return ipcRenderer.invoke('add-customer');
  },
  editCustomer: () => {
    return ipcRenderer.invoke('edit-customer');
  },
  deleteCustomer: () => {
    return ipcRenderer.invoke('delete-customer');
  },
  getEverything: () => {
    return ipcRenderer.invoke('get-everything');
  },
  generatePdfInvoices: () => {
    return ipcRenderer.invoke('generate-pdf-invoices');
  },
});
