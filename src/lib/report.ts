import { CatalogGroup, CatalogItem, Entry } from "./types";

/** How many units of a given catalog element have already been added. */
export function usedUnitCount(entries: Entry[], elemId: string): number {
  return entries.filter((e) => e.elemId === elemId).length;
}

/** True when every unit of an element has already been added (used >= cant). */
export function isItemFull(item: CatalogItem, entries: Entry[]): boolean {
  return usedUnitCount(entries, item.id) >= item.cant;
}

/** Set of unit numbers already taken for an element, to disable them in the picker. */
export function takenUnitNumbers(entries: Entry[], elemId: string): Set<number> {
  return new Set(entries.filter((e) => e.elemId === elemId).map((e) => e.unitNum));
}

/**
 * Entries in a subsystem that represent a problem (any status other than
 * "útil"), sorted by element id then unit number. This is the exact set the
 * PDF report renders per subsystem.
 */
export function problemEntriesForGroup(group: CatalogGroup, entries: Entry[]): Entry[] {
  const ids = new Set(group.items.map((item) => item.id));
  return entries
    .filter((e) => ids.has(e.elemId) && e.status !== null && e.status !== "util")
    .sort((a, b) => (a.elemId === b.elemId ? a.unitNum - b.unitNum : a.elemId.localeCompare(b.elemId)));
}
