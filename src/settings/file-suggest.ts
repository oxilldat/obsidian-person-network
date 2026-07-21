import { AbstractInputSuggest, TFile, type App } from "obsidian";

/** Type-ahead over the vault's markdown files, for the "template note" path setting. */
export class MarkdownFileSuggest extends AbstractInputSuggest<TFile> {
	constructor(app: App, textInputEl: HTMLInputElement) {
		super(app, textInputEl);
	}

	protected getSuggestions(query: string): TFile[] {
		const q = query.trim().toLowerCase();
		const files = this.app.vault.getMarkdownFiles();
		const matches = q.length === 0 ? files : files.filter((file) => file.path.toLowerCase().includes(q));
		return matches.slice(0, 50);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path);
	}
}
