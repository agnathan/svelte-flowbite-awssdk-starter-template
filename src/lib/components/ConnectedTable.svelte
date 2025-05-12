<script lang="ts">
	// Import UI Components
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

    let { table_data } = $props();
    
    // Get the column names from the first row if it exists
    const columns = $derived(table_data.length > 0 ? Object.keys(table_data[0]) : []);
</script>

<Table>
	<TableHead>
		{#each columns as column}
			<TableHeadCell>{column}</TableHeadCell>
		{/each}
	</TableHead>
	<TableBody>
		{#each table_data as row}
			<TableBodyRow>
				{#each columns as column}
					<TableBodyCell>{row[column]}</TableBodyCell>
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
