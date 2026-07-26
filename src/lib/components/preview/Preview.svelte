<script lang="ts">
	import PreviewLogo from '$lib/components/preview/PreviewLogo.svelte';
	import type { AppConfig } from '$lib/config/types';
	import PreviewModules from './PreviewModules.svelte';

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
	<PreviewLogo logo={config.logo} />
	<PreviewModules
		modules={config.modules}
		separator={displaySeparator()}
		keyType={displayKeyType()}
	/>
</div>
