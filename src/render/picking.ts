export interface Pickable {
	id: string;
	x: number;
	y: number;
	radius: number;
}

export interface CompanyPickable {
	company: string;
	x: number;
	y: number;
	width: number;
	height: number;
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

export function pickCompany(pickables: CompanyPickable[], worldX: number, worldY: number): string | undefined {
	for (let index = pickables.length - 1; index >= 0; index--) {
		const area = pickables[index];
		if (
			worldX >= area.x && worldX <= area.x + area.width &&
			worldY >= area.y && worldY <= area.y + area.height
		) return area.company;
	}
	return undefined;
}

export function connectedNodeIds(
	links: Array<{ source: { id: string }; target: { id: string } }>,
	nodeId: string,
): Set<string> {
	const connected = new Set<string>([nodeId]);
	for (const link of links) {
		if (link.source.id === nodeId) connected.add(link.target.id);
		if (link.target.id === nodeId) connected.add(link.source.id);
	}
	return connected;
}
