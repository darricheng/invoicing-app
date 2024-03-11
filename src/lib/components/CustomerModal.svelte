<script lang="ts">
  // Stores
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { onMount, type SvelteComponent } from 'svelte';
  import type { Customer, CustomerFormData, LineItem } from '$lib/types';

  // Props
  /** Exposes parent props to this component. */
  export let parent: SvelteComponent;

  const modalStore = getModalStore();

  const isExistingCustomer = $modalStore[0].meta.isExistingCustomer;

  // Initial form Data
  let formData: CustomerFormData;
  $: formData = {
    customer: {
      id: null,
      name: '',
      phone: '',
    },
    line_items: [{ name: '', rate: 0, id: null }],
  };

  onMount(async () => {
    if (isExistingCustomer) {
      // FIX: change invoke command
      const [customer, lineItems] = (await invoke('get_customer', {
        id: $modalStore[0].meta.customerId,
      })) as [Customer, Array<LineItem>];
      formData.customer.name = customer.name;
      formData.customer.phone = customer.phone;
      formData.customer.id = customer.id;
      formData.line_items = lineItems;
    }
  });

  function onFormSubmit(): void {
    if ($modalStore[0].response) $modalStore[0].response(formData);
    modalStore.close();
  }

  // Base Classes for styling
  const cBase = 'card p-4 w-modal shadow-xl space-y-4';
  const cHeader = 'text-2xl font-bold';
  const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

  function handleInsertNewLineItem() {
    formData.line_items = [...formData.line_items, { name: '', rate: 0, id: null }];
  }
  function handleDeleteLineItem(i: number) {
    formData.line_items = formData.line_items.toSpliced(i, 1);
  }

  async function handleDeleteCustomer() {
    let id = formData.customer.id;
    if (id === null) {
      console.error('ERROR: Delete customer button pressed when customer id is null.');
    }
    // FIX: change invoke command
    await invoke('delete_customer', { id });
    // pass empty object to not  call edit_customer
    if ($modalStore[0].response) $modalStore[0].response({});
    modalStore.close();
  }
</script>

{#if $modalStore[0]}
  <div class="modal-example-form {cBase} max-h-[80vh] overflow-auto">
    <header class={cHeader + ' inline-block'}>{$modalStore[0].title ?? '(title missing)'}</header>
    {#if isExistingCustomer}
      <!-- style attribute used to override space-y-4 class from {cBase} in parent div -->
      <button
        class="variant-soft-error btn btn-md float-right"
        type="button"
        style="margin-top: 0;"
        on:click={handleDeleteCustomer}>Delete Customer</button
      >
    {/if}
    <!-- submit handles button click, keydown handles pressing enter in any input -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <form
      class="modal-form {cForm}"
      on:submit={onFormSubmit}
      on:keydown={(e) => {
        if (e.key === 'Enter') onFormSubmit();
      }}
    >
      <label class="label">
        <span>Customer Name</span>
        <input
          class="input"
          type="text"
          bind:value={formData.customer.name}
          placeholder="e.g. John Doe"
        />
      </label>
      <label class="label">
        <span>Phone</span>
        <input
          class="input"
          type="text"
          bind:value={formData.customer.phone}
          placeholder="e.g. 81234567"
        />
      </label>
      <hr />
      {#each formData.line_items as item, i}
        <button
          class="variant-soft-error btn btn-sm float-right"
          type="button"
          on:click={() => handleDeleteLineItem(i)}>Delete Line Item</button
        >
        <label class="label">
          <span>Line Item Name</span>
          <input class="input" type="text" bind:value={item.name} placeholder="e.g. P5 Math" />
        </label>
        <label class="label">
          <span>Rate</span>
          <input
            class="input"
            type="number"
            step="0.01"
            bind:value={item.rate}
            placeholder="e.g. 80.75"
          />
        </label>
        <hr />
      {/each}
      <div class="text-right">
        <button class="btn {parent.buttonNeutral}" type="button" on:click={handleInsertNewLineItem}
          >Add Line Item</button
        >
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
          >{parent.buttonTextCancel}</button
        >
        <button class="btn {parent.buttonPositive}" type="submit">
          {#if isExistingCustomer}
            Confirm Changes
          {:else}
            Add Customer
          {/if}
        </button>
      </div>
    </form>
  </div>
{/if}
