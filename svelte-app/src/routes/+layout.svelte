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
    getToastStore,
    getModalStore,
    type ModalSettings,
  } from '@skeletonlabs/skeleton';
  import QRCode from 'qrcode';
  import '../app.postcss';
  import CustomerModal from '$lib/components/CustomerModal.svelte';
  import SendInvoicesConfirmationModal from '$lib/components/SendInvoicesConfirmationModal.svelte';
  import ImageModal from '$lib/components/ImageModal.svelte';

  initializeStores();

  const modalRegistry: Record<string, ModalComponent> = {
    customerModal: {
      ref: CustomerModal,
      // Provide a template literal for the default component slot
      slot: '<p>Placeholder</p>',
    },
    sendInvoicesConfirmationModal: { ref: SendInvoicesConfirmationModal },
    imageModal: { ref: ImageModal },
  };

  const toastStore = getToastStore();
  const modalStore = getModalStore();

  window.whatsappApi.onReceiveWhatsappQr(async (qr: string) => {
    // don't trigger toast if modal is already open
    if ($modalStore[0]) return;

    const qrSvg = await QRCode.toString(qr, { type: 'svg' });
    const imageModal: ModalSettings = {
      type: 'component',
      component: 'imageModal',
      image: qrSvg,
    };

    toastStore.clear();
    toastStore.trigger({
      message: 'Login to WhatsApp',
      background: 'variant-filled-primary',
      autohide: false,
      action: {
        label: 'Show QR',
        response: () => {
          modalStore.trigger(imageModal);
          toastStore.clear();
        },
      },
    });
  });
  window.whatsappApi.onWhatsappReady(() => {
    modalStore.close();
    toastStore.trigger({
      message: 'WhatsApp is ready',
      background: 'variant-filled-primary',
    });
  });
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
          <TabAnchor href="/settings">
            <svelte:fragment>Settings</svelte:fragment>
          </TabAnchor>
        </TabGroup>
      </svelte:fragment>
      <svelte:fragment slot="trail"></svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <slot />
</AppShell>
