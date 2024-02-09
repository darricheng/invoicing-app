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

	// INTERFACES
	interface Customer {
		customer_id: number;
		customer_name: string;
		phone: string;
	}
	interface CustomerFormData {
		customer: {
			name: string;
			phone: string;
		};
		line_items: Array<{ name: string; rate: string }>;
	}

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
			'line_items' in obj &&
			(obj.line_items.length === 0 || ('name' in obj.line_items[0] && 'rate' in obj.line_items[0]))
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
				response: (res) => resolve(res)
			};
			modalStore.trigger(newCustomerModal);
		})
			.then(async (newCustomer) => {
				if (!isCustomerFormaData(newCustomer)) return;
				let [id, numItems] = (await invoke('add_customer', {
					data: {
						customer: newCustomer.customer,
						line_items: newCustomer.line_items
					}
				})) as [number, number];
			})
			.finally(() => {
				fetchTableData();
			});
	}
	function onRowClick(rowMeta: CustomEvent) {
		const customerId = rowMeta.detail[0];
		// TODO: Get data for this customer then show modal to edit the data
	}

	// LIFECYCLE
	onMount(async () => {
		fetchTableData();
	});

	// REACTIVE
	// TODO: Doesn't update when new customer is added
	$: tableSource = {
		head: ['Name', 'Phone'],
		body: tableMapperValues(tableData, ['customer_name', 'phone']),
		meta: tableMapperValues(tableData, ['customer_id', 'customer_name', 'phone'])
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
