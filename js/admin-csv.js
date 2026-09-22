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
  });

  document.getElementById("import-csv").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result));
      if (rows.length < 2) {
        alert("El archivo no tiene filas de datos para importar.");
        e.target.value = "";
        return;
      }
      const [, ...dataRows] = rows;
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

      const replace = confirm(
        `Se encontraron ${imported.length} pedido(s) en el archivo.\n\nAceptar = reemplazar todos los pedidos actuales por estos.\nCancelar = agregarlos a la lista actual (sin borrar nada).`
      );
      const current = loadOrders();
      saveOrders(replace ? imported : [...current, ...imported]);
      renderOrders();
      e.target.value = "";
    };
    reader.readAsText(file, "UTF-8");
  });
}
