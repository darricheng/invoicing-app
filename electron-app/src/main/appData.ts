// NOTE: This file will contain all the logic pertaining to data in the local data folder.
// E.g. creating the sqlite data file the first time, or managing chromium installations.
// Get the appropriate folder path with app.getPath();
// See: https://www.electronjs.org/docs/latest/api/app#appgetpathname

import fs from 'fs';
import fsPromise from 'fs/promises';
import https from 'https';
import { exec } from 'child_process';

import { IpcMainInvokeEvent, app, shell } from 'electron';
import { is } from '@electron-toolkit/utils';

import appEventEmitter, { AppEvents } from './events';
import { WA_WEB_VERSION, WA_WEB_VERSION_CACHE_DOWNLOAD_URL, chromiumMacArmUrl } from './constants';
import { CompanySettings } from '../../../shared-types/types';
import dayjs from 'dayjs';

const basePath = is.dev ? `${app.getAppPath()}/mock-userData` : app.getPath('userData');
const appDataPath = basePath + '/appData';

const zippedChromiumPath = `${appDataPath}/zipped-chromium`;

const companySettingsJson = `${appDataPath}/company-settings.json`;

export const localWaWebVersionCacheDirectory = `${appDataPath}/wwebjs/local-wa-version-cache`;
export const localWaWebVersionCachePath = `${localWaWebVersionCacheDirectory}/${WA_WEB_VERSION}.html`;

export const chromiumPath = `${appDataPath}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`;

export const invoicesFolderPath = `${appDataPath}/invoices/`;

export function initAppData(): void {
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath);
  }
  if (!fs.existsSync(localWaWebVersionCacheDirectory)) {
    fs.mkdirSync(localWaWebVersionCacheDirectory, { recursive: true });
  }
  if (!fs.existsSync(invoicesFolderPath)) {
    fs.mkdirSync(invoicesFolderPath);
  }
}

export function waVersionCacheExists(): boolean {
  return fs.existsSync(localWaWebVersionCachePath);
}

export function downloadWaVersionCache(): void {
  const waWebVersionCacheFile = fs.createWriteStream(localWaWebVersionCachePath);
  https
    .get(`${WA_WEB_VERSION_CACHE_DOWNLOAD_URL}/${WA_WEB_VERSION}.html`, (response) => {
      response.pipe(waWebVersionCacheFile);

      waWebVersionCacheFile.on('finish', () => {
        waWebVersionCacheFile.close();
        appEventEmitter.emit(AppEvents.WA_VERSION_CACHE_DOWNLOAD_COMPLETE);
      });
    })
    .on('error', (err) => {
      fs.unlinkSync(localWaWebVersionCachePath);
      console.error(err.message);
    });
}

export function chromiumExists(): boolean {
  return fs.existsSync(chromiumPath);
}

export function downloadChromium(): void {
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

export function getCompanySettings(): CompanySettings {
  const data = fs.readFileSync(companySettingsJson, 'utf8');
  return JSON.parse(data);
}

export async function writeCompanySettings(
  _e: IpcMainInvokeEvent,
  data: CompanySettings
): Promise<void> {
  const json = JSON.stringify(data);
  try {
    await fsPromise.writeFile(companySettingsJson, json, 'utf8');
    // TODO: return something so that can show toast on GUI
  } catch (e) {
    // TODO: handle error!
  }
}

export async function openInvoicesFolder(): Promise<void> {
  // Same path as the one used when creating invoices
  const invoicesPathForToday = invoicesFolderPath + dayjs().format('YYYYMMDD');

  // Only open the folder for today if invoices were created today
  if (fs.existsSync(invoicesPathForToday)) {
    await shell.openPath(invoicesPathForToday);
  } else {
    await shell.openPath(invoicesFolderPath);
  }
}
