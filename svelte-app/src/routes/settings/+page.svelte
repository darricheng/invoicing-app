<script lang="ts">
  import { onMount } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';

  import type { CompanySettings } from '$sharedTypes/types';

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  const settingsData: Writable<CompanySettings> = writable({
    name: '',
    phone: '',
  });

  onMount(async () => {
    $settingsData = await window.companySettingsAPI.getCompanySettings();
  });

  const writeSettingsToDisk = async (settingsName: string, updatedValue: string) => {
    const data: CompanySettings = {
      name: $settingsData.name,
      phone: $settingsData.phone,
    };
    try {
      await window.companySettingsAPI.writeCompanySettings(data);
      toastStore.trigger({
        message: `Successfully updated ${settingsName} to ${updatedValue}`,
        background: 'variant-filled-success',
      });
    } catch (e) {
      toastStore.trigger({
        message: `Something went wrong while updating ${settingsName}: ${e}`,
        background: 'variant-filled-error',
      });
    }
  };

  const companyNameModal: ModalSettings = {
    type: 'prompt',
    title: 'Edit Company Name',
    valueAttr: { type: 'text', required: true },
    response: (newCompanyName: string) => {
      if (!newCompanyName) return;
      $settingsData.name = newCompanyName;
      writeSettingsToDisk('Company Name', newCompanyName);
    },
  };
  const companyPhoneModal: ModalSettings = {
    type: 'prompt',
    title: 'Edit Company Phone',
    valueAttr: { type: 'text', required: true },
    response: (newCompanyPhone: string) => {
      if (!newCompanyPhone) return;
      $settingsData.phone = newCompanyPhone;
      writeSettingsToDisk('Company Phone', newCompanyPhone);
    },
  };
</script>

<div class="p-8">
  <div class="mb-8 grid grid-cols-2">
    <h1 class="h1">Settings</h1>
  </div>
  <div class="table-container">
    <table class="table table-hover cursor-pointer">
      <tbody>
        <tr
          on:click={() => {
            modalStore.trigger(companyNameModal);
          }}
        >
          <th>Company Name</th>
          <td>{$settingsData.name}</td>
        </tr>
        <tr
          on:click={() => {
            modalStore.trigger(companyPhoneModal);
          }}
        >
          <th>Company Phone Number</th>
          <td>{$settingsData.phone}</td>
        </tr>
        <tr>
          <th>Company Logo</th>
          <td>a logo here</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
