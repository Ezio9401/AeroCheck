import { zip } from "fflate";
import { getBase } from "./data";
import { InspectionState, PhotoMap } from "./types";

/** Make a string safe as a file name on any filesystem. */
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Bundles the PDF, the Excel and every photo into a single ZIP Blob.
 *
 * Photos in this codebase are stored as Blobs (not base64 data URLs), so each
 * one is turned into bytes with `arrayBuffer()` — no base64 round-trip needed.
 * Files live under a `fotos/` folder as `<elemId>_u<unitNum>.jpg`.
 */
export async function buildArchiveZip(
  state: InspectionState,
  photos: PhotoMap,
  pdfBytes: Uint8Array,
  xlsxBytes: Uint8Array
): Promise<Blob> {
  const baseName = getBase(state.base).nombre.replace(/\s+/g, "_");
  const stem = `Inspeccion_${baseName}_${state.fecha}`;

  // fflate treats "/" in keys as folder separators, so "fotos/x.jpg" nests.
  const files: Record<string, Uint8Array> = {
    [`${stem}.pdf`]: pdfBytes,
    [`${stem}.xlsx`]: xlsxBytes,
  };

  // One image per entry that actually has a photo. An entry without a photo is
  // simply skipped: `photos[entryId]` is undefined, so no file is added for it
  // (no empty placeholder, no error).
  for (const entry of state.entries) {
    const blob = photos[entry.entryId];
    if (!blob) continue;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    files[`fotos/${sanitizeName(entry.elemId)}_u${entry.unitNum}.jpg`] = bytes;
  }

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(files, { level: 6 }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  // fflate returns an ArrayBuffer-backed Uint8Array; the cast satisfies the DOM
  // BlobPart type (which excludes SharedArrayBuffer-backed views).
  return new Blob([zipped as Uint8Array<ArrayBuffer>], { type: "application/zip" });
}
