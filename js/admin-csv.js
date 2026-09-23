/**
 * Exportar/importar los pedidos como CSV (se abre directo en Excel).
 * Incluye BOM para que las tildes se vean bien, y un parser propio que
 * entiende comillas y comas dentro de un campo (por ejemplo, en la
 * dirección de entrega).
 */

const CSV_HEADERS = [
  "Fecha",
  "Nombre",
  "Cédula",
  "Teléfono",
  "Correo",
  "Lugar de entrega",
  "Reloj",
  "Encargado",
  "Medio de pago",
  "Precio",
  "Costo",
  "Ganancia",
  "Estado",
  "Notas",
];

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function ordersToCsv(orders) {
  const lines = [CSV_HEADERS.map(csvEscape).join(",")];
  orders.forEach((o) => {
    lines.push(
      [
        o.fecha,
        o.nombre,
        o.cedula,
        o.telefono,
        o.correo,
        o.lugar,
        o.reloj,
        o.vendedor,
        o.medioPago,
        o.precio,
        o.costo ?? "",
        calcGanancia(o) ?? "",
        o.estado,
        o.notas,
      ]
        .map(csvEscape)
        .join(",")
    );
  });
  return lines.join("\r\n");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignorar, \n lo maneja arriba
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell !== ""));
}

/**
 * Precio y costo se exportan siempre como enteros sin puntos ni comas
 * (String(60000) -> "60000"). Si Excel reformatea la columna con
 * separador de miles al reabrir/guardar el archivo (por ejemplo
 * "60.000"), Number("60.000") lo interpreta como 60 -- una pérdida de
 * datos silenciosa que arruinaría todos los cálculos de ganancia. Por
 * eso solo se acepta un entero "plano".
 */
function isPlainInteger(str) {
  return /^\d+$/.test(str);
}

/**
 * Valida una fila de datos del CSV antes de aceptarla, para que un
 * archivo editado a mano en Excel no meta un estado inventado o un
 * precio/costo corrupto sin que nadie se entere.
 */
function validateCsvRow(r, rowNumber) {
  // El gráfico mensual arma la fecha como `new Date(fecha + "T00:00:00")`,
  // que solo funciona con el formato AAAA-MM-DD exacto que usa el
  // formulario -- si Excel reformatea la columna al guardar (por ejemplo a
  // "15/09/2026"), esa fecha queda como "Invalid Date" sin ningún aviso.
  const fechaRaw = (r[0] || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaRaw)) {
    return `Fila ${rowNumber}: fecha "${fechaRaw || "vacía"}" no tiene el formato AAAA-MM-DD (¿Excel la reformateó al guardar?).`;
  }

  const estadoRaw = (r[12] || "").trim();
  if (estadoRaw && !ORDER_STATUSES.includes(estadoRaw)) {
    return `Fila ${rowNumber}: estado "${estadoRaw}" no reconocido (valores válidos: ${ORDER_STATUSES.join(", ")}).`;
  }
  const precioRaw = (r[9] || "").trim();
  if (!isPlainInteger(precioRaw) || Number(precioRaw) <= 0) {
    return `Fila ${rowNumber}: precio "${precioRaw || "vacío"}" no es un número entero válido (sin puntos, comas ni signos).`;
  }
  const costoRaw = (r[10] || "").trim();
  if (costoRaw && !isPlainInteger(costoRaw)) {
    return `Fila ${rowNumber}: costo "${costoRaw}" no es un número entero válido (sin puntos, comas ni signos).`;
  }
  return null;
}

/**
 * Los pedidos solo viven en el localStorage de este navegador -- sin
 * backup, un caché borrado o un cambio de equipo los pierde para
 * siempre. Este indicador recuerda cuándo fue el último CSV exportado.
 */
const BACKUP_KEY = "altitude_last_backup";
const BACKUP_WARN_DAYS = 7;

