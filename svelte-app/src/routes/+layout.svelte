<script lang="ts">
  import {
    AppShell,
    AppBar,
    TabGroup,
    TabAnchor,
    initializeStores,
    Modal,
    Toast,
    type ModalComponent,
  } from '@skeletonlabs/skeleton';
  import '../app.postcss';
  import CustomerModal from '$lib/components/CustomerModal.svelte';
  import SendInvoicesConfirmationModal from '$lib/components/SendInvoicesConfirmationModal.svelte';

  initializeStores();

  const modalRegistry: Record<string, ModalComponent> = {
    customerModal: {
      ref: CustomerModal,
      // Provide a template literal for the default component slot
      slot: '<p>Placeholder</p>',
    },
    sendInvoicesConfirmationModal: { ref: SendInvoicesConfirmationModal },
  };
</script>

<Modal components={modalRegistry} />
<Toast />
<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <TabGroup
          justify="justify-center"
          active="variant-filled-primary"
          hover="hover:variant-soft-primary"
          flex="flex-1 lg:flex-none"
          rounded=""
          border=""
          class="bg-surface-100-800-token w-full"
        >
          <TabAnchor href="/">
            <svelte:fragment>Home</svelte:fragment>
          </TabAnchor>
          <TabAnchor href="/generate-invoices">
            <svelte:fragment>Generate Invoices</svelte:fragment>
          </TabAnchor>
          <TabAnchor href="/edit-data">
            <svelte:fragment>Edit Data</svelte:fragment>
          </TabAnchor>
        </TabGroup>
      </svelte:fragment>
      <svelte:fragment slot="trail"></svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <slot />
</AppShell>
