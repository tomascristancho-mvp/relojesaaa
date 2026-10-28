/**
 * Conecta el panel privado a Firebase (la base de datos compartida de
 * pedidos) y deja todo listo en `window.fb` para que el resto de
 * scripts clásicos (admin-auth.js, admin-orders.js) lo usen sin
 * necesitar `import`/`export` ellos mismos.
 *
 * El SDK de Firebase está copiado dentro de este mismo proyecto en
 * js/vendor/firebase/ (no se carga desde internet en cada visita) --
 * así el panel sigue funcionando igual de simple que el resto del
 * sitio, sin depender de que un CDN externo esté disponible.
 */
import { initializeApp } from "./vendor/firebase/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  connectAuthEmulator,
} from "./vendor/firebase/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  writeBatch,
  connectFirestoreEmulator,
} from "./vendor/firebase/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Pruebas locales (sirviendo el sitio desde localhost/127.0.0.1): usa los
// emuladores de Firebase en vez del proyecto real, para nunca tocar datos
// de verdad mientras se prueba algo. En la página publicada (otro
// dominio) esto no se activa y se usa el proyecto real sin más.
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

window.fb = {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  onSnapshot,
  writeBatch,
};
window.dispatchEvent(new Event("firebase-ready"));
