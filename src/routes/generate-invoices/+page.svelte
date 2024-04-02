<script lang="ts">
  import type { Customer, InvoiceTableData, LineItem } from '$lib/types';
  import { onMount } from 'svelte';
  import CustomerTable from './CustomerTable.svelte';

  import { writable, type Writable } from 'svelte/store';
  const generateInvoicesData: Writable<Array<InvoiceTableData>> = writable([]);

  async function generateInvoices() {
    const toSend = $generateInvoicesData.filter((el) => el.selected);
    // TODO: inform user about all errors instead of failing at the first error
    for (const customer of toSend) {
      for (const { name, rate, quantity } of customer.line_items) {
        // name is not empty string or 0, rate and quantity aren't 0
        if (!name || rate === 0 || quantity === 0) {
          console.error('found invalid data for generating invoices');
          console.error(`offending customer and item: ${customer.customer.name}, ${name}`);
          return;
        }
      }
    }
    console.log(toSend);
    await window.pdfAPI.sendInvoices(toSend);
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
    <div class="flex flex-row-reverse">
      <button type="button" class="variant-filled btn" on:click={generateInvoices}
        >Generate Invoices</button
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
