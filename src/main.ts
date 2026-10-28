import { Plugin, type WorkspaceLeaf } from "obsidian";
import { BASES_VIEW_TYPE, PersonNetworkBasesView } from "./bases/graph-bases-view";
import { buildBasesOptions } from "./bases/options";
import type { PluginSettings } from "./data/types";
import { setLocale, t } from "./i18n";
import { DEFAULT_SETTINGS } from "./settings/defaults";
import { normalizeSettings, renameSettingsPaths } from "./settings/normalize";
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

		this.registerEvent(this.app.vault.on("rename", (_file, oldPath) => {
			const newPath = _file.path;
			if (renameSettingsPaths(this.settings, oldPath, newPath)) void this.saveSettings();
		}));
	}

	async loadSettings(): Promise<void> {
		this.settings = normalizeSettings(await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.refreshOpenViews();
		for (const listener of this.settingsListeners) listener();
	}

	async saveGraphState(): Promise<void> {
		await this.saveData(this.settings);
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
