import { clamp } from "../utils/geometry";

/**
 * Screen <-> world transform for the canvas: `x`/`y` are the screen
 * coordinates the world origin maps to, `scale` is zoom level.
 */
export class Camera {
	scale = 1;
	x = 0;
	y = 0;
	readonly minScale = 0.2;
	readonly maxScale = 5;

	reset(screenCenterX: number, screenCenterY: number): void {
		this.scale = 1;
		this.x = screenCenterX;
		this.y = screenCenterY;
	}

	toWorld(screenX: number, screenY: number): { x: number; y: number } {
		return { x: (screenX - this.x) / this.scale, y: (screenY - this.y) / this.scale };
	}

	toScreen(worldX: number, worldY: number): { x: number; y: number } {
		return { x: worldX * this.scale + this.x, y: worldY * this.scale + this.y };
	}

	pan(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
	}

	/** Zooms by `factor`, keeping the world point currently under (screenX, screenY) fixed on screen. */
	zoomAt(screenX: number, screenY: number, factor: number): void {
		const worldBefore = this.toWorld(screenX, screenY);
		this.scale = clamp(this.scale * factor, this.minScale, this.maxScale);
		this.x = screenX - worldBefore.x * this.scale;
		this.y = screenY - worldBefore.y * this.scale;
	}

	/** Camera state that fits the given world bounds into a viewport with padding on all sides. */
	computeFit(
		bounds: { minX: number; minY: number; maxX: number; maxY: number },
		viewportWidth: number,
		viewportHeight: number,
		padding: number,
	): { scale: number; x: number; y: number } {
		const worldWidth = Math.max(bounds.maxX - bounds.minX, 1);
		const worldHeight = Math.max(bounds.maxY - bounds.minY, 1);
		const scale = clamp(
			Math.min(
				(viewportWidth - padding * 2) / worldWidth,
				(viewportHeight - padding * 2) / worldHeight,
			),
			this.minScale,
			this.maxScale,
		);
		const centerX = (bounds.minX + bounds.maxX) / 2;
		const centerY = (bounds.minY + bounds.maxY) / 2;
		return {
			scale,
			x: viewportWidth / 2 - centerX * scale,
			y: viewportHeight / 2 - centerY * scale,
		};
	}
}
