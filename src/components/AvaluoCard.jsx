import React from 'react';
import { MapPin, Building, Eye, Edit3, Trash2, Calendar, Printer, Lock, Award, Camera, Compass } from 'lucide-react';
import { canUserEditAvaluo } from '../utils/permissions';

export default function AvaluoCard({ avaluo, onView, onEdit, onDelete, onPrint, onCertificar, currentUser, currentRole }) {
  const formatQ = (val) => {
    return 'Q. ' + Number(val || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'autorizado':
      case 'completado':
        return <span className="aval-badge-status badge-completado">Autorizado</span>;
      case 'en_revision':
      case 'proceso':
        return <span className="aval-badge-status" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>En Revisión</span>;
      case 'devuelto':
        return <span className="aval-badge-status" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>Devuelto</span>;
      default:
        return <span className="aval-badge-status badge-borrador">Borrador</span>;
    }
  };

  // Primary image fallback (soporta fotos individuales o arreglos de fotos múltiples)
  const getFirstPhoto = (cat) => {
    if (!cat) return null;
    if (Array.isArray(cat)) return cat.find(u => u && typeof u === 'string' && u.trim().length > 0) || null;
    if (typeof cat === 'string' && cat.trim().length > 0) return cat;
    return null;
  };

  const cardImage = avaluo.fotoPortada ||
                    getFirstPhoto(avaluo.fotos?.ingreso) || 
                    getFirstPhoto(avaluo.fotos?.entorno) || 
                    getFirstPhoto(avaluo.fotos?.interior) || 
                    getFirstPhoto(avaluo.fotos?.ubicacion) ||
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const firstFinca = avaluo.fincas?.[0] || { finca: 'S/N', folio: '-', libro: '-' };

  const totalPhotosCount = (() => {
    if (avaluo.fotosSummary && typeof avaluo.fotosSummary === 'object') {
      const sum = Object.values(avaluo.fotosSummary).reduce((acc, n) => acc + (Number(n) || 0), 0);
      if (sum > 0) return sum;
    }
    if (avaluo.fotos && typeof avaluo.fotos === 'object') {
      let count = 0;
      Object.values(avaluo.fotos).forEach(list => {
        if (Array.isArray(list)) count += list.length;
        else if (typeof list === 'string' && list.trim()) count += 1;
      });
      if (count > 0) return count;
    }
    return avaluo.fotoPortada ? 1 : 0;
  })();

  return (
    <div className="aval-card" onClick={() => onView(avaluo)}>
      <div className="aval-card-header">
        <img 
          src={cardImage} 
          alt={`Inmueble de ${avaluo.codigo}`} 
          className="aval-card-thumb"
          loading="lazy" 
        />
        {getStatusBadge(avaluo.estado)}

        {totalPhotosCount > 1 && (
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)'
          }}>
            <Camera size={11} /> {totalPhotosCount} fotos
          </span>
        )}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px' }}>
          {(avaluo.tenantId === 'cverde' || avaluo.codigo?.startsWith('CV-')) ? (
            <span style={{ background: 'rgba(0, 44, 34, 0.85)', color: '#00bb7f', border: '1px solid rgba(0, 187, 127, 0.4)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00bb7f' }}></span>
              C VERDE
            </span>
          ) : (
            <span style={{ background: 'rgba(7, 23, 43, 0.85)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }}></span>
              LEX ROSAM
            </span>
          )}
        </div>
        <div className="aval-card-code">{avaluo.codigo}</div>
      </div>

      <div className="aval-card-body">
        <div className="aval-card-title-row">
          <h3 className="aval-card-title">{avaluo.propietarioPrincipal || avaluo.fincas?.[0]?.propietario || avaluo.bienMostradoPor || 'Propietario no asignado'}</h3>
          <span className="aval-card-type-tag">{avaluo.tipoAvaluo}</span>
        </div>

        <div className="aval-meta-row">
          <Building size={14} />
          <span><strong>Solicitante:</strong> {avaluo.solicitante}</span>
        </div>

        <div className="aval-meta-row">
          <MapPin size={14} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {avaluo.direccion}
          </span>
        </div>

        {avaluo.coordenadas && (
          <div className="aval-meta-row" style={{ fontSize: '0.74rem', color: '#0369a1' }}>
            <Compass size={13} color="#0284c7" />
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>GPS: {avaluo.coordenadas}</span>
          </div>
        )}

        <div className="aval-meta-row" style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          <Calendar size={13} />
          <span>Actualizado: {avaluo.fechaActualizacion || avaluo.fechaSolicitud}</span>
        </div>

        {/* Registral Capsule */}
        <div className="registral-capsule">
          <div className="registral-item">
            <span>Finca</span>
            <span>{firstFinca.finca}</span>
          </div>
          <div className="registral-item">
            <span>Folio</span>
            <span>{firstFinca.folio}</span>
          </div>
          <div className="registral-item">
            <span>Libro</span>
            <span>{firstFinca.libro}</span>
          </div>
          <div className="registral-item">
            <span>Área Valuada</span>
            <span>{avaluo.areaValuada || 0} m²</span>
          </div>
        </div>

        {/* Financial Section */}
        <div className="aval-card-financial">
          <div>
            <div className="val-commercial-label">Valor Comercial</div>
            <div className="val-commercial-amount">{formatQ(avaluo.valorComercialGTQ)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="val-commercial-label">Aprox. USD</div>
            <div className="val-usd-amount">{formatUSD(avaluo.valorComercialUSD)}</div>
          </div>
        </div>
      </div>

      <div className="aval-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="card-action-btn"
          onClick={() => onView(avaluo)}
          title="Ver Ficha Técnica Completa"
        >
          <Eye size={14} />
          <span>Ficha</span>
        </button>
        <button
          type="button"
          className="card-action-btn"
          onClick={() => onPrint && onPrint(avaluo)}
          title="Ver e Imprimir Formato Oficial (9 Páginas)"
          style={{ color: 'var(--cverde-primary)' }}
        >
          <Printer size={14} />
          <span>Imprimir</span>
        </button>
        {onCertificar && (
          <button
            type="button"
            className="card-action-btn"
            onClick={() => onCertificar(avaluo)}
            title="Emitir Certificación de Valor (PDF)"
            style={{ color: '#0284c7' }}
          >
            <Award size={14} />
            <span>Certificar</span>
          </button>
        )}
        {canUserEditAvaluo(avaluo, currentUser, currentRole) ? (
          <button
            type="button"
            className="card-action-btn"
            onClick={() => onEdit(avaluo)}
            title="Editar Datos del Avalúo"
          >
            <Edit3 size={14} />
            <span>Editar</span>
          </button>
        ) : (
          <button
            type="button"
            className="card-action-btn"
            onClick={() => alert('Este expediente ya fue autorizado por el Lic. Aroldo Ruiz y se encuentra bloqueado para edición. Solo el autorizador puede modificarlo.')}
            title="Expediente Autorizado (Bloqueado para Asistentes)"
            style={{ opacity: 0.5, cursor: 'not-allowed', color: '#64748b' }}
          >
            <Lock size={14} />
            <span>Bloqueado</span>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="card-action-btn"
            onClick={() => onDelete(avaluo.id)}
            title="Eliminar Expediente"
            style={{ color: 'var(--status-danger)' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
