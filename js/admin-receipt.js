/**
 * Comprobante de venta imprimible/PDF para un pedido. Se muestra en un
 * modal con estilos de pantalla normales, y cuando el usuario imprime
 * (o "Guardar como PDF" desde el diálogo de impresión del navegador),
 * las reglas @media print en css/admin.css ocultan todo lo demás y
 * dejan solo el comprobante, con estilos en blanco y negro pensados
 * para papel.
 */

function receiptOrderCode(order) {
  const digits = String(order.id || "").replace(/[^0-9]/g, "");
  return digits ? digits.slice(-6) : "000000";
}

function openReceipt(order) {
  const body = document.getElementById("receipt-body");
  const fecha = order.fecha ? new Date(order.fecha + "T00:00:00").toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : "—";

  body.innerHTML = `
    <div class="receipt">
      <div class="receipt__header">
        <svg class="receipt__logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="20" cy="20" r="15" stroke="currentColor" stroke-width="2"/>
          <path d="M20 4v4M20 32v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M11 27 L18 15 L22 20 L27 11 L33 27 Z" fill="currentColor"/>
        </svg>
        <div>
          <div class="receipt__business">${escapeHtml(CONFIG.businessName)}</div>
          <div class="receipt__tagline">${escapeHtml(CONFIG.tagline)}</div>
        </div>
      </div>

      <div class="receipt__title-row">
        <h3>Comprobante de venta</h3>
        <span class="receipt__code">N.º ${receiptOrderCode(order)}</span>
      </div>
      <p class="receipt__date">${fecha}</p>

      <div class="receipt__section">
        <span class="receipt__label">Cliente</span>
        <p>${escapeHtml(order.nombre)}</p>
        <p class="receipt__muted">Cédula ${escapeHtml(order.cedula)} · ${escapeHtml(order.telefono)}</p>
        <p class="receipt__muted">${escapeHtml(order.lugar)}</p>
      </div>

      <div class="receipt__section">
        <span class="receipt__label">Reloj</span>
        <p>${escapeHtml(order.reloj)}</p>
        <p class="receipt__muted">Medio de pago: ${escapeHtml(order.medioPago)}</p>
      </div>

      <div class="receipt__total-row">
        <span>Total pagado</span>
        <strong>${formatCOP(order.precio)}</strong>
      </div>

      <div class="receipt__status">Estado del pedido: <strong>${escapeHtml(order.estado)}</strong></div>

      ${order.notas ? `<p class="receipt__notes">${escapeHtml(order.notas)}</p>` : ""}

      <div class="receipt__footer">
        <p>¡Gracias por tu compra!</p>
        <p class="receipt__muted">${escapeHtml(CONFIG.businessName)} · ${escapeHtml(CONFIG.city)} · WhatsApp ${escapeHtml(CONFIG.whatsappNumber)}</p>
      </div>
    </div>
  `;

  document.getElementById("receipt-modal").showModal();
}

function initReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  document.getElementById("receipt-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
  document.getElementById("receipt-print-btn").addEventListener("click", () => window.print());
}
