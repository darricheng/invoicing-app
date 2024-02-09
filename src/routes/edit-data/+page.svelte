<script lang="ts">
	import { Table, tableMapperValues, type TableSource } from '@skeletonlabs/skeleton';
	import { invoke } from '@tauri-apps/api';
	import { onMount } from 'svelte';

	interface Customer {
		customer_id: number;
		customer_name: string;
		phone: string;
	}

	let tableData: Array<Customer> = [];

	onMount(async () => {
		tableData = (await invoke('list_customers')) as Array<Customer>;
	});

	async function addCustomer() {
		console.log('clicked add customer');
		let newId = await invoke('add_customer', {
			data: {
				customer: { name: 'Line Items Customer', phone: '12345678' },
				line_items: [
					{ name: 'Sec 4', rate: 200 },
					{ name: 'Sec 5', rate: 500 }
				]
			}
		});
		console.log(newId);
		// TODO: Show modal to add customer and line items
		// Can be same modal as the one used to edit data
	}
	let tableSource: TableSource;
	$: tableSource = {
		head: ['Name', 'Phone'],
		body: tableMapperValues(tableData, ['customer_name', 'phone']),
		meta: tableMapperValues(tableData, ['customer_id', 'customer_name', 'phone'])
	};

	function onRowClick(rowMeta: CustomEvent) {
		const customerId = rowMeta.detail[0];
		// TODO: Get data for this customer then show modal to edit the data
	}
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
