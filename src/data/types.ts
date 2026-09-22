import type { TFile } from "obsidian";

export interface PersonNode {
	id: string; // file path, stable key
	file: TFile;
	displayName: string;
	photoPath?: string;
	relationType?: string; // single free-form field naming a role from settings.roles, e.g. "friend"
	company?: string;
	positionScore: number; // 1-10, resolved from the matched role — purely radial placement
	isSelf: boolean;
	ghostRefs: string[]; // plain-string names this person lists as not-yet-documented contacts
}

export interface GhostNode {
	id: string; // "ghost:" + normalized name
	displayName: string;
	sourceIds: string[]; // ids of PersonNode(s) that referenced this name
}

export interface GraphEdge {
	sourceId: string;
	targetId: string;
}

export type RingStyle = "solid" | "dashed" | "dotted";

/** A user-defined role (e.g. "friend"): ring appearance plus how far it orbits the center. */
export interface PersonRole {
	color: string;
	ringStyle: RingStyle;
	positionScore: number; // 1-10, 10 = closest to center
}

export interface GraphLayer {
	id: string;
	name: string;
	identifier: string;
	icon: string;
	color: string;
	priority: number;
	showLabel: boolean;
	showIcon: boolean;
	showArea: boolean;
	showMembers: boolean;
}

export interface GraphLayerScope {
	id: string;
	label: string;
	layers: GraphLayer[];
}

export interface PluginSettings {
	// Structural / person-detection
	/** Tag (without '#') identifying a person note. */
	personTag: string;
	nameField: string;
	photoField: string;
	relationField: string;
	potentialContactsField: string;
	excludePaths: string;

	// Roles — relation type value -> ring color/style + position score
	roles: Record<string, PersonRole>;
	defaultRole: PersonRole;

	// General
	centerLabel: string;
	/** Registers the graph as a Bases view type; applied on plugin (re)load. */
	enableBases: boolean;

	// Ghost -> real note creation
	newNoteFolder: string;
	/** Vault-relative path to a note whose content is used as the frontmatter template; empty = built-in fallback. */
	newNoteTemplatePath: string;
	graphState?: PersistedGraphState;
	photoCrops?: Record<string, PhotoCropSettings>;
	layerField: string;
	layerScopes?: Record<string, GraphLayerScope>;
}

export interface PersistedGraphState {
	search: string;
	relationTypes: string[] | null;
	companies: string[] | null;
	showEdges: boolean;
	showGhosts: boolean;
	nodeScale: number;
	edgeWidth: number;
	linkDistance: number;
	repulsionStrength: number;
	linkStrength: number;
	centerStrength: number;
	companyStrength?: number;
	camera?: { scale: number; x: number; y: number };
}

export interface PhotoCropSettings {
	centerX: number;
	centerY: number;
	zoom: number;
}
