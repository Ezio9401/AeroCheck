import { loadImageSize } from "./image";
import { CATALOG, SISTEMA_NOMBRE } from "./data";
import { Entry, InspectionState, STATUS_DEFS, StatusKey } from "./types";

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
    const photoEntries: { entry: Entry; label: string }[] = [];

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
          entry?.photo ? "Sí" : "",
        ]);
        if (entry?.photo) {
          photoEntries.push({ entry, label: `${item.id} · Unidad ${n} · ${item.fab} ${item.ref}` });
        }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 16;
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

      for (const { entry, label } of photoEntries) {
        if (!entry.photo) continue;
        let w = maxW;
        let h = maxH;
        try {
          const size = await loadImageSize(entry.photo);
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

        doc.addImage(entry.photo, "JPEG", x, y, w, h);
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

  const fname = `Inspeccion_AVA_${state.base}_${state.fecha}.pdf`.replace(/\s+/g, "_");
  doc.save(fname);
}
