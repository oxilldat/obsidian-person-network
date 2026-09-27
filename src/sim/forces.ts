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
		const strength = alpha * 0.08;
		node.vx -= (dx / dist) * diff * strength;
		node.vy -= (dy / dist) * diff * strength;
	}
}

/** Softly pulls people sharing a company toward that company's moving centroid. */
export function applyCompanyForce(nodes: SimNode[], alpha: number, strength: number): void {
	if (strength <= 0) return;
	const groups = new Map<string, { x: number; y: number; count: number }>();
	for (const node of nodes) {
		const company = node.company?.trim();
		if (!company || company === "-") continue;
		const group = groups.get(company) ?? { x: 0, y: 0, count: 0 };
		group.x += node.x;
		group.y += node.y;
		group.count += 1;
		groups.set(company, group);
	}
	for (const node of nodes) {
		if (node.fx !== null || !node.company) continue;
		const group = groups.get(node.company.trim());
		if (!group || group.count < 2) continue;
		node.vx += (group.x / group.count - node.x) * strength * alpha;
		node.vy += (group.y / group.count - node.y) * strength * alpha;
	}
}

/** Softly compacts members; exact circle membership is enforced after integration. */
export function applyLayerForce(
	nodes: SimNode[],
	alpha: number,
	cohesion = 0.07,
): void {
	const groups = new Map<string, SimNode[]>();
	for (const node of nodes) {
		for (const layerId of node.layerIds ?? []) {
			const group = groups.get(layerId) ?? [];
			group.push(node);
			groups.set(layerId, group);
		}
	}
	for (const members of groups.values()) {
		if (members.length < 2) continue;
		const centroidX = members.reduce((sum, node) => sum + node.x, 0) / members.length;
		const centroidY = members.reduce((sum, node) => sum + node.y, 0) / members.length;
		for (const member of members) {
			if (member.fx !== null) continue;
			member.vx += (centroidX - member.x) * cohesion * alpha;
			member.vy += (centroidY - member.y) * cohesion * alpha;
		}
	}
}

/** Keeps node circles (and their labels) from overlapping, so text stays legible. */
export function applyCollisionForce(
	nodes: SimNode[],
	grid: SpatialGrid,
	alpha: number,
	padding = 34,
): void {
	const indices = new Map(nodes.map((node, index) => [node, index]));
	for (const node of nodes) {
		const neighbors = grid.queryNear(node.x, node.y);
		for (const other of neighbors) {
			if ((indices.get(other) ?? -1) <= (indices.get(node) ?? -1)) continue;
			const minDist = node.radius + other.radius + padding;
			let dx = node.x - other.x;
			let dy = node.y - other.y;
			let dist = Math.hypot(dx, dy);
			if (dist < 0.001) {
				// A zero vector cannot produce a separating force. Pick a stable
				// direction so identical initial positions always split apart.
				let hash = 0;
				const pair = `${node.id}\0${other.id}`;
				for (let index = 0; index < pair.length; index++) hash = (hash * 31 + pair.charCodeAt(index)) | 0;
				const angle = (Math.abs(hash) % 360) * Math.PI / 180;
				dx = Math.cos(angle) * 0.001;
				dy = Math.sin(angle) * 0.001;
				dist = 0.001;
			}
			if (dist >= minDist) continue;
			const movable = Number(node.fx === null) + Number(other.fx === null);
			if (movable === 0) continue;
			const overlap = ((minDist - dist) / dist) * alpha / movable;
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
