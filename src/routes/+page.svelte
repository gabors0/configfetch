<script lang="ts">
	import { onMount } from 'svelte';
	import PatternHeading from '$lib/components/PatternHeading.svelte';
	import Preview from '$lib/components/preview/Preview.svelte';

	import { defaultConfig } from '$lib/config/defaultConfig';
	import {
		logoGroups,
		appearanceGroups,
		formattingGroups,
		advancedGroups,
		modules as moduleCatalog,
		withPreviewStatus
	} from '$lib/config/formSchema';
	import { getConfigValue, setConfigValue } from '$lib/config/helpers';
	import type { AppConfig, Control, Group, ModuleEntry, ModuleItem } from '$lib/config/types';

	// Page state and navigation
	let config = $state<AppConfig>(structuredClone(defaultConfig) as AppConfig);
	let showPreview = $state(true);
	let showExport = $state(true);
	let activeTab = $state<'modules' | 'logo' | 'appearance' | 'formatting' | 'advanced'>('modules');
	let resetPending = $state(false);
	let storageReady = $state(false);

	const configStorageKey = 'fastfetch-config';

	const tabs = [
		{ id: 'modules', label: 'Modules' },
		{ id: 'logo', label: 'Logo' },
		{ id: 'appearance', label: 'Appearance' },
		{ id: 'formatting', label: 'Formatting' },
		{ id: 'advanced', label: 'Advanced' }
	] as const;

	function isAppConfig(value: unknown): value is AppConfig {
		return (
			typeof value === 'object' &&
			value !== null &&
			'logo' in value &&
			typeof value.logo === 'object' &&
			value.logo !== null &&
			'modules' in value &&
			Array.isArray(value.modules)
		);
	}

	function loadStoredConfig() {
		try {
			const storedConfig = localStorage.getItem(configStorageKey);

			if (!storedConfig) return null;

			const parsedConfig: unknown = JSON.parse(storedConfig);
			return isAppConfig(parsedConfig) ? parsedConfig : null;
		} catch {
			return null;
		}
	}

	onMount(() => {
		const storedConfig = loadStoredConfig();

		if (storedConfig) config = storedConfig;
		storageReady = true;
	});

	$effect(() => {
		if (!storageReady) return;

		try {
			localStorage.setItem(configStorageKey, JSON.stringify(config));
		} catch {
			// Storage can be unavailable in restricted browser contexts.
		}
	});

	// Form control helpers
	function inputValue(event: Event) {
		return (event.currentTarget as HTMLInputElement).value;
	}

	function inputChecked(event: Event) {
		return (event.currentTarget as HTMLInputElement).checked;
	}

	function numberInputValue(event: Event) {
		const value = inputValue(event);
		return value === '' ? null : Number(value);
	}

	function valueOf(control: Control) {
		const value = getConfigValue(config, control.path, control.value);
		return value == null ? '' : String(value);
	}

	function checkedOf(control: Control) {
		return getConfigValue(config, control.path, control.value) === true;
	}

	// Module state and management
	function moduleType(module: ModuleEntry) {
		return typeof module === 'string' ? module : module.type;
	}

	function moduleIndex(type: string) {
		return config.modules.findIndex((item) =>
			typeof item === 'string' ? item === type : item.type === type
		);
	}

	let enabledModules = $derived(
		config.modules
			.map((entry) => {
				const type = moduleType(entry);
				return moduleCatalog.find((item) => item.type === type);
			})
			.filter((item) => item !== undefined)
	);

	let disabledModules = $derived(moduleCatalog.filter((item) => moduleIndex(item.type) === -1));

	function moveModule(type: string, direction: -1 | 1) {
		const currentIndex = moduleIndex(type);
		const targetIndex = currentIndex + direction;

		if (currentIndex === -1 || targetIndex < 0 || targetIndex >= config.modules.length) {
			return;
		}
		const nextModules = [...config.modules];

		[nextModules[currentIndex], nextModules[targetIndex]] = [
			nextModules[targetIndex],
			nextModules[currentIndex]
		];
		config.modules = nextModules;
	}

	function defaultModuleConfig(moduleItem: ModuleItem): ModuleEntry {
		const defaultModules = defaultConfig.modules as AppConfig['modules'] | undefined;
		const existing = defaultModules?.find((item) =>
			typeof item === 'string' ? item === moduleItem.type : item.type === moduleItem.type
		);

		return structuredClone(
			existing ?? {
				type: moduleItem.type,
				...(moduleItem.keyIcon ? { keyIcon: moduleItem.keyIcon } : {}),
				...(moduleItem.key ? { key: moduleItem.key } : {})
			}
		);
	}

	function setModuleEnabled(moduleItem: ModuleItem, enabled: boolean) {
		const index = moduleIndex(moduleItem.type);

		if (enabled && index === -1) {
			const catalogIndex = moduleCatalog.findIndex((item) => item.type === moduleItem.type);
			const insertAt = config.modules.findIndex((item) => {
				const itemCatalogIndex = moduleCatalog.findIndex(
					(catalogItem) => catalogItem.type === moduleType(item)
				);
				return itemCatalogIndex > catalogIndex;
			});
			const targetIndex = insertAt === -1 ? config.modules.length : insertAt;

			config.modules = [
				...config.modules.slice(0, targetIndex),
				defaultModuleConfig(moduleItem),
				...config.modules.slice(targetIndex)
			];
			return;
		}

		if (!enabled && index !== -1) {
			config.modules = config.modules.filter((_, moduleIndex) => moduleIndex !== index);
		}
	}

	// Module settings controls
	function moduleSharedControls(module: ModuleItem): Control[] {
		const basePath = `modules.${module.type}`;
		const controls: Control[] = [];

		if (module.type !== 'break' && module.type !== 'separator') {
			controls.push(
				{
					label: 'Title / key',
					path: `${basePath}.key`,
					type: 'text',
					value: module.key ?? ''
				},
				{
					label: 'Key icon',
					path: `${basePath}.keyIcon`,
					type: 'text',
					value: module.keyIcon ?? ''
				},
				{
					label: 'Key color',
					path: `${basePath}.keyColor`,
					type: 'text',
					value: ''
				},
				{
					label: 'Key width',
					path: `${basePath}.keyWidth`,
					type: 'number',
					value: null,
					placeholder: 'global'
				}
			);
		}

		if (module.type !== 'break' && module.type !== 'colors') {
			controls.push({
				label: 'Output color',
				path: `${basePath}.outputColor`,
				type: 'text',
				value: ''
			});
		}

		if (module.type !== 'break' && module.type !== 'separator' && module.type !== 'colors') {
			controls.push({
				label: 'Format',
				path: `${basePath}.format`,
				type: 'text',
				value: ''
			});
		}

		controls.push({
			label: 'Condition',
			path: `${basePath}.condition`,
			type: 'text',
			value: ''
		});

		return controls
			.filter(
				(control) => !module.controls.some((moduleControl) => moduleControl.path === control.path)
			)
			.map(withPreviewStatus);
	}

	function moduleControls(module: ModuleItem) {
		return [...moduleSharedControls(module), ...module.controls];
	}

	// Active section and page layout
	function activeTabLabel() {
		return tabs.find((tab) => tab.id === activeTab)?.label ?? 'Config';
	}

	function activeGroups(): Group[] {
		switch (activeTab) {
			case 'logo':
				return logoGroups;
			case 'appearance':
				return appearanceGroups;
			case 'formatting':
				return formattingGroups;
			case 'advanced':
				return advancedGroups;
			default:
				return [];
		}
	}

	function layoutRows() {
		if (showPreview && showExport) {
			return 'grid-rows-[auto_auto_auto] md:grid-rows-[3fr_2fr]';
		}

		if (showPreview) {
			return 'grid-rows-[auto_auto_auto] md:grid-rows-[minmax(0,1fr)_auto]';
		}

		if (showExport) {
			return 'grid-rows-[auto_auto_auto] md:grid-rows-[auto_minmax(0,1fr)]';
		}

		return 'grid-rows-[auto_auto_auto] md:grid-rows-[auto_auto]';
	}

	function resetConfig() {
		if (!resetPending) {
			resetPending = true;
			return;
		}

		config = structuredClone(defaultConfig) as AppConfig;
		resetPending = false;
	}

	let previewFontSize = $state(12);

	// Config export
	let exportJson = $derived(JSON.stringify(config, null, 2));

	function copyExport() {
		void navigator.clipboard.writeText(exportJson);
	}

	function downloadExport() {
		const blob = new Blob([exportJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = 'fastfetch-config.json';
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>configfetch</title>
</svelte:head>

<div
	class={[
		'm-2 grid min-h-[calc(100dvh-4.5rem)] grid-cols-1 gap-x-3 gap-y-1 *:p-2 md:h-[calc(100dvh-4.5rem)] md:grid-cols-2',
		layoutRows()
	]}
>
	<fieldset class="max-h-[60dvh] min-h-0 overflow-auto md:max-h-none">
		<legend>
			<span class="flex flex-wrap items-center gap-1 text-accent-muted">
				Preview
				<button
					type="button"
					class="legend-action"
					aria-expanded={showPreview}
					onclick={() => (showPreview = !showPreview)}
				>
					[{showPreview ? 'hide' : 'show'}]
				</button>
				<button
					type="button"
					class="legend-action"
					onclick={() => (previewFontSize += 1)}
					aria-label="Increase preview font size"
				>
					[+]
				</button>
				<button
					type="button"
					class="legend-action"
					onclick={() => (previewFontSize = Math.max(previewFontSize - 1, 1))}
					aria-label="Decrease preview font size"
				>
					[-]
				</button>
			</span>
		</legend>
		{#if showPreview}
			<Preview {config} {previewFontSize} />
		{/if}
	</fieldset>
	<fieldset class="h-[min(70dvh,40rem)] min-h-0 md:row-span-2 md:h-auto">
		<legend>
			Config
			<button type="button" class="legend-action" onclick={resetConfig}>
				[{resetPending ? 'Confirm reset' : 'Reset'}]
			</button>
		</legend>
		<div class="flex h-full min-h-0 flex-col gap-2">
			<nav
				class="flex max-w-full shrink-0 gap-1 overflow-x-auto border-b-2 border-border pb-2"
				aria-label="Config sections"
			>
				{#each tabs as tab (tab.id)}
					<button
						type="button"
						class:text-accent={activeTab === tab.id}
						class="shrink-0 cursor-pointer px-2 pb-0.5 text-sm text-fg-muted hover:text-accent"
						aria-pressed={activeTab === tab.id}
						onclick={() => (activeTab = tab.id)}
					>
						{activeTab === tab.id ? `[${tab.label}]` : tab.label}
					</button>
				{/each}
			</nav>

			<div class="min-h-0 flex-1 overflow-y-auto pr-1">
				{#if activeTab !== 'modules'}
					<section aria-label={`${activeTabLabel()} settings`}>
						{#each activeGroups() as group (group.title)}
							<div class="py-1 first:pt-0">
								<PatternHeading title={group.title} />
								<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
									{#each group.controls as control (control.path)}
										<label
											class:items-start={control.type === 'checkbox'}
											class="grid min-w-0 gap-0.5 text-sm text-fg-muted"
										>
											<span
												class:italic={control.noPreview}
												class="overflow-hidden text-ellipsis whitespace-nowrap"
												>{control.label}</span
											>
											{#if control.type === 'checkbox'}
												<input
													type="checkbox"
													checked={checkedOf(control)}
													onchange={(event) =>
														setConfigValue(config, control.path, inputChecked(event))}
												/>
											{:else if control.type === 'select'}
												<select
													value={valueOf(control)}
													onchange={(event) =>
														setConfigValue(config, control.path, inputValue(event))}
												>
													{#each control.options ?? [] as option (option)}
														{#if typeof option === 'string'}
															<option value={option}>{option}</option>
														{:else}
															<optgroup label={option.label}>
																{#each option.options as groupedOption (groupedOption)}
																	<option value={groupedOption}>{groupedOption}</option>
																{/each}
															</optgroup>
														{/if}
													{/each}
												</select>
											{:else}
												<input
													type={control.type}
													value={valueOf(control)}
													placeholder={control.placeholder ?? ''}
													oninput={(event) =>
														setConfigValue(
															config,
															control.path,
															control.type === 'number'
																? numberInputValue(event)
																: inputValue(event)
														)}
												/>
											{/if}
											<small class:col-auto={control.type === 'checkbox'}>{control.path}</small>
										</label>
									{/each}
								</div>
							</div>
						{/each}
					</section>
				{:else}
					<!-- modules tab -->
					<section class="grid gap-2 py-2 first:py-0" aria-label="Configured modules">
						{#snippet moduleDetails(moduleItem: ModuleItem)}
							{@const controls = moduleControls(moduleItem)}
							{@const index = moduleIndex(moduleItem.type)}
							{@const enabled = index !== -1}
							<details class="border-2 border-border bg-bg-soft">
								<summary
									class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-2 py-2 text-sm text-fg-muted"
								>
									<div class="flex min-w-0 items-center gap-1">
										<input
											type="checkbox"
											aria-label={`Enable ${moduleItem.type}`}
											checked={enabled}
											onclick={(event) => event.stopPropagation()}
											onchange={(event) => setModuleEnabled(moduleItem, inputChecked(event))}
										/>
										<span
											class:text-accent={enabled}
											class:text-fg-dim={!enabled}
											class="overflow-hidden cursor-pointer font-bold text-ellipsis whitespace-nowrap"
											>{moduleItem.type} <span class="module-disclosure-closed">&gt;</span><span
												class="module-disclosure-open">&lt;</span
											></span
										>
									</div>
									<button
										type="button"
										disabled={index <= 0}
										aria-label={`Move ${moduleItem.type} up`}
										class="cursor-pointer"
										onclick={(event) => {
											event.stopPropagation();
											moveModule(moduleItem.type, -1);
										}}>[↑]</button
									>
									<button
										type="button"
										disabled={index === -1 || index === config.modules.length - 1}
										aria-label={`Move ${moduleItem.type} down`}
										class="cursor-pointer"
										onclick={(event) => {
											event.stopPropagation();
											moveModule(moduleItem.type, 1);
										}}>[↓]</button
									>
								</summary>
								{#if controls.length}
									<p class="border-t-2 border-border px-2 py-1 text-xs text-fg-muted">
										<span class="text-accent-muted" aria-hidden="true">[note]</span>
										<span class="italic">Italic labels</span> mean that they won't change the preview.
									</p>
									<div class="grid grid-cols-1 gap-1.5 p-1.5 sm:grid-cols-2 xl:grid-cols-3">
										{#each controls as control (control.path)}
											<label
												class:items-start={control.type === 'checkbox'}
												class="grid min-w-0 gap-0.5 text-sm text-fg-muted"
											>
												<span
													class:italic={control.noPreview}
													class="overflow-hidden text-ellipsis whitespace-nowrap"
													>{control.label}</span
												>
												{#if control.type === 'checkbox'}
													<input
														type="checkbox"
														checked={checkedOf(control)}
														onchange={(event) =>
															setConfigValue(config, control.path, inputChecked(event))}
													/>
												{:else if control.type === 'select'}
													<select
														value={valueOf(control)}
														onchange={(event) =>
															setConfigValue(config, control.path, inputValue(event))}
													>
														{#each control.options ?? [] as option (option)}
															{#if typeof option === 'string'}
																<option value={option}>{option}</option>
															{:else}
																<optgroup label={option.label}>
																	{#each option.options as groupedOption (groupedOption)}
																		<option value={groupedOption}>{groupedOption}</option>
																	{/each}
																</optgroup>
															{/if}
														{/each}
													</select>
												{:else}
													<input
														type={control.type}
														value={valueOf(control)}
														placeholder={control.placeholder ?? ''}
														oninput={(event) =>
															setConfigValue(
																config,
																control.path,
																control.type === 'number'
																	? numberInputValue(event)
																	: inputValue(event)
															)}
													/>
												{/if}
												<small class:col-auto={control.type === 'checkbox'}>{control.path}</small>
											</label>
										{/each}
									</div>
								{/if}
							</details>
						{/snippet}

						{#each enabledModules as moduleItem (moduleItem.type)}
							{@render moduleDetails(moduleItem)}
						{/each}

						{#if disabledModules.length}
							<PatternHeading title="Disabled modules" />

							{#each disabledModules as moduleItem (moduleItem.type)}
								{@render moduleDetails(moduleItem)}
							{/each}
						{/if}
					</section>
				{/if}
			</div>
		</div>
	</fieldset>
	<fieldset class="overflow-hidden">
		<legend>
			<span class="flex flex-wrap items-center gap-1 text-accent-muted">
				Export
				<button
					type="button"
					class="legend-action"
					aria-expanded={showExport}
					onclick={() => (showExport = !showExport)}
				>
					[{showExport ? 'hide' : 'show'}]
				</button>
				<button type="button" class="legend-action" onclick={copyExport}>[copy]</button>
				<button type="button" class="legend-action" onclick={downloadExport}>[download]</button>
			</span>
		</legend>
		{#if showExport}
			<pre
				class="max-h-96 overflow-auto text-xs whitespace-pre-wrap wrap-anywhere text-fg-muted md:h-full md:max-h-none">{exportJson}</pre>
		{/if}
	</fieldset>
</div>

<style lang="postcss">
	@reference "/src/routes/layout.css";
	fieldset {
		@apply m-0 min-w-0 border-2 border-border px-2;
	}
	legend {
		@apply text-accent-muted;
	}
	input,
	select {
		@apply min-h-7 w-full min-w-0 border-2 border-border bg-bg-soft px-1.5 text-fg outline-none;
	}
	input:focus,
	select:focus {
		@apply border-accent;
	}
	input[type='checkbox'] {
		@apply my-1 h-5 min-h-5 w-[3ch] cursor-pointer appearance-none border-0 bg-transparent p-0 text-fg;
	}
	input[type='checkbox']::before {
		content: '[ ]';
	}
	input[type='checkbox']:checked {
		@apply text-accent;
	}
	input[type='checkbox']:checked::before {
		content: '[*]';
	}
	small {
		@apply block overflow-hidden text-xs text-ellipsis whitespace-nowrap text-fg-dim;
	}
	.legend-action {
		@apply cursor-pointer hover:underline;
	}
	@media (max-width: 767px), (pointer: coarse) {
		button {
			min-height: 44px;
			min-width: 44px;
		}
		input,
		select {
			min-height: 44px;
			font-size: 16px;
		}
		input[type='checkbox'] {
			width: 44px;
			flex-shrink: 0;
		}
	}
	.module-disclosure-open,
	details[open] .module-disclosure-closed {
		display: none;
	}
	details[open] .module-disclosure-open {
		display: inline;
	}
</style>
