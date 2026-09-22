import { describe, expect, it } from "vitest";
import { readLayerIdentifiers } from "../src/layers/membership";

describe("layer frontmatter membership", () => {
	it("reads a list of layer identifiers", () => {
		expect(readLayerIdentifiers(["family", "work"])).toEqual(["family", "work"]);
		expect(readLayerIdentifiers("family")).toEqual(["family"]);
	});

	it("ignores missing and blank entries", () => {
		expect(readLayerIdentifiers(["family", " ", null])).toEqual(["family"]);
		expect(readLayerIdentifiers(undefined)).toEqual([]);
	});
});
