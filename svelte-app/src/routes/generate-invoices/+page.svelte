<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import { beforeNavigate, goto } from '$app/navigation';
  import { getModalStore, type ModalSettings, getToastStore } from '@skeletonlabs/skeleton';

  import type { Customer, InvoiceTableData, LineItem } from '$sharedTypes/types';
  import { onMount } from 'svelte';
  import CustomerTable from './CustomerTable.svelte';

  // Hacky way to confirm if user wants to navigate as beforeNavigate is not async,
  // but it achieves the desired functionality
  // See: https://github.com/sveltejs/kit/issues/4421
  let userLeavingPage = false;
  beforeNavigate(async ({ cancel, to, from, type }) => {
    // 1. type 'leave' means user is quitting the app, so we let them quit
    // 2. userLeavingPage prevents beforeNavigate from running in an infinite loop because
    //    if user clicks confirm, goto will trigger beforeNavigate again
    // 3. The second condition stops the popup showing if user clicks on the current tab's link
    if (type === 'leave' || userLeavingPage || (to && from && to.route.id === from.route.id)) {
      return;
    }
    cancel();
    const confirmNavigatePromise: Promise<boolean> = new Promise((resolve) => {
      const confirmNavigateModal: ModalSettings = {
        type: 'confirm',
        title: 'Confirm Leaving',
        body: 'Leaving will reset any data you have modified from the default. Are you sure you want to leave?',
        response: (r: boolean) => resolve(r),
      };
      modalStore.trigger(confirmNavigateModal);
    });
    const willNavigate = await confirmNavigatePromise;
    if (willNavigate && to) {
      userLeavingPage = true;
      goto(to?.url);
    }
  });

  const generateInvoicesData: Writable<Array<InvoiceTableData>> = writable([]);
  const modalStore = getModalStore();
  const toastStore = getToastStore();

  interface GenerateInvoicesModalResponse {
    confirm: boolean;
    message?: string;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function isConfirmationModalData(obj: any): obj is GenerateInvoicesModalResponse {
    return typeof obj === 'object' && obj !== null && 'confirm' in obj;
  }
  async function generateInvoices() {
    const toSend = $generateInvoicesData.filter((el) => el.selected);

    if (toSend.length === 0) {
      toastStore.trigger({
        message: 'No selected invoices to send',
        background: 'variant-filled-error',
      });
      return;
    }

    // Check for any rate or quantity 0
    // TODO: inform user about all errors instead of failing at the first error
    for (const customer of toSend) {
      for (const { name, rate, quantity } of customer.line_items) {
        // name is not empty string or 0, rate and quantity aren't 0
        if (!name || rate === 0 || quantity === 0) {
          toastStore.trigger({
            message: 'There exists a line item with 0 rate or quantity',
            background: 'variant-filled-error',
          });
          console.error('found invalid data for generating invoices');
          console.error(`offending customer and item: ${customer.customer.name}, ${name}`);
          return;
        }
      }
    }

    new Promise((resolve) => {
      const customerNames = toSend.map((el) => {
        return el.customer.name;
      });
      const sendInvoicesConfirmationModal: ModalSettings = {
        type: 'component',
        component: 'sendInvoicesConfirmationModal',
        title: 'Confirmation',
        response: (res: GenerateInvoicesModalResponse | undefined) =>
          resolve(res as GenerateInvoicesModalResponse),
        meta: {
          customers: customerNames,
        },
      };
      modalStore.trigger(sendInvoicesConfirmationModal);
    }).then(async (response) => {
      // confirmSend is undefined if model was closed by clicking outside
      if (!response) return;

      // type guard just to satisfy TS
      if (!isConfirmationModalData(response)) return;

      if (!response.confirm) return;

      console.log(toSend);
      toastStore.trigger({ message: 'Sending invoices...' });
      try {
        await window.pdfAPI.sendInvoices({ invoiceData: toSend, message: response.message });
        toastStore.trigger({
          message: 'Successfully sent invoices!',
          background: 'variant-filled-success',
        });
      } catch (e) {
        toastStore.trigger({
          message: 'An error occurred, please check your WhatsApp separately for any issues.',
          background: 'variant-filled-error',
        });
      }
    });
  }
  function selectAll() {
    $generateInvoicesData = $generateInvoicesData.map((el) => {
      el.selected = true;
      return el;
    });
  }
  function deselectAll() {
    $generateInvoicesData = $generateInvoicesData.map((el) => {
      el.selected = false;
      return el;
    });
  }

  onMount(async () => {
    const data: Array<{ customer: Customer; line_items: Array<LineItem> }> =
      await window.dbAPI.getEverything();
    $generateInvoicesData = data.map((customer) => {
      return {
        selected: true,
        customer: customer.customer,
        line_items: customer.line_items.map((item) => {
          return {
            ...item,
            _rate: item.rate,
            _quantity: 0,
            amount: 0,
            details: item.details,
            get quantity() {
              return this._quantity;
            },
            set quantity(val) {
              this._quantity = val;
              this.amount = val * this.rate;
            },
            get rate() {
              // NOTE: ignore if an error appears for the below line suggesting to change _rate to rate
              // the lsp doesnt suggest a similar change for get quantity() above
              // changing to rate breaks the app
              return this._rate;
            },
            set rate(val) {
              this._rate = val;
              this.amount = val * this.quantity;
            },
          };
        }),
      };
    });
  });
</script>

<div class="p-8">
  <div class="mb-8 grid grid-cols-2">
    <h1 class="h1">Generate Invoices</h1>
    <div class="flex flex-row-reverse space-x-4 space-x-reverse">
      <button type="button" class="variant-filled-primary btn" on:click={generateInvoices}
        >Send Invoices</button
      >
      <button type="button" class="variant-ghost-secondary btn" on:click={selectAll}
        >Select All</button
      >
      <button type="button" class="variant-ghost-secondary btn" on:click={deselectAll}
        >Deselect All</button
      >
    </div>
  </div>
  <div class="table-container">
    <table class="table">
      <thead class="table-head">
        <tr>
          <th class="w-1/6" role="columnheader">Name</th>
          <th class="w-1/6" role="columnheader">Rate</th>
          <th class="w-1/6" role="columnheader">Quantity</th>
          <th class="w-1/6" role="columnheader">Amount</th>
          <th class="w-3/12" role="columnheader">Details</th>
          <th class="w-1/12" role="columnheader">Del</th>
        </tr>
      </thead>
    </table>
  </div>
  {#each $generateInvoicesData as data}
    <div class="mt-4">
      <CustomerTable {data} />
    </div>
  {/each}
</div>

<style>
  th {
    text-align: center;
  }
</style>
