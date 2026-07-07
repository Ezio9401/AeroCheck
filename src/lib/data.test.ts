import { describe, expect, it } from "vitest";
import { BASES, findBase, getBase } from "./data";

describe("findBase / getBase", () => {
  it("findBase returns the matching base", () => {
    expect(findBase("BHELEME-II")?.id).toBe("BHELEME-II");
  });

  it("findBase returns undefined for an unknown id (orphaned draft)", () => {
    expect(findBase("BASE-QUE-NO-EXISTE")).toBeUndefined();
  });

  it("getBase returns the matching base for a known id", () => {
    expect(getBase(BASES[0].id).id).toBe(BASES[0].id);
  });

  it("getBase throws instead of silently falling back to another base", () => {
    expect(() => getBase("BASE-QUE-NO-EXISTE")).toThrow(/Base desconocida/);
  });
});
