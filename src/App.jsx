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
  subscribeToUsuarios,
  seedInitialUsuariosIfEmpty
} from './firebase';
import { SearchX, Plus, Sparkles, ShieldAlert, LogOut } from 'lucide-react';

const STORAGE_KEY = 'lexrosam_avaluos_db_v2';
const LEGACY_STORAGE_KEY = 'cverde_avaluos_db_v1';
const AUTH_USER_KEY = 'lexrosam_auth_user';

export default function App() {
  const [cloudStatus, setCloudStatus] = useState('conectando'); // 'conectado' | 'offline' | 'conectando'
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading auth user', e);
    }
    return null;
  });

  const [usuarios, setUsuarios] = useState([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [currentRole, setCurrentRole] = useState(() => {
    return currentUser?.rol === 'valuador' ? 'ingreso' : 'autorizador';
  });

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
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').toLowerCase().trim();
        const match = usuarios.find(u => u.email?.toLowerCase().trim() === email);

        let assignedRole = 'valuador';
        let assignedNombre = firebaseUser.displayName || 'Colaborador';
        let assignedTitulo = 'Valuador Técnico de Ingreso';
        let isActivo = true;

        if (email === 'rnochezmc@gmail.com') {
          assignedRole = 'soporte';
          assignedNombre = firebaseUser.displayName || 'Ing. Ramiro Nóchez';
          assignedTitulo = 'Soporte Técnico y Sistemas';
        } else if (email === 'cverdeavaluos@gmail.com') {
          assignedRole = 'admin';
          assignedNombre = firebaseUser.displayName || 'Lic. Haroldo Ruiz';
          assignedTitulo = 'Dueño LEX ROSAM / Valuador Autorizado 2572-R-2026';
        } else if (match) {
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
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      }
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, [usuarios]);

  const handleSimulateLogin = (profile) => {
    setCurrentUser(profile);
    setCurrentRole(profile.rol === 'valuador' ? 'ingreso' : 'autorizador');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out local', e);
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
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

  // Pantalla de Inicio de Sesión si no hay usuario autenticado
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(fbUser) => {
          // Handled by onAuthStateChanged
        }}
        onSimulateLogin={handleSimulateLogin}
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
          maxWidth: '440px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <ShieldAlert size={52} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#0d2847', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Acceso Pendiente de Activación
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: '0.75rem 0 1.5rem' }}>
            Tu cuenta <strong>{currentUser.email}</strong> está registrada pero requiere que el <strong>Lic. Haroldo Ruiz</strong> active tus permisos en el panel de colaboradores de LEX ROSAM S.A.
          </p>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              fontWeight: 600,
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

      {/* Mobile Bottom Quick Actions */}
      <MobileBottomNav
        onNewAvaluo={() => setIsCreatingNew(true)}
        onFocusSearch={focusSearchInput}
        onScrollStats={scrollToStats}
        activeView="list"
      />
    </div>
  );
}
