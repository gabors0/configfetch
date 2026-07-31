<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import figletCodes from '$lib/assets/figlet_codes.txt?raw';

	const statuses = [400, 401, 403, 404, 405, 408, 409, 410, 413, 429, 500, 501, 502, 503, 504];
	const banners = figletCodes.trimEnd().split(/\n\n/);
	const figletByStatus = new Map(statuses.map((status, index) => [status, banners[index]]));

	let figletCode = $derived(figletByStatus.get(page.status) ?? String(page.status));
	let errorMessage = $derived(page.error?.message ?? 'Unknown error');
</script>

<svelte:head><title>{page.status} {errorMessage}</title></svelte:head>

<section
	class="flex min-h-[calc(100svh-3.25rem)] flex-col items-center justify-center p-6 text-center"
>
	<h1 class="sr-only">Error {page.status}</h1>
	<pre
		class="m-0 text-left text-[clamp(0.5rem,2.25vw,1.25rem)] leading-[1.1] font-bold text-accent font-[inherit]"
		aria-hidden="true">{figletCode}</pre>
	<span class="mt-6"
		>{errorMessage} -
		<a class="mt-6 text-accent hover:underline" href={resolve('/')}>Main page &gt;&gt;</a>
	</span>
</section>
