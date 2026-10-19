export type ColorStyle = {
	color?: string;
	background?: string;
	fontWeight?: string;
	opacity?: string;
	fontStyle?: string;
	textDecoration?: string;
	visibility?: string;
};
const baseNames = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

const modifiers: Record<string, string> = {
	reset_: '0;',
	bright_: '1;',
	dim_: '2;',
	italic_: '3;',
	underline_: '4;',
	blink_: '5;',
	inverse_: '7;',
	hidden_: '8;',
	strike_: '9;'
};

function paletteColor(index: number) {
	const name = baseNames[index % 8];
	return index >= 8 ? `var(--color-light-${name})` : `var(--color-${name})`;
}

function xtermColor(index: number) {
	if (index < 16) return paletteColor(index);
	if (index < 232) {
		const value = index - 16;
		const level = (n: number) => (n === 0 ? 0 : 55 + n * 40);
		return `rgb(${level(Math.floor(value / 36))}, ${level(Math.floor(value / 6) % 6)}, ${level(value % 6)})`;
	}
	const gray = 8 + (index - 232) * 10;
	return `rgb(${gray}, ${gray}, ${gray})`;
}

function hexToCode(hex: string) {
	const digits =
		hex.length === 3
			? hex
					.split('')
					.map((c) => c + c)
					.join('')
			: hex;
	if (!/^[0-9a-f]{6}$/i.test(digits)) return '';
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
	return `38;2;${r};${g};${b}`;
}

/** Converts a fastfetch color spec (`red`, `bright_blue`, `1;31`, `#ff0000`, ...) into ANSI SGR codes. */
export function colorSpecToCodes(spec: string) {
	const input = spec.trim();
	if (input.startsWith('#')) return hexToCode(input.slice(1));

	let result = '';
	let rest = input;
	let light = false;

	while (rest.length > 0) {
		const lower = rest.toLowerCase();
		const modifier = Object.keys(modifiers).find((prefix) => lower.startsWith(prefix));
		if (modifier) {
			result += modifiers[modifier];
			rest = rest.slice(modifier.length);
			continue;
		}
		if (lower.startsWith('light_')) {
			light = true;
			rest = rest.slice('light_'.length);
			continue;
		}
		const nameIndex = baseNames.findIndex((name) => lower.startsWith(name));
		if (nameIndex !== -1) {
			result += String(30 + nameIndex + (light ? 60 : 0));
			rest = rest.slice(baseNames[nameIndex].length);
			light = false;
			continue;
		}
		if (lower.startsWith('default')) {
			result += '39';
			rest = rest.slice('default'.length);
			continue;
		}
		result += rest[0];
		rest = rest.slice(1);
	}

	return result;
}

/** Applies ANSI SGR codes to a style, mimicking how a terminal would render them. */
export function codesToStyle(codes: string, base: ColorStyle = {}): ColorStyle {
	const style: ColorStyle = { ...base };
	const parts = codes
		.split(';')
		.filter((part) => part !== '')
		.map(Number);

	for (let i = 0; i < parts.length; i++) {
		const code = parts[i];
		if (!Number.isInteger(code)) continue;

		if (code === 0) {
			for (const key of Object.keys(style)) delete style[key as keyof ColorStyle];
		} else if (code === 1) style.fontWeight = 'bold';
		else if (code === 2) style.opacity = '0.6';
		else if (code === 3) style.fontStyle = 'italic';
		else if (code === 4) style.textDecoration = 'underline';
		else if (code === 8) style.visibility = 'hidden';
		else if (code === 9) style.textDecoration = 'line-through';
		else if (code === 22) {
			delete style.fontWeight;
			delete style.opacity;
		} else if (code === 23) delete style.fontStyle;
		else if (code === 24 || code === 29) delete style.textDecoration;
		else if (code === 28) delete style.visibility;
		else if (code >= 30 && code <= 37) style.color = paletteColor(code - 30);
		else if (code === 39) delete style.color;
		else if (code >= 40 && code <= 47) style.background = paletteColor(code - 40);
		else if (code === 49) delete style.background;
		else if (code >= 90 && code <= 97) style.color = paletteColor(code - 90 + 8);
		else if (code >= 100 && code <= 107) style.background = paletteColor(code - 100 + 8);
		else if (code === 38 || code === 48) {
			const target = code === 38 ? 'color' : 'background';
			if (parts[i + 1] === 5 && parts[i + 2] !== undefined) {
				style[target] = xtermColor(Math.min(255, Math.max(0, parts[i + 2])));
				i += 2;
			} else if (parts[i + 1] === 2 && parts.length >= i + 5) {
				const [r, g, b] = parts.slice(i + 2, i + 5);
				style[target] = `rgb(${r}, ${g}, ${b})`;
				i += 4;
			}
		}
	}

	return style;
}

export function colorSpecToStyle(spec: unknown, base: ColorStyle = {}): ColorStyle {
	return typeof spec === 'string' && spec.trim() !== ''
		? codesToStyle(colorSpecToCodes(spec), base)
		: { ...base };
}

/** Serializes a style into an inline CSS string for `style=` attributes. */
export function styleToCss(style: ColorStyle) {
	return [
		style.color && `color: ${style.color}`,
		style.background && `background-color: ${style.background}`,
		style.fontWeight && `font-weight: ${style.fontWeight}`,
		style.opacity && `opacity: ${style.opacity}`,
		style.fontStyle && `font-style: ${style.fontStyle}`,
		style.textDecoration && `text-decoration: ${style.textDecoration}`,
		style.visibility && `visibility: ${style.visibility}`
	]
		.filter(Boolean)
		.join('; ');
}
