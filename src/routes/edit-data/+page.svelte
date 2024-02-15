<script lang="ts">
	import {
		Table,
		tableMapperValues,
		type ModalSettings,
		type TableSource,
		getModalStore
	} from '@skeletonlabs/skeleton';
	import { invoke } from '@tauri-apps/api';
	import { onMount } from 'svelte';
	import type { CustomerFormData, Customer } from '$lib/types';

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
				('name' in obj.line_items[0] && 'rate' in obj.line_items[0] && 'id' in obj.line_items[0]))
		);
	}
	async function fetchTableData() {
		tableData = (await invoke('list_customers')) as Array<Customer>;
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
					isExistingCustomer: false
				}
			};
			modalStore.trigger(newCustomerModal);
		})
			.then(async (newCustomer) => {
				if (!isCustomerFormaData(newCustomer)) return;
				let [id, numItems] = (await invoke('add_customer', {
					data: {
						customer: newCustomer.customer,
						// get rid of id field before submitting
						line_items: newCustomer.line_items.map((el) => {
							return { name: el.name, rate: el.rate };
						})
					}
				})) as [number, number];
			})
			.catch((err) => {
				// TODO: show error message to user
			})
			.finally(() => {
				fetchTableData();
			});
	}
	function onRowClick(rowMeta: CustomEvent) {
		const customerId = rowMeta.detail[0];
		// TODO: Get data for this customer then show modal to edit the data
		new Promise((resolve) => {
			const editCustomerModal: ModalSettings = {
				type: 'component',
				title: 'Edit Customer',
				component: 'customerModal',
				response: (res) => resolve(res),
				meta: {
					isExistingCustomer: true,
					customerId,
					deleteLineItemHandler: async (line_item_id) => {
						// TODO: invoke tauri command to delete the line item
					}
				}
			};
			modalStore.trigger(editCustomerModal);
		})
			.then(async (updatedCustomer) => {
				// TODO: update data for the selected customer
				if (!isCustomerFormaData(updatedCustomer)) return;
				let [customersUpdated, lineItemsUpdated] = (await invoke('edit_customer', {
					data: {
						customer: updatedCustomer.customer,
						line_items: updatedCustomer.line_items
					}
				})) as [number, number];
			})
			.catch((err) => {
				console.error(err);
				// TODO: show error message to user
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
		meta: tableMapperValues(tableData, ['id', 'name', 'phone'])
	};

	// TEST STUFF
	async function testFn() {
		let res = await invoke('get_customer', { id: 1 });
		console.log(res);
	}
</script>

<div class="p-8">
	<div class="mb-8 grid grid-cols-2">
		<h1 class="h1">Edit Customers</h1>
		<div class="flex flex-row-reverse">
			<button type="button" class="variant-filled btn" on:click={addCustomer}>Add Customer</button>
			<button type="button" class="variant-filled btn" on:click={testFn}>Test Btn</button>
		</div>
	</div>
	<Table bind:source={tableSource} interactive={true} on:selected={onRowClick} />
</div>
