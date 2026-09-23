/**
 * Historial de compras de un mismo cliente: junta todos los pedidos que
 * coinciden por cédula (si la tiene) o, si no, por nombre -- para
 * reconocer de un vistazo a un cliente que repite, sin tener que
 * buscarlo a mano en la tabla cada vez. Se abre desde el detalle de un
 * pedido o desde la tabla misma.
 */

function isSameClient(a, b) {
  const cedulaA = (a.cedula || "").trim();
  const cedulaB = (b.cedula || "").trim();
  if (cedulaA && cedulaB) return cedulaA === cedulaB;
  const nombreA = (a.nombre || "").trim().toLowerCase();
  const nombreB = (b.nombre || "").trim().toLowerCase();
  return !!nombreA && nombreA === nombreB;
}

function getClientOrders(order) {
  return loadOrders()
    .filter((o) => isSameClient(o, order))
    .sort((a, b) => (b.fecha || b.createdAt || "").localeCompare(a.fecha || a.createdAt || ""));
}

function initClientHistory() {
  const modal = document.getElementById("client-history");
  if (!modal) return;
  document.getElementById("client-history-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

function openClientHistory(order) {
  const orders = getClientOrders(order);
  const total = orders.filter((o) => o.estado !== "Cancelado").reduce((sum, o) => sum + (Number(o.precio) || 0), 0);

  document.getElementById("client-history-title").textContent = `Historial de ${order.nombre || "este cliente"}`;
  document.getElementById("client-history-summary").textContent =
    orders.length <= 1
      ? "Este es el único pedido registrado para este cliente."
      : `${orders.length} pedidos · ${formatCOP(total)} en total (sin contar cancelados)`;

  const list = document.getElementById("client-history-list");
  list.innerHTML = orders
    .map(
      (o) => `
        <div class="sale-row${o.id === order.id ? " sale-row--current" : ""}">
          <div class="sale-row__info">
            <div class="sale-row__title">${escapeHtml(o.reloj) || "Sin reloj registrado"}</div>
            <div class="sale-row__meta">
              ${escapeHtml(o.fecha) || "sin fecha"} ·
              <span class="status-badge status-badge--${slug(o.estado)}">${escapeHtml(o.estado)}</span>
            </div>
          </div>
          <div class="sale-row__profit">${formatCOP(o.precio)}</div>
        </div>`
    )
    .join("");

  document.getElementById("client-history").showModal();
}
