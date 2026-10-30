import React from 'react';
import { Search, X, LayoutGrid, Table, ArrowUpDown } from 'lucide-react';

export default function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  propertyTypeFilter,
  setPropertyTypeFilter,
  bankFilter,
  setBankFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalResults
}) {
  const searchInputRef = React.useRef(null);

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="search-section">
      {/* Main Omnisearch Bar Row */}
      <div className="search-bar-row">
        <div className="search-input-box">
          <Search size={18} className="search-icon-inside" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Buscar por Código (ej. LR-2026-001), Propietario, Finca/Folio/Libro, Banco o Dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="view-toggle-group">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista de Tarjetas Fotográficas"
          >
            <LayoutGrid size={16} />
            <span className="desktop-only">Tarjetas</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de Tabla / Resumen"
          >
            <Table size={16} />
            <span className="desktop-only">Tabla</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Pills Row */}
      <div className="filter-pills-row">
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveFilter('todos')}
        >
          Todos ({totalResults})
        </button>
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'autorizado' || activeFilter === 'completado' ? 'active' : ''}`}
          onClick={() => setActiveFilter('autorizado')}
        >
          ✓ Autorizados
        </button>
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'en_revision' || activeFilter === 'proceso' ? 'active' : ''}`}
          onClick={() => setActiveFilter('en_revision')}
        >
          ⏳ En Revisión
        </button>
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'devuelto' ? 'active' : ''}`}
          onClick={() => setActiveFilter('devuelto')}
        >
          ⚠️ Devueltos
        </button>
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'borrador' ? 'active' : ''}`}
          onClick={() => setActiveFilter('borrador')}
        >
          📝 Borradores
        </button>

        {/* Property Type Dropdown */}
        <div style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="todos">Todos los Tipos</option>
            <option value="Comercial">Comercial</option>
            <option value="Bancario">Bancario</option>
            <option value="Fiscal">Fiscal</option>
            <option value="Certificación">Certificación</option>
            <option value="Residencial">Residencial</option>
            <option value="Apartamento / PH">Apartamento / PH</option>
            <option value="Industrial">Industrial</option>
            <option value="Terreno / Rústico">Terreno / Rústico</option>
            <option value="Finca Agrícola">Finca Agrícola</option>
          </select>
        </div>

        {/* Bank Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
          >
            <option value="todos">Todas las Instituciones</option>
            <option value="BANCO G&T CONTINENTAL">Banco G&T Continental</option>
            <option value="BANCO INDUSTRIAL">Banco Industrial</option>
            <option value="BANCO DE AMÉRICA CENTRAL (BAC)">Banco de América Central (BAC)</option>
            <option value="COOPERATIVA DE AHORRO Y CREDITO INTEGRAL PARROQUIAL GUADALUPANA R.L.">Cooperativa Guadalupana</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="sort-select-box">
          <ArrowUpDown size={14} />
          <label htmlFor="sort-select" className="desktop-only" style={{ fontSize: '0.78rem' }}>Ordenar:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recientes">Más recientes</option>
            <option value="codigo-desc">Código (Desc)</option>
            <option value="codigo-asc">Código (Asc)</option>
            <option value="valor-desc">Mayor Valor (Q)</option>
            <option value="valor-asc">Menor Valor (Q)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
