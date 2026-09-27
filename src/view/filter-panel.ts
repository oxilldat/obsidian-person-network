import { setIcon, Setting } from "obsidian";
import { t, type TranslationKey } from "../i18n";
import type { DisplayState, FilterState, ForcesState } from "../render/canvas-renderer";
import type { LayoutModel } from "../data/types";
import type { PropertyFilterOperator, PropertyFilterRule } from "../data/types";

export type { DisplayState, ForcesState } from "../render/canvas-renderer";

export interface FilterPanelOptions {
	initialFilter: FilterState;
	initialForces: ForcesState;
	initialDisplay: DisplayState;
	properties: string[];
	onChange: (filter: FilterState) => void;
	onForcesChange: (forces: ForcesState) => void;
	onDisplayChange: (display: DisplayState) => void;
	onReplayAnimation: () => void;
	onOpenChange?: (open: boolean) => void;
	initialLayoutModel: LayoutModel;
	onLayoutModelChange: (model: LayoutModel) => void;
}

function arraysEqual(a: string[], b: string[]): boolean {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Builds the same collapse-triangle glyph Obsidian's own tree items (file
 * explorer, outline, core Graph view) use, via the DOM API rather than
 * innerHTML.
 */
function appendCollapseTriangle(parent: HTMLElement): void {
	const svg = parent.createSvg("svg", {
		attr: {
			xmlns: "http://www.w3.org/2000/svg",
			width: "24",
			height: "24",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": "2",
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
		},
	});
	svg.addClass("svg-icon");
	svg.addClass("right-triangle");
	svg.createSvg("path", { attr: { d: "M3 8L12 17L21 8" } });
}

/**
 * One persistent element that toggles between a compact icon strip and a
 * full panel via an `is-close` class — mirroring Obsidian's own core Graph
 * view controls (`.graph-controls`) exactly, including reusing its class
 * names (`graph-controls-button`, `graph-control-section`, `tree-item`, ...)
 * so the native/theme CSS for those classes applies to us for free.
 */
export class FilterPanel {
	private readonly rootEl: HTMLElement;
	private readonly sectionsHost: HTMLElement;
	/** Collapse state per section, so panel rebuilds don't reset what the user expanded. */
	private readonly expandedSections = new Map<string, boolean>();
	private filter: FilterState;
	private forces: ForcesState;
	private display: DisplayState;
	private readonly defaultFilter: FilterState;
	private readonly defaultForces: ForcesState;
	private readonly defaultDisplay: DisplayState;
	private properties: string[];
	private readonly onChange: (filter: FilterState) => void;
	private readonly onForcesChange: (forces: ForcesState) => void;
	private readonly onDisplayChange: (display: DisplayState) => void;
	private readonly onReplayAnimation: () => void;
	private readonly onOpenChange?: (open: boolean) => void;
	private layoutModel: LayoutModel;
	private readonly onLayoutModelChange: (model: LayoutModel) => void;

	constructor(container: HTMLElement, options: FilterPanelOptions) {
		this.filter = { ...options.initialFilter, propertyFilters: [...options.initialFilter.propertyFilters] };
		this.forces = { ...options.initialForces };
		this.display = { ...options.initialDisplay };
		this.defaultFilter = { ...options.initialFilter, propertyFilters: [...options.initialFilter.propertyFilters] };
		this.defaultForces = { ...options.initialForces };
		this.defaultDisplay = { ...options.initialDisplay };
		this.properties = options.properties;
		// The former role/company controls are gone. Clear persisted choices so
		// an invisible legacy filter cannot keep contacts hidden.
		this.filter.relationTypes = null;
		this.filter.companies = null;
		this.defaultFilter.relationTypes = null;
		this.defaultFilter.companies = null;
		this.onChange = options.onChange;
		this.onForcesChange = options.onForcesChange;
		this.onDisplayChange = options.onDisplayChange;
		this.onReplayAnimation = options.onReplayAnimation;
		this.onOpenChange = options.onOpenChange;
		this.layoutModel = options.initialLayoutModel;
		this.onLayoutModelChange = options.onLayoutModelChange;

		this.rootEl = container.createDiv({ cls: "person-network-panel-root is-close" });

		this.createButton("mod-close", "x", t("common.close"), () => this.setOpen(false));
		this.createButton("mod-open", "settings", t("view.filterAction"), () => this.setOpen(true));
		this.createButton("mod-animate", "wand-2", t("panel.replayAnimation"), () => this.onReplayAnimation());
		this.createButton("mod-reset", "rotate-ccw", t("panel.resetTooltip"), () => this.resetToDefaults());

		this.sectionsHost = this.rootEl.createDiv({ cls: "person-network-panel-sections" });
		this.render();
	}

