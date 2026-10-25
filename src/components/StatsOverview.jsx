import React from 'react';
import { Files, DollarSign, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function StatsOverview({ avaluos }) {
  const totalCount = avaluos.length;
  
  const totalValuationGTQ = avaluos.reduce((acc, curr) => acc + (Number(curr.valorComercialGTQ) || 0), 0);
  const totalValuationUSD = avaluos.reduce((acc, curr) => acc + (Number(curr.valorComercialUSD) || 0), 0);
  
  const autorizadosCount = avaluos.filter(a => a.estado === 'autorizado' || a.estado === 'completado').length;
  const enRevisionCount = avaluos.filter(a => a.estado === 'en_revision' || a.estado === 'proceso').length;
  const devueltosCount = avaluos.filter(a => a.estado === 'devuelto').length;

  const formatQ = (val) => {
    return 'Q. ' + Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="stats-banner">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(30, 58, 138, 0.1)', color: '#1e3a8a' }}>
          <Files size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Expedientes Totales</div>
          <div className="stat-value">{totalCount}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon gold">
          <DollarSign size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Valor Comercial Total (Q)</div>
          <div className="stat-value" style={{ fontSize: '1.15rem', color: '#0d2847' }}>
            {formatQ(totalValuationGTQ)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Aprox. {formatUSD(totalValuationUSD)}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
          <ShieldCheck size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Autorizados (Aroldo)</div>
          <div className="stat-value" style={{ color: '#2563eb' }}>{autorizadosCount}</div>
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
