<script lang="ts">
  // Stores
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { type SvelteComponent } from 'svelte';

  // Props
  /** Exposes parent props to this component. */
  export let parent: SvelteComponent;

  const modalStore = getModalStore();

  const customerNames: Array<string> = $modalStore[0].meta.customers;

  function handleConfirm(): void {
    if ($modalStore[0].response) $modalStore[0].response(true);
    modalStore.close();
  }
  function handleCancel() {
    if ($modalStore[0].response) $modalStore[0].response(false);
    modalStore.close();
  }
  // TODO: need to handle modal closing via other means
  // e.g. closing by clicking outside modal
  // currently it sends undefined to the resolved promise

  // Base Classes for styling
  const cBase = 'card p-4 w-modal shadow-xl space-y-4';
  const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
  <div class="{cBase} max-h-[80vh] overflow-auto">
    <header class="{cHeader} inline-block">Confirmation</header>
    <p>Confirm that you want to send invoices to these customers?</p>
    <!-- TODO: only the list of customer names should scroll -->
    <ul class="list-disc px-4">
      {#each customerNames as name}
        <li>
          {name}
        </li>
      {/each}
    </ul>
    <div class="text-right">
      <button class="btn {parent.buttonNeutral}" type="button" on:click={handleCancel}
        >Cancel</button
      >
      <button class="btn {parent.buttonPositive}" type="button" on:click={handleConfirm}
        >Confirm</button
      >
    </div>
  </div>
{/if}
