/**
 * Lista de ventas que se abre al hacer clic en la tarjeta "Ganancia
 * total": cada venta con costo registrado, su foto (buscada en el
 * catálogo real por referencia), precio, lugar, fecha y ganancia.
 */

function findWatchForOrder(order) {
  return (typeof WATCHES !== "undefined" ? WATCHES : []).find((w) => order.reloj && order.reloj.startsWith(w.referencia));
}

function initSalesDetailModal() {
  const modal = document.getElementById("sales-detail");
  document.getElementById("stat-profit-card").addEventListener("click", openSalesDetail);
  document.getElementById("sales-detail-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

function openSalesDetail() {
  const sales = loadOrders()
    .filter((o) => o.estado !== "Cancelado" && calcGanancia(o) != null)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  const totalGanancia = sales.reduce((sum, o) => sum + calcGanancia(o), 0);
  document.getElementById("sales-detail-summary").textContent =
    sales.length === 0
      ? "Aún no hay ventas con costo registrado."
      : `${sales.length} venta(s) · ganancia total ${formatCOP(totalGanancia)}`;

  const list = document.getElementById("sales-list");
  list.innerHTML = "";

  if (sales.length === 0) {
    list.innerHTML = `<p class="sales-list__empty">Registra el costo en un pedido para que aparezca aquí.</p>`;
  }

  sales.forEach((order) => {
    const watch = findWatchForOrder(order);
    const img = watch?.imagen || PLACEHOLDER_IMAGE;
    const row = document.createElement("div");
    row.className = "sale-row";
    row.innerHTML = `
      <img class="sale-row__img" src="${img}" alt="${escapeHtml(order.reloj)}" />
      <div class="sale-row__info">
        <div class="sale-row__title">${escapeHtml(order.reloj)}</div>
        <div class="sale-row__meta">${formatCOP(order.precio)} · ${escapeHtml(order.lugar) || "—"} · ${order.fecha || "—"}</div>
      </div>
      <div class="sale-row__profit">${formatCOP(calcGanancia(order))}</div>
    `;
    list.appendChild(row);
  });

  document.getElementById("sales-detail").showModal();
}
