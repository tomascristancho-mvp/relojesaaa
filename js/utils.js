/**
 * Utilidades compartidas entre la página pública (catalog.js, watch-modal.js,
 * site.js) y el panel privado (admin-*.js): formato de moneda y precio,
 * texto seguro para HTML, construcción de enlaces de WhatsApp y de
 * enlaces para compartir un reloj puntual (?reloj=REF-01), y las
 * notificaciones tipo "toast" (requieren un <div id="toast-container">
 * en la página, ver index.html/admin.html).
 * Se carga antes que cualquier otro script propio en ambas páginas.
 */

const PLACEHOLDER_IMAGE = "images/watches/placeholder.svg";

function formatCOP(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatPrice(price) {
  if (price === null || price === undefined) return "Escríbenos por el precio";
  return formatCOP(price);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function normalizePhoneCO(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.startsWith("57") ? digits : `57${digits}`;
}

function buildWhatsAppUrl(phoneDigits, message) {
  const base = `https://wa.me/${phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function buildWhatsAppLink(watch) {
  const message =
    `Hola${CONFIG.businessName ? " " + CONFIG.businessName : ""}, ` +
    `estoy interesado/a en el reloj "${watch.nombre}" (${watch.referencia}) ` +
    `que vi en la página. ¿Me confirmas disponibilidad y cómo sería el proceso de compra?`;
  return buildWhatsAppUrl(CONFIG.whatsappNumber, message);
}

function buildGeneralWhatsAppLink() {
  const message = `Hola${CONFIG.businessName ? " " + CONFIG.businessName : ""}, quisiera más información sobre tu catálogo de relojes.`;
  return buildWhatsAppUrl(CONFIG.whatsappNumber, message);
}

function buildWatchShareUrl(watch) {
  return `${window.location.origin}${window.location.pathname}?reloj=${encodeURIComponent(watch.referencia)}`;
}

/**
 * Extrae el código "REF-01" del texto libre que guarda el panel de
 * pedidos en order.reloj (por ejemplo "REF-01 — Fossil Clásico Esfera
 * Blanca"). Devuelve null si el texto no empieza con ese patrón (el
 * campo es de texto libre, un pedido viejo o escrito a mano puede no
 * tenerlo).
 */
function extractRefCode(reloj) {
  const match = String(reloj || "").match(/^(REF-\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

/** Busca en WATCHES (js/data.js) el reloj cuya referencia coincide con refCode. */
function findWatchByRef(refCode) {
  if (!refCode || typeof WATCHES === "undefined") return null;
  return WATCHES.find((w) => w.referencia.toUpperCase() === refCode.toUpperCase()) || null;
}

/**
 * `options.actionLabel` + `options.onAction` agregan un botón (por ejemplo
 * "Deshacer") al toast. Si se usa, el toast dura más para dar tiempo a
 * verlo y tocarlo. Sin esas opciones se comporta exactamente igual que
 * antes.
 */
function showToast(message, type = "success", options = {}) {
  const { actionLabel, onAction, duration } = options;
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }

  if (actionLabel && onAction) {
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "toast__action";
    actionBtn.textContent = actionLabel;
    actionBtn.addEventListener("click", () => {
      dismiss();
      onAction();
    });
    toast.appendChild(actionBtn);
  }

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(dismiss, duration ?? (actionLabel ? 6000 : 3000));
}
