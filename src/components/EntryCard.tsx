"use client";

import { CatalogItem, Entry, STATUS_DEFS, StatusKey, WorkType, WORKTYPES } from "@/lib/types";
import { ChevIcon, TrashIcon } from "./icons";

interface EntryCardProps {
  entry: Entry;
  item: CatalogItem;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onSetStatus: (status: StatusKey) => void;
  onSetWorktype: (worktype: WorkType) => void;
  onSetNotes: (notes: string) => void;
}

export default function EntryCard({
  entry,
  item,
  open,
  onToggle,
  onRemove,
  onSetStatus,
  onSetWorktype,
  onSetNotes,
}: EntryCardProps) {
  const stCls = entry.status ? STATUS_DEFS[entry.status].cls : "";
  const chipCls = entry.status ? STATUS_DEFS[entry.status].cls : "st-pending";
  const chipLabel = entry.status ? STATUS_DEFS[entry.status].label : "Sin definir";

  return (
    <div className={`unit-card ${stCls}`}>
      <div
        className="unit-card-head"
        onClick={onToggle}
        role="button"
        tabIndex={0}
      >
        <div className="unit-badge">{entry.unitNum}</div>
        <div className="unit-head-main">
          <div className="unit-head-name">{item.desc}</div>
          <div className="unit-head-sub">
            {item.fab} · {item.ref} · Unidad {entry.unitNum}/{item.cant}
          </div>
        </div>
        <div className={`unit-status-chip ${chipCls}`}>
          {entry.status ? `${STATUS_DEFS[entry.status].short} ` : ""}
          {chipLabel}
        </div>
        <button
          type="button"
          className="unit-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <TrashIcon />
        </button>
        <div className={`chev-wrap ${open ? "open" : ""}`}>
          <ChevIcon />
        </div>
      </div>
      {open && (
        <div className="unit-card-body open">
          <div className="unit-card-body-inner">
            <div className="status-grid">
              {(Object.entries(STATUS_DEFS) as [StatusKey, (typeof STATUS_DEFS)[StatusKey]][]).map(([key, def]) => (
                <div
                  key={key}
                  className={`status-opt ${entry.status === key ? def.selCls : ""}`}
                  onClick={() => onSetStatus(key)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="ic">{def.short}</span>
                  <span className="lb">{def.label}</span>
                </div>
              ))}
            </div>
            <div className="field-row">
              <label>Tipo de trabajo a realizar (si aplica)</label>
              <div className="worktype-row">
                {WORKTYPES.map((w) => (
                  <div
                    key={w}
                    className={`worktype-chip ${entry.worktype === w ? "sel" : ""}`}
                    onClick={() => onSetWorktype(w)}
                    role="button"
                    tabIndex={0}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>
            <div className="field-row" style={{ marginBottom: 0 }}>
              <label>Descripción de las acciones / observaciones</label>
              <textarea
                value={entry.notes}
                onChange={(e) => onSetNotes(e.target.value)}
                placeholder="Ej: limpieza de lente, sustitución de LED..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
