import React from 'react';
import { X, Printer, ArrowLeft, FileText, Download, ExternalLink } from 'lucide-react';

export default function OfficialReportPrintView({ avaluo, onClose, config = {} }) {
  if (!avaluo) return null;

  // Official LEX ROSAM S.A. Branding
  const company = {
    name: config.name || "LEX ROSAM",
    tagline: config.tagline || "SOCIEDAD ANÓNIMA — AVALÚOS",
    phone: config.phone || "+502 6203-0795",
    emails: config.emails || "solicituddeavaluos@lexrosam.com",
    website: config.website || "https://lexrosam.com/",
    navyColor: "#0d2847",
    accentColor: "#1e40af"
  };

  const formatQ = (val) => {
    return 'Q. ' + Number(val || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };

  // Reusable Page Header with Official Lex Rosam Logo
  const PageHeader = () => (
    <div className="pdf-page-header" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img 
          src="/lex-rosam-logo.png" 
          alt="LEX ROSAM S.A." 
          style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
        />
      </div>
      <div className="pdf-header-code" style={{ fontSize: '0.95rem', fontWeight: 800, color: company.navyColor }}>
        AVALÚO: {avaluo.codigo}
      </div>
    </div>
  );

  // Reusable Page Footer matching Lex Rosam Standard
  const PageFooter = ({ pageNum }) => (
    <div className="pdf-page-footer" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.4rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#475569' }}>
      {pageNum && (
        <div style={{ fontWeight: 700, borderBottom: '1.5px solid #0d2847', padding: '0 6px', color: '#0d2847' }}>
          {pageNum}
        </div>
      )}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📞 WhatsApp:</span> <strong>{company.phone}</strong>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>✉️ Correo:</span> <strong>{company.emails}</strong>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>🌐</span> <strong>{company.website}</strong>
        </span>
      </div>
    </div>
  );

  // Fallback fincas array
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
    <div className="print-modal-overlay">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="print-control-bar no-print" style={{ background: '#07172b', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="print-control-left">
          <button type="button" className="print-btn-secondary" onClick={onClose}>
            <ArrowLeft size={16} /> Volver
          </button>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Vista Previa de Impresión Oficial LEX ROSAM (9 Páginas)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
              Expediente: {avaluo.codigo} — Formato Oficial para Bancos e Instituciones Financieras
            </span>
          </div>
        </div>
        <div className="print-control-right">
          <button type="button" className="print-btn-primary" onClick={handlePrint} style={{ background: '#2563eb' }}>
            <Printer size={18} />
            <span>Imprimir / Exportar PDF</span>
          </button>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* The Printable 9-Page Document Container */}
      <div className="official-document-sheet-container">
        
        {/* ==============================================================
            PÁGINA 1: SOLICITUD, IDENTIFICACIÓN Y RESÚMENES REGISTRALES
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />
          
          <div className="pdf-sheet-content">
            <div className="pdf-title-line" style={{ color: company.navyColor, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              <strong>TIPO DE AVALÚO:</strong> {avaluo.tipoAvaluo}
            </div>

            <div className="pdf-boxed-table">
              <div className="pdf-data-row">
                <span className="pdf-data-label">Solicitante:</span>
                <span className="pdf-data-value"><strong>{avaluo.solicitante}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Fecha de solicitud:</span>
                <span className="pdf-data-value">{avaluo.fechaSolicitud || 'N/A'}</span>
              </div>
              <div className="pdf-data-row" style={{ background: '#f8fafc' }}>
                <span className="pdf-data-label">Fecha de inspección:</span>
                <span className="pdf-data-value"><strong>{avaluo.fechaInspeccion || avaluo.fechaActualizacion || 'N/A'}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Fecha de actualización:</span>
                <span className="pdf-data-value">{avaluo.fechaActualizacion || 'N/A'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Dirección del inmueble:</span>
                <span className="pdf-data-value">{avaluo.direccion}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Ubicación según coordenadas:</span>
                <span className="pdf-data-value">{avaluo.coordenadas || 'N/A'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Descripción general del inmueble:</span>
                <span className="pdf-data-value">{avaluo.descripcionGeneral || 'N/A'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Bien mostrado por:</span>
                <span className="pdf-data-value">{avaluo.bienMostradoPor || 'N/A'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Dpi:</span>
                <span className="pdf-data-value">{avaluo.dpi || 'N/A'}</span>
              </div>
            </div>

            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '1rem', textAlign: 'center', padding: '0.35rem', fontWeight: 700, fontSize: '0.85rem' }}>
              RESÚMENES
            </div>

            {/* Cuadro de Información Registral con Áreas Individuales por Finca */}
            <div className="pdf-boxed-table" style={{ marginTop: '0.6rem' }}>
              <div className="pdf-subtable-header" style={{ background: '#f1f5f9', fontWeight: 700, padding: '0.4rem', borderBottom: '1px solid #cbd5e1' }}>
                INFORMACIÓN REGISTRAL
              </div>
              <table className="pdf-inner-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%' }}>FINCA</th>
                    <th style={{ width: '30%' }}>FOLIO</th>
                    <th>LIBRO</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.finca}</td>
                      <td>{f.folio}</td>
                      <td>{f.libro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: '0.4rem 0.6rem', borderTop: '1px solid #64748b', fontWeight: 700, background: '#f8fafc', fontSize: '0.82rem' }}>
                Propietario:
              </div>
              <table className="pdf-inner-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%' }}>FINCA</th>
                    <th>Propietario</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.finca}</td>
                      <td>{f.propietario || avaluo.propietarioPrincipal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CORRECCIÓN FOTOS 64 & 65: Cada finca muestra su propia área registrada y valuada individualmente */}
              <div style={{ padding: '0.4rem 0.6rem', borderTop: '1px solid #64748b', fontWeight: 700, background: '#f8fafc', fontSize: '0.82rem' }}>
                Área registrada:
              </div>
              <table className="pdf-inner-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%' }}>FINCA</th>
                    <th>Área</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.finca}</td>
                      <td>{Number(f.areaRegistrada || f.areaActualRegistrada || avaluo.areaRegistrada || 0).toFixed(2)} m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: '0.4rem 0.6rem', borderTop: '1px solid #64748b', fontWeight: 700, background: '#f8fafc', fontSize: '0.82rem' }}>
                Área valuada:
              </div>
              <table className="pdf-inner-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%' }}>FINCA</th>
                    <th>Área</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.finca}</td>
                      <td style={{ fontWeight: 600, color: company.navyColor }}>
                        {Number(f.areaValuada || (avaluo.areaValuada / fincas.length) || 0).toFixed(2)} m²
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PageFooter pageNum={1} />
        </section>

        {/* ==============================================================
            PÁGINA 2: LIMITACIONES, VALORES Y FIRMAS DE VALUADORES
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-boxed-table">
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.4rem' }}>
                LIMITACIONES
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Anotaciones y gravámenes:</span>
                <span className="pdf-data-value">{avaluo.gravamenes || 'Ninguna'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Servidumbres:</span>
                <span className="pdf-data-value">{avaluo.servidumbres || 'Ninguna'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Áreas comunes:</span>
                <span className="pdf-data-value">{avaluo.areasComunes || 'No'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Desmembración:</span>
                <span className="pdf-data-value">{avaluo.desmembracion || 'No'}</span>
              </div>
            </div>

            {/* Cuadro de Valores Oficiales */}
            <div className="pdf-boxed-table" style={{ marginTop: '1.5rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.4rem' }}>
                VALORES
              </div>
              <table className="pdf-inner-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '45%' }}>CONCEPTO</th>
                    <th style={{ textAlign: 'right' }}>QUETZALES</th>
                    <th style={{ textAlign: 'right' }}>DÓLARES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>VALOR COMERCIAL</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: company.navyColor }}>{formatQ(avaluo.valorComercialGTQ)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: company.accentColor }}>{formatUSD(avaluo.valorComercialUSD)}</td>
                  </tr>
                  <tr>
                    <td><strong>VALOR BANCARIO</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQ(avaluo.valorBancarioGTQ)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatUSD(avaluo.valorBancarioUSD)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ padding: '0.8rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                <p>
                  <strong>Tipo de cambio {avaluo.tipoCambio || '7.62581'}</strong>, según Banco de Guatemala.
                </p>
                {/* CORRECCIÓN FOTO 66: Se eliminó el texto entre paréntesis a petición de Haroldo */}
                <p style={{ marginTop: '0.5rem', textAlign: 'justify' }}>
                  A juicio del suscrito valuador con fecha {avaluo.fechaActualizacion || '2026'}, el inmueble descrito tiene un valor comercial 
                  de <strong>{formatQ(avaluo.valorComercialGTQ)}</strong> o al cambio en dólares al <strong>{formatUSD(avaluo.valorComercialUSD)}</strong>.
                </p>
              </div>
            </div>

            {/* Firmas de los Valuadores Autorizados */}
            <div className="pdf-signatures-container" style={{ marginTop: '3rem' }}>
              <div className="pdf-signature-block">
                <div className="pdf-signature-line" style={{ borderTop: '1.5px solid #0d2847' }}></div>
                <div className="pdf-sig-name" style={{ fontWeight: 700, color: '#0d2847' }}>{avaluo.valuadorRevisor || 'Lic. Luis Felipe Tolaque Tobias'}</div>
                <div className="pdf-sig-role" style={{ fontSize: '0.75rem', color: '#64748b' }}>{avaluo.registroRevisor || 'Valuador autorizado 193-T-93'}</div>
              </div>

              <div className="pdf-signature-block">
                <div className="pdf-signature-line" style={{ borderTop: '1.5px solid #0d2847' }}></div>
                <div className="pdf-sig-name" style={{ fontWeight: 700, color: '#0d2847' }}>{avaluo.valuadorPrincipal || 'Lic. Aroldo Oliverio Ruiz Orozco'}</div>
                <div className="pdf-sig-role" style={{ fontSize: '0.75rem', color: '#64748b' }}>{avaluo.registroPrincipal || 'Valuador autorizado 2572-R-2026'}</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={2} />
        </section>

        {/* ==============================================================
            PÁGINA 3: CALIFICACIÓN DE GARANTÍA Y CONSIDERACIONES
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: '2px solid #0d2847', paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
              CALIFICACION DE GARANTIA Y CONSIDERACIONES GENERALES DEL PRESENTE INFORME
            </div>

            {/* CORRECCIÓN FOTO 67: Se eliminó la cláusula VI destructiva a solicitud de Haroldo */}
            <ol className="pdf-legal-considerations" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
              <li style={{ marginBottom: '1rem' }}>
                <strong>I.</strong> El bien valuado puede ser considerado como sujeto de garantía. La institución financiera correspondiente definirá las condiciones de crédito y los riesgos a asumir. Se recomienda revisar los aspectos negativos y riesgos señalados en los anexos.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>II.</strong> El presente avalúo se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe, circunscrita a las condiciones específicas detalladas en el informe y al marco de mercado vigente al momento de su elaboración. Se advierte que los valores y conclusiones aquí expresados están sujetos a variaciones futuras derivadas de cambios en las dinámicas del mercado, modificaciones en la situación legal del inmueble o actualizaciones en los registros públicos que puedan incidir en su valoración.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>III.</strong> El presente avalúo se emite únicamente con fines informativos y no genera obligación alguna, ni confiere autorización o prohibición respecto de operaciones o transacciones. Las decisiones que se adopten a partir de este documento serán responsabilidad exclusiva del solicitante, del propietario y de las demás partes que intervengan en dichas gestiones.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>IV.</strong> Los datos registrales que sustentan este avalúo fueron obtenidos a través de la consulta realizada en la plataforma electrónica del Registro de la Propiedad, y su validez se circunscribe exclusivamente a la fecha consignada en el presente informe. En consecuencia, cualquier verificación o contraste de la información aquí contenida deberá efectuarse directamente en el Registro de la Propiedad, como fuente oficial y competente para certificar la situación jurídica del inmueble.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>V.</strong> {company.name} S.A. es una entidad independiente y no mantiene vínculo alguno con las personas físicas o jurídicas que solicitan el presente informe.
              </li>
            </ol>
          </div>

          <PageFooter pageNum={3} />
        </section>

        {/* ==============================================================
            PÁGINA 4: INFORMACIÓN DE LA PROPIEDAD, RGP, IUSI Y TABLA DE ÁREAS
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: '2px solid #0d2847', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              INFORMACION DE LA PROPIEDAD
            </div>

            <div className="pdf-boxed-table">
              <table className="pdf-inner-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th>FINCA</th>
                    <th>FOLIO</th>
                    <th>LIBRO</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.finca}</td>
                      <td>{f.folio}</td>
                      <td>{f.libro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pdf-data-row">
                <span className="pdf-data-label">Fecha de consulta a distancia:</span>
                <span className="pdf-data-value">{avaluo.fechaActualizacion}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Propietario:</span>
                <span className="pdf-data-value"><strong>{avaluo.propietarioPrincipal}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Dirección según el RGP:</span>
                <span className="pdf-data-value">{avaluo.direccion}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Dirección física o catastral:</span>
                <span className="pdf-data-value">{avaluo.direccion}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Dirección según IUSI:</span>
                <span className="pdf-data-value">{avaluo.dicabiDireccion || 'N/A'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Nota:</span>
                <span className="pdf-data-value">Inmueble plenamente identificado en inspección física de campo.</span>
              </div>
            </div>

            {/* CORRECCIÓN FOTO 69: Muestra TODAS las fincas con su columna de Desmembradas y resta */}
            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '1.25rem', padding: '0.35rem', fontWeight: 700 }}>
              ÁREA
            </div>

            <table className="pdf-inner-table" style={{ border: '1px solid #64748b', marginTop: '0.5rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th>FINCA</th>
                  <th>Original registrada</th>
                  <th>Desmembrada</th>
                  <th>Actual Registrada</th>
                  <th>Física</th>
                  <th>Valuada</th>
                </tr>
              </thead>
              <tbody>
                {fincas.map((f, i) => {
                  const orig = Number(f.areaRegistrada || 0);
                  const desm = Number(f.areaDesmembrada || 0);
                  const act = f.areaActualRegistrada !== undefined ? Number(f.areaActualRegistrada) : Math.max(0, orig - desm);
                  const fis = Number(f.areaFisica || orig);
                  const val = Number(f.areaValuada || act);

                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.finca}</td>
                      <td>{orig.toFixed(2)} m²</td>
                      <td style={{ color: desm > 0 ? '#b91c1c' : 'inherit' }}>{desm.toFixed(2)} m²</td>
                      <td style={{ fontWeight: 600 }}>{act.toFixed(2)} m²</td>
                      <td>{fis.toFixed(2)} m²</td>
                      <td style={{ fontWeight: 700, color: company.navyColor }}>{val.toFixed(2)} m²</td>
                    </tr>
                  );
                })}
                {fincas.length > 1 && (
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #0d2847' }}>
                    <td>TOTAL:</td>
                    <td>{Number(avaluo.areaRegistrada || 0).toFixed(2)} m²</td>
                    <td style={{ color: '#b91c1c' }}>{Number(avaluo.areaDesmembrada || 0).toFixed(2)} m²</td>
                    <td>{Number(avaluo.areaActualRegistrada || 0).toFixed(2)} m²</td>
                    <td>{Number(avaluo.areaFisica || 0).toFixed(2)} m²</td>
                    <td style={{ color: company.navyColor }}>{Number(avaluo.areaValuada || 0).toFixed(2)} m²</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* CORRECCIÓN FOTO 70: Textos largos en Aspectos Legales */}
            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '1.25rem', padding: '0.35rem', fontWeight: 700 }}>
              ASPECTOS LEGALES
            </div>
            <div className="pdf-boxed-table" style={{ marginTop: '0.5rem' }}>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Limitaciones o servidumbres:</span>
                <span className="pdf-data-value">{avaluo.limitaciones || avaluo.servidumbres || 'Sin servidumbres'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Anotación:</span>
                <span className="pdf-data-value">{avaluo.anotaciones || 'Ninguna vigente'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Gravámenes:</span>
                <span className="pdf-data-value">{avaluo.gravamenes || 'Libre de gravámenes'}</span>
              </div>
            </div>
          </div>

          <PageFooter pageNum={4} />
        </section>

        {/* ==============================================================
            PÁGINA 5: DICABI, DETALLES DEL TERRENO Y COLINDANCIAS
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            {/* CORRECCIÓN FOTO 71: Sección DICABI independiente del RGP */}
            <div className="pdf-boxed-table">
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.4rem' }}>
                DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI)
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Nombre:</span>
                <span className="pdf-data-value"><strong>{avaluo.dicabiNombre || avaluo.propietarioPrincipal}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Dirección:</span>
                <span className="pdf-data-value">{avaluo.dicabiDireccion || avaluo.direccion}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Matricula:</span>
                <span className="pdf-data-value"><strong>{avaluo.dicabiMatricula || 'Pendiente'}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Área:</span>
                <span className="pdf-data-value">{avaluo.dicabiArea || `${avaluo.areaValuada || 0} m²`}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Observaciones:</span>
                <span className="pdf-data-value">{avaluo.dicabiObservaciones || 'Datos cotejados con el padrón fiscal catastral.'}</span>
              </div>
            </div>

            <div className="pdf-boxed-table" style={{ marginTop: '1.25rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.4rem' }}>
                DETALLES DEL TERRENO
              </div>
              
              <div style={{ padding: '0.4rem 0.6rem', fontWeight: 700, fontSize: '0.82rem', background: '#f1f5f9' }}>
                SECTOR
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Uso:</span>
                <span className="pdf-data-value">{avaluo.usoSuelo || 'Comercial'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Nivel socio económico:</span>
                <span className="pdf-data-value">{avaluo.nivelSocioeconomico || 'Medio-Alto'}</span>
              </div>

              <div style={{ padding: '0.4rem 0.6rem', fontWeight: 700, fontSize: '0.82rem', background: '#f1f5f9' }}>
                CARACTERÍSTICAS
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Forma:</span>
                <span className="pdf-data-value">{avaluo.formaTerreno || 'Regular'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Pendiente:</span>
                <span className="pdf-data-value">{avaluo.pendiente || 'Plana'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Ubicación de esquina:</span>
                <span className="pdf-data-value">{avaluo.esquina || 'No'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Desde la calle:</span>
                <span className="pdf-data-value">{avaluo.accesoCalle || 'Acceso directo'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Notas importantes:</span>
                <span className="pdf-data-value">Terreno firme, no inundable, sin fallas geológicas aparentes.</span>
              </div>
            </div>

            {/* CORRECCIÓN FOTO 73: Colindancias Norte, Sur, Este, Oeste */}
            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '1.25rem', padding: '0.35rem', fontWeight: 700 }}>
              COLINDANCIAS
            </div>
            <div className="pdf-boxed-table" style={{ marginTop: '0.4rem' }}>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Norte:</span>
                <span className="pdf-data-value">{avaluo.colindancias?.norte || 'S/D'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Sur:</span>
                <span className="pdf-data-value">{avaluo.colindancias?.sur || 'S/D'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Este:</span>
                <span className="pdf-data-value">{avaluo.colindancias?.este || 'S/D'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Oeste:</span>
                <span className="pdf-data-value">{avaluo.colindancias?.oeste || 'S/D'}</span>
              </div>
            </div>
          </div>

          <PageFooter pageNum={5} />
        </section>

        {/* ==============================================================
            PÁGINA 6: SERVICIOS Y CARACTERÍSTICAS DE CONSTRUCCIÓN
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            {/* CORRECCIÓN FOTO 74: Lista de servicios e infraestructura completa */}
            <div className="pdf-boxed-table">
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.4rem' }}>
                SERVICIOS
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Drenaje de Aguas Negras:</span>
                <span className="pdf-data-value">{avaluo.servicios?.drenajeNegras || 'Red municipal'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Drenaje Aguas Pluviales:</span>
                <span className="pdf-data-value">{avaluo.servicios?.drenajePluviales || 'Red pluvial'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Pavimentos:</span>
                <span className="pdf-data-value">{avaluo.servicios?.pavimentos || 'Asfalto'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Bordillos:</span>
                <span className="pdf-data-value">{avaluo.servicios?.bordillos || 'Concreto'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Aceras:</span>
                <span className="pdf-data-value">{avaluo.servicios?.aceras || 'Concreto'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Servicio de Agua:</span>
                <span className="pdf-data-value">{avaluo.servicios?.agua || 'Sí'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Servicio Telefónico:</span>
                <span className="pdf-data-value">{avaluo.servicios?.telefono || 'Sí'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Internet y cable:</span>
                <span className="pdf-data-value">{avaluo.servicios?.internetCable || 'Sí'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Servicio de Energía Eléctrica:</span>
                <span className="pdf-data-value">{avaluo.servicios?.energia || 'Sí'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Garita:</span>
                <span className="pdf-data-value">{avaluo.servicios?.garita || 'No'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Cámaras de video vigilancia:</span>
                <span className="pdf-data-value">{avaluo.servicios?.camaras || 'No'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Alumbrado Público:</span>
                <span className="pdf-data-value">{avaluo.servicios?.alumbradoPublico || 'Sí'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Tipo de calle:</span>
                <span className="pdf-data-value">{avaluo.servicios?.tipoCalle || 'Urbana'}</span>
              </div>
              {avaluo.serviciosAdicionales?.map((s, idx) => (
                <div key={idx} className="pdf-data-row">
                  <span className="pdf-data-label">Servicio adicional {idx + 1}:</span>
                  <span className="pdf-data-value"><strong>{s}</strong></span>
                </div>
              ))}
            </div>

            {/* Características de Construcción */}
            <div className="pdf-boxed-table" style={{ marginTop: '1.25rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.4rem' }}>
                CARACTERÍSTICAS DE CONSTRUCCIÓN
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Edad aproximada:</span>
                <span className="pdf-data-value">{avaluo.construccion?.edadAprox || '5 años'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Estado actual:</span>
                <span className="pdf-data-value"><strong>{avaluo.construccion?.estadoActual || 'Bueno'}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Construcciones apropiadas al sector:</span>
                <span className="pdf-data-value">{avaluo.construccion?.apropiadaSector || 'Sí'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Distribución:</span>
                <span className="pdf-data-value">{avaluo.construccion?.distribucion || 'Ambientes completos'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Estructura:</span>
                <span className="pdf-data-value">{avaluo.construccion?.estructura || 'Concreto armado y mampostería'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Paredes:</span>
                <span className="pdf-data-value">{avaluo.construccion?.paredes || 'Block pómez con repello y cernido'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Techo y entre piso:</span>
                <span className="pdf-data-value">{avaluo.construccion?.techoEntrePiso || 'Losa de concreto'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Piso:</span>
                <span className="pdf-data-value">{avaluo.construccion?.piso || 'Cerámico'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Puertas:</span>
                <span className="pdf-data-value">{avaluo.construccion?.puertas || 'Madera y metal'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Ventanas:</span>
                <span className="pdf-data-value">{avaluo.construccion?.ventanas || 'Aluminio y vidrio'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Instalación sanitaria:</span>
                <span className="pdf-data-value">{avaluo.construccion?.sanitaria || 'Artefactos estándar'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Instalación eléctrica:</span>
                <span className="pdf-data-value">{avaluo.construccion?.electrica || 'Instalación empotrada'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Factores positivos:</span>
                <span className="pdf-data-value">{avaluo.construccion?.factoresPositivos || 'Ubicación y estado de conservación'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Factores negativos:</span>
                <span className="pdf-data-value">{avaluo.construccion?.factoresNegativos || 'Ninguno de gravedad'}</span>
              </div>
            </div>
          </div>

          <PageFooter pageNum={6} />
        </section>

        {/* ==============================================================
            PÁGINA 7: DICTAMEN DE GARANTÍA Y TABLAS DE VALORACIÓN AZULES
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-dictamen-callout" style={{ borderLeft: '4px solid #0d2847', background: '#f8fafc', padding: '0.8rem', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              “El inmueble evaluado reúne las condiciones necesarias para ser aceptado como garantía. La 
              entidad financiera determinará los términos y políticas aplicables al otorgamiento del crédito 
              correspondiente.” Tomar en cuenta: observaciones, notas y recomendaciones.
            </div>

            {/* TABLA DE VALORACIÓN DEL TERRENO CON FINCAS Y VARAS CUADRADAS (FOTOS 75, 76, 77) */}
            <div className="pdf-valuation-block">
              <table className="pdf-blue-table">
                <thead>
                  <tr style={{ background: '#0d2847', color: '#ffffff' }}>
                    <th colSpan={6} style={{ textAlign: 'center', fontSize: '0.9rem', padding: '0.4rem' }}>TERRENO</th>
                  </tr>
                  <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                    <th>FINCA</th>
                    <th>AREA (m²)</th>
                    <th>EQUIVALENTE EN VARAS² (v²)</th>
                    <th>UNIDAD</th>
                    <th>VALOR</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => {
                    const areaVal = Number(f.areaValuada || (avaluo.desgloseTerreno?.area / fincas.length) || 0);
                    const varas = parseFloat((areaVal * 1.43115).toFixed(2));
                    const unitVal = Number(avaluo.desgloseTerreno?.valorUnitario || 0);
                    const subtotal = parseFloat((areaVal * unitVal).toFixed(2));

                    return (
                      <tr key={i}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{f.finca}</td>
                        <td style={{ textAlign: 'center' }}>{areaVal.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: company.accentColor }}>{varas.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: 'center' }}>m²</td>
                        <td style={{ textAlign: 'right' }}>{formatQ(unitVal)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQ(subtotal)}</td>
                      </tr>
                    );
                  })}
                  {fincas.length > 1 && (
                    <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                      <td style={{ textAlign: 'center' }}>TOTAL:</td>
                      <td style={{ textAlign: 'center' }}>{Number(avaluo.desgloseTerreno?.area || avaluo.areaValuada || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'center', color: company.accentColor }}>
                        {Number((avaluo.desgloseTerreno?.area || avaluo.areaValuada || 0) * 1.43115).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>m²</td>
                      <td style={{ textAlign: 'right' }}>-</td>
                      <td style={{ textAlign: 'right', color: company.navyColor }}>{formatQ(avaluo.desgloseTerreno?.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLA DE VALORACIÓN DE CONSTRUCCIÓN */}
            <div className="pdf-valuation-block" style={{ marginTop: '2rem' }}>
              <table className="pdf-blue-table">
                <thead>
                  <tr style={{ background: '#0d2847', color: '#ffffff' }}>
                    <th colSpan={4} style={{ textAlign: 'center', fontSize: '0.9rem', padding: '0.4rem' }}>CONSTRUCCION</th>
                  </tr>
                  <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                    <th>AREA (m²)</th>
                    <th>UNIDAD</th>
                    <th>VALOR</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center' }}>{Number(avaluo.desgloseConstruccion?.area || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>{avaluo.desgloseConstruccion?.unidad || 'm²'}</td>
                    <td style={{ textAlign: 'right' }}>{formatQ(avaluo.desgloseConstruccion?.valorUnitario)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQ(avaluo.desgloseConstruccion?.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Resumen Total al Pie de la Valuación */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', border: '1.5px solid #0d2847', borderRadius: '4px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SUMA TOTAL VALOR COMERCIAL:
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: company.navyColor, margin: '4px 0' }}>
                {formatQ(avaluo.valorComercialGTQ)}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                Equivalente en Dólares: <strong style={{ color: company.accentColor }}>{formatUSD(avaluo.valorComercialUSD)}</strong> (T/C: {avaluo.tipoCambio})
              </div>
            </div>
          </div>

          <PageFooter pageNum={7} />
        </section>

        {/* ==============================================================
            PÁGINA 8: FOTOGRAFÍAS (ENTORNO, INGRESO, INTERIOR, UBICACIÓN, CROQUIS)
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: '2px solid #0d2847', paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
              FOTOGRAFÍAS
            </div>

            {/* CORRECCIÓN FOTO 78: Visualización robusta de fotos cargadas desde celular */}
            <div className="pdf-photos-layout">
              <div className="pdf-photo-box">
                <div className="pdf-photo-num">1. Entorno</div>
                <div className="pdf-photo-frame">
                  {avaluo.fotos?.entorno ? (
                    <img src={avaluo.fotos.entorno} alt="1. Entorno" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="pdf-photo-empty">Espacio para Foto de Entorno</div>
                  )}
                </div>
              </div>

              <div className="pdf-photo-box">
                <div className="pdf-photo-num">2. Ingreso</div>
                <div className="pdf-photo-frame">
                  {avaluo.fotos?.ingreso ? (
                    <img src={avaluo.fotos.ingreso} alt="2. Ingreso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="pdf-photo-empty">Espacio para Foto de Ingreso</div>
                  )}
                </div>
              </div>

              <div className="pdf-photo-box">
                <div className="pdf-photo-num">3. Interior de inmueble</div>
                <div className="pdf-photo-frame">
                  {avaluo.fotos?.interior ? (
                    <img src={avaluo.fotos.interior} alt="3. Interior de inmueble" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="pdf-photo-empty">Espacio para Foto de Interior</div>
                  )}
                </div>
              </div>

              <div className="pdf-photo-box">
                <div className="pdf-photo-num">4. UBICACIÓN DE INMUEBLE</div>
                <div className="pdf-photo-frame">
                  {avaluo.fotos?.ubicacion ? (
                    <img src={avaluo.fotos.ubicacion} alt="4. Ubicación de inmueble" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="pdf-photo-empty">Espacio para Ubicación Satelital</div>
                  )}
                </div>
              </div>

              <div className="pdf-photo-box" style={{ gridColumn: 'span 2' }}>
                <div className="pdf-photo-num">5. CROQUIS</div>
                <div className="pdf-photo-frame" style={{ height: '180px' }}>
                  {avaluo.fotos?.croquis ? (
                    <img src={avaluo.fotos.croquis} alt="5. Croquis" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="pdf-photo-empty">Espacio para Croquis / Plano Catastral</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={8} />
        </section>

        {/* ==============================================================
            PÁGINA 9: MATRICULA DICABI Y CONSULTAS ELECTRÓNICAS (PDFS RGP)
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: '2px solid #0d2847', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              MATRICULA DICABI
            </div>

            <div className="pdf-photo-frame" style={{ height: '260px', marginBottom: '1.5rem' }}>
              {avaluo.fotos?.dicabi ? (
                <img src={avaluo.fotos.dicabi} alt="Matrícula DICABI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div className="pdf-photo-empty">
                  Documento Escaneado / Boleta Matrícula DICABI ({avaluo.dicabiMatricula || 'Pendiente'})
                </div>
              )}
            </div>

            {/* CORRECCIÓN FOTO 79: Consultas Electrónicas RGP con soporte para uno o más PDFs */}
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: '2px solid #0d2847', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              CONSULTAS ELECTRÓNICAS DEL REGISTRO GENERAL DE LA PROPIEDAD (RGP)
            </div>

            {avaluo.consultasPdfs && avaluo.consultasPdfs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {avaluo.consultasPdfs.map((pdf, idx) => (
                  <div 
                    key={pdf.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={22} style={{ color: '#ef4444' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0d2847' }}>{pdf.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Certificación RGP Oficial • {pdf.size}</div>
                      </div>
                    </div>
                    {pdf.dataUrl && (
                      <a
                        href={pdf.dataUrl}
                        download={pdf.name}
                        target="_blank"
                        rel="noreferrer"
                        className="no-print"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#0d2847',
                          color: '#ffffff',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={13} />
                        Descargar PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="pdf-photo-frame" style={{ height: '240px' }}>
                <div className="pdf-photo-empty" style={{ textAlign: 'center', padding: '1rem' }}>
                  Captura / Certificación Electrónica del Registro General de la Propiedad (RGP)
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    (Adjunte uno o más archivos PDF en el Paso 5 del formulario para visualizarlos aquí)
                  </div>
                </div>
              </div>
            )}
          </div>

          <PageFooter pageNum={9} />
        </section>

      </div>
    </div>
  );
}
