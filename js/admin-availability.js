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
    return;
  }

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
