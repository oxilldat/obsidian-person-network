import type { SimNode } from "./types";

export interface GroupCircle {
	id: string;
	x: number;
	y: number;
	radius: number;
}

const NODE_CLEARANCE = 18;

export interface GroupStructure {
	ids: string[];
	membersById: Map<string, SimNode[]>;
	ungrouped: SimNode[];
}

export function buildGroupStructure(nodes: SimNode[]): GroupStructure {
	const ids: string[] = [];
	const membersById = new Map<string, SimNode[]>();
	const ungrouped: SimNode[] = [];
	for (const node of nodes) {
		const memberships = node.layerIds ?? [];
		if (memberships.length === 0) ungrouped.push(node);
		for (const id of memberships) {
			if (!membersById.has(id)) {
				ids.push(id);
				membersById.set(id, []);
			}
			membersById.get(id)?.push(node);
		}
	}
	return { ids, membersById, ungrouped };
}

function capacityRadius(count: number): number {
	return Math.max(160, 90 + Math.sqrt(Math.max(count, 1)) * 58);
}

/** Stable circle geometry shared by rendering and physical constraints. */
export function calculateGroupCircles(nodes: SimNode[], structure = buildGroupStructure(nodes)): GroupCircle[] {
	const ids = structure.ids;
	if (ids.length === 0) return [];
	const radii = ids.map((id) => capacityRadius(structure.membersById.get(id)?.length ?? 0));
	if (ids.length === 1) return [{ id: ids[0], x: 0, y: 0, radius: radii[0] }];

	const layoutRadius = Math.max(...radii) * Math.max(1.15, ids.length / Math.PI);
	const circles = ids.map((id, index) => {
		const angle = -Math.PI / 2 + index * Math.PI * 2 / ids.length;
		return { id, x: Math.cos(angle) * layoutRadius, y: Math.sin(angle) * layoutRadius, radius: radii[index] };
	});
	// Pull circles with shared members together and keep unrelated groups apart.
	for (let pass = 0; pass < 18; pass++) {
		for (let firstIndex = 0; firstIndex < circles.length; firstIndex++) {
			for (let secondIndex = firstIndex + 1; secondIndex < circles.length; secondIndex++) {
				const first = circles[firstIndex];
				const second = circles[secondIndex];
				let shared = 0;
				for (const node of structure.membersById.get(first.id) ?? []) {
					if (node.layerIds?.includes(second.id)) shared += 1;
				}
				const overlap = shared > 0
					? Math.min(Math.min(first.radius, second.radius) * 1.35, 125 + Math.sqrt(shared) * 72)
					: -72;
				const desired = first.radius + second.radius - overlap;
				const dx = second.x - first.x;
				const dy = second.y - first.y;
				const distance = Math.hypot(dx, dy) || 1;
				const correction = (distance - desired) * 0.12;
				const unitX = dx / distance;
				const unitY = dy / distance;
				first.x += unitX * correction / 2;
				first.y += unitY * correction / 2;
				second.x -= unitX * correction / 2;
				second.y -= unitY * correction / 2;
			}
		}
	}
	return circles;
}

function moveToward(current: number, target: number, factor: number, limit: number): number {
	const delta = Math.max(-limit, Math.min(limit, (target - current) * factor));
	return current + delta;
}

/**
 * Lets circles follow their members while limiting every center/radius change.
 * Expansion is faster than contraction, which prevents a boundary from
 * oscillating around a crowded group.
 */
export function updateDynamicGroupCircles(nodes: SimNode[], current: GroupCircle[], structure = buildGroupStructure(nodes)): GroupCircle[] {
	const initial = calculateGroupCircles(nodes, structure);
	const next = initial.map((fallback) => {
		const previous = current.find((circle) => circle.id === fallback.id) ?? fallback;
		const members = structure.membersById.get(fallback.id) ?? [];
		if (members.length === 0) return previous;
		const targetX = members.reduce((sum, node) => sum + node.x, 0) / members.length;
		const targetY = members.reduce((sum, node) => sum + node.y, 0) / members.length;
		const centerX = moveToward(previous.x, targetX, 0.09, 5);
		const centerY = moveToward(previous.y, targetY, 0.09, 5);
		const envelope = Math.max(...members.map((node) =>
			Math.hypot(node.x - centerX, node.y - centerY) + node.radius + 34,
		));
		const minimum = capacityRadius(members.length);
		const targetRadius = Math.max(minimum, envelope);
		const factor = targetRadius > previous.radius ? 0.18 : 0.035;
		const limit = targetRadius > previous.radius ? 7 : 2;
		return {
			id: fallback.id,
			x: centerX,
			y: centerY,
			radius: moveToward(previous.radius, targetRadius, factor, limit),
		};
	});

	for (let firstIndex = 0; firstIndex < next.length; firstIndex++) {
		for (let secondIndex = firstIndex + 1; secondIndex < next.length; secondIndex++) {
			const first = next[firstIndex];
			const second = next[secondIndex];
			let shared = 0;
			for (const node of structure.membersById.get(first.id) ?? []) {
				if (node.layerIds?.includes(second.id)) shared += 1;
			}
			const dx = second.x - first.x;
			const dy = second.y - first.y;
			const distance = Math.hypot(dx, dy) || 1;
			const desiredOverlap = shared > 0 ? 110 + Math.sqrt(shared) * 50 : -60;
			const desiredDistance = first.radius + second.radius - desiredOverlap;
			const correction = Math.max(-2, Math.min(2, (distance - desiredDistance) * 0.035));
			first.x += dx / distance * correction;
			first.y += dy / distance * correction;
			second.x -= dx / distance * correction;
			second.y -= dy / distance * correction;
		}
	}
	return next;
}

