"use client";

import { useEffect, useRef, useState } from "react";
import AddBalizaSheet from "@/components/AddBalizaSheet";
import CatalogScreen from "@/components/CatalogScreen";
import SetupScreen from "@/components/SetupScreen";
import Toast from "@/components/Toast";
import { findBase, getBase } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { buildXlsxBytes } from "@/lib/xlsx";
import { buildPdfBytes } from "@/lib/pdf";
import { buildArchiveZip } from "@/lib/archive";
import { exportInspection, parseBackup } from "@/lib/backup";
import { dataUrlToBlob } from "@/lib/image";
import { checkStorageQuota, clearPhotos, deletePhoto, getPhotosFor, savePhoto } from "@/lib/photoDb";
import { deleteDraft, loadDrafts, saveDraft } from "@/lib/storage";
import { CatalogItem, Entry, InspectionState, PhotoMap, StatusKey, WorkType } from "@/lib/types";

type View = "setup" | "catalog";

interface PickerState {
  sub: string;
  selectedItem: CatalogItem | null;
  selectedUnit: number | null;
}

export default function Home() {
  const [view, setView] = useState<View>("setup");
  const [state, setState] = useState<InspectionState | null>(null);
  const [photos, setPhotos] = useState<PhotoMap>({});
  const [drafts, setDrafts] = useState<InspectionState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSubsystems, setOpenSubsystems] = useState<Set<string>>(new Set());
  const [openEntryIds, setOpenEntryIds] = useState<Set<string>>(new Set());
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<InspectionState | null>(null);

  useEffect(() => {
    const saved = loadDrafts();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
    setDrafts(saved);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
  }, []);

  // Keep a live ref to the current inspection so background/flush handlers
  // can persist the very latest state without stale closures.
  useEffect(() => {
    stateRef.current = state;
  });

  // Field safety net: if the app is sent to the background (or the page is
  // being unloaded) while a note is mid-edit, flush it to localStorage now
  // instead of waiting for the debounce or the textarea blur.
  useEffect(() => {
    const flush = () => {
      if (notesTimer.current) {
        clearTimeout(notesTimer.current);
        notesTimer.current = null;
      }
      if (stateRef.current) saveDraft({ ...stateRef.current, lastModified: Date.now() });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  };

  const persist = (next: InspectionState) => {
    const withTime = { ...next, lastModified: Date.now() };
    setState(withTime);
    saveDraft(withTime);
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === withTime.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = withTime;
        return copy;
      }
      return [...prev, withTime];
    });
  };

  const handleStart = (meta: { base: string; intervencion: string; tecnico: string; fecha: string }) => {
    const next: InspectionState = {
      id: "insp_" + Date.now(),
      ...meta,
      entries: [],
      lastModified: Date.now(),
    };
    setPhotos({});
    persist(next);
    setView("catalog");
  };

  const handleResumeDraft = async (id: string) => {
    const target = drafts.find((d) => d.id === id);
    if (!target) return;
    // Refuse to open an orphaned draft rather than silently remapping it to a
    // different base, which would corrupt the record.
    if (!findBase(target.base)) {
      showToast(`Esta inspección usa una base desconocida ("${target.base}") y no puede abrirse.`);
      return;
    }
    const loadedPhotos = await getPhotosFor(target.entries.map((e) => e.entryId));
    setPhotos(loadedPhotos);
    setState(target);
    setView("catalog");
  };

  const handleFinishLater = () => {
    setView("setup");
    setState(null);
    setPhotos({});
    setSearchQuery("");
    setOpenSubsystems(new Set());
    setOpenEntryIds(new Set());
  };

  const handleFinalize = async () => {
    if (!state) return;
    if (!window.confirm("¿Finalizar? Se generará el ZIP con PDF, Excel y fotos.")) return;

    const baseName = getBase(state.base).nombre.replace(/\s+/g, "_");
    const fileName = `Inspeccion_${baseName}_${state.fecha}.zip`;

    // Build the archive first and only delete anything if it succeeds. If any
    // step throws, the inspection is left untouched on the device.
    try {
      const pdf = await buildPdfBytes(state, photos);
      const xlsx = buildXlsxBytes(state, photos);
      const blob = await buildArchiveZip(state, photos, pdf, xlsx);
      const file = new File([blob], fileName, { type: "application/zip" });
      const title = `Inspección ${getBase(state.base).nombre} · ${state.fecha}`;

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      showToast("No se pudo generar el archivo. La inspección NO se ha borrado.");
      return;
    }

    // Archive succeeded — now it's safe to remove the inspection from the device.
    if (state.id) {
      await clearPhotos(state.entries.map((e) => e.entryId));
      deleteDraft(state.id);
      setDrafts((prev) => prev.filter((d) => d.id !== state.id));
    }
    setState(null);
    setPhotos({});
    setSearchQuery("");
    setOpenSubsystems(new Set());
    setOpenEntryIds(new Set());
    setView("setup");
    showToast("Inspección finalizada y archivada");
  };

  const handleDeleteDraft = async (id: string) => {
    if (!window.confirm("¿Eliminar esta inspección pendiente? Esta acción no se puede deshacer.")) return;
    const target = drafts.find((d) => d.id === id);
    if (target) await clearPhotos(target.entries.map((e) => e.entryId));
    deleteDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast("Inspección eliminada");
  };

  const handleToggleSubsystem = (sub: string) => {
    setOpenSubsystems((prev) => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub);
      else next.add(sub);
      return next;
    });
  };

  const handleToggleEntry = (entryId: string) => {
    setOpenEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };

  const handleAddBaliza = (sub: string) => {
    setPicker({ sub, selectedItem: null, selectedUnit: null });
  };

  const handleSelectItem = (item: CatalogItem) => {
    setPicker((prev) => (prev ? { ...prev, selectedItem: item, selectedUnit: null } : prev));
  };

  const handleSelectUnit = (unit: number) => {
    setPicker((prev) => (prev ? { ...prev, selectedUnit: unit } : prev));
  };

  const handlePickerBack = () => {
    setPicker((prev) => (prev ? { ...prev, selectedItem: null, selectedUnit: null } : prev));
  };

  const handlePickerCancel = () => {
    setPicker(null);
  };

  const handlePickerConfirm = () => {
    if (!state || !picker?.selectedItem || !picker.selectedUnit) return;
    const elem = picker.selectedItem;
    const unitNum = picker.selectedUnit;
    const entryId = `${elem.id}#${unitNum}#${Date.now()}`;
    const newEntry: Entry = { entryId, elemId: elem.id, unitNum, status: null, worktype: null, notes: "" };
    const next = { ...state, entries: [...state.entries, newEntry] };
    persist(next);
    setOpenSubsystems((prev) => new Set(prev).add(picker.sub));
    setOpenEntryIds((prev) => new Set(prev).add(entryId));
    setPicker(null);
    showToast(`Baliza añadida · Unidad ${unitNum}`);
  };

  const handleRemoveEntry = async (entryId: string) => {
    if (!state) return;
    const next = { ...state, entries: state.entries.filter((e) => e.entryId !== entryId) };
    persist(next);
    await deletePhoto(entryId);
    setPhotos((prev) => {
      const copy = { ...prev };
      delete copy[entryId];
      return copy;
    });
    setOpenEntryIds((prev) => {
      const copy = new Set(prev);
      copy.delete(entryId);
      return copy;
    });
  };

  const handleSetStatus = (entryId: string, status: StatusKey) => {
    if (!state) return;
    const next = {
      ...state,
      entries: state.entries.map((e) => (e.entryId === entryId ? { ...e, status } : e)),
    };
    persist(next);
    const entry = next.entries.find((e) => e.entryId === entryId);
    if (entry) {
      const labels: Record<StatusKey, string> = { util: "Útil", cond: "Útil condicional", rep: "Reparable", inutil: "Inútil" };
      showToast(`Unidad ${entry.unitNum} · ${labels[status]}`);
    }
  };

  const handleSetWorktype = (entryId: string, worktype: WorkType) => {
    if (!state) return;
    const next = {
      ...state,
      entries: state.entries.map((e) =>
        e.entryId === entryId ? { ...e, worktype: e.worktype === worktype ? null : worktype } : e
      ),
    };
    persist(next);
  };

  const handleSetNotes = (entryId: string, notes: string) => {
    if (!state) return;
    const next = { ...state, entries: state.entries.map((e) => (e.entryId === entryId ? { ...e, notes } : e)) };
    setState(next);
    // Debounced autosave: don't wait for blur, which may never fire if the
    // phone backgrounds the app mid-typing (risk of losing the observation).
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      notesTimer.current = null;
      if (stateRef.current) persist(stateRef.current);
    }, 500);
  };

  const handleSetPhoto = async (entryId: string, photo: Blob | null) => {
    if (photo) {
      try {
        // Persist first, then reflect it in the UI. Never show an unsaved
        // photo as saved: on a cheap phone IndexedDB can hit its quota and
        // reject, and an optimistic update would hide that failure.
        await savePhoto(entryId, photo);
      } catch (err) {
        const quota =
          err instanceof DOMException &&
          (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
        showToast(
          quota
            ? "Sin espacio para guardar la foto. Libera espacio o elimina fotos."
            : "No se pudo guardar la foto. Inténtalo de nuevo."
        );
        return;
      }
      // Only reflect the photo in the UI after a confirmed write.
      setPhotos((prev) => ({ ...prev, [entryId]: photo }));
      const { nearLimit } = await checkStorageQuota();
      if (nearLimit) {
        showToast("Almacenamiento casi lleno, finaliza y descarga la inspección pronto");
      } else {
        showToast("Foto añadida");
      }
    } else {
      try {
        await deletePhoto(entryId);
      } catch {
        showToast("No se pudo eliminar la foto. Inténtalo de nuevo.");
        return;
      }
      setPhotos((prev) => {
        const copy = { ...prev };
        delete copy[entryId];
        return copy;
      });
      showToast("Foto eliminada");
    }
  };

  const handleNotesBlur = () => {
    if (notesTimer.current) {
      clearTimeout(notesTimer.current);
      notesTimer.current = null;
    }
    if (!state) return;
    persist(state);
  };

  const handleExportCsv = () => {
    if (!state) return;
    downloadCsv(state, photos);
  };

  const handleExportPdf = async () => {
    if (!state) return;
    const { downloadPdf } = await import("@/lib/pdf");
    await downloadPdf(state, photos);
    showToast("PDF generado correctamente");
  };

  const handleExportBackup = async () => {
    if (!state) return;
    await exportInspection(state, photos);
    showToast("Copia de seguridad exportada");
  };

  const handleImportBackup = async (file: File) => {
    let parsed: { inspection: InspectionState; photosBase64: Record<string, string> };
    try {
      parsed = parseBackup(await file.text());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo importar la inspección.");
      return;
    }
    const { inspection, photosBase64 } = parsed;
    // Persist the record first — the metadata + entries are the compliance
    // data we must not lose; photos are restored best-effort afterwards.
    saveDraft(inspection);
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === inspection.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = inspection;
        return copy;
      }
      return [...prev, inspection];
    });
    let photoError = false;
    for (const [entryId, dataUrl] of Object.entries(photosBase64)) {
      try {
        // Backups store photos as base64; convert back to a Blob for IndexedDB.
        await savePhoto(entryId, await dataUrlToBlob(dataUrl));
      } catch {
        photoError = true;
      }
    }
    showToast(
      photoError
        ? "Inspección importada (algunas fotos no se guardaron por falta de espacio)"
        : "Inspección importada"
    );
  };

  if (view === "setup" || !state) {
    return (
      <div id="app">
        <SetupScreen
          drafts={drafts}
          onStart={handleStart}
          onResumeDraft={handleResumeDraft}
          onDeleteDraft={handleDeleteDraft}
          onImportBackup={handleImportBackup}
        />
        <Toast message={toastMsg} />
      </div>
    );
  }

  const catalog = getBase(state.base).catalog;
  const pickerGroup = picker ? catalog.find((g) => g.sub === picker.sub) : null;

  return (
    <div id="app" onBlurCapture={handleNotesBlur}>
      <CatalogScreen
        state={state}
        catalog={catalog}
        photos={photos}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        openSubsystems={openSubsystems}
        onToggleSubsystem={handleToggleSubsystem}
        openEntryIds={openEntryIds}
        onToggleEntry={handleToggleEntry}
        onAddBaliza={handleAddBaliza}
        onRemoveEntry={handleRemoveEntry}
        onSetStatus={handleSetStatus}
        onSetWorktype={handleSetWorktype}
        onSetNotes={handleSetNotes}
        onSetPhoto={handleSetPhoto}
        onFinishLater={handleFinishLater}
        onFinalize={handleFinalize}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onExportBackup={handleExportBackup}
      />
      {picker && pickerGroup && (
        <AddBalizaSheet
          group={pickerGroup}
          entries={state.entries.filter((e) => pickerGroup.items.some((i) => i.id === e.elemId))}
          selectedItem={picker.selectedItem}
          selectedUnit={picker.selectedUnit}
          onSelectItem={handleSelectItem}
          onSelectUnit={handleSelectUnit}
          onBack={handlePickerBack}
          onCancel={handlePickerCancel}
          onConfirm={handlePickerConfirm}
        />
      )}
      <Toast message={toastMsg} />
    </div>
  );
}
