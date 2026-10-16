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
import { initialAvaluos } from './data/mockAvaluos';
import { 
  subscribeToAvaluos, 
  saveAvaluoToCloud, 
  deleteAvaluoFromCloud, 
  seedInitialAvaluosIfEmpty 
} from './firebase';
import { SearchX, Plus, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'cverde_avaluos_db_v1';

export default function App() {
  const [cloudStatus, setCloudStatus] = useState('conectando'); // 'conectado' | 'offline' | 'conectando'

  // Load persistent data from localStorage or fallback to initial mock
  const [avaluos, setAvaluos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
        // Status filter
        if (activeFilter !== 'todos' && item.estado !== activeFilter) {
          return false;
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
    downloadAnchor.setAttribute('download', `cverde_avaluos_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
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

  return (
    <div className="app-container">
      {/* Top Navbar with Cverde Branding */}
      <Navbar
        onNewAvaluo={() => setIsCreatingNew(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        avaluosCount={avaluos.length}
        cloudStatus={cloudStatus}
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

      {/* Official 9-Page Printable Document View (Exact reproduction of PDF) */}
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
