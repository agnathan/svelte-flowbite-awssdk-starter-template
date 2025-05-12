<!--
  File: src/routes/data-table/+page.svelte
  Description: Displays a data table of items retrieved from a DynamoDB table via server-side load.
  It establishes a WebSocket connection to receive DynamoDB Stream events in real time,
  merges incoming events into the displayed data, and cleans up the connection on unmount.
-->

<script lang="ts">
	// Import Svelte Resources
	import { onDestroy, onMount } from 'svelte'; // Svelte lifecycle hooks
	import { PUBLIC_WS_URL } from '$env/static/public'; // WebSocket endpoint from environment

	// Import Application Libraries, Types, and Functions
	import { mergeEvents } from '$lib/websockets/mergeEvents'; // Helper to merge stream events into table data
	import type { StreamEvent, Item } from '$lib/websockets/types'; // Type definitions for stream events and data items
	import type { PageData } from './$types'; // Generated types for page props
	import { createWebSocket } from '$lib/websockets/websockets'; // Factory to create a configured WebSocket

	import ConnectedTable from '../../lib/components/ConnectedTable.svelte';
  
	// Extract initial data provided by the page's load function
	let { data }: { data: PageData } = $props();
  
	// Reactive state holding the array of items to display in the table
	let table_data = $state(data.data as Item[]);
  
	// Reference to the WebSocket connection, for cleanup
	let socket: ReturnType<typeof createWebSocket>;
  
	// Initialize WebSocket connection when component mounts
	onMount(() => {
	  socket = createWebSocket({
		url: PUBLIC_WS_URL,
		onMessage: (event: StreamEvent) => {
		  // Merge each incoming DynamoDB stream event into the current table data
		  table_data = mergeEvents(table_data, [event]);
		},
		onOpen: () => console.log('🔌 WebSocket connected'), // Log on successful connection
		onClose: () => console.log('❌ WebSocket closed'),     // Log on connection close
		onError: () => console.warn('⚠️ WebSocket error')     // Warn on any connection errors
	  });
	});
  
	// Clean up the WebSocket connection when component is destroyed
	onDestroy(() => {
	  socket?.close();
	});
  </script>
  
  <!--
	Page layout:
	- Heading
	- Description paragraph
	- Data table showing project IDs and names
  -->
  <div class="container mx-auto space-y-4">
	<h2 class="text-4xl font-extrabold dark:text-white">Data Table</h2>
	<p>
	  This page demonstrates a simple table that lets an authenticated user connect to a DynamoDB
	  table. The table is dynamically updated via AWS DynamoDB Streams and WebSockets from AWS API
	  Gateway
	</p>
  
	<!-- Render the ConnectedTable component -->
	<ConnectedTable table_data={table_data} />
  </div>
  