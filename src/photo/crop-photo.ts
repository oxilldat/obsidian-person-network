import { Modal, Notice, Setting, TFile, type App } from "obsidian";
import { t } from "../i18n";
import type { PhotoCropSettings } from "../data/types";

const PREVIEW_SIZE = 420;

class PhotoCropModal extends Modal {
	private bitmap: ImageBitmap | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private zoom = 1;
	private offsetX = 0;
	private offsetY = 0;
	private dragging = false;
	private lastPointer = { x: 0, y: 0 };

	constructor(
		app: App,
		private readonly file: TFile,
		private readonly initial: PhotoCropSettings,
		private readonly onSaved: (settings: PhotoCropSettings) => Promise<void>,
	) {
		super(app);
		this.zoom = initial.zoom;
	}

	override async onOpen(): Promise<void> {
		this.modalEl.addClass("person-network-crop-modal");
		this.titleEl.setText(t("photo.editorTitle"));
		this.contentEl.createEl("p", { cls: "person-network-crop-hint", text: t("photo.editorHint") });
		try {
			this.bitmap = await createImageBitmap(new Blob([await this.app.vault.readBinary(this.file)]));
		} catch {
			this.close();
			return;
		}

		const stage = this.contentEl.createDiv({ cls: "person-network-crop-stage" });
		this.canvas = stage.createEl("canvas", { cls: "person-network-crop-canvas" });
		const ratio = this.modalEl.win.devicePixelRatio || 1;
		this.canvas.width = Math.round(PREVIEW_SIZE * ratio);
		this.canvas.height = Math.round(PREVIEW_SIZE * ratio);
		this.restorePosition();

		this.canvas.addEventListener("pointerdown", (event) => {
			if (event.button !== 0) return;
			this.dragging = true;
			this.lastPointer = { x: event.clientX, y: event.clientY };
			this.canvas?.setPointerCapture(event.pointerId);
		});
		this.canvas.addEventListener("pointermove", (event) => {
			if (!this.dragging) return;
			const coordinateScale = PREVIEW_SIZE / this.canvas!.getBoundingClientRect().width;
			this.offsetX += (event.clientX - this.lastPointer.x) * coordinateScale;
			this.offsetY += (event.clientY - this.lastPointer.y) * coordinateScale;
			this.lastPointer = { x: event.clientX, y: event.clientY };
			this.clampOffset();
			this.render();
		});
		const finishDrag = (): void => { this.dragging = false; };
		this.canvas.addEventListener("pointerup", finishDrag);
		this.canvas.addEventListener("pointercancel", finishDrag);

		new Setting(this.contentEl).setName(t("photo.zoom")).addSlider((slider) => slider
			.setLimits(1, 4, 0.05).setValue(this.zoom).onChange((value) => this.setZoom(value)));

		const buttons = this.contentEl.createDiv({ cls: "person-network-modal-buttons" });
		buttons.createEl("button", { text: t("common.cancel") }).addEventListener("click", () => this.close());
		buttons.createEl("button", { text: t("photo.saveCrop"), cls: "mod-cta" }).addEventListener("click", () => void this.save());
	}

	private baseScale(): number {
		if (!this.bitmap) return 1;
		return Math.max(PREVIEW_SIZE / this.bitmap.width, PREVIEW_SIZE / this.bitmap.height);
	}

	private restorePosition(): void {
		if (!this.bitmap) return;
		const scale = this.baseScale() * this.zoom;
		this.offsetX = PREVIEW_SIZE / 2 - this.initial.centerX * this.bitmap.width * scale;
		this.offsetY = PREVIEW_SIZE / 2 - this.initial.centerY * this.bitmap.height * scale;
		this.clampOffset();
		this.render();
	}

	private setZoom(next: number): void {
		if (!this.bitmap) return;
		const oldScale = this.baseScale() * this.zoom;
		const imageCenterX = (PREVIEW_SIZE / 2 - this.offsetX) / oldScale;
		const imageCenterY = (PREVIEW_SIZE / 2 - this.offsetY) / oldScale;
		this.zoom = next;
		const scale = this.baseScale() * this.zoom;
		this.offsetX = PREVIEW_SIZE / 2 - imageCenterX * scale;
		this.offsetY = PREVIEW_SIZE / 2 - imageCenterY * scale;
		this.clampOffset();
		this.render();
	}

	private clampOffset(): void {
		if (!this.bitmap) return;
		const scale = this.baseScale() * this.zoom;
		this.offsetX = Math.min(0, Math.max(PREVIEW_SIZE - this.bitmap.width * scale, this.offsetX));
		this.offsetY = Math.min(0, Math.max(PREVIEW_SIZE - this.bitmap.height * scale, this.offsetY));
	}

	private render(): void {
		if (!this.bitmap || !this.canvas) return;
		const ctx = this.canvas.getContext("2d");
		if (!ctx) return;
		const ratio = this.canvas.width / PREVIEW_SIZE;
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
		const scale = this.baseScale() * this.zoom;
		ctx.drawImage(this.bitmap, this.offsetX, this.offsetY, this.bitmap.width * scale, this.bitmap.height * scale);
	}

	private async save(): Promise<void> {
		if (!this.bitmap) return;
		try {
			const scale = this.baseScale() * this.zoom;
			await this.onSaved({
				centerX: (PREVIEW_SIZE / 2 - this.offsetX) / scale / this.bitmap.width,
				centerY: (PREVIEW_SIZE / 2 - this.offsetY) / scale / this.bitmap.height,
				zoom: this.zoom,
			});
			this.close();
		} catch {
			new Notice(t("photo.cropFailed"));
		}
	}

	override onClose(): void {
		this.bitmap?.close();
		this.bitmap = null;
		this.contentEl.empty();
	}
}

export function openPhotoCropEditor(
	app: App,
	path: string,
	initial: PhotoCropSettings,
	onSaved: (settings: PhotoCropSettings) => Promise<void>,
): void {
	const file = app.vault.getAbstractFileByPath(path);
	if (file instanceof TFile) new PhotoCropModal(app, file, initial, onSaved).open();
}
