import { normalizePath, TFile, type App } from "obsidian";
import type { PluginSettings } from "../data/types";

function fillTemplate(template: string, name: string): string {
	return template.split("{{name}}").join(name);
}

function buildFallbackTemplate(settings: PluginSettings): string {
	return `---\ntags:\n  - ${settings.personTag}\n${settings.nameField}: {{name}}\n---\n`;
}

async function loadTemplate(app: App, settings: PluginSettings): Promise<string> {
	const path = settings.newNoteTemplatePath.trim();
	if (!path) return buildFallbackTemplate(settings);

	const file = app.vault.getAbstractFileByPath(normalizePath(path));
	if (!(file instanceof TFile)) return buildFallbackTemplate(settings);

	try {
		return await app.vault.read(file);
	} catch {
		return buildFallbackTemplate(settings);
	}
}

async function ensureFolderExists(app: App, folder: string): Promise<void> {
	const trimmed = folder.trim().replace(/\/+$/, "");
	if (!trimmed) return;
	const path = normalizePath(trimmed);
	if (!app.vault.getAbstractFileByPath(path)) {
		await app.vault.createFolder(path);
	}
}

async function findAvailablePath(app: App, folder: string, baseName: string): Promise<string> {
	const prefix = folder.trim().replace(/\/+$/, "");
	const folderPrefix = prefix ? `${prefix}/` : "";

	let attempt = 1;
	let candidate = normalizePath(`${folderPrefix}${baseName}.md`);
	while (app.vault.getAbstractFileByPath(candidate)) {
		attempt += 1;
		candidate = normalizePath(`${folderPrefix}${baseName} ${attempt}.md`);
	}
	return candidate;
}

/**
 * Turns a "potential contact" ghost name into a real vault note, using the
 * plugin's configured folder + frontmatter template. Mirrors how Obsidian's
 * own core graph lets you click an unresolved link to create its note.
 */
export async function createNoteForGhostName(
	app: App,
	settings: PluginSettings,
	name: string,
): Promise<TFile | undefined> {
	try {
		await ensureFolderExists(app, settings.newNoteFolder);
		const path = await findAvailablePath(app, settings.newNoteFolder, name);
		const template = await loadTemplate(app, settings);
		const content = fillTemplate(template, name);
		return await app.vault.create(path, content);
	} catch {
		return undefined;
	}
}
