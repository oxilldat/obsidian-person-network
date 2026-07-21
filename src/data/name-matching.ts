/**
 * Normalizes a person's display name (or a plain-string "potential contact"
 * name) into a stable key so ghost references can be de-duplicated and
 * matched against real notes regardless of spacing/case differences.
 */
export function normalizeName(name: string): string {
	return name
		.trim()
		.replace(/\s+/g, " ")
		.toLowerCase();
}

export function ghostId(name: string): string {
	return `ghost:${normalizeName(name)}`;
}
