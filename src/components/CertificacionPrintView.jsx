import React, { useState, useEffect } from 'react';
import { X, Printer, ArrowLeft, FileText, Loader2, Award, Shield } from 'lucide-react';
import { extractAllRgpPages, formatFechaEnLetras, formatArea } from '../utils/pdfHelper';
import { canUserViewSignatures } from '../utils/permissions';
import { getTenantConfig } from '../data/tenantsConfig';

export default function CertificacionPrintView({ 
  certificacion, 
  avaluoBase, 
  onClose, 
  currentUser, 
  currentRole = 'autorizador' 
}) {
  const [rgpPages, setRgpPages] = useState([]);
  const [isLoadingRgp, setIsLoadingRgp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const tenantId = certificacion?.tenantId || avaluoBase?.tenantId || (certificacion?.empresaNombre?.includes('CVERDE') || certificacion?.empresaNombre?.includes('C VERDE') ? 'cverde' : 'lex-rosam');
  const tenantConfig = getTenantConfig(tenantId);

  const isCVerde = tenantId === 'cverde';
  // Exact Microsoft Word Accent 6 green palette from Aroldo's official Word template
  const headerTableColor = '#70AD47';
  const sectionTitleColor = '#538135';

  // Permiso para visualización de firmas (Aroldo/Autorizador vs Asistente)
  const canShowSignatures = canUserViewSignatures(currentUser, currentRole);

  // Carga de páginas RGP asociadas si se incluyeron
  useEffect(() => {
    let active = true;
    const docs = certificacion?.consultasPdfs || avaluoBase?.consultasPdfs;
    if (certificacion?.incluirAnexosRgp !== false && docs && docs.length > 0) {
      setIsLoadingRgp(true);
      extractAllRgpPages(docs, avaluoBase?.id || certificacion?.id)
        .then(pages => {
          if (active) {
            setRgpPages(pages || []);
            setIsLoadingRgp(false);
          }
        })
        .catch(err => {
          console.warn('Error al extraer páginas RGP para certificación:', err);
          if (active) setIsLoadingRgp(false);
        });
    } else {
      setRgpPages([]);
    }
    return () => { active = false; };
  }, [certificacion?.consultasPdfs, avaluoBase?.consultasPdfs, certificacion?.incluirAnexosRgp, avaluoBase?.id, certificacion?.id]);

  const handlePrint = () => {
    setIsPrinting(true);
    const originalTitle = document.title;
    // Ocultar título temporalmente para que Safari/navegadores no impriman el nombre de la pestaña
    document.title = " ";
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
        setIsPrinting(false);
      }, 1000);
    }, 150);
  };

  const formatQ = (val) => {
    const num = Number(val || 0);
    return 'Q' + num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Desglose de párrafos de observaciones (viñetas)
  const observacionesLines = (certificacion?.observaciones || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // Fecha en formato oficial "Guatemala, [dia] de [mes] de [año]"
  const formattedDate = (() => {
    if (!certificacion?.fechaEmision) return 'Guatemala, ' + formatFechaEnLetras(new Date().toISOString().split('T')[0]);
    return 'Guatemala ' + formatFechaEnLetras(certificacion.fechaEmision);
  })();

  const totalValores = (certificacion?.valores || []).reduce((acc, it) => acc + (Number(it.total) || 0), 0);

  return (
    <div 
      className="print-modal-overlay" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 1200, 
        background: '#0f172a', 
        minHeight: '100vh', 
        padding: '1rem', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Barra de control superior (No imprimible) */}
      <div className="no-print" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#1e293b',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Vista Previa Oficial: Certificación de Valor ({certificacion?.numeroReferencia || 'Ref'})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!canShowSignatures && (
            <span style={{ fontSize: '0.75rem', background: '#334155', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontStyle: 'italic' }}>
              Modo Asistente: Firmas gráficas reservadas
            </span>
          )}
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            style={{
              background: isCVerde ? '#70AD47' : '#2563eb',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: isPrinting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              opacity: isPrinting ? 0.8 : 1
            }}
          >
            {isPrinting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Printer size={16} />}
            <span>{isPrinting ? 'Generando PDF...' : 'Imprimir / Exportar a PDF'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Wrapper de Hojas para Impresión y Vista Previa */}
      <div 
        className="pdf-print-wrapper" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '2rem',
          paddingBottom: '3rem'
        }}
      >
        
        {/* ================================================================
            PÁGINA 1: FORMATO OFICIAL DE DICTAMEN DE CERTIFICACIÓN DE VALOR
            (Idéntico al documento Word proporcionado por Aroldo Ruiz)
            ================================================================ */}
        <div 
          className="pdf-page-sheet cert-sheet-page1"
          style={{
            background: '#ffffff',
            width: '216mm',
            minHeight: '279mm',
            maxHeight: '279mm',
            padding: '12mm 16mm 10mm 16mm',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
            boxSizing: 'border-box',
            fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
            color: '#000000',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}
        >
          {/* Parte superior y contenido estructurado */}
          <div>
            {/* Header: Logotipo Oficial */}
            <div style={{ textAlign: 'center', marginBottom: '0.55rem' }}>
              {isCVerde ? (
                <img 
                  src="/cverde-logo.jpg" 
                  alt="C VERDE S.A." 
                  style={{ height: '62px', objectFit: 'contain', margin: '0 auto', display: 'block' }} 
                />
              ) : (
                <img 
                  src="/lex-rosam-logo.png" 
                  alt="LEX ROSAM S.A." 
                  style={{ height: '62px', objectFit: 'contain', margin: '0 auto', display: 'block' }} 
                />
              )}
            </div>

            {/* Solicitante (Línea limpia exactamente como el Word de Aroldo) */}
            <div style={{ marginBottom: '0.45rem', fontSize: '0.82rem', lineHeight: 1.3 }}>
              <span style={{ fontWeight: 700 }}>SOLICITANTE: </span>
              <span style={{ textTransform: 'uppercase' }}>{certificacion?.solicitante || 'BANCO G&T CONTINENTAL, S.A.'}</span>
            </div>

            {/* Ficha Descriptiva del Inmueble */}
            <div style={{ fontSize: '0.79rem', lineHeight: 1.35, marginBottom: '0.55rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700 }}>DIRECCIÓN: </span>
                <span style={{ textTransform: 'uppercase' }}>{certificacion?.direccion || '-'}</span>
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700 }}>DESCRIPCIÓN DEL INMUEBLE: </span>
                <span style={{ textTransform: 'uppercase' }}>{certificacion?.descripcionInmueble || certificacion?.direccion || '-'}</span>
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700 }}>TIPO DE SOLICITUD: </span>
                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{certificacion?.tipoSolicitud || 'CERTIFICACIÓN DE VALOR'}</span>
              </div>
              <div>
                <span style={{ fontWeight: 700 }}>NUMERO DE REFERENCIA: </span>
                <span style={{ fontWeight: 700, color: '#000000' }}>{certificacion?.numeroReferencia || 'CV-10001'}</span>
              </div>
            </div>

            {/* TABLA DE FINCAS (Encabezado verde #70AD47 y texto blanco en negrita) */}
            <div style={{ marginBottom: '0.55rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                <thead>
                  <tr className="cert-table-header-tr">
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '12%' }}>FINCA</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '10%' }}>FOLIO</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '26%' }}>LIBRO</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '16%' }}>ÁREA REGISTRADA</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '24%' }}>PROPIETARIO</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 6px', textAlign: 'center', fontWeight: 700, width: '12%' }}>ÁREA VALUADA</th>
                  </tr>
                </thead>
                <tbody>
                  {(certificacion?.fincas && certificacion.fincas.length > 0 ? certificacion.fincas : [{ finca: '-', folio: '-', libro: '-', areaRegistrada: '-', propietario: '-', areaValuada: '-' }]).map((f, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 6px', textAlign: 'center', fontWeight: 600 }}>{f.finca || '-'}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 6px', textAlign: 'center' }}>{f.folio || '-'}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 6px', textAlign: 'center' }}>{f.libro || '-'}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 6px', textAlign: 'center' }}>{f.areaRegistrada || '-'}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 6px', textAlign: 'left', textTransform: 'uppercase' }}>{f.propietario || '-'}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 6px', textAlign: 'center' }}>{f.areaValuada || f.areaRegistrada || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN OBSERVACIONES (Título verde #538135 y Viñetas) */}
            <div style={{ marginBottom: '0.55rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#538135', marginBottom: '0.2rem', letterSpacing: '0.02em' }}>
                OBSERVACIONES:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', fontSize: '0.71rem', lineHeight: 1.32, textAlign: 'justify', color: '#1e293b' }}>
                {observacionesLines.map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                    <span style={{ color: '#538135', fontWeight: 700, fontSize: '0.72rem', lineHeight: 1.3 }}>➤</span>
                    <span style={{ flex: 1 }}>{line.replace(/^[•➤\-]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TABLA DE VALORES (Título verde #538135, Encabezado verde #70AD47 y letras blancas) */}
            <div style={{ marginBottom: '0.65rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#538135', textAlign: 'center', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
                VALORES
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                <thead>
                  <tr className="cert-table-header-tr">
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 8px', textAlign: 'left', fontWeight: 700, width: '40%' }}>FINCA</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 8px', textAlign: 'center', fontWeight: 700, width: '20%' }}>ÁREA</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 8px', textAlign: 'right', fontWeight: 700, width: '20%' }}>VALOR M2</th>
                    <th className="cert-th-green" style={{ background: '#70AD47', backgroundColor: '#70AD47', color: '#ffffff', border: '1px solid #70AD47', padding: '4px 8px', textAlign: 'right', fontWeight: 700, width: '20%' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(certificacion?.valores && certificacion.valores.length > 0 ? certificacion.valores : [{ descripcion: 'Inmueble', area: '0.00', valorUnitario: 0, total: 0 }]).map((v, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 8px', textAlign: 'left', fontWeight: 600, textTransform: 'uppercase' }}>{v.descripcion}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 8px', textAlign: 'center' }}>
                        {formatArea(v.area)} {v.unidad || 'm²'}
                      </td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 8px', textAlign: 'right' }}>{formatQ(v.valorUnitario)}</td>
                      <td style={{ border: '1px solid #a6a6a6', padding: '3px 8px', textAlign: 'right', fontWeight: 600 }}>{formatQ(v.total)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                    <td colSpan={3} style={{ border: '1px solid #a6a6a6', padding: '4px 8px', textAlign: 'left' }}>TOTAL</td>
                    <td style={{ border: '1px solid #a6a6a6', padding: '4px 8px', textAlign: 'right', color: '#538135', fontSize: '0.82rem', fontWeight: 800 }}>{formatQ(totalValores)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie de página y Firma Oficial (Siempre al pie de la Página 1) */}
          <div style={{ marginTop: 'auto', paddingTop: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.4rem' }}>
              
              {/* Firma y Sello Oficial */}
              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div style={{ minHeight: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '3px' }}>
                  {canShowSignatures ? (
                    <img 
                      src="/signatures/firma_aroldo_ruiz.png" 
                      alt="Firma y Sello Oficial" 
                      style={{ maxHeight: '80px', maxWidth: '185px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '185px', height: '1px', background: '#000000', marginBottom: '6px' }}></div>
                      <span style={{ fontSize: '0.64rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>
                        [Firma y sello oficiales reservados al autorizador]
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#000000', lineHeight: 1.2 }}>
                  Licenciado<br />
                  Aroldo Oliverio Ruiz Orozco
                </div>
                <div style={{ fontSize: '0.72rem', color: '#334155' }}>
                  Valuador
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#000000' }}>
                  Reg. 2572-R-2026
                </div>
              </div>

              {/* Fecha de Emisión */}
              <div style={{ textAlign: 'right', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b', paddingBottom: '0.4rem' }}>
                {formattedDate}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            PÁGINAS SIGUIENTES: CERTIFICACIONES RGP (1 PÁGINA POR HOJA)
            Solo se imprimen si el usuario adjuntó archivos PDF del RGP
            ================================================================ */}
        {rgpPages && rgpPages.length > 0 && rgpPages.map((page, pIdx) => (
          <div 
            key={page.id || `rgp-cert-page-${pIdx}`}
            className="pdf-page-sheet"
            style={{
              background: '#ffffff',
              width: '216mm',
              minHeight: '279mm',
              maxHeight: '279mm',
              padding: '12mm 15mm',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
              boxSizing: 'border-box',
              fontFamily: '"Calibri", "Segoe UI", Arial, sans-serif',
              color: '#000000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden'
            }}
          >
            <div>
              {/* Encabezado superior de Anexo RGP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid #538135`, paddingBottom: '0.35rem', marginBottom: '0.65rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#538135', textTransform: 'uppercase' }}>
                  Anexo: Consulta Registral RGP · Certificación {certificacion?.numeroReferencia || ''}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Hoja {pIdx + 1} de {rgpPages.length}
                </span>
              </div>

              {/* Imagen nítida de la página RGP */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={page.dataUrl} 
                  alt={`Página RGP ${pIdx + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '235mm',
                    objectFit: 'contain',
                    border: '1px solid #cbd5e1'
                  }}
                />
              </div>
            </div>

            {/* Pie inferior de Anexo */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
              <span>{certificacion?.empresaNombre || 'C VERDE, S.A.'} · Certificación de Valor</span>
              <span>Documento Registral Electrónico Digitalizado</span>
            </div>
          </div>
        ))}

      </div>

      {/* Reglas de impresión CSS para navegador (Garantizan fondo verde #70AD47, texto blanco y 1 sola página) */}
      <style>{`
        @media print {
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page {
            size: letter portrait;
            margin: 0 !important;
          }
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .pdf-print-overlay,
          .print-modal-overlay {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
            position: static !important;
          }
          .no-print {
            display: none !important;
          }
          .pdf-print-wrapper {
            gap: 0 !important;
            padding: 0 !important;
          }
          .pdf-page-sheet {
            box-shadow: none !important;
            border: none !important;
            width: 216mm !important;
            height: 279mm !important;
            max-height: 279mm !important;
            margin: 0 !important;
            padding: 12mm 16mm 10mm 16mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          .cert-th-green {
            background-color: #70AD47 !important;
            background: #70AD47 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .cert-table-header-tr th {
            background-color: #70AD47 !important;
            background: #70AD47 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