/** Soft wall pressure; hard projection below remains the final guarantee. */
export function applyGroupBoundaryForce(nodes: SimNode[], circles: GroupCircle[], alpha: number): void {
	for (const node of nodes) {
		if (node.fx !== null || node.isCenter) continue;
		for (const circle of circles) {
			const belongs = node.layerIds?.includes(circle.id) ?? false;
			const dx = node.x - circle.x;
			const dy = node.y - circle.y;
			const distance = Math.hypot(dx, dy) || 1;
			const unitX = dx / distance;
			const unitY = dy / distance;
			if (belongs) {
				const wall = circle.radius - node.radius - NODE_CLEARANCE;
				const pressureZone = 70;
				if (distance > wall - pressureZone) {
					const push = (distance - (wall - pressureZone)) * 0.09 * alpha;
					node.vx -= unitX * push;
					node.vy -= unitY * push;
				}
			} else {
				const wall = circle.radius + node.radius + NODE_CLEARANCE;
				const pressureZone = 70;
				if (distance < wall + pressureZone) {
					const push = (wall + pressureZone - distance) * 0.11 * alpha;
					node.vx += unitX * push;
					node.vy += unitY * push;
				}
			}
		}

		// Ungrouped people loosely follow the nearest group when they drift far
		// away. The pull stops well before the boundary, where the stronger
		// outward wall pressure takes over.
		if ((node.layerIds?.length ?? 0) === 0 && circles.length > 0) {
			let nearest = circles[0];
			let nearestGap = Number.POSITIVE_INFINITY;
			for (const circle of circles) {
				const candidateGap = Math.hypot(node.x - circle.x, node.y - circle.y) - circle.radius;
				if (candidateGap < nearestGap) { nearest = circle; nearestGap = candidateGap; }
			}
			const dx = nearest.x - node.x;
			const dy = nearest.y - node.y;
			const distance = Math.hypot(dx, dy) || 1;
			const gap = distance - nearest.radius - node.radius;
			if (gap > 90) {
				const pull = Math.min(3, (gap - 90) * 0.015) * alpha;
				node.vx += (dx / distance) * pull;
				node.vy += (dy / distance) * pull;
			}
		}
	}
}

/** Keeps the simulation awake only while an ungrouped person is visibly detached. */
export function hasDistantUngroupedPerson(nodes: SimNode[], circles: GroupCircle[], threshold = 130): boolean {
	if (circles.length === 0) return false;
	return nodes.some((node) => {
		if ((node.layerIds?.length ?? 0) > 0 || node.fx !== null || node.isCenter) return false;
		const nearestGap = Math.min(...circles.map((circle) =>
			Math.hypot(node.x - circle.x, node.y - circle.y) - circle.radius - node.radius,
		));
		return nearestGap > threshold;
	});
}

/** Moves only detached ungrouped people after the main simulation has settled. */
export function advanceDistantUngroupedPeople(
	nodes: SimNode[],
	circles: GroupCircle[],
	maximumStep = 3,
): boolean {
	if (circles.length === 0) return false;
	let moved = false;
	for (const node of nodes) {
		if ((node.layerIds?.length ?? 0) > 0 || node.fx !== null || node.isCenter) continue;
		let nearest = circles[0];
		let nearestGap = Number.POSITIVE_INFINITY;
		for (const circle of circles) {
			const gap = Math.hypot(node.x - circle.x, node.y - circle.y) - circle.radius - node.radius;
			if (gap < nearestGap) { nearest = circle; nearestGap = gap; }
		}
		if (nearestGap <= 112) continue;
		const dx = nearest.x - node.x;
		const dy = nearest.y - node.y;
		const distance = Math.hypot(dx, dy) || 1;
		const step = Math.min(maximumStep, Math.max(0.2, (nearestGap - 112) * 0.08));
		node.x += (dx / distance) * step;
		node.y += (dy / distance) * step;
		node.vx = 0;
		node.vy = 0;
		moved = true;
	}
	if (moved) constrainNodesToGroupCircles(nodes, circles);
	return moved;
}

