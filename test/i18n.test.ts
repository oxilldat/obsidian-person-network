import { describe, expect, it } from "vitest";
import en from "../src/i18n/en";
import ru from "../src/i18n/ru";
import { setLocale, t } from "../src/i18n";

describe("i18n dictionaries", () => {
	it("ru defines exactly the same keys as en", () => {
		expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort());
	});

	it("has no empty translations", () => {
		for (const [key, value] of Object.entries(ru)) {
			expect(value, `ru[${key}]`).not.toBe("");
		}
		for (const [key, value] of Object.entries(en)) {
			expect(value, `en[${key}]`).not.toBe("");
		}
	});
});

describe("t()", () => {
	it("substitutes named parameters", () => {
		setLocale("en");
		expect(t("view.emptyBody", { value: "person" })).toBe('Looking for notes tagged "#person".');
	});

	it("switches language with setLocale", () => {
		setLocale("ru");
		expect(t("common.cancel")).toBe("Отмена");
		setLocale("en");
		expect(t("common.cancel")).toBe("Cancel");
	});
});
