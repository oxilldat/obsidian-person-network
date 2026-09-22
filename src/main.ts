import { Plugin, type WorkspaceLeaf } from "obsidian";
import { BASES_VIEW_TYPE, PersonNetworkBasesView } from "./bases/graph-bases-view";
import { buildBasesOptions } from "./bases/options";
import type { GraphLayerScope, PluginSettings } from "./data/types";
import { setLocale, t } from "./i18n";
import { DEFAULT_SETTINGS } from "./settings/defaults";
import { PersonNetworkSettingTab } from "./settings/settings-tab";
import { debounced } from "./utils/debounce";
import { PersonNetworkView, VIEW_TYPE_PERSON_NETWORK } from "./view/graph-view";

export default class PersonNetworkPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;
	private readonly settingsListeners = new Set<() => void>();

	/** Debounced because text settings save on every keystroke — one refresh per burst is enough. */
	private readonly refreshOpenViews = debounced(() => {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_PERSON_NETWORK)) {
			if (leaf.view instanceof PersonNetworkView) leaf.view.onSettingsChanged();
		}
	}, 400);

	async onload(): Promise<void> {
		await this.loadSettings();
		setLocale("auto");

		this.registerView(VIEW_TYPE_PERSON_NETWORK, (leaf) => new PersonNetworkView(leaf, this));

		// Guarded: registerBasesView exists since Obsidian 1.10 and returns
		// false when the Bases core plugin is disabled — either way the
		// standalone view above keeps working on its own. The registration
		// only lifts on plugin unload, so the enableBases setting is applied
		// here, at (re)load time.
		if (this.settings.enableBases && typeof this.registerBasesView === "function") {
			this.registerBasesView(BASES_VIEW_TYPE, {
				name: t("bases.viewName"),
				icon: "network",
				factory: (controller, containerEl) => new PersonNetworkBasesView(controller, containerEl, this),
				options: () => buildBasesOptions(this.settings),
			});
		}

		this.addRibbonIcon("network", t("view.ribbonTooltip"), () => {
			void this.activateView();
		});

		this.addSettingTab(new PersonNetworkSettingTab(this.app, this));

		this.addCommand({
			id: "open",
			name: t("view.openCommand"),
			callback: () => void this.activateView(),
		});
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<PluginSettings> | null;
		const defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as PluginSettings;
		if (data) {
			// Copy only known keys so stale fields from older plugin versions
			// don't linger in memory (and get dropped on the next save).
			const target = defaults as unknown as Record<string, unknown>;
			const source = data as unknown as Record<string, unknown>;
			for (const key of Object.keys(defaults)) {
				if (source[key] !== undefined) target[key] = source[key];
			}
		}
		this.settings = defaults;
		for (const scope of Object.values(this.settings.layerScopes ?? {})) {
			for (const layer of scope.layers) this.migrateLayer(layer);
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.refreshOpenViews();
		for (const listener of this.settingsListeners) listener();
	}

	async saveGraphState(): Promise<void> {
		await this.saveData(this.settings);
	}

	getLayerScope(id: string, label: string): GraphLayerScope {
		this.settings.layerScopes ??= {};
		const existing = this.settings.layerScopes[id];
		if (existing) {
			if (existing.label !== label) existing.label = label;
			for (const layer of existing.layers) {
				this.migrateLayer(layer);
				layer.showArea ??= true;
				layer.showMembers ??= true;
				layer.showLabel ??= true;
				layer.showIcon ??= true;
			}
			return existing;
		}
		const scope: GraphLayerScope = { id, label, layers: [] };
		this.settings.layerScopes[id] = scope;
		void this.saveGraphState();
		return scope;
	}

	private migrateLayer(layer: GraphLayerScope["layers"][number]): void {
		const legacy = layer as GraphLayerScope["layers"][number] & { frontmatterField?: string };
		layer.identifier ||= legacy.frontmatterField || layer.name.trim().toLowerCase().replace(/\s+/g, "-") || layer.id;
		delete legacy.frontmatterField;
		layer.showArea ??= true;
		layer.showMembers ??= true;
		layer.showLabel ??= true;
		layer.showIcon ??= true;
	}

	registerSettingsListener(listener: () => void): () => void {
		this.settingsListeners.add(listener);
		return () => this.settingsListeners.delete(listener);
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
		const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_PERSON_NETWORK);

		if (existingLeaves.length > 0) {
			leaf = existingLeaves[0];
		} else {
			leaf = workspace.getLeaf("tab");
			await leaf.setViewState({ type: VIEW_TYPE_PERSON_NETWORK, active: true });
		}

		if (leaf) void workspace.revealLeaf(leaf);
	}
}
