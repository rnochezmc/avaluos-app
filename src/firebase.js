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
      list.push({ id: docSnap.id, ...docSnap.data() });
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
 * - Almacena cada fotografía en la subcolección 'fotosGallery' para que el avalúo admita fotos ilimitadas sin topar nunca el límite de 1MB de Firestore.
 * - Almacena las páginas de certificaciones RGP en la subcolección 'rgpPages'.
 * - Mantiene el documento principal ultra-ligero y rápido con fotoPortada y resúmenes.
 */
export async function saveAvaluoToCloud(avaluo) {
  if (!avaluo || !avaluo.id) {
    throw new Error('El avalúo debe contener un ID válido.');
  }

  const cleanData = removeUndefined(avaluo);
  const categories = ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'];

  // 1. Extraer primera foto válida como fotoPortada para tarjetas rápidas
  let coverPhoto = cleanData.fotoPortada || null;
  if (!coverPhoto && cleanData.fotos && typeof cleanData.fotos === 'object') {
    for (const pref of ['ingreso', 'entorno', 'interior', 'ubicacion']) {
      const val = cleanData.fotos[pref];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string' && val[0].trim()) {
        coverPhoto = val[0];
        break;
      } else if (typeof val === 'string' && val.trim()) {
        coverPhoto = val;
        break;
      }
    }
  }

  // 2. Guardar fotos individuales en la subcolección 'fotosGallery'
  let hasPhotosSavedInSub = false;
  const fotosSummary = {};

  if (cleanData.fotos && typeof cleanData.fotos === 'object') {
    const subColRef = collection(db, AVALUOS_COLLECTION, String(avaluo.id), 'fotosGallery');
    const photoPromises = [];
    const savedDocIds = new Set();

    for (const cat of categories) {
      const raw = cleanData.fotos[cat];
      const list = Array.isArray(raw)
        ? raw.filter(u => u && typeof u === 'string' && u.trim().length > 0)
        : (typeof raw === 'string' && raw.trim().length > 0 ? [raw] : []);

      fotosSummary[cat] = list.length;

      list.forEach((url, idx) => {
        const docId = `${cat}_${idx}`;
        savedDocIds.add(docId);
        const pRef = doc(subColRef, docId);
        photoPromises.push(
          setDoc(pRef, {
            category: cat,
            index: idx,
            dataUrl: url,
            updatedAt: new Date().toISOString()
          }, { merge: true })
        );
      });
    }

    if (photoPromises.length > 0) {
      hasPhotosSavedInSub = true;
      try {
        await Promise.all(photoPromises);
        // Limpieza de documentos huérfanos si se borraron fotos
        try {
          const currentSnap = await getDocs(subColRef);
          currentSnap.forEach(snapDoc => {
            if (!savedDocIds.has(snapDoc.id)) {
              deleteDoc(snapDoc.ref).catch(() => {});
            }
          });
        } catch (_cleanupErr) {}
      } catch (fErr) {
        console.warn('Error guardando fotos en subcolección fotosGallery:', fErr);
      }
    }
  }

  // 3. Guardar páginas RGP en la subcolección 'rgpPages'
  let hasPagesSavedInSub = false;
  if (Array.isArray(cleanData.consultasPdfs) && cleanData.consultasPdfs.length > 0) {
    for (const docItem of cleanData.consultasPdfs) {
      if (Array.isArray(docItem.pages)) {
        for (const page of docItem.pages) {
          if (!page.dataUrl) continue;
          try {
            const pageDocId = `${docItem.id || 'doc'}_p${page.pageIndex}`;
            const pageDocRef = doc(db, AVALUOS_COLLECTION, String(avaluo.id), 'rgpPages', pageDocId);
            await setDoc(pageDocRef, {
              docId: docItem.id || 'doc',
              docName: docItem.name || 'Certificación RGP',
              pageIndex: page.pageIndex,
              totalPaginas: page.totalPaginas || docItem.pages.length,
              fileName: page.fileName || docItem.name,
              dataUrl: page.dataUrl,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            hasPagesSavedInSub = true;
          } catch (pErr) {
            console.warn('Error guardando página en subcolección rgpPages:', pErr);
          }
        }
      }
    }
  }

  // 4. Compactar consultasPdfs para el documento principal
  let leanConsultasPdfs = cleanData.consultasPdfs;
  if (Array.isArray(cleanData.consultasPdfs) && cleanData.consultasPdfs.length > 0) {
    leanConsultasPdfs = cleanData.consultasPdfs.map(d => ({
      id: d.id,
      name: d.name,
      size: d.size,
      fecha: d.fecha,
      totalPaginas: d.pages?.length || d.totalPaginas || 1,
      hasPagesInCloud: true,
      pages: (d.pages || []).map(p => ({
        pageIndex: p.pageIndex,
        totalPaginas: p.totalPaginas,
        fileName: p.fileName
      }))
    }));
  }

  // 5. Preparar documento principal ultra-ligero (siempre < 200KB)
  const finalData = {
    ...cleanData,
    fotoPortada: coverPhoto || cleanData.fotoPortada || null,
    hasPhotosInCloud: hasPhotosSavedInSub || Boolean(cleanData.hasPhotosInCloud),
    fotosSummary: Object.keys(fotosSummary).length > 0 ? fotosSummary : cleanData.fotosSummary
  };

  if (leanConsultasPdfs) {
    finalData.consultasPdfs = leanConsultasPdfs;
  }

  // En el documento principal se mantiene fotoPortada y arrays limpios para no exceder 1MB
  if (hasPhotosSavedInSub) {
    finalData.fotos = {
      entorno: [],
      ingreso: coverPhoto ? [coverPhoto] : [],
      interior: [],
      ubicacion: [],
      croquis: [],
      dicabi: []
    };
  }

  const docRef = doc(db, AVALUOS_COLLECTION, String(avaluo.id));
  await setDoc(docRef, finalData, { merge: true });
}

/**
 * Recupera todas las fotografías desde la subcolección 'fotosGallery' de Firestore
 */
export async function fetchFotosFromCloud(avaluoId) {
  if (!avaluoId) return null;
  try {
    let colRef = collection(db, AVALUOS_COLLECTION, String(avaluoId), 'fotosGallery');
    let snap = await getDocs(colRef);
    if (snap.empty && typeof avaluoId === 'string') {
      const lower = avaluoId.toLowerCase();
      if (lower !== avaluoId) {
        colRef = collection(db, AVALUOS_COLLECTION, lower, 'fotosGallery');
        snap = await getDocs(colRef);
      }
    }
    // Fallback: si no encuentra por ID directo, buscar por código de avalúo
    if (snap.empty) {
      const colAvaluos = collection(db, AVALUOS_COLLECTION);
      const avaluosSnap = await getDocs(colAvaluos);
      const matchedDoc = avaluosSnap.docs.find(d => {
        const data = d.data();
        return data.codigo === avaluoId || d.id === avaluoId || data.id === avaluoId;
      });
      if (matchedDoc) {
        colRef = collection(db, AVALUOS_COLLECTION, matchedDoc.id, 'fotosGallery');
        snap = await getDocs(colRef);
      }
    }

    if (snap.empty) return null;

    const result = {
      entorno: [],
      ingreso: [],
      interior: [],
      ubicacion: [],
      croquis: [],
      dicabi: []
    };

    const docsData = [];
    snap.forEach((d) => docsData.push(d.data()));

    // Ordenar de manera estable por índice numérico
    docsData.sort((a, b) => (Number(a.index) || 0) - (Number(b.index) || 0));

    docsData.forEach((item) => {
      const cat = item.category;
      if (cat && result[cat] && item.dataUrl) {
        result[cat].push(item.dataUrl);
      }
    });

    const hasAny = Object.values(result).some(list => list.length > 0);
    return hasAny ? result : null;
  } catch (err) {
    console.warn('Error fetching fotos from cloud:', err);
    return null;
  }
}

/**
 * Recupera las páginas individuales de certificaciones RGP desde la subcolección de Firestore
 */
export async function fetchRgpPagesFromCloud(avaluoId) {
  if (!avaluoId) return [];
  try {
    let colRef = collection(db, AVALUOS_COLLECTION, String(avaluoId), 'rgpPages');
    let snap = await getDocs(colRef);
    if (snap.empty && typeof avaluoId === 'string') {
      const lower = avaluoId.toLowerCase();
      if (lower !== avaluoId) {
        colRef = collection(db, AVALUOS_COLLECTION, lower, 'rgpPages');
        snap = await getDocs(colRef);
      }
    }
    // Fallback: si no encuentra por ID directo, buscar por código de avalúo
    if (snap.empty) {
      const colAvaluos = collection(db, AVALUOS_COLLECTION);
      const avaluosSnap = await getDocs(colAvaluos);
      const matchedDoc = avaluosSnap.docs.find(d => {
        const data = d.data();
        return data.codigo === avaluoId || d.id === avaluoId || data.id === avaluoId;
      });
      if (matchedDoc) {
        colRef = collection(db, AVALUOS_COLLECTION, matchedDoc.id, 'rgpPages');
        snap = await getDocs(colRef);
      }
    }
    if (snap.empty) return [];
    const pages = [];
    snap.forEach((d) => pages.push(d.data()));
    return pages.sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));
  } catch (err) {
    console.warn('Error fetching rgpPages from cloud:', err);
    return [];
  }
}

