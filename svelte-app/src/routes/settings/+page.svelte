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
    address: '',
  });

  onMount(async () => {
    $settingsData = await window.companySettingsAPI.getCompanySettings();
  });

  const writeSettingsToDisk = async (settingsName: string, updatedValue: string) => {
    const data: CompanySettings = {
      name: $settingsData.name,
      phone: $settingsData.phone,
      address: $settingsData.address,
    };
    const successMessage =
      updatedValue.length > 0
        ? `Successfully updated ${settingsName} to ${updatedValue}`
        : `Value of ${settingsName} was cleared`;
    try {
      await window.companySettingsAPI.writeCompanySettings(data);
      toastStore.trigger({
        message: successMessage,
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
    valueAttr: { type: 'text' },
    response: (newCompanyName: string | false | undefined) => {
      if (newCompanyName === false) {
        return;
      }
      if (newCompanyName) {
        $settingsData.name = newCompanyName;
      } else {
        $settingsData.name = '';
      }
      writeSettingsToDisk('Company Name', $settingsData.name);
    },
  };
  const companyPhoneModal: ModalSettings = {
    type: 'prompt',
    title: 'Edit Company Phone',
    valueAttr: { type: 'text' },
    response: (newCompanyPhone: string | false | undefined) => {
      if (newCompanyPhone === false) {
        return;
      }
      if (newCompanyPhone) {
        $settingsData.phone = newCompanyPhone;
      } else {
        $settingsData.phone = '';
      }
      writeSettingsToDisk('Company Phone', $settingsData.phone);
    },
  };
  const companyAddressModal: ModalSettings = {
    type: 'prompt',
    title: 'Edit Company Address',
    valueAttr: { type: 'text' },
    response: (newCompanyAddress: string | false | undefined) => {
      if (newCompanyAddress === false) {
        return;
      }
      if (newCompanyAddress) {
        $settingsData.address = newCompanyAddress;
      } else {
        $settingsData.address = '';
      }
      writeSettingsToDisk('Company Address', $settingsData.address);
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
          <td>{$settingsData.name || '-'}</td>
        </tr>
        <tr
          on:click={() => {
            modalStore.trigger(companyPhoneModal);
          }}
        >
          <th>Company Phone Number</th>
          <td>{$settingsData.phone || '-'}</td>
        </tr>
        <tr
          on:click={() => {
            modalStore.trigger(companyAddressModal);
          }}
        >
          <th>Company Address</th>
          <td>{$settingsData.address || '-'}</td>
        </tr>
        <tr>
          <th>Company Logo</th>
          <td>a logo here</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
