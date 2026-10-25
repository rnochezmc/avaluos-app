import React from 'react';
import { Files, DollarSign, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function StatsOverview({ avaluos, currentTenant, selectedTenantId = 'lex-rosam' }) {
  const totalCount = avaluos.length;
  
  const totalValuationGTQ = avaluos.reduce((acc, curr) => acc + (Number(curr.valorComercialGTQ) || 0), 0);
  const totalValuationUSD = avaluos.reduce((acc, curr) => acc + (Number(curr.valorComercialUSD) || 0), 0);
  
  const autorizadosCount = avaluos.filter(a => a.estado === 'autorizado' || a.estado === 'completado').length;
  const enRevisionCount = avaluos.filter(a => a.estado === 'en_revision' || a.estado === 'proceso').length;
  const devueltosCount = avaluos.filter(a => a.estado === 'devuelto').length;

  const autorizadorLabel = selectedTenantId === 'cverde'
    ? 'Autorizados (C Verde)'
    : (selectedTenantId === 'todos' ? 'Autorizados Totales' : `Autorizados (${currentTenant?.autorizadorNombreCorto || 'Aroldo'})`);

  const primaryAccent = currentTenant?.colores?.primary || '#1e3a8a';

  const formatQ = (val) => {
    return 'Q. ' + Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="stats-banner">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: selectedTenantId === 'cverde' ? 'rgba(0, 78, 59, 0.1)' : 'rgba(30, 58, 138, 0.1)', color: primaryAccent }}>
          <Files size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">
            {selectedTenantId === 'todos' ? 'Expedientes (Todas)' : `Expedientes (${currentTenant?.nombreCorto || 'Empresa'})`}
          </div>
          <div className="stat-value">{totalCount}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon gold">
          <DollarSign size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Valor Comercial Total (Q)</div>
          <div className="stat-value" style={{ fontSize: '1.15rem', color: selectedTenantId === 'cverde' ? '#004e3b' : '#0d2847' }}>
            {formatQ(totalValuationGTQ)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Aprox. {formatUSD(totalValuationUSD)}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: selectedTenantId === 'cverde' ? 'rgba(0, 187, 127, 0.15)' : 'rgba(37, 99, 235, 0.12)', color: selectedTenantId === 'cverde' ? '#007956' : '#2563eb' }}>
          <ShieldCheck size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">{autorizadorLabel}</div>
          <div className="stat-value" style={{ color: selectedTenantId === 'cverde' ? '#007956' : '#2563eb' }}>{autorizadosCount}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: devueltosCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(217, 119, 6, 0.12)', color: devueltosCount > 0 ? '#ef4444' : '#d97706' }}>
          {devueltosCount > 0 ? <AlertTriangle size={22} /> : <Clock size={22} />}
        </div>
        <div className="stat-content">
          <div className="stat-label">En Revisión {devueltosCount > 0 ? `/ ${devueltosCount} Devuelto(s)` : ''}</div>
          <div className="stat-value" style={{ color: devueltosCount > 0 ? '#dc2626' : '#d97706' }}>
            {enRevisionCount}
          </div>
        </div>
      </div>
    </div>
  );
}
