import { describe, expect, it } from "vitest";
import { arrangeOrbitalSystem } from "../src/sim/orbital-layout";
import type { SimNode } from "../src/sim/types";

function node(id: string, targetRadius: number, company?: string): SimNode {
	return { id, x: 0, y: 0, vx: 0, vy: 0, fx: null, fy: null, radius: 26, targetRadius, isCenter: false, company };
}

describe("fixed orbital system", () => {
	it("places every member exactly on its orbit and pins it", () => {
		const nodes = [node("a", 100), node("b", 100), node("c", 200)];
		const rings = arrangeOrbitalSystem(nodes);
		expect(rings).toHaveLength(2);
		for (const item of nodes) {
			const ring = rings.find((candidate) => candidate.nodeIds.includes(item.id));
			expect(Math.hypot(item.x, item.y)).toBeCloseTo(ring!.radius);
			expect(item.fx).toBe(item.x);
			expect(item.fy).toBe(item.y);
		}
	});

	it("keeps employees of one company adjacent on an orbit", () => {
		const nodes = [node("acme-1", 100, "Acme"), node("beta", 100, "Beta"), node("acme-2", 100, "Acme")];
		arrangeOrbitalSystem(nodes);
		const angles = nodes.map((item) => ({ id: item.id, angle: Math.atan2(item.y, item.x) }))
			.sort((left, right) => left.angle - right.angle).map((item) => item.id);
		const first = angles.indexOf("acme-1");
		const second = angles.indexOf("acme-2");
		expect(Math.abs(first - second) === 1 || Math.abs(first - second) === angles.length - 1).toBe(true);
	});

	it("expands crowded rings and keeps neighboring rings apart", () => {
		const nodes = Array.from({ length: 20 }, (_, index) => node(`person-${index}`, 60));
		nodes.push(node("outer", 100));
		const rings = arrangeOrbitalSystem(nodes);
		expect(rings[0].radius).toBeGreaterThan(200);
		expect(rings[1].radius - rings[0].radius).toBeGreaterThanOrEqual(92);
	});
});
