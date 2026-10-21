import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkvww64wA8GZtDnWuSY4lBWXfFYpsMdPk",
  authDomain: "lexrosam-avaluos.firebaseapp.com",
  projectId: "cverde-avaluos-gt",
  storageBucket: "cverde-avaluos-gt.firebasestorage.app",
  messagingSenderId: "541486764518",
  appId: "1:541486764518:web:5c2e67453d3bd330210627"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Forzar a Google a mostrar siempre el selector de cuentas
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged };

const AVALUOS_COLLECTION = 'avaluos';
const USUARIOS_COLLECTION = 'usuarios';

/**
 * Escucha cambios en tiempo real en la colección de avalúos.
 * Cualquier avalúo creado o editado desde otro dispositivo se reflejará al instante.
 */
export function subscribeToAvaluos(onData, onError) {
  const colRef = collection(db, AVALUOS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    onData(list);
  }, (err) => {
    console.error('Error listening to Firebase Firestore:', err);
    if (onError) onError(err);
  });
}

function removeUndefined(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = removeUndefined(val);
    }
  }
  return clean;
}

/**
 * Guarda o actualiza un expediente de avalúo en Firestore.
 */
export async function saveAvaluoToCloud(avaluo) {
  if (!avaluo || !avaluo.id) {
    throw new Error('El avalúo debe contener un ID válido.');
  }
  const cleanData = removeUndefined(avaluo);
  const docRef = doc(db, AVALUOS_COLLECTION, String(avaluo.id));
  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Elimina un avalúo de la nube.
 */
export async function deleteAvaluoFromCloud(id) {
  if (!id) return;
  const docRef = doc(db, AVALUOS_COLLECTION, String(id));
  await deleteDoc(docRef);
}

/**
 * Si la colección de Firestore está vacía (primer uso), la inicializa con los expedientes demo.
 */
export async function seedInitialAvaluosIfEmpty(initialList) {
  try {
    const colRef = collection(db, AVALUOS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty && Array.isArray(initialList)) {
      console.log('Inicializando Firestore con datos iniciales...');
      for (const item of initialList) {
        await saveAvaluoToCloud(item);
      }
    }
  } catch (err) {
    console.warn('No se pudo inicializar los datos en Firebase (posible modo offline):', err);
  }
}

/**
 * Escucha cambios en tiempo real en la colección de usuarios del sistema.
 */
export function subscribeToUsuarios(onData, onError) {
  const colRef = collection(db, USUARIOS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    onData(list);
  }, (err) => {
    console.error('Error listening to Firebase usuarios:', err);
    if (onError) onError(err);
  });
}

/**
 * Guarda o actualiza un usuario en Firestore.
 */
export async function saveUsuarioToCloud(usuario) {
  if (!usuario || !usuario.email) {
    throw new Error('El usuario debe tener un correo electrónico válido.');
  }
  const cleanId = usuario.id || usuario.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const docRef = doc(db, USUARIOS_COLLECTION, cleanId);
  await setDoc(docRef, {
    ...usuario,
    email: usuario.email.toLowerCase().trim(),
    actualizadoEl: new Date().toISOString()
  }, { merge: true });
}

/**
 * Elimina un usuario de Firestore.
 */
export async function deleteUsuarioFromCloud(id) {
  if (!id) return;
  const docRef = doc(db, USUARIOS_COLLECTION, String(id));
  await deleteDoc(docRef);
}

/**
 * Inicializa las cuentas maestras de Haroldo Ruiz y Ramiro Nóchez si la colección está vacía.
 */
export async function seedInitialUsuariosIfEmpty() {
  try {
    const colRef = collection(db, USUARIOS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('Inicializando cuentas maestras en Firestore...');
      const defaultUsers = [
        {
          id: 'rnochezmc_gmail_com',
          email: 'rnochezmc@gmail.com',
          nombre: 'Ramiro Nóchez',
          rol: 'soporte',
          titulo: 'Soporte Técnico y Sistemas',
          activo: true,
          creadoEl: new Date().toISOString()
        },
        {
          id: 'cverdeavaluos_gmail_com',
          email: 'cverdeavaluos@gmail.com',
          nombre: 'Lic. Haroldo Ruiz',
          rol: 'admin',
          titulo: 'Dueño LEX ROSAM / Valuador Autorizado 2572-R-2026',
          activo: true,
          creadoEl: new Date().toISOString()
        },
        {
          id: 'aroldoruiz100_gmail_com',
          email: 'aroldoruiz100@gmail.com',
          nombre: 'Lic. Haroldo Ruiz',
          rol: 'admin',
          titulo: 'Dueño LEX ROSAM / Valuador Autorizado 2572-R-2026',
          activo: true,
          creadoEl: new Date().toISOString()
        }
      ];

      for (const u of defaultUsers) {
        await saveUsuarioToCloud(u);
      }
    } else {
      // Asegurar que el registro de Ramiro no tenga "Ing." en Firestore
      const docRef = doc(db, USUARIOS_COLLECTION, 'rnochezmc_gmail_com');
      await setDoc(docRef, { nombre: 'Ramiro Nóchez' }, { merge: true });

      // Asegurar que la cuenta aroldoruiz100@gmail.com esté activa en Firestore
      const docRefH = doc(db, USUARIOS_COLLECTION, 'aroldoruiz100_gmail_com');
      await setDoc(docRefH, {
        id: 'aroldoruiz100_gmail_com',
        email: 'aroldoruiz100@gmail.com',
        nombre: 'Lic. Haroldo Ruiz',
        rol: 'admin',
        titulo: 'Dueño LEX ROSAM / Valuador Autorizado 2572-R-2026',
        activo: true
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Error inicializando usuarios base:', err);
  }
}


