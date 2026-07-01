"use client";

import { CatalogGroup, Entry, PhotoMap, StatusKey, WorkType } from "@/lib/types";
import { ChevIcon, PlusIcon } from "./icons";
import EntryCard from "./EntryCard";

interface SubsystemBlockProps {
  group: CatalogGroup;
  entries: Entry[];
  photos: PhotoMap;
  open: boolean;
  onToggle: () => void;
  onAddBaliza: () => void;
  openEntryIds: Set<string>;
  onToggleEntry: (entryId: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onSetStatus: (entryId: string, status: StatusKey) => void;
  onSetWorktype: (entryId: string, worktype: WorkType) => void;
  onSetNotes: (entryId: string, notes: string) => void;
  onSetPhoto: (entryId: string, photo: string | null) => void;
}

export default function SubsystemBlock({
  group,
  entries,
  photos,
  open,
  onToggle,
  onAddBaliza,
  openEntryIds,
  onToggleEntry,
  onRemoveEntry,
  onSetStatus,
  onSetWorktype,
  onSetNotes,
  onSetPhoto,
}: SubsystemBlockProps) {
  const total = group.items.reduce((a, i) => a + i.cant, 0);
  const done = entries.length;
  const hasInutil = entries.some((e) => e.status === "inutil");
  const hasRep = entries.some((e) => e.status === "rep");
  const hasCond = entries.some((e) => e.status === "cond");

  let badgeColor: string | undefined;
  if (done > 0) badgeColor = "var(--runway)";
  if (hasCond) badgeColor = "var(--amber-dim)";
  if (hasRep) badgeColor = "#3563A8";
  if (hasInutil) badgeColor = "var(--red)";

  const sorted = [...entries].sort((a, b) => {
    if (a.elemId !== b.elemId) return a.elemId.localeCompare(b.elemId, undefined, { numeric: true });
    return a.unitNum - b.unitNum;
  });

  return (
    <div className="subsystem-block">
      <div className="subsystem-header" onClick={onToggle} role="button" tabIndex={0}>
        <div className="subsystem-icon">{group.icon}</div>
        <div className="subsystem-main">
          <div className="subsystem-name">
            {group.sub} · {group.subName}
          </div>
          <div className="subsystem-meta">
            {group.items.length} tipos de elemento · {total} unidades en total
          </div>
        </div>
        <div className={`subsystem-count ${done === 0 ? "zero" : ""}`} style={badgeColor ? { background: badgeColor } : undefined}>
          {done}/{total}
        </div>
        <div className={`chev-wrap ${open ? "open" : ""}`}>
          <ChevIcon />
        </div>
      </div>
      {open && (
        <div className="subsystem-body open">
          <div className="subsystem-body-inner">
            <div className="param-hint">
              <b>Parámetros a verificar</b>
              {group.parametros.join(" · ")}
            </div>
            <button type="button" className="add-baliza-btn" onClick={onAddBaliza}>
              <PlusIcon /> Añadir baliza de este subsistema
            </button>
            {sorted.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 16px" }}>
                <div className="em">📋</div>
                Aún no has añadido balizas de este subsistema.
                <br />
                Usa el botón de arriba para empezar.
              </div>
            ) : (
              sorted.map((entry) => {
                const item = group.items.find((i) => i.id === entry.elemId);
                if (!item) return null;
                return (
                  <EntryCard
                    key={entry.entryId}
                    entry={entry}
                    item={item}
                    photo={photos[entry.entryId] ?? null}
                    open={openEntryIds.has(entry.entryId)}
                    onToggle={() => onToggleEntry(entry.entryId)}
                    onRemove={() => onRemoveEntry(entry.entryId)}
                    onSetStatus={(status) => onSetStatus(entry.entryId, status)}
                    onSetWorktype={(worktype) => onSetWorktype(entry.entryId, worktype)}
                    onSetNotes={(notes) => onSetNotes(entry.entryId, notes)}
                    onSetPhoto={(photo) => onSetPhoto(entry.entryId, photo)}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
