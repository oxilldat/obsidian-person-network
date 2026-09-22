import { describe, expect, it } from "vitest";
import { Simulation } from "../src/sim/simulation";
import type { SimNode } from "../src/sim/types";
import { applyCompanyForce } from "../src/sim/forces";

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