/**
 * Elimina un avalúo de la nube y sus subcolecciones asociadas.
 */
export async function deleteAvaluoFromCloud(id) {
  if (!id) return;
  const docRef = doc(db, AVALUOS_COLLECTION, String(id));
  
  // Limpiar subcolecciones fotosGallery y rgpPages
  try {
    const fotosSnap = await getDocs(collection(db, AVALUOS_COLLECTION, String(id), 'fotosGallery'));
    fotosSnap.forEach(d => deleteDoc(d.ref).catch(() => {}));
  } catch (_e) {}

  try {
    const rgpSnap = await getDocs(collection(db, AVALUOS_COLLECTION, String(id), 'rgpPages'));
    rgpSnap.forEach(d => deleteDoc(d.ref).catch(() => {}));
  } catch (_e) {}

  await deleteDoc(docRef);
  if (typeof id === 'string') {
    const lowerId = id.toLowerCase();
    if (lowerId !== id) {
      await deleteDoc(doc(db, AVALUOS_COLLECTION, lowerId)).catch(() => {});
    }
  }
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
    } else if (Array.isArray(initialList)) {
      const existingIds = snap.docs.map(d => d.id);
      const cvItems = initialList.filter(i => i.codigo?.startsWith('CV-') || i.tenantId === 'cverde');
      for (const cv of cvItems) {
        if (!existingIds.includes(cv.id)) {
          await saveAvaluoToCloud(cv);
        }
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
 * Inicializa las cuentas maestras de Aroldo Ruiz y Ramiro Nóchez si la colección está vacía.
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
          tenantId: 'all',
          titulo: 'Soporte Técnico de Sistemas',
          activo: true,
          creadoEl: new Date().toISOString()
        },
        {
          id: 'aroldoruiz100_gmail_com',
          email: 'aroldoruiz100@gmail.com',
          nombre: 'Lic. Aroldo Ruiz',
          rol: 'admin',
          tenantId: 'all',
          titulo: 'Dueño y Administrador / Valuador Autorizado 2572-R-2026',
          activo: true,
          creadoEl: new Date().toISOString()
        },
        {
          id: 'cverdeavaluos_gmail_com',
          email: 'cverdeavaluos@gmail.com',
          nombre: 'Ing. Carlos Villagrán',
          rol: 'admin',
          tenantId: 'cverde',
          titulo: 'Director C VERDE / Valuador Autorizado',
          activo: true,
          creadoEl: new Date().toISOString()
        }
      ];

      for (const u of defaultUsers) {
        await saveUsuarioToCloud(u);
      }
    } else {
      // Asegurar que el registro de Ramiro tenga rol soporte y acceso a todos los tenants
      const docRef = doc(db, USUARIOS_COLLECTION, 'rnochezmc_gmail_com');
      await setDoc(docRef, { nombre: 'Ramiro Nóchez', rol: 'soporte', tenantId: 'all' }, { merge: true });

      // Asegurar que la cuenta aroldoruiz100@gmail.com esté activa en Firestore vinculada a Lex Rosam
      const docRefH = doc(db, USUARIOS_COLLECTION, 'aroldoruiz100_gmail_com');
      await setDoc(docRefH, {
        id: 'aroldoruiz100_gmail_com',
        email: 'aroldoruiz100@gmail.com',
        nombre: 'Lic. Aroldo Ruiz',
        rol: 'admin',
        tenantId: 'lex-rosam',
        activo: true
      }, { merge: true });

      // Asegurar que la cuenta cverdeavaluos@gmail.com esté vinculada a Cverde
      const docRefCV = doc(db, USUARIOS_COLLECTION, 'cverdeavaluos_gmail_com');
      await setDoc(docRefCV, {
        id: 'cverdeavaluos_gmail_com',
        email: 'cverdeavaluos@gmail.com',
        nombre: 'Ing. Carlos Villagrán',
        rol: 'admin',
        tenantId: 'cverde',
        titulo: 'Director C VERDE / Valuador Autorizado',
        activo: true
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Error inicializando usuarios base:', err);
  }
}


