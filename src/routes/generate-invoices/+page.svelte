<script lang="ts">
	import type { Customer, InvoiceTableData, LineItem } from '$lib/types';
	import { invoke } from '@tauri-apps/api';
	import { onMount } from 'svelte';
	import CustomerTable from './CustomerTable.svelte';

	function generateInvoices() {
		console.log('clicked generate invoices');
		console.log(customerData);
	}

	let customerData: Array<InvoiceTableData> = [];

	onMount(async () => {
		const data: Array<{ customer: Customer; line_items: Array<LineItem> }> =
			await invoke('get_everything');
		customerData = data.map((customer) => {
			return {
				customer: customer.customer,
				line_items: customer.line_items.map((item) => {
					return {
						...item,
						_quantity: 0,
						amount: 0,
						details: '',
						get quantity() {
							return this._quantity;
						},
						set quantity(val) {
							this._quantity = val;
							this.amount = val * this.rate;
						}
					};
				})
			};
		});
		console.log(customerData);
	});
</script>

<div class="p-8">
	<div class="mb-8 grid grid-cols-2">
		<h1 class="h1">Budget</h1>
		<div class="flex flex-row-reverse">
			<button type="button" class="variant-filled btn" on:click={generateInvoices}
				>Generate Invoices</button
			>
		</div>
	</div>
	<!-- TODO: make the table columns all the same width -->
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
