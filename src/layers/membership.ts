import type { App } from "obsidian";
import type { GraphLayer, PersonNode } from "../data/types";

export function readLayerIdentifiers(value: unknown): string[] {
	const values = Array.isArray(value) ? value : value == null ? [] : [value];
	return values.filter((item) => item !== null && item !== undefined)
		.map((item) => String(item).trim()).filter(Boolean);
}

export function resolveLayerMembers(
	app: App,
	people: PersonNode[],
	layers: GraphLayer[],
	layerField: string,
): Record<string, string[]> {
	const result: Record<string, string[]> = {};
	for (const layer of layers) result[layer.id] = [];
	for (const person of people) {
		const frontmatter = app.metadataCache.getFileCache(person.file)?.frontmatter;
		if (!frontmatter) continue;
		const identifiers = new Set(readLayerIdentifiers(frontmatter[layerField]));
		for (const layer of layers) {
			if (layer.identifier && identifiers.has(layer.identifier)) {
				result[layer.id].push(person.id);
			}
		}
	}
	return result;
}
