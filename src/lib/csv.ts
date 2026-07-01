import { getBase } from "./data";
import { InspectionState, PhotoMap, STATUS_DEFS } from "./types";

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(state: InspectionState, photos: PhotoMap): string {
  const rows: string[][] = [];

  rows.push(["Base", getBase(state.base).nombre]);
  rows.push(["Intervención", state.intervencion]);
  rows.push(["Técnico ejecutor", state.tecnico]);
  rows.push(["Fecha", state.fecha]);
  rows.push([]);

  rows.push([
    "Subsistema",
    "Nro",
    "Elemento",
    "Fabricante",
    "Referencia/P-N",
    "NOC",
    "Unidad",
    "Estado",
    "Tipo de trabajo",
    "Observaciones",
    "Foto",
  ]);

  const catalog = getBase(state.base).catalog;

  for (const group of catalog) {
    const itemsById = new Map(group.items.map((item) => [item.id, item]));
    const groupEntries = state.entries.filter((e) => itemsById.has(e.elemId));

    for (const entry of groupEntries) {
      const item = itemsById.get(entry.elemId)!;
      rows.push([
        group.subName,
        item.id,
        item.desc,
        item.fab,
        item.ref,
        item.noc,
        String(entry.unitNum),
        entry.status ? STATUS_DEFS[entry.status].label : "",
        entry.worktype ?? "",
        entry.notes ?? "",
        photos[entry.entryId] ? "Sí" : "",
      ]);
    }
  }

  return rows.map((row) => row.map(csvEscape).join(";")).join("\n");
}

export function downloadCsv(state: InspectionState, photos: PhotoMap) {
  const csv = buildCsv(state, photos);
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `inspeccion_${getBase(state.base).nombre.replace(/\s+/g, "_")}_${state.fecha}.csv`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