function updateBackupStatus() {
  const el = document.getElementById("backup-status");
  if (!el) return;
  let last = null;
  try {
    last = localStorage.getItem(BACKUP_KEY);
  } catch (e) {
    return;
  }

  if (!last) {
    el.textContent = "Nunca has exportado un backup";
    el.className = "backup-status backup-status--warn";
    return;
  }

  const days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
  if (days <= 0) {
    el.textContent = "Backup de hoy ✓";
    el.className = "backup-status backup-status--ok";
  } else if (days < BACKUP_WARN_DAYS) {
    el.textContent = `Backup hace ${days} día${days === 1 ? "" : "s"}`;
    el.className = "backup-status backup-status--ok";
  } else {
    el.textContent = `Backup hace ${days} días -- exporta de nuevo`;
    el.className = "backup-status backup-status--warn";
  }
}

function initCsvActions() {
  document.getElementById("export-csv").addEventListener("click", () => {
    const orders = loadOrders().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    const csv = "﻿" + ordersToCsv(orders); // BOM para que Excel lea tildes bien
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pedidos-altitude-watch-co-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`CSV descargado (${orders.length} pedido${orders.length === 1 ? "" : "s"}) ✓`);
    try {
      localStorage.setItem(BACKUP_KEY, new Date().toISOString());
    } catch (e) {
      // El backup ya se descargó igual; solo no queda registrado el indicador.
    }
    updateBackupStatus();
  });

  updateBackupStatus();

  document.getElementById("import-csv").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const rows = parseCsv(String(reader.result));
      if (rows.length < 2) {
        showToast("El archivo no tiene filas de datos para importar.", "error");
        e.target.value = "";
        return;
      }

      // Las columnas se leen por posición (r[0], r[1]...), así que si el
      // archivo tiene las columnas movidas, borradas o en otro orden -- por
      // ejemplo, editado en Excel -- cada dato caería en el campo
      // equivocado sin avisar. Antes de importar nada, se exige que el
      // encabezado coincida exactamente con el de un CSV exportado desde
      // aquí mismo.
      const headerRow = rows[0].map((h) => h.trim());
      const headersMatch = CSV_HEADERS.length === headerRow.length && CSV_HEADERS.every((expected, i) => headerRow[i] === expected);
      if (!headersMatch) {
        showToast("El archivo no tiene las columnas esperadas (¿se movieron, borraron o renombraron columnas?). Usa un CSV exportado desde aquí, sin cambiar el orden de las columnas.", "error");
        e.target.value = "";
        return;
      }

      const [, ...dataRows] = rows;

      // Cada fila se valida antes de importar ninguna -- un solo estado
      // inventado o un precio/costo corrupto (por ejemplo, reformateado
      // por Excel con separador de miles) no debe colarse en silencio.
      for (let i = 0; i < dataRows.length; i++) {
        const issue = validateCsvRow(dataRows[i], i + 2); // +2: la fila 1 es el encabezado
        if (issue) {
          showToast(`${issue} No se importó nada -- corrige el archivo e intenta de nuevo.`, "error");
          e.target.value = "";
          return;
        }
      }

      const imported = dataRows.map((r) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fecha: r[0] || "",
        nombre: r[1] || "",
        cedula: r[2] || "",
        telefono: r[3] || "",
        correo: r[4] || "",
        lugar: r[5] || "",
        reloj: r[6] || "",
        vendedor: r[7] || "",
        medioPago: r[8] || "",
        precio: Number(r[9]) || 0,
        costo: r[10] === "" || r[10] == null ? null : Number(r[10]),
        // r[11] es "Ganancia", una columna calculada — no se importa, se recalcula sola.
        estado: r[12] || "Pendiente",
        notas: r[13] || "",
        createdAt: new Date().toISOString(),
      }));

      const replace = await confirmDialog({
        title: "Importar CSV",
        message: `Se encontraron ${imported.length} pedido(s) en el archivo. ¿Reemplazar todos los pedidos actuales por estos, o agregarlos a la lista sin borrar nada?`,
        confirmLabel: "Reemplazar todo",
        cancelLabel: "Agregar a la lista",
        danger: true,
      });
      const current = loadOrders();
      if (!saveOrders(replace ? imported : [...current, ...imported])) return;
      renderOrders();
      showToast(`${imported.length} pedido(s) importado(s) ✓`);
      e.target.value = "";
    };
    reader.readAsText(file, "UTF-8");
  });
}
