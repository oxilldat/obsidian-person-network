/** Fixed (non-configurable) frontmatter keys — kept minimal on purpose. */
export const FIXED_FIELDS = {
	company: "company",
	isSelf: "is_self",
} as const;

/** Default values for the configurable field-name settings. */
export const DEFAULT_FIELD_NAMES = {
	personTag: "person",
	nameField: "name",
	photoField: "photo",
	relationField: "relation",
	potentialContactsField: "potential_contacts",
} as const;
