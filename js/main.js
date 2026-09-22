/**
 * Lógica del sitio: renderiza el catálogo, arma los enlaces de WhatsApp
 * personalizados por reloj y maneja los filtros y el modal de detalle.
 * No necesitas tocar este archivo para actualizar tu catálogo: edita js/data.js
 */

const PLACEHOLDER_IMAGE = "images/watches/placeholder.svg";
const WHATSAPP_ICON = '<svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.13 2 11.22c0 1.96.63 3.78 1.72 5.27L2.4 21.02a.6.6 0 0 0 .74.75l4.7-1.4a10.6 10.6 0 0 0 4.16.84c5.52 0 10-4.13 10-9.22C22 6.13 17.52 2 12 2Z"/></svg>';
let modal360;

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

const supportsHoverTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
  document.getElementById("modal-zoom").href = img;
  const frames = Array.isArray(watch.imagenes360) && watch.imagenes360.length > 1 ? watch.imagenes360 : [img];
  modal360.setFrames(frames);
  modal.showModal();
}

/**
 * Visor 360°: si un reloj trae varias fotos en `imagenes360` (tomadas
 * girándolo, por ejemplo cada 15°), esto permite arrastrar la imagen del
 * modal para "girarlo". Si solo hay una foto, no hace nada especial y se
 * comporta como una foto normal. Ver README para cómo activarlo.
 */
function initModal360() {
  const wrap = document.querySelector(".modal__img-wrap");
  const img = document.getElementById("modal-img");
  const zoomLink = document.getElementById("modal-zoom");
  const SENSITIVITY = 10; // px de arrastre por cuadro
  let frames = [];
  let frameIndex = 0;
  let dragging = false;
  let startX = 0;
  let startFrame = 0;

  function showFrame(i) {
    frameIndex = ((i % frames.length) + frames.length) % frames.length;
    img.src = frames[frameIndex];
    zoomLink.href = frames[frameIndex];
  }

  function setFrames(newFrames) {
    frames = newFrames;
    frameIndex = 0;
    const is360 = frames.length > 1;
    wrap.classList.toggle("is-360", is360);
    if (is360) {
      frames.forEach((src) => {
        const preload = new Image();
        preload.src = src;
      });
    }
  }

  function onDown(clientX) {
    if (frames.length <= 1) return;
    dragging = true;
    startX = clientX;
    startFrame = frameIndex;
    wrap.classList.add("is-dragging");
  }

  function onMove(clientX) {
    if (!dragging) return;
    const steps = Math.round((clientX - startX) / SENSITIVITY);
    showFrame(startFrame - steps);
  }

  function onUp() {
    dragging = false;
    wrap.classList.remove("is-dragging");
  }

  wrap.addEventListener("mousedown", (e) => onDown(e.clientX));
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);
  wrap.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
  wrap.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  wrap.addEventListener("touchend", onUp);

  return { setFrames };
}

function initSearch() {
  const input = document.getElementById("catalog-search");
  input.addEventListener("input", () => {
    filterState.busqueda = input.value;
    renderCatalog();
  });
}

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("mobile-nav");
  toggle.addEventListener("click", () => {
    const isOpen = !nav.hidden;
    nav.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

function initModal() {
  const modal = document.getElementById("watch-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
  document.getElementById("modal-close").addEventListener("click", () => modal.close());
}

function initImageZoom() {
  const wrap = document.querySelector(".modal__img-wrap");
  const img = document.getElementById("modal-img");
  wrap.addEventListener("mousemove", (e) => {
    if (wrap.classList.contains("is-360")) return;
    const rect = wrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  });
  wrap.addEventListener("mouseleave", () => {
    img.style.transformOrigin = "center";
  });
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

function injectStructuredData() {
  const siteUrl = window.location.href.split("#")[0];
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: WATCHES.map((watch, i) => ({
      "@type": "Product",
      position: i + 1,
      name: `${watch.marca} ${watch.nombre}`,
      brand: watch.marca,
      sku: watch.referencia,
      description: watch.descripcion,
      image: siteUrl + watch.imagen,
      offers: {
        "@type": "Offer",
        priceCurrency: "COP",
        price: watch.precio ?? undefined,
        availability: "https://schema.org/InStock",
        url: siteUrl,
      },
    })),
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
  modal360 = initModal360();
  applyBranding();
  checkSetupWarnings();
  renderFilters();
  renderCatalog();
  initSearch();
  initMobileNav();
  initModal();
  initImageZoom();
  initReveal();
  initYear();
  injectStructuredData();
});
