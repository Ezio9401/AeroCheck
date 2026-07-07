import { BaseDef, CatalogGroup } from "./types";

export const INTERVENCION_DEFECTO = "Inspección inicial";

export const INTERVENCIONES = [
  "Inspección inicial",
  "Inspección periódica",
  "Inspección de mantenimiento",
  "Re-inspección",
];

export const PARAMETROS_BALIZAJE = [
  "1. Estado de conservación (roturas, grietas, fijación, alineación y nivelación)",
  "2. Funcionamiento (intensidad, color, parpadeo)",
  "3. Estado físico de las conexiones (trafos, cable, conexiones, aislamiento)",
];

const ICON_BALIZAJE = "💡";
const ICON_ALIMENTACION = "⚡";
const ICON_SMP = "🖥️";

const BHELEME_II_CATALOG: CatalogGroup[] = [
  {
    sub: "1.1",
    subName: "Subsistema de balizaje de plataforma",
    icon: ICON_BALIZAJE,
    parametros: PARAMETROS_BALIZAJE,
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
    icon: ICON_ALIMENTACION,
    parametros: ["Estado general de conservación", "Alarmas", "Ventilación", "Intensidad de salida"],
    items: [{ id: "1.2.1", fab: "YOUYANG", ref: "YCR5000 (CCR2)", noc: "6110-375235363", cant: 2, desc: "Reguladores" }],
  },
  {
    sub: "1.3",
    subName: "Subsistema de Sistema de Mando y Presentación (SMP)",
    icon: ICON_SMP,
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

const BHELA_I_CATALOG: CatalogGroup[] = [
  {
    sub: "1.1",
    subName: "Subsistema de balizaje de plataforma",
    icon: ICON_BALIZAJE,
    parametros: PARAMETROS_BALIZAJE,
    items: [
      { id: "1.1.1", fab: "ADB", ref: "NFT211", noc: "6210-33T134432", cant: 54, desc: "Baliza empotrada omnidireccional halógena 6,6A / 45W" },
      { id: "1.1.2", fab: "ADB", ref: "DGBC", noc: "6210-016295785", cant: 14, desc: "Baliza elevada halógena 6,6A / 45W" },
      { id: "1.1.3", fab: "ADB", ref: "DGBL", noc: "6210-33T099564", cant: 22, desc: "Baliza elevada halógena 6,6A / 45W" },
      { id: "1.1.4", fab: "ADB", ref: "DGBL", noc: "6210-33T099564", cant: 10, desc: "Baliza elevada halógena 6,6A / 45W" },
      { id: "1.1.5", fab: "ACISA", ref: "WC-8L", noc: "6660-33T133695", cant: 1, desc: "Manga de viento" },
      { id: "1.1.6", fab: "ADB", ref: "PHL90", noc: "6210-33T134431", cant: 8, desc: "Varias 6,6A / 2x45W=90W" },
    ],
  },
  {
    sub: "1.2",
    subName: "Subsistema de alimentación",
    icon: ICON_ALIMENTACION,
    parametros: ["Estado de conservación", "Alarmas", "Ventilación", "Intensidad de salida"],
    items: [
      { id: "1.2.1", fab: "YOUYANG", ref: "YCR5000 (CCR2-1051)", noc: "6110-375235363", cant: 2, desc: "Regulador de corriente constante 5000VA" },
    ],
  },
  {
    sub: "1.3",
    subName: "Subsistema de Sistema de Mando y Presentación (SMP)",
    icon: ICON_SMP,
    parametros: [
      "Estado de conservación",
      "Alarmas activas",
      "Ventilación",
      "Temperatura",
      "Ausencia de humedad",
      "Limpieza",
    ],
    items: [
      { id: "1.3.1", fab: "Schneider", ref: "TWDLCDE40DRF", noc: "5859-145699999", cant: 1, desc: "CPU Compacta tipo PLC TWIDO Alimentación 24V CC- 24E 24V CC" },
      { id: "1.3.2", fab: "ELO", ref: "2244L", noc: "7025-016415767", cant: 1, desc: "Pantalla táctil 22 pulgadas" },
    ],
  },
];

const BHELMA_IV_CATALOG: CatalogGroup[] = [
  {
    sub: "1.1",
    subName: "Subsistema de balizaje de plataforma",
    icon: ICON_BALIZAJE,
    parametros: PARAMETROS_BALIZAJE,
    items: [
      { id: "1.1.1", fab: "YOUYANG", ref: "ILD-TEDL-1-LED-04", noc: "6210-375288626", cant: 20, desc: "Baliza empotrada omnidireccional LED 6,6A, 1W" },
      { id: "1.1.2", fab: "YOUYANG", ref: "IMB-TCLL-S-1-040-2-01-01-1-C", noc: "6210-375306596", cant: 8, desc: "Baliza empotrada bidireccional halógena 40W" },
      { id: "1.1.3", fab: "YOUYANG", ref: "ILD-TEDL-1-LED-4", noc: "6210-375288626", cant: 8, desc: "Baliza empotrada omnidireccional LED 1W" },
      { id: "1.1.4", fab: "IDMAN", ref: "IDM 5552 N 105W W-C", noc: "6210-640001058", cant: 12, desc: "Baliza empotrada bidireccional halogena 105W" },
      { id: "1.1.5", fab: "IDMAN", ref: "IDM 5777 45/B", noc: "6210-640001059", cant: 12, desc: "Baliza elevada halógena 15W" },
      { id: "1.1.6", fab: "ADB", ref: "ADB FTO B", noc: "6210-33T099587", cant: 53, desc: "Baliza empotrada omnidireccional halógena 45W" },
      { id: "1.1.7", fab: "IDMAN", ref: "IDM 4552 N 40W G-GS", noc: "6210-6400001056", cant: 11, desc: "Baliza empotrada bidireccional halógena 45W" },
      { id: "1.1.8", fab: "IDMAN", ref: "IDM 5468/ 45W-B-S", noc: "6210-6400001057", cant: 16, desc: "Baliza empotrada omnidireccional halógena" },
      { id: "1.1.9", fab: "YOUYANG", ref: "PAPI 400", noc: "6210-375206914", cant: 8, desc: "PAPI halógeno (2x200W=400W)" },
      { id: "1.1.10", fab: "POWER LIGHTING", ref: "PWC-807-1U-ORW-HBA-A", noc: "6660-016088125", cant: 1, desc: "Manga de viento" },
    ],
  },
  {
    sub: "1.2",
    subName: "Subsistema de alimentación",
    icon: ICON_ALIMENTACION,
    parametros: ["Estado general de conservación", "Alarmas", "Ventilación", "Intensidad de salida"],
    items: [
      { id: "1.2.1", fab: "IDMAN", ref: "IDM 7000-P5-ST/5.0", noc: "6110-640001426", cant: 2, desc: "Regulador de corriente constante 5000VA" },
      { id: "1.2.2", fab: "IDMAN", ref: "IDM 8000-ESWU-PB/5/400", noc: "6110-640001425", cant: 2, desc: "Regulador de corriente constante 4000VA, 6,6A, 3 brillos" },
    ],
  },
  {
    sub: "1.3",
    subName: "Subsistema de Sistema de Mando y Presentación (SMP)",
    icon: ICON_SMP,
    parametros: [
      "Estado general de conservación",
      "Alarmas activas",
      "Ventilación",
      "Temperatura",
      "Ausencia de humedad",
      "Limpieza",
    ],
    items: [
      { id: "1.3.1", fab: "Schneider", ref: "TWDLCDE40DRF", noc: "5859-145699999", cant: 1, desc: "CPU Compacta tipo PLC TWIDO-Alimentación 24V CC- 24E 24V CC" },
      { id: "1.3.2", fab: "BEIJER", ref: "IX-T-15B", noc: "7025-332138572", cant: 1, desc: "Pantalla táctil 15 pulgadas (Módulo de presentación y gestor)" },
    ],
  },
];

/**
 * NOTA: en el PDF original de Coronel Maté, los Nro 1.1.3, 1.1.4 y 1.1.8 aparecen con DOS
 * referencias/NOC distintas cada uno (celda "Nro" fusionada en el formulario original), y la
 * extracción no deja 100% claro qué fabricante/referencia corresponde a cada NOC. Se han
 * reconstruido con la mejor correspondencia posible (sufijo ".2" para la segunda variante) —
 * conviene verificarlo contra el PDF original antes de dar por buena esta base.
 */
const CORONEL_MATE_CATALOG: CatalogGroup[] = [
  {
    sub: "1.1",
    subName: "Subsistema de balizaje de plataforma",
    icon: ICON_BALIZAJE,
    parametros: PARAMETROS_BALIZAJE,
    items: [
      { id: "1.1.1", fab: "ADB", ref: "FTO-3-045-O-C-0", noc: "6210-131217912", cant: 34, desc: "Baliza empotrada omnidireccional 45W" },
      { id: "1.1.2", fab: "ADB", ref: "FTO-3-045-O-C-0", noc: "6210-131217912", cant: 35, desc: "Baliza empotrada omnidireccional 45W" },
      { id: "1.1.3", fab: "ADB", ref: "FTO-3-045-O-G-0", noc: "6210-131217913", cant: 16, desc: "Baliza empotrada omnidireccional 45W" },
      { id: "1.1.3.2", fab: "ADB", ref: "1TOA33001103 / FTO-3-048-O-G-1", noc: "6210-33T105462", cant: 16, desc: "Baliza empotrada omnidireccional 45W (variante NOC)" },
      { id: "1.1.4", fab: "ADB", ref: "1TOA33001103 / FTO-3-048-O-G-1", noc: "6210-131218882", cant: 16, desc: "Baliza empotrada omnidireccional 48W" },
      { id: "1.1.4.2", fab: "ADB", ref: "FTO-3-048-O-G-1", noc: "6210-131214463", cant: 16, desc: "Baliza empotrada omnidireccional 48W (variante NOC)" },
      { id: "1.1.5", fab: "SAFEGATE", ref: "RCI 8 BSS WW 1C", noc: "6210-332130505", cant: 10, desc: "Baliza empotrada bidireccional" },
      { id: "1.1.6", fab: "ADB", ref: "DGBL", noc: "6210-33T099564", cant: 14, desc: "Baliza elevada" },
      { id: "1.1.7", fab: "SAFELED", ref: "TCI BWS GG 1C", noc: "6210-332101126", cant: 18, desc: "Baliza empotrada bidireccional" },
      { id: "1.1.8", fab: "SAFELED", ref: "TCI UWS G 1C", noc: "6210-33T090317", cant: 2, desc: "Baliza empotrada unidireccional" },
      { id: "1.1.8.2", fab: "SAFELED", ref: "TCI UWS G 1C", noc: "6210-33T137060", cant: 2, desc: "Baliza empotrada unidireccional (variante NOC)" },
      { id: "1.1.9", fab: "SAFELED", ref: "SBI BWS RR 1C", noc: "6210-332130504", cant: 2, desc: "Baliza empotrada 8 bidireccional de barra de parada LED" },
      { id: "1.1.10", fab: "ADB", ref: "PAPI 400", noc: "N/A", cant: 8, desc: "Elemento PAPI 2x100W (200W) 6,6A" },
      { id: "1.1.11", fab: "WEDGE", ref: "ARC-412 (S248/12-5-S)", noc: "6660-200067305", cant: 2, desc: "Manga de viento solar" },
    ],
  },
  {
    sub: "1.2",
    subName: "Subsistema de alimentación",
    icon: ICON_ALIMENTACION,
    parametros: ["Estado general de conservación", "Alarmas", "Ventilación", "Intensidad de salida"],
    items: [
      { id: "1.2.1", fab: "VELOCITY", ref: "VL.570.1.25.A.A.1.A", noc: "6110-332211661", cant: 4, desc: "Regulador de corriente constante 2,5kVA, 8 brillos" },
      { id: "1.2.2", fab: "ADB", ref: "TCR5000 4KW6.6-3-220V", noc: "5963-33T133482", cant: 4, desc: "Regulador de corriente constante 4000VA, 6,6A, 3 brillos" },
    ],
  },
  {
    sub: "1.3",
    subName: "Subsistema de Sistema de Mando y Presentación (SMP)",
    icon: ICON_SMP,
    parametros: [
      "Estado general de conservación",
      "Alarmas activas",
      "Ventilación",
      "Temperatura",
      "Ausencia de humedad",
      "Limpieza",
    ],
    items: [
      { id: "1.3.1", fab: "GECI", ref: "TWDLCDE40DRF", noc: "5859-145699999", cant: 1, desc: "CPU Compacta tipo PLC TWIDO Alimentación 24V CC- 24E 24V" },
      { id: "1.3.2", fab: "SCHNEIDER", ref: "TWDBTFU10M", noc: "N/A", cant: 1, desc: "Software Multilingüe TWIDOSUITE v 2.0 Programación" },
      { id: "1.3.3", fab: "DELL", ref: "OPTIPLEX 7010 DT", noc: "7021-016434588", cant: 1, desc: "Gestor de pantalla táctil (IntelCore i3 3240, 4GB, DDR3)" },
      { id: "1.3.4", fab: "ELO", ref: "2244L", noc: "7025-016415767", cant: 1, desc: "Pantalla táctil 22 pulgadas" },
    ],
  },
];

export const BASES: BaseDef[] = [
  {
    id: "BHELEME-II",
    nombre: "BHELEME-II",
    sistemaNombre: "Sistema de ayudas visuales 6,6 A (6210-131217912)",
    catalog: BHELEME_II_CATALOG,
  },
  {
    id: "BHELA-I",
    nombre: "BHELA-I",
    sistemaNombre: "Sistema de ayudas visuales 6,6 A (6210-33T127035)",
    catalog: BHELA_I_CATALOG,
  },
  {
    id: "BHELMA-IV",
    nombre: "BHELMA-IV",
    sistemaNombre: "Sistema de ayudas visuales 6,6 A (6210-33T127035)",
    catalog: BHELMA_IV_CATALOG,
  },
  {
    id: "Coronel Maté",
    nombre: "Coronel Maté",
    sistemaNombre: "Sistema de ayudas visuales 6,6 A (6210-33T127035)",
    catalog: CORONEL_MATE_CATALOG,
  },
];

/** Honest lookup: returns undefined for an unknown id (e.g. an orphaned draft). */
export function findBase(id: string): BaseDef | undefined {
  return BASES.find((b) => b.id === id);
}

/**
 * Returns the base for a known id. Throws on an unknown id instead of silently
 * falling back to another base, which would corrupt the record if a base id is
 * ever renamed. Only call this once the id is known valid (a started or resumed
 * inspection); use findBase() where an unknown id is possible.
 */
export function getBase(id: string): BaseDef {
  const base = findBase(id);
  if (!base) {
    throw new Error(`Base desconocida: "${id}". El borrador podría usar una base que ya no existe.`);
  }
  return base;
}

export function totalUnits(catalog: CatalogGroup[]): number {
  return catalog.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.cant, 0), 0);
}

export const ESTADO_FUNCIONAMIENTO_LEYENDA = [
  { codigo: "✔ Útil", texto: "Cumple todos los parámetros de funcionamiento y requisitos técnicos." },
  {
    codigo: "⚠ Útil condicional",
    texto:
      "Cumple todos los requisitos pero está cerca de incumplirlos, siendo apto para el uso con limitaciones en su uso.",
  },
  {
    codigo: "(R) Reparable",
    texto: "Cumple con algunos de los requisitos pero hay discrepancias que son subsanables, tras reparación podrá ser apto para el uso.",
  },
  { codigo: "✖ Inútil", texto: "No cumple con alguno de los requisitos. Las deficiencias no son subsanables, por lo que no debe usarse." },
];
