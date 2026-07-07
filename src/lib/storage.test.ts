// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { deleteDraft, loadDrafts, saveDraft } from "./storage";
import { InspectionState } from "./types";

const STORAGE_KEY = "aerocheck:inspections:v1";
const LEGACY_KEY = "aerocheck:inspection:v1";

function draft(id: string): InspectionState {
  return {
    id,
    base: "BHELEME-II",
    intervencion: "Mensual",
    tecnico: "Ana",
    fecha: "2026-07-06",
    entries: [],
    lastModified: 1,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("legacy migration", () => {
  it("migrates a single legacy draft into the new list and removes the old key", () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(draft("legacy_1")));

    const drafts = loadDrafts();

    expect(drafts.map((d) => d.id)).toEqual(["legacy_1"]);
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadDrafts()).toEqual([]);
  });

  it("prefers the new list over the legacy key when both exist", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([draft("new_1")]));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(draft("legacy_1")));
    expect(loadDrafts().map((d) => d.id)).toEqual(["new_1"]);
  });
});

describe("saveDraft / deleteDraft", () => {
  it("upserts by id", () => {
    saveDraft(draft("a"));
    saveDraft(draft("b"));
    saveDraft({ ...draft("a"), tecnico: "Beatriz" });

    const drafts = loadDrafts();
    expect(drafts).toHaveLength(2);
    expect(drafts.find((d) => d.id === "a")!.tecnico).toBe("Beatriz");
  });

  it("removes a draft by id", () => {
    saveDraft(draft("a"));
    saveDraft(draft("b"));
    deleteDraft("a");

    expect(loadDrafts().map((d) => d.id)).toEqual(["b"]);
  });
});
