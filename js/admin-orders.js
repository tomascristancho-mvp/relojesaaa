/**
 * Núcleo del panel privado: guardar/leer pedidos (localStorage), el
 * formulario de "Nuevo pedido", la tabla con sus estadísticas, y el
 * detalle de un pedido individual.
 */

const STORAGE_KEY = "altitude_orders_v1";
const ORDER_STATUSES = ["Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado"];
const ACTIVE_ESTADOS = ["Confirmado", "Enviado", "Entregado"];

/**
 * Cada reloj del catálogo es una pieza única (no hay stock por
 * referencia) -- si dos pedidos distintos quedan "activos" (Confirmado,
 * Enviado o Entregado) para la misma referencia al mismo tiempo, casi
 * seguro uno de los dos está mal: vendido dos veces por error, o al otro
 * pedido le falta cancelarse. `candidate` no necesita existir todavía en
 * `orders` (se usa también para validar un pedido antes de guardarlo).
 */
function findConflictingOrder(orders, candidate) {
  if (!ACTIVE_ESTADOS.includes(candidate.estado)) return null;
  const ref = extractRefCode(candidate.reloj);
  if (!ref) return null;
  return (
    orders.find(
      (o) => o.id !== candidate.id && ACTIVE_ESTADOS.includes(o.estado) && extractRefCode(o.reloj) === ref
    ) || null
  );
}

async function confirmSaleConflict(conflict, reloj) {
  const ref = extractRefCode(reloj) || "Este reloj";
  return confirmDialog({
    title: "Este reloj ya está en otro pedido activo",
    message: `${ref} ya figura como ${conflict.estado} en el pedido de ${conflict.nombre || "otro cliente"} (${conflict.fecha || "sin fecha"}). Como cada reloj es una pieza única, esto suele significar una venta duplicada -- revisa si el otro pedido debería cancelarse antes de continuar. ¿Seguro que quieres guardar igual?`,
    confirmLabel: "Guardar de todas formas",
    cancelLabel: "Revisar antes",
    danger: true,
  });
}

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch (e) {
    console.error("No se pudo guardar el pedido", e);
    showToast("No se pudo guardar: el navegador rechazó el cambio (¿modo privado o espacio lleno?)", "error");
    return false;
  }
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
    const match = findWatchByRef(extractRefCode(relojInput.value));
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

let editingOrderId = null;

function fillOrderForm(order) {
  document.getElementById("order-fecha").value = order.fecha || "";
  document.getElementById("order-nombre").value = order.nombre || "";
  document.getElementById("order-cedula").value = order.cedula || "";
  document.getElementById("order-telefono").value = order.telefono || "";
  document.getElementById("order-correo").value = order.correo || "";
  document.getElementById("order-lugar").value = order.lugar || "";
  document.getElementById("order-reloj").value = order.reloj || "";
  document.getElementById("order-pago").value = order.medioPago || "";
  document.getElementById("order-precio").value = order.precio ?? "";
  document.getElementById("order-costo").value = order.costo ?? "";
  document.getElementById("order-vendedor").value = order.vendedor || "";
  document.getElementById("order-estado").value = order.estado || "Pendiente";
  document.getElementById("order-notas").value = order.notas || "";
  document.getElementById("order-precio").dataset.touched = "true";
  document.getElementById("order-costo").dataset.touched = "true";
}

function startEditOrder(order) {
  editingOrderId = order.id;
  fillOrderForm(order);
  document.getElementById("order-form-title").textContent = `Editando pedido de ${order.nombre || "este cliente"}`;
  document.getElementById("order-form-submit").textContent = "Guardar cambios";
  document.getElementById("order-form-cancel").hidden = false;
  document.getElementById("order-form").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("order-nombre").focus();
}

function exitEditMode() {
  editingOrderId = null;
  document.getElementById("order-form-title").textContent = "Nuevo pedido";
  document.getElementById("order-form-submit").textContent = "Guardar pedido";
  document.getElementById("order-form-cancel").hidden = true;
  document.getElementById("order-form").reset();
  document.getElementById("order-fecha").value = new Date().toISOString().slice(0, 10);
  document.getElementById("order-estado").value = "Pendiente";
  document.getElementById("order-precio").dataset.touched = "false";
  document.getElementById("order-costo").dataset.touched = "false";
}

