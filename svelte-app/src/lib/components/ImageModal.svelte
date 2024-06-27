<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  // Stores
  import { getModalStore } from '@skeletonlabs/skeleton';

  // Props
  /** Exposes parent props to this component. */
  export let parent: SvelteComponent;

  const modalStore = getModalStore();

  const cImage = 'max-w-[90%] max-h-[90%] rounded-container-token overflow-hidden shadow-xl';
</script>

{#if $modalStore[0]}
  <!-- <img src={$modalStore[0]?.image} class={cImage} alt="Example" /> -->
  <div class={cImage}>{$modalStore[0]?.image}</div>
{/if}
