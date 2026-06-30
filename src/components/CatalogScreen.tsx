"use client";

import { CATALOG } from "@/lib/data";
import { Entry, InspectionState, StatusKey, WorkType } from "@/lib/types";
import { DownloadIcon, PlaneIcon, SearchIcon } from "./icons";
import SubsystemBlock from "./SubsystemBlock";

interface CatalogScreenProps {
  state: InspectionState;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  openSubsystems: Set<string>;
  onToggleSubsystem: (sub: string) => void;
  openEntryIds: Set<string>;
  onToggleEntry: (entryId: string) => void;
  onAddBaliza: (sub: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onSetStatus: (entryId: string, status: StatusKey) => void;
  onSetWorktype: (entryId: string, worktype: WorkType) => void;
  onSetNotes: (entryId: string, notes: string) => void;
  onFinishLater: () => void;
  onFinalize: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
}

export default function CatalogScreen({
  state,
  searchQuery,
  onSearchChange,
  openSubsystems,
  onToggleSubsystem,
  openEntryIds,
  onToggleEntry,
  onAddBaliza,
  onRemoveEntry,
  onSetStatus,
  onSetWorktype,
  onSetNotes,
  onFinishLater,
  onFinalize,
  onExportPdf,
  onExportCsv,
}: CatalogScreenProps) {
  const q = searchQuery.trim().toLowerCase();
  const groups = CATALOG.map((group) => {
    const items = group.items.filter((it) => {
      if (!q) return true;
      return (it.desc + it.fab + it.ref + it.id).toLowerCase().includes(q);
    });
    return { group, items };
  }).filter(({ items }) => !(q && items.length === 0));

  const entriesByGroup = (sub: string): Entry[] => {
    const ids = CATALOG.find((g) => g.sub === sub)?.items.map((i) => i.id) ?? [];
    return state.entries.filter((e) => ids.includes(e.elemId));
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <div className="brand-mark">
              <PlaneIcon />
            </div>
            <div className="brand-text">
              <div className="t1">{state.base}</div>
              <div className="t2">{state.intervencion}</div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar baliza, fabricante o referencia..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div>
          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="em">🔍</div>
              No se encontraron elementos.
            </div>
          ) : (
            groups.map(({ group }) => (
              <SubsystemBlock
                key={group.sub}
                group={group}
                entries={entriesByGroup(group.sub)}
                open={openSubsystems.has(group.sub)}
                onToggle={() => onToggleSubsystem(group.sub)}
                onAddBaliza={() => onAddBaliza(group.sub)}
                openEntryIds={openEntryIds}
                onToggleEntry={onToggleEntry}
                onRemoveEntry={onRemoveEntry}
                onSetStatus={onSetStatus}
                onSetWorktype={onSetWorktype}
                onSetNotes={onSetNotes}
              />
            ))
          )}
        </div>
      </main>
      <div className="bottom-bar">
        <div className="bottom-inner" style={{ flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onFinishLater}>
              Finalizar más tarde
            </button>
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onFinalize}>
              Finalizar inspección
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onExportCsv}>
              Exportar CSV
            </button>
            <button type="button" className="btn btn-amber" style={{ flex: 1 }} onClick={onExportPdf}>
              <DownloadIcon /> Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
