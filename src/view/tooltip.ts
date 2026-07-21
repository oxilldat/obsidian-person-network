export class Tooltip {
	private readonly el: HTMLElement;

	constructor(container: HTMLElement) {
		this.el = container.createDiv({ cls: "person-network-tooltip" });
		this.hide();
	}

	show(lines: string[], screenX: number, screenY: number): void {
		this.el.empty();
		for (const line of lines) this.el.createDiv({ text: line });
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
