import { describe, expect, it, vi } from "vitest";
import { DataStore } from "../src/data/store";
import { DEFAULT_SETTINGS } from "../src/settings/defaults";

describe("DataStore vault refresh events", () => {
	it("reindexes after notes are created or modified", () => {
		const metadataHandlers = new Map<string, () => void>();
		const vaultHandlers = new Map<string, () => void>();
		const app = {
			metadataCache: {
				on: (event: string, handler: () => void) => {
					metadataHandlers.set(event, handler);
					return {};
				},
			},
			vault: {
				on: (event: string, handler: () => void) => {
					vaultHandlers.set(event, handler);
					return {};
				},
				getMarkdownFiles: () => [],
			},
		};
		const store = new DataStore(app as never, () => DEFAULT_SETTINGS);
		const reindex = vi.spyOn(store, "reindex");

		store.onload();
		expect(reindex).toHaveBeenCalledTimes(1);
		expect([...metadataHandlers.keys()]).toEqual(["changed", "resolved"]);
		expect([...vaultHandlers.keys()]).toEqual(["create", "modify", "delete", "rename"]);

		vaultHandlers.get("create")?.();
		vaultHandlers.get("modify")?.();
		expect(reindex).toHaveBeenCalledTimes(3);
	});
});
