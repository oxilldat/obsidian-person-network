import { afterEach, describe, expect, it, vi } from "vitest";
import { TFile, type App } from "obsidian";
import { ImageCache } from "../src/render/image-cache";

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => { resolve = done; });
	return { promise, resolve };
}

function bitmap(width = 640, height = 480): ImageBitmap {
	return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}

function setup() {
	const reads: ReturnType<typeof deferred<ArrayBuffer>>[] = [];
	const app = {
		vault: {
			getAbstractFileByPath: () => new TFile(),
			readBinary: vi.fn(() => {
				const read = deferred<ArrayBuffer>();
				reads.push(read);
				return read.promise;
			}),
		},
	} as unknown as App;
	return { cache: new ImageCache(app), reads };
}

afterEach(() => vi.unstubAllGlobals());

describe("photo image cache", () => {
	it("does not discard another photo when one pending path is invalidated", async () => {
		const { cache, reads } = setup();
		const first = bitmap();
		const second = bitmap();
		vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second));
		const loadingFirst = cache.load("a.png");
		const loadingSecond = cache.load("b.png");
		cache.invalidate("a.png");
		reads[0].resolve(new ArrayBuffer(0));
		reads[1].resolve(new ArrayBuffer(0));
		expect(await loadingFirst).toBeUndefined();
		expect(await loadingSecond).toBe(second);
		expect(first.close).toHaveBeenCalledOnce();
		expect(second.close).not.toHaveBeenCalled();
		expect(cache.get("b.png")).toBe(second);
	});

	it("keeps the new request when an invalidated photo finishes later", async () => {
		const { cache, reads } = setup();
		const fresh = bitmap();
		const stale = bitmap();
		vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValueOnce(fresh).mockResolvedValueOnce(stale));
		const oldRequest = cache.load("a.png");
		cache.invalidate("a.png");
		const newRequest = cache.load("a.png");
		reads[1].resolve(new ArrayBuffer(0));
		expect(await newRequest).toBe(fresh);
		reads[0].resolve(new ArrayBuffer(0));
		expect(await oldRequest).toBeUndefined();
		expect(cache.get("a.png")).toBe(fresh);
		expect(stale.close).toHaveBeenCalledOnce();
		expect(fresh.close).not.toHaveBeenCalled();
	});

	it("frees pending bitmaps after clearing the cache", async () => {
		const { cache, reads } = setup();
		const image = bitmap();
		vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(image));
		const request = cache.load("a.png");
		expect(cache.load("a.png")).toBe(request);
		cache.clear();
		reads[0].resolve(new ArrayBuffer(0));
		expect(await request).toBeUndefined();
		expect(image.close).toHaveBeenCalledOnce();
		expect(cache.get("a.png")).toBeUndefined();
	});

	it("never requests a zero-pixel dimension when downscaling a panorama", async () => {
		const { cache, reads } = setup();
		const probe = bitmap(8192, 1);
		const resized = bitmap(1024, 1);
		const decode = vi.fn().mockResolvedValueOnce(probe).mockResolvedValueOnce(resized);
		vi.stubGlobal("createImageBitmap", decode);
		const request = cache.load("panorama.png");
		reads[0].resolve(new ArrayBuffer(0));
		expect(await request).toBe(resized);
		expect(decode.mock.calls[1][1]).toMatchObject({ resizeWidth: 1024, resizeHeight: 1 });
		expect(probe.close).toHaveBeenCalledOnce();
	});
});
