import esbuild from "esbuild";
import process from "process";
import { builtinModules } from "node:module";

const banner = `/* Person Network — bundled build. Source: src/ in this repository. */\n`;

const isProduction = process.argv[2] === "production";

const ctx = await esbuild.context({
	banner: { js: banner },
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtinModules,
		...builtinModules.map((m) => `node:${m}`),
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: isProduction ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
});

if (isProduction) {
	await ctx.rebuild();
	process.exit(0);
} else {
	await ctx.watch();
}
