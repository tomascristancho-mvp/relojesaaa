/**
 * Modal de detalle de un reloj: abrir/cerrar, la lupa de zoom que sigue
 * el mouse, y el visor 360° (arrastrar para girar cuando el reloj tiene
 * varias fotos en `imagenes360`). Ver README para cómo activar el 360°.
 */

let modal360;

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

  const favBtn = document.getElementById("modal-fav");
  setFavButtonState(favBtn, isFavorite(watch.referencia));
  favBtn.onclick = () => {
    const active = toggleFavorite(watch.referencia);
    setFavButtonState(favBtn, active);
    const cardFav = document.querySelector(`.watch-card__fav[data-ref="${watch.referencia}"]`);
    if (cardFav) setFavButtonState(cardFav, active);
    if (filterState.favoritos && !active) renderCatalog();
  };

  modal.showModal();
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
