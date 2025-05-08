<script>
  import { Card, Button } from "flowbite-svelte";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
</script>

<Card class="p-4 sm:p-6 md:p-8">
  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome to SvelteKit and Flowbite</h5>
  <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Learn more about SvelteKit and Flowbite on the official website.</p>
  <Button class="w-fit" href="https://flowbite.com/">
    Read more <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
  </Button>
</Card>