	updateAvailable(properties: string[]): void {
		// Rebuilding the panel DOM drops input focus, so skip it when the
		// filterable values didn't actually change (the common reindex case).
		const unchanged = arraysEqual(this.properties, properties);
		this.properties = properties;
		if (!unchanged) this.render();
	}

	destroy(): void {
		this.rootEl.remove();
	}

	private createButton(modClass: string, icon: string, tooltip: string, onClick: () => void): void {
		const el = this.rootEl.createDiv({ cls: `clickable-icon graph-controls-button ${modClass}` });
		el.setAttribute("aria-label", tooltip);
		setIcon(el, icon);
		el.addEventListener("click", onClick);
	}

	private setOpen(open: boolean): void {
		this.rootEl.toggleClass("is-close", !open);
		this.onOpenChange?.(open);
	}

	close(): void {
		this.setOpen(false);
	}

	private resetToDefaults(): void {
		this.filter = { ...this.defaultFilter, propertyFilters: [...this.defaultFilter.propertyFilters] };
		this.forces = { ...this.defaultForces };
		this.display = { ...this.defaultDisplay };
		this.emitChange();
		this.emitForcesChange();
		this.emitDisplayChange();
		this.render();
	}

	private emitChange(): void {
		this.onChange({ ...this.filter, propertyFilters: this.filter.propertyFilters.map((rule) => ({ ...rule })) });
	}

	private emitDisplayChange(): void {
		this.onDisplayChange({ ...this.display });
	}

	private emitForcesChange(): void {
		this.onForcesChange({ ...this.forces });
	}

	private renderSection(
		parent: HTMLElement,
		headingKey: TranslationKey,
		defaultExpanded: boolean,
		build: (content: HTMLElement) => void,
	): void {
		const section = parent.createDiv({ cls: "tree-item graph-control-section" });
		const self = section.createDiv({ cls: "tree-item-self mod-collapsible" });
		const iconEl = self.createDiv({ cls: "tree-item-icon collapse-icon" });
		appendCollapseTriangle(iconEl);
		const inner = self.createDiv({ cls: "tree-item-inner" });
		inner.createEl("header", { cls: "graph-control-section-header", text: t(headingKey) });
		const content = section.createDiv({ cls: "tree-item-children" });

		let expanded = this.expandedSections.get(headingKey) ?? defaultExpanded;
		const applyState = (): void => {
			section.toggleClass("is-collapsed", !expanded);
			iconEl.toggleClass("is-collapsed", !expanded);
		};
		self.addEventListener("click", () => {
			expanded = !expanded;
			this.expandedSections.set(headingKey, expanded);
			applyState();
		});
		applyState();

		build(content);
	}

	/** A slider row whose track sits on its own line under the label (native `.mod-slider` layout). */
	private sliderRow(
		content: HTMLElement,
		labelKey: TranslationKey,
		range: { min: number; max: number; step: number },
		value: number,
		onChange: (value: number) => void,
	): void {
		const setting = new Setting(content).setName(t(labelKey)).addSlider((slider) =>
			slider.setLimits(range.min, range.max, range.step).setValue(value).onChange(onChange),
		);
		setting.settingEl.addClass("mod-slider");
	}

	private toggleRow(
		content: HTMLElement,
		labelKey: TranslationKey,
		value: boolean,
		onChange: (value: boolean) => void,
	): void {
		const setting = new Setting(content)
			.setName(t(labelKey))
			.addToggle((toggle) => toggle.setValue(value).onChange(onChange));
		setting.settingEl.addClass("mod-toggle");
	}

