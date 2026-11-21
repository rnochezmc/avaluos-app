import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import SearchAndFilters from './components/SearchAndFilters';
import AvaluoCard from './components/AvaluoCard';
import AvaluoTable from './components/AvaluoTable';
import AvaluoDetailModal from './components/AvaluoDetailModal';
import AvaluoFormModal from './components/AvaluoFormModal';
import OfficialReportPrintView from './components/OfficialReportPrintView';
import MobileBottomNav from './components/MobileBottomNav';
import LoginScreen from './components/LoginScreen';
import UserManagementModal from './components/UserManagementModal';
import ReporteriaModal from './components/ReporteriaModal';
import CertificacionValorModal from './components/CertificacionValorModal';
import CertificacionPrintView from './components/CertificacionPrintView';
import { canUserEditAvaluo, isAroldoOrAdminUser } from './utils/permissions';
import { resolveUniqueCodigo } from './utils/correlativos';
import { initialAvaluos, DEFAULT_DICTAMEN_GARANTIA } from './data/mockAvaluos';
import { getTenantConfig, DEFAULT_TENANT_ID } from './data/tenantsConfig';
import { 
  subscribeToAvaluos, 
  saveAvaluoToCloud, 
  deleteAvaluoFromCloud, 
  seedInitialAvaluosIfEmpty,
  auth,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  subscribeToUsuarios,
  seedInitialUsuariosIfEmpty
} from './firebase';
import { 
  saveAvaluoToLocalDb, 
  getAllAvaluosFromLocalDb, 
  deleteAvaluoFromLocalDb 
} from './utils/localDb';
import { SearchX, Plus, Sparkles, ShieldAlert, LogOut, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'lexrosam_avaluos_db_v3';
const LEGACY_STORAGE_KEY_V2 = 'lexrosam_avaluos_db_v2';
const LEGACY_STORAGE_KEY = 'cverde_avaluos_db_v1';
const AUTH_USER_KEY = 'lexrosam_auth_user';

// Función para enriquecer registros, fotos y reparar datos de limitaciones / áreas comunes / propietarios
const repairAndEnrichAvaluo = (avaluoItem) => {
  if (!avaluoItem) return { item: avaluoItem, changed: false };
  let changed = false;
  let item = { ...avaluoItem };

  // 1. Fotos por defecto si vienen vacías
  const match = initialAvaluos.find(init => init.id === item.id || init.codigo === item.codigo);
  if (match && match.fotos) {
    const currentFotos = item.fotos || {};
    const mergedFotos = { ...currentFotos };
    for (const key of ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi']) {
      const curr = mergedFotos[key];
      const hasPhoto = Array.isArray(curr) ? curr.length > 0 : (typeof curr === 'string' && curr.trim().length > 0);
      if (!hasPhoto && match.fotos[key]) {
        mergedFotos[key] = match.fotos[key];
        changed = true;
      }
    }
    if (changed) {
      item.fotos = mergedFotos;
    }
  }

  // 2. Si texto de elementos comunes fue guardado en desmembracion por falta del campo areasComunes
  if (
    item.desmembracion && 
    (/elementos comunes|areas comunes|áreas comunes|comunes|finca 500|finca 1334/i.test(item.desmembracion)) &&
    (!item.areasComunes || item.areasComunes === 'No aplica' || item.areasComunes === 'No')
  ) {
    item.areasComunes = item.desmembracion;
    item.desmembracion = 'No aplica';
    changed = true;
  }

  // 3. Propietario principal si no está asignado pero existe en fincas o bienMostradoPor
  if (!item.propietarioPrincipal || item.propietarioPrincipal.trim() === '' || item.propietarioPrincipal === 'Propietario no asignado') {
    const firstFincaProp = item.fincas?.[0]?.propietario;
    if (firstFincaProp && firstFincaProp.trim().length > 0) {
      item.propietarioPrincipal = firstFincaProp;
      changed = true;
    } else if (item.bienMostradoPor && item.bienMostradoPor.trim().length > 0) {
      item.propietarioPrincipal = item.bienMostradoPor;
      changed = true;
    }
  }

  // 4. Corrección de precisión centesimal en valor bancario (eliminación del artefacto Math.round)
  if (item.valorComercialGTQ && Number(item.valorComercialGTQ) > 0) {
    const comGTQ = Number(item.valorComercialGTQ);
    const exact80 = parseFloat((comGTQ * 0.8).toFixed(2));
    const tc = Number(item.tipoCambio) || 7.62581;
    
    // Si valorBancarioGTQ es un entero que coincide con Math.round(exact80) pero exact80 tiene centavos
    if (
      item.valorBancarioGTQ != null &&
      Number.isInteger(Number(item.valorBancarioGTQ)) &&
      !Number.isInteger(exact80) &&
      Math.round(exact80) === Number(item.valorBancarioGTQ)
    ) {
      item.valorBancarioGTQ = exact80;
      item.valorBancarioUSD = parseFloat((exact80 / tc).toFixed(2));
      changed = true;
    }
  }

  // 5. Normalización oficial de valuadores y sellos de firma
  if (!item.valuadorPrincipal || item.valuadorPrincipal.includes('Villagrán')) {
    item.valuadorPrincipal = 'Lic. Aroldo Oliverio Ruiz Orozco';
    item.registroPrincipal = 'Valuador autorizado 2572-R-2026';
    changed = true;
  }
  if (!item.valuadorRevisor || item.valuadorRevisor.includes('Tolaque') || item.valuadorRevisor.includes('Morales Solares')) {
    item.valuadorRevisor = 'Lic. Edgar Rolando Martínez Larios';
    item.registroRevisor = 'Valuador autorizado 2571-M-2026';
    changed = true;
  }
  if (!item.firmaPrincipalImg) {
    item.firmaPrincipalImg = '/signatures/firma_aroldo_ruiz.png';
    changed = true;
  }
  if (!item.firmaRevisorImg) {
    item.firmaRevisorImg = '/signatures/firma_edgar_martinez.png';
    changed = true;
  }

  // 6. Normalización del dictamen oficial de garantía al nuevo formato predeterminado
  if (!item.dictamenGarantia || item.dictamenGarantia.includes('condiciones técnicas, físicas y de mercado')) {
    item.dictamenGarantia = DEFAULT_DICTAMEN_GARANTIA;
    changed = true;
  }

  return { item, changed };
};

const enrichWithDefaultPhotos = (avaluoItem) => {
  return repairAndEnrichAvaluo(avaluoItem).item;
};

export default function App() {
  const [cloudStatus, setCloudStatus] = useState('conectando'); // 'conectado' | 'offline' | 'conectando'
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Real Google Auth user state (strictly governed by Firebase Auth)
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoaded, setUsuariosLoaded] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentRole, setCurrentRole] = useState('autorizador');
  const [deletingAvaluo, setDeletingAvaluo] = useState(null);

  // Multi-tenant selection state (lex-rosam | cverde | todos)
  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    return localStorage.getItem('avaluos_active_tenant') || DEFAULT_TENANT_ID;
  });

  const handleSelectTenant = (tenantId) => {
    setSelectedTenantId(tenantId);
    try {
      localStorage.setItem('avaluos_active_tenant', tenantId);
    } catch (e) {
      console.warn('Error saving active tenant', e);
    }
  };

  const currentTenantConfig = useMemo(() => {
    return getTenantConfig(selectedTenantId === 'todos' ? 'lex-rosam' : selectedTenantId);
  }, [selectedTenantId]);

  // Load persistent data from localStorage or fallback to initial mock with smart photo sync
  const [avaluos, setAvaluos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_V2) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtrar LR-2026-10031 y mocks cv-2026-001/002 para que no persistan en cache local
          const merged = parsed
            .filter(p => 
              !['lr-2026-10031', 'cv-2026-001', 'cv-2026-002'].includes(p.id) &&
              !['LR-2026-10031', 'CV-2026-001', 'CV-2026-002'].includes(p.codigo)
            )
            .map(p => enrichWithDefaultPhotos(p));

          // Asegurar que el avalúo de prueba 10034 de 4 fincas esté actualizado
          const test10034 = initialAvaluos.find(i => i.id === 'lr-2026-10034' || i.codigo === 'AVALUO LR-2026-10034');
          if (test10034) {
            const idx10034 = merged.findIndex(m => m.id === test10034.id || m.codigo === test10034.codigo);
            if (idx10034 >= 0) {
              merged[idx10034] = { ...merged[idx10034], ...test10034 };
            } else {
              merged.unshift(test10034);
            }
          }

          return merged;
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return initialAvaluos.filter(p => 
      !['lr-2026-10031', 'cv-2026-001', 'cv-2026-002'].includes(p.id) &&
      !['LR-2026-10031', 'CV-2026-001', 'CV-2026-002'].includes(p.codigo)
    );
  });

  // Save to localStorage as immediate offline cache and backup to IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(avaluos));
    } catch (e) {
      console.warn('LocalStorage excedido (normal al adjuntar PDFs grandes), respaldando en IndexedDB');
    }
  }, [avaluos]);

  // Carga inicial y respaldo desde IndexedDB local (soporta almacenamiento ilimitado de PDFs y fotos)
  useEffect(() => {
    getAllAvaluosFromLocalDb().then((localList) => {
      if (Array.isArray(localList) && localList.length > 0) {
        setAvaluos((prev) => {
          return prev.map((item) => {
            const local = localList.find(l => l.id === item.id);
            if (!local) return item;
            let updated = item;

            if (Array.isArray(local.consultasPdfs) && local.consultasPdfs.length > 0) {
              const localHasPages = local.consultasPdfs.some(d => Array.isArray(d.pages) && d.pages.length > 0);
              const curHasPages = Array.isArray(item.consultasPdfs) && item.consultasPdfs.some(d => Array.isArray(d.pages) && d.pages.length > 0);
              if (localHasPages && !curHasPages) {
                updated = { ...updated, consultasPdfs: local.consultasPdfs };
              }
            }

            if (local.fotos && typeof local.fotos === 'object') {
              const updatedFotos = { ...(updated.fotos || {}) };
              let changedFotos = false;
              ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
                const lList = Array.isArray(local.fotos[cat]) ? local.fotos[cat] : (local.fotos[cat] ? [local.fotos[cat]] : []);
                const uList = Array.isArray(updatedFotos[cat]) ? updatedFotos[cat] : (updatedFotos[cat] ? [updatedFotos[cat]] : []);
                if (lList.length > 0 && uList.length === 0) {
                  updatedFotos[cat] = lList;
                  changedFotos = true;
                }
              });
              if (changedFotos) {
                updated = { ...updated, fotos: updatedFotos };
              }
            }

            return updated;
          });
        });
      }
    }).catch(e => console.warn('Error reading from localDb on mount:', e));
  }, []);

  // Sincronización en tiempo real con Firebase Firestore
  useEffect(() => {
    seedInitialAvaluosIfEmpty(initialAvaluos);
    let unsubscribe;
    try {
      unsubscribe = subscribeToAvaluos(
        (cloudList) => {
          setCloudStatus('conectado');
          if (Array.isArray(cloudList)) {
            // Purgar permanentemente LR-2026-10031 y mocks cv-2026-001/002 si aún persisten
            const idsToPurge = ['lr-2026-10031', 'cv-2026-001', 'cv-2026-002'];
            const codigosToPurge = ['LR-2026-10031', 'CV-2026-001', 'CV-2026-002'];
            const toPurge = cloudList.filter(m => idsToPurge.includes(m.id) || codigosToPurge.includes(m.codigo));
            toPurge.forEach(p => {
              deleteAvaluoFromCloud(p.id).catch(err => console.warn('Purge error:', err));
            });

            const cleanCloud = cloudList.filter(m => !idsToPurge.includes(m.id) && !codigosToPurge.includes(m.codigo));

            // Sincronizar inteligentemente fotos y reparar datos si vienen de Firestore
            const enrichedCloud = cleanCloud.map(item => {
              const { item: repaired, changed } = repairAndEnrichAvaluo(item);
              if (changed) {
                saveAvaluoToCloud(repaired).catch(err => console.warn('Sync repair cloud error', err));
              }
              return repaired;
            });

            // Incluir o actualizar el avalúo de prueba LR-2026-10034 con terreno y colindancias
            const test10034 = initialAvaluos.find(i => i.id === 'lr-2026-10034' || i.codigo === 'AVALUO LR-2026-10034');
            if (test10034) {
              const cloudIdx = enrichedCloud.findIndex(m => m.id === test10034.id || m.codigo === test10034.codigo);
              if (cloudIdx >= 0) {
                enrichedCloud[cloudIdx] = { ...enrichedCloud[cloudIdx], ...test10034 };
              } else {
                enrichedCloud.unshift(test10034);
              }
              saveAvaluoToCloud(test10034).catch(err => console.warn('Sync 10034 cloud error', err));
            }

            // Sincronizar avaluos preservando páginas locales de PDFs y fotos con dataUrl por categoría
            setAvaluos((prevList) => {
              return enrichedCloud.map((cloudItem) => {
                const prevItem = prevList.find(p => p.id === cloudItem.id);
                if (!prevItem) return cloudItem;

                let mergedItem = { ...cloudItem };

                // Preservar fotos localmente por categoría si el cloud viene vacío en esa sección
                const prevFotos = prevItem.fotos || {};
                const cloudFotos = cloudItem.fotos || {};
                const mergedFotos = { ...cloudFotos };
                let fotosMerged = false;

                ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
                  const pList = Array.isArray(prevFotos[cat]) ? prevFotos[cat] : (prevFotos[cat] ? [prevFotos[cat]] : []);
                  const cList = Array.isArray(cloudFotos[cat]) ? cloudFotos[cat] : (cloudFotos[cat] ? [cloudFotos[cat]] : []);
                  if (pList.length > 0 && cList.length === 0) {
                    mergedFotos[cat] = pList;
                    fotosMerged = true;
                  }
                });

                if (fotosMerged) {
                  mergedItem.fotos = mergedFotos;
                }

                if (Array.isArray(prevItem.consultasPdfs) && prevItem.consultasPdfs.length > 0) {
                  const cloudPdfs = cloudItem.consultasPdfs || [];
                  const mergedPdfs = cloudPdfs.map((cloudDoc) => {
                    const prevDoc = prevItem.consultasPdfs.find(d => d.id === cloudDoc.id || d.name === cloudDoc.name);
                    if (prevDoc && Array.isArray(prevDoc.pages) && prevDoc.pages.some(p => p.dataUrl)) {
                      const cloudPagesComplete = Array.isArray(cloudDoc.pages) && cloudDoc.pages.length > 0 && cloudDoc.pages.every(p => p.dataUrl);
                      if (!cloudPagesComplete) {
                        return { ...cloudDoc, pages: prevDoc.pages };
                      }
                    }
                    return cloudDoc;
                  });
                  mergedItem.consultasPdfs = mergedPdfs.length > 0 ? mergedPdfs : prevItem.consultasPdfs;
                }
                return mergedItem;
              });
            });

            // Sincronizar viewingAvaluo si está abierto en la Ficha
            setViewingAvaluo((currentViewing) => {
              if (!currentViewing) return null;
              const cloudMatch = enrichedCloud.find(c => c.id === currentViewing.id);
              if (!cloudMatch) return currentViewing;

              let mergedViewing = { ...cloudMatch };

              const viewFotos = currentViewing.fotos || {};
              const cloudFotos = cloudMatch.fotos || {};
              const mergedFotos = { ...cloudFotos };
              let fotosMerged = false;

              ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
                const vList = Array.isArray(viewFotos[cat]) ? viewFotos[cat] : (viewFotos[cat] ? [viewFotos[cat]] : []);
                const cList = Array.isArray(cloudFotos[cat]) ? cloudFotos[cat] : (cloudFotos[cat] ? [cloudFotos[cat]] : []);
                if (vList.length > 0 && cList.length === 0) {
                  mergedFotos[cat] = vList;
                  fotosMerged = true;
                }
              });

              if (fotosMerged) {
                mergedViewing.fotos = mergedFotos;
              }

              if (Array.isArray(currentViewing.consultasPdfs) && currentViewing.consultasPdfs.length > 0) {
                const mergedPdfs = (cloudMatch.consultasPdfs || []).map((cloudDoc) => {
                  const curDoc = currentViewing.consultasPdfs.find(d => d.id === cloudDoc.id || d.name === cloudDoc.name);
                  if (curDoc && Array.isArray(curDoc.pages) && curDoc.pages.some(p => p.dataUrl)) {
                    const cloudPagesComplete = Array.isArray(cloudDoc.pages) && cloudDoc.pages.length > 0 && cloudDoc.pages.every(p => p.dataUrl);
                    if (!cloudPagesComplete) {
                      return { ...cloudDoc, pages: curDoc.pages };
                    }
                  }
                  return cloudDoc;
                });
                mergedViewing.consultasPdfs = mergedPdfs.length > 0 ? mergedPdfs : currentViewing.consultasPdfs;
              }
              return mergedViewing;
            });
          }
        },
        (err) => {
          console.warn('Modo offline / local activo:', err);
          setCloudStatus('offline');
        }
      );
    } catch (e) {
      console.warn('Error al conectar a Firebase:', e);
      setCloudStatus('offline');
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sincronización en tiempo real de colaboradores y roles en Firestore
  useEffect(() => {
    seedInitialUsuariosIfEmpty();
    let unsubUsers;
    try {
      unsubUsers = subscribeToUsuarios((userList) => {
        setUsuarios(userList);
        setUsuariosLoaded(true);
      });
    } catch (err) {
      console.warn('Error al suscribirse a usuarios:', err);
    }
    return () => {
      if (unsubUsers) unsubUsers();
    };
  }, []);

  // Escuchar estado de autenticación de Google Firebase
  useEffect(() => {
    // Manejar retorno de inicio de sesión con redirección en navegadores móviles
    getRedirectResult(auth).catch((err) => {
      console.warn('Redirect auth result:', err);
    });

    // Temporizador de seguridad para evitar pantallas congeladas si Firebase demora
    const authTimeout = setTimeout(() => {
      setIsAuthLoading(false);
    }, 4000);

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(authTimeout);
      try {
        if (firebaseUser) {
          const email = (firebaseUser.email || '').toLowerCase().trim();
          const match = usuarios.find(u => u.email?.toLowerCase().trim() === email);

          // Si no es cuenta principal y usuarios aún no cargan de Firestore, esperar
          if (
            email !== 'rnochezmc@gmail.com' && 
            email !== 'cverdeavaluos@gmail.com' && 
            email !== 'oruiz@cverde.com.gt' && 
            email !== 'jmmorales@cverde.com.gt' && 
            email !== 'aroldoruiz100@gmail.com' && 
            !usuariosLoaded
          ) {
            return;
          }

          let assignedRole = 'no_autorizado';
          let assignedNombre = firebaseUser.displayName || 'Colaborador';
          let assignedTitulo = 'Personal Técnico';
          let assignedTenantId = 'lex-rosam';
          let isActivo = false;

          // Cuentas administradoras maestras del sistema
          if (email === 'rnochezmc@gmail.com') {
            assignedRole = 'soporte';
            assignedNombre = (firebaseUser.displayName || 'Ramiro Nóchez').replace(/^Ing\.\s*/i, '');
            assignedTitulo = 'Soporte Técnico y Sistemas';
            assignedTenantId = 'all';
            isActivo = true;
          } else if (email === 'cverdeavaluos@gmail.com' || email === 'oruiz@cverde.com.gt' || email === 'jmmorales@cverde.com.gt') {
            assignedRole = 'admin';
            assignedNombre = firebaseUser.displayName || (email === 'oruiz@cverde.com.gt' ? 'Lic. Aroldo Ruiz' : email === 'jmmorales@cverde.com.gt' ? 'Ing. Juan Manuel Morales' : 'Ing. Carlos Villagrán');
            assignedTitulo = 'Director C VERDE / Valuador Autorizado';
            assignedTenantId = 'cverde';
            isActivo = true;
          } else if (email === 'aroldoruiz100@gmail.com') {
            assignedRole = 'admin';
            assignedNombre = firebaseUser.displayName || 'Lic. Aroldo Ruiz';
            assignedTitulo = 'Dueño y Administrador / Valuador Autorizado 2572-R-2026';
            assignedTenantId = 'all';
            isActivo = true;
          } else if (match) {
            // Usuario registrado en la colección de usuarios
            assignedRole = match.rol || 'valuador';
            assignedNombre = match.nombre || firebaseUser.displayName || 'Colaborador';
            assignedTitulo = match.titulo || 'Personal Técnico';
            assignedTenantId = match.tenantId || 'lex-rosam';
            isActivo = match.activo !== false;
          }

          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nombre: assignedNombre,
            rol: assignedRole,
            titulo: assignedTitulo,
            tenantId: assignedTenantId,
            photoURL: firebaseUser.photoURL,
            activo: isActivo
          };

          setCurrentUser(userObj);
          const isMaster = isAroldoOrAdminUser(userObj);
          setCurrentRole(isMaster ? 'autorizador' : 'ingreso');
          if (assignedTenantId && assignedTenantId !== 'all') {
            setSelectedTenantId(assignedTenantId);
          } else if (assignedTenantId === 'all' && !localStorage.getItem('avaluos_active_tenant')) {
            // En equipos nuevos sin preferencia guardada, mostrar todas las empresas para no ocultar certificaciones/avalúos
            setSelectedTenantId('todos');
          }
        } else {
          // Ninguna cuenta de Google autenticada
          setCurrentUser(null);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      } catch (err) {
        console.error('Error procesando autenticación:', err);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(authTimeout);
      if (unsubAuth) unsubAuth();
    };
  }, [usuarios, usuariosLoaded]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    }
    setCurrentUser(null);
    setShowProfileModal(false);
    setShowUserManagement(false);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.clear();
  };


  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('en_revision');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('todos');
  const [bankFilter, setBankFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recientes');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [viewingAvaluo, setViewingAvaluo] = useState(null);
  const [editingAvaluo, setEditingAvaluo] = useState(null);
  const [printingAvaluo, setPrintingAvaluo] = useState(null);
  const [certificandoAvaluo, setCertificandoAvaluo] = useState(null);
  const [printingCertificacion, setPrintingCertificacion] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showReporteriaModal, setShowReporteriaModal] = useState(false);
  const lastFichaIdRef = useRef(null);

  // Normalize string for accent-insensitive search
  const normalize = (str) => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Identificar si el usuario actual es Aroldo Ruiz (o administrador maestro/soporte)
  const isAroldo = !currentUser || 
                   currentUser.rol === 'admin' || 
                   currentUser.rol === 'soporte' || 
                   currentUser.email === 'aroldoruiz100@gmail.com' || 
                   currentUser.email === 'oruiz@cverde.com.gt' || 
                   currentUser.email === 'cverdeavaluos@gmail.com' || 
                   currentUser.email === 'rnochezmc@gmail.com';

  // Verificar si un expediente fue creado por el usuario actual o asignado a él
  const isCreatorOfItem = (item) => {
    if (!currentUser) return false;
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userUid = currentUser.uid || '';
    const userNombre = (currentUser.nombre || '').toLowerCase().trim();

    // 1. Creador del expediente
    const itemEmail = (item.creadoPorEmail || item.creadoPor || item.usuarioEmail || '').toLowerCase().trim();
    const itemUid = item.creadoPorUid || item.userId || '';
    const itemNombre = (item.creadoPorNombre || '').toLowerCase().trim();

    if (userEmail && itemEmail && userEmail === itemEmail) return true;
    if (userUid && itemUid && userUid === itemUid) return true;
    if (userNombre && itemNombre && userNombre === itemNombre) return true;
    if (item.bienMostradoPor && userNombre && item.bienMostradoPor.toLowerCase().includes(userNombre)) return true;

    // 2. Asignado o delegado por Aroldo/Admin a este técnico
    const assignedEmail = (item.asignadoAEmail || item.asignadoA || item.tecnicoAsignadoEmail || '').toLowerCase().trim();
    const assignedUid = item.asignadoAUid || '';
    const assignedNombre = (item.asignadoANombre || item.tecnicoAsignado || '').toLowerCase().trim();

    if (userEmail && assignedEmail && userEmail === assignedEmail) return true;
    if (userUid && assignedUid && userUid === assignedUid) return true;
    if (userNombre && assignedNombre && userNombre === assignedNombre) return true;

    return false;
  };

  // Avaluos pertenecientes al tenant activo (para estadísticas globales sin verse afectadas por la barra de búsqueda)
  const tenantFilteredAvaluos = useMemo(() => {
    let list = avaluos;
    // Si no es Aroldo / Admin, sólo puede ver los expedientes que él creó
    if (!isAroldo) {
      list = list.filter(isCreatorOfItem);
    }
    if (selectedTenantId === 'todos') return list;
    return list.filter((item) => {
      const rawTenant = item.tenantId === 'lexrosam' ? 'lex-rosam' : item.tenantId;
      const itemTenant = rawTenant || (item.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam');
      return itemTenant === selectedTenantId;
    });
  }, [avaluos, selectedTenantId, isAroldo, currentUser]);

  // Filtered & Sorted Avaluos
  const filteredAvaluos = useMemo(() => {
    const term = normalize(searchTerm.trim());

    return avaluos
      .filter((item) => {
        // Los usuarios que no sean Aroldo solo pueden ver los expedientes que ellos crearon
        if (!isAroldo && !isCreatorOfItem(item)) {
          return false;
        }

        const rawTenant = item.tenantId === 'lexrosam' ? 'lex-rosam' : item.tenantId;
        const itemTenant = rawTenant || (item.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam');

        // Multi-tenant company filter (al escribir una búsqueda, busca globalmente para no perder de vista ningún expediente)
        if (selectedTenantId !== 'todos' && !term) {
          if (itemTenant !== selectedTenantId) {
            return false;
          }
        }

        const isCert = item.tipoAvaluo === 'Certificación de Valor' || 
                       item.tipoAvaluo === 'Certificación' || 
                       Boolean(item.certificacion);

        // Status filter matching new workflow (si hay un término de búsqueda, busca en todos los estados para no ocultar nada)
        if (!term) {
          if (activeFilter === 'certificaciones') {
            if (!isCert) return false;
          } else if (activeFilter !== 'todos') {
            if (activeFilter === 'autorizado' || activeFilter === 'completado') {
              if (item.estado !== 'autorizado' && item.estado !== 'completado') return false;
            } else if (activeFilter === 'en_revision') {
              if (item.estado !== 'en_revision' && item.estado !== 'proceso' && item.estado !== 'borrador') return false;
            } else if (activeFilter === 'devuelto') {
              if (item.estado !== 'devuelto') return false;
            } else if (activeFilter === 'borrador') {
              if (item.estado !== 'borrador' && item.estado) return false;
            }
          }
        }

        // Property type filter (soporta "certificaciones" y "avaluos_ordinarios")
        if (propertyTypeFilter !== 'todos' && !term) {
          if (propertyTypeFilter === 'certificaciones' || propertyTypeFilter === 'Certificación' || propertyTypeFilter === 'Certificación de Valor') {
            if (!isCert) return false;
          } else if (propertyTypeFilter === 'avaluos_ordinarios') {
            if (isCert) return false;
          } else if (item.tipoAvaluo !== propertyTypeFilter) {
            return false;
          }
        }

        // Bank filter (Banco Industrial, BANRURAL, Banco G&T Continental)
        if (bankFilter !== 'todos' && !term) {
          const bankText = normalize((item.solicitante || '') + ' ' + (item.dirigidoA || ''));
          if (bankFilter === 'Banco Industrial') {
            if (!bankText.includes('industrial') && !bankText.includes('bi')) return false;
          } else if (bankFilter === 'BANRURAL') {
            if (!bankText.includes('rural') && !bankText.includes('banrural')) return false;
          } else if (bankFilter === 'Banco G&T Continental') {
            if (!bankText.includes('g&t') && !bankText.includes('continental')) return false;
          } else if (normalize(item.solicitante || '') !== normalize(bankFilter)) {
            return false;
          }
        }

        // Omnisearch matching
        if (!term) return true;

        const matchCode = normalize(item.codigo).includes(term) ||
                          normalize(item.codigoInterno).includes(term) ||
                          normalize(item.numeroReferencia).includes(term) ||
                          normalize(item.certificacion?.numeroReferencia).includes(term) ||
                          normalize(item.id).includes(term);
        const matchOwner = normalize(item.propietarioPrincipal).includes(term) ||
                           normalize(item.dirigidoA).includes(term);
        const matchBank = normalize(item.solicitante).includes(term);
        const matchAddress = normalize(item.direccion).includes(term) ||
                             normalize(item.descripcionGeneral).includes(term) ||
                             normalize(item.certificacion?.descripcionInmueble).includes(term);
        const matchCreator = normalize(item.creadoPorNombre).includes(term) ||
                             normalize(item.creadoPorEmail).includes(term) ||
                             normalize(item.creadoPor).includes(term);
        const matchSector = normalize(item.sector).includes(term);
        const matchDicabi = normalize(item.dicabiMatricula).includes(term);
        const matchDpi = normalize(item.dpi).includes(term);

        // Match within nested fincas array
        const matchFincas = item.fincas?.some((f) => 
          normalize(f.finca).includes(term) ||
          normalize(f.folio).includes(term) ||
          normalize(f.libro).includes(term) ||
          normalize(f.propietario).includes(term) ||
          normalize(f.dicabiMatricula).includes(term)
        );

        return matchCode || matchOwner || matchBank || matchAddress || matchCreator || matchSector || matchDicabi || matchDpi || matchFincas;
      })
      .sort((a, b) => {
        if (sortBy === 'recientes') {
          return new Date(b.updatedAt || b.fechaActualizacion || b.fechaSolicitud) - new Date(a.updatedAt || a.fechaActualizacion || a.fechaSolicitud);
        }
        if (sortBy === 'codigo-desc') {
          return (b.codigo || '').localeCompare(a.codigo || '');
        }
        if (sortBy === 'codigo-asc') {
          return (a.codigo || '').localeCompare(b.codigo || '');
        }
        if (sortBy === 'valor-desc') {
          return (Number(b.valorComercialGTQ) || 0) - (Number(a.valorComercialGTQ) || 0);
        }
        if (sortBy === 'valor-asc') {
          return (Number(a.valorComercialGTQ) || 0) - (Number(b.valorComercialGTQ) || 0);
        }
        return 0;
      });
  }, [avaluos, selectedTenantId, searchTerm, activeFilter, propertyTypeFilter, bankFilter, sortBy]);

  // Handlers
  const handleSaveAvaluo = async (savedItem) => {
    // 0. Control de Concurrencia y Resolución Atómica de Correlativo (Evita choques si 2 usuarios guardan al mismo tiempo)
    let finalCodigo = savedItem.codigo;
    const isNew = !savedItem.id || isCreatingNew || !avaluos.some(a => a.id === savedItem.id);
    if (isNew) {
      const activeTenant = savedItem.tenantId || (savedItem.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam');
      const conflictCheck = resolveUniqueCodigo(savedItem.codigo, activeTenant, avaluos, savedItem.id);
      if (conflictCheck.wasConflict) {
        finalCodigo = conflictCheck.codigo;
        alert(`Aviso de Asignación de Correlativo:\nEl código ${conflictCheck.previousCodigo} ya fue registrado por otro usuario en este momento. Su expediente se guardó exitosamente con el siguiente correlativo oficial disponible: ${finalCodigo}.`);
      }
    }

    // Asegurar metadata de autoría y asignación del expediente
    const itemWithCreator = {
      ...savedItem,
      codigo: finalCodigo,
      creadoPorEmail: savedItem.creadoPorEmail || currentUser?.email || '',
      creadoPorUid: savedItem.creadoPorUid || currentUser?.uid || '',
      creadoPorNombre: savedItem.creadoPorNombre || currentUser?.nombre || '',
      creadoPor: savedItem.creadoPor || currentUser?.email || currentUser?.nombre || '',
      asignadoAEmail: savedItem.asignadoAEmail || '',
      asignadoANombre: savedItem.asignadoANombre || '',
      asignadoAUid: savedItem.asignadoAUid || ''
    };

    // 1. Actualización optimista en lista en memoria
    setAvaluos((prev) => {
      const existsIndex = prev.findIndex((a) => a.id === itemWithCreator.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = itemWithCreator;
        return updated;
      } else {
        return [itemWithCreator, ...prev];
      }
    });

    // 2. Si venía de la Ficha o se estaba visualizando, reabrir/actualizar de inmediato la Ficha
    if (viewingAvaluo?.id === itemWithCreator.id || lastFichaIdRef.current === itemWithCreator.id) {
      setViewingAvaluo(itemWithCreator);
      lastFichaIdRef.current = null;
    }

    setEditingAvaluo(null);
    setIsCreatingNew(false);

    // 3. Persistir en IndexedDB de forma robusta e ilimitada (sin límite de 5MB de localStorage)
    try {
      await saveAvaluoToLocalDb(itemWithCreator);
    } catch (dbErr) {
      console.warn('Error guardando en IndexedDB:', dbErr);
    }

    // 4. Persistir en Firebase Cloud Firestore
    try {
      await saveAvaluoToCloud(itemWithCreator);
    } catch (err) {
      console.error('Error guardando en Firebase:', err);
    }
  };

  // Control de inicio de edición con bloqueo para asistentes en casos autorizados (Requerimiento 2)
  const handleStartEdit = (item) => {
    if (!item) return;
    if (item.estado === 'autorizado' && !canUserEditAvaluo(item, currentUser, currentRole)) {
      alert('Este expediente ya fue autorizado por el Lic. Aroldo Ruiz y se encuentra bloqueado para edición. Solo el autorizador puede modificarlo.');
      return;
    }
    setEditingAvaluo(item);
  };

  // Guardar Certificación de Valor asociada al avalúo o independiente
  const handleSaveCertificacion = async (certData, silent = false) => {
    try {
      const isCV = certData.empresaNombre?.includes('CVERDE') || certData.tenantId === 'cverde';
      const tenantId = isCV ? 'cverde' : 'lex-rosam';
      const desiredCodigo = certData.numeroReferencia || certData.codigo;

      // Si ya existe un documento con este ID o con este mismo código oficial, reutilizarlo para nunca duplicar
      const existingByCode = avaluos.find(a => 
        (certData.id && a.id === certData.id) ||
        (desiredCodigo && (a.codigo === desiredCodigo || a.numeroReferencia === desiredCodigo))
      );
      const recordId = certData.id || existingByCode?.id || `cert-${Date.now()}`;
      
      const isAroldoUser = isAroldoOrAdminUser(currentUser) && currentRole !== 'ingreso';
      // Las certificaciones nuevas no se autorizan automáticamente; requieren aprobación explícita de Aroldo
      const certStatus = certData.estado || (isAroldoUser ? (certData.autorizadoDirecto ? 'autorizado' : 'en_revision') : 'en_revision');
      
      const authorizedFields = certStatus === 'autorizado' ? {
        fechaAutorizacion: certData.fechaAutorizacion || existingByCode?.fechaAutorizacion || new Date().toISOString().slice(0, 10),
        autorizadoPor: certData.autorizadoPor || existingByCode?.autorizadoPor || (currentUser?.nombre 
          ? `${currentUser.nombre} (Reg. 2572-R-2026)` 
          : 'Lic. Aroldo Ruiz (Reg. 2572-R-2026)')
      } : {
        fechaAutorizacion: null,
        autorizadoPor: null
      };
      
      const totalCert = (certData.valores || []).reduce((acc, v) => acc + (Number(v.total) || 0), 0);
      const preservedCreatedAt = certData.createdAt || existingByCode?.createdAt || new Date().toISOString();
      const preservedCreadoPor = certData.creadoPor || existingByCode?.creadoPor || currentUser?.email || 'admin';
      const preservedCreadoPorNombre = certData.creadoPorNombre || existingByCode?.creadoPorNombre || currentUser?.nombre || currentUser?.displayName || 'Lic. Aroldo Ruiz';

      const newRecord = {
        id: recordId,
        codigo: certData.numeroReferencia || certData.codigo || `CV-${Date.now().toString().slice(-4)}`,
        numeroReferencia: certData.numeroReferencia || certData.codigo,
        tenantId: tenantId,
        empresaNombre: isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.',
        solicitante: certData.solicitante || '',
        direccion: certData.direccion || '',
        descripcionGeneral: certData.descripcionInmueble || '',
        fincas: certData.fincas || [],
        finca: certData.fincas?.[0]?.finca || '',
        folio: certData.fincas?.[0]?.folio || '',
        libro: certData.fincas?.[0]?.libro || '',
        areaValuada: certData.fincas?.[0]?.areaValuada || certData.valores?.[0]?.area || '0',
        valorComercialGTQ: totalCert,
        valorBancarioGTQ: totalCert,
        totalValorCertificado: totalCert,
        valores: certData.valores || [],
        estado: certStatus,
        ...authorizedFields,
        tipoAvaluo: 'Certificación de Valor',
        tipoInmueble: certData.valores?.[0]?.descripcion || 'Certificación de Valor',
        certificacion: { 
          ...certData, 
          id: recordId, 
          estado: certStatus,
          ...authorizedFields,
          creadoPor: preservedCreadoPor,
          creadoPorNombre: preservedCreadoPorNombre,
          createdAt: preservedCreatedAt,
          valores: certData.valores || [],
          totalValorCertificado: totalCert,
          valorComercialGTQ: totalCert
        },
        consultasPdfs: certData.consultasPdfs || [],
        creadoPor: preservedCreadoPor,
        creadoPorNombre: preservedCreadoPorNombre,
        fechaEmision: certData.fechaEmision || new Date().toISOString().split('T')[0],
        createdAt: preservedCreatedAt,
        updatedAt: new Date().toISOString()
      };

      setAvaluos((prev) => {
        const idx = prev.findIndex(a => a.id === recordId || (a.codigo && a.codigo === newRecord.codigo));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...newRecord };
          return updated;
        } else {
          return [newRecord, ...prev];
        }
      });

      await saveAvaluoToLocalDb(newRecord);
      await saveAvaluoToCloud(newRecord);

      // Auto-seleccionar la pestaña de certificaciones para que se visualice de inmediato
      setActiveFilter('certificaciones');
      if (!silent) {
        setCertificandoAvaluo(null);
        const msg = certStatus === 'autorizado'
          ? 'Certificación de Valor guardada y autorizada exitosamente.'
          : 'Certificación de Valor guardada en Revisión (pendiente de autorización).';
        alert(msg);
      }
      return newRecord;
    } catch (err) {
      console.warn('Error al guardar certificación:', err);
      return null;
    }
  };

  // Enrutadores de acciones unificadas para Avalúos y Certificaciones
  const handlePrintItem = (item) => {
    if (!item) return;
    const isCert = item.tipoAvaluo === 'Certificación de Valor' || item.tipoAvaluo === 'Certificación' || Boolean(item.certificacion);
    if (isCert) {
      setPrintingCertificacion({ certData: item.certificacion || item, baseItem: item });
    } else {
      setPrintingAvaluo(item);
    }
  };

  const handleEditItem = (item) => {
    if (!item) return;
    const isCert = item.tipoAvaluo === 'Certificación de Valor' || item.tipoAvaluo === 'Certificación' || Boolean(item.certificacion);
    if (isCert) {
      if (item.estado === 'autorizado' && !canUserEditAvaluo(item, currentUser, currentRole)) {
        alert('Esta certificación ya fue autorizada por el Lic. Aroldo Ruiz y se encuentra bloqueada para edición. Solo el autorizador puede modificarla.');
        return;
      }
      const certObj = item.certificacion || item;
      setCertificandoAvaluo({
        ...certObj,
        id: item.id || certObj.id,
        codigo: item.codigo || certObj.numeroReferencia || certObj.codigo,
        numeroReferencia: item.codigo || certObj.numeroReferencia || certObj.codigo,
        tipoAvaluo: 'Certificación de Valor',
        estado: item.estado || certObj.estado,
        createdAt: item.createdAt || certObj.createdAt,
        creadoPor: item.creadoPor || certObj.creadoPor,
        creadoPorNombre: item.creadoPorNombre || certObj.creadoPorNombre,
        fechaAutorizacion: item.fechaAutorizacion || certObj.fechaAutorizacion,
        autorizadoPor: item.autorizadoPor || certObj.autorizadoPor,
        certificacion: certObj,
        valores: Array.isArray(certObj.valores) && certObj.valores.length > 0 ? certObj.valores : (Array.isArray(item.valores) ? item.valores : []),
        fincas: Array.isArray(certObj.fincas) && certObj.fincas.length > 0 ? certObj.fincas : (Array.isArray(item.fincas) ? item.fincas : [])
      });
    } else {
      handleStartEdit(item);
    }
  };

  const handleViewItem = (item) => {
    if (!item) return;
    const isCert = item.tipoAvaluo === 'Certificación de Valor' || item.tipoAvaluo === 'Certificación' || Boolean(item.certificacion);
    if (isCert) {
      setPrintingCertificacion({ certData: item.certificacion || item, baseItem: item });
    } else {
      setViewingAvaluo(item);
    }
  };

  // Cambio de estado de autorización
  const handleStatusChange = async (id, newStatus, comments) => {
    const currentItem = avaluos.find((a) => a.id === id);
    if (!currentItem) {
      console.warn('handleStatusChange: No se encontró el avalúo con id:', id);
      return;
    }

    const next = {
      ...currentItem,
      estado: newStatus,
      observacionesAutorizador: comments !== undefined ? comments : currentItem.observacionesAutorizador,
      updatedAt: new Date().toISOString()
    };

    if (currentItem.certificacion) {
      next.certificacion = {
        ...currentItem.certificacion,
        estado: newStatus
      };
    }

    if (newStatus === 'autorizado') {
      next.fechaAutorizacion = new Date().toISOString().slice(0, 10);
      next.autorizadoPor = currentUser?.nombre 
        ? `${currentUser.nombre} (${currentItem.registroPrincipal || 'Reg. 2572-R-2026'})` 
        : `${currentItem.valuadorPrincipal || 'Lic. Aroldo Ruiz'} (${currentItem.registroPrincipal || 'Reg. 2572-R-2026'})`;
      if (next.certificacion) {
        next.certificacion.fechaAutorizacion = next.fechaAutorizacion;
        next.certificacion.autorizadoPor = next.autorizadoPor;
      }
    }

    // 1. Actualizar estado reactivo de inmediato
    setAvaluos((prev) => prev.map((item) => (item.id === id ? next : item)));

    // 2. Actualizar modal en pantalla
    setViewingAvaluo((cur) => (cur?.id === id ? next : cur));
    setPrintingCertificacion((cur) => {
      if (!cur) return null;
      const match = cur.baseItem?.id === id || cur.certData?.id === id;
      if (!match) return cur;
      return {
        ...cur,
        certData: { ...cur.certData, estado: newStatus },
        baseItem: { ...(cur.baseItem || {}), ...next }
      };
    });

    // 3. Persistir de forma garantizada en IndexedDB local
    try {
      await saveAvaluoToLocalDb(next);
    } catch (_e) {}

    // 4. Persistir de forma garantizada en Firebase Firestore en la nube
    try {
      await saveAvaluoToCloud(next);
    } catch (err) {
      console.error('Error actualizando estado en Firebase:', err);
    }
  };

  // Actualizar un campo específico de un avalúo (ej: tieneLimitaciones)
  const handleUpdateAvaluoField = async (id, fields) => {
    if (!id || !fields) return;
    const currentItem = avaluos.find((a) => a.id === id);
    if (!currentItem) return;

    const next = {
      ...currentItem,
      ...fields,
      updatedAt: new Date().toISOString()
    };

    setAvaluos((prev) => prev.map((item) => (item.id === id ? next : item)));
    setViewingAvaluo((cur) => (cur?.id === id ? next : cur));

    try {
      await saveAvaluoToLocalDb(next);
    } catch (_e) {}
    try {
      await saveAvaluoToCloud(next);
    } catch (err) {
      console.error('Error actualizando campo en Firebase:', err);
    }
  };

  // Adjuntar PDFs o imágenes directamente desde la Ficha
  const handleUploadPdfToAvaluo = async (avaluoId, newPdfItems) => {
    if (!avaluoId || !Array.isArray(newPdfItems) || newPdfItems.length === 0) return;

    let updatedItem = null;
    setAvaluos((prev) => {
      return prev.map((item) => {
        if (item.id === avaluoId) {
          const next = {
            ...item,
            consultasPdfs: [...(item.consultasPdfs || []), ...newPdfItems],
            updatedAt: new Date().toISOString()
          };
          updatedItem = next;
          return next;
        }
        return item;
      });
    });

    if (updatedItem) {
      setViewingAvaluo((cur) => (cur?.id === avaluoId ? updatedItem : cur));
      try {
        await saveAvaluoToLocalDb(updatedItem);
      } catch (e) {
        console.warn('Error al guardar en localDb:', e);
      }
      try {
        await saveAvaluoToCloud(updatedItem);
      } catch (err) {
        console.error('Error guardando en Firebase tras adjuntar PDF:', err);
      }
    }
  };

  // Eliminar un PDF adjunto directamente desde la vista detalle
  const handleRemovePdfFromAvaluo = async (avaluoId, pdfIndex) => {
    let updatedItem = null;
    setAvaluos((prev) => {
      return prev.map((item) => {
        if (item.id === avaluoId) {
          const next = {
            ...item,
            consultasPdfs: (item.consultasPdfs || []).filter((_, i) => i !== pdfIndex),
            updatedAt: new Date().toISOString()
          };
          updatedItem = next;
          return next;
        }
        return item;
      });
    });

    if (updatedItem) {
      setViewingAvaluo((cur) => (cur?.id === avaluoId ? updatedItem : cur));
      try {
        await saveAvaluoToLocalDb(updatedItem);
      } catch (_e) {}
      try {
        await saveAvaluoToCloud(updatedItem);
      } catch (err) {
        console.error('Error guardando en Firebase tras eliminar PDF:', err);
      }
    }
  };

  // Solo Aroldo Ruiz (admin) y soporte tienen permiso para eliminar expedientes
  const canDeleteExpedientes = isAroldo;

  const handleDeleteAvaluoClick = (id) => {
    if (!canDeleteExpedientes) {
      alert('Permiso denegado: Los colaboradores técnicos pueden ver y trabajar expedientes, pero únicamente el administrador oficial (Lic. Aroldo Ruiz) puede eliminarlos.');
      return;
    }
    const target = avaluos.find((a) => a.id === id);
    if (!target) return;
    setDeletingAvaluo(target);
  };

  const executeDeleteAvaluo = async (id) => {
    if (!canDeleteExpedientes) return;
    setAvaluos((prev) => prev.filter((a) => a.id !== id));
    if (viewingAvaluo?.id === id) setViewingAvaluo(null);
    setDeletingAvaluo(null);
    try {
      await deleteAvaluoFromLocalDb(id);
    } catch (_e) {}
    try {
      await deleteAvaluoFromCloud(id);
    } catch (err) {
      console.error('Error eliminando de Firebase:', err);
    }
  };

  // Export JSON backup file
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(avaluos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lexrosam_avaluos_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = async (importedList) => {
    const confirmed = window.confirm(`Se encontraron ${importedList.length} expedientes en el archivo. ¿Desea importarlos a su base de datos local y sincronizarlos con Firebase?`);
    if (confirmed) {
      setAvaluos(importedList);
      for (const item of importedList) {
        try {
          await saveAvaluoToCloud(item);
        } catch (e) {
          console.error('Error sincronizando item importado a Firebase:', e);
        }
      }
      alert('¡Base de datos restaurada y sincronizada en la nube con éxito!');
    }
  };

  // Mobile Bottom Nav actions
  const focusSearchInput = () => {
    const searchEl = document.querySelector('.search-input');
    if (searchEl) {
      searchEl.focus();
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToStats = () => {
    const statsEl = document.querySelector('.stats-banner');
    if (statsEl) {
      statsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Métodos de respaldo para soporte
  useEffect(() => {
    window.__exportarBD = handleExportData;
    window.__restaurarBD = handleImportData;
    return () => {
      delete window.__exportarBD;
      delete window.__restaurarBD;
    };
  }, [avaluos]);

  // Pantalla de carga mientras Firebase verifica la sesión de Google
  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #1e3a5f 0%, #0d2847 45%, #07172b 100%)',
        padding: '1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/lex-rosam-logo.png" 
            alt="LEX ROSAM S.A." 
            style={{ maxHeight: '90px', objectFit: 'contain', marginBottom: '1.5rem' }} 
            onError={(e) => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: '#93c5fd', fontSize: '0.95rem', fontWeight: 600 }}>
            <Loader2 size={20} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Verificando credenciales de acceso...</span>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Inicio de Sesión si no hay usuario autenticado en Google
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(_fbUser) => {
          // El cambio de estado es administrado de inmediato por onAuthStateChanged
        }}
      />
    );
  }

  // Pantalla de usuario no autorizado o inactivo
  if (currentUser && currentUser.activo === false) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #1e3a5f 0%, #0d2847 45%, #07172b 100%)',
        padding: '1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <ShieldAlert size={56} color="#dc2626" style={{ margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ color: '#0d2847', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Acceso No Autorizado
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0.75rem 0 1.5rem' }}>
            La cuenta de Google <strong>{currentUser.email}</strong> no tiene permisos asignados en el sistema de <strong>LEX ROSAM S.A.</strong>
            <br /><br />
            Comunícate con <strong>Aroldo Ruiz</strong> para que active tu usuario y te asigne un rol en el panel de colaboradores.
          </p>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0d2847',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Cerrar Sesión / Cambiar Cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar with Multi-Tenant Branding & Role Selector */}
      <Navbar
        onNewAvaluo={() => setIsCreatingNew(true)}
        onNewCertificacion={() => setCertificandoAvaluo({ id: '__manual__', tenantId: selectedTenantId === 'lex-rosam' ? 'lex-rosam' : 'cverde' })}
        cloudStatus={cloudStatus}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenUserManagement={() => setShowUserManagement(true)}
        onOpenReporteria={() => setShowReporteriaModal(true)}
        currentTenant={currentTenantConfig}
        selectedTenantId={selectedTenantId}
        onSelectTenant={handleSelectTenant}
      />

      <main className={`main-wrapper ${printingAvaluo ? 'no-print' : ''}`}>
        {/* KPI Stats Overview Bar */}
        <StatsOverview 
          avaluos={tenantFilteredAvaluos} 
          currentTenant={currentTenantConfig}
          selectedTenantId={selectedTenantId}
        />

        {/* Omnisearch & Filters Bar */}
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          propertyTypeFilter={propertyTypeFilter}
          setPropertyTypeFilter={setPropertyTypeFilter}
          bankFilter={bankFilter}
          setBankFilter={setBankFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalResults={tenantFilteredAvaluos.length}
          onOpenReporteria={() => setShowReporteriaModal(true)}
        />

        {/* Expedientes Results Section */}
        {filteredAvaluos.length === 0 ? (() => {
          const canSwitchCompanies = currentUser?.rol === 'admin' || currentUser?.rol === 'soporte' || currentUser?.tenantId === 'all';
          const isCertFilterActive = activeFilter === 'certificaciones' || propertyTypeFilter === 'certificaciones';
          const otherTenantCertsCount = (canSwitchCompanies && selectedTenantId !== 'todos' && isCertFilterActive)
            ? avaluos.filter((item) => {
                const rawTenant = item.tenantId === 'lexrosam' ? 'lex-rosam' : item.tenantId;
                const itemTenant = rawTenant || (item.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam');
                const isCert = item.tipoAvaluo === 'Certificación de Valor' || item.tipoAvaluo === 'Certificación' || Boolean(item.certificacion);
                return isCert && itemTenant !== selectedTenantId;
              }).length
            : 0;
          return (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', marginTop: '1rem' }}>
            <SearchX size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-800)' }}>No se encontraron expedientes</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', maxWidth: '460px', margin: '0.4rem auto 1.5rem auto' }}>
              {otherTenantCertsCount > 0
                ? `No hay certificaciones en ${selectedTenantId === 'cverde' ? 'C VERDE' : 'LEX ROSAM'}, pero existen ${otherTenantCertsCount} certificación(es) en ${selectedTenantId === 'cverde' ? 'LEX ROSAM' : 'C VERDE'}.`
                : `No existen avalúos que coincidan con "${searchTerm}" o los filtros seleccionados.`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {otherTenantCertsCount > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSelectTenant('todos')}
                  style={{ background: '#0f766e' }}
                >
                  Ver en Todas las Empresas ({otherTenantCertsCount})
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setSearchTerm(''); setActiveFilter('todos'); setPropertyTypeFilter('todos'); setBankFilter('todos'); }}
              >
                Limpiar Búsqueda y Filtros
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsCreatingNew(true)}
                style={{ background: '#2563eb' }}
              >
                <Plus size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Crear Nuevo Avalúo
              </button>
            </div>
          </div>
          );
        })() : viewMode === 'grid' ? (
          <div className="cards-grid">
            {filteredAvaluos.map((av) => (
              <AvaluoCard
                key={av.id}
                avaluo={av}
                currentUser={currentUser}
                currentRole={currentRole}
                onView={handleViewItem}
                onEdit={handleEditItem}
                onDelete={canDeleteExpedientes ? handleDeleteAvaluoClick : null}
                onPrint={handlePrintItem}
              />
            ))}
          </div>
        ) : (
          <AvaluoTable
            avaluos={filteredAvaluos}
            currentUser={currentUser}
            currentRole={currentRole}
            onView={handleViewItem}
            onEdit={handleEditItem}
            onDelete={canDeleteExpedientes ? handleDeleteAvaluoClick : null}
            onPrint={handlePrintItem}
          />
        )}
      </main>

      {/* Detail Viewer Modal (Pestañas interactivas del reporte) */}
      {viewingAvaluo && (
        <AvaluoDetailModal
          avaluo={viewingAvaluo}
          currentUser={currentUser}
          currentRole={currentRole}
          onStatusChange={handleStatusChange}
          onClose={() => setViewingAvaluo(null)}
          onEdit={(item) => {
            lastFichaIdRef.current = item.id;
            setViewingAvaluo(null);
            handleStartEdit(item);
          }}
          onPrint={(item) => {
            setViewingAvaluo(null);
            setPrintingAvaluo(item);
          }}
          onCertificar={(item) => {
            setViewingAvaluo(null);
            setCertificandoAvaluo(item);
          }}
          onRemovePdf={handleRemovePdfFromAvaluo}
          onUploadPdf={handleUploadPdfToAvaluo}
          onUpdateField={handleUpdateAvaluoField}
        />
      )}

      {/* Official 9-Page Printable Document View (Exact reproduction of LEX ROSAM PDF) */}
      {printingAvaluo && (
        <OfficialReportPrintView
          avaluo={printingAvaluo}
          currentUser={currentUser}
          currentRole={currentRole}
          onClose={() => setPrintingAvaluo(null)}
        />
      )}

      {/* Create / Edit Wizard Modal */}
      {(isCreatingNew || editingAvaluo) && (
        <AvaluoFormModal
          key={editingAvaluo?.id || (isCreatingNew ? 'new-avaluo' : 'none')}
          avaluo={editingAvaluo}
          currentUser={currentUser}
          usuarios={usuarios}
          allAvaluos={avaluos}
          currentTenant={currentTenantConfig}
          currentRole={currentRole}
          onClose={() => {
            if (lastFichaIdRef.current) {
              const previousItem = avaluos.find(a => a.id === lastFichaIdRef.current);
              if (previousItem) setViewingAvaluo(previousItem);
              lastFichaIdRef.current = null;
            }
            setIsCreatingNew(false);
            setEditingAvaluo(null);
          }}
          onSave={handleSaveAvaluo}
        />
      )}

      {/* Ventana Emergente de Confirmación de Borrado para Aroldo Ruiz */}
      {deletingAvaluo && (
        <div 
          className="modal-backdrop" 
          onClick={() => setDeletingAvaluo(null)}
          style={{ 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(4px)',
            padding: '1rem'
          }}
        >
          <div 
            className="modal-window" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
              background: '#ffffff', 
              border: '1.5px solid #fecaca'
            }}
          >
            <div style={{ background: '#fef2f2', padding: '1.25rem 1.5rem', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#dc2626' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.15rem', fontWeight: 800 }}>
                  ¿Está seguro de borrar este registro?
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                  Atención Lic. Aroldo Ruiz • Acción Irreversible
                </span>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                Si lo confirma, <strong>se perderá su información definitivamente</strong>. Esta acción no se puede deshacer y el expediente será eliminado tanto de su equipo como de la base de datos central en la nube.
              </p>

              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Expediente:</span>
                  <strong style={{ color: '#0d2847', fontFamily: 'monospace', fontSize: '0.9rem' }}>{deletingAvaluo.codigo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Propietario:</span>
                  <span style={{ fontWeight: 600 }}>{deletingAvaluo.propietarioPrincipal}</span>
                </div>
                {deletingAvaluo.direccion && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                    <span style={{ color: '#64748b' }}>Dirección:</span>
                    <span style={{ textAlign: 'right', maxWidth: '65%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deletingAvaluo.direccion}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDeletingAvaluo(null)}
                  style={{ padding: '0.6rem 1.35rem', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => executeDeleteAvaluo(deletingAvaluo.id)}
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.35rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 8px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  <Trash2 size={16} />
                  <span>Sí, borrar definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control de Usuarios y Roles (Aroldo Ruiz & Ramiro Nóchez) */}
      {showUserManagement && (
        <UserManagementModal
          currentUser={currentUser}
          usuarios={usuarios}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {/* Centro de Reportería y Exportación Oficial a Excel */}
      {showReporteriaModal && (
        <ReporteriaModal
          isOpen={showReporteriaModal}
          onClose={() => setShowReporteriaModal(false)}
          avaluos={tenantFilteredAvaluos}
          currentTenant={currentTenantConfig}
          selectedTenantId={selectedTenantId}
          currentUser={currentUser}
          onOpenCertificacion={(item) => {
            setShowReporteriaModal(false);
            setCertificandoAvaluo(item);
          }}
        />
      )}

      {/* Formulario de Captura de Certificación de Valor */}
      {certificandoAvaluo && (
        <CertificacionValorModal
          key={certificandoAvaluo.id || certificandoAvaluo.codigo || 'cert-modal'}
          avaluoBase={certificandoAvaluo}
          allAvaluos={avaluos}
          currentUser={currentUser}
          currentRole={currentRole}
          onClose={() => setCertificandoAvaluo(null)}
          onPreviewPrint={async (certData, baseItem) => {
            // Guardar automáticamente para que el documento nunca se pierda al previsualizar o descargar el PDF
            const savedRecord = await handleSaveCertificacion(certData, true);
            const finalData = savedRecord ? { ...certData, id: savedRecord.id, codigo: savedRecord.codigo } : certData;
            setPrintingCertificacion({ certData: finalData, baseItem });
            return savedRecord;
          }}
          onSaveCertificacion={handleSaveCertificacion}
        />
      )}

      {/* Impresión / Vista Previa de Certificación de Valor (PDF) */}
      {printingCertificacion && (
        <CertificacionPrintView
          certificacion={printingCertificacion.certData}
          avaluoBase={printingCertificacion.baseItem}
          currentUser={currentUser}
          currentRole={currentRole}
          onStatusChange={handleStatusChange}
          onClose={() => setPrintingCertificacion(null)}
        />
      )}

      {/* Modal de Mi Cuenta y Cerrar Sesión (Optimizada para Móvil y Desktop) */}
      {showProfileModal && currentUser && (
        <div 
          className="modal-overlay" 
          style={{ 
            zIndex: 110, 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', fontSize: '1.25rem', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: currentUser?.rol === 'admin' ? '#1e40af' : currentUser?.rol === 'soporte' ? '#6d28d9' : '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (currentUser?.nombre || 'LR').slice(0, 2).toUpperCase()
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d2847', margin: '0 0 0.25rem' }}>
              {currentUser?.nombre}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.85rem', wordBreak: 'break-all' }}>
              {currentUser?.email}
            </p>

            <div style={{
              display: 'inline-block',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: currentUser?.rol === 'admin' ? '#eff6ff' : currentUser?.rol === 'soporte' ? '#f5f3ff' : '#f0fdf4',
              color: currentUser?.rol === 'admin' ? '#1e40af' : currentUser?.rol === 'soporte' ? '#6d28d9' : '#15803d',
              marginBottom: '1.25rem',
              border: '1px solid rgba(0,0,0,0.06)'
            }}>
              {currentUser?.titulo || (currentUser?.rol === 'admin' ? 'Aprobador Oficial LEX ROSAM' : 'Valuador Técnico')}
            </div>

            {/* Administrar colaboradores si tiene permisos */}
            {(currentUser?.rol === 'admin' || currentUser?.rol === 'soporte') && (
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowUserManagement(true);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0d2847',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <span>Control de Colaboradores</span>
              </button>
            )}

            {/* Botón principal de Cerrar Sesión */}
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
              }}
            >
              <LogOut size={18} />
              <span>Cerrar Sesión de Google</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Actions */}
      <MobileBottomNav
        onNewAvaluo={() => {
          if (currentRole === 'ingreso' || currentUser?.rol === 'admin' || currentUser?.rol === 'soporte') {
            setIsCreatingNew(true);
          } else {
            alert('Los usuarios con rol de sólo lectura no tienen permisos para crear expedientes.');
          }
        }}
        onFocusSearch={focusSearchInput}
        onScrollStats={scrollToStats}
        activeView="list"
        onOpenProfile={() => setShowProfileModal(true)}
        currentUser={currentUser}
      />
    </div>
  );
}

