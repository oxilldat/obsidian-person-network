import { ListValue, type App, type BasesEntry, type BasesPropertyId } from "obsidian";
import { FIXED_FIELDS } from "../data/frontmatter-schema";
import { buildContactLinks } from "../data/graph-links";
import { resolvePhotoPath, resolveRole, stripWikilink } from "../data/parser";
import type { GraphSnapshot } from "../data/store";
import type { PersonNode, PluginSettings } from "../data/types";

/** Property mapping for a Bases view, resolved from the view's config with global-settings fallbacks. */
export interface BasesFieldMapping {
	nameProp: BasesPropertyId | null;
	photoProp: BasesPropertyId | null;
	relationProp: BasesPropertyId | null;
	contactsProp: BasesPropertyId | null;
}

function readString(entry: BasesEntry, prop: BasesPropertyId | null): string | undefined {
	if (!prop) return undefined;
	const value = entry.getValue(prop);
	if (!value || !value.isTruthy()) return undefined;
	const str = value.toString().trim();
	return str.length > 0 ? str : undefined;
}

function readStringList(entry: BasesEntry, prop: BasesPropertyId | null): string[] {
	if (!prop) return [];
	const value = entry.getValue(prop);
	if (!value || !value.isTruthy()) return [];

	if (value instanceof ListValue) {
		const items: string[] = [];
		for (let i = 0; i < value.length(); i++) {
			const item = value.get(i).toString().trim();
			if (item.length > 0) items.push(item);
		}
		return items;
	}

	const single = value.toString().trim();
	return single.length > 0 ? [single] : [];
}

function readBoolean(entry: BasesEntry, prop: BasesPropertyId): boolean {
	return entry.getValue(prop)?.isTruthy() ?? false;
}

/**
 * Converts one Bases query result into the same GraphSnapshot shape the
 * standalone DataStore produces — downstream rendering can't tell the
 * difference. Bases filters, not our tag scan, decide who is included.
 *
 * Ghost rule here differs from standalone mode on purpose: a contact name
 * whose note exists in the vault but is filtered out of the base is dropped
 * entirely (it isn't note-less, and its node isn't present to link to).
 */
export function adaptEntries(
	app: App,
	entries: BasesEntry[],
	mapping: BasesFieldMapping,
	settings: PluginSettings,
): GraphSnapshot {
	const isSelfProp = `note.${FIXED_FIELDS.isSelf}` as BasesPropertyId;
	const companyProp = `note.${FIXED_FIELDS.company}` as BasesPropertyId;

	const people: PersonNode[] = [];
	for (const entry of entries) {
		if (entry.file.extension !== "md") continue;

		const rawPhoto = readString(entry, mapping.photoProp);
		const rawRelation = readString(entry, mapping.relationProp);
		const relationType = rawRelation !== undefined ? stripWikilink(rawRelation) : undefined;
		const rawCompany = readString(entry, companyProp);

		people.push({
			id: entry.file.path,
			file: entry.file,
			displayName: readString(entry, mapping.nameProp) ?? entry.file.basename,
			photoPath: rawPhoto ? resolvePhotoPath(app, rawPhoto, entry.file.path) : undefined,
			relationType,
			company: rawCompany !== undefined ? stripWikilink(rawCompany) : undefined,
			positionScore: resolveRole(relationType, settings).positionScore,
			isSelf: readBoolean(entry, isSelfProp),
			ghostRefs: readStringList(entry, mapping.contactsProp)
				.map(stripWikilink)
				.filter((name) => name.length > 0),
		});
	}

	const noteExistsInVault = (name: string): boolean =>
		app.metadataCache.getFirstLinkpathDest(name, "") !== null;

	const { edges, ghosts } = buildContactLinks(people, noteExistsInVault);
	return { people, ghosts, edges };
}
