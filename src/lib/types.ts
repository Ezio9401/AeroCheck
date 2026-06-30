export type StatusKey = "util" | "cond" | "rep" | "inutil";

export type WorkType = "Correctiva" | "Preventiva";

export interface CatalogItem {
  id: string; // e.g. "1.1.1"
  fab: string;
  ref: string;
  noc: string;
  cant: number;
  desc: string;
}

export interface CatalogGroup {
  sub: string; // e.g. "1.1"
  subName: string;
  icon: string;
  parametros: string[];
  items: CatalogItem[];
}

export interface Entry {
  entryId: string;
  elemId: string;
  unitNum: number;
  status: StatusKey | null;
  worktype: WorkType | null;
  notes: string;
}

export interface InspectionState {
  id: string | null;
  base: string;
  intervencion: string;
  tecnico: string;
  fecha: string;
  entries: Entry[];
  lastModified?: number;
}

export interface StatusDef {
  label: string;
  short: string;
  desc: string;
  cls: string;
  selCls: string;
}

export const STATUS_DEFS: Record<StatusKey, StatusDef> = {
  util: {
    label: "Útil",
    short: "✔",
    desc: "Cumple todos los parámetros y requisitos.",
    cls: "st-util",
    selCls: "sel-util",
  },
  cond: {
    label: "Útil condicional",
    short: "⚠",
    desc: "Cumple, pero está cerca de incumplir.",
    cls: "st-cond",
    selCls: "sel-cond",
  },
  rep: {
    label: "Reparable",
    short: "R",
    desc: "Hay discrepancias subsanables tras reparación.",
    cls: "st-rep",
    selCls: "sel-rep",
  },
  inutil: {
    label: "Inútil",
    short: "✖",
    desc: "No cumple algún requisito. No debe usarse.",
    cls: "st-inutil",
    selCls: "sel-inutil",
  },
};

export const WORKTYPES: WorkType[] = ["Correctiva", "Preventiva"];
