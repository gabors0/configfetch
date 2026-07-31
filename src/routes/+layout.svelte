<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { VERSION } from '$lib/config/version';

	let { children } = $props();

	const themes = [
		{ value: 'nightfox', label: 'Nightfox', background: '#131a24' },
		{ value: 'dawnfox', label: 'Dawnfox', background: '#ebe5df' },
		{ value: 'duskfox', label: 'Duskfox', background: '#191726' },
		{ value: 'nordfox', label: 'Nordfox', background: '#232831' },
		{ value: 'terafox', label: 'Terafox', background: '#0f1c1e' },
		{ value: 'carbonfox', label: 'Carbonfox', background: '#0c0c0c' }
	] as const;
	type ThemeName = (typeof themes)[number]['value'];

	let titleHovered = $state(false);
	let activeTheme = $state<ThemeName>('nightfox');

	function isThemeName(value: string): value is ThemeName {
		return themes.some((theme) => theme.value === value);
	}

	function applyTheme(theme: ThemeName) {
		activeTheme = theme;
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('fastfetch-theme', theme);
	}

	onMount(() => {
		const appliedTheme = document.documentElement.dataset.theme;

		if (appliedTheme && isThemeName(appliedTheme)) {
			activeTheme = appliedTheme;
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<header
	class="fixed top-2 right-2 left-2 z-10 flex h-12 items-center justify-between gap-3 border-2 border-border bg-bg py-2 px-3 text-accent"
>
	<span>
		<span
			role="group"
			aria-label="Site title"
			onmouseenter={() => (titleHovered = true)}
			onmouseleave={() => (titleHovered = false)}
			>{titleHovered ? 'fastfetch config maker' : 'configfetch'}</span
		>
		<span class="text-fg-dim">ver. {VERSION}</span>
	</span>
	<div class="flex items-center gap-3 flex-row">
		<div class="flex items-center gap-1.5" role="group" aria-label="Theme">
			{#each themes as theme (theme.value)}
				<button
					type="button"
					class="theme-picker"
					class:active-theme-picker={activeTheme === theme.value}
					style:background-color={theme.background}
					aria-label={theme.label}
					aria-pressed={activeTheme === theme.value}
					title={theme.label}
					onclick={() => applyTheme(theme.value)}
				></button>
			{/each}
		</div>
		{#if page.url.pathname === '/'}
			<a href={resolve('/about')}>About&gt;&gt;</a>
		{:else if page.url.pathname === '/about'}
			<a href={resolve('/')}>&lt;&lt;Back</a>
		{/if}
	</div>
</header>
<main class="pt-13">{@render children()}</main>

<style lang="postcss">
	@reference "/src/routes/layout.css";
	:global(body) {
		@apply bg-bg text-fg;
		font-family: 'Monaspace Argon NF', 'Geist Mono', monospace;
	}
	:global(pre) {
		font-family: inherit;
	}
	a:hover {
		@apply underline;
	}
	.theme-picker {
		@apply size-4 cursor-pointer border-2 border-fg-dim;
	}
	.theme-picker:hover,
	.theme-picker:focus-visible,
	.active-theme-picker {
		@apply border-accent outline-none;
	}
	.active-theme-picker {
		@apply ring-1 ring-accent ring-offset-1 ring-offset-bg;
	}
</style>
