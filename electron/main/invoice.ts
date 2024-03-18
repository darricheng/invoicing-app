import { IpcMainInvokeEvent, app } from 'electron';
import { type InvoiceTableData } from '../../src/lib/types';
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import waweb from 'whatsapp-web.js';
import QRCode from 'qrcode';
import Handlebars from 'handlebars';
import dayjs from 'dayjs';

let waClient: waweb.Client;

export async function sendInvoices(_e: IpcMainInvokeEvent, data: Array<InvoiceTableData>) {
  const templateSource = await fs.readFile(app.getAppPath() + '/default-invoice-template.hbs', {
    encoding: 'utf8',
  });
  const template = Handlebars.compile(templateSource);

  const today = dayjs();
  const formattedToday = today.format('DD/MM/YYYY');

  const dates = {
    today: formattedToday,
    due: today.add(14, 'day').format('DD/MM/YYYY'),
  };

  // embed logo into html because in the context of puppeteer, it doesn't know how to get this path
  // we are providing puppeteer with html, not asking it to load a page from a directory
  // where it can resolve these paths
  const logo = await fs.readFile(app.getAppPath() + '/logo.png', { encoding: 'base64' });
  const logoSrc = 'data:image/png;base64,' + logo;

  const company = {
    name: import.meta.env.MAIN_VITE_COMPANY_NAME,
    address: import.meta.env.MAIN_VITE_COMPANY_ADDRESS,
    phone: import.meta.env.MAIN_VITE_COMPANY_PHONE,
  };
  console.log(company);

  const browser = await puppeteer.launch();

  for (const entry of data) {
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
    await page.pdf({
      path:
        app.getAppPath() +
        '/invoices/' +
        today.format('YYYYMMDD-HHmmss') +
        entry.customer.name +
        '.pdf',
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

  // console.log('creating whatsapp client');
  // waClient = new waweb.Client({});
  // console.log('getting QR code');
  // waClient.on('qr', (qr) => {
  //   console.log('QR RECEIVED: ', qr);
  //   QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
  //     console.log(url);
  //   });
  //   QRCode.toFile(app.getAppPath() + '/qrcode.jpg', qr);
  // });
  // waClient.on('ready', () => {
  //   console.log('WHATSAPP CLIENT IS READY');
  // });
  // waClient.on('message_create', async (msg) => {
  //   console.log(msg);
  //   if (msg.body === '!ping') {
  //     const data = await fs.readFile(app.getAppPath() + '/pdf.html', { encoding: 'base64' });
  //     waClient.sendMessage(msg.from, new waweb.MessageMedia('application/pdf', data, 'test.pdf'));
  //   }
  // });
  // waClient.initialize();
  //
  // process.on('exit', closeWA);
  // process.on('SIGTERM', closeWA);
  // process.on('uncaughtException', closeWA);
}

function dollarFormatter(num: number): string {
  return new Intl.NumberFormat('en-sg', { style: 'currency', currency: 'sgd' }).format(num);
}

async function closeWA() {
  // await waClient.destroy();
}

export async function closePuppets() {
  await closeWA();
}
