import type { SimNode } from "./types";

const MIN_ORBIT_GAP = 92;
const MIN_ARC_PER_NODE = 88;
const COMPANY_GAP_UNITS = 0.65;

export interface OrbitRing {
	radius: number;
	targetRadius: number;
	nodeIds: string[];
}

function companyKey(node: SimNode): string {
	const company = node.company?.trim();
	return company && company !== "-" ? company : "\uffff";
}

/**
 * Places nodes on fixed concentric orbits. Companies form neighboring arcs on
 * the same orbit; no force simulation participates in the result.
 */
export function arrangeOrbitalSystem(nodes: SimNode[], centerX = 0, centerY = 0): OrbitRing[] {
	const byTarget = new Map<number, SimNode[]>();
	for (const node of nodes) {
		if (node.isCenter) continue;
		const target = Math.round(node.targetRadius);
		const ring = byTarget.get(target) ?? [];
		ring.push(node);
		byTarget.set(target, ring);
	}

	let previousRadius = 0;
	const rings: OrbitRing[] = [];
	for (const [targetRadius, members] of [...byTarget.entries()].sort(([left], [right]) => left - right)) {
		const groups = new Map<string, SimNode[]>();
		for (const member of members) {
			const key = companyKey(member);
			const group = groups.get(key) ?? [];
			group.push(member);
			groups.set(key, group);
		}
		const orderedGroups = [...groups.entries()]
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([, group]) => group.sort((left, right) => left.id.localeCompare(right.id)));
		const unitCount = members.length + Math.max(orderedGroups.length - 1, 0) * COMPANY_GAP_UNITS;
		const capacityRadius = unitCount <= 1 ? 0 : unitCount * MIN_ARC_PER_NODE / (Math.PI * 2);
		const radius = Math.max(targetRadius, capacityRadius, previousRadius + (previousRadius > 0 ? MIN_ORBIT_GAP : 0));
		previousRadius = radius;

		if (members.length === 1) {
			const member = members[0];
			member.x = centerX;
			member.y = centerY - radius;
			member.fx = member.x;
			member.fy = member.y;
		} else {
			const step = Math.PI * 2 / unitCount;
			let cursor = -Math.PI / 2 / step;
			for (let groupIndex = 0; groupIndex < orderedGroups.length; groupIndex++) {
				for (const member of orderedGroups[groupIndex]) {
					const angle = (cursor + 0.5) * step;
					member.x = centerX + Math.cos(angle) * radius;
					member.y = centerY + Math.sin(angle) * radius;
					member.fx = member.x;
					member.fy = member.y;
					member.vx = 0;
					member.vy = 0;
					cursor += 1;
				}
				if (groupIndex < orderedGroups.length - 1) cursor += COMPANY_GAP_UNITS;
			}
		}
		rings.push({ radius, targetRadius, nodeIds: members.map((member) => member.id) });
	}
	return rings;
}
