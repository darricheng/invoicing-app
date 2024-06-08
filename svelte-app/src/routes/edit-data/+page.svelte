<script lang="ts">
  import {
    Table,
    tableMapperValues,
    type ModalSettings,
    type TableSource,
    getModalStore,
  } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  import type { CustomerFormData, Customer } from '$sharedTypes/types';

  // VARIABLES
  let tableData: Array<Customer> = [];
  const modalStore = getModalStore();
  let tableSource: TableSource;

  // FUNCTIONS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function isCustomerFormaData(obj: any): obj is CustomerFormData {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'customer' in obj &&
      'name' in obj.customer &&
      'phone' in obj.customer &&
      'id' in obj.customer &&
      'line_items' in obj &&
      (obj.line_items.length === 0 ||
        ('name' in obj.line_items[0] &&
          'rate' in obj.line_items[0] &&
          'id' in obj.line_items[0] &&
          'details' in obj.line_items[0]))
    );
  }
  async function fetchTableData() {
    tableData = await window.dbAPI.listCustomers();
  }
  async function addCustomer() {
    // Promise is used to get the response from the modal
    new Promise((resolve) => {
      const newCustomerModal: ModalSettings = {
        type: 'component',
        title: 'New Customer',
        component: 'customerModal',
        response: (res) => resolve(res),
        meta: {
          isExistingCustomer: false,
        },
      };
      modalStore.trigger(newCustomerModal);
    })
      .then(async (newCustomer) => {
        if (!isCustomerFormaData(newCustomer)) return;
        let [id, numItems] = await window.dbAPI.addCustomer({
          customer: newCustomer.customer,
          // get rid of id field before submitting
          line_items: newCustomer.line_items.map((el) => {
            return {
              name: el.name,
              rate: el.rate,
              id: null,
              customer_id: null,
              details: el.details,
            };
          }),
        });
      })
      .catch((err) => {
        console.error(err);
        // TODO: show error message to user
      })
      .finally(() => {
        fetchTableData();
      });
  }
  function onRowClick(rowMeta: CustomEvent) {
    const customerId = rowMeta.detail[0];
    new Promise((resolve) => {
      const editCustomerModal: ModalSettings = {
        type: 'component',
        title: 'Edit Customer',
        component: 'customerModal',
        response: (res) => resolve(res),
        meta: {
          isExistingCustomer: true,
          customerId,
        },
      };
      modalStore.trigger(editCustomerModal);
    })
      .then(async (updatedCustomer) => {
        if (!isCustomerFormaData(updatedCustomer)) return;
        let [customersUpdated, lineItemsUpdated] = await window.dbAPI.editCustomer({
          customer: updatedCustomer.customer,
          line_items: updatedCustomer.line_items.map((el) => {
            return {
              name: el.name,
              rate: el.rate,
              id: el.id,
              customer_id: updatedCustomer.customer.id,
              details: el.details,
            };
          }),
        });
      })
      .catch((err) => {
        console.error(err);
        // TODO: show error message to user
      })
      .finally(() => {
        fetchTableData();
      });
  }

  // LIFECYCLE
  onMount(async () => {
    fetchTableData();
  });

  // REACTIVE
  $: tableSource = {
    head: ['Name', 'Phone'],
    body: tableMapperValues(tableData, ['name', 'phone']),
    meta: tableMapperValues(tableData, ['id', 'name', 'phone']),
  };
</script>

<div class="p-8">
  <div class="mb-8 grid grid-cols-2">
    <h1 class="h1">Edit Customers</h1>
    <div class="flex flex-row-reverse">
      <button type="button" class="variant-filled btn" on:click={addCustomer}>Add Customer</button>
    </div>
  </div>
  <Table bind:source={tableSource} interactive={true} on:selected={onRowClick} />
</div>
