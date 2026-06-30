import { CATALOG, SISTEMA_NOMBRE } from "./data";
import { InspectionState, STATUS_DEFS, StatusKey } from "./types";

const STATUS_COLOR: Record<StatusKey, [number, number, number]> = {
  util: [46, 158, 91],
  cond: [224, 180, 0],
  rep: [53, 99, 168],
  inutil: [214, 69, 69],
};

export async function downloadPdf(state: InspectionState) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 28;

  doc.setFillColor(11, 31, 58);
  doc.rect(0, 0, pageW, 54, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("INSPECCIÓN DEL ESTADO DE LAS AYUDAS VISUALES DE PLATAFORMAS AERONÁUTICA", margin, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Base: ${state.base}     Intervención: ${state.intervencion}     Técnico ejecutor: ${state.tecnico}     Fecha: ${state.fecha}`,
    margin,
    40
  );

  let y = 70;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(SISTEMA_NOMBRE, margin, y);
  y += 4;

  for (const group of CATALOG) {
    const rows: (string | { content: string; styles: { textColor: [number, number, number] } })[][] = [];

    for (const item of group.items) {
      for (let n = 1; n <= item.cant; n++) {
        const entry = state.entries.find((e) => e.elemId === item.id && e.unitNum === n);
        const estadoCell = entry?.status
          ? { content: STATUS_DEFS[entry.status].label, styles: { textColor: STATUS_COLOR[entry.status] } }
          : { content: "Sin revisar", styles: { textColor: [150, 150, 150] as [number, number, number] } };
        rows.push([
          item.id,
          item.desc,
          item.fab,
          item.ref,
          item.noc,
          `${n}/${item.cant}`,
          estadoCell,
          entry?.worktype ?? "",
          entry?.notes ?? "",
        ]);
      }
    }

    autoTable(doc, {
      startY: y + 8,
      margin: { left: margin, right: margin },
      head: [
        [
          {
            content: `${group.sub} · ${group.subName}`,
            colSpan: 9,
            styles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold", halign: "left" },
          },
        ],
        ["Nro", "Elemento", "Fabricante", "Referencia/P-N", "NOC", "Unidad", "Estado", "Trabajo", "Observaciones"],
      ],
      body: rows,
      styles: { fontSize: 7.5, cellPadding: 3, lineColor: [217, 211, 196], lineWidth: 0.5 },
      headStyles: { fillColor: [244, 241, 234], textColor: [11, 31, 58], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 249, 246] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 110 },
        2: { cellWidth: 50 },
        3: { cellWidth: 80 },
        4: { cellWidth: 65 },
        5: { cellWidth: 34, halign: "center" },
        6: { cellWidth: 52, halign: "center", fontStyle: "bold" },
        7: { cellWidth: 45 },
        8: { cellWidth: "auto" },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 16;
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      y = 40;
    }
  }

  const fname = `Inspeccion_AVA_${state.base}_${state.fecha}.pdf`.replace(/\s+/g, "_");
  doc.save(fname);
}
