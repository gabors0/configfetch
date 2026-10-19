import type { Control, Group, ModuleItem } from '$lib/config/types';

const previewPaths = new Set([
	'logo.type',
	'logo.position',
	'logo.padding.top',
	'logo.padding.left',
	'logo.padding.right',
	'display.separator',
	'display.key.type',
	'display.brightColor',
	'display.color.keys',
	'display.color.title',
	'display.color.output',
	'display.color.separator',
	'logo.color.1',
	'modules.title.color.user',
	'modules.title.color.at',
	'modules.title.color.host',
	'modules.separator.outputColor',
	'modules.separator.string',
	'modules.separator.times',
	'modules.colors.symbol',
	'modules.colors.paddingLeft',
	'modules.colors.block.range[0]',
	'modules.colors.block.range[1]'
]);

const previewKeyModuleTypes = new Set([
	'title',
	'os',
	'host',
	'kernel',
	'uptime',
	'packages',
	'shell',
	'display',
	'de',
	'wm',
	'wmtheme',
	'theme',
	'icons',
	'font',
	'cursor',
	'terminal',
	'terminalfont',
	'cpu',
	'gpu',
	'memory',
	'swap',
	'disk',
	'localip',
	'battery',
	'poweradapter',
	'locale'
]);

function affectsPreview(path: string) {
	if (previewPaths.has(path)) return true;

	const keyPath = /^modules\.([^.]+)\.(key|keyIcon)$/.exec(path);
	return keyPath !== null && previewKeyModuleTypes.has(keyPath[1]);
}

export function withPreviewStatus(control: Control): Control {
	return affectsPreview(control.path) ? control : { ...control, noPreview: true };
}

function withGroupPreviewStatus(groups: Group[]): Group[] {
	return groups.map((group) => ({
		...group,
		controls: group.controls.map(withPreviewStatus)
	}));
}

function withModulePreviewStatus(items: ModuleItem[]): ModuleItem[] {
	return items.map((item) => ({
		...item,
		controls: item.controls.map(withPreviewStatus)
	}));
}

export const logoTypeOptions = [
	{ label: 'Built-in', options: ['auto', 'builtin', 'small'] },
	{ label: 'File', options: ['file', 'file-raw'] },
	{ label: 'Data', options: ['data', 'data-raw'] },
	{ label: 'Command', options: ['command-raw'] },
	{
		label: 'Image',
		options: ['sixel', 'kitty', 'kitty-direct', 'kitty-icat', 'iterm', 'chafa']
	},
	{ label: 'Other', options: ['raw', 'none'] }
];
export const logoPositionOptions = ['left', 'top', 'right'];
export const sizePrefixOptions = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
export const binaryPrefixOptions = ['iec', 'si', 'jedec'];
export const spaceBeforeUnitOptions = ['default', 'always', 'never'];
export const temperatureUnitOptions = ['C', 'F', 'K', 'D'];
export const percentTypeOptions = ['num', 'bar', 'hide-others', 'num-color', 'bar-monochrome'];
export const keyTypeOptions = [
	'none',
	'string',
	'icon',
	'both',
	'both-0',
	'both-1',
	'both-2',
	'both-3',
	'both-4'
];
export const trailingZeroOptions = ['default', 'always', 'never'];
export const displayCompactTypeOptions = [
	'none',
	'original',
	'scaled',
	'original-with-refresh-rate',
	'scaled-with-refresh-rate'
];
export const displayOrderOptions = ['none', 'asc', 'desc'];
export const gpuDetectionMethodOptions = ['auto', 'pci', 'vulkan', 'opencl', 'egl-ext', 'opengl'];
export const gpuHideTypeOptions = ['none', 'integrated', 'discrete', 'unknown'];
export const colorSymbolOptions = [
	'block',
	'background',
	'circle',
	'diamond',
	'triangle',
	'square',
	'star'
];
export const colorBrightnessOptions = ['default', 'light', 'normal'];

const advancedGroupDefinitions: Group[] = [
	{
		title: 'Runtime',
		controls: [
			{ label: 'Thread', path: 'general.thread', type: 'checkbox', value: true },
			{
				label: 'Processing timeout',
				path: 'general.processingTimeout',
				type: 'number',
				value: 5000
			},
			{ label: 'Detect version', path: 'general.detectVersion', type: 'checkbox', value: true },
			{ label: 'Player name', path: 'general.playerName', type: 'text', value: '' },
			{ label: 'Force DRM', path: 'general.dsForceDrm', type: 'checkbox', value: false }
		]
	},
	{
		title: 'Diagnostics and output',
		controls: [
			{ label: 'Stat', path: 'display.stat', type: 'checkbox', value: false },
			{ label: 'Pipe', path: 'display.pipe', type: 'checkbox', value: false },
			{ label: 'Show errors', path: 'display.showErrors', type: 'checkbox', value: false },
			{
				label: 'Disable linewrap',
				path: 'display.disableLinewrap',
				type: 'checkbox',
				value: true
			},
			{ label: 'Hide cursor', path: 'display.hideCursor', type: 'checkbox', value: false },
			{ label: 'No buffer', path: 'display.noBuffer', type: 'checkbox', value: false },
			{
				label: 'Constants',
				path: 'display.constants',
				type: 'text',
				value: '',
				placeholder: 'empty list'
			}
		]
	}
];

