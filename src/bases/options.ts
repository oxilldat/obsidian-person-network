import type { BasesAllOptions } from "obsidian";
import type { PluginSettings } from "../data/types";
import { t } from "../i18n";

export const OPTION_KEYS = {
	nameProperty: "nameProperty",
	photoProperty: "photoProperty",
	relationProperty: "relationProperty",
	contactsProperty: "contactsProperty",
	showEdges: "showEdges",
	showGhosts: "showGhosts",
	linkDistance: "linkDistance",
} as const;

export const DEFAULT_LINK_DISTANCE = 110;

/**
 * Per-view options shown in the native Bases view-config menu. Property
 * mapping defaults come from the plugin's global settings, so a fresh view
 * works out of the box for vaults already using the standalone graph.
 */
export function buildBasesOptions(settings: PluginSettings): BasesAllOptions[] {
	return [
		{
			type: "property",
			key: OPTION_KEYS.nameProperty,
			displayName: t("settings.nameField.name"),
			default: `note.${settings.nameField}`,
		},
		{
			type: "property",
			key: OPTION_KEYS.photoProperty,
			displayName: t("settings.photoField.name"),
			default: `note.${settings.photoField}`,
		},
		{
			type: "property",
			key: OPTION_KEYS.relationProperty,
			displayName: t("settings.relationField.name"),
			default: `note.${settings.relationField}`,
		},
		{
			type: "property",
			key: OPTION_KEYS.contactsProperty,
			displayName: t("settings.potentialContactsField.name"),
			default: `note.${settings.potentialContactsField}`,
		},
		{
			type: "toggle",
			key: OPTION_KEYS.showEdges,
			displayName: t("panel.showEdges"),
			default: true,
		},
		{
			type: "toggle",
			key: OPTION_KEYS.showGhosts,
			displayName: t("panel.showGhosts"),
			default: true,
		},
		{
			type: "slider",
			key: OPTION_KEYS.linkDistance,
			displayName: t("panel.linkDistance"),
			default: DEFAULT_LINK_DISTANCE,
			min: 40,
			max: 260,
			step: 5,
			instant: true,
		},
	];
}
