<script lang="ts">
	import { onMount } from 'svelte';
	import { VERSION } from '$lib/config/version';
	import type { PageData } from './$types';

	type OutputRow = {
		logo: string;
		key: string;
		value: string;
		linkLabel?: string;
		printDelay: number;
	};

	let { data }: { data: PageData } = $props();
	let selectedTheme = $state('nightfox');

	const outputRows: OutputRow[] = $derived([
		{ logo: `                  `, key: '', value: '' },
		{ logo: `         *        `, key: 'you@ff.gs0.me', value: '' },
		{ logo: `        /!\\      `, key: '', value: '-----------' },
		{
			logo: `       /!!!$$$   `,
			key: 'Name',
			value: `: configfetch v${VERSION}`
		},
		{
			logo: `      /!!!!$$    `,
			key: 'Description',
			value: ': web-based fastfetch config generator'
		},
		{ logo: `    $$$$$!$$$$   `, key: 'Framework', value: ': SvelteKit 5' },
		{ logo: `    $$!!!!!$$\\   `, key: 'Language', value: ': TypeScript', printDelay: 130 },
		{ logo: `   /$$$$$!!$$ \\  `, key: 'Styles', value: ': Tailwind CSS 4' },
		{
			logo: `  *------------*  `,
			key: 'Font',
			value: ': Monaspace Argon NF'
		},
		{
			logo: `                  `,
			key: 'Theme',
			value: `: ${selectedTheme}`
		},
		{ logo: `                  `, key: 'Deploy', value: ': Vercel', printDelay: 180 },
		{ logo: `                  `, key: 'Commit', value: `: ${data.commit}`},
		{
			logo: `                  `,
			key: 'GitHub',
			value: ': ',
			linkLabel: 'gabors0/fastfetch-cfg-gen',
			printDelay: 0
		}
	]);

	let visibleRows = $state(0);
	let printTimer: ReturnType<typeof setTimeout>;
	function printNextRow() {
		if (visibleRows >= outputRows.length) return;

		const currentRow = outputRows[visibleRows];
		visibleRows++;

		printTimer = setTimeout(printNextRow, currentRow.printDelay ?? 25);
	}

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			visibleRows = outputRows.length;
		} else {
			printTimer = setTimeout(printNextRow, 100);
		}

		const syncTheme = () => {
			selectedTheme =
				localStorage.getItem('fastfetch-theme') ??
				document.documentElement.dataset.theme ??
				'nightfox';
		};

		syncTheme();

		const observer = new MutationObserver(syncTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		const handleStorage = (event: StorageEvent) => {
			if (event.key === 'fastfetch-theme') syncTheme();
		};
		window.addEventListener('storage', handleStorage);

		return () => {
			observer.disconnect();
			window.removeEventListener('storage', handleStorage);
			clearTimeout(printTimer);
		};
	});
</script>

<div class="mx-2 mt-[1.20rem] mb-2 min-h-[calc(100dvh-4.95rem)] min-w-0 border-2 border-border p-2">
	<p><span class="text-light-green">$</span> <span class="text-light-blue">fastfetch</span></p>
	<div class="mt-2 min-w-max" aria-label="Fastfetch output">
		{#each outputRows.slice(0, visibleRows) as row (row.key || row.value || 'logo-padding')}
			<div class="grid grid-cols-[19ch_auto] leading-5">
				<pre>{#each row.logo.split(/(\$+)/) as part, index (index)}<span
							class:text-yellow={part.startsWith('$')}>{part}</span
						>{/each}</pre>

				<span class="whitespace-pre"
					><span class="text-light-magenta">{row.key}</span>{row.value}{#if row.linkLabel}<a
							href="https://github.com/gabors0/fastfetch-cfg-gen"
							class="hover:underline"
							target="_blank"
							rel="noreferrer">{row.linkLabel}</a
						>{/if}</span
				>
			</div>
		{/each}
	</div>
</div>
