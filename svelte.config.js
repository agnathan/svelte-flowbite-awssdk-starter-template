import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapterNode from '@sveltejs/adapter-node';
import adapterAmplify from 'amplify-adapter';
import adapterVercel from '@sveltejs/adapter-vercel';

// load .env locally (optional)
import 'dotenv/config';

const isVercel = Boolean(process.env.VERCEL);
const isAmplify = Boolean(process.env.AWS_APP_ID || process.env.AWS_BRANCH);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: isVercel
			? adapterVercel()
			: isAmplify
				? adapterAmplify({
						// any Amplify‐specific options here
					})
				: adapterNode({
						// fallback for local dev or other hosts
						out: 'build',
						precompress: false
					})
	}
};

export default config;
