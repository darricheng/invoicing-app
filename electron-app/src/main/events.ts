import EventEmitter from 'events';

const appEventEmitter = new EventEmitter();

export enum AppEvents {
  CHROMIUM_DOWNLOAD_COMPLETE = 'CHROMIUM_DOWNLOAD_COMPLETE',
}

export default appEventEmitter;
