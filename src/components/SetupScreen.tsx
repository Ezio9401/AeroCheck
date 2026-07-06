"use client";

import { useState } from "react";
import { BASES, INTERVENCIONES, getBase, totalUnits } from "@/lib/data";
import { InspectionState } from "@/lib/types";
import { PlaneIcon } from "./icons";

interface SetupScreenProps {
  draft: InspectionState | null;
  onStart: (meta: { base: string; intervencion: string; tecnico: string; fecha: string }) => void;
  onResumeDraft: () => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function SetupScreen({ draft, onStart, onResumeDraft }: SetupScreenProps) {
  const [base, setBase] = useState(BASES[0].id);
  const [intervencion, setIntervencion] = useState(INTERVENCIONES[0]);
  const [tecnico, setTecnico] = useState("");
  const [fecha, setFecha] = useState(todayIso());
  const [error, setError] = useState(false);

  const handleStart = () => {
    if (!tecnico.trim()) {
      setError(true);
      return;
    }
    onStart({ base, intervencion, tecnico: tecnico.trim(), fecha });
  };

  const draftDone = draft?.entries.length ?? 0;
  const draftTotal = draft ? totalUnits(getBase(draft.base).catalog) : 0;
  const showResume = draft && draftDone > 0 && draftDone < draftTotal;

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

        {showResume && draft && (
          <>
            <div className="section-label">Inspección en curso</div>
            <div className="card setup-card" style={{ cursor: "pointer" }} onClick={onResumeDraft}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14.5px" }}>{draft.tecnico || "Sin técnico"}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "2px" }}>
                    {getBase(draft.base).nombre} · {draft.intervencion} · {draft.fecha}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "var(--navy)" }}>
                    {draftDone}/{draftTotal}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>unidades</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
