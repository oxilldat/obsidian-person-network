import type { GraphLayer, PersistedGraphState, PersonRole, PluginSettings, PropertyFilterOperator, PropertyFilterRule } from "../data/types";
import { DEFAULT_SETTINGS } from "./defaults";

function record(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? value as Record<string, unknown> : {};
}

function number(value: unknown, fallback: number, min: number, max: number): number {
	return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function boolean(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function color(value: unknown, fallback: string): string {
	return typeof value === "string" && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value) ? value : fallback;
}

function role(value: unknown, fallback: PersonRole): PersonRole {
	const source = record(value);
	return {
		color: color(source.color, fallback.color),
		ringStyle: source.ringStyle === "solid" || source.ringStyle === "dashed" || source.ringStyle === "dotted"
			? source.ringStyle : fallback.ringStyle,
		positionScore: number(source.positionScore, fallback.positionScore, 1, 10),
	};
}

function stringList(value: unknown): string[] | null {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : null;
}

const FILTER_OPERATORS = new Set<string>(["equals", "notEquals", "contains", "notContains", "greater", "less", "exists", "notExists"]);

function isFilterOperator(value: unknown): value is PropertyFilterOperator {
	return typeof value === "string" && FILTER_OPERATORS.has(value);
}

function propertyFilters(value: unknown): PropertyFilterRule[] {
	if (!Array.isArray(value)) return [];
	const result: PropertyFilterRule[] = [];
	for (let index = 0; index < value.length; index++) {
		const raw: unknown = value[index];
		const item = record(raw);
		if (typeof item.property !== "string" || !isFilterOperator(item.operator)) continue;
		result.push({ id: typeof item.id === "string" && item.id ? item.id : `filter:${index}`, property: item.property,
			operator: item.operator, value: typeof item.value === "string" ? item.value : String(item.value ?? "") });
	}
	return result;
}

/** Restore known fields independently: older partial nested settings must not erase new defaults. */
export function normalizeSettings(value: unknown): PluginSettings {
	const source = record(value);
	const result = structuredClone(DEFAULT_SETTINGS);
	const target = result as unknown as Record<string, unknown>;
	for (const [key, fallback] of Object.entries(result)) {
		if (typeof fallback === "string" && typeof source[key] === "string") target[key] = source[key];
		if (typeof fallback === "boolean" && typeof source[key] === "boolean") target[key] = source[key];
	}
	result.layoutModel = source.layoutModel === "spatial" ? "spatial" : "orbital";
	result.defaultRole = role(source.defaultRole, DEFAULT_SETTINGS.defaultRole);
	if (source.roles !== null && typeof source.roles === "object" && !Array.isArray(source.roles)) {
		result.roles = Object.create(null) as PluginSettings["roles"];
		for (const [key, raw] of Object.entries(record(source.roles))) result.roles[key] = role(raw, result.defaultRole);
	}

	const state = record(source.graphState);
	const defaults = DEFAULT_SETTINGS.graphState as PersistedGraphState;
	result.graphState = {
		search: typeof state.search === "string" ? state.search : defaults.search,
		relationTypes: stringList(state.relationTypes), companies: stringList(state.companies),
		propertyFilters: propertyFilters(state.propertyFilters),
		propertyFilterMode: state.propertyFilterMode === "any" ? "any" : "all",
		showEdges: typeof state.showEdges === "boolean" ? state.showEdges : defaults.showEdges,
		showGhosts: typeof state.showGhosts === "boolean" ? state.showGhosts : defaults.showGhosts,
		nodeScale: number(state.nodeScale, defaults.nodeScale, 0.5, 1.8),
		edgeWidth: number(state.edgeWidth, defaults.edgeWidth, 0.5, 4),
		rotateOrbits: boolean(state.rotateOrbits, defaults.rotateOrbits ?? true),
		linkDistance: number(state.linkDistance, defaults.linkDistance, 40, 260),
		repulsionStrength: number(state.repulsionStrength, defaults.repulsionStrength, 400, 6000),
		linkStrength: number(state.linkStrength, defaults.linkStrength, 0, 1),
		centerStrength: number(state.centerStrength, defaults.centerStrength, 0, 0.2),
		companyStrength: number(state.companyStrength, defaults.companyStrength ?? 0.03, 0, 0.15),
	};
	const camera = record(state.camera);
	if ([camera.scale, camera.x, camera.y].every((item) => typeof item === "number" && Number.isFinite(item))) {
		result.graphState.camera = { scale: number(camera.scale, 1, 0.2, 5), x: camera.x as number, y: camera.y as number };
	}

	result.photoCrops = Object.create(null) as NonNullable<PluginSettings["photoCrops"]>;
	for (const [path, raw] of Object.entries(record(source.photoCrops))) {
		const crop = record(raw);
		result.photoCrops[path] = {
			centerX: number(crop.centerX, 0.5, 0, 1), centerY: number(crop.centerY, 0.5, 0, 1),
			zoom: number(crop.zoom, 1, 1, 4),
		};
	}
	for (const [id, raw] of Object.entries(record(source.layerScopes))) {
		const scope = record(raw);
		if (!Array.isArray(scope.layers)) continue;
		const seen = new Set<string>();
		const layers: GraphLayer[] = [];
		for (const item of scope.layers) {
			const layer = record(item);
			if (typeof layer.id !== "string" || !layer.id || seen.has(layer.id)) continue;
			seen.add(layer.id);
			const name = typeof layer.name === "string" ? layer.name : layer.id;
			const identifier = typeof layer.identifier === "string" && layer.identifier.trim()
				? layer.identifier.trim() : typeof layer.frontmatterField === "string" && layer.frontmatterField.trim()
					? layer.frontmatterField.trim() : name.trim().toLowerCase().replace(/\s+/g, "-") || layer.id;
			layers.push({
				id: layer.id, name, identifier, color: color(layer.color, "#7b6cd9"),
				priority: number(layer.priority, layers.length, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
				showArea: typeof layer.showArea === "boolean" ? layer.showArea : true,
				showMembers: typeof layer.showMembers === "boolean" ? layer.showMembers : true,
			});
		}
		Object.defineProperty(result.layerScopes, id, {
			value: { id, label: typeof scope.label === "string" ? scope.label : id, layers },
			writable: true, enumerable: true, configurable: true,
		});
	}
	return result;
}

/** Vault rename events include folders: move every stored descendant reference too. */
export function renameSettingsPaths(settings: PluginSettings, oldPath: string, newPath: string): boolean {
	let changed = false;
	const rename = (path: string): string => {
		if (path !== oldPath && !path.startsWith(`${oldPath}/`)) return path;
		changed = true;
		return newPath + path.slice(oldPath.length);
	};
	settings.selfNotePath = rename(settings.selfNotePath);
	settings.newNoteTemplatePath = rename(settings.newNoteTemplatePath);
	settings.newNoteFolder = rename(settings.newNoteFolder);
	for (const path of Object.keys(settings.photoCrops ?? {})) {
		const next = rename(path);
		if (next === path) continue;
		settings.photoCrops![next] = settings.photoCrops![path];
		delete settings.photoCrops![path];
	}
	return changed;
}
