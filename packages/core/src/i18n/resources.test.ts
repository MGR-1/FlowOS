import { describe, it, expect } from "vitest";
import { en, nl } from "./resources";

/**
 * Definition of Done: "i18next keys for all strings (EN + NL)". Catching a
 * missing translation here is cheaper than shipping a screen that renders a
 * raw key like "auth.signInCta" to a Dutch user.
 */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe("translation resources", () => {
  const enKeys = keyPaths(en).sort();
  const nlKeys = keyPaths(nl).sort();

  it("has no English key missing from Dutch", () => {
    expect(enKeys.filter((k) => !nlKeys.includes(k))).toEqual([]);
  });

  it("has no Dutch key missing from English", () => {
    expect(nlKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });

  it("has no empty strings in either locale", () => {
    const empties = [
      ...keyPathsWithEmptyValue(en, "en"),
      ...keyPathsWithEmptyValue(nl, "nl"),
    ];
    expect(empties).toEqual([]);
  });

  it("covers the new auth and week intention screens", () => {
    expect(enKeys).toContain("auth.signInCta");
    expect(nlKeys).toContain("auth.signInCta");
    expect(enKeys).toContain("weekIntention.saveCta");
    expect(nlKeys).toContain("weekIntention.saveCta");
  });
});

function keyPathsWithEmptyValue(
  value: unknown,
  locale: string,
  prefix = ""
): string[] {
  if (typeof value === "string") {
    return value.trim() === "" ? [`${locale}:${prefix}`] : [];
  }
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPathsWithEmptyValue(child, locale, prefix ? `${prefix}.${key}` : key)
  );
}
