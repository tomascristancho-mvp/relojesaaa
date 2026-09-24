/**
 * Modal de detalle de un reloj: abrir/cerrar, la lupa de zoom (acerca la
 * misma imagen sobre el mouse o con el botón -- nunca abre ni descarga
 * nada aparte), el botón de compartir (enlace directo a ese reloj vía
 * ?reloj=REF-01), y las flechas para pasar al reloj anterior/siguiente
 * dentro de los filtros actuales (también con las flechas ← → del
 * teclado).
 */

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
  setImageZoomed(false);

  const cartBtn = document.getElementById("modal-cart");
  cartBtn.dataset.ref = watch.referencia;
  updateCartButton(cartBtn);
  cartBtn.onclick = () => {
    toggleCartItem(watch.referencia);
    updateCartButton(cartBtn);
    const cardCartBtn = document.querySelector(`#catalog-grid .cart-add-btn[data-ref="${watch.referencia}"]`);
    if (cardCartBtn) updateCartButton(cardCartBtn);
  };

  const shareBtn = document.getElementById("modal-share");
  shareBtn.classList.remove("is-copied");
  shareBtn.onclick = () => shareWatch(watch, shareBtn);

  updateModalNav(watch);
  renderRelatedWatches(watch);

  modal.showModal();
}

/**
 * "También te puede interesar": 3 relojes disponibles distintos al que se
 * está viendo, priorizando la misma marca y después el mismo género. Se
 * calcula solo con lo que ya hay en WATCHES (js/data.js) -- no hace falta
 * curarlo a mano, y se actualiza solo si cambia el catálogo.
 */
function getRelatedWatches(watch, limit = 3) {
  const pool = WATCHES.filter((w) => w.disponible !== false && w.referencia !== watch.referencia);
  const sameBrand = pool.filter((w) => w.marca === watch.marca);
  const sameGenero = pool.filter((w) => w.genero === watch.genero && w.marca !== watch.marca);
  const rest = pool.filter((w) => w.marca !== watch.marca && w.genero !== watch.genero);
  return [...sameBrand, ...sameGenero, ...rest].slice(0, limit);
}

function renderRelatedWatches(watch) {
  const section = document.getElementById("modal-related");
  const list = document.getElementById("modal-related-list");
  const related = getRelatedWatches(watch);

  section.hidden = related.length === 0;
  if (related.length === 0) return;

  list.innerHTML = related
    .map(
      (w) => `
        <button class="modal__related-item" type="button" data-ref="${w.referencia}">
          <img src="${w.imagen || PLACEHOLDER_IMAGE}" alt="${w.marca} ${w.nombre}" loading="lazy" />
          <span class="modal__related-name">${w.marca} ${w.nombre}</span>
          <span class="modal__related-price">${formatPrice(w.precio)}</span>
        </button>`
    )
    .join("");

  list.querySelectorAll(".modal__related-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const relatedWatch = WATCHES.find((w) => w.referencia === btn.dataset.ref);
      if (relatedWatch) openModal(relatedWatch);
    });
  });
}

function updateModalNav(watch) {
  const items = getFilteredWatches();
  const prevBtn = document.getElementById("modal-prev");
  const nextBtn = document.getElementById("modal-next");
  const positionEl = document.getElementById("modal-position");
  const idx = items.findIndex((w) => w.referencia === watch.referencia);
  const hasMultiple = idx !== -1 && items.length > 1;
  prevBtn.hidden = !hasMultiple;
  nextBtn.hidden = !hasMultiple;
  positionEl.hidden = !hasMultiple;
  if (!hasMultiple) return;
  positionEl.textContent = `${idx + 1} / ${items.length}`;
  const prevWatch = items[(idx - 1 + items.length) % items.length];
  const nextWatch = items[(idx + 1) % items.length];
  prevBtn.onclick = () => openModal(prevWatch);
  nextBtn.onclick = () => openModal(nextWatch);
}

async function shareWatch(watch, btn) {
  const url = buildWatchShareUrl(watch);
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${watch.marca} ${watch.nombre} — ${CONFIG.businessName}`,
        text: `Mira este reloj en ${CONFIG.businessName}: ${watch.marca} ${watch.nombre} (${watch.referencia})`,
        url,
      });
    } catch {
      /* el usuario cerró el diálogo de compartir, no hacer nada */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    window.prompt("Copia este enlace para compartir:", url);
    return;
  }
  btn.classList.add("is-copied");
  btn.setAttribute("aria-label", "Enlace copiado");
  setTimeout(() => {
    btn.classList.remove("is-copied");
    btn.setAttribute("aria-label", "Compartir este reloj");
  }, 1800);
}

function initModal() {
  const modal = document.getElementById("watch-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
  document.getElementById("modal-close").addEventListener("click", () => modal.close());
  document.getElementById("modal-back").addEventListener("click", () => modal.close());
  modal.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      const btn = document.getElementById("modal-prev");
      if (!btn.hidden) btn.click();
    } else if (e.key === "ArrowRight") {
      const btn = document.getElementById("modal-next");
      if (!btn.hidden) btn.click();
    }
  });
}

/**
 * Acerca la foto sobre la parte que se señala -- con el mouse (sigue el
 * cursor mientras pasa por encima) o tocando la lupa (útil en celular,
 * donde no existe el "hover"). Nunca navega a otra página ni ofrece
 * descargar la imagen: solo hace zoom dentro del mismo modal.
 */
function setImageZoomed(zoomed) {
  const wrap = document.querySelector(".modal__img-wrap");
  const zoomBtn = document.getElementById("modal-zoom");
  wrap.classList.toggle("is-zoomed", zoomed);
  zoomBtn.classList.toggle("is-active", zoomed);
  zoomBtn.setAttribute("aria-pressed", String(zoomed));
  if (!zoomed) document.getElementById("modal-img").style.transformOrigin = "center";
}

function initImageZoom() {
  const wrap = document.querySelector(".modal__img-wrap");
  const img = document.getElementById("modal-img");
  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  });
  wrap.addEventListener("mouseleave", () => {
    img.style.transformOrigin = "center";
  });

  document.getElementById("modal-zoom").addEventListener("click", () => {
    setImageZoomed(!wrap.classList.contains("is-zoomed"));
  });
}
