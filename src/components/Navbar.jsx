import React from 'react';
import { Building2, Plus } from 'lucide-react';

export default function Navbar({ onNewAvaluo, cloudStatus = 'conectado' }) {
  return (
    <header className="top-navbar">
      <div className="navbar-content">
        <div className="brand-wrapper">
          <div className="brand-logo-icon">
            <Building2 size={24} />
          </div>
          <div className="brand-text">
            <h1>C VERDE</h1>
            <p>Avalúos & Negocios Inmobiliarios</p>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Cloud Sync Status Badge */}
          <div 
            className="cloud-status-badge" 
            title={cloudStatus === 'conectado' ? 'Sincronizado en tiempo real con Firebase Firestore en la nube' : 'Modo Local / Conectando a la nube'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              background: cloudStatus === 'conectado' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: cloudStatus === 'conectado' ? '#047857' : '#b45309',
              border: `1px solid ${cloudStatus === 'conectado' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}
          >
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: cloudStatus === 'conectado' ? '#10b981' : '#f59e0b',
              display: 'inline-block'
            }} />
            <span className="desktop-only">{cloudStatus === 'conectado' ? 'Firebase Nube' : 'Conectando'}</span>
          </div>

          <div className="user-badge" title="Valuador Autorizado Activo">
            <div className="user-avatar">HR</div>
            <div>
              <div style={{ fontWeight: 600, lineHeight: 1.1 }}>Lic. Haroldo Ruiz</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Reg. 2572-R-2026</div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-new-expediente" 
            onClick={onNewAvaluo}
          >
            <Plus size={18} />
            <span>Nuevo Avalúo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
