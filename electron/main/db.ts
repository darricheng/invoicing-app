// function signatures should match the types in the main/types.ts file
// with the addition of the IpcMainInvokeEvent argument

import { IpcMainInvokeEvent } from 'electron';
import { Customer, FullCustomerForm, FullCustomerWithLineItems, LineItem } from './types';

export async function listCustomers(_e: IpcMainInvokeEvent): Promise<Array<Customer>> {}
export async function getCustomer(
  _e: IpcMainInvokeEvent,
  id: number
): Promise<[Customer, Array<LineItem>]> {}
export async function addCustomer(
  _e: IpcMainInvokeEvent,
  data: FullCustomerForm
): Promise<[number, number]> {}
export async function editCustomer(
  _e: IpcMainInvokeEvent,
  data: FullCustomerForm
): Promise<[number, number]> {}
export async function deleteCustomer(_e: IpcMainInvokeEvent, id: number): Promise<number> {}
export async function getEverything(
  _e: IpcMainInvokeEvent
): Promise<Array<FullCustomerWithLineItems>> {}
