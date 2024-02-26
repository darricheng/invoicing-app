<script lang="ts">
	import type { InvoiceTableData } from '$lib/types';

	export let data: InvoiceTableData;
</script>

<div class="table-container">
	<table class="table">
		<thead class="table-head">
			<tr>
				<th role="columnheader">{data.customer.name}</th>
				<!-- filler col so that customer name aligns with everything else -->
				<th colspan="4"></th>
			</tr>
		</thead>
		<tbody class="table-body">
			{#each data.line_items as item, itemIndex}
				<tr aria-rowindex={itemIndex}>
					<td class="w-1/6" role="gridcell" aria-colindex="1" tabindex="-1">{item.name}</td>
					<td class="w-1/6" role="gridcell" aria-colindex="2" tabindex="-1">{item.rate}</td>
					<td class="w-1/6" role="gridcell" aria-colindex="3" tabindex="-1">
						<input
							class="input text-center"
							type="number"
							step="0.1"
							bind:value={data.line_items[itemIndex].quantity}
						/>
					</td>
					<td class="w-1/6" role="gridcell" aria-colindex="4" tabindex="-1">{item.amount}</td>
					<td class="w-2/6" role="gridcell" aria-colindex="5" tabindex="-1">
						<textarea class="textarea" bind:value={data.line_items[itemIndex].details} />
					</td>
				</tr>
			{/each}
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
