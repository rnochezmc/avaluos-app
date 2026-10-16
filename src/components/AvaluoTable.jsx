import React from 'react';
import { Eye, Edit3, Trash2, Printer } from 'lucide-react';

export default function AvaluoTable({ avaluos, onView, onEdit, onDelete, onPrint }) {
  const formatQ = (val) => {
    return 'Q. ' + Number(val || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completado':
        return <span className="aval-badge-status badge-completado" style={{ position: 'static' }}>Completado</span>;
      case 'proceso':
        return <span className="aval-badge-status badge-proceso" style={{ position: 'static' }}>En Proceso</span>;
      default:
        return <span className="aval-badge-status badge-borrador" style={{ position: 'static' }}>Borrador</span>;
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Propietario / Inmueble</th>
            <th>Solicitante</th>
            <th>Datos Registrales</th>
            <th>Área</th>
            <th>Valor Comercial</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {avaluos.map((av) => {
            const firstFinca = av.fincas?.[0] || { finca: '-', folio: '-', libro: '-' };
            return (
              <tr key={av.id}>
                <td>
                  <span className="table-code-badge">{av.codigo}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{av.tipoAvaluo}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{av.propietarioPrincipal}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {av.direccion}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{av.solicitante}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{av.fechaActualizacion}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.78rem' }}>
                    <strong>F:</strong> {firstFinca.finca} | <strong>Fol:</strong> {firstFinca.folio}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                    <strong>Lib:</strong> {firstFinca.libro}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{av.areaValuada || 0} m²</div>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--cverde-primary)' }}>
                    {formatQ(av.valorComercialGTQ)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                    $ {Number(av.valorComercialUSD || 0).toLocaleString('en-US')}
                  </div>
                </td>
                <td>
                  {getStatusBadge(av.estado)}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={() => onView(av)}
                      title="Ver Ficha Completa"
                      style={{ padding: '0.35rem 0.5rem' }}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={() => onPrint && onPrint(av)}
                      title="Imprimir Formato Oficial (9 Páginas)"
                      style={{ padding: '0.35rem 0.5rem', color: 'var(--cverde-primary)' }}
                    >
                      <Printer size={14} />
                    </button>
                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={() => onEdit(av)}
                      title="Editar"
                      style={{ padding: '0.35rem 0.5rem' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      className="card-action-btn"
                      onClick={() => onDelete(av.id)}
                      title="Eliminar"
                      style={{ padding: '0.35rem 0.5rem', color: 'var(--status-danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
