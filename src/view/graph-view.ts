import { ItemView, Notice, TFile, type WorkspaceLeaf } from "obsidian";
import type PersonNetworkPlugin from "../main";
import type { GhostNode, PersonNode } from "../data/types";
import { DataStore, type GraphSnapshot } from "../data/store";
import { exportCanvasAsPng } from "../export/png-export";
import { t } from "../i18n";
import { CENTER_NODE_ID, CanvasRenderer, type FilterState } from "../render/canvas-renderer";
import { handleNodeClick, showNodeContextMenu } from "./context-actions";
import { FilterPanel } from "./filter-panel";
import { ghostTooltipLines, personTooltipLines, wireGraphInteraction } from "./graph-interaction";
import { Tooltip } from "./tooltip";
import { LayerPanel } from "./layer-panel";
import { resolveLayerMembers } from "../layers/membership";
import { debounced } from "../utils/debounce";

export const VIEW_TYPE_PERSON_NETWORK = "person-network-view";

export class PersonNetworkView extends ItemView {
	private readonly plugin: PersonNetworkPlugin;

	private dataStore: DataStore | null = null;
	private renderer: CanvasRenderer | null = null;
	private filterPanel: FilterPanel | null = null;
	private tooltip: Tooltip | null = null;
	private layerPanel: LayerPanel | null = null;

	private peopleById = new Map<string, PersonNode>();
	private ghostsById = new Map<string, GhostNode>();
	private lastDiagnostics = "";
	private readonly persistState = debounced(() => this.saveViewState(), 300);

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
		const layerScope = this.plugin.getLayerScope("standalone", t("view.displayName"));
		this.renderer.setLayers(layerScope.layers);
		this.layerPanel = new LayerPanel(container, layerScope.layers, () => {
			this.renderer?.setLayers(layerScope.layers);
			void this.plugin.saveGraphState();
		});
		const saved = this.plugin.settings.graphState;
		if (saved) {
			this.renderer.filter = {
				search: saved.search,
				relationTypes: saved.relationTypes ? new Set(saved.relationTypes) : null,
				companies: saved.companies ? new Set(saved.companies) : null,
				showEdges: saved.showEdges,
				showGhosts: saved.showGhosts,
			};
			this.renderer.setDisplay({ nodeScale: saved.nodeScale, edgeWidth: saved.edgeWidth });
			this.renderer.setForces({ linkDistance: saved.linkDistance, repulsionStrength: saved.repulsionStrength, linkStrength: saved.linkStrength, centerStrength: saved.centerStrength, companyStrength: saved.companyStrength ?? 0.04 });
			if (saved.camera) this.renderer.restoreCamera(saved.camera);
		}
		this.tooltip = new Tooltip(container);
		this.filterPanel = new FilterPanel(container, {
			initialFilter: this.renderer.filter,
			initialForces: this.renderer.getForces(),
			initialDisplay: this.renderer.getDisplay(),
			relationTypes: [],
			companies: [],
			onChange: (filter) => this.applyFilter(filter),
			onForcesChange: (forces) => { this.renderer?.setForces(forces); this.persistState(); },
			onDisplayChange: (display) => { this.renderer?.setDisplay(display); this.persistState(); },
			onReplayAnimation: () => this.renderer?.replayAnimation(),
		});

		wireGraphInteraction(this, this.renderer, this.tooltip, {
			onNodeClick: (id) =>
				handleNodeClick(this.app, this.plugin.settings, id, this.peopleById, this.ghostsById),
			onNodeContextMenu: (id, event) => {
				const person = id === CENTER_NODE_ID
					? [...this.peopleById.values()].find((candidate) => candidate.isSelf)
					: this.peopleById.get(id);
				if (person) showNodeContextMenu(this.app, this.plugin.settings, person, event, async () => {
					await this.plugin.saveSettings();
					this.renderer?.setLayers(layerScope.layers);
					this.layerPanel?.update(layerScope.layers);
					this.dataStore?.reindex();
				}, layerScope.layers);
			},
			onViewChanged: () => this.persistState(),
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
		this.layerPanel?.destroy();
	}

	/** Called by the plugin after settings change, so role edits etc. show up without reopening the view. */
	onSettingsChanged(): void {
		const layerScope = this.plugin.getLayerScope("standalone", t("view.displayName"));
		this.renderer?.setLayers(layerScope.layers);
		this.layerPanel?.update(layerScope.layers);
		this.dataStore?.reindex();
		this.renderer?.requestRedraw();
	}

	private onSnapshot(snapshot: GraphSnapshot): void {
		this.peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
		this.ghostsById = new Map(snapshot.ghosts.map((ghost) => [ghost.id, ghost]));

		const layerScope = this.plugin.getLayerScope("standalone", t("view.displayName"));
		this.renderer?.setLayers(layerScope.layers, resolveLayerMembers(this.app, snapshot.people, layerScope.layers, this.plugin.settings.layerField));
		this.renderer?.setGraph(snapshot);

		const relationTypes = [
			...new Set(snapshot.people.map((person) => person.relationType).filter((v): v is string => !!v)),
		].sort();
		const companies = [
			...new Set(snapshot.people.map((person) => person.company).filter((v): v is string => !!v)),
		].sort();
		this.filterPanel?.updateAvailable(relationTypes, companies);

		this.renderEmptyState(snapshot.people.length === 0);
		this.showDiagnostics(snapshot);
	}

	private showDiagnostics(snapshot: GraphSnapshot): void {
		const messages: string[] = [];
		if (snapshot.diagnostics.multipleSelf.length > 1) messages.push(t("warning.multipleSelf", { value: snapshot.diagnostics.multipleSelf.join(", ") }));
		if (snapshot.diagnostics.duplicateNames.length) messages.push(t("warning.duplicateNames", { value: snapshot.diagnostics.duplicateNames.join(", ") }));
		if (snapshot.diagnostics.unknownRoles.length) messages.push(t("warning.unknownRoles", { value: snapshot.diagnostics.unknownRoles.join(", ") }));
		const signature = messages.join("\n");
		if (signature && signature !== this.lastDiagnostics) new Notice(signature, 8000);
		this.lastDiagnostics = signature;
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
		this.persistState();
	}

	private saveViewState(): void {
		if (!this.renderer) return;
		const filter = this.renderer.filter;
		const display = this.renderer.getDisplay();
		const forces = this.renderer.getForces();
		this.plugin.settings.graphState = {
			search: filter.search,
			relationTypes: filter.relationTypes ? [...filter.relationTypes] : null,
			companies: filter.companies ? [...filter.companies] : null,
			showEdges: filter.showEdges,
			showGhosts: filter.showGhosts,
			...display,
			...forces,
			camera: this.renderer.getCameraState(),
		};
		void this.plugin.saveGraphState();
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
