import type { PropertyFilterRule } from "./types";

function values(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
	return String(value ?? "").trim().toLocaleLowerCase();
}

function isPresent(value: unknown): boolean {
	if (value === null || value === undefined) return false;
	if (Array.isArray(value)) return value.some(isPresent);
	return typeof value !== "string" || value.trim().length > 0;
}

export function matchesPropertyRule(properties: Record<string, unknown> | undefined, rule: PropertyFilterRule): boolean {
	const value = properties?.[rule.property];
	if (rule.operator === "exists") return isPresent(value);
	if (rule.operator === "notExists") return !isPresent(value);
	const expected = text(rule.value);
	const candidates = values(value);
	if (rule.operator === "equals") return candidates.some((candidate) => text(candidate) === expected);
	if (rule.operator === "notEquals") return candidates.every((candidate) => text(candidate) !== expected);
	if (rule.operator === "contains") return candidates.some((candidate) => text(candidate).includes(expected));
	if (rule.operator === "notContains") return candidates.every((candidate) => !text(candidate).includes(expected));
	const expectedNumber = Number(rule.value);
	if (!Number.isFinite(expectedNumber)) return false;
	if (rule.operator === "greater") return candidates.some((candidate) => Number(candidate) > expectedNumber);
	return candidates.some((candidate) => Number(candidate) < expectedNumber);
}

/** Every rule is combined with AND, matching a flat Bases filter group. */
export function matchesPropertyFilters(
	properties: Record<string, unknown> | undefined,
	rules: PropertyFilterRule[],
	mode: "all" | "any" = "all",
): boolean {
	const active = rules.filter((rule) => rule.property.length > 0);
	if (active.length === 0) return true;
	return mode === "any"
		? active.some((rule) => matchesPropertyRule(properties, rule))
		: active.every((rule) => matchesPropertyRule(properties, rule));
}
