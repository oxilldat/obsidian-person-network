import en from "./en";
import ru from "./ru";

export type TranslationKey = keyof typeof en;
export type Locale = "en" | "ru";
export type LocalePreference = "auto" | Locale;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, ru };

let activeLocale: Locale = "en";

interface MomentLike {
	locale(): string;
}

function readGlobalMomentLocale(): string | undefined {
	const globalWithMoment = globalThis as typeof globalThis & { moment?: MomentLike };
	try {
		return globalWithMoment.moment?.locale();
	} catch {
		return undefined;
	}
}

/** Resolves "auto" against Obsidian's own locale (via the global moment instance it sets up), falling back to the browser locale, then English. */
export function resolveLocale(preference: LocalePreference): Locale {
	if (preference === "en" || preference === "ru") return preference;

	const detected = readGlobalMomentLocale() ?? (typeof navigator !== "undefined" ? navigator.language : undefined);
	return detected?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function setLocale(preference: LocalePreference): void {
	activeLocale = resolveLocale(preference);
}

export function getLocale(): Locale {
	return activeLocale;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
	const text = dictionaries[activeLocale][key] ?? dictionaries.en[key] ?? key;
	if (!params) return text;

	return Object.entries(params).reduce(
		(result, [paramKey, value]) => result.split(`{{${paramKey}}}`).join(String(value)),
		text,
	);
}
