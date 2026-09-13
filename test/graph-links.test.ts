import { describe, expect, it } from "vitest";
import { buildContactLinks } from "../src/data/graph-links";
import type { PersonNode } from "../src/data/types";

function person(id: string, displayName: string, ghostRefs: string[] = []): PersonNode {
	return {
		id,
		file: {} as never,
		displayName,
		positionScore: 5,
		isSelf: false,
		ghostRefs,
	};
}

describe("buildContactLinks", () => {
	it("creates an edge when a contact name matches another person", () => {
		const people = [person("a.md", "Alice", ["Bob"]), person("b.md", "Bob")];
		const { edges, ghosts } = buildContactLinks(people);
		expect(ghosts).toHaveLength(0);
		expect(edges).toEqual([{ sourceId: "a.md", targetId: "b.md" }]);
	});

	it("resolves a wikilink target path to the matching person", () => {
		const alice = person("People/Alice.md", "Alice", ["People/Bob"]);
		const bob = person("People/Bob.md", "Robert");
		const { edges, ghosts } = buildContactLinks([alice, bob]);
		expect(ghosts).toHaveLength(0);
		expect(edges).toEqual([{ sourceId: "People/Alice.md", targetId: "People/Bob.md" }]);
	});

	it("creates a ghost when a contact name has no person", () => {
		const people = [person("a.md", "Alice", ["Kyle Reese"])];
		const { edges, ghosts } = buildContactLinks(people);
		expect(ghosts).toEqual([
			{ id: "ghost:kyle reese", displayName: "Kyle Reese", sourceIds: ["a.md"] },
		]);
		expect(edges).toEqual([{ sourceId: "a.md", targetId: "ghost:kyle reese" }]);
	});

	it("dedups a ghost referenced by multiple people", () => {
		const people = [
			person("a.md", "Alice", ["Kyle Reese"]),
			person("b.md", "Bob", ["Kyle Reese"]),
		];
		const { ghosts, edges } = buildContactLinks(people);
		expect(ghosts).toHaveLength(1);
		expect(ghosts[0].sourceIds).toEqual(["a.md", "b.md"]);
		expect(edges).toHaveLength(2);
	});

	it("does not duplicate a mutual edge", () => {
		const people = [person("a.md", "Alice", ["Bob"]), person("b.md", "Bob", ["Alice"])];
		const { edges } = buildContactLinks(people);
		expect(edges).toHaveLength(1);
	});

	it("ignores a self-reference", () => {
		const people = [person("a.md", "Alice", ["Alice"])];
		const { edges, ghosts } = buildContactLinks(people);
		expect(edges).toHaveLength(0);
		expect(ghosts).toHaveLength(0);
	});

	it("skips unmatched names when told to (Bases: note exists but is filtered out)", () => {
		const people = [person("a.md", "Alice", ["Filtered Person", "Kyle Reese"])];
		const { edges, ghosts } = buildContactLinks(people, (name) => name === "Filtered Person");
		expect(ghosts.map((g) => g.displayName)).toEqual(["Kyle Reese"]);
		expect(edges).toHaveLength(1);
	});
});
