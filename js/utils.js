/**
 * Utilidades compartidas entre la página pública (catalog.js, watch-modal.js,
 * site.js) y el panel privado (admin-*.js): formato de moneda y precio,
 * texto seguro para HTML, y construcción de enlaces de WhatsApp y de
 * enlaces para compartir un reloj puntual (?reloj=REF-01).
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
