/**
 * Carrito de compra: agregar varios relojes desde el catálogo o el
 * detalle, y pedirlos todos juntos con un solo mensaje de WhatsApp que
 * lista cada reloj y el total. Se guarda con localStorage en el
 * navegador de quien visita, no se comparte entre dispositivos.
 * Cada vez que se agrega o quita un reloj aparece un toast (js/utils.js)
 * confirmándolo, sin interrumpir la navegación.
 */

const CART_KEY = "altitude_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function isInCart(referencia) {
  return getCart().includes(referencia);
}

function toggleCartItem(referencia) {
  const cart = getCart();
  const idx = cart.indexOf(referencia);
  const adding = idx === -1;
  if (adding) cart.push(referencia);
  else cart.splice(idx, 1);
  saveCart(cart);
  updateCartBadge();
  const watch = WATCHES.find((w) => w.referencia === referencia);
  if (watch) {
    showToast(adding ? `${watch.nombre} agregado al carrito` : `${watch.nombre} quitado del carrito`);
  }
  return cart.includes(referencia);
}

function removeFromCart(referencia) {
  saveCart(getCart().filter((r) => r !== referencia));
  updateCartBadge();
}

function updateCartBadge() {
  const count = getCart().length;
  const badge = document.getElementById("cart-count");
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

function updateCartButton(btn) {
  const active = isInCart(btn.dataset.ref);
  btn.classList.toggle("is-active", active);
  btn.setAttribute("aria-pressed", String(active));
  const label = btn.querySelector(".cart-btn__label");
  if (label) label.textContent = active ? "En el carrito ✓" : "Agregar al carrito";
}

function syncCartButtons() {
  document.querySelectorAll(".cart-add-btn").forEach(updateCartButton);
  updateCartBadge();
}

function buildCartWhatsAppLink(watches) {
  const lines = watches.map(
    (w, i) => `${i + 1}. ${w.marca} ${w.nombre} (${w.referencia}) — ${formatPrice(w.precio)}`
  );
  const total = watches.reduce((sum, w) => sum + (Number(w.precio) || 0), 0);
  const message =
    `Hola${CONFIG.businessName ? " " + CONFIG.businessName : ""}, estoy interesado/a en estos relojes que vi en la página:\n\n` +
    lines.join("\n") +
    `\n\nTotal: ${formatCOP(total)}\n\n¿Me confirmas disponibilidad y cómo sería el proceso de compra?`;
  return buildWhatsAppUrl(CONFIG.whatsappNumber, message);
}

function cartWatches() {
  return getCart()
    .map((ref) => WATCHES.find((w) => w.referencia === ref))
    .filter(Boolean);
}

function renderCartItems() {
  const watches = cartWatches();
  const container = document.getElementById("cart-items");
  const footer = document.getElementById("cart-footer");
  container.innerHTML = "";

  if (watches.length === 0) {
    container.innerHTML = `<p class="cart-empty">Tu carrito está vacío. Agrega relojes desde el catálogo con el botón "Agregar al carrito".</p>`;
    footer.hidden = true;
    return;
  }

  footer.hidden = false;
  watches.forEach((w) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img class="cart-item__img" src="${w.imagen || PLACEHOLDER_IMAGE}" alt="${w.marca} ${w.nombre}" />
      <div class="cart-item__info">
        <span class="cart-item__ref">${w.referencia}</span>
        <span class="cart-item__title">${w.marca} ${w.nombre}</span>
        <span class="cart-item__price">${formatPrice(w.precio)}</span>
      </div>
      <button class="cart-item__remove" type="button" aria-label="Quitar ${w.nombre} del carrito">✕</button>
    `;
    row.querySelector(".cart-item__remove").addEventListener("click", () => {
      removeFromCart(w.referencia);
      syncCartButtons();
      renderCartItems();
    });
    container.appendChild(row);
  });

  const total = watches.reduce((sum, w) => sum + (Number(w.precio) || 0), 0);
  document.getElementById("cart-total-value").textContent = formatCOP(total);
  document.getElementById("cart-whatsapp").href = buildCartWhatsAppLink(watches);
}

function initCart() {
  updateCartBadge();
  const modal = document.getElementById("cart-modal");
  document.getElementById("cart-toggle").addEventListener("click", () => {
    renderCartItems();
    modal.showModal();
  });
  document.getElementById("cart-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}
