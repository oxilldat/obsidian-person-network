import { Component, type App } from "obsidian";
import type { PersonNode, GhostNode, GraphEdge, PluginSettings } from "./types";
import { parsePerson, isExcluded } from "./parser";
import { buildContactLinks } from "./graph-links";
import { debounced } from "../utils/debounce";

export interface GraphSnapshot {
	people: PersonNode[];
	ghosts: GhostNode[];
	edges: GraphEdge[];
}

type Listener = (snapshot: GraphSnapshot) => void;

const EMPTY_SNAPSHOT: GraphSnapshot = { people: [], ghosts: [], edges: [] };

/**
 * Owns the vault scan and keeps a live snapshot of people/ghosts/edges,
 * reindexing (debounced) whenever the vault or its metadata changes.
 * Meant to be added as a child component of the plugin or the view so its
 * event registrations are cleaned up automatically.
 */
export class DataStore extends Component {
	private readonly app: App;
	private readonly getSettings: () => PluginSettings;
	private readonly listeners = new Set<Listener>();
	private readonly requestReindex: () => void;
	private snapshot: GraphSnapshot = EMPTY_SNAPSHOT;

	constructor(app: App, getSettings: () => PluginSettings) {
		super();
		this.app = app;
		this.getSettings = getSettings;
		this.requestReindex = debounced(() => this.reindex(), 250);
	}

	override onload(): void {
		this.reindex();
		this.registerEvent(this.app.metadataCache.on("changed", () => this.requestReindex()));
		this.registerEvent(this.app.metadataCache.on("resolved", () => this.requestReindex()));
		this.registerEvent(this.app.vault.on("delete", () => this.requestReindex()));
		this.registerEvent(this.app.vault.on("rename", () => this.requestReindex()));
	}

	override onunload(): void {
		this.listeners.clear();
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		listener(this.snapshot);
		return () => this.listeners.delete(listener);
	}

	getSnapshot(): GraphSnapshot {
		return this.snapshot;
	}

	reindex(): void {
		const settings = this.getSettings();
		const people: PersonNode[] = [];

		for (const file of this.app.vault.getMarkdownFiles()) {
			if (isExcluded(file.path, settings.excludePaths)) continue;
			const cache = this.app.metadataCache.getFileCache(file);
			const person = parsePerson(this.app, file, cache, settings);
			if (person) people.push(person);
		}

		const { edges, ghosts } = buildContactLinks(people);

		this.snapshot = { people, ghosts, edges };
		for (const listener of this.listeners) listener(this.snapshot);
	}
}
