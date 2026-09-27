import { beforeEach, describe, expect, it, vi } from "vitest";
import { type App, TFile } from "obsidian";
import { openPhotoCropEditor } from "../src/photo/crop-photo";

const modalState = vi.hoisted(() => ({ instance: null as any, notices: [] as string[], decode: vi.fn() }));

vi.mock("obsidian", () => {
	class Element {
		children: Element[] = [];
		events = new Map<string, () => void>();
		disabled = false;
		width = 420;
		height = 420;
		win = { devicePixelRatio: 1, createImageBitmap: modalState.decode };
		constructor(readonly tag = "div", readonly options: { cls?: string; text?: string } = {}) {}
		addClass() {}
		setText() {}
		createEl(tag: string, options = {}) { const child = new Element(tag, options); this.children.push(child); return child; }
		createDiv(options = {}) { return this.createEl("div", options); }
		addEventListener(event: string, callback: () => void) { this.events.set(event, callback); }
		empty() { this.children = []; }
		getContext() { return { setTransform() {}, clearRect() {}, drawImage() {} }; }
	}
	class Modal {
		modalEl = new Element();
		titleEl = new Element();
		contentEl = new Element();
		opening: Promise<void> = Promise.resolve();
		constructor(readonly app: App) { modalState.instance = this; }
		open() { this.opening = this.onOpen(); }
		close() { this.onClose(); }
		async onOpen() {}
		onClose() {}
	}
	class Setting {
		setName() { return this; }
		addSlider(callback: (slider: unknown) => void) {
			const slider = { setLimits() { return this; }, setValue() { return this; }, onChange() { return this; } };
			callback(slider);
			return this;
		}
	}
	return { Modal, Setting, TFile: class {}, Notice: class { constructor(text: string) { modalState.notices.push(text); } } };
});

vi.mock("../src/i18n", () => ({ t: (key: string) => key }));

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => { resolve = done; });
	return { promise, resolve };
}

function open(readBinary: () => Promise<ArrayBuffer>, save = vi.fn().mockResolvedValue(undefined)) {
	const app = { vault: { getAbstractFileByPath: () => new TFile(), readBinary } } as unknown as App;
	openPhotoCropEditor(app, "photo.png", { zoom: 1, centerX: 0.5, centerY: 0.5 }, save);
	return modalState.instance;
}

beforeEach(() => { modalState.instance = null; modalState.notices = []; modalState.decode.mockReset(); });

describe("photo editor lifecycle", () => {
	it("does not decode or rebuild a modal closed while its file was loading", async () => {
		const read = deferred<ArrayBuffer>();
		const modal = open(() => read.promise);
		modal.close();
		read.resolve(new ArrayBuffer(0));
		await modal.opening;
		expect(modalState.decode).not.toHaveBeenCalled();
		expect(modal.contentEl.children).toHaveLength(0);
	});

	it("closes a bitmap that finishes decoding after the modal was closed", async () => {
		const decode = deferred<ImageBitmap>();
		modalState.decode.mockReturnValue(decode.promise);
		const modal = open(async () => new ArrayBuffer(0));
		await Promise.resolve();
		expect(modalState.decode).toHaveBeenCalledOnce();
		modal.close();
		const bitmap = { width: 400, height: 300, close: vi.fn() } as unknown as ImageBitmap;
		decode.resolve(bitmap);
		await modal.opening;
		expect(bitmap.close).toHaveBeenCalledOnce();
		expect(modal.contentEl.children).toHaveLength(0);
	});

	it("submits only once while saving the same crop", async () => {
		const bitmap = { width: 400, height: 300, close: vi.fn() } as unknown as ImageBitmap;
		modalState.decode.mockResolvedValue(bitmap);
		const saving = deferred<void>();
		const save = vi.fn(() => saving.promise);
		const modal = open(async () => new ArrayBuffer(0), save);
		await modal.opening;
		const buttons = modal.contentEl.children.find((child: any) => child.options.cls === "person-network-modal-buttons");
		const button = buttons.children.find((child: any) => child.options.cls === "mod-cta");
		button.events.get("click")();
		button.events.get("click")();
		expect(button.disabled).toBe(true);
		expect(save).toHaveBeenCalledOnce();
		saving.resolve();
		await saving.promise;
		expect(bitmap.close).toHaveBeenCalledOnce();
	});
});
