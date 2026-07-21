import type { SimNode } from "./types";

/**
 * Uniform-grid broad phase for repulsion neighbor queries. Cheap to rebuild
 * every tick and avoids O(n^2) pair checks once the graph grows past ~150-200
 * nodes, without the implementation/verification cost of a quadtree.
 */
export class SpatialGrid {
	private readonly cellSize: number;
	private buckets = new Map<string, SimNode[]>();

	constructor(cellSize: number) {
		this.cellSize = cellSize;
	}

	private key(cellX: number, cellY: number): string {
		return `${cellX}:${cellY}`;
	}

	rebuild(nodes: SimNode[]): void {
		this.buckets = new Map();
		for (const node of nodes) {
			const cellX = Math.floor(node.x / this.cellSize);
			const cellY = Math.floor(node.y / this.cellSize);
			const key = this.key(cellX, cellY);
			const bucket = this.buckets.get(key);
			if (bucket) bucket.push(node);
			else this.buckets.set(key, [node]);
		}
	}

	/** Returns nodes in the 3x3 block of cells around (x, y) — a superset of true neighbors. */
	queryNear(x: number, y: number): SimNode[] {
		const cellX = Math.floor(x / this.cellSize);
		const cellY = Math.floor(y / this.cellSize);
		const result: SimNode[] = [];
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const bucket = this.buckets.get(this.key(cellX + dx, cellY + dy));
				if (bucket) result.push(...bucket);
			}
		}
		return result;
	}
}
