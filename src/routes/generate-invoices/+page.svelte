<script lang="ts">
  import type { Customer, InvoiceTableData, LineItem } from '$lib/types';
  import { onMount } from 'svelte';
  import CustomerTable from './CustomerTable.svelte';

  async function generateInvoices() {
    const toSend = customerData.filter((el) => el.selected);
    await window.pdfAPI.sendInvoices(toSend);
  }

  let customerData: Array<InvoiceTableData> = [];

  onMount(async () => {
    const data: Array<{ customer: Customer; line_items: Array<LineItem> }> =
      await window.dbAPI.getEverything();
    customerData = data.map((customer) => {
      return {
        selected: true,
        customer: customer.customer,
        line_items: customer.line_items.map((item) => {
          return {
            ...item,
            _rate: 0,
            _quantity: 0,
            amount: 0,
            details: '',
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
          <th class="w-2/6" role="columnheader">Details</th>
        </tr>
      </thead>
    </table>
  </div>
  {#each customerData as data}
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
