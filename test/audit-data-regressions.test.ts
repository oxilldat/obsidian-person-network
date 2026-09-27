import { describe, expect, it } from "vitest";
import { normalizeSettings, renameSettingsPaths } from "../src/settings/normalize";
import { DEFAULT_SETTINGS } from "../src/settings/defaults";
import { resolveRole } from "../src/data/parser";
import { buildContactLinks } from "../src/data/graph-links";
import type { PersonNode } from "../src/data/types";

describe("saved settings compatibility", () => {
	it("restores missing nested defaults without resetting saved filters", () => {
		const settings = normalizeSettings({ graphState: { search: "Alice", showEdges: false }, defaultRole: { color: "#ffffff" } });
		expect(settings.graphState).toEqual({ ...DEFAULT_SETTINGS.graphState, search: "Alice", showEdges: false });
		expect(settings.defaultRole).toEqual({ ...DEFAULT_SETTINGS.defaultRole, color: "#ffffff" });
	});
	it("rejects malformed values before they can break rendering", () => {
		const settings = normalizeSettings({ roles: null, layerScopes: { broken: null, invalid: { layers: false } }, graphState: { nodeScale: NaN, linkDistance: -20, camera: { x: 1, y: 2, scale: NaN } } });
		expect(settings.roles).toEqual(DEFAULT_SETTINGS.roles);
		expect(settings.graphState?.nodeScale).toBe(1);
		expect(settings.graphState?.linkDistance).toBe(40);
		expect(settings.graphState?.camera).toBeUndefined();
		expect(Object.keys(settings.layerScopes!)).toEqual(["standalone"]);
	});
	it("migrates legacy groups and drops obsolete rendering fields", () => {
		const settings = normalizeSettings({ layerScopes: { test: { layers: [null, { id: "group", name: "Friends", frontmatterField: "friends", showMembers: false, icon: "users", showLabel: true }] } } });
		expect(settings.layerScopes?.test.layers).toEqual([{ id: "group", name: "Friends", identifier: "friends", color: "#7b6cd9", priority: 0, showArea: true, showMembers: false }]);
	});
	it("retains personal note, template and photo crops after a folder rename", () => {
		const settings = normalizeSettings({ selfNotePath: "People/Me.md", newNoteTemplatePath: "People/Template.md", newNoteFolder: "People", photoCrops: { "People/Me.md": { centerX: 0.4, centerY: 0.6, zoom: 2 }, "People2/Other.md": { zoom: 1 } } });
		expect(renameSettingsPaths(settings, "People", "Contacts")).toBe(true);
		expect(settings.selfNotePath).toBe("Contacts/Me.md");
		expect(settings.newNoteTemplatePath).toBe("Contacts/Template.md");
		expect(settings.newNoteFolder).toBe("Contacts");
		expect(settings.photoCrops?.["Contacts/Me.md"]).toEqual({ centerX: 0.4, centerY: 0.6, zoom: 2 });
		expect(settings.photoCrops?.["People/Me.md"]).toBeUndefined();
		expect(settings.photoCrops?.["People2/Other.md"]).toBeDefined();
	});
	it("does not interpret inherited object keys as roles", () => {
		for (const key of ["constructor", "toString", "__proto__"]) expect(resolveRole(key, DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS.defaultRole);
		const settings = normalizeSettings({ roles: { constructor: { color: "#123456", positionScore: 6 } } });
		expect(resolveRole("constructor", settings).positionScore).toBe(6);
	});
});

describe("ambiguous contact filenames", () => {
	it("does not silently link a basename to the last matching file", () => {
		const person = (path: string, displayName: string, ghostRefs: string[] = []): PersonNode => ({ id: path, file: { path, basename: path.split("/").pop()!.replace(/\.md$/, "") } as never, displayName, ghostRefs, positionScore: 5 });
		const first = person("Work/Alex.md", "Alex at work");
		const second = person("Family/Alex.md", "Alex at home");
		const source = person("Me.md", "Me", ["Alex", "Family/Alex"]);
		const { edges, ghosts } = buildContactLinks([source, first, second]);
		expect(edges).toContainEqual({ sourceId: "Me.md", targetId: "Family/Alex.md" });
		expect(edges).not.toContainEqual({ sourceId: "Me.md", targetId: "Work/Alex.md" });
		expect(ghosts.map((ghost) => ghost.displayName)).toEqual(["Alex"]);
	});
});
