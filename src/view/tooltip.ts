export interface TooltipData {
	lines: string[];
	groups?: Array<{ name: string; color: string }>;
}

export class Tooltip {
	private readonly el: HTMLElement;

	constructor(container: HTMLElement) {
		this.el = container.createDiv({ cls: "person-network-tooltip" });
		this.hide();
	}

	show(data: TooltipData, screenX: number, screenY: number): void {
		this.el.empty();
		for (const line of data.lines) this.el.createDiv({ text: line });
		if (data.groups?.length) {
			const groups = this.el.createDiv({ cls: "person-network-tooltip-groups" });
			for (const group of data.groups) {
				const pill = groups.createSpan({ cls: "person-network-tooltip-group", text: group.name });
				pill.style.borderColor = group.color;
			}
		}
		this.el.setCssStyles({
			left: `${screenX + 14}px`,
			top: `${screenY - 10}px`,
			display: "block",
		});
	}

	hide(): void {
		this.el.setCssStyles({ display: "none" });
	}

	destroy(): void {
		this.el.remove();
	}
}
