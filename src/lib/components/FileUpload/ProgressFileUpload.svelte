<script lang="ts">
	import { Button, Progressbar, Fileupload } from 'flowbite-svelte';

	type Status = 'idle' | 'uploading' | 'done' | 'error';

	let file: File | null = null;
	let progress = 0;
	let status: Status = 'idle';
	let message = '';

	function handleFileChange(e: Event) {
		file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
		progress = 0;
		status = 'idle';
		message = '';
	}

	async function upload() {
		if (!file) return;

		status = 'uploading';

		try {
			const res = await fetch('/api/upload-url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type
				})
			});
			if (!res.ok) throw new Error('Couldn’t get upload URL');

			const { url } = await res.json();

			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('PUT', url);
				xhr.setRequestHeader('Content-Type', file?.type ?? '');

				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) {
						progress = Math.round((e.loaded / e.total) * 100);
					}
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(new Error(`Upload failed (${xhr.status})`));
				};
				xhr.onerror = () => reject(new Error('Network error'));
				xhr.send(file);
			});

			status = 'done';
			message = 'Upload complete!';
		} catch (err) {
			status = 'error';
			message = (err as Error).message;
		}
	}
</script>

<Fileupload onchange={handleFileChange} />

{#if file}
	<div class="space-y-2">
		<Button onclick={upload} disabled={status === 'uploading'}>
			{status === 'uploading' ? `Uploading… ${progress}%` : `Upload “${file.name}”`}
		</Button>

		<Progressbar {progress} />

		{#if status === 'done'}
			<p class="text-green-600">✅ {message}</p>
		{:else if status === 'error'}
			<p class="text-red-600">⚠️ {message}</p>
		{/if}
	</div>
{/if}
