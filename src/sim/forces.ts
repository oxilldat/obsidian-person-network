import type { SimLink, SimNode } from "./types";
import type { SpatialGrid } from "./spatial-grid";

const MIN_DISTANCE_SQ = 0.01;

/** Spring force pulling linked nodes toward a resting distance apart. */
export function applyLinkForce(
	links: SimLink[],
	restingDistance: number,
	alpha: number,
	strength = 0.5,
): void {
	for (const link of links) {
		const { source, target } = link;
		const dx = target.x - source.x;
		const dy = target.y - source.y;
		const dist = Math.sqrt(dx * dx + dy * dy) || 1;
		const pull = ((dist - restingDistance) / dist) * alpha * strength;

		if (source.fx === null) {
			source.vx += dx * pull;
			source.vy += dy * pull;
		}
		if (target.fx === null) {
			target.vx -= dx * pull;
			target.vy -= dy * pull;
		}
	}
}

/** Coulomb-like pairwise repulsion so nodes don't overlap, using the spatial grid as broad phase. */
export function applyRepulsionForce(
	nodes: SimNode[],
	grid: SpatialGrid,
	strength: number,
	alpha: number,
): void {
	for (const node of nodes) {
		if (node.fx !== null) continue;
		const neighbors = grid.queryNear(node.x, node.y);
		for (const other of neighbors) {
			if (other === node) continue;
			const dx = node.x - other.x;
			const dy = node.y - other.y;
			const distSq = Math.max(dx * dx + dy * dy, MIN_DISTANCE_SQ);
			const dist = Math.sqrt(distSq);
			const push = (strength * alpha) / distSq;
			node.vx += (dx / dist) * push;
			node.vy += (dy / dist) * push;
		}
	}
}

/** Keeps the overall cloud of nodes centered on (centerX, centerY). */
export function applyCenterForce(
	nodes: SimNode[],
	centerX: number,
	centerY: number,
	alpha: number,
	strength = 0.05,
): void {
	if (nodes.length === 0) return;
	let sumX = 0;
	let sumY = 0;
	for (const node of nodes) {
		sumX += node.x;
		sumY += node.y;
	}
	const offsetX = sumX / nodes.length - centerX;
	const offsetY = sumY / nodes.length - centerY;

	for (const node of nodes) {
		if (node.fx !== null) continue;
		node.vx -= offsetX * strength * alpha;
		node.vy -= offsetY * strength * alpha;
	}
}

/** Pulls each node toward its own targetRadius from the center (positionScore-driven placement). */
export function applyRadialPositionForce(
	nodes: SimNode[],
	centerX: number,
	centerY: number,
	alpha: number,
): void {
	for (const node of nodes) {
		if (node.fx !== null || node.isCenter) continue;
		const dx = node.x - centerX;
		const dy = node.y - centerY;
		const dist = Math.sqrt(dx * dx + dy * dy) || 1;
		const diff = dist - node.targetRadius;
		const strength = alpha * 0.12;
		node.vx -= (dx / dist) * diff * strength;
		node.vy -= (dy / dist) * diff * strength;
	}
}

/** Keeps node circles (and their labels) from overlapping, so text stays legible. */
export function applyCollisionForce(
	nodes: SimNode[],
	grid: SpatialGrid,
	alpha: number,
	padding = 34,
): void {
	for (const node of nodes) {
		const neighbors = grid.queryNear(node.x, node.y);
		for (const other of neighbors) {
			if (other === node) continue;
			const minDist = node.radius + other.radius + padding;
			const dx = node.x - other.x;
			const dy = node.y - other.y;
			const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
			if (dist >= minDist) continue;
			const overlap = ((minDist - dist) / dist) * alpha * 0.5;
			const pushX = dx * overlap;
			const pushY = dy * overlap;
			if (node.fx === null) {
				node.vx += pushX;
				node.vy += pushY;
			}
			if (other.fx === null) {
				other.vx -= pushX;
				other.vy -= pushY;
			}
		}
	}
}
