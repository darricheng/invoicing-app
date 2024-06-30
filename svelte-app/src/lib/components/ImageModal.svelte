<script lang="ts">
  // Stores
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();

  const cImage = 'w-modal-slim rounded-container-token overflow-hidden shadow-xl';
</script>

{#if $modalStore[0]}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class={cImage}>{@html $modalStore[0]?.image}</div>
{/if}
