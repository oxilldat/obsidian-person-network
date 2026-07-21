import { describe, expect, it } from "vitest";
import { ghostId, normalizeName } from "../src/data/name-matching";

describe("normalizeName", () => {
	it("trims, collapses whitespace and lowercases", () => {
		expect(normalizeName("  John   Smith ")).toBe("john smith");
		expect(normalizeName("JANE DOE")).toBe("jane doe");
	});

	it("treats differently-spaced/cased forms as equal", () => {
		expect(normalizeName("Mike  Lee")).toBe(normalizeName("mike lee"));
	});
});

describe("ghostId", () => {
	it("prefixes the normalized name", () => {
		expect(ghostId("Kyle Reese")).toBe("ghost:kyle reese");
	});

	it("is stable across name formatting differences", () => {
		expect(ghostId(" Alex  Unknown ")).toBe(ghostId("alex unknown"));
	});
});
