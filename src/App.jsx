import React, { useState, useEffect, useMemo } from 'react';
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
import { initialAvaluos } from './data/mockAvaluos';
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
import { SearchX, Plus, Sparkles, ShieldAlert, LogOut, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'lexrosam_avaluos_db_v2';
const LEGACY_STORAGE_KEY = 'cverde_avaluos_db_v1';
const AUTH_USER_KEY = 'lexrosam_auth_user';

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

  // Load persistent data from localStorage or fallback to initial mock
  const [avaluos, setAvaluos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return initialAvaluos;
  });

  // Save to localStorage as immediate offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(avaluos));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }, [avaluos]);

  // Sincronización en tiempo real con Firebase Firestore
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = subscribeToAvaluos(
        (cloudList) => {
          setCloudStatus('conectado');
          if (Array.isArray(cloudList) && cloudList.length > 0) {
            setAvaluos(cloudList);
          } else {
            // Si la colección de Firestore en la nube está vacía, inicializarla
            seedInitialAvaluosIfEmpty(initialAvaluos);
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

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').toLowerCase().trim();
        const match = usuarios.find(u => u.email?.toLowerCase().trim() === email);

        // Si no es cuenta principal y usuarios aún no cargan de Firestore, esperar
        if (email !== 'rnochezmc@gmail.com' && email !== 'cverdeavaluos@gmail.com' && !usuariosLoaded) {
          return;
        }

        let assignedRole = 'no_autorizado';
        let assignedNombre = firebaseUser.displayName || 'Colaborador';
        let assignedTitulo = 'Personal Técnico';
        let isActivo = false;

        // Cuentas administradoras maestras del sistema
        if (email === 'rnochezmc@gmail.com') {
          assignedRole = 'soporte';
          assignedNombre = (firebaseUser.displayName || 'Ramiro Nóchez').replace(/^Ing\.\s*/i, '');
          assignedTitulo = 'Soporte Técnico y Sistemas';
          isActivo = true;
        } else if (email === 'cverdeavaluos@gmail.com') {
          assignedRole = 'admin';
          assignedNombre = firebaseUser.displayName || 'Haroldo Ruiz';
          assignedTitulo = 'Dueño LEX ROSAM / Valuador Autorizado 2572-R-2026';
          isActivo = true;
        } else if (match) {
          // Usuario registrado por Haroldo o Ramiro en la colección de usuarios
          assignedRole = match.rol || 'valuador';
          assignedNombre = match.nombre || firebaseUser.displayName || 'Colaborador';
          assignedTitulo = match.titulo || 'Personal Técnico';
          isActivo = match.activo !== false;
        }

        const userObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          nombre: assignedNombre,
          rol: assignedRole,
          titulo: assignedTitulo,
          photoURL: firebaseUser.photoURL,
          activo: isActivo
        };

        setCurrentUser(userObj);
        setCurrentRole(assignedRole === 'valuador' ? 'ingreso' : 'autorizador');
        setIsAuthLoading(false);
      } else {
        // Ninguna cuenta de Google autenticada
        setCurrentUser(null);
        localStorage.removeItem(AUTH_USER_KEY);
        setIsAuthLoading(false);
      }
    });

    return () => {
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
  const [activeFilter, setActiveFilter] = useState('todos');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('todos');
  const [bankFilter, setBankFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recientes');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [viewingAvaluo, setViewingAvaluo] = useState(null);
  const [editingAvaluo, setEditingAvaluo] = useState(null);
  const [printingAvaluo, setPrintingAvaluo] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Normalize string for accent-insensitive search
  const normalize = (str) => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Filtered & Sorted Avaluos
  const filteredAvaluos = useMemo(() => {
    const term = normalize(searchTerm.trim());

    return avaluos
      .filter((item) => {
        // Status filter matching new workflow
        if (activeFilter !== 'todos') {
          if (activeFilter === 'autorizado' && item.estado !== 'autorizado' && item.estado !== 'completado') {
            return false;
          }
          if (activeFilter === 'en_revision' && item.estado !== 'en_revision' && item.estado !== 'proceso') {
            return false;
          }
          if (activeFilter === 'devuelto' && item.estado !== 'devuelto') {
            return false;
          }
          if (activeFilter === 'borrador' && item.estado !== 'borrador' && item.estado) {
            return false;
          }
        }

        // Property type filter
        if (propertyTypeFilter !== 'todos' && item.tipoAvaluo !== propertyTypeFilter) {
          return false;
        }

        // Bank filter
        if (bankFilter !== 'todos' && item.solicitante !== bankFilter) {
          return false;
        }

        // Omnisearch matching
        if (!term) return true;

        const matchCode = normalize(item.codigo).includes(term);
        const matchOwner = normalize(item.propietarioPrincipal).includes(term);
        const matchBank = normalize(item.solicitante).includes(term);
        const matchAddress = normalize(item.direccion).includes(term);
        const matchSector = normalize(item.sector).includes(term);
        const matchDicabi = normalize(item.dicabiMatricula).includes(term);
        const matchDpi = normalize(item.dpi).includes(term);

        // Match within nested fincas array
        const matchFincas = item.fincas?.some((f) => 
          normalize(f.finca).includes(term) ||
          normalize(f.folio).includes(term) ||
          normalize(f.libro).includes(term) ||
          normalize(f.propietario).includes(term)
        );

        return matchCode || matchOwner || matchBank || matchAddress || matchSector || matchDicabi || matchDpi || matchFincas;
      })
      .sort((a, b) => {
        if (sortBy === 'recientes') {
          return new Date(b.fechaActualizacion || b.fechaSolicitud) - new Date(a.fechaActualizacion || a.fechaSolicitud);
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
  }, [avaluos, searchTerm, activeFilter, propertyTypeFilter, bankFilter, sortBy]);

  // Handlers
  const handleSaveAvaluo = async (savedItem) => {
    // 1. Actualización optimista local
    setAvaluos((prev) => {
      const existsIndex = prev.findIndex((a) => a.id === savedItem.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedItem;
        return updated;
      } else {
        return [savedItem, ...prev];
      }
    });
    setEditingAvaluo(null);
    setIsCreatingNew(false);

    // 2. Persistir en Firebase Cloud Firestore
    try {
      await saveAvaluoToCloud(savedItem);
    } catch (err) {
      console.error('Error guardando en Firebase:', err);
    }
  };

  // Cambio de estado de autorización
  const handleStatusChange = async (id, newStatus, comments) => {
    let updatedItem = null;

    setAvaluos((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const next = {
            ...item,
            estado: newStatus,
            observacionesAutorizador: comments !== undefined ? comments : item.observacionesAutorizador,
            fechaActualizacion: new Date().toISOString().slice(0, 10)
          };
          if (newStatus === 'autorizado') {
            next.fechaAutorizacion = new Date().toISOString().slice(0, 10);
            next.autorizadoPor = 'Lic. Haroldo Ruiz (Reg. 2572-R-2026)';
          }
          updatedItem = next;
          return next;
        }
        return item;
      });
    });

    if (viewingAvaluo?.id === id && updatedItem) {
      setViewingAvaluo(updatedItem);
    }

    if (updatedItem) {
      try {
        await saveAvaluoToCloud(updatedItem);
      } catch (err) {
        console.error('Error actualizando estado en Firebase:', err);
      }
    }
  };

  const handleDeleteAvaluo = async (id) => {
    const target = avaluos.find((a) => a.id === id);
    if (!target) return;
    const confirmed = window.confirm(`¿Está seguro de eliminar el expediente ${target.codigo} (${target.propietarioPrincipal})? Esta acción no se puede deshacer.`);
    if (confirmed) {
      setAvaluos((prev) => prev.filter((a) => a.id !== id));
      if (viewingAvaluo?.id === id) setViewingAvaluo(null);
      try {
        await deleteAvaluoFromCloud(id);
      } catch (err) {
        console.error('Error eliminando de Firebase:', err);
      }
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
        onLoginSuccess={(fbUser) => {
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
            Comunícate con <strong>Haroldo Ruiz</strong> para que active tu usuario y te asigne un rol en el panel de colaboradores.
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
      {/* Top Navbar with Lex Rosam Branding & Role Selector */}
      <Navbar
        onNewAvaluo={() => setIsCreatingNew(true)}
        cloudStatus={cloudStatus}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenUserManagement={() => setShowUserManagement(true)}
      />

      <main className="main-wrapper">
        {/* KPI Stats Overview Bar */}
        <StatsOverview avaluos={avaluos} />

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
          totalResults={filteredAvaluos.length}
        />

        {/* Expedientes Results Section */}
        {filteredAvaluos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', marginTop: '1rem' }}>
            <SearchX size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-800)' }}>No se encontraron expedientes</h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', maxWidth: '420px', margin: '0.4rem auto 1.5rem auto' }}>
              No existen avalúos que coincidan con "{searchTerm}" o los filtros seleccionados.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
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
        ) : viewMode === 'grid' ? (
          <div className="cards-grid">
            {filteredAvaluos.map((av) => (
              <AvaluoCard
                key={av.id}
                avaluo={av}
                onView={(item) => setViewingAvaluo(item)}
                onEdit={(item) => setEditingAvaluo(item)}
                onDelete={handleDeleteAvaluo}
                onPrint={(item) => setPrintingAvaluo(item)}
              />
            ))}
          </div>
        ) : (
          <AvaluoTable
            avaluos={filteredAvaluos}
            onView={(item) => setViewingAvaluo(item)}
            onEdit={(item) => setEditingAvaluo(item)}
            onDelete={handleDeleteAvaluo}
            onPrint={(item) => setPrintingAvaluo(item)}
          />
        )}
      </main>

      {/* Detail Viewer Modal (Pestañas interactivas del reporte) */}
      {viewingAvaluo && (
        <AvaluoDetailModal
          avaluo={viewingAvaluo}
          currentRole={currentRole}
          onStatusChange={handleStatusChange}
          onClose={() => setViewingAvaluo(null)}
          onEdit={(item) => {
            setViewingAvaluo(null);
            setEditingAvaluo(item);
          }}
          onPrint={(item) => {
            setViewingAvaluo(null);
            setPrintingAvaluo(item);
          }}
        />
      )}

      {/* Official 9-Page Printable Document View (Exact reproduction of LEX ROSAM PDF) */}
      {printingAvaluo && (
        <OfficialReportPrintView
          avaluo={printingAvaluo}
          onClose={() => setPrintingAvaluo(null)}
        />
      )}

      {/* Create / Edit Wizard Modal */}
      {(isCreatingNew || editingAvaluo) && (
        <AvaluoFormModal
          avaluo={editingAvaluo}
          onClose={() => {
            setIsCreatingNew(false);
            setEditingAvaluo(null);
          }}
          onSave={handleSaveAvaluo}
        />
      )}

      {/* Control de Usuarios y Roles (Haroldo Ruiz & Ramiro Nóchez) */}
      {showUserManagement && (
        <UserManagementModal
          currentUser={currentUser}
          usuarios={usuarios}
          onClose={() => setShowUserManagement(false)}
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

