"use client";

import { useEffect, useRef, useState } from "react";
import AddBalizaSheet from "@/components/AddBalizaSheet";
import CatalogScreen from "@/components/CatalogScreen";
import SetupScreen from "@/components/SetupScreen";
import Toast from "@/components/Toast";
import { CATALOG } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { clearState, loadState, saveState } from "@/lib/storage";
import { CatalogItem, Entry, InspectionState, StatusKey, WorkType } from "@/lib/types";

type View = "setup" | "catalog";

interface PickerState {
  sub: string;
  selectedItem: CatalogItem | null;
  selectedUnit: number | null;
}

export default function Home() {
  const [view, setView] = useState<View>("setup");
  const [state, setState] = useState<InspectionState | null>(null);
  const [draft, setDraft] = useState<InspectionState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSubsystems, setOpenSubsystems] = useState<Set<string>>(new Set());
  const [openEntryIds, setOpenEntryIds] = useState<Set<string>>(new Set());
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
    if (saved) setDraft(saved);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  };

  const persist = (next: InspectionState) => {
    setState(next);
    saveState({ ...next, lastModified: Date.now() });
  };

  const handleStart = (meta: { base: string; intervencion: string; tecnico: string; fecha: string }) => {
    const next: InspectionState = {
      id: "insp_" + Date.now(),
      ...meta,
      entries: [],
      lastModified: Date.now(),
    };
    persist(next);
    setView("catalog");
  };

  const handleResumeDraft = () => {
    if (!draft) return;
    setState(draft);
    setView("catalog");
  };

  const handleFinishLater = () => {
    setView("setup");
    setDraft(state);
  };

  const handleFinalize = () => {
    if (!window.confirm("¿Finalizar la inspección? Se cerrará el registro actual.")) return;
    clearState();
    setState(null);
    setDraft(null);
    setSearchQuery("");
    setOpenSubsystems(new Set());
    setOpenEntryIds(new Set());
    setView("setup");
    showToast("Inspección finalizada");
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

  const handleRemoveEntry = (entryId: string) => {
    if (!state) return;
    const next = { ...state, entries: state.entries.filter((e) => e.entryId !== entryId) };
    persist(next);
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
    setState({ ...state, entries: state.entries.map((e) => (e.entryId === entryId ? { ...e, notes } : e)) });
  };

  const handleNotesBlur = () => {
    if (!state) return;
    persist(state);
  };

  const handleExportCsv = () => {
    if (!state) return;
    downloadCsv(state);
  };

  const handleExportPdf = async () => {
    if (!state) return;
    const { downloadPdf } = await import("@/lib/pdf");
    await downloadPdf(state);
    showToast("PDF generado correctamente");
  };

  if (view === "setup" || !state) {
    return (
      <div id="app">
        <SetupScreen draft={draft} onStart={handleStart} onResumeDraft={handleResumeDraft} />
        <Toast message={toastMsg} />
      </div>
    );
  }

  const pickerGroup = picker ? CATALOG.find((g) => g.sub === picker.sub) : null;

  return (
    <div id="app" onBlurCapture={handleNotesBlur}>
      <CatalogScreen
        state={state}
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
        onFinishLater={handleFinishLater}
        onFinalize={handleFinalize}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
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
