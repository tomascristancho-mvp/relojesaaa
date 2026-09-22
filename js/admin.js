/**
 * Lógica del panel privado: candado de acceso, formulario de pedidos,
 * tabla, estadísticas y exportar/importar CSV (Excel).
 *
 * Los pedidos se guardan con localStorage: solo existen en el navegador
 * donde los escribiste. Exporta a CSV seguido para tener una copia de
 * respaldo fuera del navegador.
 */

const STORAGE_KEY = "altitude_orders_v1";
const UNLOCK_KEY = "altitude_admin_unlocked";

const CSV_HEADERS = [
  "Fecha",
  "Nombre",
  "Cédula",
  "Teléfono",
  "Correo",
  "Lugar de entrega",
  "Reloj",
  "Medio de pago",
  "Precio",
  "Estado",
  "Notas",
];

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("No se pudieron leer los pedidos guardados", e);
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function formatCOP(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(num);
}

/* ============ CANDADO DE ACCESO ============ */
function initLock() {
  const lockScreen = document.getElementById("lock-screen");
  const app = document.getElementById("admin-app");
  const form = document.getElementById("lock-form");
  const input = document.getElementById("lock-input");
  const error = document.getElementById("lock-error");

  function unlock() {
    lockScreen.hidden = true;
    app.hidden = false;
    initAdminApp();
  }

  if (sessionStorage.getItem(UNLOCK_KEY) === "true") {
    unlock();
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value === ADMIN_CONFIG.passcode) {
      sessionStorage.setItem(UNLOCK_KEY, "true");
      error.hidden = true;
      unlock();
    } else {
      error.hidden = false;
      input.value = "";
      input.focus();
    }
  });
}

/* ============ APP (una vez desbloqueado) ============ */
function initAdminApp() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem(UNLOCK_KEY);
    window.location.reload();
  });

  populateRelojOptions();
  initOrderForm();
  initCsvActions();
  initDetailModal();
  renderOrders();

  document.getElementById("order-fecha").value = new Date().toISOString().slice(0, 10);
}

function populateRelojOptions() {
  const datalist = document.getElementById("reloj-options");
  const precioInput = document.getElementById("order-precio");
  const relojInput = document.getElementById("order-reloj");

  (typeof WATCHES !== "undefined" ? WATCHES : []).forEach((w) => {
    const opt = document.createElement("option");
    opt.value = `${w.referencia} — ${w.marca} ${w.nombre}`;
    datalist.appendChild(opt);
  });

  relojInput.addEventListener("change", () => {
    const match = (typeof WATCHES !== "undefined" ? WATCHES : []).find((w) => relojInput.value.startsWith(w.referencia));
    if (match && precioInput.dataset.touched !== "true" && match.precio != null) {
      precioInput.value = match.precio;
    }
  });
  precioInput.addEventListener("input", () => {
    precioInput.dataset.touched = "true";
  });
}

/* ============ FORMULARIO ============ */
function initOrderForm() {
  const form = document.getElementById("order-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const order = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fecha: document.getElementById("order-fecha").value,
      nombre: document.getElementById("order-nombre").value.trim(),
      cedula: document.getElementById("order-cedula").value.trim(),
      telefono: document.getElementById("order-telefono").value.trim(),
      correo: document.getElementById("order-correo").value.trim(),
      lugar: document.getElementById("order-lugar").value.trim(),
      reloj: document.getElementById("order-reloj").value.trim(),
      medioPago: document.getElementById("order-pago").value,
      precio: Number(document.getElementById("order-precio").value) || 0,
      estado: document.getElementById("order-estado").value,
      notas: document.getElementById("order-notas").value.trim(),
      createdAt: new Date().toISOString(),
    };

    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);
    renderOrders();

    form.reset();
    document.getElementById("order-fecha").value = new Date().toISOString().slice(0, 10);
    document.getElementById("order-estado").value = "Pendiente";
    document.getElementById("order-precio").dataset.touched = "false";
    document.getElementById("order-nombre").focus();
  });
}

/* ============ TABLA Y ESTADÍSTICAS ============ */
function renderOrders() {
  const orders = loadOrders().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const tbody = document.getElementById("orders-tbody");
  tbody.innerHTML = "";

  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.fecha || ""}</td>
      <td>${escapeHtml(order.nombre)}</td>
      <td>${escapeHtml(order.reloj)}</td>
      <td>${escapeHtml(order.medioPago)}</td>
      <td>${formatCOP(order.precio)}</td>
      <td><span class="status-badge status-badge--${slug(order.estado)}">${escapeHtml(order.estado)}</span></td>
      <td class="orders-table__actions"></td>
    `;
    const actionsCell = tr.querySelector(".orders-table__actions");

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "icon-btn";
    viewBtn.title = "Ver detalle";
    viewBtn.textContent = "👁";
    viewBtn.addEventListener("click", () => openDetail(order));
    actionsCell.appendChild(viewBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "icon-btn";
    delBtn.title = "Eliminar pedido";
    delBtn.textContent = "🗑";
    delBtn.addEventListener("click", () => {
      if (confirm(`¿Eliminar el pedido de ${order.nombre || "este cliente"}? Esta acción no se puede deshacer.`)) {
        saveOrders(loadOrders().filter((o) => o.id !== order.id));
        renderOrders();
      }
    });
    actionsCell.appendChild(delBtn);

    tbody.appendChild(tr);
  });

  document.getElementById("orders-empty").hidden = orders.length !== 0;
  document.getElementById("orders-table").hidden = orders.length === 0;

  document.getElementById("stat-total").textContent = orders.length;
  const revenue = orders.filter((o) => o.estado !== "Cancelado").reduce((sum, o) => sum + (Number(o.precio) || 0), 0);
  document.getElementById("stat-revenue").textContent = formatCOP(revenue);
  document.getElementById("stat-pending").textContent = orders.filter((o) => o.estado === "Pendiente").length;
}

function slug(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ============ DETALLE DE UN PEDIDO ============ */
function initDetailModal() {
  const modal = document.getElementById("order-detail");
  document.getElementById("detail-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

function openDetail(order) {
  const body = document.getElementById("detail-body");
  const rows = [
    ["Fecha", order.fecha],
    ["Nombre", order.nombre],
    ["Cédula", order.cedula],
    ["Teléfono", order.telefono],
    ["Correo", order.correo || "—"],
    ["Lugar de entrega", order.lugar],
    ["Reloj", order.reloj],
    ["Medio de pago", order.medioPago],
    ["Precio", formatCOP(order.precio)],
    ["Estado", order.estado],
    ["Notas", order.notas || "—"],
  ];
  body.innerHTML =
    `<h3>Detalle del pedido</h3><dl class="admin-detail-list">` +
    rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("") +
    `</dl>`;
  document.getElementById("order-detail").showModal();
}

/* ============ CSV: EXPORTAR / IMPORTAR ============ */
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
      [o.fecha, o.nombre, o.cedula, o.telefono, o.correo, o.lugar, o.reloj, o.medioPago, o.precio, o.estado, o.notas]
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
        medioPago: r[7] || "",
        precio: Number(r[8]) || 0,
        estado: r[9] || "Pendiente",
        notas: r[10] || "",
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

document.addEventListener("DOMContentLoaded", initLock);