export const advancedGroups = withGroupPreviewStatus(advancedGroupDefinitions);

const logoGroupDefinitions: Group[] = [
	{
		title: 'Source',
		controls: [
			{
				label: 'Type',
				path: 'logo.type',
				type: 'select',
				value: 'auto',
				options: logoTypeOptions
			},
			{ label: 'Source', path: 'logo.source', type: 'text', value: '' },
			{ label: 'Width', path: 'logo.width', type: 'number', value: null, placeholder: 'auto' },
			{ label: 'Height', path: 'logo.height', type: 'number', value: null, placeholder: 'auto' },
			{
				label: 'Position',
				path: 'logo.position',
				type: 'select',
				value: 'left',
				options: logoPositionOptions
			}
		]
	},
	{
		title: 'Behavior',
		controls: [
			{ label: 'Print remaining', path: 'logo.printRemaining', type: 'checkbox', value: true },
			{
				label: 'Preserve aspect ratio',
				path: 'logo.preserveAspectRatio',
				type: 'checkbox',
				value: false
			},
			{ label: 'Recache', path: 'logo.recache', type: 'checkbox', value: false }
		]
	},
	{
		title: 'Padding',
		controls: [
			{ label: 'Top', path: 'logo.padding.top', type: 'number', value: 0 },
			{ label: 'Left', path: 'logo.padding.left', type: 'number', value: 0 },
			{ label: 'Right', path: 'logo.padding.right', type: 'number', value: 4 }
		]
	},
	{
		title: 'Palette',
		controls: Array.from({ length: 9 }, (_, index) => ({
			label: `Color ${index + 1}`,
			path: `logo.color.${index + 1}`,
			type: 'text' as const,
			value: ''
		}))
	},
	{
		title: 'Chafa',
		controls: [
			{ label: 'Foreground only', path: 'logo.chafa.fgOnly', type: 'checkbox', value: false },
			{
				label: 'Symbols',
				path: 'logo.chafa.symbols',
				type: 'text',
				value: 'block+border+space-wide-inverted'
			}
		]
	}
];

export const logoGroups = withGroupPreviewStatus(logoGroupDefinitions);

const appearanceGroupDefinitions: Group[] = [
	{
		title: 'Basics',
		controls: [
			{ label: 'Separator', path: 'display.separator', type: 'text', value: ': ' },
			{ label: 'Bright color', path: 'display.brightColor', type: 'checkbox', value: true }
		]
	},
	{
		title: 'Color',
		controls: [
			{ label: 'Keys', path: 'display.color.keys', type: 'text', value: '' },
			{ label: 'Title', path: 'display.color.title', type: 'text', value: '' },
			{ label: 'Output', path: 'display.color.output', type: 'text', value: '' },
			{ label: 'Separator', path: 'display.color.separator', type: 'text', value: '' }
		]
	},
	{
		title: 'Percent',
		controls: [
			{
				label: 'Type 1',
				path: 'display.percent.type[0]',
				type: 'select',
				value: 'num',
				options: percentTypeOptions
			},
			{
				label: 'Type 2',
				path: 'display.percent.type[1]',
				type: 'select',
				value: 'num-color',
				options: percentTypeOptions
			},
			{ label: 'Digits', path: 'display.percent.ndigits', type: 'number', value: 0 },
			{ label: 'Green color', path: 'display.percent.color.green', type: 'text', value: '32' },
			{ label: 'Yellow color', path: 'display.percent.color.yellow', type: 'text', value: '93' },
			{ label: 'Red color', path: 'display.percent.color.red', type: 'text', value: '91' },
			{
				label: 'Space before unit',
				path: 'display.percent.spaceBeforeUnit',
				type: 'select',
				value: 'default',
				options: spaceBeforeUnitOptions
			},
			{ label: 'Width', path: 'display.percent.width', type: 'number', value: 0 }
		]
	},
	{
		title: 'Bar',
		controls: [
			{ label: 'Elapsed char', path: 'display.bar.char.elapsed', type: 'text', value: '■' },
			{ label: 'Total char', path: 'display.bar.char.total', type: 'text', value: '-' },
			{ label: 'Left border', path: 'display.bar.border.left', type: 'text', value: '[ ' },
			{ label: 'Right border', path: 'display.bar.border.right', type: 'text', value: ' ]' },
			{ label: 'Left elapsed', path: 'display.bar.border.leftElapsed', type: 'text', value: '' },
			{
				label: 'Right elapsed',
				path: 'display.bar.border.rightElapsed',
				type: 'text',
				value: ''
			},
			{ label: 'Elapsed color', path: 'display.bar.color.elapsed', type: 'text', value: 'auto' },
			{ label: 'Total color', path: 'display.bar.color.total', type: 'text', value: '97' },
			{ label: 'Border color', path: 'display.bar.color.border', type: 'text', value: '97' },
			{ label: 'Width', path: 'display.bar.width', type: 'number', value: 10 }
		]
	},
	{
		title: 'Keys',
		controls: [
			{ label: 'Key width', path: 'display.key.width', type: 'number', value: 0 },
			{
				label: 'Key type',
				path: 'display.key.type',
				type: 'select',
				value: 'string',
				options: keyTypeOptions
			},
			{ label: 'Key left padding', path: 'display.key.paddingLeft', type: 'number', value: 0 }
		]
	}
];

