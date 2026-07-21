/**
 * Canvas can't consume `var(--token)` directly, so we read resolved CSS
 * custom properties via getComputedStyle once and cache them — refreshed
 * only when Obsidian fires its theme-change event, never per frame.
 */
export class ThemeColorCache {
	private readonly probeEl: HTMLElement;
	private cache = new Map<string, string>();

	constructor(probeEl: HTMLElement) {
		this.probeEl = probeEl;
	}

	get(variableName: string, fallback = ""): string {
		const cached = this.cache.get(variableName);
		if (cached !== undefined) return cached || fallback;

		const value = getComputedStyle(this.probeEl).getPropertyValue(variableName).trim();
		this.cache.set(variableName, value);
		return value || fallback;
	}

	invalidate(): void {
		this.cache.clear();
	}
}
