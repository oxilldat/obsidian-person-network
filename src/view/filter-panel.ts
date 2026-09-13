import { setIcon, Setting } from "obsidian";
import { t, type TranslationKey } from "../i18n";
import type { DisplayState, FilterState, ForcesState } from "../render/canvas-renderer";

export type { DisplayState, ForcesState } from "../render/canvas-renderer";

export interface FilterPanelOptions {
	initialFilter: FilterState;
	initialForces: ForcesState;
	initialDisplay: DisplayState;
	relationTypes: string[];
	companies: string[];
	onChange: (filter: FilterState) => void;
	onForcesChange: (forces: ForcesState) => void;
	onDisplayChange: (display: DisplayState) => void;
	onReplayAnimation: () => void;
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
	private relationTypes: string[];
	private companies: string[];
	private readonly onChange: (filter: FilterState) => void;
	private readonly onForcesChange: (forces: ForcesState) => void;
	private readonly onDisplayChange: (display: DisplayState) => void;
	private readonly onReplayAnimation: () => void;

	constructor(container: HTMLElement, options: FilterPanelOptions) {
		this.filter = { ...options.initialFilter };
		this.forces = { ...options.initialForces };
		this.display = { ...options.initialDisplay };
		this.defaultFilter = { ...options.initialFilter };
		this.defaultForces = { ...options.initialForces };
		this.defaultDisplay = { ...options.initialDisplay };
		this.relationTypes = options.relationTypes;
		this.companies = options.companies;
		this.onChange = options.onChange;
		this.onForcesChange = options.onForcesChange;
		this.onDisplayChange = options.onDisplayChange;
		this.onReplayAnimation = options.onReplayAnimation;

		this.rootEl = container.createDiv({ cls: "person-network-panel-root is-close" });

		this.createButton("mod-close", "x", t("common.close"), () => this.setOpen(false));
		this.createButton("mod-open", "settings", t("view.filterAction"), () => this.setOpen(true));
		this.createButton("mod-animate", "wand-2", t("panel.replayAnimation"), () => this.onReplayAnimation());
		this.createButton("mod-reset", "rotate-ccw", t("panel.resetTooltip"), () => this.resetToDefaults());

		this.sectionsHost = this.rootEl.createDiv({ cls: "person-network-panel-sections" });
		this.render();
	}

	updateAvailable(relationTypes: string[], companies: string[]): void {
		// Rebuilding the panel DOM drops input focus, so skip it when the
		// filterable values didn't actually change (the common reindex case).
		const unchanged =
			arraysEqual(this.relationTypes, relationTypes) && arraysEqual(this.companies, companies);
		this.relationTypes = relationTypes;
		this.companies = companies;
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
	}

	private resetToDefaults(): void {
		this.filter = { ...this.defaultFilter };
		this.forces = { ...this.defaultForces };
		this.display = { ...this.defaultDisplay };
		this.emitChange();
		this.emitForcesChange();
		this.emitDisplayChange();
		this.render();
	}

	private emitChange(): void {
		this.onChange({ ...this.filter });
	}

	private emitDisplayChange(): void {
		this.onDisplayChange({ ...this.display });
	}

	private emitForcesChange(): void {
		this.onForcesChange({ ...this.forces });
	}

	private isAllowed(set: Set<string> | null, value: string): boolean {
		return set === null || set.has(value);
	}

	/** null means "no filter" (everything allowed); we collapse back to null once nothing is excluded. */
	private toggleValue(current: Set<string> | null, allValues: string[], value: string, checked: boolean): Set<string> | null {
		const next = current === null ? new Set(allValues) : new Set(current);
		if (checked) next.add(value);
		else next.delete(value);
		return next.size === allValues.length ? null : next;
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

			if (this.relationTypes.length > 0) {
				new Setting(content).setName(t("panel.relationHeading")).setHeading();
				for (const relationType of this.relationTypes) {
					new Setting(content).setName(relationType).addToggle((toggle) =>
						toggle.setValue(this.isAllowed(this.filter.relationTypes, relationType)).onChange((value) => {
							this.filter.relationTypes = this.toggleValue(
								this.filter.relationTypes,
								this.relationTypes,
								relationType,
								value,
							);
							this.emitChange();
						}),
					);
				}
			}

			if (this.companies.length > 0) {
				new Setting(content).setName(t("panel.companyHeading")).setHeading();
				for (const company of this.companies) {
					new Setting(content).setName(company).addToggle((toggle) =>
						toggle.setValue(this.isAllowed(this.filter.companies, company)).onChange((value) => {
							this.filter.companies = this.toggleValue(this.filter.companies, this.companies, company, value);
							this.emitChange();
						}),
					);
				}
			}
		});

		this.renderSection(this.sectionsHost, "panel.displayHeading", false, (content) => {
			this.toggleRow(content, "panel.showEdges", this.filter.showEdges, (value) => {
				this.filter.showEdges = value;
				this.emitChange();
			});
			this.toggleRow(content, "panel.showGhosts", this.filter.showGhosts, (value) => {
				this.filter.showGhosts = value;
				this.emitChange();
			});
			this.sliderRow(content, "panel.nodeSize", { min: 0.5, max: 1.8, step: 0.1 }, this.display.nodeScale, (value) => {
				this.display.nodeScale = value;
				this.emitDisplayChange();
			});
			this.sliderRow(content, "panel.edgeThickness", { min: 0.5, max: 4, step: 0.2 }, this.display.edgeWidth, (value) => {
				this.display.edgeWidth = value;
				this.emitDisplayChange();
			});
		});

		this.renderSection(this.sectionsHost, "panel.forcesHeading", true, (content) => {
			this.sliderRow(content, "panel.repulsion", { min: 400, max: 6000, step: 100 }, this.forces.repulsionStrength, (value) => {
				this.forces.repulsionStrength = value;
				this.emitForcesChange();
			});
			this.sliderRow(content, "panel.linkStrength", { min: 0, max: 1, step: 0.05 }, this.forces.linkStrength, (value) => {
				this.forces.linkStrength = value;
				this.emitForcesChange();
			});
			this.sliderRow(content, "panel.linkDistance", { min: 40, max: 260, step: 5 }, this.forces.linkDistance, (value) => {
				this.forces.linkDistance = value;
				this.emitForcesChange();
			});
			this.sliderRow(content, "panel.centerStrength", { min: 0, max: 0.2, step: 0.01 }, this.forces.centerStrength, (value) => {
				this.forces.centerStrength = value;
				this.emitForcesChange();
			});
		});
	}
}