function initOrderForm() {
  const form = document.getElementById("order-form");

  document.getElementById("order-form-cancel").addEventListener("click", () => {
    exitEditMode();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("order-form-submit");
    // Evita que un doble clic (o un usuario impaciente mientras espera el
    // diálogo de conflicto) dispare el guardado dos veces y cree un pedido
    // duplicado.
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

    try {
      const values = {
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
      };

      const orders = loadOrders();

      const conflict = findConflictingOrder(orders, { id: editingOrderId, reloj: values.reloj, estado: values.estado });
      if (conflict && !(await confirmSaleConflict(conflict, values.reloj))) return;

      let savedOrder = null;
      let justBecameEntregado = false;

      if (editingOrderId) {
        const idx = orders.findIndex((o) => o.id === editingOrderId);
        if (idx !== -1) {
          const wasEntregado = orders[idx].estado === "Entregado";
          orders[idx] = { ...orders[idx], ...values };
          if (!saveOrders(orders)) return;
          savedOrder = orders[idx];
          showToast(`Pedido de ${values.nombre || "cliente"} actualizado ✓`);
          justBecameEntregado = !wasEntregado && values.estado === "Entregado";
        }
      } else {
        const newOrder = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...values,
          createdAt: new Date().toISOString(),
        };
        orders.push(newOrder);
        if (!saveOrders(orders)) return;
        savedOrder = newOrder;
        showToast(`Pedido de ${values.nombre || "cliente"} guardado ✓`);
        justBecameEntregado = values.estado === "Entregado";
      }

      renderOrders();
      exitEditMode();

      // Venta 100% concretada (Entregado): genera el comprobante y abre el
      // diálogo de impresión/PDF automáticamente. Solo en esta transición,
      // no cada vez que se edite un pedido que ya estaba Entregado (por
      // ejemplo, para corregir una nota), para no repetir la interrupción.
      if (justBecameEntregado && savedOrder && typeof triggerAutoReceipt === "function") {
        triggerAutoReceipt(savedOrder);
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ============ FILTRO DE LA TABLA ============ */
const ordersFilterState = { busqueda: "", estado: "Todos" };

function getFilteredOrders(orders) {
  const query = ordersFilterState.busqueda.trim().toLowerCase();
  return orders.filter(
    (o) =>
      (ordersFilterState.estado === "Todos" || o.estado === ordersFilterState.estado) &&
      (!query ||
        (o.nombre || "").toLowerCase().includes(query) ||
        (o.reloj || "").toLowerCase().includes(query) ||
        (o.cedula || "").toLowerCase().includes(query) ||
        (o.vendedor || "").toLowerCase().includes(query))
  );
}

function initOrdersFilter() {
  const input = document.getElementById("orders-search");
  const chipsContainer = document.getElementById("orders-status-filter");
  const statuses = ["Todos", ...ORDER_STATUSES];

  input.addEventListener("input", () => {
    ordersFilterState.busqueda = input.value;
    renderOrders();
  });

  chipsContainer.innerHTML = "";
  statuses.forEach((status, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip chip--small" + (i === 0 ? " chip--active" : "");
    btn.textContent = status;
    btn.addEventListener("click", () => {
      chipsContainer.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip--active"));
      btn.classList.add("chip--active");
      ordersFilterState.estado = status;
      renderOrders();
    });
    chipsContainer.appendChild(btn);
  });
}

/* ============ ORDEN DE LA TABLA ============ */
const ordersSortState = { key: null, dir: "desc" };

function sortOrders(orders) {
  if (!ordersSortState.key) {
    return [...orders].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
  const { key, dir } = ordersSortState;
  const mult = dir === "asc" ? 1 : -1;
  return [...orders].sort((a, b) => {
    const av = key === "ganancia" ? calcGanancia(a) : a[key];
    const bv = key === "ganancia" ? calcGanancia(b) : b[key];
    const aEmpty = av == null || av === "";
    const bEmpty = bv == null || bv === "";
    if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1; // vacíos siempre al final
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * mult;
    return String(av).localeCompare(String(bv)) * mult;
  });
}

function updateSortIndicators() {
  document.querySelectorAll("#orders-thead-row th[data-sort]").forEach((th) => {
    th.classList.remove("is-sorted-asc", "is-sorted-desc");
    if (th.dataset.sort === ordersSortState.key) {
      th.classList.add(ordersSortState.dir === "asc" ? "is-sorted-asc" : "is-sorted-desc");
    }
  });
}

function initOrdersSort() {
  document.querySelectorAll("#orders-thead-row th[data-sort]").forEach((th) => {
    th.classList.add("sortable-th");
    th.addEventListener("click", () => {
      if (ordersSortState.key === th.dataset.sort) {
        ordersSortState.dir = ordersSortState.dir === "asc" ? "desc" : "asc";
      } else {
        ordersSortState.key = th.dataset.sort;
        ordersSortState.dir = th.dataset.sort === "nombre" || th.dataset.sort === "estado" ? "asc" : "desc";
      }
      renderOrders();
    });
  });
}

/* ============ TABLA Y ESTADÍSTICAS ============ */
function renderOrders() {
  const allOrders = loadOrders().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const orders = sortOrders(getFilteredOrders(allOrders));
  const tbody = document.getElementById("orders-tbody");
  tbody.innerHTML = "";
  updateSortIndicators();

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
      <td class="orders-table__estado"></td>
      <td class="orders-table__actions"></td>
    `;

    const estadoCell = tr.querySelector(".orders-table__estado");
    const estadoSelect = document.createElement("select");
    estadoSelect.className = `status-badge status-badge--${slug(order.estado)}`;
    estadoSelect.setAttribute("aria-label", `Cambiar estado del pedido de ${order.nombre || "cliente"}`);
    ORDER_STATUSES.forEach((status) => {
      const opt = document.createElement("option");
      opt.value = status;
      opt.textContent = status;
      if (status === order.estado) opt.selected = true;
      estadoSelect.appendChild(opt);
    });
    estadoSelect.addEventListener("change", async () => {
      const nuevoEstado = estadoSelect.value;
      const orders = loadOrders();
      const idx = orders.findIndex((o) => o.id === order.id);
      if (idx === -1) return;

      const conflict = findConflictingOrder(orders, { id: order.id, reloj: order.reloj, estado: nuevoEstado });
      if (conflict && !(await confirmSaleConflict(conflict, order.reloj))) {
        estadoSelect.value = order.estado;
        return;
      }

      const wasEntregado = orders[idx].estado === "Entregado";
      orders[idx] = { ...orders[idx], estado: nuevoEstado };
      if (!saveOrders(orders)) {
        estadoSelect.value = order.estado;
        return;
      }
      const updatedOrder = orders[idx];
      showToast(`Estado de ${order.nombre || "el pedido"} actualizado a "${nuevoEstado}" ✓`);
      renderOrders();
      // Misma regla que en el formulario: solo dispara el comprobante
      // automático en el momento exacto en que pasa a Entregado.
      if (!wasEntregado && nuevoEstado === "Entregado" && typeof triggerAutoReceipt === "function") {
        triggerAutoReceipt(updatedOrder);
      }
    });
    estadoCell.appendChild(estadoSelect);

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

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn";
    editBtn.title = "Editar pedido";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => startEditOrder(order));
    actionsCell.appendChild(editBtn);

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
        if (!saveOrders(loadOrders().filter((o) => o.id !== order.id))) return;
        renderOrders();
        showToast("Pedido eliminado");
      }
    });
    actionsCell.appendChild(delBtn);

    tbody.appendChild(tr);
  });

  const isFiltered = ordersFilterState.busqueda.trim() !== "" || ordersFilterState.estado !== "Todos";
  document.getElementById("orders-empty").hidden = orders.length !== 0;
  document.getElementById("orders-empty").textContent =
    orders.length === 0 && allOrders.length > 0 ? "Ningún pedido coincide con ese filtro." : "Aún no has registrado pedidos.";
  document.getElementById("orders-table").hidden = orders.length === 0;
  document.getElementById("orders-count").textContent = isFiltered ? `Mostrando ${orders.length} de ${allOrders.length}` : "";

  document.getElementById("stat-total").textContent = allOrders.length;
  const soldOrders = allOrders.filter((o) => o.estado !== "Cancelado");
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
  document.getElementById("stat-pending").textContent = allOrders.filter((o) => o.estado === "Pendiente").length;

  if (typeof renderCharts === "function") renderCharts();
  if (typeof renderAvailabilityAlerts === "function") renderAvailabilityAlerts();
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
    `</dl><div class="admin-detail-actions">
      <button type="button" id="detail-edit-btn" class="btn btn--primary btn--small">Editar este pedido</button>
      <button type="button" id="detail-receipt-btn" class="btn btn--ghost btn--small">Generar comprobante</button>
    </div>`;
  document.getElementById("detail-edit-btn").addEventListener("click", () => {
    document.getElementById("order-detail").close();
    startEditOrder(order);
  });
  document.getElementById("detail-receipt-btn").addEventListener("click", () => {
    document.getElementById("order-detail").close();
    if (typeof openReceipt === "function") openReceipt(order);
  });
  document.getElementById("order-detail").showModal();
}
