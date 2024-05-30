import { IpcMainInvokeEvent, app } from 'electron';
import { GenerateInvoicesData } from '../../../shared-types/types';
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import waweb from 'whatsapp-web.js';
import QRCode from 'qrcode';
import Handlebars from 'handlebars';
import dayjs from 'dayjs';
import { is } from '@electron-toolkit/utils';
import { viteMode } from './utils';

let waClient: waweb.Client;

export function initWA(): void {
  // force a login every time for dev so that we have to login again to send messages
  // TODO: set an appropriate path for the LocalAuth cache
  const authStrategy = is.dev ? new waweb.NoAuth() : new waweb.LocalAuth();
  waClient = new waweb.Client({
    authStrategy,
    // webVersion: '2.2412.54',
    webVersionCache: {
      // TODO: probably better to use a local cache, but had issues
      type: 'remote',
      remotePath:
        'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      strict: true,
    },
  });

  waClient.on('qr', (qr) => {
    console.log('QR RECEIVED: ', qr);
    // TODO: handle err properly
    QRCode.toString(qr, { type: 'terminal' }, (_err, url) => {
      console.log(url);
    });
    QRCode.toFile(app.getAppPath() + '/qrcode.jpg', qr);
  });
  waClient.on('ready', () => {
    console.log('WHATSAPP CLIENT IS READY');
  });
  waClient.initialize();

  process.on('exit', closeWA);
  process.on('SIGTERM', closeWA);
  process.on('uncaughtException', closeWA);
}

export async function sendInvoices(
  _e: IpcMainInvokeEvent,
  data: GenerateInvoicesData
): Promise<void> {
  const invoiceData = data.invoiceData;
  const message = data.message.trim();

  // See: https://stackoverflow.com/a/12397602
  Handlebars.registerHelper('breaklines', function (text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
  });

  const templateSource = await fs.readFile(app.getAppPath() + '/default-invoice-template.hbs', {
    encoding: 'utf8',
  });
  const template = Handlebars.compile(templateSource);

  const today = dayjs();
  const formattedToday = today.format('DD/MM/YYYY');

  const dates = {
    today: formattedToday,
    due: today.add(7, 'day').format('DD/MM/YYYY'),
  };

  // embed logo into html because in the context of puppeteer, it doesn't know how to get this path
  // we are providing puppeteer with html, not asking it to load a page from a directory
  // where it can resolve these paths
  const logo = await fs.readFile(app.getAppPath() + '/logo.png', { encoding: 'base64' });
  const logoSrc = 'data:image/png;base64,' + logo;

  const company = {
    // NOTE: using env vars to store company details is a temporary measure
    name: import.meta.env.MAIN_VITE_COMPANY_NAME,
    address: import.meta.env.MAIN_VITE_COMPANY_ADDRESS,
    phone: import.meta.env.MAIN_VITE_COMPANY_PHONE,
  };

  const phonePathMap: { [key: string]: string } = {};

  const browser = await puppeteer.launch();

  for (const entry of invoiceData) {
    console.log('creating pdf for: ', entry.customer.name);
    const totalAmount = dollarFormatter(
      entry.line_items.reduce((acc, item) => {
        return acc + item.amount;
      }, 0)
    );
    const lineItems = entry.line_items.map((el) => {
      return {
        name: el.name,
        details: el.details,
        quantity: el.quantity,
        rate: dollarFormatter(el.rate),
        amount: dollarFormatter(el.amount),
      };
    });

    const templateData = {
      dates,
      totalAmount,
      customer: entry.customer,
      logoSrc,
      lineItems,
      currency: 'SGD',
      company,
    };

    const invoiceHtml = template(templateData);

    const page = await browser.newPage();
    await page.setContent(invoiceHtml);
    // page needs time to load fonts over the network
    await page.waitForNetworkIdle();

    console.log('generating pdf...');
    const path =
      app.getAppPath() +
      '/invoices/' +
      today.format('YYYYMMDD-HHmmss') +
      '-' +
      entry.customer.name +
      '.pdf';
    phonePathMap[entry.customer.phone] = path;

    await page.pdf({
      path,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });
    await page.close();
  }
  await browser.close();

  for (const phone in phonePathMap) {
    const data = await fs.readFile(phonePathMap[phone], {
      encoding: 'base64',
    });
    const fileName = phonePathMap[phone].split('/').pop();
    if (viteMode === 'development') {
      console.warn('DEV MODE');
      console.log('pretending to send ' + fileName + ' to ' + phone);
    } else {
      // Vite mode is livedev or prod

      // WARN: this severely constrains how the phone numbers need to be stored
      const chatId = '65' + phone + '@c.us';

      try {
        await waClient.sendMessage(
          chatId,
          new waweb.MessageMedia('application/pdf', data, fileName)
        );
        if (message.length > 0) {
          await waClient.sendMessage(chatId, message);
        }
      } catch (e) {
        console.error('failed to send message', e);
      }
    }
  }
}

function dollarFormatter(num: number): string {
  return new Intl.NumberFormat('en-sg', { style: 'currency', currency: 'sgd' }).format(num);
}

async function closeWA(): Promise<void> {
  await waClient.destroy();
}

export async function closePuppets(): Promise<void> {
  await closeWA();
}
