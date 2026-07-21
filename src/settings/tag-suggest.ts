import { AbstractInputSuggest, getAllTags, type App } from "obsidian";

const CACHE_TTL_MS = 10_000;

function collectVaultTags(app: App): string[] {
	const tags = new Set<string>();
	for (const file of app.vault.getMarkdownFiles()) {
		const cache = app.metadataCache.getFileCache(file);
		const fileTags = cache ? getAllTags(cache) : null;
		if (!fileTags) continue;
		for (const tag of fileTags) tags.add(tag.replace(/^#/, ""));
	}
	return [...tags].sort();
}

/** Type-ahead over the vault's existing tags, for the "recognition tag" setting. */
export class TagSuggest extends AbstractInputSuggest<string> {
	private cachedTags: string[] | null = null;
	private cachedAt = 0;

	constructor(app: App, textInputEl: HTMLInputElement) {
		super(app, textInputEl);
	}

	/** The full-vault scan is O(files), too heavy to repeat per keystroke — cache it briefly. */
	private allTags(): string[] {
		const now = Date.now();
		if (!this.cachedTags || now - this.cachedAt > CACHE_TTL_MS) {
			this.cachedTags = collectVaultTags(this.app);
			this.cachedAt = now;
		}
		return this.cachedTags;
	}

	protected getSuggestions(query: string): string[] {
		const q = query.trim().toLowerCase().replace(/^#/, "");
		const tags = this.allTags();
		return (q.length === 0 ? tags : tags.filter((tag) => tag.toLowerCase().includes(q))).slice(0, 50);
	}

	renderSuggestion(tag: string, el: HTMLElement): void {
		el.setText(`#${tag}`);
	}
}
