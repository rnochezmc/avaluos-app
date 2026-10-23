// Local persistent storage using native browser IndexedDB
// Bypasses the 5MB browser localStorage limit and guarantees document attachments never get lost.

const DB_NAME = 'lexrosam_local_db';
const DB_VERSION = 1;
const AVALUOS_STORE = 'avaluos_store';
const RGP_PAGES_STORE = 'rgp_pages_store';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(AVALUOS_STORE)) {
        db.createObjectStore(AVALUOS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(RGP_PAGES_STORE)) {
        const pageStore = db.createObjectStore(RGP_PAGES_STORE, { keyPath: 'key' });
        pageStore.createIndex('avaluoId', 'avaluoId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('Error al abrir IndexedDB:', request.error);
      resolve(null);
    };
  });
}

/**
 * Guarda o actualiza un expediente completo en IndexedDB (sin límites de cuota de 5MB)
 */
export async function saveAvaluoToLocalDb(avaluo) {
  if (!avaluo || !avaluo.id) return;
  try {
    const db = await openDb();
    if (!db) return;

    const tx = db.transaction([AVALUOS_STORE, RGP_PAGES_STORE], 'readwrite');
    const avaluoStore = tx.objectStore(AVALUOS_STORE);
    const pagesStore = tx.objectStore(RGP_PAGES_STORE);

    // Guardar el avalúo principal
    avaluoStore.put(avaluo);

    // Si tiene consultasPdfs con páginas, respaldar cada página de forma indexada
    if (Array.isArray(avaluo.consultasPdfs)) {
      avaluo.consultasPdfs.forEach((docItem) => {
        if (Array.isArray(docItem.pages)) {
          docItem.pages.forEach((page) => {
            const pageKey = `${avaluo.id}_${docItem.id || 'doc'}_${page.pageIndex}`;
            pagesStore.put({
              key: pageKey,
              avaluoId: avaluo.id,
              docId: docItem.id,
              docName: docItem.name || 'Certificación RGP',
              pageIndex: page.pageIndex,
              totalPaginas: page.totalPaginas,
              fileName: page.fileName || docItem.name,
              dataUrl: page.dataUrl,
              savedAt: new Date().toISOString()
            });
          });
        }
      });
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.warn('Error en transacción IndexedDB saveAvaluo:', tx.error);
        resolve();
      };
    });
  } catch (err) {
    console.warn('Error saving to IndexedDB:', err);
  }
}

/**
 * Obtiene un avalúo por ID de IndexedDB, enriquecido con sus páginas de consultas RGP
 */
export async function getAvaluoFromLocalDb(id) {
  if (!id) return null;
  try {
    const db = await openDb();
    if (!db) return null;

    const tx = db.transaction([AVALUOS_STORE, RGP_PAGES_STORE], 'readonly');
    const avaluoStore = tx.objectStore(AVALUOS_STORE);
    const pagesStore = tx.objectStore(RGP_PAGES_STORE);

    const avaluoReq = avaluoStore.get(id);

    return new Promise((resolve) => {
      avaluoReq.onsuccess = () => {
        const avaluo = avaluoReq.result;
        if (!avaluo) {
          resolve(null);
          return;
        }

        // Obtener páginas respaldadas
        const index = pagesStore.index('avaluoId');
        const pagesReq = index.getAll(id);

        pagesReq.onsuccess = () => {
          const storedPages = pagesReq.result || [];
          if (storedPages.length > 0 && Array.isArray(avaluo.consultasPdfs)) {
            // Reconstruir pages si faltan en consultasPdfs
            avaluo.consultasPdfs = avaluo.consultasPdfs.map((docItem) => {
              const docPages = storedPages
                .filter(p => p.docId === docItem.id || p.docName === docItem.name)
                .sort((a, b) => a.pageIndex - b.pageIndex);

              if (docPages.length > 0 && (!docItem.pages || docItem.pages.length === 0)) {
                return {
                  ...docItem,
                  pages: docPages.map(p => ({
                    pageIndex: p.pageIndex,
                    totalPaginas: p.totalPaginas,
                    dataUrl: p.dataUrl,
                    fileName: p.fileName
                  }))
                };
              }
              return docItem;
            });
          }
          resolve(avaluo);
        };

        pagesReq.onerror = () => resolve(avaluo);
      };

      avaluoReq.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Error getting from IndexedDB:', err);
    return null;
  }
}

/**
 * Obtiene todos los avalúos almacenados en IndexedDB
 */
export async function getAllAvaluosFromLocalDb() {
  try {
    const db = await openDb();
    if (!db) return [];

    const tx = db.transaction(AVALUOS_STORE, 'readonly');
    const request = tx.objectStore(AVALUOS_STORE).getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Error getting all from IndexedDB:', err);
    return [];
  }
}

/**
 * Elimina un avalúo y sus páginas de IndexedDB
 */
export async function deleteAvaluoFromLocalDb(id) {
  if (!id) return;
  try {
    const db = await openDb();
    if (!db) return;

    const tx = db.transaction([AVALUOS_STORE, RGP_PAGES_STORE], 'readwrite');
    tx.objectStore(AVALUOS_STORE).delete(id);

    // Eliminar páginas asociadas
    const pagesStore = tx.objectStore(RGP_PAGES_STORE);
    const index = pagesStore.index('avaluoId');
    const req = index.getAllKeys(id);
    req.onsuccess = () => {
      (req.result || []).forEach(key => pagesStore.delete(key));
    };

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Error deleting from IndexedDB:', err);
  }
}
