/**
 * Todo lo que no es el catálogo ni el modal: aplicar los datos de tu
 * marca (js/data.js) al HTML, el menú móvil, el aviso de configuración
 * pendiente, la animación al hacer scroll, los datos estructurados para
 * buscadores, y el arranque general de la página al cargar.
 */

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
  initCart();
  initMobileNav();
  initModal();
  initImageZoom();
  initReveal();
  initYear();
  injectStructuredData();
});
