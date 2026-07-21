export interface Pickable {
	id: string;
	x: number;
	y: number;
	radius: number;
}

/** Hit-tests a world-space point against the last-drawn node list — no DOM elements involved. */
export function pickNode(pickables: Pickable[], worldX: number, worldY: number): string | undefined {
	for (let i = pickables.length - 1; i >= 0; i--) {
		const node = pickables[i];
		const dx = worldX - node.x;
		const dy = worldY - node.y;
		if (dx * dx + dy * dy <= node.radius * node.radius) return node.id;
	}
	return undefined;
}
