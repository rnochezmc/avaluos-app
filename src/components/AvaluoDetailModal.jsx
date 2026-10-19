import React, { useState } from 'react';
import { 
  X, Printer, Edit3, MapPin, Building, Calendar, Sparkles, 
  CheckCircle, FileText, Camera, DollarSign, Scale, ExternalLink,
  ShieldCheck, AlertTriangle, ArrowRight, CornerDownLeft, Download
} from 'lucide-react';

export default function AvaluoDetailModal({ 
  avaluo, 
  onClose, 
  onEdit, 
  onPrint, 
  currentRole = 'autorizador',
  onStatusChange 
}) {
  const [activeTab, setActiveTab] = useState('registral');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

  if (!avaluo) return null;

  const formatQ = (val) => {
    return 'Q. ' + Number(val || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(avaluo);
    } else {
      window.print();
    }
  };

  const handleAuthorize = () => {
    if (window.confirm(`¿Confirmar autorización del expediente ${avaluo.codigo} como Valuador Autorizado?`)) {
      if (onStatusChange) {
        onStatusChange(avaluo.id, 'autorizado', 'Autorizado y firmado por Lic. Haroldo Ruiz');
      }
    }
  };

  const handleReturnToModify = () => {
    if (!rejectionComment.trim()) {
      alert('Por favor ingrese las observaciones o correcciones requeridas antes de regresar el avalúo.');
      return;
    }
    if (onStatusChange) {
      onStatusChange(avaluo.id, 'devuelto', rejectionComment.trim());
    }
    setIsRejecting(false);
    setRejectionComment('');
  };

  const handleSendToReview = () => {
    if (window.confirm(`¿Desea enviar el expediente ${avaluo.codigo} para autorización del Lic. Haroldo Ruiz?`)) {
      if (onStatusChange) {
        onStatusChange(avaluo.id, 'en_revision', 'Enviado por técnico para revisión y autorización');
      }
    }
  };

  const fincas = avaluo.fincas && avaluo.fincas.length > 0 ? avaluo.fincas : [
    {
      finca: 'S/N',
      folio: '-',
      libro: '-',
      propietario: avaluo.propietarioPrincipal || '-',
      areaRegistrada: avaluo.areaRegistrada || 0,
      areaDesmembrada: avaluo.areaDesmembrada || 0,
      areaActualRegistrada: avaluo.areaActualRegistrada || 0,
      areaFisica: avaluo.areaFisica || 0,
      areaValuada: avaluo.areaValuada || 0
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px' }}>
        
        {/* Modal Top Header with Lex Rosam Branding */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)' }}>
          <div className="modal-header-left">
            <div style={{ background: '#ffffff', borderRadius: '6px', padding: '3px 5px', display: 'flex', alignItems: 'center' }}>
              <img src="/lex-rosam-logo.png" alt="Lex Rosam" style={{ height: '28px', width: 'auto' }} />
            </div>
            <div>
              <h2 style={{ color: '#ffffff' }}>EXPEDIENTE DE AVALÚO: {avaluo.codigo}</h2>
              <div className="modal-header-sub" style={{ color: '#cbd5e1' }}>
                LEX ROSAM S.A. | {avaluo.solicitante} | {avaluo.tipoAvaluo}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="card-action-btn"
              onClick={handlePrint}
              title="Imprimir Expediente / Exportar a PDF"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'transparent' }}
            >
              <Printer size={15} />
              <span className="desktop-only">Imprimir (9 Páginas)</span>
            </button>
            <button
              type="button"
              className="card-action-btn"
              onClick={() => { onClose(); onEdit(avaluo); }}
              title="Editar Expediente"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'transparent' }}
            >
              <Edit3 size={15} />
              <span className="desktop-only">Editar</span>
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status & Approval Action Ribbon */}
        <div style={{
          background: avaluo.estado === 'autorizado' ? '#eff6ff' : avaluo.estado === 'devuelto' ? '#fef2f2' : avaluo.estado === 'en_revision' ? '#fefce8' : '#f8fafc',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {avaluo.estado === 'autorizado' && (
              <>
                <ShieldCheck size={20} style={{ color: '#2563eb' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.85rem' }}>Expediente Autorizado</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Aprobado y certificado por Lic. Haroldo Ruiz (Reg. 2572-R-2026)</div>
                </div>
              </>
            )}
            {avaluo.estado === 'devuelto' && (
              <>
                <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.85rem' }}>Devuelto para Modificación</span>
                  <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                    <strong>Observación:</strong> {avaluo.observacionesAutorizador || 'Verificar medidas y documentación.'}
                  </div>
                </div>
              </>
            )}
            {avaluo.estado === 'en_revision' && (
              <>
                <FileText size={20} style={{ color: '#d97706' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem' }}>Pendiente de Autorización</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Enviado por técnico para validación del aprobador</div>
                </div>
              </>
            )}
            {(avaluo.estado === 'borrador' || !avaluo.estado) && (
              <>
                <Edit3 size={20} style={{ color: '#64748b' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Borrador en Captura</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Completar datos técnicos antes de enviar a autorización</div>
                </div>
              </>
            )}
          </div>

          {/* Workflow Buttons according to current role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentRole === 'autorizador' ? (
              <>
                {avaluo.estado !== 'autorizado' && (
                  <button
                    type="button"
                    onClick={handleAuthorize}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>Autorizar Avalúo</span>
                  </button>
                )}
                {avaluo.estado !== 'devuelto' && (
                  <button
                    type="button"
                    onClick={() => setIsRejecting(prev => !prev)}
                    style={{
                      background: '#ffffff',
                      color: '#b91c1c',
                      border: '1.5px solid #f87171',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CornerDownLeft size={15} />
                    <span>Regresar para Modificar</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {avaluo.estado !== 'autorizado' && avaluo.estado !== 'en_revision' && (
                  <button
                    type="button"
                    onClick={handleSendToReview}
                    style={{
                      background: '#0d2847',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ArrowRight size={15} />
                    <span>Enviar a Autorización</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Regresar para Modificar (si Haroldo activó el botón) */}
        {isRejecting && (
          <div style={{ background: '#fef2f2', padding: '1rem 1.5rem', borderBottom: '2px solid #ef4444' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#991b1b', marginBottom: '0.4rem' }}>
              Indicar observaciones de modificación para el técnico de campo:
            </div>
            <textarea
              rows={2}
              className="form-input"
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Ej: Favor verificar el área desmembrada de la finca 2 y actualizar la foto de fachada..."
              style={{ width: '100%', marginBottom: '0.5rem', background: '#ffffff' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsRejecting(false)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReturnToModify}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirmar y Regresar Avalúo
              </button>
            </div>
          </div>
        )}

        {/* Modal Tabs Navigation */}
        <div style={{ padding: '0 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="modal-tabs" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'registral' ? 'active' : ''}`}
              onClick={() => setActiveTab('registral')}
            >
              <FileText size={16} />
              <span>1. Fincas & Registral</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'valores' ? 'active' : ''}`}
              onClick={() => setActiveTab('valores')}
            >
              <DollarSign size={16} />
              <span>2. Valores & Firmas</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'terreno' ? 'active' : ''}`}
              onClick={() => setActiveTab('terreno')}
            >
              <MapPin size={16} />
              <span>3. Terreno & Colindancias</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'construccion' ? 'active' : ''}`}
              onClick={() => setActiveTab('construccion')}
            >
              <Building size={16} />
              <span>4. Construcción & Servicios</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
              onClick={() => setActiveTab('fotos')}
            >
              <Camera size={16} />
              <span>5. Fotos & PDFs RGP</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'legal' ? 'active' : ''}`}
              onClick={() => setActiveTab('legal')}
            >
              <Scale size={16} />
              <span>6. Dictamen Lex Rosam</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* TAB 1: INFORMACIÓN GENERAL Y REGISTRAL */}
          {activeTab === 'registral' && (
            <div>
              <div className="form-section-title">
                <FileText size={16} />
                <span>Datos Generales de la Solicitud</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Código de Expediente</label>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0d2847' }}>{avaluo.codigo}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Tipo de Avalúo</label>
                  <div style={{ fontWeight: 600 }}>{avaluo.tipoAvaluo}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Solicitante</label>
                  <div style={{ fontWeight: 600 }}>{avaluo.solicitante}</div>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Fecha de Solicitud</label>
                  <div>{avaluo.fechaSolicitud || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Fecha de Inspección Física</label>
                  <div style={{ fontWeight: 600, color: '#0d2847' }}>{avaluo.fechaInspeccion || avaluo.fechaActualizacion || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Fecha de Actualización</label>
                  <div>{avaluo.fechaActualizacion || 'N/A'}</div>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Bien Mostrado Por</label>
                  <div style={{ fontWeight: 600 }}>{avaluo.bienMostradoPor || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">DPI / Identificación</label>
                  <div>{avaluo.dpi || 'N/A'}</div>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">Dirección Completa</label>
                <div style={{ fontWeight: 500 }}>{avaluo.direccion}</div>
              </div>

              {/* Fincas Registradas con Áreas Individuales */}
              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <Building size={16} />
                <span>Información Registral y Desglose de Fincas</span>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>FINCA</th>
                      <th>FOLIO</th>
                      <th>LIBRO</th>
                      <th>PROPIETARIO</th>
                      <th>ORIG. REGISTRADA</th>
                      <th>DESMEMBRADA</th>
                      <th>ACT. REGISTRADA</th>
                      <th>VALUADA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fincas.map((f, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{f.finca}</td>
                        <td>{f.folio}</td>
                        <td>{f.libro}</td>
                        <td>{f.propietario || avaluo.propietarioPrincipal}</td>
                        <td>{Number(f.areaRegistrada || 0).toFixed(2)} m²</td>
                        <td style={{ color: Number(f.areaDesmembrada) > 0 ? '#b91c1c' : 'inherit' }}>
                          {Number(f.areaDesmembrada || 0).toFixed(2)} m²
                        </td>
                        <td style={{ fontWeight: 600 }}>{Number(f.areaActualRegistrada || f.areaRegistrada || 0).toFixed(2)} m²</td>
                        <td style={{ fontWeight: 700, color: '#0d2847' }}>{Number(f.areaValuada || 0).toFixed(2)} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aspectos Legales con Textos Amplios */}
              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <Scale size={16} />
                <span>Aspectos Legales y Gravámenes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Limitaciones y Servidumbres:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px' }}>{avaluo.limitaciones || 'Sin limitaciones registradas.'}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Anotaciones Registrales:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px' }}>{avaluo.anotaciones || 'Ninguna vigente.'}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Gravámenes e Hipotecas:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px' }}>{avaluo.gravamenes || 'Libre de gravámenes vigentes.'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VALORES & FIRMAS */}
          {activeTab === 'valores' && (
            <div>
              <div className="form-section-title">
                <DollarSign size={16} />
                <span>Valores Comerciales y Bancarios Certificados</span>
              </div>

              <div className="form-grid-2">
                <div style={{ background: '#f0f4f9', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0d2847' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>VALOR COMERCIAL TOTAL</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d2847', marginTop: '4px' }}>
                    {formatQ(avaluo.valorComercialGTQ)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginTop: '2px' }}>
                    {formatUSD(avaluo.valorComercialUSD)} USD
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    Tipo de cambio oficial Banguat: {avaluo.tipoCambio || 7.62581}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>VALOR BANCARIO SUGERIDO (80%)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                    {formatQ(avaluo.valorBancarioGTQ)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                    {formatUSD(avaluo.valorBancarioUSD)} USD
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    Base estándar para otorgamiento de crédito hipotecario
                  </div>
                </div>
              </div>

              {/* Valuadores Autorizados */}
              <div className="form-section-title" style={{ marginTop: '2rem' }}>
                <ShieldCheck size={16} />
                <span>Profesionales Valuadores Autorizados</span>
              </div>
              <div className="form-grid-2">
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Valuador Principal</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d2847' }}>{avaluo.valuadorPrincipal || 'Lic. Aroldo Oliverio Ruiz Orozco'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>{avaluo.registroPrincipal || 'Valuador autorizado 2572-R-2026'}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Valuador Revisor</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d2847' }}>{avaluo.valuadorRevisor || 'Lic. Luis Felipe Tolaque Tobias'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>{avaluo.registroRevisor || 'Valuador autorizado 193-T-93'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERRENO & COLINDANCIAS */}
          {activeTab === 'terreno' && (
            <div>
              <div className="form-section-title">
                <MapPin size={16} />
                <span>Valoración de Terreno con Fincas y Varas Cuadradas</span>
              </div>

              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#0d2847', color: '#ffffff' }}>
                      <th style={{ color: '#ffffff' }}>FINCA</th>
                      <th style={{ color: '#ffffff' }}>ÁREA (m²)</th>
                      <th style={{ color: '#ffffff' }}>EQUIV. VARAS² (v²)</th>
                      <th style={{ color: '#ffffff' }}>UNIDAD</th>
                      <th style={{ color: '#ffffff' }}>VALOR UNITARIO</th>
                      <th style={{ color: '#ffffff' }}>SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fincas.map((f, i) => {
                      const area = Number(f.areaValuada || (avaluo.desgloseTerreno?.area / fincas.length) || 0);
                      const varas = parseFloat((area * 1.43115).toFixed(2));
                      const unit = Number(avaluo.desgloseTerreno?.valorUnitario || 0);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{f.finca}</td>
                          <td>{area.toFixed(2)}</td>
                          <td style={{ fontWeight: 600, color: '#1e40af' }}>{varas.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                          <td>m²</td>
                          <td>{formatQ(unit)}</td>
                          <td style={{ fontWeight: 700 }}>{formatQ(area * unit)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Colindancias */}
              <div className="form-section-title">
                <MapPin size={16} />
                <span>Colindancias Registrales</span>
              </div>
              <div className="form-grid-2">
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Norte:</strong> {avaluo.colindancias?.norte || 'S/D'}
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Sur:</strong> {avaluo.colindancias?.sur || 'S/D'}
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Este:</strong> {avaluo.colindancias?.este || 'S/D'}
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <strong>Oeste:</strong> {avaluo.colindancias?.oeste || 'S/D'}
                </div>
              </div>

              {/* DICABI Independiente */}
              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <Building size={16} />
                <span>Dirección de Catastro y Avalúo de Bienes Inmuebles (DICABI)</span>
              </div>
              <div className="form-grid-3">
                <div><strong>Matrícula:</strong> {avaluo.dicabiMatricula || 'Pendiente'}</div>
                <div><strong>Titular:</strong> {avaluo.dicabiNombre || avaluo.propietarioPrincipal}</div>
                <div><strong>Área Catastral:</strong> {avaluo.dicabiArea || `${avaluo.areaValuada} m²`}</div>
              </div>
            </div>
          )}

          {/* TAB 4: CONSTRUCCIÓN & SERVICIOS */}
          {activeTab === 'construccion' && (
            <div>
              <div className="form-section-title">
                <Building size={16} />
                <span>Características de Construcción</span>
              </div>
              <div className="form-grid-3">
                <div><strong>Edad Aproximada:</strong> {avaluo.construccion?.edadAprox || '5 años'}</div>
                <div><strong>Estado Actual:</strong> {avaluo.construccion?.estadoActual || 'Bueno'}</div>
                <div><strong>Apropiada Sector:</strong> {avaluo.construccion?.apropiadaSector || 'Sí'}</div>
              </div>

              <div style={{ margin: '0.75rem 0' }}>
                <strong>Distribución:</strong> {avaluo.construccion?.distribucion || 'Ambientes completos'}
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                <div><strong>Estructura:</strong> {avaluo.construccion?.estructura}</div>
                <div><strong>Paredes:</strong> {avaluo.construccion?.paredes}</div>
                <div><strong>Techo:</strong> {avaluo.construccion?.techoEntrePiso}</div>
              </div>

              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <FileText size={16} />
                <span>Servicios e Infraestructura Urbana</span>
              </div>
              <div className="form-grid-3" style={{ fontSize: '0.85rem' }}>
                <div><strong>Agua:</strong> {avaluo.servicios?.agua}</div>
                <div><strong>Drenaje Sanitario:</strong> {avaluo.servicios?.drenajeNegras}</div>
                <div><strong>Drenaje Pluvial:</strong> {avaluo.servicios?.drenajePluviales}</div>
                <div><strong>Electricidad:</strong> {avaluo.servicios?.energia}</div>
                <div><strong>Alumbrado:</strong> {avaluo.servicios?.alumbradoPublico}</div>
                <div><strong>Pavimento:</strong> {avaluo.servicios?.pavimentos}</div>
                <div><strong>Bordillos:</strong> {avaluo.servicios?.bordillos}</div>
                <div><strong>Aceras:</strong> {avaluo.servicios?.aceras}</div>
                <div><strong>Telefonía / Cable:</strong> {avaluo.servicios?.internetCable}</div>
              </div>

              {avaluo.serviciosAdicionales?.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Servicios Adicionales:</strong> {avaluo.serviciosAdicionales.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FOTOS & PDFS RGP */}
          {activeTab === 'fotos' && (
            <div>
              <div className="form-section-title">
                <Camera size={16} />
                <span>Álbum Fotográfico Oficial</span>
              </div>
              <div className="photos-grid">
                {[
                  { key: 'entorno', label: '1. Entorno' },
                  { key: 'ingreso', label: '2. Ingreso / Fachada' },
                  { key: 'interior', label: '3. Interior' },
                  { key: 'ubicacion', label: '4. Ubicación Satelital' },
                  { key: 'croquis', label: '5. Croquis / Plano' },
                  { key: 'dicabi', label: '6. Boleta DICABI' }
                ].map(({ key, label }) => (
                  <div key={key} className={`photo-slot-card ${avaluo.fotos?.[key] ? 'has-photo' : ''}`}>
                    {avaluo.fotos?.[key] ? (
                      <img src={avaluo.fotos[key]} alt={label} className="photo-slot-img" />
                    ) : (
                      <div className="pdf-photo-empty" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                        Sin foto ({label})
                      </div>
                    )}
                    <div className="photo-slot-footer">
                      <span className="photo-slot-category">{label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consultas Electrónicas RGP (PDFs) */}
              <div className="form-section-title" style={{ marginTop: '2rem' }}>
                <FileText size={16} />
                <span>Consultas Electrónicas del Registro General de la Propiedad (PDFs Adjuntos)</span>
              </div>
              {avaluo.consultasPdfs && avaluo.consultasPdfs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {avaluo.consultasPdfs.map((pdf, idx) => (
                    <div 
                      key={pdf.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} style={{ color: '#ef4444' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0d2847' }}>{pdf.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tamaño: {pdf.size}</div>
                        </div>
                      </div>
                      {pdf.dataUrl && (
                        <a 
                          href={pdf.dataUrl} 
                          download={pdf.name}
                          style={{
                            background: '#0d2847',
                            color: '#ffffff',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={13} /> Descargar
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  No se han adjuntado certificaciones electrónicas en PDF para este expediente.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DICTAMEN LEGAL LEX ROSAM */}
          {activeTab === 'legal' && (
            <div>
              <div className="form-section-title">
                <Scale size={16} />
                <span>Dictamen Bancario y Consideraciones Generales LEX ROSAM S.A.</span>
              </div>

              <div style={{ padding: '1.25rem', background: '#eff6ff', borderRadius: '8px', border: '1.5px solid #2563eb', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#1e40af' }}>Dictamen de Garantía Oficial:</strong>
                <p style={{ marginTop: '0.4rem', color: '#0f172a', fontStyle: 'italic', lineHeight: 1.5 }}>
                  “El inmueble evaluado reúne las condiciones necesarias para ser aceptado como garantía. La entidad financiera determinará los términos y políticas aplicables al otorgamiento del crédito correspondiente.” Tomar en cuenta: observaciones, notas y recomendaciones.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                <p><strong>I.</strong> El bien valuado puede ser considerado como sujeto de garantía.</p>
                <p><strong>II.</strong> El presente avalúo se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe.</p>
                <p><strong>III.</strong> El informe se emite con fines informativos de garantía crediticia.</p>
                <p><strong>IV.</strong> Datos registrales verificados mediante consulta electrónica oficial del Registro de la Propiedad.</p>
                <p><strong>V.</strong> LEX ROSAM S.A. es una entidad independiente y no mantiene vínculo con las partes intervinientes.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar Ficha
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handlePrint}
            style={{ background: '#0d2847' }}
          >
            <Printer size={15} style={{ display: 'inline', marginRight: '5px' }} />
            Imprimir Formato Oficial (9 Páginas)
          </button>
        </div>
      </div>
    </div>
  );
}
