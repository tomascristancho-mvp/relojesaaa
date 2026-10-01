/**
 * Comparador de relojes: el visitante marca hasta 3 relojes desde el
 * catálogo (botón en la esquina de cada foto) y los ve lado a lado
 * -- precio, género, descripción -- antes de decidir cuál pedir por
 * WhatsApp. Vive solo en memoria mientras dura la visita, no se guarda.
 */

const COMPARE_MAX = 3;
const compareState = new Set();

function isInCompare(referencia) {
  return compareState.has(referencia);
}

function toggleCompare(referencia) {
  if (compareState.has(referencia)) {
    compareState.delete(referencia);
  } else {
    if (compareState.size >= COMPARE_MAX) {
      showToast(`Puedes comparar hasta ${COMPARE_MAX} relojes a la vez`, "error");
      return;
    }
    compareState.add(referencia);
  }
  syncCompareToggleButtons();
  renderCompareTray();
}

function syncCompareToggleButtons() {
  document.querySelectorAll(".watch-card__compare").forEach((btn) => {
    const active = isInCompare(btn.dataset.ref);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function getCompareWatches() {
  return [...compareState]
    .map((ref) => WATCHES.find((w) => w.referencia === ref))
    .filter(Boolean);
}

function renderCompareTray() {
  const tray = document.getElementById("compare-tray");
  const itemsEl = document.getElementById("compare-tray-items");
  const openBtn = document.getElementById("compare-tray-open");
  if (!tray) return;
  const watches = getCompareWatches();

  tray.hidden = watches.length === 0;
  if (watches.length === 0) return;

  itemsEl.innerHTML = watches
    .map((w) => `<img src="${w.imagen || PLACEHOLDER_IMAGE}" alt="${w.marca} ${w.nombre}" />`)
    .join("");

  openBtn.disabled = watches.length < 2;
  openBtn.textContent = watches.length < 2 ? "Elige 1 más" : `Comparar (${watches.length})`;
}

function renderCompareModal() {
  const container = document.getElementById("compare-table");
  const watches = getCompareWatches();

  if (watches.length === 0) {
    container.innerHTML = `<p class="compare-table__empty">No hay relojes seleccionados para comparar.</p>`;
    return;
  }

  container.innerHTML = watches
    .map(
      (w) => `
        <div class="compare-col">
          <button class="compare-col__remove" type="button" data-ref="${w.referencia}" aria-label="Quitar ${w.marca} ${w.nombre} de la comparación">✕</button>
          <img src="${w.imagen || PLACEHOLDER_IMAGE}" alt="${w.marca} ${w.nombre}" />
          <span class="compare-col__brand">${w.marca}</span>
          <h4 class="compare-col__title">${w.nombre}</h4>
          <p class="compare-col__price">${formatPrice(w.precio)}</p>
          <dl class="compare-col__specs">
            <dt>Referencia</dt><dd>${w.referencia}</dd>
            <dt>Género</dt><dd>${w.genero}</dd>
            <dt>Disponibilidad</dt><dd>Pieza única</dd>
          </dl>
          <p class="compare-col__desc">${w.descripcion || ""}</p>
          <a class="btn btn--whatsapp btn--small" href="${buildWhatsAppLink(w)}" target="_blank" rel="noopener">
            ${WHATSAPP_ICON}
            Pedir por WhatsApp
          </a>
        </div>`
    )
    .join("");

  container.querySelectorAll(".compare-col__remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ref = btn.dataset.ref;
      compareState.delete(ref);
      syncCompareToggleButtons();
      renderCompareTray();
      if (compareState.size === 0) {
        document.getElementById("compare-modal").close();
      } else {
        renderCompareModal();
      }
    });
  });
}

function initCompare() {
  const tray = document.getElementById("compare-tray");
  const modal = document.getElementById("compare-modal");
  if (!tray || !modal) return;

  document.getElementById("compare-tray-open").addEventListener("click", () => {
    if (compareState.size < 2) return;
    renderCompareModal();
    modal.showModal();
  });
  document.getElementById("compare-tray-clear").addEventListener("click", () => {
    compareState.clear();
    syncCompareToggleButtons();
    renderCompareTray();
  });
  document.getElementById("compare-modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}
