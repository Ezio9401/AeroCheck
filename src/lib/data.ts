import { CatalogGroup } from "./types";

export const SISTEMA_NOMBRE = "Sistema de ayudas visuales 6,6 A (6210-131217912)";

export const BASES = ["BHELEME-II"];

export const INTERVENCIONES = [
  "Inspección inicial",
  "Inspección periódica",
  "Inspección de mantenimiento",
  "Re-inspección",
];

export const CATALOG: CatalogGroup[] = [
  {
    sub: "1.1",
    subName: "Subsistema de balizaje de plataforma",
    icon: "💡",
    parametros: [
      "Estado de conservación (roturas, grietas, fijación, alineación y nivelación)",
      "Funcionamiento (intensidad, color, parpadeo)",
      "Estado físico de las conexiones (trafos, cable, conexiones, aislamiento)",
    ],
    items: [
      { id: "1.1.1", fab: "THORN", ref: "EL-EAM BSP+CONN", noc: "6210-332101130", cant: 20, desc: "Baliza elevada halógena 45W" },
      { id: "1.1.2", fab: "SAFELED", ref: "SBI UWS R 1C (13510)", noc: "6210-332101127", cant: 12, desc: "Baliza empotrada unidireccional LED 6,6A 8W" },
      { id: "1.1.3", fab: "SAFELED", ref: "TCI UWS F 1C (13566)", noc: "6210-640004426", cant: 12, desc: "Baliza empotrada bidireccional LED 6,6A 8W" },
      { id: "1.1.4", fab: "SAFELED", ref: "TCI BWS GG 1C", noc: "6210-332101126", cant: 12, desc: "Baliza empotrada bidireccional LED 6,6A 8W por dirección" },
      { id: "1.1.5", fab: "THORN", ref: "IN-OMA-C (12685)", noc: "6210-332101131", cant: 8, desc: "Baliza empotrada omnidireccional halógena 45W" },
      { id: "1.1.6", fab: "THORN", ref: "INL-RC 1C W/W (12777)", noc: "6210-332101132", cant: 12, desc: "Baliza empotrada bidireccional halógena (2x45=90W)" },
      { id: "1.1.7", fab: "SAFELED", ref: "TE E O B BSP 6,6A", noc: "6210-332101133", cant: 12, desc: "Baliza elevada LED 15W" },
      { id: "1.1.8", fab: "SAFELED", ref: "TCI BWS GG 1C (13508)", noc: "6210-332101126", cant: 7, desc: "Baliza empotrada bidireccional LED (8x8=16W)" },
      { id: "1.1.9", fab: "SAFELED", ref: "TCI BCS GG 1C (13511)", noc: "6210-332101124", cant: 4, desc: "Baliza empotrada bidireccional LED (8x8=16W)" },
      { id: "1.1.10", fab: "YOUYANG", ref: "IMD-TCLL-S-1-06-2-01-1", noc: "6210-375235360", cant: 9, desc: "Baliza empotrada bidireccional LED (6x6=12W)" },
      { id: "1.1.11", fab: "SAFELED", ref: "TCI BCS YG 1C (13507)", noc: "6210-332101135", cant: 2, desc: "Baliza empotrada bidireccional LED (8x8=16W)" },
      { id: "1.1.12", fab: "SAFELED", ref: "TCI BCS GY 1C (13506)", noc: "6210-3321011125", cant: 2, desc: "Baliza empotrada bidireccional LED (8x8=16W)" },
      { id: "1.1.13", fab: "YOUYANG", ref: "ILD-TEDL-1-LED-03 VERDE", noc: "6210-375252702", cant: 17, desc: "Baliza empotrada omnidireccional LED 6,6A, 1W" },
      { id: "1.1.14", fab: "YOUYANG", ref: "ELB TEDL-003-1", noc: "6210-375235361", cant: 16, desc: "Baliza elevada LED 3W" },
      { id: "1.1.15", fab: "YOUYANG", ref: "PAPI 400", noc: "6210-375206914", cant: 4, desc: "PAPI halógeno (2x200W=400W)" },
      { id: "1.1.16", fab: "WEDGE", ref: "ARC-412 (S248/12-5-S)", noc: "6660-2000067305", cant: 1, desc: "Manga de viento solar" },
    ],
  },
  {
    sub: "1.2",
    subName: "Subsistema de alimentación",
    icon: "⚡",
    parametros: ["Estado general de conservación", "Alarmas", "Ventilación", "Intensidad de salida"],
    items: [{ id: "1.2.1", fab: "YOUYANG", ref: "YCR5000 (CCR2)", noc: "6110-375235363", cant: 2, desc: "Reguladores" }],
  },
  {
    sub: "1.3",
    subName: "Subsistema de Sistema de Mando y Presentación (SMP)",
    icon: "🖥️",
    parametros: [
      "Estado general de conservación",
      "Alarmas activas",
      "Ventilación",
      "Temperatura",
      "Ausencia de humedad",
      "Limpieza",
    ],
    items: [
      { id: "1.3.1", fab: "Schneider", ref: "TWDLCDE40DRF", noc: "5859-145699999", cant: 1, desc: "CPU Compacta tipo PLC TWIDO Alimentación 24V CC- 24E 24V CC-16S" },
      { id: "1.3.2", fab: "BEIJER", ref: "IX-T-15B", noc: "7025-332138572", cant: 1, desc: "Pantalla táctil 15 pulgadas" },
    ],
  },
];

export function totalUnits(): number {
  return CATALOG.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.cant, 0), 0);
}
