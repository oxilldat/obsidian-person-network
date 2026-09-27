import { Notice, setIcon } from "obsidian";
import type { GraphLayer } from "../data/types";
import { t } from "../i18n";

export class LayerPanel {
	private readonly rootEl: HTMLElement;
	private readonly listEl: HTMLElement;
	private layers: GraphLayer[];

	constructor(
		container: HTMLElement,
		layers: GraphLayer[],
		private readonly onChange: (layers: GraphLayer[]) => void,
		private readonly onOpenChange?: (open: boolean) => void,
	) {
		this.layers = layers;
		this.rootEl = container.createDiv({ cls: "person-network-layer-panel is-close" });
		const open = this.rootEl.createEl("button", {
			cls: "clickable-icon person-network-layer-open",
			attr: { type: "button", "aria-label": t("layers.panelTitle") },
		});
		setIcon(open, "layers");
		open.addEventListener("click", () => this.setOpen(true));

		const header = this.rootEl.createDiv({ cls: "person-network-layer-panel-header" });
		header.createSpan({ text: t("layers.panelTitle") });
		const close = header.createEl("button", {
			cls: "clickable-icon",
			attr: { type: "button", "aria-label": t("common.close") },
		});
		setIcon(close, "x");
		close.addEventListener("click", () => this.setOpen(false));

		this.listEl = this.rootEl.createDiv({ cls: "person-network-layer-list" });
		this.render();
	}

	update(layers: GraphLayer[]): void {
		this.layers = layers;
		this.render();
	}

	destroy(): void {
		this.rootEl.remove();
	}

	close(): void {
		this.setOpen(false);
	}

	setVisible(visible: boolean): void {
		if (visible) {
			const active = [...this.layers].filter((layer) => layer.showArea).sort((a, b) => b.priority - a.priority);
			for (const layer of active.slice(2)) layer.showArea = false;
			this.render();
		}
		this.rootEl.toggleClass("is-hidden", !visible);
		if (!visible) this.setOpen(false);
	}

	private setOpen(open: boolean): void {
		this.rootEl.toggleClass("is-close", !open);
		this.onOpenChange?.(open);
	}

	private render(): void {
		this.listEl.empty();
		if (this.layers.length === 0) {
			this.listEl.createDiv({ cls: "person-network-layer-empty", text: t("layers.empty") });
			return;
		}
		for (const layer of [...this.layers].sort((a, b) => b.priority - a.priority)) {
			const row = this.listEl.createDiv({ cls: "person-network-layer-row" });
			row.createSpan({ cls: "person-network-layer-row-name", text: layer.name });
			this.addToggle(row, layer.showArea ? "eye" : "eye-off", t("layers.toggleArea"), layer.showArea, (value) => {
				if (value && this.layers.filter((candidate) => candidate.showArea).length >= 2) {
					new Notice(t("layers.limitNotice"));
					return false;
				}
				layer.showArea = value;
				return true;
			});
			this.addToggle(row, layer.showMembers ? "user" : "user-x", t("layers.toggleMembers"), layer.showMembers, (value) => {
				layer.showMembers = value;
			});
		}
	}

	private addToggle(
		row: HTMLElement,
		iconName: string,
		label: string,
		value: boolean,
		setValue: (value: boolean) => boolean | void,
	): void {
		const button = row.createEl("button", {
			cls: `clickable-icon person-network-layer-toggle${value ? " is-active" : ""}`,
			attr: { type: "button", "aria-label": label },
		});
		setIcon(button, iconName);
		button.addEventListener("click", () => {
			if (setValue(!value) === false) return;
			this.onChange(this.layers);
			this.render();
		});
	}
}
