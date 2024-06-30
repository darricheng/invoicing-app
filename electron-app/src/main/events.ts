import EventEmitter from 'events';

const appEventEmitter = new EventEmitter();

export enum AppEvents {
  CHROMIUM_DOWNLOAD_COMPLETE = 'CHROMIUM_DOWNLOAD_COMPLETE',
  WA_VERSION_CACHE_DOWNLOAD_COMPLETE = 'WA_VERSION_CACHE_DOWNLOAD_COMPLETE',
}

export default appEventEmitter;
