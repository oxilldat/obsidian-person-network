import { describe, expect, it } from "vitest";
import { clamp, distance, easeInCubic, easeOutCubic, lerp } from "../src/utils/geometry";

describe("clamp", () => {
	it("bounds values to the range", () => {
		expect(clamp(5, 1, 10)).toBe(5);
		expect(clamp(-3, 1, 10)).toBe(1);
		expect(clamp(42, 1, 10)).toBe(10);
	});
});

describe("lerp", () => {
	it("interpolates endpoints", () => {
		expect(lerp(0, 100, 0)).toBe(0);
		expect(lerp(0, 100, 1)).toBe(100);
		expect(lerp(0, 100, 0.25)).toBe(25);
	});
});

describe("distance", () => {
	it("computes euclidean distance", () => {
		expect(distance(0, 0, 3, 4)).toBe(5);
		expect(distance(1, 1, 1, 1)).toBe(0);
	});
});

describe("easing", () => {
	it("easeInCubic is 0 and 1 at the ends and accelerates", () => {
		expect(easeInCubic(0)).toBe(0);
		expect(easeInCubic(1)).toBe(1);
		// slow start: first quarter covers far less than a linear quarter
		expect(easeInCubic(0.25)).toBeLessThan(0.25);
	});

	it("easeOutCubic is 0 and 1 at the ends and decelerates", () => {
		expect(easeOutCubic(0)).toBe(0);
		expect(easeOutCubic(1)).toBe(1);
		// fast start: first quarter covers more than a linear quarter
		expect(easeOutCubic(0.25)).toBeGreaterThan(0.25);
	});
});
