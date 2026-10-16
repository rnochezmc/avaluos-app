import React from 'react';
import { Files, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function StatsOverview({ avaluos }) {
  const totalCount = avaluos.length;
  
  const totalValuationGTQ = avaluos.reduce((acc, curr) => acc + (Number(curr.valorComercialGTQ) || 0), 0);
  const totalValuationUSD = avaluos.reduce((acc, curr) => acc + (Number(curr.valorComercialUSD) || 0), 0);
  
  const completedCount = avaluos.filter(a => a.estado === 'completado').length;
  const inProgressCount = avaluos.filter(a => a.estado === 'proceso' || a.estado === 'borrador').length;

  const formatQ = (val) => {
    return 'Q. ' + Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="stats-banner">
      <div className="stat-card">
        <div className="stat-icon green">
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
          <div className="stat-value" style={{ fontSize: '1.15rem', color: 'var(--cverde-primary)' }}>
            {formatQ(totalValuationGTQ)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '2px' }}>
            Aprox. {formatUSD(totalValuationUSD)}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon green">
          <CheckCircle2 size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Avalúos Concluidos</div>
          <div className="stat-value" style={{ color: 'var(--status-done)' }}>{completedCount}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon blue">
          <Clock size={22} />
        </div>
        <div className="stat-content">
          <div className="stat-label">En Proceso / Borrador</div>
          <div className="stat-value" style={{ color: 'var(--cverde-gold)' }}>{inProgressCount}</div>
        </div>
      </div>
    </div>
  );
}
