import type { PluginSettings, RingStyle } from "../data/types";
import type { ThemeColorCache } from "./theme-colors";

const VAR_TOKEN = /^var\((--[\w-]+)\)$/;

/** Resolves a settings color value that may be a literal hex or a `var(--token)` reference. */
export function resolveColorToken(token: string, themeColors: ThemeColorCache, fallback = "#9e9e9e"): string {
	const trimmed = token.trim();
	const match = VAR_TOKEN.exec(trimmed);
	if (match) return themeColors.get(match[1], fallback);
	return trimmed || fallback;
}

export function resolveRelationStyle(
	relationType: string | undefined,
	settings: PluginSettings,
	themeColors: ThemeColorCache,
): { color: string; ringStyle: RingStyle } {
	const role = (relationType && settings.roles[relationType]) || settings.defaultRole;
	return { color: resolveColorToken(role.color, themeColors), ringStyle: role.ringStyle };
}
