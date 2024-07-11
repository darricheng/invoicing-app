<script lang="ts">
  import { onMount } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';

  import type { CompanySettings } from '$sharedTypes/types';

  const modalStore = getModalStore();

  const settingsData: Writable<CompanySettings> = writable({
    name: '',
    phone: '',
  });

  onMount(async () => {
    $settingsData = await window.companySettingsAPI.getCompanySettings();
  });

  const writeSettingsToDisk = async () => {
    const data: CompanySettings = {
      name: $settingsData.name,
      phone: $settingsData.phone,
    };
    await window.companySettingsAPI.writeCompanySettings(data);
  };

  const companyNameModal: ModalSettings = {
    type: 'prompt',
    title: 'Edit Company Name',
    valueAttr: { type: 'text', required: true },
    response: (newCompanyName: string) => {
      if (!newCompanyName) return;
      $settingsData.name = newCompanyName;
      writeSettingsToDisk();
    },
  };
  const companyPhoneModal: ModalSettings = {
    type: 'prompt',
    title: 'Edit Company Phone',
    valueAttr: { type: 'text', required: true },
    response: (newCompanyPhone: string) => {
      if (!newCompanyPhone) return;
      $settingsData.phone = newCompanyPhone;
      writeSettingsToDisk();
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