export const appearanceGroups = withGroupPreviewStatus(appearanceGroupDefinitions);

const formattingGroupDefinitions: Group[] = [
	{
		title: 'Duration',
		controls: [
			{
				label: 'Abbreviation',
				path: 'display.duration.abbreviation',
				type: 'checkbox',
				value: false
			},
			{
				label: 'Space before unit',
				path: 'display.duration.spaceBeforeUnit',
				type: 'select',
				value: 'default',
				options: spaceBeforeUnitOptions
			}
		]
	},
	{
		title: 'Size',
		controls: [
			{
				label: 'Max prefix',
				path: 'display.size.maxPrefix',
				type: 'select',
				value: 'YB',
				options: sizePrefixOptions
			},
			{
				label: 'Binary prefix',
				path: 'display.size.binaryPrefix',
				type: 'select',
				value: 'iec',
				options: binaryPrefixOptions
			},
			{ label: 'Digits', path: 'display.size.ndigits', type: 'number', value: 2 },
			{
				label: 'Space before unit',
				path: 'display.size.spaceBeforeUnit',
				type: 'select',
				value: 'default',
				options: spaceBeforeUnitOptions
			}
		]
	},
	{
		title: 'Temperature',
		controls: [
			{
				label: 'Unit',
				path: 'display.temp.unit',
				type: 'select',
				value: 'D',
				options: temperatureUnitOptions
			},
			{ label: 'Digits', path: 'display.temp.ndigits', type: 'number', value: 1 },
			{ label: 'Green color', path: 'display.temp.color.green', type: 'text', value: '32' },
			{ label: 'Yellow color', path: 'display.temp.color.yellow', type: 'text', value: '93' },
			{ label: 'Red color', path: 'display.temp.color.red', type: 'text', value: '91' },
			{
				label: 'Space before unit',
				path: 'display.temp.spaceBeforeUnit',
				type: 'select',
				value: 'default',
				options: spaceBeforeUnitOptions
			}
		]
	},
	{
		title: 'Frequency and fraction',
		controls: [
			{ label: 'Frequency digits', path: 'display.freq.ndigits', type: 'number', value: 2 },
			{
				label: 'Frequency spacing',
				path: 'display.freq.spaceBeforeUnit',
				type: 'select',
				value: 'default',
				options: spaceBeforeUnitOptions
			},
			{ label: 'Fraction digits', path: 'display.fraction.ndigits', type: 'number', value: 2 },
			{
				label: 'Trailing zeros',
				path: 'display.fraction.trailingZeros',
				type: 'select',
				value: 'default',
				options: trailingZeroOptions
			}
		]
	}
];

export const formattingGroups = withGroupPreviewStatus(formattingGroupDefinitions);

