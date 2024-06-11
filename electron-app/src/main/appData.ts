// NOTE: This file will contain all the logic pertaining to data in the local data folder.
// E.g. creating the sqlite data file the first time, or managing chromium installations.
// Get the appropriate folder path with app.getPath();
// See: https://www.electronjs.org/docs/latest/api/app#appgetpathname

import fs from 'fs';
import { app } from 'electron';
import { is } from '@electron-toolkit/utils';

const basePath = is.dev ? `${app.getAppPath()}/mock-userData` : app.getPath('userData');
const appDataPath = basePath + '/appData';

export function initAppData(): void {
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath);
  }
}

export const puppeteerPath = `${appDataPath}/Chromium.app/Contents/MacOS/Chromium`;
