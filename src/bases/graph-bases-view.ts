import { BasesView, TFile, type BasesPropertyId, type QueryController } from "obsidian";
import type PersonNetworkPlugin from "../main";
import type { GhostNode, PersonNode } from "../data/types";
import { CENTER_NODE_ID, CanvasRenderer } from "../render/canvas-renderer";
import { ghostTooltipLines, personTooltipLines, wireGraphInteraction } from "../view/graph-interaction";
import { showNodeContextMenu } from "../view/context-actions";
import { Tooltip } from "../view/tooltip";
import { LayerPanel } from "../view/layer-panel";
import { adaptEntries, type BasesFieldMapping } from "./entry-adapter";
import { OPTION_KEYS } from "./options";
import { t } from "../i18n";
import { resolveLayerMembers } from "../layers/membership";

export const BASES_VIEW_TYPE = "person-network";

/**
 * The graph as a native Bases view: the base's own query decides who is on
 * the map (its filter UI replaces our in-canvas filter panel entirely), and
 * per-view options from the Bases toolbar supply the property mapping and
 * display toggles. Rendering/physics/interaction are the exact same modules
 * the standalone view uses.
 */
export class PersonNetworkBasesView extends BasesView {
	type = BASES_VIEW_TYPE;

	private readonly plugin: PersonNetworkPlugin;
	private readonly rootEl: HTMLElement;
	private renderer: CanvasRenderer | null = null;
	private tooltip: Tooltip | null = null;
	private layerPanel: LayerPanel | null = null;
	private layerScopeId = "";
	private unregisterSettingsListener: (() => void) | null = null;

	private peopleById = new Map<string, PersonNode>();
	private ghostsById = new Map<string, GhostNode>();

	constructor(controller: QueryController, parentEl: HTMLElement, plugin: PersonNetworkPlugin) {
		super(controller);
		this.plugin = plugin;
		this.rootEl = parentEl.createDiv({ cls: "person-network-container person-network-bases" });
	}

	override onload(): void {
		this.ensureUi();
		this.unregisterSettingsListener = this.plugin.registerSettingsListener(() => {
			const scope = this.plugin.getLayerScope(this.layerScopeId, this.config.name || t("bases.viewName"));
			this.renderer?.setLayers(scope.layers);
			this.layerPanel?.update(scope.layers);
			this.onDataUpdated();
		});
	}

	override onunload(): void {
		this.renderer?.destroy();
		this.tooltip?.destroy();
		this.layerPanel?.destroy();
		this.unregisterSettingsListener?.();
		this.unregisterSettingsListener = null;
		this.renderer = null;
		this.tooltip = null;
		this.layerPanel = null;
		this.rootEl.remove();
	}

	override onDataUpdated(): void {
		const renderer = this.ensureUi();

		const snapshot = adaptEntries(this.app, this.data.data, this.readMapping(), this.plugin.settings);
		this.peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
		this.ghostsById = new Map(snapshot.ghosts.map((ghost) => [ghost.id, ghost]));
		const layerScope = this.plugin.getLayerScope(this.readLayerScopeId(), this.config.name || t("bases.viewName"));
		renderer.setLayers(layerScope.layers, resolveLayerMembers(this.app, snapshot.people, layerScope.layers, this.plugin.settings.layerField));

		renderer.filter = {
			search: "",
			relationTypes: null,
			companies: null,
			showEdges: this.readToggle(OPTION_KEYS.showEdges),
			showGhosts: this.readToggle(OPTION_KEYS.showGhosts),
		};

		const rawDistance = this.config.get(OPTION_KEYS.linkDistance);
		if (typeof rawDistance === "number" && rawDistance !== renderer.getForces().linkDistance) {
			renderer.setForces({ ...renderer.getForces(), linkDistance: rawDistance });
		}

		renderer.setGraph(snapshot);
	}

	private ensureUi(): CanvasRenderer {
		if (this.renderer) return this.renderer;

		this.renderer = new CanvasRenderer(this.rootEl, this.app, () => this.plugin.settings);
		this.tooltip = new Tooltip(this.rootEl);
		this.layerScopeId = this.readLayerScopeId();
		const layerScope = this.plugin.getLayerScope(this.layerScopeId, this.config.name || t("bases.viewName"));
		this.renderer.setLayers(layerScope.layers);
		this.layerPanel = new LayerPanel(this.rootEl, layerScope.layers, () => {
			this.renderer?.setLayers(layerScope.layers);
			void this.plugin.saveGraphState();
		});

		wireGraphInteraction(this, this.renderer, this.tooltip, {
			onNodeClick: (id) => this.handleClick(id),
			onNodeContextMenu: (id, event) => {
				const person = id === CENTER_NODE_ID
					? [...this.peopleById.values()].find((candidate) => candidate.isSelf)
					: this.peopleById.get(id);
				if (person) showNodeContextMenu(this.app, this.plugin.settings, person, event, async () => {
					await this.plugin.saveSettings();
					this.renderer?.setLayers(layerScope.layers);
					this.layerPanel?.update(layerScope.layers);
					this.onDataUpdated();
				}, layerScope.layers);
			},
			getTooltipLines: (id) => {
				const person = this.peopleById.get(id);
				if (person) return personTooltipLines(person);
				const ghost = this.ghostsById.get(id);
				if (ghost) return ghostTooltipLines(ghost);
				return null;
			},
		});

		this.registerEvent(this.app.workspace.on("css-change", () => this.renderer?.onThemeChange()));
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile) this.renderer?.onPhotoModified(file.path);
			}),
		);

		return this.renderer;
	}

	private readLayerScopeId(): string {
		const key = "personNetworkLayerScopeId";
		const existing = this.config.get(key);
		if (typeof existing === "string" && existing.length > 0) return existing;
		const id = `base:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 9)}`;
		this.config.set(key, id);
		return id;
	}

	private handleClick(id: string): void {
		const person = this.peopleById.get(id);
		if (person) {
			void this.app.workspace.getLeaf("tab").openFile(person.file);
			return;
		}

		const ghost = this.ghostsById.get(id);
		if (ghost) {
			// Native Bases "new note" menu: pre-fills properties so the created
			// note matches the base's filters, plus our display-name field.
			void this.createFileForView(ghost.displayName, (frontmatter: Record<string, unknown>) => {
				const mapped = this.readMapping().nameProp;
				const field = mapped?.startsWith("note.") ? mapped.slice(5) : this.plugin.settings.nameField;
				frontmatter[field] = ghost.displayName;
			});
		}
	}

	private readMapping(): BasesFieldMapping {
		const settings = this.plugin.settings;
		return {
			nameProp:
				this.config.getAsPropertyId(OPTION_KEYS.nameProperty) ??
				(`note.${settings.nameField}` as BasesPropertyId),
			photoProp:
				this.config.getAsPropertyId(OPTION_KEYS.photoProperty) ??
				(`note.${settings.photoField}` as BasesPropertyId),
			relationProp:
				this.config.getAsPropertyId(OPTION_KEYS.relationProperty) ??
				(`note.${settings.relationField}` as BasesPropertyId),
			contactsProp:
				this.config.getAsPropertyId(OPTION_KEYS.contactsProperty) ??
				(`note.${settings.potentialContactsField}` as BasesPropertyId),
		};
	}

	private readToggle(key: string): boolean {
		const raw = this.config.get(key);
		return typeof raw === "boolean" ? raw : true;
	}
}
