import React, { useState, useEffect } from 'react';
import { Eye, Edit3, Trash2, Printer, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function AvaluoTable({ avaluos = [], onView, onEdit, onDelete, onPrint }) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reiniciar a la página 1 cuando cambie el número de avalúos filtrados
  useEffect(() => {
    setCurrentPage(1);
  }, [avaluos.length]);

  const totalItems = avaluos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = avaluos.slice(startIndex, endIndex);

  const formatQ = (val) => {
    return 'Q. ' + Number(val || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'autorizado':
      case 'completado':
        return <span className="aval-badge-status badge-completado" style={{ position: 'static' }}>Autorizado</span>;
      case 'en_revision':
      case 'proceso':
        return <span className="aval-badge-status" style={{ position: 'static', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>En Revisión</span>;
      case 'devuelto':
        return <span className="aval-badge-status" style={{ position: 'static', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>Devuelto</span>;
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
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                No se encontraron avalúos en esta vista.
              </td>
            </tr>
          ) : (
            currentItems.map((av) => {
              const firstFinca = av.fincas?.[0] || { finca: '-', folio: '-', libro: '-' };
              return (
                <tr key={av.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="table-code-badge">{av.codigo}</span>
                      {(av.tenantId === 'cverde' || av.codigo?.startsWith('CV-')) ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: '#ecfdf5', color: '#004e3b', border: '1px solid #a7f3d0' }}>
                          C VERDE
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: '#eff6ff', color: '#002B49', border: '1px solid #bfdbfe' }}>
                          LEX ROSAM
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{av.tipoAvaluo}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{av.propietarioPrincipal || av.fincas?.[0]?.propietario || av.bienMostradoPor || 'No asignado'}</div>
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
            })
          )}
        </tbody>
      </table>

      {/* Barra de Paginación */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--slate-200)',
          background: '#f8fafc',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--slate-600)'
        }}
      >
        {/* Info & Selector de cantidad por página */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            Mostrando <strong style={{ color: 'var(--slate-800)' }}>{totalItems === 0 ? 0 : startIndex + 1}</strong> a <strong style={{ color: 'var(--slate-800)' }}>{endIndex}</strong> de <strong style={{ color: 'var(--slate-800)' }}>{totalItems}</strong> {totalItems === 1 ? 'avalúo' : 'avalúos'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span>Líneas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '0.22rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--slate-300)',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                cursor: 'pointer'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Controles de Navegación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            disabled={validCurrentPage === 1}
            onClick={() => setCurrentPage(1)}
            title="Primera página"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.35rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--slate-300)',
              background: validCurrentPage === 1 ? '#f1f5f9' : '#ffffff',
              color: validCurrentPage === 1 ? '#94a3b8' : 'var(--slate-700)',
              cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronsLeft size={15} />
          </button>
          <button
            type="button"
            disabled={validCurrentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            title="Página anterior"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--slate-300)',
              background: validCurrentPage === 1 ? '#f1f5f9' : '#ffffff',
              color: validCurrentPage === 1 ? '#94a3b8' : 'var(--slate-700)',
              cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronLeft size={15} />
            <span>Anterior</span>
          </button>

          <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--slate-700)' }}>
            Página {validCurrentPage} de {totalPages}
          </span>

          <button
            type="button"
            disabled={validCurrentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            title="Página siguiente"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--slate-300)',
              background: validCurrentPage === totalPages ? '#f1f5f9' : '#ffffff',
              color: validCurrentPage === totalPages ? '#94a3b8' : 'var(--slate-700)',
              cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <span>Siguiente</span>
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            disabled={validCurrentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Última página"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.35rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--slate-300)',
              background: validCurrentPage === totalPages ? '#f1f5f9' : '#ffffff',
              color: validCurrentPage === totalPages ? '#94a3b8' : 'var(--slate-700)',
              cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
