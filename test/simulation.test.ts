import { describe, expect, it } from "vitest";
import { Simulation } from "../src/sim/simulation";
import type { SimNode } from "../src/sim/types";
import { applyCompanyForce, applyLayerForce } from "../src/sim/forces";
import {
	arrangeGroupCircles,
	applyGroupBoundaryForce,
	calculateGroupCircles,
	constrainNodesToGroupCircles,
	updateDynamicGroupCircles,
} from "../src/sim/group-layout";

function node(id: string, x: number, y: number, overrides: Partial<SimNode> = {}): SimNode {
	return {
		id,
		x,
		y,
		vx: 0,
		vy: 0,
		fx: null,
		fy: null,
		radius: 26,
		targetRadius: 200,
		isCenter: false,
		...overrides,
	};
}

describe("Simulation", () => {
	it("pulls coworkers toward their shared centroid without moving singletons", () => {
		const left = node("left", -100, 0, { company: "Acme" });
		const right = node("right", 100, 0, { company: "Acme" });
		const singleton = node("single", 200, 0, { company: "Solo" });
		applyCompanyForce([left, right, singleton], 1, 0.1);
		expect(left.vx).toBeGreaterThan(0);
		expect(right.vx).toBeLessThan(0);
		expect(singleton.vx).toBe(0);
	});

	it("pulls group members together without assigning outsiders to the group", () => {
		const left = node("left", -80, 0, { layerIds: ["team"] });
		const right = node("right", 80, 0, { layerIds: ["team"] });
		const outsider = node("outsider", 0, 0);
		applyLayerForce([left, right, outsider], 1);
		expect(right.vx).toBeLessThan(0);
		expect(right.vx - left.vx).toBeLessThan(0);
		expect(Math.hypot(outsider.vx, outsider.vy)).toBe(0);
	});

	it("strictly constrains zero-, one-, and two-group people", () => {
		const firstOnly = node("first", 0, 0, { layerIds: ["a"] });
		const shared = node("shared", 500, 500, { layerIds: ["a", "b"] });
		const secondOnly = node("second", 0, 0, { layerIds: ["b"] });
		const outsider = node("outsider", 0, 0);
		const nodes = [firstOnly, shared, secondOnly, outsider];
		const circles = calculateGroupCircles(nodes);
		constrainNodesToGroupCircles(nodes, circles);
		for (const person of nodes) {
			for (const circle of circles) {
				const distance = Math.hypot(person.x - circle.x, person.y - circle.y);
				if (person.layerIds?.includes(circle.id)) {
					expect(distance).toBeLessThanOrEqual(circle.radius - person.radius - 18 + 0.001);
				} else {
					expect(distance).toBeGreaterThanOrEqual(circle.radius + person.radius + 18 - 0.001);
				}
			}
		}
	});

	it("starts two group circles apart with shared members in their overlap", () => {
		const first = node("first", 0, 0, { layerIds: ["a"] });
		const shared = node("shared", 0, 0, { layerIds: ["a", "b"] });
		const second = node("second", 0, 0, { layerIds: ["b"] });
		const outsider = node("outsider", 0, 0);
		expect(arrangeGroupCircles([first, shared, second, outsider])).toBe(true);
		const circles = calculateGroupCircles([first, shared, second, outsider]);
		for (const circle of circles) {
			const sharedDistance = Math.hypot(shared.x - circle.x, shared.y - circle.y);
			const outsiderDistance = Math.hypot(outsider.x - circle.x, outsider.y - circle.y);
			expect(sharedDistance).toBeLessThanOrEqual(circle.radius - shared.radius - 18 + 0.001);
			expect(outsiderDistance).toBeGreaterThanOrEqual(circle.radius + outsider.radius + 18 - 0.001);
		}
	});

	it("uses fixed forces in spatial mode", () => {
		const makeNodes = () => [
			node("left", -180, 0, { layerIds: ["a"] }),
			node("shared", 0, 0, { layerIds: ["a", "b"] }),
			node("right", 180, 0, { layerIds: ["b"] }),
		];
		const first = new Simulation({
			linkDistance: 40,
			repulsionStrength: 400,
			linkStrength: 0,
			centerStrength: 0,
			companyStrength: 0,
		});
		const second = new Simulation({
			linkDistance: 260,
			repulsionStrength: 6000,
			linkStrength: 1,
			centerStrength: 0.2,
			companyStrength: 0.15,
		});
		first.setLayoutModel("spatial");
		second.setLayoutModel("spatial");
		first.setGraph(makeNodes(), []);
		second.setGraph(makeNodes(), []);
		first.reheat(0.9);
		second.reheat(0.9);
		for (let index = 0; index < 80; index++) {
			first.tick();
			second.tick();
		}
		expect(first.nodes.map(({ x, y }) => [x, y])).toEqual(second.nodes.map(({ x, y }) => [x, y]));
	});

	it("preserves strict circle membership for a twenty-person spatial graph", () => {
		const nodes = [
			...Array.from({ length: 6 }, (_, index) => node(`a-${index}`, 0, 0, { layerIds: ["a"] })),
			...Array.from({ length: 6 }, (_, index) => node(`b-${index}`, 0, 0, { layerIds: ["b"] })),
			...Array.from({ length: 4 }, (_, index) => node(`both-${index}`, 0, 0, { layerIds: ["a", "b"] })),
			...Array.from({ length: 4 }, (_, index) => node(`outside-${index}`, 0, 0)),
		];
		arrangeGroupCircles(nodes);
		const simulation = new Simulation();
		simulation.setLayoutModel("spatial");
		simulation.setGraph(nodes, []);
		simulation.reheat(0.9);
		for (let index = 0; index < 400; index++) simulation.tick();
		const circles = simulation.groupCircles;
		for (const person of nodes) {
			for (const circle of circles) {
				const distance = Math.hypot(person.x - circle.x, person.y - circle.y);
				if (person.layerIds?.includes(circle.id)) {
					expect(distance).toBeLessThanOrEqual(circle.radius - person.radius - 18 + 0.001);
				} else {
					expect(distance).toBeGreaterThanOrEqual(circle.radius + person.radius + 18 - 0.001);
				}
			}
		}
	});

	it("moves and expands a circle gradually with its members", () => {
		const members = [
			node("one", -40, 0, { layerIds: ["a"] }),
			node("two", 40, 0, { layerIds: ["a"] }),
		];
		const initial = calculateGroupCircles(members);
		members[0].x = 360;
		const next = updateDynamicGroupCircles(members, initial);
		expect(next[0].x).toBeGreaterThan(initial[0].x);
		expect(next[0].x - initial[0].x).toBeLessThanOrEqual(5);
		expect(next[0].radius).toBeGreaterThan(initial[0].radius);
		expect(next[0].radius - initial[0].radius).toBeLessThanOrEqual(7);
	});

	it("gently attracts an ungrouped person from the seeded outside distance", () => {
		const outsider = node("outsider", 330, 0);
		applyGroupBoundaryForce([outsider], [{ id: "a", x: 0, y: 0, radius: 180 }], 1);
		expect(outsider.vx).toBeLessThan(0);
		expect(Math.abs(outsider.vx)).toBeLessThan(3);
		expect(outsider.vy).toBe(0);
	});

	it("moves a distant outsider after settling without moving grouped people", () => {
		const memberA = node("member-a", -50, 0, { layerIds: ["a"] });
		const memberB = node("member-b", 50, 0, { layerIds: ["a"] });
		const outsider = node("outsider", 1200, 0);
		const simulation = new Simulation();
		simulation.setLayoutModel("spatial");
		simulation.setGraph([memberA, memberB, outsider], []);
		simulation.reheat(0.6);
		for (let index = 0; index < 2000 && !simulation.isSettled(); index++) simulation.tick();
		expect(simulation.isSettled()).toBe(true);
		const memberPositions = [memberA.x, memberA.y, memberB.x, memberB.y];
		const outsiderBefore = outsider.x;
		for (let index = 0; index < 100; index++) simulation.advanceDetachedPeople();
		expect(outsider.x).toBeLessThan(outsiderBefore);
		expect([memberA.x, memberA.y, memberB.x, memberB.y]).toEqual(memberPositions);
		expect(simulation.isSettled()).toBe(true);
	});

	it("ignores links and companies in spatial mode", () => {
		const makeNodes = (withCompany: boolean) => [
			node("one", -80, 0, { layerIds: ["a"], company: withCompany ? "Acme" : undefined }),
			node("two", 80, 0, { layerIds: ["a"], company: withCompany ? "Acme" : undefined }),
		];
		const linked = new Simulation();
		const plain = new Simulation();
		linked.setLayoutModel("spatial");
		plain.setLayoutModel("spatial");
		const linkedNodes = makeNodes(true);
		const plainNodes = makeNodes(false);
		linked.setGraph(linkedNodes, [{ source: linkedNodes[0], target: linkedNodes[1] }]);
		plain.setGraph(plainNodes, []);
		linked.reheat(0.9);
		plain.reheat(0.9);
		for (let index = 0; index < 100; index++) {
			linked.tick();
			plain.tick();
		}
		expect(linked.nodes.map(({ x, y }) => [x, y])).toEqual(plain.nodes.map(({ x, y }) => [x, y]));
	});

	it("starts settled and reheats above the settle threshold", () => {
		const sim = new Simulation();
		expect(sim.isSettled()).toBe(true);
		sim.reheat(1);
		expect(sim.isSettled()).toBe(false);
	});

	it("settles after enough ticks", () => {
		const sim = new Simulation();
		sim.setGraph([node("a", 10, 0), node("b", -10, 0)], []);
		sim.reheat(1);
		for (let i = 0; i < 2000 && !sim.isSettled(); i++) sim.tick();
		expect(sim.isSettled()).toBe(true);
	});

	it("keeps a pinned node fixed in place", () => {
		const pinned = node("center", 5, 7, { fx: 5, fy: 7, isCenter: true });
		const sim = new Simulation();
		sim.setGraph([pinned, node("a", 100, 100)], []);
		sim.reheat(1);
		for (let i = 0; i < 50; i++) sim.tick();
		expect(pinned.x).toBe(5);
		expect(pinned.y).toBe(7);
	});

	it("separates people that start at exactly the same position", () => {
		const first = node("first", 0, 0);
		const second = node("second", 0, 0);
		const sim = new Simulation();
		sim.setGraph([first, second], []);
		sim.reheat(1);
		for (let index = 0; index < 20; index++) sim.tick();
		expect(Math.hypot(first.x - second.x, first.y - second.y)).toBeGreaterThan(1);
	});

	it("ramps energy up gradually rather than jumping to the peak", () => {
		const sim = new Simulation();
		sim.setGraph([node("a", 10, 0)], []);
		sim.reheat(1);

		// Early in the warm-up the energy is deliberately held low (slow start).
		for (let i = 0; i < 3; i++) sim.tick();
		const earlyAlpha = sim.alpha;
		// By mid-ramp the ease-in has accelerated it well above that floor.
		for (let i = 0; i < 12; i++) sim.tick();
		const midAlpha = sim.alpha;

		expect(earlyAlpha).toBeLessThan(0.5); // didn't snap to full energy
		expect(midAlpha).toBeGreaterThan(earlyAlpha); // accelerating warm-up
	});
});
