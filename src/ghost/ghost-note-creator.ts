import { normalizePath, stringifyYaml, TFile, type App } from "obsidian";
import type { PluginSettings } from "../data/types";

function fillTemplate(template: string, name: string): string {
	const match = template.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)([\s\S]*)$/);
	if (!match) return template.split("{{name}}").join(name);
	const yaml = match[2].replace(/{{name}}/g, (_token, offset: number, source: string) => {
		const before = source[offset - 1];
		const after = source[offset + "{{name}}".length];
		if (before === '"' && after === '"') return JSON.stringify(name).slice(1, -1);
		if (before === "'" && after === "'") return name.replace(/'/g, "''");
		return JSON.stringify(name);
	});
	return match[1] + yaml + match[3] + match[4].split("{{name}}").join(name);
}

function buildFallbackTemplate(settings: PluginSettings, name: string): string {
	return `---\n${stringifyYaml({ tags: [settings.personTag.replace(/^#/, "")], [settings.nameField]: name })}---\n`;
}

async function loadTemplate(app: App, settings: PluginSettings): Promise<string | undefined> {
	const path = settings.newNoteTemplatePath.trim();
	if (!path) return undefined;

	const file = app.vault.getAbstractFileByPath(normalizePath(path));
	if (!(file instanceof TFile)) return undefined;

	try {
		return await app.vault.read(file);
	} catch {
		return undefined;
	}
}

async function ensureFolderExists(app: App, folder: string): Promise<void> {
	const trimmed = folder.trim().replace(/\/+$/, "");
	if (!trimmed) return;
	const path = normalizePath(trimmed);
	let current = "";
	for (const part of path.split("/")) {
		current = current ? `${current}/${part}` : part;
		if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
	}
}

function safeFileName(name: string): string {
	return name.replace(/[\\/:*?"<>|]/g, "-").replace(/[. ]+$/g, "").trim() || "Untitled person";
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
		const path = await findAvailablePath(app, settings.newNoteFolder, safeFileName(name));
		const template = await loadTemplate(app, settings);
		const content = template === undefined ? buildFallbackTemplate(settings, name) : fillTemplate(template, name);
		return await app.vault.create(path, content);
	} catch {
		return undefined;
	}
}
