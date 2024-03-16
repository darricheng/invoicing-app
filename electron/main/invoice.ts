import { IpcMainInvokeEvent } from 'electron';
import { type InvoiceTableData } from '../../src/lib/types';

export function sendInvoices(_e: IpcMainInvokeEvent, data: Array<InvoiceTableData>) {
  console.log(data[0].line_items);
}
