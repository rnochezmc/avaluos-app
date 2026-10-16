import React, { useState } from 'react';
import { 
  X, Printer, Edit3, MapPin, Building, Calendar, Sparkles, 
  CheckCircle, FileText, Camera, DollarSign, Scale, ExternalLink 
} from 'lucide-react';

export default function AvaluoDetailModal({ avaluo, onClose, onEdit, onPrint }) {
  const [activeTab, setActiveTab] = useState('registral');

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header with Cverde Branding */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="brand-logo-icon" style={{ width: 34, height: 34 }}>
              <Building size={20} />
            </div>
            <div>
              <h2>EXPEDIENTE DE AVALÚO: {avaluo.codigo}</h2>
              <div className="modal-header-sub">
                C VERDE S.A. | {avaluo.solicitante} | {avaluo.tipoAvaluo}
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
              <span className="desktop-only">Imprimir</span>
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

        {/* Modal Tabs Navigation */}
        <div style={{ padding: '0 1.5rem', backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
          <div className="modal-tabs" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'registral' ? 'active' : ''}`}
              onClick={() => setActiveTab('registral')}
            >
              <FileText size={16} />
              <span>1. Registral & General</span>
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
              <span>3. Terreno & Servicios</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'construccion' ? 'active' : ''}`}
              onClick={() => setActiveTab('construccion')}
            >
              <Building size={16} />
              <span>4. Construcción & Desglose</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
              onClick={() => setActiveTab('fotos')}
            >
              <Camera size={16} />
              <span>5. Fotografías & Anexos</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'legal' ? 'active' : ''}`}
              onClick={() => setActiveTab('legal')}
            >
              <Scale size={16} />
              <span>6. Dictamen Bancario</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body">
          {/* TAB 1: INFORMACIÓN GENERAL Y REGISTRAL */}
          {activeTab === 'registral' && (
            <div>
              <div className="form-section-title">
                <FileText size={16} />
                <span>Datos Generales de la Solicitud</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <span className="form-label">Entidad Solicitante</span>
                  <div style={{ fontWeight: 600 }}>{avaluo.solicitante}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Fecha de Solicitud</span>
                  <div>{avaluo.fechaSolicitud || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Fecha de Actualización</span>
                  <div style={{ fontWeight: 600, color: 'var(--cverde-primary)' }}>{avaluo.fechaActualizacion || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Tipo de Avalúo</span>
                  <div>{avaluo.tipoAvaluo}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">DPI Solicitante / Propietario</span>
                  <div>{avaluo.dpi || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Coordenadas GPS</span>
                  <div>
                    {avaluo.coordenadas ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(avaluo.coordenadas)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--cverde-accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        {avaluo.coordenadas} <ExternalLink size={12} />
                      </a>
                    ) : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: '0.85rem' }}>
                <span className="form-label">Dirección del Inmueble</span>
                <div style={{ fontWeight: 500 }}>{avaluo.direccion}</div>
              </div>

              <div className="form-field" style={{ marginTop: '0.85rem' }}>
                <span className="form-label">Descripción General del Inmueble</span>
                <p style={{ color: 'var(--slate-700)', lineHeight: 1.5 }}>
                  {avaluo.descripcionGeneral || 'Sin descripción detallada.'}
                </p>
              </div>

              {/* Información Registral - Fincas */}
              <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                <Scale size={16} />
                <span>Información Registral (Registro General de la Propiedad)</span>
              </div>
              <div className="table-container" style={{ margin: '0.75rem 0' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Finca</th>
                      <th>Folio</th>
                      <th>Libro</th>
                      <th>Propietario Registrado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avaluo.fincas?.map((f, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{f.finca}</td>
                        <td>{f.folio}</td>
                        <td>{f.libro}</td>
                        <td>{f.propietario || avaluo.propietarioPrincipal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen de Áreas */}
              <div className="form-section-title" style={{ marginTop: '1.25rem' }}>
                <span>Cuadro Comparativo de Áreas</span>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Original Registrada</th>
                      <th>Desmembrada</th>
                      <th>Actual Registrada</th>
                      <th>Área Física</th>
                      <th>Área Valuada (Sujeta a Garantía)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{avaluo.areaRegistrada || 0} m²</td>
                      <td>{avaluo.areaDesmembrada || 0} m²</td>
                      <td>{avaluo.areaActualRegistrada || 0} m²</td>
                      <td>{avaluo.areaFisica || 0} m²</td>
                      <td style={{ fontWeight: 800, color: 'var(--cverde-primary)' }}>
                        {avaluo.areaValuada || 0} m²
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Limitaciones y Aspectos Legales */}
              <div className="form-section-title" style={{ marginTop: '1.25rem' }}>
                <span>Limitaciones y Gravámenes Registrales</span>
              </div>
              <div className="form-grid-2">
                <div className="form-field">
                  <span className="form-label">Anotaciones y Gravámenes</span>
                  <div style={{ color: 'var(--slate-700)' }}>{avaluo.gravamenes || 'Sin gravámenes inscritos'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Servidumbres</span>
                  <div style={{ color: 'var(--slate-700)' }}>{avaluo.servidumbres || 'Sin servidumbres'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Áreas Comunes</span>
                  <div style={{ color: 'var(--slate-700)' }}>{avaluo.areasComunes || 'No aplica'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Desmembraciones</span>
                  <div style={{ color: 'var(--slate-700)' }}>{avaluo.desmembracion || 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VALORES Y DICTAMEN DE VALUADORES */}
          {activeTab === 'valores' && (
            <div>
              <div className="form-section-title">
                <DollarSign size={16} />
                <span>Certificación de Valores Concluidos</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: 'var(--cverde-light-bg)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--cverde-accent)' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--cverde-primary)', fontWeight: 700 }}>
                    Valor Comercial Estimado
                  </div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--cverde-primary)', margin: '0.25rem 0' }}>
                    {formatQ(avaluo.valorComercialGTQ)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                    {formatUSD(avaluo.valorComercialUSD)} (USD)
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--slate-300)' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--slate-600)', fontWeight: 700 }}>
                    Valor Bancario / Garantía
                  </div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--slate-800)', margin: '0.25rem 0' }}>
                    {formatQ(avaluo.valorBancarioGTQ)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                    {formatUSD(avaluo.valorBancarioUSD)} (USD)
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.85rem' }}>
                <strong>Tipo de Cambio Oficial:</strong> {avaluo.tipoCambio || '7.62581'} según Banco de Guatemala.
                <p style={{ marginTop: '0.5rem', color: 'var(--slate-700)', fontStyle: 'italic' }}>
                  "A juicio del suscrito valuador con fecha {avaluo.fechaActualizacion || '2026'}, el inmueble descrito tiene un valor comercial de {formatQ(avaluo.valorComercialGTQ)} o al cambio en dólares al {formatUSD(avaluo.valorComercialUSD)}."
                </p>
              </div>

              {/* Cuadro de Valuadores Autorizados */}
              <div className="form-section-title" style={{ marginTop: '2rem' }}>
                <CheckCircle size={16} />
                <span>Valuadores Autorizados Responsables</span>
              </div>
              <div className="form-grid-2">
                <div style={{ padding: '1.25rem', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--white)' }}>
                  <div style={{ height: 40, borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}></div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{avaluo.valuadorPrincipal || 'Lic. Aroldo Oliverio Ruiz Orozco'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cverde-accent)', fontWeight: 600 }}>
                    {avaluo.registroPrincipal || 'Valuador autorizado 2572-R-2026'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>C VERDE S.A.</div>
                </div>

                <div style={{ padding: '1.25rem', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--white)' }}>
                  <div style={{ height: 40, borderBottom: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}></div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{avaluo.valuadorRevisor || 'Lic. Luis Felipe Tolaque Tobias'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cverde-accent)', fontWeight: 600 }}>
                    {avaluo.registroRevisor || 'Valuador autorizado 193-T-93'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Valuador Revisor Autorizado</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TERRENO, DICABI Y SERVICIOS */}
          {activeTab === 'terreno' && (
            <div>
              <div className="form-section-title">
                <MapPin size={16} />
                <span>Dirección de Catastro y Avalúo de Bienes Inmuebles (DICABI)</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <span className="form-label">Nombre Registrado DICABI</span>
                  <div style={{ fontWeight: 600 }}>{avaluo.dicabiNombre || avaluo.propietarioPrincipal}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Matrícula DICABI</span>
                  <div style={{ fontWeight: 700, color: 'var(--cverde-primary)' }}>{avaluo.dicabiMatricula || 'Pendiente'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Área según Matrícula</span>
                  <div>{avaluo.dicabiArea || `${avaluo.areaValuada || 0} m²`}</div>
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                <span>Detalles Físicos del Terreno y Entorno</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <span className="form-label">Sector</span>
                  <div>{avaluo.sector || 'Urbano'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Uso de Suelo</span>
                  <div>{avaluo.usoSuelo || 'Comercial'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Nivel Socioeconómico</span>
                  <div>{avaluo.nivelSocioeconomico || 'Medio'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Forma del Terreno</span>
                  <div>{avaluo.formaTerreno || 'Regular'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Topografía / Pendiente</span>
                  <div>{avaluo.pendiente || 'Plana'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Ubicación de Esquina</span>
                  <div>{avaluo.esquina || 'No'}</div>
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                <span>Colindancias Físicas</span>
              </div>
              <div className="form-grid-2">
                <div className="form-field">
                  <span className="form-label">Norte</span>
                  <div>{avaluo.colindancias?.norte || 'S/D'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Sur</span>
                  <div>{avaluo.colindancias?.sur || 'S/D'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Este</span>
                  <div>{avaluo.colindancias?.este || 'S/D'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Oeste</span>
                  <div>{avaluo.colindancias?.oeste || 'S/D'}</div>
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                <span>Infraestructura y Servicios Disponibles</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <span className="form-label">Drenaje de Aguas Negras</span>
                  <div>{avaluo.servicios?.drenajeNegras || 'Sí'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Drenaje Pluvial</span>
                  <div>{avaluo.servicios?.drenajePluviales || 'Sí'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Servicio de Agua</span>
                  <div>{avaluo.servicios?.agua || 'Sí'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Energía Eléctrica</span>
                  <div>{avaluo.servicios?.energia || 'Sí'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Pavimentos</span>
                  <div>{avaluo.servicios?.pavimentos || 'Asfalto'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Garita y Seguridad</span>
                  <div>{avaluo.servicios?.garita || 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONSTRUCCIÓN Y DESGLOSE MATEMÁTICO */}
          {activeTab === 'construccion' && (
            <div>
              <div className="form-section-title">
                <Building size={16} />
                <span>Características Constructivas</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <span className="form-label">Edad Aproximada</span>
                  <div>{avaluo.construccion?.edadAprox || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Estado de Conservación</span>
                  <div style={{ fontWeight: 600, color: 'var(--cverde-primary)' }}>
                    {avaluo.construccion?.estadoActual || 'Bueno'}
                  </div>
                </div>
                <div className="form-field">
                  <span className="form-label">Estructura Principal</span>
                  <div>{avaluo.construccion?.estructura || 'Concreto armado'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Paredes / Muros</span>
                  <div>{avaluo.construccion?.paredes || 'Block pómez visto/alisado'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Techo y Entrepiso</span>
                  <div>{avaluo.construccion?.techoEntrePiso || 'Losa de concreto'}</div>
                </div>
                <div className="form-field">
                  <span className="form-label">Pisos</span>
                  <div>{avaluo.construccion?.piso || 'Cerámica'}</div>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: '0.85rem' }}>
                <span className="form-label">Distribución de Ambientes</span>
                <p style={{ color: 'var(--slate-700)' }}>{avaluo.construccion?.distribucion || 'Ambientes estándar'}</p>
              </div>

              <div className="form-grid-2" style={{ marginTop: '1rem' }}>
                <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                  <strong style={{ color: '#065f46', fontSize: '0.82rem' }}>Factores Positivos:</strong>
                  <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem' }}>
                    {avaluo.construccion?.factoresPositivos || 'Buena plusvalía y demanda en la zona.'}
                  </p>
                </div>
                <div style={{ padding: '0.85rem', background: '#fff1f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecdd3' }}>
                  <strong style={{ color: '#9f1239', fontSize: '0.82rem' }}>Factores Negativos:</strong>
                  <p style={{ fontSize: '0.85rem', color: '#be123c', marginTop: '0.25rem' }}>
                    {avaluo.construccion?.factoresNegativos || 'Ninguno relevante identificado.'}
                  </p>
                </div>
              </div>

              {/* Desglose Matemático Oficial (Página 7 del PDF) */}
              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <DollarSign size={16} />
                <span>Cuadro de Valoración Matemático Oficial</span>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Área</th>
                      <th>Unidad</th>
                      <th>Valor Unitario (Q)</th>
                      <th>Total Parcial (Q)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>TERRENO</td>
                      <td>{avaluo.desgloseTerreno?.area || avaluo.areaValuada || 0}</td>
                      <td>{avaluo.desgloseTerreno?.unidad || 'm²'}</td>
                      <td>{formatQ(avaluo.desgloseTerreno?.valorUnitario)}</td>
                      <td style={{ fontWeight: 700 }}>{formatQ(avaluo.desgloseTerreno?.total)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>CONSTRUCCIÓN</td>
                      <td>{avaluo.desgloseConstruccion?.area || 0}</td>
                      <td>{avaluo.desgloseConstruccion?.unidad || 'm²'}</td>
                      <td>{formatQ(avaluo.desgloseConstruccion?.valorUnitario)}</td>
                      <td style={{ fontWeight: 700 }}>{formatQ(avaluo.desgloseConstruccion?.total)}</td>
                    </tr>
                    <tr style={{ background: 'var(--cverde-light-bg)' }}>
                      <td colSpan={4} style={{ fontWeight: 800, textAlign: 'right', color: 'var(--cverde-primary)' }}>
                        VALOR COMERCIAL TOTAL:
                      </td>
                      <td style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--cverde-primary)' }}>
                        {formatQ(avaluo.valorComercialGTQ)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FOTOGRAFÍAS Y ANEXOS */}
          {activeTab === 'fotos' && (
            <div>
              <div className="form-section-title">
                <Camera size={16} />
                <span>Álbum Fotográfico Clasificado (Página 8 del PDF)</span>
              </div>
              <div className="photos-grid">
                <div className="photo-slot-card has-photo">
                  <img src={avaluo.fotos?.entorno} alt="1. Entorno" className="photo-slot-img" />
                  <div className="photo-slot-footer">
                    <span className="photo-slot-category">1. Entorno</span>
                  </div>
                </div>

                <div className="photo-slot-card has-photo">
                  <img src={avaluo.fotos?.ingreso} alt="2. Ingreso" className="photo-slot-img" />
                  <div className="photo-slot-footer">
                    <span className="photo-slot-category">2. Ingreso / Fachada</span>
                  </div>
                </div>

                <div className="photo-slot-card has-photo">
                  <img src={avaluo.fotos?.interior} alt="3. Interior" className="photo-slot-img" />
                  <div className="photo-slot-footer">
                    <span className="photo-slot-category">3. Interior Inmueble</span>
                  </div>
                </div>

                <div className="photo-slot-card has-photo">
                  <img src={avaluo.fotos?.ubicacion} alt="4. Ubicación" className="photo-slot-img" />
                  <div className="photo-slot-footer">
                    <span className="photo-slot-category">4. Ubicación Satelital</span>
                  </div>
                </div>

                <div className="photo-slot-card has-photo">
                  <img src={avaluo.fotos?.croquis} alt="5. Croquis" className="photo-slot-img" />
                  <div className="photo-slot-footer">
                    <span className="photo-slot-category">5. Croquis / Plano</span>
                  </div>
                </div>

                <div className="photo-slot-card has-photo">
                  <img src={avaluo.fotos?.dicabi} alt="6. Boleta DICABI / RGP" className="photo-slot-img" />
                  <div className="photo-slot-footer">
                    <span className="photo-slot-category">6. Matrícula DICABI</span>
                  </div>
                </div>
              </div>

              {/* AI Teaser Banner for Phase 2 */}
              <div className="ai-teaser-banner">
                <div className="ai-teaser-content">
                  <h4>
                    <Sparkles size={18} style={{ color: '#fbbf24' }} />
                    Módulo de Inteligencia Artificial (Fase 2)
                    <span className="ai-badge">Próximamente</span>
                  </h4>
                  <p>
                    Haroldo podrá subir fotos del informe RGP o boleta DICABI y la IA auto-completará 
                    automáticamente los números de Finca, Folio, Libro y redactará la descripción técnica del inmueble.
                  </p>
                </div>
                <button type="button" className="ai-teaser-btn" onClick={() => alert('Este módulo será habilitado en la Fase 2 del proyecto como servicio de valor agregado.')}>
                  Conocer más
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: DICTAMEN Y CONDICIONES BANCARIAS */}
          {activeTab === 'legal' && (
            <div>
              <div className="form-section-title">
                <Scale size={16} />
                <span>Calificación de Garantía y Consideraciones Generales del Informe</span>
              </div>

              <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--cverde-accent)', marginBottom: '1.25rem' }}>
                <strong style={{ color: 'var(--cverde-primary)' }}>Conclusión Oficial:</strong>
                <p style={{ marginTop: '0.4rem', color: 'var(--slate-800)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  “El inmueble evaluado reúne las condiciones necesarias para ser aceptado como garantía. La entidad financiera determinará los términos y políticas aplicables al otorgamiento del crédito correspondiente.” Tomar en cuenta: observaciones, notas y recomendaciones.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                <p><strong>I.</strong> El bien valuado puede ser considerado como sujeto de garantía. La institución financiera correspondiente definirá las condiciones de crédito y los riesgos a asumir.</p>
                <p><strong>II.</strong> El presente avalúo se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe, circunscrita a las condiciones específicas detalladas en el informe.</p>
                <p><strong>III.</strong> El presente avalúo se emite únicamente con fines informativos y no genera obligación alguna, ni confiere autorización o prohibición respecto de operaciones o transacciones.</p>
                <p><strong>IV.</strong> Los datos registrales que sustentan este avalúo fueron obtenidos a través de la consulta realizada en la plataforma electrónica del Registro de la Propiedad (RGP).</p>
                <p><strong>V.</strong> Cverde S.A. es una entidad independiente y no mantiene vínculo alguno con las personas físicas o jurídicas que solicitan el presente informe.</p>
                <p><strong>VI.</strong> Certificación de valor tomando como referencia inspección física y antecedentes técnicos.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar Ficha
          </button>
          <button type="button" className="btn-primary" onClick={handlePrint}>
            <Printer size={15} style={{ display: 'inline', marginRight: '5px' }} />
            Imprimir Formato Oficial
          </button>
        </div>
      </div>
    </div>
  );
}
