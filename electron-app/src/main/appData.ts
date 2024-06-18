// NOTE: This file will contain all the logic pertaining to data in the local data folder.
// E.g. creating the sqlite data file the first time, or managing chromium installations.
// Get the appropriate folder path with app.getPath();
// See: https://www.electronjs.org/docs/latest/api/app#appgetpathname

import fs from 'fs';
import https from 'https';
import { exec } from 'child_process';

import { app } from 'electron';
import { is } from '@electron-toolkit/utils';

import appEventEmitter, { AppEvents } from './events';

const basePath = is.dev ? `${app.getAppPath()}/mock-userData` : app.getPath('userData');
const appDataPath = basePath + '/appData';

const chromiumMacArmUrl =
  'https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Mac_Arm%2F1045634%2Fchrome-mac.zip?generation=1662945273234999&alt=media';
const zippedChromiumPath = `${appDataPath}/zipped-chromium`;

export const chromiumPath = `${appDataPath}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;

export function initAppData(): void {
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath);
  }
}

export function downloadPuppeteer(): void {
  if (fs.existsSync(chromiumPath)) {
    console.log('Chromium already exists');
    appEventEmitter.emit(AppEvents.CHROMIUM_DOWNLOAD_COMPLETE);
    return;
  }

  const zippedChromiumFile = fs.createWriteStream(zippedChromiumPath);

  https
    .get(chromiumMacArmUrl, (response) => {
      response.pipe(zippedChromiumFile);

      zippedChromiumFile.on('finish', () => {
        zippedChromiumFile.close();

        exec(`unzip ${zippedChromiumPath} -d ${appDataPath}`, () => {
          appEventEmitter.emit(AppEvents.CHROMIUM_DOWNLOAD_COMPLETE);
        });
        // NOTE: Might have to remove the com.apple.quarantine attribute
        // using `xattr -d com.apple.quarantine path/to/Chromium` for MacOS
      });
    })
    .on('error', (err) => {
      fs.unlinkSync(zippedChromiumPath);
      console.error(err.message);
    });
}
