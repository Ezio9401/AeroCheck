import { InspectionState } from "./types";

const STORAGE_KEY = "aerocheck:inspections:v1";
const LEGACY_KEY = "aerocheck:inspection:v1";

export function loadDrafts(): InspectionState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as InspectionState[];

    const legacyRaw = window.localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as InspectionState;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([legacy]));
      window.localStorage.removeItem(LEGACY_KEY);
      return [legacy];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveDraft(state: InspectionState) {
  if (typeof window === "undefined") return;
  try {
    const drafts = loadDrafts();
    const idx = drafts.findIndex((d) => d.id === state.id);
    if (idx >= 0) drafts[idx] = state;
    else drafts.push(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // localStorage unavailable or quota exceeded - ignore
  }
}

export function deleteDraft(id: string) {
  if (typeof window === "undefined") return;
  try {
    const drafts = loadDrafts().filter((d) => d.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // localStorage unavailable - ignore
  }
}
