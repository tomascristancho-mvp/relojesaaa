/**
 * Comprobante de venta imprimible/PDF para un pedido. Se muestra en un
 * modal con estilos de pantalla normales, y cuando el usuario imprime
 * (o "Guardar como PDF" desde el diálogo de impresión del navegador),
 * las reglas @media print en css/admin.css ocultan todo lo demás y
 * dejan solo el comprobante, con estilos en blanco y negro pensados
 * para papel.
 *
 * SOBRE EL ENVÍO AUTOMÁTICO: una página estática (sin servidor propio)
 * no puede enviar en silencio un correo o mensaje de WhatsApp con un
 * PDF adjunto -- ningún navegador lo permite, por seguridad, y no hay
 * backend aquí que lo haga por detrás. Lo que sí se automatiza: en
 * cuanto un pedido pasa a "Entregado" (venta 100% concretada), se abre
 * solo el comprobante y el diálogo de guardar/imprimir como PDF
 * (triggerAutoReceipt). El envío a tu WhatsApp o correo queda a un
 * clic de distancia con los botones de abajo, ya con todo el texto
 * armado -- ese último paso sí requiere que lo confirmes vos.
 */

function receiptOrderCode(order) {
  const digits = String(order.id || "").replace(/[^0-9]/g, "");
  return digits ? digits.slice(-6) : "000000";
}

function receiptSummaryText(order) {
  const fecha = order.fecha || "—";
  return (
    `Comprobante de venta ${CONFIG.businessName} (N.º ${receiptOrderCode(order)})\n` +
    `Fecha: ${fecha}\n` +
    `Cliente: ${order.nombre} · Cédula ${order.cedula} · ${order.telefono}\n` +
    `Reloj: ${order.reloj}\n` +
    `Total: ${formatCOP(order.precio)} (${order.medioPago})\n` +
    `Estado: ${order.estado}`
  );
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

    <div class="receipt__send-actions no-print">
      <a class="btn btn--ghost btn--small" target="_blank" rel="noopener"
         href="${buildWhatsAppUrl(normalizePhoneCO(CONFIG.whatsappNumber), receiptSummaryText(order))}">
        Enviarme por WhatsApp
      </a>
      <a class="btn btn--ghost btn--small"
         href="mailto:${encodeURIComponent(CONFIG.email)}?subject=${encodeURIComponent(`Comprobante de venta N.º ${receiptOrderCode(order)}`)}&body=${encodeURIComponent(receiptSummaryText(order))}">
        Enviarme por correo
      </a>
    </div>
  `;

  document.getElementById("receipt-modal").showModal();
}

/**
 * Se llama justo cuando un pedido pasa a "Entregado" (venta 100%
 * concretada). Abre el comprobante y, de inmediato, el diálogo de
 * imprimir/guardar como PDF del navegador -- ver la nota sobre envío
 * automático arriba para los límites reales de esto.
 */
function triggerAutoReceipt(order) {
  openReceipt(order);
  window.print();
}

function initReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  document.getElementById("receipt-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
  document.getElementById("receipt-print-btn").addEventListener("click", () => window.print());
}
