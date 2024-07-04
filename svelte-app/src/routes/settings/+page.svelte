<script lang="ts">
  async function getSettings() {
    const settings = await window.companySettingsAPI.getCompanySettings();
    console.log(settings);
  }
</script>

<div class="p-8">
  <div class="mb-8 grid grid-cols-2">
    <h1 class="h1">Settings</h1>
    <div class="flex flex-row-reverse">
      <button type="button" class="variant-filled btn" on:click={getSettings}>Log Settings</button>
    </div>
  </div>
  <div class="table-container">
    <table class="table table-hover">
      <tbody>
        <tr>
          <th>Company Name</th>
          <td>some company name</td>
          <td>Edit Button</td>
        </tr>
        <tr>
          <th>Company Phone Number</th>
          <td>81234567</td>
          <td>Edit Button</td>
        </tr>
        <tr>
          <th>Company Logo</th>
          <td>a logo here</td>
          <td>Edit Button</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
