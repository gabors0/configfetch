<script lang="ts">
	import PreviewLogo from '$lib/components/preview/PreviewLogo.svelte';
	import type { AppConfig } from '$lib/config/types';
	import PreviewModules from './PreviewModules.svelte';
	import { colorSpecToStyle, styleToCss } from './ansiColor';

	const defaultLogoColor = 'red';

	let { config, previewFontSize }: { config: AppConfig; previewFontSize: number } = $props();

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null;
	}

	function displaySeparator() {
		const display = config.display;
		return isRecord(display) && typeof display.separator === 'string' ? display.separator : ': ';
	}

	function displayKeyType() {
		const display = config.display;
		if (!isRecord(display) || !isRecord(display.key) || typeof display.key.type !== 'string') {
			return 'string';
		}

		return display.key.type;
	}

	function displayColor(name: string) {
		const display = config.display;
		if (!isRecord(display) || !isRecord(display.color)) return '';
		const value = display.color[name];
		return typeof value === 'string' ? value.trim() : '';
	}

	function logoColor() {
		const color = config.logo.color;
		const value = isRecord(color) ? color['1'] : '';
		return typeof value === 'string' && value.trim() ? value : defaultLogoColor;
	}

	let colors = $derived.by(() => {
		const display = config.display;
		const bright = !isRecord(display) || display.brightColor !== false;
		const emphasis = bright ? { fontWeight: 'bold' } : {};

		return {
			keys: styleToCss(colorSpecToStyle(displayColor('keys') || defaultLogoColor, emphasis)),
			title: styleToCss(colorSpecToStyle(displayColor('title') || defaultLogoColor, emphasis)),
			output: styleToCss(colorSpecToStyle(displayColor('output'))),
			separator: styleToCss(colorSpecToStyle(displayColor('separator')))
		};
	});
</script>

<div
	style:font-size="{previewFontSize}px"
	class={[
		'flex',
		config.logo.position === 'top'
			? 'flex-col'
			: config.logo.position === 'right'
				? 'flex-row-reverse'
				: 'flex-row'
	]}
>
	<PreviewLogo logo={config.logo} color={styleToCss(colorSpecToStyle(logoColor()))} />
	<PreviewModules
		modules={config.modules}
		separator={displaySeparator()}
		keyType={displayKeyType()}
		{colors}
	/>
</div>
