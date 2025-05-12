/**
 * @file websocket.ts
 *
 * This utility provides a robust WebSocket client for use in SvelteKit applications.
 * It handles:
 *   - Initial connection setup
 *   - Automatic reconnection with a configurable delay
 *   - JSON message parsing and dispatch
 *   - Optional heartbeat functionality to keep connections alive (commented out by default)
 *
 * Usage:
 *   Import `createWebSocket` and pass lifecycle callbacks (onOpen, onMessage, etc.)
 *   to hook into connection and message events. The returned object gives access
 *   to `send`, `close`, and the current `socket` instance.
 */

/**
 * Example usage in a Svelte component:
 *
 * ```svelte
 * <script lang="ts">
 *   import { onMount, onDestroy } from "svelte";
 *   import { createWebSocket } from "$lib/utils/websocket";
 *
 *   let messages: any[] = [];
 *   let socket: ReturnType<typeof createWebSocket>;
 *
 *   onMount(() => {
 *     socket = createWebSocket({
 *       url: import.meta.env.VITE_WS_URL, // WebSocket URL from .env file
 *       onOpen: () => {
 *         console.log("WebSocket connected");
 *       },
 *       onMessage: (data) => {
 *         messages = [...messages, data];
 *       },
 *       onClose: (event) => {
 *         console.log("WebSocket closed", event);
 *       },
 *       onError: (event) => {
 *         console.error("WebSocket error", event);
 *       },
 *     });
 *   });
 *
 *   onDestroy(() => {
 *     socket?.close(); // Clean up when component unmounts
 *   });
 * </script>
 *
 * <h2>Messages</h2>
 * {#if messages.length === 0}
 *   <p>No messages yet…</p>
 * {:else}
 *   <ul>
 *     {#each messages as msg}
 *       <li><pre>{JSON.stringify(msg, null, 2)}</pre></li>
 *     {/each}
 *   </ul>
 * {/if}
 * ```
 */

type MessageHandler = (data: any) => void;

interface WebSocketOptions {
	url: string;
	heartbeatIntervalMs?: number; // Optional: time interval for sending heartbeat messages
	reconnectDelayMs?: number; // Optional: delay before attempting reconnect after disconnection
	onMessage?: MessageHandler; // Callback for incoming messages
	onOpen?: () => void; // Callback for successful connection
	onClose?: (event: CloseEvent) => void; // Callback for disconnection
	onError?: (event: Event) => void; // Callback for error events
}

export function createWebSocket(options: WebSocketOptions) {
	const {
		url,
		// heartbeatIntervalMs = 5 * 60 * 1000, // default: 5 minutes (disabled for now)
		reconnectDelayMs = 3000, // default: try to reconnect after 3 seconds
		onMessage,
		onOpen,
		onClose,
		onError
	} = options;

	let socket: WebSocket | null = null;
	// let heartbeat: ReturnType<typeof setInterval> | null = null; // used to store interval ID for heartbeat

	function connect() {
		socket = new WebSocket(url);

		socket.addEventListener('open', () => {
			onOpen?.();
			console.log('WebSocket connected - websockets.ts');
			// Optionally start heartbeat (currently disabled)
			// heartbeat = setInterval(() => {
			//   if (socket?.readyState === WebSocket.OPEN) {
			//     socket.send(JSON.stringify({ type: "ping" }));
			//   }
			// }, heartbeatIntervalMs);
		});

		socket.addEventListener('message', (event) => {
			console.log('In the message addEventListener ----------');
			console.log('WebSocket message received:', event.data);
			const str = typeof event.data === 'string' ? event.data : event.data.toString('utf8');

			let msg;
			try {
				msg = JSON.parse(str);
				onMessage?.(msg);
			} catch (e) {
				console.warn('Failed to parse WebSocket message:', e);
			}

		});

		socket.addEventListener('close', (event) => {
			console.log('WebSocket closed:', event);
			onClose?.(event);
			cleanup();
			setTimeout(connect, reconnectDelayMs); // attempt reconnection after delay
		});

		socket.addEventListener('error', (event) => {
			console.log('WebSocket error:', event);
			onError?.(event);
			socket?.close(); // trigger `close` to initiate cleanup and reconnection
		});
	}

	function send(data: any) {
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(data));
		}
	}

	function cleanup() {
		// Clean up the heartbeat interval if it was enabled
		// if (heartbeat) {
		//   clearInterval(heartbeat);
		//   heartbeat = null;
		// }
		socket?.close(); // close the current socket if it's still open
		socket = null;
	}

	connect(); // start the connection immediately

	return {
		send, // function to send a JSON-serializable message
		close: cleanup, // allow consumers to manually close the connection
		get socket() {
			// expose the current socket instance for advanced use cases
			return socket;
		}
	};
}
