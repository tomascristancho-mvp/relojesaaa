/**
 * Núcleo del panel privado: guardar/leer pedidos (localStorage), el
 * formulario de "Nuevo pedido", la tabla con sus estadísticas, y el
 * detalle de un pedido individual.
 */

const STORAGE_KEY = "altitude_orders_v1";

function calcGanancia(order) {
  return order.costo != null && order.costo !== "" ? Number(order.precio) - Number(order.costo) : null;
}

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

function toWhatsAppLink(telefono) {
  return buildWhatsAppUrl(normalizePhoneCO(telefono));
}

function slug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/* ============ FORMULARIO ============ */
function populateRelojOptions() {
  const datalist = document.getElementById("reloj-options");
  const precioInput = document.getElementById("order-precio");
  const relojInput = document.getElementById("order-reloj");
  const costoInput = document.getElementById("order-costo");

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

    if (costoInput.dataset.touched !== "true") {
      const previous = loadOrders()
        .filter((o) => o.reloj === relojInput.value && o.costo != null)
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
      if (previous) costoInput.value = previous.costo;
    }
  });
  precioInput.addEventListener("input", () => {
    precioInput.dataset.touched = "true";
  });
  costoInput.addEventListener("input", () => {
    costoInput.dataset.touched = "true";
  });
}

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
      costo: document.getElementById("order-costo").value === "" ? null : Number(document.getElementById("order-costo").value),
      vendedor: document.getElementById("order-vendedor").value,
      estado: document.getElementById("order-estado").value,
      notas: document.getElementById("order-notas").value.trim(),
      createdAt: new Date().toISOString(),
    };

    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);
    renderOrders();
    showToast(`Pedido de ${order.nombre || "cliente"} guardado ✓`);

    form.reset();
    document.getElementById("order-fecha").value = new Date().toISOString().slice(0, 10);
    document.getElementById("order-estado").value = "Pendiente";
    document.getElementById("order-precio").dataset.touched = "false";
    document.getElementById("order-costo").dataset.touched = "false";
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
      <td>${escapeHtml(order.vendedor)}</td>
      <td>${escapeHtml(order.reloj)}</td>
      <td>${escapeHtml(order.medioPago)}</td>
      <td>${formatCOP(order.precio)}</td>
      <td>${calcGanancia(order) != null ? formatCOP(calcGanancia(order)) : "—"}</td>
      <td><span class="status-badge status-badge--${slug(order.estado)}">${escapeHtml(order.estado)}</span></td>
      <td class="orders-table__actions"></td>
    `;
    const actionsCell = tr.querySelector(".orders-table__actions");

    if (order.telefono) {
      const waBtn = document.createElement("a");
      waBtn.className = "icon-btn";
      waBtn.title = "Escribir por WhatsApp";
      waBtn.textContent = "💬";
      waBtn.href = toWhatsAppLink(order.telefono);
      waBtn.target = "_blank";
      waBtn.rel = "noopener";
      actionsCell.appendChild(waBtn);
    }

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
    delBtn.addEventListener("click", async () => {
      const confirmed = await confirmDialog({
        title: "Eliminar pedido",
        message: `¿Eliminar el pedido de ${order.nombre || "este cliente"}? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        danger: true,
      });
      if (confirmed) {
        saveOrders(loadOrders().filter((o) => o.id !== order.id));
        renderOrders();
        showToast("Pedido eliminado");
      }
    });
    actionsCell.appendChild(delBtn);

    tbody.appendChild(tr);
  });

  document.getElementById("orders-empty").hidden = orders.length !== 0;
  document.getElementById("orders-table").hidden = orders.length === 0;

  document.getElementById("stat-total").textContent = orders.length;
  const soldOrders = orders.filter((o) => o.estado !== "Cancelado");
  const revenue = soldOrders.reduce((sum, o) => sum + (Number(o.precio) || 0), 0);
  document.getElementById("stat-revenue").textContent = formatCOP(revenue);
  const profit = soldOrders.reduce((sum, o) => {
    const g = calcGanancia(o);
    return g != null ? sum + g : sum;
  }, 0);
  const ordersWithoutCosto = soldOrders.filter((o) => calcGanancia(o) == null).length;
  document.getElementById("stat-profit").textContent = formatCOP(profit);
  document.getElementById("stat-profit-note").textContent = ordersWithoutCosto
    ? `No incluye ${ordersWithoutCosto} pedido(s) sin costo registrado`
    : "";
  document.getElementById("stat-pending").textContent = orders.filter((o) => o.estado === "Pendiente").length;

  if (typeof renderCharts === "function") renderCharts();
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
    ["Encargado de venta", order.vendedor],
    ["Medio de pago", order.medioPago],
    ["Precio de venta", formatCOP(order.precio)],
    ["Costo", order.costo != null ? formatCOP(order.costo) : "—"],
    ["Ganancia", calcGanancia(order) != null ? formatCOP(calcGanancia(order)) : "—"],
    ["Estado", order.estado],
    ["Notas", order.notas || "—"],
  ];
  body.innerHTML =
    `<h3>Detalle del pedido</h3><dl class="admin-detail-list">` +
    rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("") +
    `</dl>`;
  document.getElementById("order-detail").showModal();
}
