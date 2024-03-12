import { contextBridge, ipcRenderer } from 'electron';

// return keywords are necessary to return the data to the renderer
// docs examples exclude the return keyword though
contextBridge.exposeInMainWorld('dbAPI', {
  listCustomers: () => {
    return ipcRenderer.invoke('list-customers');
  },
  getCustomer: (id) => {
    return ipcRenderer.invoke('get-customer', id);
  },
  addCustomer: (data) => {
    return ipcRenderer.invoke('add-customer', data);
  },
  editCustomer: () => {
    return ipcRenderer.invoke('edit-customer');
  },
  deleteCustomer: (id) => {
    return ipcRenderer.invoke('delete-customer', id);
  },
  getEverything: () => {
    return ipcRenderer.invoke('get-everything');
  },
  generatePdfInvoices: () => {
    return ipcRenderer.invoke('generate-pdf-invoices');
  },
});
