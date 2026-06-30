"use client";

import { CatalogGroup, CatalogItem, Entry } from "@/lib/types";

interface AddBalizaSheetProps {
  group: CatalogGroup;
  entries: Entry[];
  selectedItem: CatalogItem | null;
  selectedUnit: number | null;
  onSelectItem: (item: CatalogItem) => void;
  onSelectUnit: (unit: number) => void;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function entriesForElem(entries: Entry[], elemId: string) {
  return entries.filter((e) => e.elemId === elemId);
}

export default function AddBalizaSheet({
  group,
  entries,
  selectedItem,
  selectedUnit,
  onSelectItem,
  onSelectUnit,
  onBack,
  onCancel,
  onConfirm,
}: AddBalizaSheetProps) {
  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="sheet">
        <div className="sheet-handle" />
        {!selectedItem ? (
          <>
            <div className="sheet-title">Añadir baliza</div>
            <div className="sheet-sub">
              {group.sub} · {group.subName} — elige el tipo de elemento
            </div>
            {group.items.map((it) => {
              const used = entriesForElem(entries, it.id).length;
              const full = used >= it.cant;
              return (
                <div
                  key={it.id}
                  className={`picker-item ${full ? "taken" : ""}`}
                  onClick={() => {
                    if (!full) onSelectItem(it);
                  }}
                >
                  <div className="picker-item-main">
                    <div className="picker-item-name">{it.desc}</div>
                    <div className="picker-item-sub">
                      {it.fab} · {it.ref}
                    </div>
                  </div>
                  <div className="picker-item-badge">
                    {used}/{it.cant}
                  </div>
                </div>
              );
            })}
            <div className="sheet-actions">
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sheet-title">{selectedItem.desc}</div>
            <div className="sheet-sub">
              {selectedItem.fab} · {selectedItem.ref} — elige el número de unidad
            </div>
            <div className="unit-select-grid">
              {Array.from({ length: selectedItem.cant }, (_, i) => i + 1).map((n) => {
                const used = new Set(entriesForElem(entries, selectedItem.id).map((e) => e.unitNum));
                const taken = used.has(n);
                const sel = selectedUnit === n;
                return (
                  <div
                    key={n}
                    className={`unit-select-btn ${taken ? "taken" : ""} ${sel ? "sel" : ""}`}
                    onClick={() => {
                      if (!taken) onSelectUnit(n);
                    }}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onBack}>
                Atrás
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1.4 }}
                disabled={!selectedUnit}
                onClick={onConfirm}
              >
                Añadir y continuar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
