/**
 * Lógica del sitio: renderiza el catálogo, arma los enlaces de WhatsApp
 * personalizados por reloj y maneja los filtros y el modal de detalle.
 * No necesitas tocar este archivo para actualizar tu catálogo: edita js/data.js
 */

const PLACEHOLDER_IMAGE = "images/watches/placeholder.svg";
const WHATSAPP_ICON = '<svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.13 2 11.22c0 1.96.63 3.78 1.72 5.27L2.4 21.02a.6.6 0 0 0 .74.75l4.7-1.4a10.6 10.6 0 0 0 4.16.84c5.52 0 10-4.13 10-9.22C22 6.13 17.52 2 12 2Z"/></svg>';

function formatPrice(price) {
  if (price === null || price === undefined) return "Escríbenos por el precio";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function buildWhatsAppLink(watch) {
  const message =
    `Hola${CONFIG.businessName ? " " + CONFIG.businessName : ""}, ` +
    `estoy interesado/a en el reloj "${watch.nombre}" (${watch.referencia}) ` +
    `que vi en la página. ¿Me confirmas disponibilidad y cómo sería el proceso de compra?`;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildGeneralWhatsAppLink() {
  const message = `Hola${CONFIG.businessName ? " " + CONFIG.businessName : ""}, quisiera más información sobre tu catálogo de relojes.`;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function watchCard(watch) {
  const img = watch.imagen || PLACEHOLDER_IMAGE;
  const card = document.createElement("article");
  card.className = "watch-card";
  card.dataset.marca = watch.marca;
  card.dataset.genero = watch.genero;
  card.innerHTML = `
    <button class="watch-card__media" data-id="${watch.id}" aria-label="Ver detalle de ${watch.nombre}">
      <img src="${img}" alt="${watch.marca} ${watch.nombre} - ${watch.referencia}" loading="lazy" />
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
  return card;
}

const filterState = { marca: "Todas", genero: "Todos" };

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = "";
  const items = WATCHES.filter(
    (w) =>
      (filterState.marca === "Todas" || w.marca === filterState.marca) &&
      (filterState.genero === "Todos" || w.genero === filterState.genero)
  );
  items.forEach((watch) => grid.appendChild(watchCard(watch)));
  document.getElementById("catalog-empty").hidden = items.length !== 0;
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

function openModal(watch) {
  const modal = document.getElementById("watch-modal");
  const img = watch.imagen || PLACEHOLDER_IMAGE;
  document.getElementById("modal-img").src = img;
  document.getElementById("modal-img").alt = `${watch.nombre} - ${watch.referencia}`;
  document.getElementById("modal-ref").textContent = watch.referencia;
  document.getElementById("modal-brand").textContent = watch.marca;
  document.getElementById("modal-title").textContent = watch.nombre;
  document.getElementById("modal-price").textContent = formatPrice(watch.precio);
  document.getElementById("modal-desc").textContent = watch.descripcion;
  document.getElementById("modal-whatsapp").href = buildWhatsAppLink(watch);
  modal.showModal();
}

function initModal() {
  const modal = document.getElementById("watch-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
  document.getElementById("modal-close").addEventListener("click", () => modal.close());
}

function applyBranding() {
  document.title = `${CONFIG.businessName} — Catálogo de relojes`;
  document.querySelectorAll("[data-business-name]").forEach((el) => (el.textContent = CONFIG.businessName));
  document.querySelectorAll("[data-tagline]").forEach((el) => (el.textContent = CONFIG.tagline));
  document.querySelectorAll("[data-city]").forEach((el) => (el.textContent = CONFIG.city));
  document.querySelectorAll("a[data-whatsapp-link]").forEach((el) => (el.href = buildGeneralWhatsAppLink()));

  const igLink = document.getElementById("footer-instagram");
  if (CONFIG.instagram) {
    igLink.href = `https://instagram.com/${CONFIG.instagram.replace("@", "")}`;
    igLink.textContent = `@${CONFIG.instagram.replace("@", "")}`;
    igLink.hidden = false;
  }

  const emailLink = document.getElementById("footer-email");
  if (CONFIG.email) {
    emailLink.href = `mailto:${CONFIG.email}`;
    emailLink.textContent = CONFIG.email;
    emailLink.hidden = false;
  }
}

function checkSetupWarnings() {
  const banner = document.getElementById("setup-banner");
  const warnings = [];
  if (!CONFIG.whatsappNumber || CONFIG.whatsappNumber === "573000000000") {
    warnings.push("tu número de WhatsApp");
  }
  if (!CONFIG.businessName || CONFIG.businessName === "Tu Marca de Relojes") {
    warnings.push("el nombre de tu marca");
  }
  if (warnings.length) {
    banner.textContent = `⚠ Configura ${warnings.join(" y ")} en js/data.js antes de publicar la página.`;
    banner.hidden = false;
  }
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initYear() {
  document.getElementById("year").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  applyBranding();
  checkSetupWarnings();
  renderFilters();
  renderCatalog();
  initModal();
  initReveal();
  initYear();
});
