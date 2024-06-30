<script lang="ts">
  // Stores
  import { getModalStore } from '@skeletonlabs/skeleton';

  // next line throws errors but is necessary to prevent a warning in runtime
  // eslint-disable-next-line svelte/valid-compile
  export let parent;

  const modalStore = getModalStore();

  const cImage = 'w-modal-slim rounded-container-token overflow-hidden shadow-xl';
</script>

{#if $modalStore[0]}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class={cImage}>{@html $modalStore[0]?.image}</div>
{/if}
