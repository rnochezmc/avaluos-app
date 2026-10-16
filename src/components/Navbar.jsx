import React from 'react';
import { Building2, Plus, Download, Upload, ShieldCheck } from 'lucide-react';

export default function Navbar({ onNewAvaluo, onExportData, onImportData, avaluosCount }) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            onImportData(parsed);
          } else {
            alert('El archivo no contiene un formato de expedientes válido.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

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
          {/* Quick Backup Buttons */}
          <button 
            type="button" 
            className="card-action-btn" 
            onClick={onExportData}
            title="Exportar respaldo de datos en JSON"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
          >
            <Download size={15} />
            <span className="desktop-only">Exportar BD</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
          <button 
            type="button" 
            className="card-action-btn" 
            onClick={() => fileInputRef.current?.click()}
            title="Importar respaldo de datos"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
          >
            <Upload size={15} />
            <span className="desktop-only">Restaurar BD</span>
          </button>

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
