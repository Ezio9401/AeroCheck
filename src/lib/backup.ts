import { getBase } from "./data";
import { blobToDataUrl } from "./image";
import { Entry, InspectionState, PhotoMap } from "./types";

const BACKUP_FORMAT = "aerocheck-backup";
const BACKUP_VERSION = 1;

/** Photos in the backup file are base64 data URLs (JSON can't hold Blobs). */
type PhotoBase64Map = Record<string, string>;

interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  inspection: InspectionState;
  photos: PhotoBase64Map;
}

/** Serialize a full inspection (metadata + entries + photos) to a portable JSON file. */
export async function exportInspection(state: InspectionState, photos: PhotoMap) {
  const photosBase64: PhotoBase64Map = {};
  for (const [entryId, blob] of Object.entries(photos)) {
    photosBase64[entryId] = await blobToDataUrl(blob);
  }

  const payload: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    inspection: state,
    photos: photosBase64,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `aerocheck_backup_${getBase(state.base).nombre.replace(/\s+/g, "_")}_${state.fecha}.json`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate a backup file's text. Returns the inspection plus the
 * photos as base64 data URLs (the caller converts them back to Blobs before
 * storing). Throws with a user-facing message if the file is not a well-formed
 * AeroCheck backup.
 */
export function parseBackup(text: string): { inspection: InspectionState; photosBase64: PhotoBase64Map } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es un JSON válido.");
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("El archivo no es una copia de AeroCheck.");
  }

  const obj = data as Partial<BackupFile>;
  if (obj.format !== BACKUP_FORMAT) {
    throw new Error("El archivo no es una copia de inspección de AeroCheck.");
  }

  const insp = obj.inspection as Partial<InspectionState> | undefined;
  if (
    !insp ||
    typeof insp.base !== "string" ||
    typeof insp.intervencion !== "string" ||
    typeof insp.tecnico !== "string" ||
    typeof insp.fecha !== "string" ||
    !Array.isArray(insp.entries)
  ) {
    throw new Error("La copia no contiene una inspección con el formato esperado.");
  }

  const entries = insp.entries as Entry[];
  const photosBase64: PhotoBase64Map =
    obj.photos && typeof obj.photos === "object" ? (obj.photos as PhotoBase64Map) : {};

  const inspection: InspectionState = {
    id: typeof insp.id === "string" ? insp.id : "insp_" + Date.now(),
    base: insp.base,
    intervencion: insp.intervencion,
    tecnico: insp.tecnico,
    fecha: insp.fecha,
    entries,
    lastModified: typeof insp.lastModified === "number" ? insp.lastModified : Date.now(),
  };

  return { inspection, photosBase64 };
}
