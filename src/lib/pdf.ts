import type { Table } from "jspdf-autotable";
import { blobToDataUrl, loadImageSize } from "./image";
import { getBase } from "./data";
import { problemEntriesForGroup } from "./report";
import { Entry, InspectionState, PhotoMap, STATUS_DEFS, StatusKey } from "./types";

// jspdf-autotable attaches the last drawn table to the doc but doesn't augment
// jsPDF's type, so expose it through the exported Table type instead of `any`.
type DocWithAutoTable = { lastAutoTable: Table };

const STATUS_COLOR: Record<StatusKey, [number, number, number]> = {
  util: [46, 158, 91],
  cond: [224, 180, 0],
  rep: [53, 99, 168],
  inutil: [214, 69, 69],
};

export async function downloadPdf(state: InspectionState, photos: PhotoMap) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const base = getBase(state.base);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
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
    `Base: ${base.nombre}     Intervención: ${state.intervencion}     Técnico ejecutor: ${state.tecnico}     Fecha: ${state.fecha}`,
    margin,
    40
  );

  let y = 70;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${base.sistemaNombre} · Balizas con incidencias`, margin, y);
  y += 4;

  let anyProblems = false;

  for (const group of base.catalog) {
    const itemsById = new Map(group.items.map((item) => [item.id, item]));
    const problemEntries = problemEntriesForGroup(group, state.entries);

    if (problemEntries.length === 0) continue;
    anyProblems = true;

    const rows: (string | { content: string; styles: { textColor: [number, number, number] } })[][] = [];
    const photoEntries: { entry: Entry; blob: Blob; label: string }[] = [];

    for (const entry of problemEntries) {
      const item = itemsById.get(entry.elemId)!;
      const blob = photos[entry.entryId];
      const estadoCell = entry.status
        ? { content: STATUS_DEFS[entry.status].label, styles: { textColor: STATUS_COLOR[entry.status] } }
        : { content: "Sin revisar", styles: { textColor: [150, 150, 150] as [number, number, number] } };
      rows.push([
        item.id,
        item.desc,
        item.fab,
        item.ref,
        item.noc,
        String(entry.unitNum),
        estadoCell,
        entry.worktype ?? "",
        entry.notes ?? "",
        blob ? "Sí" : "",
      ]);
      if (blob) {
        photoEntries.push({ entry, blob, label: `${item.id} · Unidad ${entry.unitNum} · ${item.fab} ${item.ref}` });
      }
    }

    autoTable(doc, {
      startY: y + 8,
      margin: { left: margin, right: margin },
      head: [
        [
          {
            content: `${group.sub} · ${group.subName}`,
            colSpan: 10,
            styles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold", halign: "left" },
          },
        ],
        ["Nro", "Elemento", "Fabricante", "Referencia/P-N", "NOC", "Unidad", "Estado", "Trabajo", "Observaciones", "Foto"],
      ],
      body: rows,
      styles: { fontSize: 7.5, cellPadding: 3, lineColor: [217, 211, 196], lineWidth: 0.5 },
      headStyles: { fillColor: [244, 241, 234], textColor: [11, 31, 58], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 249, 246] },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 100 },
        2: { cellWidth: 46 },
        3: { cellWidth: 72 },
        4: { cellWidth: 60 },
        5: { cellWidth: 32, halign: "center" },
        6: { cellWidth: 48, halign: "center", fontStyle: "bold" },
        7: { cellWidth: 42 },
        8: { cellWidth: "auto" },
        9: { cellWidth: 24, halign: "center" },
      },
    });

    y = ((doc as unknown as DocWithAutoTable).lastAutoTable.finalY ?? y) + 16;
    if (y > pageH - 80) {
      doc.addPage();
      y = 40;
    }

    if (photoEntries.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(11, 31, 58);
      doc.text("Fotografías registradas", margin, y);
      y += 12;

      const maxW = 130;
      const maxH = 95;
      const rowH = maxH + 22;
      let x = margin;

      for (const { blob, label } of photoEntries) {
        // Decode from the Blob only here, at export time, one at a time.
        const photo = await blobToDataUrl(blob);
        let w = maxW;
        let h = maxH;
        try {
          const size = await loadImageSize(photo);
          if (size.width && size.height) {
            const ratio = size.width / size.height;
            if (ratio >= maxW / maxH) {
              w = maxW;
              h = maxW / ratio;
            } else {
              h = maxH;
              w = maxH * ratio;
            }
          }
        } catch {
          // keep default box size if the image fails to decode
        }

        if (x + maxW > pageW - margin) {
          x = margin;
          y += rowH;
        }
        if (y + rowH > pageH - 30) {
          doc.addPage();
          y = 40;
          x = margin;
        }

        doc.addImage(photo, "JPEG", x, y, w, h);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        doc.text(label, x, y + maxH + 12, { maxWidth: maxW });
        x += maxW + 12;
      }

      y += rowH + 10;
      if (y > pageH - 80) {
        doc.addPage();
        y = 40;
      }
    }
  }

  if (!anyProblems) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("No se detectaron balizas con incidencias en esta inspección.", margin, y + 12);
  }

  const fname = `Inspeccion_AVA_${base.nombre}_${state.fecha}.pdf`.replace(/\s+/g, "_");
  doc.save(fname);
}
