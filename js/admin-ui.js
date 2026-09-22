/**
 * Piezas de interfaz reutilizables del panel: notificaciones (toast) y
 * un diálogo de confirmación con el estilo del sitio, para no usar las
 * ventanas grises por defecto del navegador (alert/confirm).
 */

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function initConfirmDialog() {
  const modal = document.getElementById("confirm-dialog");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

/**
 * Muestra el diálogo de confirmación y resuelve `true` (aceptar) o
 * `false` (cancelar / cerrado sin elegir).
 */
function confirmDialog({ title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false }) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-dialog");
    document.getElementById("confirm-dialog-title").textContent = title;
    document.getElementById("confirm-dialog-message").textContent = message;
    const okBtn = document.getElementById("confirm-dialog-ok");
    const cancelBtn = document.getElementById("confirm-dialog-cancel");
    okBtn.textContent = confirmLabel;
    cancelBtn.textContent = cancelLabel;
    okBtn.classList.toggle("btn--danger", danger);
    okBtn.classList.toggle("btn--primary", !danger);

    let resolved = false;
    function finish(result) {
      if (resolved) return;
      resolved = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      modal.removeEventListener("close", onModalClose);
      resolve(result);
      if (modal.open) modal.close();
    }
    function onOk() {
      finish(true);
    }
    function onCancel() {
      finish(false);
    }
    function onModalClose() {
      finish(false);
    }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    modal.addEventListener("close", onModalClose);
    modal.showModal();
  });
}
