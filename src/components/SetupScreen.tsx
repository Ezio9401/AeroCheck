"use client";

import { useRef, useState } from "react";
import { BASES, INTERVENCIONES, findBase, totalUnits } from "@/lib/data";
import { InspectionState } from "@/lib/types";
import { PlaneIcon, TrashIcon } from "./icons";

interface SetupScreenProps {
  drafts: InspectionState[];
  onStart: (meta: { base: string; intervencion: string; tecnico: string; fecha: string }) => void;
  onResumeDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onImportBackup: (file: File) => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function SetupScreen({ drafts, onStart, onResumeDraft, onDeleteDraft, onImportBackup }: SetupScreenProps) {
  const [base, setBase] = useState(BASES[0].id);
  const [intervencion, setIntervencion] = useState(INTERVENCIONES[0]);
  const [tecnico, setTecnico] = useState("");
  const [fecha, setFecha] = useState(todayIso());
  const [error, setError] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onImportBackup(file);
  };

  const handleStart = () => {
    if (!tecnico.trim()) {
      setError(true);
      return;
    }
    onStart({ base, intervencion, tecnico: tecnico.trim(), fecha });
  };

  const sortedDrafts = [...drafts].sort((a, b) => (b.lastModified ?? 0) - (a.lastModified ?? 0));

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <div className="brand-mark">
              <PlaneIcon />
            </div>
            <div className="brand-text">
              <div className="t2">MEGA - Aerocheck</div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="section-label">Datos de la inspección</div>
        <div className="card setup-card">
          <div className="field">
            <label>Base</label>
            <select value={base} onChange={(e) => setBase(e.target.value)}>
              {BASES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Intervención</label>
            <select value={intervencion} onChange={(e) => setIntervencion(e.target.value)}>
              {INTERVENCIONES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Técnico ejecutor</label>
            <input
              type="text"
              placeholder="Nombre y apellidos"
              autoComplete="off"
              value={tecnico}
              onChange={(e) => {
                setTecnico(e.target.value);
                setError(false);
              }}
              style={error ? { borderColor: "var(--red)" } : undefined}
            />
          </div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleStart}>
            Comenzar inspección
          </button>
        </div>

        {sortedDrafts.length > 0 && (
          <>
            <div className="section-label">Inspecciones pendientes</div>
            {sortedDrafts.map((d) => {
              const dBase = findBase(d.base);
              const done = d.entries.length;
              const total = dBase ? totalUnits(dBase.catalog) : 0;
              return (
                <div
                  key={d.id}
                  className="card setup-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => d.id && onResumeDraft(d.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14.5px" }}>{d.tecnico || "Sin técnico"}</div>
                      <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "2px" }}>
                        {dBase ? dBase.nombre : `Base desconocida (${d.base})`} · {d.intervencion} · {d.fecha}
                      </div>
                      {!dBase && (
                        <div style={{ fontSize: "11.5px", color: "var(--red)", marginTop: "3px", fontWeight: 600 }}>
                          Base no reconocida — no se puede abrir
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "var(--navy)" }}>
                          {done}/{total}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>unidades</div>
                      </div>
                      <button
                        type="button"
                        className="btn-ghost"
                        aria-label="Eliminar inspección"
                        style={{ padding: "6px", lineHeight: 0, color: "var(--red)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (d.id) onDeleteDraft(d.id);
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        <div className="section-label">Copia de seguridad</div>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%" }}
          onClick={() => importInputRef.current?.click()}
        >
          Importar inspección (JSON)
        </button>
      </main>
    </>
  );
}
