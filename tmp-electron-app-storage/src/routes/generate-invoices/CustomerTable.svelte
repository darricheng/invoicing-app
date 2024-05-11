<script lang="ts">
  import type { InvoiceTableData } from '$lib/types';

  export let data: InvoiceTableData;

  function handleAddCustomLineItem() {
    const newItem = {
      name: '',
      id: data.line_items.length,
      _rate: 0,
      _quantity: 0,
      amount: 0,
      details: '',
      customer_id: data.customer.id,
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
    data.line_items = [...data.line_items, newItem];
  }
  function handleDeleteLineItem(itemIndex: number) {
    data.line_items.splice(itemIndex, 1);
    data.line_items = data.line_items;
  }
</script>

<div class="table-container">
  <table class="table">
    <thead class="table-head">
      <tr>
        <th class="w-1/6" role="columnheader" aria-colindex="1">{data.customer.name}</th>
        <th class="w-1/6" role="columnheader" aria-colindex="2" tabindex="-1">
          Send?
          <input class="checkbox" type="checkbox" bind:checked={data.selected} />
        </th>
        <!-- filler col so that customer name aligns with everything else -->
        <th colspan="4"></th>
      </tr>
    </thead>
    <tbody class="table-body">
      {#each data.line_items as item, itemIndex}
        <tr aria-rowindex={itemIndex}>
          <td class="w-1/6" role="gridcell" aria-colindex="1" tabindex="-1">
            <input class="input text-center" type="text" bind:value={item.name} />
          </td>
          <td class="w-1/6" role="gridcell" aria-colindex="2" tabindex="-1">
            <input class="input text-center" type="number" step="0.1" bind:value={item.rate} />
          </td>
          <td class="w-1/6" role="gridcell" aria-colindex="3" tabindex="-1">
            <input class="input text-center" type="number" step="0.1" bind:value={item.quantity} />
          </td>
          <td class="w-1/6" role="gridcell" aria-colindex="4" tabindex="-1">{item.amount}</td>
          <td class="w-3/12" role="gridcell" aria-colindex="5" tabindex="-1">
            <textarea class="textarea" bind:value={item.details} />
          </td>
          <td class="w-1/12" role="gridcell" aria-colindex="6" tabindex="-1">
            <button
              type="button"
              class="variant-soft-error btn btn-sm"
              on:click={() => handleDeleteLineItem(itemIndex)}>Del</button
            >
          </td>
        </tr>
      {/each}
      <tr>
        <td class="w-1/6">
          <button
            class="variant-soft-tertiary btn w-full text-wrap"
            on:click={handleAddCustomLineItem}
            type="button">Add Line Item</button
          >
        </td>
        <!-- filler col so that rest of row is filled with correct color -->
        <td colspan="5" class="w-5/6"></td>
      </tr>
    </tbody>
    <tfoot class="table-foot"><tr></tr></tfoot>
  </table>
</div>

<style>
  td,
  th {
    text-align: center;
  }
</style>
