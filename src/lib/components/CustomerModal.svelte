<script lang="ts">
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { SvelteComponent } from 'svelte';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	// Initial form Data
	$: formData = {
		customer: {
			name: '',
			phone: ''
		},
		line_items: [{ name: '', rate: '' }]
	};

	function onFormSubmit(): void {
		console.log(formData);

		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

	function insertNewLineItem() {
		formData.line_items = [...formData.line_items, { name: '', rate: '' }];
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase} max-h-[80vh] overflow-auto">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
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
			{#each formData.line_items as item, i}
				<hr />
				<label class="label">
					<span>Line Item {i + 1}</span>
					<input class="input" type="text" bind:value={item.name} placeholder="e.g. P5 Math" />
				</label>
				<label class="label">
					<span>Rate</span>
					<input class="input" type="number" bind:value={item.rate} placeholder="e.g. 120" />
				</label>
			{/each}
			<div class="text-right">
				<!-- TODO: clicking this button closes (and submits?) the form -->
				<button class="btn {parent.buttonNeutral}" type="button" on:click={insertNewLineItem}
					>Add Line Item</button
				>
				<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
					>{parent.buttonTextCancel}</button
				>
				<button class="btn {parent.buttonPositive}" type="submit">Submit Form</button>
			</div>
		</form>
	</div>
{/if}
