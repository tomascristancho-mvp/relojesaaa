/**
 * Aviso de "reloj vendido pero todavía visible en la página pública".
 *
 * IMPORTANTE: el panel de pedidos guarda todo en localStorage, solo en el
 * navegador donde lo registraste. La página pública es un archivo estático
 * (js/data.js) que no lee esos pedidos -- no hay conexión automática entre
 * las dos. Este aviso solo te recuerda, dentro de ESTE navegador, qué
 * referencias ya se entregaron (venta 100% concretada) pero el catálogo
 * público (WATCHES, cargado del mismo js/data.js) todavía no las tiene
 * marcadas con `disponible: false`. Para que un reloj deje de aparecer
 * para todo el mundo, hay que editar js/data.js y publicar el cambio (o
 * pedírmelo directamente).
 */

function computeUnmarkedSoldWatches(orders) {
  const deliveredRefs = new Map();
  orders
    .filter((o) => o.estado === "Entregado")
    .forEach((o) => {
      const ref = extractRefCode(o.reloj);
      if (!ref) return;
      if (!deliveredRefs.has(ref)) deliveredRefs.set(ref, { ref, reloj: o.reloj, clientes: [] });
      deliveredRefs.get(ref).clientes.push(o.nombre || "cliente sin nombre");
    });

  return Array.from(deliveredRefs.values()).filter(({ ref }) => {
    const watch = findWatchByRef(ref);
    return watch && watch.disponible !== false;
  });
}

function renderAvailabilityAlerts() {
  const section = document.getElementById("availability-alert");
  if (!section) return;

  const orders = loadOrders();
  const flagged = computeUnmarkedSoldWatches(orders);

  if (flagged.length === 0) {
    section.hidden = true;
  } else {
    section.hidden = false;
    const list = document.getElementById("availability-alert-list");
    list.innerHTML = flagged
      .map(({ reloj, clientes }) => {
        const match = reloj.match(/^(REF-\d+)\s*(?:—\s*)?(.*)$/i);
        const display = match ? `<strong>${escapeHtml(match[1])}</strong> — ${escapeHtml(match[2])}` : escapeHtml(reloj);
        return `
          <li>
            ${display}
            <span class="availability-alert__meta">Entregado a: ${escapeHtml(clientes.join(", "))}</span>
          </li>`;
      })
      .join("");
  }

  renderConflictAlerts(orders);
  renderStalePendingAlert(orders);
}

/**
 * Como cada reloj es una pieza única, dos pedidos con estado Confirmado,
 * Enviado o Entregado para la misma referencia al mismo tiempo casi
 * siempre significan una venta duplicada por error. La confirmación al
 * guardar (ver findConflictingOrder en admin-orders.js) atrapa la
 * mayoría de estos casos en el momento, pero este aviso permanente
 * también detecta los que se cuelan por una importación de CSV o una
 * edición hecha en otro momento.
 */
function computeDuplicateSaleConflicts(orders) {
  const map = new Map();
  orders
    .filter((o) => ACTIVE_ESTADOS.includes(o.estado) && o.reloj)
    .forEach((o) => {
      const ref = extractRefCode(o.reloj);
      if (!ref) return;
      if (!map.has(ref)) map.set(ref, []);
      map.get(ref).push(o);
    });
  return Array.from(map.entries())
    .filter(([, list]) => list.length > 1)
    .map(([ref, list]) => ({ ref, reloj: list[0].reloj, orders: list }));
}

function renderConflictAlerts(orders) {
  const section = document.getElementById("conflict-alert");
  if (!section) return;

  const conflicts = computeDuplicateSaleConflicts(orders);
  if (conflicts.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const list = document.getElementById("conflict-alert-list");
  list.innerHTML = conflicts
    .map(({ reloj, orders: conflictOrders }) => {
      const match = reloj.match(/^(REF-\d+)\s*(?:—\s*)?(.*)$/i);
      const display = match ? `<strong>${escapeHtml(match[1])}</strong> — ${escapeHtml(match[2])}` : escapeHtml(reloj);
      const detail = conflictOrders
        .map((o) => `${escapeHtml(o.nombre || "cliente sin nombre")} (${escapeHtml(o.estado)}, ${escapeHtml(o.fecha || "sin fecha")})`)
        .join(" · ");
      return `
        <li>
          ${display}
          <span class="availability-alert__meta">${detail}</span>
        </li>`;
    })
    .join("");
}

/**
 * Un pedido "Pendiente" que lleva varios días así fácilmente se pierde de
 * vista entre los demás -- el cliente puede estar esperando una respuesta
 * que nunca llega. Este aviso junta esos pedidos para darles seguimiento;
 * hacer clic en uno abre su detalle directamente.
 */
const STALE_PENDING_DAYS = 2;

function computeStalePendingOrders(orders, thresholdDays) {
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  return orders
    .filter((o) => o.estado === "Pendiente" && o.fecha)
    .map((o) => {
      const fechaDate = new Date(o.fecha + "T00:00:00");
      const days = Math.round((today - fechaDate) / 86400000);
      return { order: o, days };
    })
    .filter(({ days }) => Number.isFinite(days) && days >= thresholdDays)
    .sort((a, b) => b.days - a.days);
}

function renderStalePendingAlert(orders) {
  const section = document.getElementById("stale-pending-alert");
  if (!section) return;

  const stale = computeStalePendingOrders(orders, STALE_PENDING_DAYS);
  if (stale.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const list = document.getElementById("stale-pending-alert-list");
  list.innerHTML = stale
    .map(({ order, days }) => {
      const reloj = order.reloj || "";
      const match = reloj.match(/^(REF-\d+)\s*(?:—\s*)?(.*)$/i);
      const display = match ? `<strong>${escapeHtml(match[1])}</strong> — ${escapeHtml(match[2])}` : escapeHtml(reloj) || "Sin reloj registrado";
      return `
        <li>
          <button type="button" class="availability-alert__item-btn" data-order-id="${escapeHtml(order.id)}">
            ${display}
            <span class="availability-alert__meta">Cliente: ${escapeHtml(order.nombre) || "sin nombre"} · pendiente desde hace ${days} ${days === 1 ? "día" : "días"} (${escapeHtml(order.fecha)})</span>
          </button>
        </li>`;
    })
    .join("");

  list.querySelectorAll(".availability-alert__item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const match = orders.find((o) => o.id === btn.dataset.orderId);
      if (match && typeof openDetail === "function") openDetail(match);
    });
  });
}
