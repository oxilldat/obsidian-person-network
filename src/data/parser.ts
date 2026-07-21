import { getAllTags, type App, type CachedMetadata, type TFile } from "obsidian";
import { FIXED_FIELDS } from "./frontmatter-schema";
import type { PersonNode, PersonRole, PluginSettings } from "./types";

type Frontmatter = Record<string, unknown>;

export function isExcluded(filePath: string, excludePaths: string): boolean {
	const path = filePath.toLowerCase();
	const list = excludePaths
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter((entry) => entry.length > 0);
	return list.some((entry) => path === entry || path.startsWith(`${entry}/`));
}

function normalizeTag(tag: string): string {
	return tag.trim().replace(/^#/, "").toLowerCase();
}

/** Whether a note is tagged with the configured person tag (frontmatter `tags:` or an inline `#tag`). */
export function matchesPersonTag(cache: CachedMetadata | null, personTag: string): boolean {
	const normalized = normalizeTag(personTag);
	if (!normalized || !cache) return false;

	const tags = getAllTags(cache);
	if (!tags) return false;
	return tags.some((tag) => normalizeTag(tag) === normalized);
}

/** Strips optional `[[Target|Alias]]` wrapping down to the plain link target. */
export function stripWikilink(raw: string): string {
	const trimmed = raw.trim();
	if (trimmed.startsWith("[[") && trimmed.endsWith("]]")) {
		const inner = trimmed.slice(2, -2);
		const pipeIndex = inner.indexOf("|");
		return pipeIndex >= 0 ? inner.slice(0, pipeIndex) : inner;
	}
	return trimmed;
}

function toStringList(raw: unknown): string[] {
	if (Array.isArray(raw)) return raw.map((entry) => String(entry));
	if (typeof raw === "string" && raw.trim().length > 0) return [raw];
	return [];
}

export function resolvePhotoPath(app: App, rawPath: string, sourcePath: string): string | undefined {
	const cleaned = stripWikilink(rawPath);
	if (!cleaned) return undefined;

	const direct = app.vault.getAbstractFileByPath(cleaned);
	if (direct) return direct.path;

	const resolved = app.metadataCache.getFirstLinkpathDest(cleaned, sourcePath);
	return resolved ? resolved.path : cleaned;
}

/** A role supplies both the ring style and the position score — looked up by relation type value. */
export function resolveRole(relationType: string | undefined, settings: PluginSettings): PersonRole {
	if (relationType && settings.roles[relationType]) return settings.roles[relationType];
	return settings.defaultRole;
}

export function parsePerson(
	app: App,
	file: TFile,
	cache: CachedMetadata | null,
	settings: PluginSettings,
): PersonNode | null {
	if (!matchesPersonTag(cache, settings.personTag)) return null;

	const fm: Frontmatter = cache?.frontmatter ?? {};

	const rawName = fm[settings.nameField];
	const displayName = rawName !== undefined ? String(rawName) : file.basename;

	const rawPhoto = fm[settings.photoField];
	const photoPath = rawPhoto ? resolvePhotoPath(app, String(rawPhoto), file.path) : undefined;

	const rawRelation = fm[settings.relationField];
	const relationType = rawRelation !== undefined ? stripWikilink(String(rawRelation)) : undefined;

	const rawCompany = fm[FIXED_FIELDS.company];
	const company = rawCompany !== undefined ? stripWikilink(String(rawCompany)) : undefined;

	const isSelfRaw = fm[FIXED_FIELDS.isSelf];
	const isSelf = isSelfRaw === true || isSelfRaw === "true";

	const ghostRefs = toStringList(fm[settings.potentialContactsField]).map((entry) =>
		stripWikilink(entry),
	).filter((entry) => entry.length > 0);

	return {
		id: file.path,
		file,
		displayName,
		photoPath,
		relationType,
		company,
		positionScore: resolveRole(relationType, settings).positionScore,
		isSelf,
		ghostRefs,
	};
}