function direction(node: SimNode, circle: GroupCircle): { x: number; y: number } {
	const dx = node.x - circle.x;
	const dy = node.y - circle.y;
	const distance = Math.hypot(dx, dy);
	if (distance > 0.001) return { x: dx / distance, y: dy / distance };
	let hash = 0;
	for (let index = 0; index < node.id.length; index++) hash = (hash * 31 + node.id.charCodeAt(index)) | 0;
	const angle = (Math.abs(hash) % 360) * Math.PI / 180;
	return { x: Math.cos(angle), y: Math.sin(angle) };
}

/** Enforces exact set membership after each simulation step. */
export function constrainNodesToGroupCircles(nodes: SimNode[], circles = calculateGroupCircles(nodes)): void {
	if (circles.length === 0) return;
	for (const node of nodes) {
		if (node.fx !== null || node.isCenter) continue;
		let corrected = false;
		// Alternating projections converge on intersections of any number of circles.
		for (let pass = 0; pass < Math.max(6, circles.length * 3); pass++) {
			for (const circle of circles) {
				const belongs = node.layerIds?.includes(circle.id) ?? false;
				const dx = node.x - circle.x;
				const dy = node.y - circle.y;
				const distance = Math.hypot(dx, dy);
				const unit = direction(node, circle);
				if (belongs) {
					const maximum = Math.max(1, circle.radius - node.radius - NODE_CLEARANCE);
					if (distance > maximum) {
						node.x = circle.x + unit.x * maximum;
						node.y = circle.y + unit.y * maximum;
						corrected = true;
					}
				} else {
					const minimum = circle.radius + node.radius + NODE_CLEARANCE;
					if (distance < minimum) {
						node.x = circle.x + unit.x * minimum;
						node.y = circle.y + unit.y * minimum;
						corrected = true;
					}
				}
			}
		}
		if (corrected) {
			node.vx *= 0.15;
			node.vy *= 0.15;
		}
	}
}

function place(nodes: SimNode[], x: number, y: number, spread: number): void {
	const ordered = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
	for (let index = 0; index < ordered.length; index++) {
		const angle = -Math.PI / 2 + index * Math.PI * (3 - Math.sqrt(5));
		const radius = Math.min(spread, 72 * Math.sqrt(index));
		ordered[index].x = x + Math.cos(angle) * radius;
		ordered[index].y = y + Math.sin(angle) * radius;
		ordered[index].vx = 0;
		ordered[index].vy = 0;
	}
}

/** Seeds nodes in their valid regions before the force simulation starts. */
export function arrangeGroupCircles(nodes: SimNode[]): boolean {
	const circles = calculateGroupCircles(nodes);
	if (circles.length === 0) return false;
	if (circles.length === 1) {
		const inside = nodes.filter((node) => node.layerIds?.includes(circles[0].id));
		const outside = nodes.filter((node) => !(node.layerIds?.includes(circles[0].id)));
		place(inside, circles[0].x, circles[0].y, circles[0].radius * 0.62);
		place(outside, 0, circles[0].radius + 150, Math.max(80, outside.length * 18));
		constrainNodesToGroupCircles(nodes, circles);
		return true;
	}
	const buckets = new Map<string, SimNode[]>();
	for (const node of nodes) {
		const ids = circles.filter((circle) => node.layerIds?.includes(circle.id)).map((circle) => circle.id).sort();
		const key = ids.join("|");
		const bucket = buckets.get(key) ?? [];
		bucket.push(node);
		buckets.set(key, bucket);
	}
	for (const [key, bucket] of buckets) {
		const ids = key ? key.split("|") : [];
		if (ids.length === 0) continue;
		const relevant = circles.filter((circle) => ids.includes(circle.id));
		const x = relevant.reduce((sum, circle) => sum + circle.x, 0) / relevant.length;
		const y = relevant.reduce((sum, circle) => sum + circle.y, 0) / relevant.length;
		place(bucket, x, y, Math.min(...relevant.map((circle) => circle.radius)) * (ids.length > 1 ? 0.2 : 0.5));
	}
	const outside = buckets.get("") ?? [];
	const bottom = Math.max(...circles.map((circle) => circle.y + circle.radius));
	place(outside, 0, bottom + 150, Math.max(100, outside.length * 24));
	constrainNodesToGroupCircles(nodes, circles);
	return true;
}
