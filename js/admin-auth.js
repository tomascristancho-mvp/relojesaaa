/**
 * Candado de acceso del panel: inicio de sesión real con Firebase
 * (correo + contraseña), una cuenta por persona (Tomás, Falck, Condia).
 * La protección de verdad vive en las reglas de Firestore
 * (firestore.rules) -- sin una sesión válida, Firestore rechaza
 * cualquier lectura o escritura, sin importar lo que haga esta página.
 */

function initLock() {
  const lockScreen = document.getElementById("lock-screen");
  const app = document.getElementById("admin-app");
  const form = document.getElementById("lock-form");
  const emailInput = document.getElementById("lock-email");
  const passwordInput = document.getElementById("lock-password");
  const error = document.getElementById("lock-error");
  const submitBtn = form.querySelector('button[type="submit"]');

  function unlock() {
    lockScreen.hidden = true;
    app.hidden = false;
    initAdminApp();
  }

  function waitForFirebase() {
    return new Promise((resolve) => {
      if (window.fb) return resolve();
      window.addEventListener("firebase-ready", () => resolve(), { once: true });
    });
  }

  waitForFirebase().then(() => {
    const { auth, onAuthStateChanged } = window.fb;
    // Si ya había una sesión abierta en este navegador (Firebase la
    // recuerda solo), entra directo sin pedir el correo de nuevo.
    onAuthStateChanged(auth, (user) => {
      if (user && lockScreen.hidden === false) unlock();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!window.fb) {
      error.textContent = "No se pudo conectar con la base de datos. Revisa tu conexión a internet.";
      error.hidden = false;
      return;
    }
    const { auth, signInWithEmailAndPassword } = window.fb;
    submitBtn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
      error.hidden = true;
      passwordInput.value = "";
      unlock();
    } catch (e) {
      error.textContent = "Correo o contraseña incorrectos.";
      error.hidden = false;
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function initAdminApp() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    if (window.fb) window.fb.signOut(window.fb.auth);
    window.location.reload();
  });

  populateRelojOptions();
  initOrderForm();
  initOrdersFilter();
  initOrdersSort();
  initCsvActions();
  initDetailModal();
  initSalesDetailModal();
  initClientHistory();
  initReceiptModal();
  initConfirmDialog();
  initOrdersSync(renderOrders);

  // También deja el formulario en su estado "limpio" inicial (fecha de
  // hoy, estado Pendiente) y fija ese punto de partida para detectar
  // cambios sin guardar.
  exitEditMode();
}

document.addEventListener("DOMContentLoaded", initLock);
