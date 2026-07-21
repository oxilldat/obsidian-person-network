export class Tooltip {
	private readonly el: HTMLElement;

	constructor(container: HTMLElement) {
		this.el = container.createDiv({ cls: "person-network-tooltip" });
		this.hide();
	}

	show(lines: string[], screenX: number, screenY: number): void {
		this.el.empty();
		for (const line of lines) this.el.createDiv({ text: line });
		this.el.style.left = `${screenX + 14}px`;
		this.el.style.top = `${screenY - 10}px`;
		this.el.style.display = "block";
	}

	hide(): void {
		this.el.style.display = "none";
	}

	destroy(): void {
		this.el.remove();
	}
}
