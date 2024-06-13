import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import {
  addCustomer,
  closeDb,
  deleteCustomer,
  editCustomer,
  getCustomer,
  getEverything,
  initDb,
  listCustomers,
  testDb,
} from './db';
import { sendInvoices, closePuppets, initWA } from './invoice';
import { downloadPuppeteer, initAppData } from './appData';

let mainWindow: BrowserWindow;

function loadVite(): void {
  mainWindow.loadURL('http://localhost:5173').catch((e) => {
    console.error('Error loading URL, retrying', e);
    setTimeout(() => {
      loadVite();
    }, 200);
  });
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev) {
    loadVite();
    mainWindow.webContents.openDevTools();
    // mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const dbPath = is.dev
    ? app.getAppPath() + '/dev.sqlite'
    : app.getPath('appData') + '/invoicing-app-data';
  initDb(dbPath);
  testDb();
  initAppData();

  downloadPuppeteer();

  // IPC handlers
  ipcMain.handle('list-customers', listCustomers);
  ipcMain.handle('get-customer', getCustomer);
  ipcMain.handle('add-customer', addCustomer);
  ipcMain.handle('edit-customer', editCustomer);
  ipcMain.handle('delete-customer', deleteCustomer);
  ipcMain.handle('get-everything', getEverything);
  ipcMain.handle('send-invoices', sendInvoices);

  // Set up WhatsApp Client
  initWA();

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// See: https://github.com/electron/electron/issues/9433#issuecomment-1870607944
enum BeforeQuitActionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}
let beforeQuitActionStatus = BeforeQuitActionStatus.NOT_STARTED;
app.on('before-quit', async (e) => {
  switch (beforeQuitActionStatus) {
    case BeforeQuitActionStatus.NOT_STARTED:
      e.preventDefault();
      beforeQuitActionStatus = BeforeQuitActionStatus.IN_PROGRESS;
      await closeDb();
      await closePuppets();
      beforeQuitActionStatus = BeforeQuitActionStatus.COMPLETED;
      app.quit();
      break;
    case BeforeQuitActionStatus.IN_PROGRESS:
      e.preventDefault();
      break;
    case BeforeQuitActionStatus.COMPLETED:
      break;
  }
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
