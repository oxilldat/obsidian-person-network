/**
 * Because rendering is already canvas-native, exporting is just reading the
 * canvas back out — no SVG clone/serialize/rasterize step is needed here.
 */
export function exportCanvasAsPng(canvas: HTMLCanvasElement): Promise<Blob | null> {
	return new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob), "image/png");
	});
}
