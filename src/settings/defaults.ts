import { DEFAULT_FIELD_NAMES } from "../data/frontmatter-schema";
import type { PluginSettings } from "../data/types";

export const DEFAULT_SETTINGS: PluginSettings = {
	personTag: DEFAULT_FIELD_NAMES.personTag,
	nameField: DEFAULT_FIELD_NAMES.nameField,
	photoField: DEFAULT_FIELD_NAMES.photoField,
	relationField: DEFAULT_FIELD_NAMES.relationField,
	potentialContactsField: DEFAULT_FIELD_NAMES.potentialContactsField,
	excludePaths: "Templates",

	roles: {
		friend: { color: "#5b8def", ringStyle: "solid", positionScore: 8 },
		family: { color: "#e0607e", ringStyle: "solid", positionScore: 9 },
		colleague: { color: "#4caf50", ringStyle: "dashed", positionScore: 5 },
	},
	defaultRole: { color: "#8a8a8a", ringStyle: "dotted", positionScore: 3 },

	centerLabel: "",
	enableBases: true,

	newNoteFolder: "",
	newNoteTemplatePath: "",
	graphState: {
		search: "", relationTypes: null, companies: null, showEdges: true, showGhosts: true,
		nodeScale: 1, edgeWidth: 1.4,
		linkDistance: 110, repulsionStrength: 2200, linkStrength: 0.5, centerStrength: 0.05,
	},
	photoCrops: {},
};
