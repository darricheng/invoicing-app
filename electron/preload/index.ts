import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('dbAPI', {
  listCustomers: () => {
    ipcRenderer.invoke('listCustomers');
  },
  getCustomer: () => {
    ipcRenderer.invoke('getCustomer');
  },
  addCustomer: () => {
    ipcRenderer.invoke('addCustomer');
  },
  editCustomer: () => {
    ipcRenderer.invoke('editCustomer');
  },
  deleteCustomer: () => {
    ipcRenderer.invoke('deleteCustomer');
  },
  getEverything: () => {
    ipcRenderer.invoke('getEverything');
  },
  generatePdfInvoices: () => {
    ipcRenderer.invoke('generatePdfInvoices');
  },
});
