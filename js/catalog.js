/**
 * Catálogo de la página pública: tarjetas de reloj, filtros (marca,
 * género), búsqueda, el efecto de inclinación 3D y el fade-in de fotos.
 * No necesitas tocar este archivo para actualizar tu catálogo: edita js/data.js
 */

const WHATSAPP_ICON = '<svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.13 2 11.22c0 1.96.63 3.78 1.72 5.27L2.4 21.02a.6.6 0 0 0 .74.75l4.7-1.4a10.6 10.6 0 0 0 4.16.84c5.52 0 10-4.13 10-9.22C22 6.13 17.52 2 12 2Z"/></svg>';
const CART_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

const supportsHoverTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function watchCard(watch) {
  const img = watch.imagen || PLACEHOLDER_IMAGE;
  const card = document.createElement("article");
  card.className = "watch-card";
  card.dataset.marca = watch.marca;
  card.dataset.genero = watch.genero;
  card.innerHTML = `
    <button class="watch-card__media" data-id="${watch.id}" aria-label="Ver detalle de ${watch.nombre}">
      <img class="fade-img" src="${img}" alt="${watch.marca} ${watch.nombre} - ${watch.referencia}" loading="lazy" />
      <span class="watch-card__view">Ver detalle</span>
    </button>
    <div class="watch-card__body">
      <span class="watch-card__ref">${watch.referencia}</span>
      <span class="watch-card__brand">${watch.marca}</span>
      <h3 class="watch-card__title">${watch.nombre}</h3>
      <p class="watch-card__price">${formatPrice(watch.precio)}</p>
      <div class="watch-card__actions">
        <a class="btn btn--whatsapp" href="${buildWhatsAppLink(watch)}" target="_blank" rel="noopener">
          ${WHATSAPP_ICON}
          Pedir por WhatsApp
        </a>
        <button class="btn btn--cart cart-add-btn${isInCart(watch.referencia) ? " is-active" : ""}" type="button" data-ref="${watch.referencia}" aria-pressed="${isInCart(watch.referencia)}">
          ${CART_ICON}
          <span class="cart-btn__label">${isInCart(watch.referencia) ? "En el carrito ✓" : "Agregar al carrito"}</span>
        </button>
      </div>
    </div>
  `;
  card.querySelector(".watch-card__media").addEventListener("click", () => openModal(watch));
  card.querySelector(".cart-add-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCartItem(watch.referencia);
    updateCartButton(e.currentTarget);
  });
  initFadeImg(card.querySelector(".fade-img"));
  initCardTilt(card);
  return card;
}

function initCardTilt(card) {
  if (!supportsHoverTilt) return;
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

function initFadeImg(img) {
  if (img.complete) {
    img.classList.add("is-loaded");
  } else {
    img.addEventListener("load", () => img.classList.add("is-loaded"));
  }
}

const filterState = { marca: "Todas", genero: "Todos", busqueda: "" };

function getFilteredWatches() {
  const query = filterState.busqueda.trim().toLowerCase();
  return WATCHES.filter(
    (w) =>
      w.disponible !== false &&
      (filterState.marca === "Todas" || w.marca === filterState.marca) &&
      (filterState.genero === "Todos" || w.genero === filterState.genero) &&
      (!query ||
        w.referencia.toLowerCase().includes(query) ||
        w.marca.toLowerCase().includes(query) ||
        w.nombre.toLowerCase().includes(query))
  );
}

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";
  const items = getFilteredWatches();
  items.forEach((watch) => grid.appendChild(watchCard(watch)));
  document.getElementById("catalog-empty").hidden = items.length !== 0;

  const availableCount = WATCHES.filter((w) => w.disponible !== false).length;
  const countEl = document.getElementById("catalog-count");
  countEl.textContent =
    items.length === availableCount
      ? `${availableCount} relojes disponibles`
      : `Mostrando ${items.length} de ${availableCount} relojes`;
}

function renderFilterGroup(containerId, key, allLabel, values) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  [allLabel, ...values].forEach((value, i) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (i === 0 ? " chip--active" : "");
    btn.textContent = value;
    btn.type = "button";
    btn.addEventListener("click", () => {
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip--active"));
      btn.classList.add("chip--active");
      filterState[key] = value;
      renderCatalog();
    });
    container.appendChild(btn);
  });
}

function renderFilters() {
  const available = WATCHES.filter((w) => w.disponible !== false);
  renderFilterGroup("filter-brand", "marca", "Todas", [...new Set(available.map((w) => w.marca))]);
  renderFilterGroup("filter-gender", "genero", "Todos", [...new Set(available.map((w) => w.genero))]);
}

function initSearch() {
  const input = document.getElementById("catalog-search");
  input.addEventListener("input", () => {
    filterState.busqueda = input.value;
    renderCatalog();
  });

  document.getElementById("catalog-clear-filters").addEventListener("click", () => {
    filterState.marca = "Todas";
    filterState.genero = "Todos";
    filterState.busqueda = "";
    input.value = "";
    renderFilters();
    renderCatalog();
  });
}