const moduleDefinitions: ModuleItem[] = [
	{
		type: 'title',
		keyIcon: '',
		key: ' ',
		controls: [
			{ label: 'FQDN', path: 'modules.title.fqdn', type: 'checkbox', value: false },
			{ label: 'User color', path: 'modules.title.color.user', type: 'text', value: '' },
			{ label: 'At color', path: 'modules.title.color.at', type: 'text', value: '' },
			{ label: 'Host color', path: 'modules.title.color.host', type: 'text', value: '' }
		]
	},
	{
		type: 'separator',
		controls: [
			{ label: 'String', path: 'modules.separator.string', type: 'text', value: '-' },
			{ label: 'Output color', path: 'modules.separator.outputColor', type: 'text', value: '' },
			{ label: 'Times', path: 'modules.separator.times', type: 'number', value: 0 }
		]
	},
	{ type: 'os', keyIcon: '', controls: [] },
	{ type: 'host', keyIcon: '󰌢', controls: [] },
	{ type: 'kernel', keyIcon: '', controls: [] },
	{ type: 'uptime', keyIcon: '', controls: [] },
	{
		type: 'packages',
		keyIcon: '󰏖',
		controls: [
			{ label: 'Disabled', path: 'modules.packages.disabled', type: 'text', value: 'winget' },
			{ label: 'Combined', path: 'modules.packages.combined', type: 'checkbox', value: false }
		]
	},
	{ type: 'shell', keyIcon: '', controls: [] },
	{
		type: 'display',
		keyIcon: '󰍹',
		controls: [
			{
				label: 'Compact type',
				path: 'modules.display.compactType',
				type: 'select',
				value: 'none',
				options: displayCompactTypeOptions
			},
			{
				label: 'Precise refresh rate',
				path: 'modules.display.preciseRefreshRate',
				type: 'checkbox',
				value: false
			},
			{
				label: 'Order',
				path: 'modules.display.order',
				type: 'select',
				value: 'none',
				options: displayOrderOptions
			}
		]
	},
	{ type: 'de', keyIcon: '', controls: [] },
	{
		type: 'wm',
		keyIcon: '',
		controls: [
			{ label: 'Detect plugin', path: 'modules.wm.detectPlugin', type: 'checkbox', value: true }
		]
	},
	{ type: 'wmtheme', keyIcon: '󰓸', controls: [] },
	{ type: 'theme', keyIcon: '󰉼', controls: [] },
	{ type: 'icons', keyIcon: '', controls: [] },
	{ type: 'font', keyIcon: '', controls: [] },
	{ type: 'cursor', keyIcon: '󰆿', controls: [] },
	{ type: 'terminal', keyIcon: '', controls: [] },
	{ type: 'terminalfont', keyIcon: '', controls: [] },
	{
		type: 'cpu',
		keyIcon: '',
		controls: [
			{ label: 'Temperature', path: 'modules.cpu.temp', type: 'checkbox', value: false },
			{
				label: 'PE core count',
				path: 'modules.cpu.showPeCoreCount',
				type: 'checkbox',
				value: false
			},
			{ label: 'Temp sensor', path: 'modules.cpu.tempSensor', type: 'text', value: '' }
		]
	},
	{
		type: 'gpu',
		keyIcon: '󰾲',
		controls: [
			{
				label: 'Driver specific',
				path: 'modules.gpu.driverSpecific',
				type: 'checkbox',
				value: false
			},
			{
				label: 'Detection method',
				path: 'modules.gpu.detectionMethod',
				type: 'select',
				value: 'pci',
				options: gpuDetectionMethodOptions
			},
			{ label: 'Temperature', path: 'modules.gpu.temp', type: 'checkbox', value: false },
			{
				label: 'Hide type',
				path: 'modules.gpu.hideType',
				type: 'select',
				value: 'none',
				options: gpuHideTypeOptions
			},
			{ label: 'Percent green', path: 'modules.gpu.percent.green', type: 'number', value: 50 },
			{ label: 'Percent yellow', path: 'modules.gpu.percent.yellow', type: 'number', value: 80 },
			{ label: 'Percent type', path: 'modules.gpu.percent.type', type: 'number', value: 0 }
		]
	},
	{
		type: 'memory',
		keyIcon: '',
		controls: [
			{ label: 'Percent green', path: 'modules.memory.percent.green', type: 'number', value: 50 },
			{
				label: 'Percent yellow',
				path: 'modules.memory.percent.yellow',
				type: 'number',
				value: 80
			},
			{ label: 'Percent type', path: 'modules.memory.percent.type', type: 'number', value: 0 }
		]
	},
	{
		type: 'swap',
		keyIcon: '󰓡',
		controls: [
			{ label: 'Separate', path: 'modules.swap.separate', type: 'checkbox', value: false },
			{ label: 'Percent green', path: 'modules.swap.percent.green', type: 'number', value: 50 },
			{ label: 'Percent yellow', path: 'modules.swap.percent.yellow', type: 'number', value: 80 },
			{ label: 'Percent type', path: 'modules.swap.percent.type', type: 'number', value: 0 }
		]
	},
	{
		type: 'disk',
		keyIcon: '',
		controls: [
			{ label: 'Show regular', path: 'modules.disk.showRegular', type: 'checkbox', value: true },
			{
				label: 'Show external',
				path: 'modules.disk.showExternal',
				type: 'checkbox',
				value: true
			},
			{ label: 'Show hidden', path: 'modules.disk.showHidden', type: 'checkbox', value: false },
			{
				label: 'Show subvolumes',
				path: 'modules.disk.showSubvolumes',
				type: 'checkbox',
				value: false
			},
			{
				label: 'Show read only',
				path: 'modules.disk.showReadOnly',
				type: 'checkbox',
				value: true
			},
			{ label: 'Show unknown', path: 'modules.disk.showUnknown', type: 'checkbox', value: false },
			{ label: 'Folders', path: 'modules.disk.folders', type: 'text', value: '' },
			{
				label: 'Hide folders',
				path: 'modules.disk.hideFolders',
				type: 'text',
				value: '/efi:/boot:/boot/*'
			},
			{ label: 'Hide FS', path: 'modules.disk.hideFS', type: 'text', value: '' },
			{
				label: 'Use available',
				path: 'modules.disk.useAvailable',
				type: 'checkbox',
				value: false
			},
			{ label: 'Percent green', path: 'modules.disk.percent.green', type: 'number', value: 50 },
			{ label: 'Percent yellow', path: 'modules.disk.percent.yellow', type: 'number', value: 80 },
			{ label: 'Percent type', path: 'modules.disk.percent.type', type: 'number', value: 0 }
		]
	},
	{
		type: 'localip',
		keyIcon: '󰩟',
		controls: [
			{ label: 'Show IPv4', path: 'modules.localip.showIpv4', type: 'checkbox', value: true },
			{ label: 'Show IPv6', path: 'modules.localip.showIpv6', type: 'checkbox', value: false },
			{ label: 'Show MAC', path: 'modules.localip.showMac', type: 'checkbox', value: false },
			{
				label: 'Show loopback',
				path: 'modules.localip.showLoop',
				type: 'checkbox',
				value: false
			},
			{
				label: 'Show prefix length',
				path: 'modules.localip.showPrefixLen',
				type: 'checkbox',
				value: true
			},
			{ label: 'Show MTU', path: 'modules.localip.showMtu', type: 'checkbox', value: false },
			{ label: 'Show speed', path: 'modules.localip.showSpeed', type: 'checkbox', value: false },
			{ label: 'Show flags', path: 'modules.localip.showFlags', type: 'checkbox', value: false },
			{ label: 'Compact', path: 'modules.localip.compact', type: 'checkbox', value: false },
			{
				label: 'Default route only',
				path: 'modules.localip.defaultRouteOnly',
				type: 'checkbox',
				value: true
			},
			{
				label: 'Show all IPs',
				path: 'modules.localip.showAllIps',
				type: 'checkbox',
				value: false
			},
			{ label: 'Name prefix', path: 'modules.localip.namePrefix', type: 'text', value: '' }
		]
	},
	{
		type: 'battery',
		keyIcon: '',
		controls: [
			{ label: 'Temperature', path: 'modules.battery.temp', type: 'checkbox', value: false },
			{
				label: 'Percent green',
				path: 'modules.battery.percent.green',
				type: 'number',
				value: 50
			},
			{
				label: 'Percent yellow',
				path: 'modules.battery.percent.yellow',
				type: 'number',
				value: 20
			},
			{ label: 'Percent type', path: 'modules.battery.percent.type', type: 'number', value: 0 }
		]
	},
	{ type: 'poweradapter', keyIcon: '󰚥', controls: [] },
	{ type: 'locale', keyIcon: '', controls: [] },
	{ type: 'break', controls: [] },
	{
		type: 'colors',
		keyIcon: '',
		key: ' ',
		controls: [
			{
				label: 'Symbol',
				path: 'modules.colors.symbol',
				type: 'select',
				value: 'block',
				options: colorSymbolOptions
			},
			{ label: 'Left padding', path: 'modules.colors.paddingLeft', type: 'number', value: 0 },
			{ label: 'Block width', path: 'modules.colors.block.width', type: 'number', value: 3 },
			{ label: 'Range start', path: 'modules.colors.block.range[0]', type: 'number', value: 0 },
			{ label: 'Range end', path: 'modules.colors.block.range[1]', type: 'number', value: 15 },
			{
				label: 'Brightness',
				path: 'modules.colors.brightness',
				type: 'select',
				value: 'default',
				options: colorBrightnessOptions
			}
		]
	}
];

export const modules = withModulePreviewStatus(moduleDefinitions);
