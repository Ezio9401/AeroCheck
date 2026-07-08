// Static top-level import (not a dynamic import) on purpose: this puts SheetJS
// in the eager module graph, so once this module loads it is fetched as a
// normal same-origin chunk that the service worker caches cache-first on the
// first page load — meaning the Excel export keeps working offline without the
// user having had to trigger an export while online first.
import * as XLSX from "xlsx";
import { buildReportRows, REPORT_COLUMNS } from "./csv";
import { InspectionState, PhotoMap } from "./types";

// Character widths (wch) per column, in REPORT_COLUMNS order, so the sheet is
// readable without manual resizing.
const COLUMN_WIDTHS: number[] = [22, 8, 40, 14, 18, 14, 8, 16, 16, 42, 6];

/**
 * Builds an .xlsx workbook with the same information and columns as the CSV
 * export (metadata rows, a blank row, the header row and one row per unit) and
 * returns its raw bytes.
 */
export function buildXlsxBytes(state: InspectionState, photos: PhotoMap): Uint8Array {
  const aoa = buildReportRows(state, photos);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = REPORT_COLUMNS.map((_, i) => ({ wch: COLUMN_WIDTHS[i] ?? 12 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inspección");

  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(out);
}
