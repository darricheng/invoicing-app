<script lang="ts">
	import { invoke } from '@tauri-apps/api';

	async function addCustomer() {
		console.log('clicked add customer');
		const data = await invoke('list_customers');
		console.log(data);
	}
</script>

<div class="p-8">
	<div class="mb-8 grid grid-cols-2">
		<h1 class="h1">Edit Customers</h1>
		<div class="flex flex-row-reverse">
			<button type="button" class="variant-filled btn" on:click={addCustomer}>Add Customer</button>
		</div>
	</div>
	<!-- <Table bind:source={tableSimple} /> -->
</div>
