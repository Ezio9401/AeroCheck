import { describe, expect, it } from "vitest";
import { isItemFull, problemEntriesForGroup, takenUnitNumbers, usedUnitCount } from "./report";
import { CatalogGroup, CatalogItem, Entry } from "./types";

function item(id: string, cant: number): CatalogItem {
  return { id, cant, fab: "FAB", ref: "REF", noc: "NOC", desc: `Elemento ${id}` };
}

function entry(elemId: string, unitNum: number, status: Entry["status"] = "util"): Entry {
  return { entryId: `${elemId}#${unitNum}`, elemId, unitNum, status, worktype: null, notes: "" };
}

const group: CatalogGroup = {
  sub: "1.1",
  subName: "Balizaje",
  icon: "x",
  parametros: [],
  items: [item("1.1.1", 2), item("1.1.2", 1)],
};

describe("usedUnitCount / isItemFull", () => {
  it("counts only entries for the given element", () => {
    const entries = [entry("1.1.1", 1), entry("1.1.1", 2), entry("1.1.2", 1)];
    expect(usedUnitCount(entries, "1.1.1")).toBe(2);
    expect(usedUnitCount(entries, "1.1.2")).toBe(1);
    expect(usedUnitCount(entries, "9.9.9")).toBe(0);
  });

  it("is full when used units reach cant", () => {
    const entries = [entry("1.1.1", 1), entry("1.1.1", 2)];
    expect(isItemFull(item("1.1.1", 2), entries)).toBe(true);
    expect(isItemFull(item("1.1.1", 2), [entry("1.1.1", 1)])).toBe(false);
  });
});

describe("takenUnitNumbers", () => {
  it("returns the set of unit numbers already added", () => {
    const taken = takenUnitNumbers([entry("1.1.1", 1), entry("1.1.1", 3)], "1.1.1");
    expect(taken.has(1)).toBe(true);
    expect(taken.has(2)).toBe(false);
    expect(taken.has(3)).toBe(true);
  });
});

describe("problemEntriesForGroup", () => {
  it("keeps only non-útil statuses and ignores unreviewed entries", () => {
    const entries = [
      entry("1.1.1", 1, "util"),
      entry("1.1.1", 2, "inutil"),
      entry("1.1.2", 1, null),
      entry("1.1.2", 1, "rep"),
    ];
    const result = problemEntriesForGroup(group, entries);
    expect(result.map((e) => e.entryId)).toEqual(["1.1.1#2", "1.1.2#1"]);
  });

  it("excludes entries whose element is not in the group", () => {
    const entries = [entry("9.9.9", 1, "inutil")];
    expect(problemEntriesForGroup(group, entries)).toHaveLength(0);
  });

  it("sorts by element id then unit number", () => {
    const entries = [
      entry("1.1.2", 1, "rep"),
      entry("1.1.1", 2, "cond"),
      entry("1.1.1", 1, "inutil"),
    ];
    const result = problemEntriesForGroup(group, entries);
    expect(result.map((e) => `${e.elemId}/${e.unitNum}`)).toEqual(["1.1.1/1", "1.1.1/2", "1.1.2/1"]);
  });
});
