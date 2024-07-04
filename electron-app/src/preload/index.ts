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
  editCustomer: (data) => {
    return ipcRenderer.invoke('edit-customer', data);
  },
  deleteCustomer: (id) => {
    return ipcRenderer.invoke('delete-customer', id);
  },
  getEverything: () => {
    return ipcRenderer.invoke('get-everything');
  },
});

contextBridge.exposeInMainWorld('pdfAPI', {
  sendInvoices: (data) => {
    return ipcRenderer.invoke('send-invoices', data);
  },
});

contextBridge.exposeInMainWorld('companySettingsAPI', {
  getCompanySettings: () => {
    return ipcRenderer.invoke('get-company-settings');
  },
});

contextBridge.exposeInMainWorld('whatsappApi', {
  onReceiveWhatsappQr: (callback) => {
    return ipcRenderer.on('whatsapp-qr', (_event, data) => {
      callback(data);
    });
  },
  onWhatsappReady: (callback) => {
    return ipcRenderer.on('whatsapp-ready', (_event, data) => callback(data));
  },
});
