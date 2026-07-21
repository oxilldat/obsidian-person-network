import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// Pure logic modules (geometry, sim, data helpers, i18n) only import from
// "obsidian" as type-only, so the alias below is a safety net rather than a
// hard dependency of the tested code.
export default defineConfig({
	test: {
		environment: "node",
		include: ["test/**/*.test.ts"],
	},
	resolve: {
		alias: {
			obsidian: resolve(__dirname, "test/obsidian-stub.ts"),
		},
	},
});
