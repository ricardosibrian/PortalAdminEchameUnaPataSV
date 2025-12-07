import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const safe = (v) => (v === undefined || v === null || v === "" ? "—" : v);

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

// Safe autoTable invoker: tries different module shapes/bundlers
async function callAutoTable(doc, options) {
  if (typeof autoTable === "function") {
    autoTable(doc, options);
    return;
  }

  if (typeof doc.autoTable === "function") {
    doc.autoTable(options);
    return;
  }

  // Last resort: dynamic import
  const mod = await import("jspdf-autotable");
  const fn = mod && (mod.default || mod.autoTable || mod);
  if (typeof fn === "function") {
    fn(doc, options);
    return;
  }

  throw new Error("autoTable plugin not found");
}

// Helper: load image and return HTMLImageElement (works in browser)
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image: " + url));
    img.src = url;
  });
}

// Draw header (logo centered + generation date). Called inside didDrawPage so it repeats per page.
function makeHeaderDrawer(img, dateString) {
  return function (data) {
    try {
      const doc = data.doc; // autoTable passes doc via data
      const pageWidth = doc.internal.pageSize.getWidth();

      // Draw logo centered near top
      const logoWidth = 60; // px/pt depending on unit
      const aspect = img.width / img.height || 1;
      const logoHeight = logoWidth / aspect;
      const x = (pageWidth - logoWidth) / 2;
      const y = 12; // small top margin

      // addImage accepts HTMLImageElement in browsers
      try {
        doc.addImage(img, "PNG", x, y, logoWidth, logoHeight);
      } catch {
        // some builds require dataURL: draw to canvas to extract dataURL
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          doc.addImage(dataUrl, "PNG", x, y, logoWidth, logoHeight);
        } catch (err2) {
          // ignore logo if it can't be drawn
          // eslint-disable-next-line no-console
          console.warn("Could not render logo in PDF header", err2);
        }
      }

      // Draw generation date beneath logo
      doc.setFontSize(10);
      doc.setTextColor(80);
      const dateY = y + logoHeight + 12;
      doc.text(dateString, pageWidth / 2, dateY, { align: "center" });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Error drawing PDF header", err);
    }
  };
}

export async function generateApplicationPdf(app) {
  try {
    // landscape A4, points
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const title = `solicitud_${safe(app.id)}`;

    // prepare logo and date
    const logoUrl = new URL("../assets/logo.png", import.meta.url).href;
    let img;
    try {
      img = await loadImage(logoUrl);
    } catch (err) {
      // if logo fails, continue without it
      img = null;
      // eslint-disable-next-line no-console
      console.warn("Logo could not be loaded for PDF header:", err);
    }
    const dateString = `Generado: ${new Intl.DateTimeFormat("es-SV", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())}`;

    // Title at top (we will include header via didDrawPage)
    doc.setFontSize(16);

    const tableBody = [
      ["ID", safe(app.id)],
      ["Solicitante", safe(app.personName)],
      ["Correo", safe(app.personEmail)],
      ["Dirección - Ciudad", safe(app.personAddress)],
      ["Fecha", formatDateTime(app.applicationDate)],
      ["Estado", safe(app.statusLabel || app.status)],
    ];

    const headerHeight = 12 + (img ? 60 / (img.width / img.height || 1) : 0) + 20; // approximate space for logo + date
    const startY = headerHeight + 10;

    await callAutoTable(doc, {
      startY: startY,
      margin: { top: startY, left: 14, right: 14 },
      head: [["Campo", "Valor"]],
      body: tableBody,
      styles: { fontSize: 11, overflow: "linebreak", cellWidth: "wrap" },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      tableWidth: "auto",
      didDrawPage: makeHeaderDrawer(img, dateString),
    });

    doc.save(`${title}.pdf`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error generating PDF:", err);
    throw err;
  }
}

export async function generateApplicationsPdf(apps = []) {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const title = `solicitudes_${new Date().toISOString().slice(0, 10)}`;

    // load logo
    const logoUrl = new URL("../assets/logo.png", import.meta.url).href;
    let img;
    try {
      img = await loadImage(logoUrl);
    } catch (err) {
      img = null;
      // eslint-disable-next-line no-console
      console.warn("Logo could not be loaded for PDF header:", err);
    }

    const dateString = `Generado: ${new Intl.DateTimeFormat("es-SV", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())}`;

    doc.setFontSize(16);
    doc.text("Solicitudes de adopciones", 14, 24);

    const head = [["#", "Solicitante", "Correo", "Dirección - Ciudad", "Fecha", "Estado"]];

    const body = apps.map((app) => [
      safe(app.serial),
      safe(app.personName),
      safe(app.personEmail),
      safe(app.personAddress),
      formatDateTime(app.applicationDate),
      safe(app.statusLabel || app.status),
    ]);

    const headerHeight = 12 + (img ? 60 / (img.width / img.height || 1) : 0) + 20; // same calculation
    const startY = headerHeight + 10;

    await callAutoTable(doc, {
      startY: startY,
      margin: { top: startY, left: 14, right: 14 },
      head,
      body,
      styles: { fontSize: 10, overflow: "linebreak", cellWidth: "wrap" },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
        4: { cellWidth: 90 },
        5: { cellWidth: 90 },
      },
      tableWidth: "auto",
      didDrawPage: makeHeaderDrawer(img, dateString),
      showHead: "everyPage",
    });

    doc.save(`${title}.pdf`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error generating applications PDF:", err);
    throw err;
  }
}

// Generic table exporter: title (string), head (array of header strings), body (array of arrays)
export async function generateTablePdf({ title = "reporte", head = [], body = [] } = {}) {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const filename = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;

    // load logo
    const logoUrl = new URL("../assets/logo.png", import.meta.url).href;
    let img;
    try {
      img = await loadImage(logoUrl);
    } catch (err) {
      img = null;
      // eslint-disable-next-line no-console
      console.warn("Logo could not be loaded for PDF header:", err);
    }

    const dateString = `Generado: ${new Intl.DateTimeFormat("es-SV", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())}`;

    // draw a title on the first page (optional) - center is handled by header drawer anyway
    doc.setFontSize(16);
    doc.text(title, 14, 24);

    // compute header height and startY similar to other functions
    const headerHeight = 12 + (img ? 60 / (img.width / img.height || 1) : 0) + 20;
    const startY = headerHeight + 10;

    // ensure head is nested array of arrays for autoTable
    const headRows = head && head.length ? [head] : [];

    await callAutoTable(doc, {
      startY,
      margin: { top: startY, left: 14, right: 14 },
      head: headRows,
      body,
      styles: { fontSize: 10, overflow: "linebreak", cellWidth: "wrap" },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      tableWidth: "auto",
      didDrawPage: makeHeaderDrawer(img, dateString),
      showHead: "everyPage",
    });

    doc.save(`${filename}.pdf`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error generating table PDF:", err);
    throw err;
  }
}