	private render(): void {
		this.sectionsHost.empty();

		this.renderSection(this.sectionsHost, "panel.filtersHeading", true, (content) => {
			new Setting(content).addSearch((search) =>
				search
					.setPlaceholder(t("panel.searchPlaceholder"))
					.setValue(this.filter.search)
					.onChange((value) => {
						this.filter.search = value;
						this.emitChange();
					}),
			).settingEl.addClass("mod-search-setting");

			const filterToolbar = content.createDiv({ cls: "person-network-property-filter-toolbar" });
			if (this.filter.propertyFilters.length > 1) {
				const mode = filterToolbar.createEl("select", { cls: "dropdown" });
				mode.createEl("option", { text: t("panel.matchAll"), value: "all" });
				mode.createEl("option", { text: t("panel.matchAny"), value: "any" });
				mode.value = this.filter.propertyFilterMode;
				mode.addEventListener("change", () => {
					this.filter.propertyFilterMode = mode.value === "any" ? "any" : "all";
					this.emitChange();
					this.render();
				});
			} else filterToolbar.createSpan({ cls: "person-network-property-filter-title", text: t("panel.propertyFiltersHeading") });
			const add = filterToolbar.createEl("button", { cls: "person-network-property-filter-add mod-cta", attr: { type: "button" } });
			const addIcon = add.createSpan();
			setIcon(addIcon, "plus");
			add.createSpan({ text: t("panel.addPropertyFilter") });
			add.addEventListener("click", () => {
				this.filter.propertyFilters.push({
					id: `property:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 7)}`,
					property: this.properties[0] ?? "",
					operator: "equals",
					value: "",
				});
				this.emitChange();
				this.render();
			});
			for (const rule of this.filter.propertyFilters) this.renderPropertyFilter(content, rule);
		});

		this.renderSection(this.sectionsHost, "panel.displayHeading", false, (content) => {
			new Setting(content).setName(t("settings.layoutModel.name")).addDropdown((dropdown) => dropdown
				.addOption("orbital", t("settings.layoutModel.orbital"))
				.addOption("spatial", t("settings.layoutModel.spatial"))
				.setValue(this.layoutModel)
				.onChange((value) => {
					this.layoutModel = value === "spatial" ? "spatial" : "orbital";
					this.onLayoutModelChange(this.layoutModel);
					this.render();
				}));
			this.toggleRow(content, "panel.showEdges", this.filter.showEdges, (value) => {
				this.filter.showEdges = value;
				this.emitChange();
			});
			this.toggleRow(content, "panel.showGhosts", this.filter.showGhosts, (value) => {
				this.filter.showGhosts = value;
				this.emitChange();
			});
			if (this.layoutModel === "orbital") {
				this.toggleRow(content, "panel.rotateOrbits", this.display.rotateOrbits, (value) => {
					this.display.rotateOrbits = value;
					this.emitDisplayChange();
				});
			}
			this.sliderRow(content, "panel.nodeSize", { min: 0.5, max: 1.8, step: 0.1 }, this.display.nodeScale, (value) => {
				this.display.nodeScale = value;
				this.emitDisplayChange();
			});
			this.sliderRow(content, "panel.edgeThickness", { min: 0.5, max: 4, step: 0.2 }, this.display.edgeWidth, (value) => {
				this.display.edgeWidth = value;
				this.emitDisplayChange();
			});
		});

	}

	private renderPropertyFilter(content: HTMLElement, rule: PropertyFilterRule): void {
		const card = content.createDiv({ cls: "person-network-property-filter" });
		const top = card.createDiv({ cls: "person-network-property-filter-top" });
		const property = top.createEl("select", { cls: "dropdown person-network-property-filter-property" });
		if (this.properties.length === 0) property.createEl("option", { text: t("panel.propertyPlaceholder"), value: "" });
		for (const name of this.properties) property.createEl("option", { text: name, value: name });
		property.value = rule.property;
		property.addEventListener("change", () => { rule.property = property.value; this.emitChange(); });
		const remove = top.createEl("button", { cls: "clickable-icon", attr: { type: "button", "aria-label": t("common.remove") } });
		setIcon(remove, "trash");
		remove.addEventListener("click", () => {
			this.filter.propertyFilters = this.filter.propertyFilters.filter((candidate) => candidate.id !== rule.id);
			this.emitChange();
			this.render();
		});

		const expression = card.createDiv({ cls: "person-network-property-filter-expression" });
		const operators: PropertyFilterOperator[] = ["equals", "notEquals", "contains", "notContains", "greater", "less", "exists", "notExists"];
		const operator = expression.createEl("select", { cls: "dropdown" });
		for (const name of operators) operator.createEl("option", { text: t(`panel.operator.${name}`), value: name });
		operator.value = rule.operator;
		operator.addEventListener("change", () => {
			rule.operator = operator.value as PropertyFilterOperator;
			this.emitChange();
			this.render();
		});
		if (rule.operator !== "exists" && rule.operator !== "notExists") {
			const value = expression.createEl("input", { type: "text", placeholder: t("panel.valuePlaceholder"), value: rule.value });
			value.addEventListener("input", () => {
				rule.value = value.value;
				this.emitChange();
			});
		}
	}
}
