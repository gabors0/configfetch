import type { ConfigValue } from '$lib/config/types';

export function parsePath(path: string): string[] {
	return path.replaceAll('[', '.').replaceAll(']', '').split('.');
}

export function isModulePath(parts: string[]) {
	return parts[0] === 'modules' && parts.length > 1;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function getNestedValue(
	source: Record<string, unknown>,
	parts: string[],
	fallback: ConfigValue = ''
) {
	let current: unknown = source;

	for (const part of parts) {
		if (!isRecord(current) || !(part in current)) {
			return fallback;
		}

		current = current[part];
	}

	return (current ?? fallback) as ConfigValue;
}

export function setNestedValue(
	target: Record<string, unknown>,
	parts: string[],
	value: ConfigValue
) {
	let current = target;

	for (const part of parts.slice(0, -1)) {
		if (!isRecord(current[part])) {
			current[part] = {};
		}

		current = current[part] as Record<string, unknown>;
	}

	const lastPart = parts.at(-1);

	if (lastPart == null) return;

	current[lastPart] = value;
}

export function getConfigValue(
	config: Record<string, unknown>,
	path: string,
	fallback: ConfigValue = ''
) {
	const parts = parsePath(path);

	if (isModulePath(parts)) {
		const [, moduleType, ...moduleParts] = parts;
		const modules = config.modules;
		if (!Array.isArray(modules)) return fallback;

		const module = modules.find((item: unknown) => isRecord(item) && item.type === moduleType);

		if (!module) return fallback;

		return getNestedValue(module, moduleParts, fallback);
	}

	return getNestedValue(config, parts, fallback);
}

export function setConfigValue(config: Record<string, unknown>, path: string, value: ConfigValue) {
	const parts = parsePath(path);

	if (isModulePath(parts)) {
		const [, moduleType, ...moduleParts] = parts;
		const modules = config.modules;
		if (!Array.isArray(modules)) return;

		const module = modules.find((item: unknown) => isRecord(item) && item.type === moduleType);

		if (!module) return;

		setNestedValue(module, moduleParts, value);
		return;
	}

	setNestedValue(config, parts, value);
}
