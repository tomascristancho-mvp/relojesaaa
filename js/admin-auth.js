/**
 * Candado de acceso del panel y arranque general una vez desbloqueado.
 * El código de acceso vive en js/admin-config.js. Recuerda: esto NO es
 * seguridad real (ver README, sección "Panel privado").
 */

const UNLOCK_KEY = "altitude_admin_unlocked";

function initLock() {
  const lockScreen = document.getElementById("lock-screen");
  const app = document.getElementById("admin-app");
  const form = document.getElementById("lock-form");
  const input = document.getElementById("lock-input");
  const error = document.getElementById("lock-error");

  function unlock() {
    lockScreen.hidden = true;
    app.hidden = false;
    initAdminApp();
  }

  if (sessionStorage.getItem(UNLOCK_KEY) === "true") {
    unlock();
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value === ADMIN_CONFIG.passcode) {
      sessionStorage.setItem(UNLOCK_KEY, "true");
      error.hidden = true;
      unlock();
    } else {
      error.hidden = false;
      input.value = "";
      input.focus();
    }
  });
}

function initAdminApp() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem(UNLOCK_KEY);
    window.location.reload();
  });

  populateRelojOptions();
  initOrderForm();
  initOrdersFilter();
  initOrdersSort();
  initCsvActions();
  initDetailModal();
  initSalesDetailModal();
  initReceiptModal();
  initConfirmDialog();
  renderOrders();

  // También deja el formulario en su estado "limpio" inicial (fecha de
  // hoy, estado Pendiente) y fija ese punto de partida para detectar
  // cambios sin guardar.
  exitEditMode();
}

document.addEventListener("DOMContentLoaded", initLock);
