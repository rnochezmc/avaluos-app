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

const firebaseConfig = {
  apiKey: "AIzaSyBkvww64wA8GZtDnWuSY4lBWXfFYpsMdPk",
  authDomain: "cverde-avaluos-gt.firebaseapp.com",
  projectId: "cverde-avaluos-gt",
  storageBucket: "cverde-avaluos-gt.firebasestorage.app",
  messagingSenderId: "541486764518",
  appId: "1:541486764518:web:5c2e67453d3bd330210627"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const AVALUOS_COLLECTION = 'avaluos';

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

/**
 * Guarda o actualiza un expediente de avalúo en Firestore.
 */
export async function saveAvaluoToCloud(avaluo) {
  if (!avaluo || !avaluo.id) {
    throw new Error('El avalúo debe contener un ID válido.');
  }
  const docRef = doc(db, AVALUOS_COLLECTION, String(avaluo.id));
  await setDoc(docRef, avaluo, { merge: true });
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
