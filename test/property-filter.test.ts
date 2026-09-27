import { describe, expect, it } from "vitest";
import { matchesPropertyFilters, matchesPropertyRule } from "../src/data/property-filter";

const rule = (operator: Parameters<typeof matchesPropertyRule>[1]["operator"], value = "") => ({
	id: "test", property: "status", operator, value,
});

describe("Bases-like property filters", () => {
	it("compares text without case sensitivity", () => {
		expect(matchesPropertyRule({ status: "Active" }, rule("equals", "active"))).toBe(true);
		expect(matchesPropertyRule({ status: "Inactive" }, rule("notEquals", "active"))).toBe(true);
	});

	it("matches text and list contents", () => {
		expect(matchesPropertyRule({ status: ["Family", "Work"] }, rule("contains", "work"))).toBe(true);
		expect(matchesPropertyRule({ status: "Long-term client" }, rule("contains", "client"))).toBe(true);
	});

	it("supports presence and numeric comparisons", () => {
		expect(matchesPropertyRule({ status: 8 }, rule("greater", "5"))).toBe(true);
		expect(matchesPropertyRule({ status: [] }, rule("notExists"))).toBe(true);
		expect(matchesPropertyRule({ status: false }, rule("exists"))).toBe(true);
	});

	it("combines rules with AND", () => {
		expect(matchesPropertyFilters({ status: "active", score: 8 }, [
			rule("equals", "active"),
			{ id: "score", property: "score", operator: "greater", value: "5" },
		])).toBe(true);
		expect(matchesPropertyFilters({ status: "active", score: 3 }, [
			rule("equals", "active"),
			{ id: "score", property: "score", operator: "greater", value: "5" },
		])).toBe(false);
	});

	it("can match any rule like a Bases OR group", () => {
		expect(matchesPropertyFilters({ status: "inactive", score: 8 }, [
			rule("equals", "active"),
			{ id: "score", property: "score", operator: "greater", value: "5" },
		], "any")).toBe(true);
	});
});
