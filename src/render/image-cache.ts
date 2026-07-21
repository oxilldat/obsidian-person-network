import { TFile, type App } from "obsidian";

/** Nodes render into ~52px squares; decoding photos larger than this wastes memory. */
const MAX_BITMAP_SIZE = 128;

/**
 * Decodes vault photos into ImageBitmaps exactly once per path, using
 * `vault.getResourcePath()` (a local resource URL Obsidian already serves)
 * instead of reading the file's binary and re-encoding it as base64. Photos
 * are downscaled to MAX_BITMAP_SIZE on decode, and paths that fail to load
 * are remembered so the renderer stops re-requesting them every frame.
 */
export class ImageCache {
	private readonly app: App;
	private readonly bitmaps = new Map<string, ImageBitmap>();
	private readonly pending = new Map<string, Promise<ImageBitmap | undefined>>();
	private readonly failed = new Set<string>();

	constructor(app: App) {
		this.app = app;
	}

	get(path: string): ImageBitmap | undefined {
		return this.bitmaps.get(path);
	}

	/** True once a path has failed to decode — the caller should stop retrying it. */
	hasFailed(path: string): boolean {
		return this.failed.has(path);
	}

	invalidate(path: string): void {
		this.bitmaps.get(path)?.close();
		this.bitmaps.delete(path);
		this.pending.delete(path);
		this.failed.delete(path);
	}

	/** Frees every decoded bitmap — call when the owning view closes. */
	clear(): void {
		for (const bitmap of this.bitmaps.values()) bitmap.close();
		this.bitmaps.clear();
		this.pending.clear();
		this.failed.clear();
	}

	load(path: string): Promise<ImageBitmap | undefined> {
		const cached = this.bitmaps.get(path);
		if (cached) return Promise.resolve(cached);
		if (this.failed.has(path)) return Promise.resolve(undefined);

		const pending = this.pending.get(path);
		if (pending) return pending;

		const promise = this.decode(path).then((bitmap) => {
			this.pending.delete(path);
			if (bitmap) this.bitmaps.set(path, bitmap);
			else this.failed.add(path);
			return bitmap;
		});
		this.pending.set(path, promise);
		return promise;
	}

	private async decode(path: string): Promise<ImageBitmap | undefined> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) return undefined;

		try {
			// Read through the vault API rather than fetching the resource URL.
			const buffer = await this.app.vault.readBinary(file);
			return await this.decodeBlob(new Blob([buffer]));
		} catch {
			return undefined;
		}
	}

	private async decodeBlob(blob: Blob): Promise<ImageBitmap> {
		// Probe intrinsic size first, then re-decode downscaled while keeping aspect.
		const probe = await createImageBitmap(blob);
		const { width, height } = probe;
		const longest = Math.max(width, height);
		if (longest <= MAX_BITMAP_SIZE) return probe;

		const scale = MAX_BITMAP_SIZE / longest;
		probe.close();
		return createImageBitmap(blob, {
			resizeWidth: Math.round(width * scale),
			resizeHeight: Math.round(height * scale),
			resizeQuality: "high",
		});
	}
}
