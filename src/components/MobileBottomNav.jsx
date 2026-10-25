import React from 'react';
import { Home, Search, Plus, BarChart3, User } from 'lucide-react';

export default function MobileBottomNav({ 
  onNewAvaluo, 
  onFocusSearch, 
  onScrollStats, 
  activeView, 
  onOpenProfile,
  _currentUser 
}) {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-items">
        <button
          type="button"
          className={`mobile-nav-btn ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Home size={18} />
          <span>Expedientes</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={onFocusSearch}
        >
          <Search size={18} />
          <span>Buscar</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn primary-action"
          onClick={onNewAvaluo}
          title="Crear Nuevo Avalúo"
        >
          <Plus size={22} />
          <span>Nuevo</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={onScrollStats}
        >
          <BarChart3 size={18} />
          <span>Métricas</span>
        </button>

        <button
          type="button"
          className="mobile-nav-btn"
          onClick={onOpenProfile}
          title="Mi Perfil y Cerrar Sesión"
        >
          <User size={18} />
          <span>Cuenta</span>
        </button>
      </div>
    </nav>
  );
}

