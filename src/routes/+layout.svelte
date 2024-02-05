<script>
	import { AppShell, AppBar, TabGroup, TabAnchor } from '@skeletonlabs/skeleton';
	import '../app.pcss';
</script>

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
