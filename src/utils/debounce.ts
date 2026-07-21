import { debounce as obsidianDebounce } from "obsidian";

/**
 * Thin wrapper over Obsidian's own debounce utility so reindex bursts from
 * rapid vault/metadataCache events collapse into a single pass.
 */
export function debounced<T extends (...args: never[]) => void>(fn: T, timeoutMs = 200): T {
	return obsidianDebounce(fn, timeoutMs, true) as unknown as T;
}
