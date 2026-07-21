import { describe, expect, it } from "vitest";
import { SpatialGrid } from "../src/sim/spatial-grid";
import type { SimNode } from "../src/sim/types";

function node(id: string, x: number, y: number): SimNode {
	return { id, x, y, vx: 0, vy: 0, fx: null, fy: null, radius: 26, targetRadius: 0, isCenter: false };
}

describe("SpatialGrid", () => {
	it("returns neighbors within the surrounding cells and omits far nodes", () => {
		const grid = new SpatialGrid(100);
		const here = node("here", 10, 10);
		const adjacent = node("adjacent", 120, 10); // next cell over
		const far = node("far", 5000, 5000);
		grid.rebuild([here, adjacent, far]);

		const near = grid.queryNear(10, 10);
		const ids = near.map((n) => n.id);
		expect(ids).toContain("here");
		expect(ids).toContain("adjacent");
		expect(ids).not.toContain("far");
	});

	it("reflects the latest positions after rebuild", () => {
		const grid = new SpatialGrid(100);
		const moving = node("m", 10, 10);
		grid.rebuild([moving]);
		expect(grid.queryNear(10, 10).map((n) => n.id)).toContain("m");

		moving.x = 5000;
		moving.y = 5000;
		grid.rebuild([moving]);
		expect(grid.queryNear(10, 10)).toHaveLength(0);
	});
});
