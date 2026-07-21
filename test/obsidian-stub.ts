// Minimal runtime stand-in for the "obsidian" module under vitest. The tested
// modules use obsidian only for types (erased at build), so these exist purely
// so any incidental runtime import resolves instead of throwing.

export class Component {}
export class TFile {}
export class AbstractInputSuggest {}
export function debounce<T extends (...args: never[]) => void>(fn: T): T {
	return fn;
}
export function getAllTags(): string[] | null {
	return null;
}
