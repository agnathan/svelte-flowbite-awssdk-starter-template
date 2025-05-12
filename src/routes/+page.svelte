<!-- <script>
  import { Card, Button } from "flowbite-svelte";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
  import { PUBLIC_APP_TITLE } from "$env/static/public";
</script>

<svelte:head>
  <title>{PUBLIC_APP_TITLE}</title>
</svelte:head>

<Card class="p-4 sm:p-6 md:p-8">
  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome to {PUBLIC_APP_TITLE}</h5>
  <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Learn more about SvelteKit and Flowbite on the official website.</p>
  <Button class="w-fit" href="https://flowbite.com/">
    Read more <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
  </Button>
</Card> -->

<script lang="ts">
  import { Button } from 'flowbite-svelte';
</script>

<section class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
  <div class="max-w-3xl text-center">
    <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
      Welcome to Your SvelteKit Starter
    </h1>
    <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
      Powered by <strong>SvelteKit</strong>, styled with <strong>Tailwind CSS</strong>, and built using <strong>Flowbite UI</strong> components.
    </p>

    <div class="mt-8 flex flex-col sm:flex-row justify-center gap-4">
      <Button href="https://kit.svelte.dev/docs" color="primary" size="lg">
        📘 SvelteKit Docs
      </Button>
      <Button href="https://flowbite-svelte.com" color="blue" size="lg">
        💅 Flowbite Svelte Docs
      </Button>
      <Button href="/aws" color="light" size="lg">
        ☁️ AWS Examples Integrations
      </Button>
    </div>

    <p class="mt-6 text-sm text-gray-400">
      Get started by editing <code>src/routes/+page.svelte</code>
    </p>
  </div>
</section>

