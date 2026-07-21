import { ItemView, Notice, TFile, type WorkspaceLeaf } from "obsidian";
import type PersonNetworkPlugin from "../main";
import type { GhostNode, PersonNode } from "../data/types";
import { DataStore, type GraphSnapshot } from "../data/store";
import { exportCanvasAsPng } from "../export/png-export";
import { t } from "../i18n";
import { CanvasRenderer, type FilterState } from "../render/canvas-renderer";
import { handleNodeClick } from "./context-actions";
import { FilterPanel } from "./filter-panel";
import { ghostTooltipLines, personTooltipLines, wireGraphInteraction } from "./graph-interaction";
import { Tooltip } from "./tooltip";

export const VIEW_TYPE_PERSON_NETWORK = "person-network-view";

export class PersonNetworkView extends ItemView {
	private readonly plugin: PersonNetworkPlugin;

	private dataStore: DataStore | null = null;
	private renderer: CanvasRenderer | null = null;
	private filterPanel: FilterPanel | null = null;
	private tooltip: Tooltip | null = null;

	private peopleById = new Map<string, PersonNode>();
	private ghostsById = new Map<string, GhostNode>();

	constructor(leaf: WorkspaceLeaf, plugin: PersonNetworkPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_PERSON_NETWORK;
	}

	getDisplayText(): string {
		return t("view.displayName");
	}

	getIcon(): string {
		return "network";
	}

	override async onOpen(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("person-network-container");

		this.dataStore = new DataStore(this.app, () => this.plugin.settings);
		this.addChild(this.dataStore);

		this.renderer = new CanvasRenderer(container, this.app, () => this.plugin.settings);
		this.tooltip = new Tooltip(container);
		this.filterPanel = new FilterPanel(container, {
			initialFilter: this.renderer.filter,
			initialForces: this.renderer.getForces(),
			initialDisplay: this.renderer.getDisplay(),
			relationTypes: [],
			companies: [],
			onChange: (filter) => this.applyFilter(filter),
			onForcesChange: (forces) => this.renderer?.setForces(forces),
			onDisplayChange: (display) => this.renderer?.setDisplay(display),
			onReplayAnimation: () => this.renderer?.replayAnimation(),
		});

		wireGraphInteraction(this, this.renderer, this.tooltip, {
			onNodeClick: (id) =>
				handleNodeClick(this.app, this.plugin.settings, id, this.peopleById, this.ghostsById),
			getTooltipLines: (id) => {
				const person = this.peopleById.get(id);
				if (person) return personTooltipLines(person);
				const ghost = this.ghostsById.get(id);
				if (ghost) return ghostTooltipLines(ghost);
				return null;
			},
		});

		this.addAction("download", t("view.exportAction"), () => void this.exportPng());

		this.registerEvent(this.app.workspace.on("css-change", () => this.renderer?.onThemeChange()));
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile) this.renderer?.onPhotoModified(file.path);
			}),
		);

		this.dataStore.subscribe((snapshot) => this.onSnapshot(snapshot));
	}

	// eslint-disable-next-line @typescript-eslint/require-await -- ItemView requires an async signature
	override async onClose(): Promise<void> {
		this.renderer?.destroy();
		this.filterPanel?.destroy();
		this.tooltip?.destroy();
	}

	/** Called by the plugin after settings change, so role edits etc. show up without reopening the view. */
	onSettingsChanged(): void {
		this.dataStore?.reindex();
		this.renderer?.requestRedraw();
	}

	private onSnapshot(snapshot: GraphSnapshot): void {
		this.peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
		this.ghostsById = new Map(snapshot.ghosts.map((ghost) => [ghost.id, ghost]));

		this.renderer?.setGraph(snapshot);

		const relationTypes = [
			...new Set(snapshot.people.map((person) => person.relationType).filter((v): v is string => !!v)),
		].sort();
		const companies = [
			...new Set(snapshot.people.map((person) => person.company).filter((v): v is string => !!v)),
		].sort();
		this.filterPanel?.updateAvailable(relationTypes, companies);

		this.renderEmptyState(snapshot.people.length === 0);
	}

	private renderEmptyState(isEmpty: boolean): void {
		const container = this.containerEl.children[1] as HTMLElement;
		const existing = container.querySelector<HTMLElement>(".person-network-empty");

		if (!isEmpty) {
			existing?.remove();
			return;
		}
		if (existing) return;

		const settings = this.plugin.settings;
		const emptyEl = container.createDiv({ cls: "person-network-empty" });
		emptyEl.createEl("h4", { text: t("view.emptyTitle") });
		emptyEl.createEl("p", {
			text: t("view.emptyBody", { value: settings.personTag }),
		});
		emptyEl.createEl("p", { text: t("view.emptyHint") });
		const code = emptyEl.createEl("pre");
		code.createEl("code", {
			text: `---\ntags:\n  - ${settings.personTag}\n${settings.nameField}: Jane Doe\n---`,
		});
	}

	private applyFilter(filter: FilterState): void {
		if (!this.renderer) return;
		this.renderer.filter = filter;
		this.renderer.requestRedraw();
	}

	private async exportPng(): Promise<void> {
		if (!this.renderer || !this.renderer.hasVisibleContent()) {
			new Notice(t("view.notice.exportFailed"));
			return;
		}

		const blob = await exportCanvasAsPng(this.renderer.getCanvasElement());
		if (!blob) {
			new Notice(t("view.notice.exportFailed"));
			return;
		}

		const url = URL.createObjectURL(blob);
		const anchor = createEl("a", { href: url });
		anchor.download = "person-network.png";
		anchor.click();
		URL.revokeObjectURL(url);
		new Notice(t("view.notice.exportSuccess"));
	}
}
