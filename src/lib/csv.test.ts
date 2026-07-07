import { describe, expect, it } from "vitest";
import { buildCsv, csvEscape } from "./csv";
import { getBase } from "./data";
import { Entry, InspectionState } from "./types";

const base = getBase("BHELEME-II");
const firstItem = base.catalog[0].items[0];

function stateWith(entries: Entry[]): InspectionState {
  return {
    id: "insp_test",
    base: "BHELEME-II",
    intervencion: "Mensual",
    tecnico: "Ana",
    fecha: "2026-07-06",
    entries,
  };
}

function entry(elemId: string, unitNum: number, overrides: Partial<Entry> = {}): Entry {
  return {
    entryId: `${elemId}#${unitNum}`,
    elemId,
    unitNum,
    status: "inutil",
    worktype: null,
    notes: "",
    ...overrides,
  };
}

describe("csvEscape (anti formula-injection)", () => {
  it("prefixes cells beginning with a formula trigger", () => {
    expect(csvEscape("=HYPERLINK(x)")).toBe("'=HYPERLINK(x)");
    expect(csvEscape("+1")).toBe("'+1");
    expect(csvEscape("-1")).toBe("'-1");
    expect(csvEscape("@foo")).toBe("'@foo");
  });

  it("leaves ordinary text untouched", () => {
    expect(csvEscape("limpieza de lente")).toBe("limpieza de lente");
  });

  it("still quotes cells containing the delimiter or quotes", () => {
    expect(csvEscape("a;b")).toBe('"a;b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    // formula-prefixed AND delimiter-containing: apostrophe then quoted
    expect(csvEscape("=a;b")).toBe('"\'=a;b"');
  });
});

describe("buildCsv", () => {
  it("has a header without the Cantidad column", () => {
    const csv = buildCsv(stateWith([]), {});
    const header = csv.split("\n").find((l) => l.startsWith("Subsistema;"))!;
    expect(header).toContain("Unidad");
    expect(header).toContain("Estado");
    expect(header).toContain("Observaciones");
    expect(header).not.toContain("Cantidad");
  });

  it("only emits rows for entries actually added, not every catalog unit", () => {
    const csv = buildCsv(stateWith([entry(firstItem.id, 1)]), {});
    const lines = csv.split("\n");
    const headerIdx = lines.findIndex((l) => l.startsWith("Subsistema;"));
    const dataRows = lines.slice(headerIdx + 1).filter((l) => l.length > 0);
    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toContain("Inútil");
    expect(dataRows[0]).toContain(firstItem.id);
  });

  it("neutralizes a formula-injection payload in observations", () => {
    const payload = "=cmd|' /C calc'!A1";
    const csv = buildCsv(stateWith([entry(firstItem.id, 1, { notes: payload })]), {});
    const dataRow = csv.split("\n").find((l) => l.includes("calc"))!;
    expect(dataRow).toContain("'=cmd|");
    expect(dataRow).not.toMatch(/;=cmd/); // never a raw leading-= cell
  });
});
