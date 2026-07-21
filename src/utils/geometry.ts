export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function distance(ax: number, ay: number, bx: number, by: number): number {
	const dx = bx - ax;
	const dy = by - ay;
	return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
	const dx = bx - ax;
	const dy = by - ay;
	return dx * dx + dy * dy;
}

/** Starts slow and accelerates — used for layout warm-up and node pop-in. */
export function easeInCubic(t: number): number {
	return t * t * t;
}

/** Starts fast and decelerates — used for camera tweens. */
export function easeOutCubic(t: number): number {
	const inv = 1 - t;
	return 1 - inv * inv * inv;
}
