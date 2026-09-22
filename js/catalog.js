/**
 * Catálogo de la página pública: tarjetas de reloj, filtros (marca,
 * género), búsqueda, el efecto de inclinación 3D y el fade-in de fotos.
 * No necesitas tocar este archivo para actualizar tu catálogo: edita js/data.js
 */

const WHATSAPP_ICON = '<svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.13 2 11.22c0 1.96.63 3.78 1.72 5.27L2.4 21.02a.6.6 0 0 0 .74.75l4.7-1.4a10.6 10.6 0 0 0 4.16.84c5.52 0 10-4.13 10-9.22C22 6.13 17.52 2 12 2Z"/></svg>';

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
      <a class="btn btn--whatsapp" href="${buildWhatsAppLink(watch)}" target="_blank" rel="noopener">
        ${WHATSAPP_ICON}
        Pedir por WhatsApp
      </a>
    </div>
  `;
  card.querySelector(".watch-card__media").addEventListener("click", () => openModal(watch));
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

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";
  const query = filterState.busqueda.trim().toLowerCase();
  const items = WATCHES.filter(
    (w) =>
      (filterState.marca === "Todas" || w.marca === filterState.marca) &&
      (filterState.genero === "Todos" || w.genero === filterState.genero) &&
      (!query ||
        w.referencia.toLowerCase().includes(query) ||
        w.marca.toLowerCase().includes(query) ||
        w.nombre.toLowerCase().includes(query))
  );
  items.forEach((watch) => grid.appendChild(watchCard(watch)));
  document.getElementById("catalog-empty").hidden = items.length !== 0;

  const countEl = document.getElementById("catalog-count");
  countEl.textContent =
    items.length === WATCHES.length
      ? `${WATCHES.length} relojes disponibles`
      : `Mostrando ${items.length} de ${WATCHES.length} relojes`;
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
  renderFilterGroup("filter-brand", "marca", "Todas", [...new Set(WATCHES.map((w) => w.marca))]);
  renderFilterGroup("filter-gender", "genero", "Todos", [...new Set(WATCHES.map((w) => w.genero))]);
}

function initSearch() {
  const input = document.getElementById("catalog-search");
  input.addEventListener("input", () => {
    filterState.busqueda = input.value;
    renderCatalog();
  });
}
