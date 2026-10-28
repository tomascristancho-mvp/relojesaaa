/**
 * Sección pública "Correas": una cuadrícula simple de tarjetas, sin
 * filtros ni carrito (son solo 5 referencias) -- reutiliza las mismas
 * clases visuales que las tarjetas de reloj para que se vea parte del
 * mismo sitio. No necesitas tocar este archivo para agregar/quitar
 * correas: edita el arreglo BELTS en js/data.js.
 */

function beltCard(belt) {
  const img = belt.imagen || PLACEHOLDER_IMAGE;
  const card = document.createElement("article");
  card.className = "watch-card";
  card.innerHTML = `
    <div class="watch-card__media">
      <img class="fade-img" src="${img}" alt="${belt.marca} ${belt.nombre} - ${belt.referencia}" loading="lazy" decoding="async" />
    </div>
    <div class="watch-card__body">
      <div class="watch-card__ref-row">
        <span class="watch-card__ref">${belt.referencia}</span>
      </div>
      <span class="watch-card__brand">${belt.marca}</span>
      <h3 class="watch-card__title">${belt.nombre}</h3>
      <p class="belt-card__desc">${belt.descripcion}</p>
      <p class="watch-card__price">${formatPrice(belt.precio)}</p>
      <div class="watch-card__actions">
        <a class="btn btn--whatsapp" href="${buildBeltWhatsAppLink(belt)}" target="_blank" rel="noopener">
          ${WHATSAPP_ICON}
          Pedir por WhatsApp
        </a>
      </div>
    </div>
  `;
  initFadeImg(card.querySelector(".fade-img"));
  initCardTilt(card);
  return card;
}

function renderBelts() {
  const grid = document.getElementById("belts-grid");
  if (!grid || typeof BELTS === "undefined") return;
  grid.innerHTML = "";
  BELTS.filter((b) => b.disponible !== false).forEach((belt) => grid.appendChild(beltCard(belt)));
}
