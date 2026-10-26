import React from 'react';
import { X, Printer, ArrowLeft, FileText } from 'lucide-react';
import { SERVICIOS_INFRAESTRUCTURA_LIST } from '../data/serviciosConstants';
import { extractAllRgpPages } from '../utils/pdfHelper';
import { DEFAULT_DICTAMEN_GARANTIA } from '../data/mockAvaluos';
import { getTenantConfig } from '../data/tenantsConfig';
import { getAvaluoFromLocalDb } from '../utils/localDb';

export default function OfficialReportPrintView({ avaluo: propAvaluo, onClose, config = {} }) {
  const [hydratedAvaluo, setHydratedAvaluo] = React.useState(propAvaluo);

  React.useEffect(() => {
    setHydratedAvaluo(propAvaluo);
    if (propAvaluo?.id) {
      getAvaluoFromLocalDb(propAvaluo.id).then(localItem => {
        if (localItem) {
          setHydratedAvaluo(prev => {
            const localHasFotos = localItem.fotos && Object.values(localItem.fotos).some(v => Array.isArray(v) ? v.length > 0 : Boolean(v));
            return {
              ...prev,
              ...localItem,
              fotos: localHasFotos ? localItem.fotos : prev.fotos,
              consultasPdfs: localItem.consultasPdfs || prev.consultasPdfs
            };
          });
        }
      }).catch(err => console.warn('Error hydrating in print view:', err));
    }
  }, [propAvaluo?.id]);

  const avaluo = hydratedAvaluo || propAvaluo;
  const avaluoTenant = getTenantConfig(avaluo?.tenantId || (avaluo?.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam'));

  // Official Multi-Tenant Company Branding (Lex Rosam o Cverde)
  const company = {
    name: config.name || avaluoTenant.nombreCorto || "LEX ROSAM",
    fullName: config.fullName || avaluoTenant.nombre || "LEX ROSAM, S.A.",
    tagline: config.tagline || avaluoTenant.tagline || "SOCIEDAD ANÓNIMA — AVALÚOS",
    phone: avaluo?.telefonoContacto || config.phone || avaluoTenant.telefono || (avaluoTenant.id === 'lex-rosam' ? "+502 6203-0795" : ""),
    emails: avaluo?.emailContacto || config.emails || avaluoTenant.email || (avaluoTenant.id === 'cverde' ? "oruiz@cverde.com.gt / jmmorales@cverde.com.gt" : "solicituddeavaluos@lexrosam.com"),
    website: config.website || avaluoTenant.sitioWeb || "https://lexrosam.com/",
    logoUrl: avaluoTenant.logoUrl || "/lex-rosam-logo.png",
    navyColor: avaluoTenant.colores?.primary || "#0d2847",
    accentColor: avaluoTenant.colores?.accent || "#1e40af"
  };

  const formatQ = (val) => {
    return 'Q. ' + Number(val || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (val) => {
    return '$ ' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr === 'N/A') return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [rgpPages, setRgpPages] = React.useState([]);

  // Extracción de páginas de consultas electrónicas RGP para visualización nítida
  React.useEffect(() => {
    let active = true;
    if (avaluo?.consultasPdfs && avaluo.consultasPdfs.length > 0) {
      extractAllRgpPages(avaluo.consultasPdfs, avaluo?.id).then(pages => {
        if (active) setRgpPages(pages);
      }).catch(err => {
        console.error('Error al extraer páginas RGP:', err);
      });
    } else {
      setRgpPages([]);
    }
    return () => { active = false; };
  }, [avaluo?.consultasPdfs, avaluo?.id]);

  React.useEffect(() => {
    if (!avaluo?.fotos) {
      setImagesLoaded(true);
      return;
    }
    const rawValues = Object.values(avaluo.fotos);
    const urls = rawValues
      .flatMap(val => Array.isArray(val) ? val : [val])
      .filter(url => url && typeof url === 'string' && url.trim().length > 0);

    if (urls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let count = 0;
    let cancelled = false;
    urls.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count++;
        if (count >= urls.length) {
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [avaluo]);

  const handlePrint = () => {
    window.print();
  };

  // Nombres y registros oficiales de los valuadores
  const valPrincipalNombre = avaluo?.valuadorPrincipal || avaluoTenant.valuadorPrincipal || 'Lic. Aroldo Oliverio Ruiz Orozco';
  const valPrincipalRegistro = avaluo?.registroPrincipal || avaluoTenant.registroPrincipal || 'Valuador autorizado 2572-R-2026';

  const valRevisorNombre = avaluo?.valuadorRevisor && !avaluo.valuadorRevisor.includes('Tolaque') && !avaluo.valuadorRevisor.includes('Morales Solares') 
    ? avaluo.valuadorRevisor 
    : (avaluoTenant.valuadorRevisor || 'Lic. Edgar Rolando Martínez Larios');

  const valRevisorRegistro = avaluo?.registroRevisor && !avaluo.registroRevisor.includes('193-T-93') && !avaluo.registroRevisor.includes('412-T-2018')
    ? avaluo.registroRevisor
    : (avaluoTenant.registroRevisor || 'Valuador autorizado 2571-M-2026');

  // Determinar imágenes oficiales de firma y sello
  const getFirmaPrincipalSrc = () => {
    if (avaluo?.firmaPrincipalImg) return avaluo.firmaPrincipalImg;
    const name = (valPrincipalNombre || '').toLowerCase();
    if (name.includes('aroldo') || name.includes('ruiz') || avaluoTenant?.id === 'cverde' || avaluoTenant?.id === 'lex-rosam') {
      return '/signatures/firma_aroldo_ruiz.png';
    }
    return null;
  };

  const getFirmaRevisorSrc = () => {
    if (avaluo?.firmaRevisorImg) return avaluo.firmaRevisorImg;
    const name = (valRevisorNombre || '').toLowerCase();
    if (name.includes('edgar') || name.includes('martinez') || name.includes('larios') || name.includes('tolaque') || name.includes('morales') || avaluoTenant?.id === 'cverde' || avaluoTenant?.id === 'lex-rosam') {
      return '/signatures/firma_edgar_martinez.png';
    }
    return null;
  };

  // Reusable Page Header with Official Lex Rosam Logo
  const PageHeader = () => (
    <div className="pdf-page-header" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img 
          src={company.logoUrl} 
          alt={company.name} 
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
        <div style={{ fontWeight: 700, borderBottom: `1.5px solid ${company.navyColor}`, padding: '0 6px', color: company.navyColor }}>
          {pageNum}
        </div>
      )}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {company.phone && company.phone.trim() !== '' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📞 WhatsApp:</span> <strong>{company.phone}</strong>
          </span>
        )}
        {company.emails && company.emails.trim() !== '' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>✉️ Correo:</span> <strong>{company.emails}</strong>
          </span>
        )}
        {company.website && company.website.trim() !== '' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🌐</span> <strong>{company.website}</strong>
          </span>
        )}
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

  // Desglose de terrenos por finca con valores unitarios independientes
  const terrainItems = (avaluo.desgloseTerreno?.items && Array.isArray(avaluo.desgloseTerreno.items) && avaluo.desgloseTerreno.items.length > 0)
    ? avaluo.desgloseTerreno.items
    : fincas.map((f, i) => {
        const area = Number(f.areaValuada || (avaluo.desgloseTerreno?.area ? avaluo.desgloseTerreno.area / fincas.length : 0));
        const unitVal = Number(f.valorUnitarioTerreno != null ? f.valorUnitarioTerreno : (avaluo.desgloseTerreno?.valorUnitario || 0));
        return {
          id: i + 1,
          finca: f.finca || `Finca ${i + 1}`,
          area: area,
          varasCuadradas: Number(f.varasCuadradas || (area * 1.43115)),
          unidad: 'm²',
          valorUnitario: unitVal,
          total: Number(f.totalTerreno != null ? f.totalTerreno : (area * unitVal))
        };
      });

  const totalTerrenoArea = terrainItems.reduce((acc, it) => acc + (Number(it.area) || 0), 0);
  const totalTerrenoVaras = terrainItems.reduce((acc, it) => acc + (Number(it.varasCuadradas || ((Number(it.area) || 0) * 1.43115))), 0);
  const totalTerrenoSubtotal = terrainItems.reduce((acc, it) => acc + (Number(it.total != null ? it.total : ((Number(it.area) || 0) * (Number(it.valorUnitario) || 0)))), 0);

  // Desglose de construcción
  const constructionItems = (avaluo.desgloseConstruccion?.items && Array.isArray(avaluo.desgloseConstruccion.items) && avaluo.desgloseConstruccion.items.length > 0)
    ? avaluo.desgloseConstruccion.items
    : [{
        descripcion: 'Construcción Principal',
        area: Number(avaluo.desgloseConstruccion?.area || 0),
        unidad: avaluo.desgloseConstruccion?.unidad || 'm²',
        valorUnitario: Number(avaluo.desgloseConstruccion?.valorUnitario || 0),
        total: Number(avaluo.desgloseConstruccion?.total || 0)
      }];

  const totalConstruccionArea = constructionItems.reduce((acc, it) => acc + (Number(it.area) || 0), 0);
  const totalConstruccionTotal = constructionItems.reduce((acc, it) => acc + (Number(it.total != null ? it.total : ((Number(it.area) || 0) * (Number(it.valorUnitario) || 0)))), 0);

  // Detección de si aplica terreno y colindancias (prioridad absoluta a avaluo.aplicaTerreno)
  const aplicaTerreno = avaluo.aplicaTerreno !== undefined
    ? Boolean(avaluo.aplicaTerreno)
    : !(
        avaluo.tipoAvaluo === 'Apartamento / PH' ||
        avaluo.tipoAvaluo === 'Apartamento' ||
        (avaluo.direccion && avaluo.direccion.toLowerCase().includes('apartamento')) ||
        (avaluo.descripcionGeneral && avaluo.descripcionGeneral.toLowerCase().includes('apartamento'))
      );

  const _isApartamento = !aplicaTerreno;

  // Totales comerciales (100%) y bancarios (80%)
  const tc = Number(avaluo.tipoCambio) || 7.62581;
  const computedComercialGTQ = avaluo.valorComercialGTQ != null && Number(avaluo.valorComercialGTQ) > 0
    ? Number(avaluo.valorComercialGTQ)
    : ((aplicaTerreno ? totalTerrenoSubtotal : 0) + totalConstruccionTotal);
  const computedComercialUSD = avaluo.valorComercialUSD != null && Number(avaluo.valorComercialUSD) > 0
    ? Number(avaluo.valorComercialUSD)
    : parseFloat((computedComercialGTQ / tc).toFixed(2));

  // Corrección de redondeo bancario: cálculo exacto con 2 decimales para evitar descuadres de centavos
  const exact80GTQ = parseFloat((computedComercialGTQ * 0.8).toFixed(2));
  const isRoundedIntegerArtifact = avaluo.valorBancarioGTQ != null &&
    Number.isInteger(Number(avaluo.valorBancarioGTQ)) &&
    !Number.isInteger(exact80GTQ) &&
    Math.round(exact80GTQ) === Number(avaluo.valorBancarioGTQ);

  const computedBancarioGTQ = (avaluo.valorBancarioGTQ != null && Number(avaluo.valorBancarioGTQ) > 0 && !isRoundedIntegerArtifact)
    ? Number(avaluo.valorBancarioGTQ)
    : exact80GTQ;
  const computedBancarioUSD = (avaluo.valorBancarioUSD != null && Number(avaluo.valorBancarioUSD) > 0 && !isRoundedIntegerArtifact)
    ? Number(avaluo.valorBancarioUSD)
    : parseFloat((computedBancarioGTQ / tc).toFixed(2));

  const hasColindancias = Boolean(
    aplicaTerreno &&
    avaluo.colindancias &&
    (
      (avaluo.colindancias.norte && !['S/D', 'N/A', 'No aplica', '-', ''].includes(avaluo.colindancias.norte.trim())) ||
      (avaluo.colindancias.sur && !['S/D', 'N/A', 'No aplica', '-', ''].includes(avaluo.colindancias.sur.trim())) ||
      (avaluo.colindancias.este && !['S/D', 'N/A', 'No aplica', '-', ''].includes(avaluo.colindancias.este.trim())) ||
      (avaluo.colindancias.oeste && !['S/D', 'N/A', 'No aplica', '-', ''].includes(avaluo.colindancias.oeste.trim()))
    )
  );

  const hasDetallesTerreno = Boolean(
    aplicaTerreno &&
    (
      (avaluo.formaTerreno && !['N/A', 'No aplica', '-', ''].includes(avaluo.formaTerreno.trim())) ||
      (avaluo.pendiente && !['N/A', 'No aplica', '-', ''].includes(avaluo.pendiente.trim())) ||
      (Number(avaluo.desgloseTerreno?.total || 0) > 0)
    )
  );

  const showTerrenoSections = aplicaTerreno && (hasColindancias || hasDetallesTerreno);

  // Normalización de fotos (soporta array de fotos o strings individuales)
  const normalizedFotos = React.useMemo(() => {
    const categories = ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'];
    const res = {};
    categories.forEach(k => {
      const val = avaluo?.fotos?.[k];
      if (Array.isArray(val)) {
        res[k] = val.filter(u => u && typeof u === 'string' && u.trim().length > 0);
      } else if (typeof val === 'string' && val.trim().length > 0) {
        res[k] = [val];
      } else {
        res[k] = [];
      }
    });
    return res;
  }, [avaluo?.fotos]);

  // Detección de fotos cargadas en las categorías principales (excluye dicabi que va en página aparte)
  const hasAnyPhoto = Boolean(
    normalizedFotos.entorno.length > 0 ||
    normalizedFotos.ingreso.length > 0 ||
    normalizedFotos.interior.length > 0 ||
    normalizedFotos.ubicacion.length > 0 ||
    normalizedFotos.croquis.length > 0
  );

  // Agrupación y paginación inteligente de fotos (máximo 6 slots por página para que no se desborden)
  const photoPages = React.useMemo(() => {
    const categories = [
      { key: 'entorno', label: '1. Entorno' },
      { key: 'ingreso', label: '2. Ingreso / Fachada' },
      { key: 'interior', label: '3. Interior de inmueble' },
      { key: 'ubicacion', label: '4. Ubicación Satelital' },
      { key: 'croquis', label: '5. Croquis / Plano Catastral', isCroquis: true }
    ];

    const cards = [];
    categories.forEach(cat => {
      const list = normalizedFotos[cat.key] || [];
      if (list.length === 0) {
        cards.push({
          id: `${cat.key}-empty`,
          category: cat.key,
          label: cat.label,
          src: null,
          span: cat.isCroquis ? 2 : 1
        });
      } else {
        list.forEach((url, idx) => {
          cards.push({
            id: `${cat.key}-${idx}`,
            category: cat.key,
            label: list.length > 1 ? `${cat.label} (Foto ${idx + 1} de ${list.length})` : cat.label,
            src: url,
            span: cat.isCroquis ? (list.length > 1 ? 1 : 2) : 1
          });
        });
      }
    });

    const pages = [];
    let currentPage = [];
    let currentSlots = 0;

    cards.forEach(card => {
      const needed = card.span;
      if (currentSlots + needed > 6 && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentSlots = 0;
      }
      currentPage.push(card);
      currentSlots += needed;
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }, [normalizedFotos]);

  const totalPhotoPages = photoPages.length;
  const dicabiPageNum = 8 + totalPhotoPages;
  const totalRgpPages = rgpPages.length;
  const totalPages = dicabiPageNum + totalRgpPages;

  if (!avaluo) return null;

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
              Vista Previa de Impresión Oficial {company.name} ({totalPages} Páginas)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
              Expediente: {avaluo.codigo} — Formato Oficial para Bancos e Instituciones Financieras
            </span>
          </div>
        </div>
        <div className="print-control-right">
          <button 
            type="button" 
            className="print-btn-primary" 
            onClick={handlePrint} 
            style={{ background: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={!imagesLoaded && hasAnyPhoto}
          >
            <Printer size={18} />
            <span>{!imagesLoaded && hasAnyPhoto ? 'Cargando Fotos para PDF...' : 'Imprimir / Exportar PDF'}</span>
          </button>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* The Printable 7-Page Document Container */}
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
                <span className="pdf-data-value"><strong>{avaluo.fechaInspeccion ? (formatDateDisplay(avaluo.fechaInspeccion) || '-') : '-'}</strong></span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label">Fecha de actualización:</span>
                <span className="pdf-data-value">{(!avaluo.fechaInspeccion && avaluo.fechaActualizacion) ? (formatDateDisplay(avaluo.fechaActualizacion) || '-') : '-'}</span>
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
                      <td>{Number(f.areaRegistrada || f.areaActualRegistrada || avaluo.areaRegistrada || 0).toFixed(6)} m²</td>
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
                        {Number(f.areaValuada || (avaluo.areaValuada / fincas.length) || 0).toFixed(6)} m²
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

          <div className="pdf-sheet-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="pdf-boxed-table">
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.35rem' }}>
                LIMITACIONES
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Anotaciones y gravámenes:</span>
                <span className="pdf-data-value">{avaluo.gravamenes || 'Libre de gravámenes hipotecarios.'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Servidumbres:</span>
                <span className="pdf-data-value" style={{ textAlign: 'justify', lineHeight: 1.35 }}>{avaluo.servidumbres || 'Sin servidumbres activas.'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Áreas comunes:</span>
                <span className="pdf-data-value">
                  {((!avaluo.areasComunes || avaluo.areasComunes === 'No aplica') && avaluo.desmembracion && (/elementos comunes|areas comunes|áreas comunes|comunes|finca 500|finca 1334/i.test(avaluo.desmembracion)))
                    ? avaluo.desmembracion
                    : (avaluo.areasComunes || 'No aplica')}
                </span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Desmembración:</span>
                <span className="pdf-data-value">
                  {((!avaluo.areasComunes || avaluo.areasComunes === 'No aplica') && avaluo.desmembracion && (/elementos comunes|areas comunes|áreas comunes|comunes|finca 500|finca 1334/i.test(avaluo.desmembracion)))
                    ? 'No aplica'
                    : (avaluo.desmembracion || 'No aplica')}
                </span>
              </div>
            </div>

            {/* Cuadro de Valores Oficiales */}
            <div className="pdf-boxed-table" style={{ marginTop: '0.85rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.35rem' }}>
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
                    <td style={{ textAlign: 'right', fontWeight: 800, color: company.navyColor }}>{formatQ(computedComercialGTQ)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: company.accentColor }}>{formatUSD(computedComercialUSD)}</td>
                  </tr>
                  <tr>
                    <td><strong>VALOR BANCARIO</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQ(computedBancarioGTQ)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatUSD(computedBancarioUSD)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', lineHeight: 1.45 }}>
                <p style={{ margin: 0 }}>
                  <strong>Tipo de cambio {avaluo.tipoCambio || '7.62581'}</strong>, según Banco de Guatemala.
                </p>
                {/* CORRECCIÓN FOTO 66: Se eliminó el texto entre paréntesis a petición de Aroldo */}
                <p style={{ marginTop: '0.35rem', marginBottom: 0, textAlign: 'justify' }}>
                  A juicio del suscrito valuador con fecha {avaluo.fechaActualizacion || avaluo.fechaInspeccion || '2026'}, el inmueble descrito tiene un valor comercial 
                  de <strong>{formatQ(computedComercialGTQ)}</strong> o al cambio en dólares al <strong>{formatUSD(computedComercialUSD)}</strong>.
                </p>
              </div>
            </div>

            {/* Firmas en Página 2 oficiales */}
            <div className="pdf-signatures-container" style={{ marginTop: 'auto', paddingTop: '2.5rem', justifyContent: avaluo.incluirFirmaRevisor === false ? 'center' : 'space-around' }}>
              {avaluo.incluirFirmaRevisor !== false && (
                <div className="pdf-signature-block" style={{ width: '260px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {getFirmaRevisorSrc() ? (
                    <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={getFirmaRevisorSrc()} 
                        alt="Firma y Sello Oficial Valuador Revisor" 
                        style={{ maxHeight: '115px', maxWidth: '230px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                      />
                    </div>
                  ) : (
                    <>
                      <div className="pdf-signature-line"></div>
                      <div className="pdf-sig-name" style={{ fontWeight: 700, color: company.navyColor }}>
                        {valRevisorNombre}
                      </div>
                      <div className="pdf-sig-role" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {valRevisorRegistro}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="pdf-signature-block" style={{ width: '260px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {getFirmaPrincipalSrc() ? (
                  <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={getFirmaPrincipalSrc()} 
                      alt="Firma y Sello Oficial Valuador Principal" 
                      style={{ maxHeight: '115px', maxWidth: '230px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                    />
                  </div>
                ) : (
                  <>
                    <div className="pdf-signature-line"></div>
                    <div className="pdf-sig-name" style={{ fontWeight: 700, color: company.navyColor }}>
                      {valPrincipalNombre}
                    </div>
                    <div className="pdf-sig-role" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {valPrincipalRegistro}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <PageFooter pageNum={2} />
        </section>

        {/* ==============================================================
            PÁGINA 3: CALIFICACIÓN DE LA GARANTÍA Y CONSIDERACIONES GENERALES
            (Página exclusiva e independiente a solicitud de Aroldo Ruiz)
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
              CALIFICACION DE GARANTIA Y CONSIDERACIONES GENERALES DEL PRESENTE INFORME
            </div>

            <ol className="pdf-legal-considerations" style={{ lineHeight: 1.6, fontSize: '0.82rem', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '0.9rem', flex: 1 }}>
              <li style={{ display: 'flex', gap: '8px' }}>
                <strong style={{ minWidth: '24px' }}>I.</strong>
                <span>El bien valuado puede ser considerado como sujeto de garantía. La institución financiera correspondiente definirá las condiciones de crédito y los riesgos a asumir. Se recomienda revisar los aspectos negativos, notas y recomendaciones.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <strong style={{ minWidth: '24px' }}>II.</strong>
                <span>El presente avalúo se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe, circunscrita a las condiciones específicas detalladas en el informe y al marco de mercado vigente al momento de su elaboración. Se advierte que los valores y conclusiones aquí expresados están sujetos a variaciones futuras derivadas de cambios en las dinámicas del mercado, modificaciones en la situación legal del inmueble o actualizaciones en los registros públicos que puedan incidir en su valoración.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <strong style={{ minWidth: '24px' }}>III.</strong>
                <span>El presente avalúo se emite únicamente con fines informativos y no genera obligación alguna, ni confiere autorización o prohibición respecto de operaciones o transacciones. Las decisiones que se adopten a partir de este documento serán responsabilidad exclusiva del solicitante, del propietario y de las demás partes que intervengan en dichas gestiones.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <strong style={{ minWidth: '24px' }}>IV.</strong>
                <span>Los datos registrales que sustentan este avalúo fueron obtenidos a través de la consulta realizada en la plataforma electrónica del Registro de la Propiedad, y su validez se circunscribe exclusivamente a la fecha consignada en el presente informe. En consecuencia, cualquier verificación o contraste de la información aquí contenida deberá efectuarse directamente en el Registro de la Propiedad, como fuente oficial y competente para certificar la situación jurídica del inmueble.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <strong style={{ minWidth: '24px' }}>V.</strong>
                <span>{company.name} S.A. es una entidad independiente y no mantiene vínculo alguno con las personas físicas o jurídicas que solicitan el presente informe.</span>
              </li>
            </ol>


          </div>

          <PageFooter pageNum={3} />
        </section>

        {/* ==============================================================
            PÁGINA 4: INFORMACIÓN DE LA PROPIEDAD, RGP, ÁREAS, TERRENO Y REGISTROS
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.85rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
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
                <span className="pdf-data-value">
                  {formatDateDisplay(avaluo.fechaConsultaDistancia) || avaluo.fechaConsultaDistancia || formatDateDisplay(avaluo.fechaActualizacion) || avaluo.fechaActualizacion || '-'}
                </span>
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
            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '0.75rem', padding: '0.25rem', fontWeight: 700, fontSize: '0.82rem' }}>
              ÁREA
            </div>

            <table className="pdf-inner-table" style={{ border: '1px solid #64748b', marginTop: '0.35rem' }}>
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
                      <td>{orig.toFixed(6)} m²</td>
                      <td style={{ color: desm > 0 ? '#b91c1c' : 'inherit' }}>{desm.toFixed(6)} m²</td>
                      <td style={{ fontWeight: 600 }}>{act.toFixed(6)} m²</td>
                      <td>{fis.toFixed(6)} m²</td>
                      <td style={{ fontWeight: 700, color: company.navyColor }}>{val.toFixed(6)} m²</td>
                    </tr>
                  );
                })}
                {fincas.length > 1 && (
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: `2px solid ${company.navyColor}` }}>
                    <td>TOTAL:</td>
                    <td>{Number(avaluo.areaRegistrada || 0).toFixed(6)} m²</td>
                    <td style={{ color: '#b91c1c' }}>{Number(avaluo.areaDesmembrada || 0).toFixed(6)} m²</td>
                    <td>{Number(avaluo.areaActualRegistrada || 0).toFixed(6)} m²</td>
                    <td>{Number(avaluo.areaFisica || 0).toFixed(6)} m²</td>
                    <td style={{ color: company.navyColor }}>{Number(avaluo.areaValuada || 0).toFixed(6)} m²</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ASPECTOS LEGALES */}
            <div className="pdf-boxed-table" style={{ marginTop: '0.65rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.35rem' }}>
                ASPECTOS LEGALES
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Limitaciones o servidumbres:</span>
                <span className="pdf-data-value">{avaluo.limitaciones || avaluo.servidumbres || 'Sin limitaciones vigentes inscritas.'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Anotación:</span>
                <span className="pdf-data-value">{avaluo.anotaciones || 'Ninguna vigente según consulta electrónica del RGP.'}</span>
              </div>
              <div className="pdf-data-row">
                <span className="pdf-data-label" style={{ width: '190px' }}>Gravámenes:</span>
                <span className="pdf-data-value">{avaluo.gravamenes || 'NINGUNA'}</span>
              </div>
            </div>

            {/* DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI) - ANCHO COMPLETO OFICIAL SEGÚN CANTIDAD DE FINCAS (AROLDO) */}
            {fincas.map((f, i) => {
              const isFirst = i === 0;
              const fNombre = f.dicabiNombre || (isFirst ? (avaluo.dicabiNombre || '') : '');
              const fDireccion = f.dicabiDireccion || (isFirst ? (avaluo.dicabiDireccion || '') : '');
              const fMatricula = f.dicabiMatricula || (isFirst ? (avaluo.dicabiMatricula || '') : '');
              const fArea = f.dicabiArea || (isFirst ? (avaluo.dicabiArea || '') : '');
              const fObservaciones = f.dicabiObservaciones !== undefined && f.dicabiObservaciones !== '' 
                ? f.dicabiObservaciones 
                : (isFirst && avaluo.dicabiObservaciones ? avaluo.dicabiObservaciones : '');

              return (
                <div 
                  key={i} 
                  className="pdf-boxed-table" 
                  style={{ 
                    marginTop: fincas.length > 2 ? '0.35rem' : '0.65rem', 
                    border: '1px solid #1e293b' 
                  }}
                >
                  <div 
                    className="pdf-subtable-header" 
                    style={{ 
                      background: company.navyColor, 
                      color: '#ffffff', 
                      fontWeight: 700, 
                      padding: fincas.length > 2 ? '0.22rem 0.4rem' : '0.35rem 0.5rem', 
                      textAlign: 'center', 
                      fontSize: fincas.length > 2 ? '0.76rem' : '0.82rem', 
                      letterSpacing: '0.04em' 
                    }}
                  >
                    DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI){fincas.length > 1 ? ` — FINCA: ${f.finca || (i + 1)}` : ''}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fincas.length > 2 ? '0.74rem' : '0.82rem' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ width: '135px', padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                          Nombre:
                        </td>
                        <td style={{ padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', color: '#0f172a' }}>
                          {fNombre}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ width: '135px', padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                          Dirección:
                        </td>
                        <td style={{ padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', color: '#0f172a', lineHeight: 1.25 }}>
                          {fDireccion}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ width: '135px', padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                          Matricula:
                        </td>
                        <td style={{ padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', color: '#0f172a' }}>
                          {fMatricula ? <strong>{fMatricula}</strong> : ''}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ width: '135px', padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                          Área:
                        </td>
                        <td style={{ padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', color: '#0f172a' }}>
                          {fArea}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '135px', padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                          Observaciones:
                        </td>
                        <td style={{ padding: fincas.length > 2 ? '0.16rem 0.45rem' : '0.3rem 0.6rem', color: '#0f172a', lineHeight: 1.25 }}>
                          {fObservaciones}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* TERRENO Y COLINDANCIAS: Muestra los cuadros de colindancias según cantidad de fincas con Registral y Física */}
            {showTerrenoSections && (
              <div style={{ marginTop: fincas.length > 2 ? '0.45rem' : '0.75rem' }}>
                {/* DETALLES DEL TERRENO */}
                <div className="pdf-boxed-table" style={{ marginBottom: '0.45rem' }}>
                  <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.22rem 0.5rem', fontSize: '0.76rem', letterSpacing: '0.04em' }}>
                    DETALLES DEL TERRENO
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ borderRight: '1px solid #cbd5e1' }}>
                      <div style={{ padding: '0.12rem 0.45rem', fontWeight: 700, fontSize: '0.68rem', background: '#f1f5f9' }}>
                        SECTOR
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px' }}>Uso:</span>
                        <span className="pdf-data-value">{avaluo.usoSuelo || 'Comercial'}</span>
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px' }}>Nivel socio económico:</span>
                        <span className="pdf-data-value">{avaluo.nivelSocioeconomico || 'Medio-Alto'}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ padding: '0.12rem 0.45rem', fontWeight: 700, fontSize: '0.68rem', background: '#f1f5f9' }}>
                        CARACTERÍSTICAS
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                        <span className="pdf-data-label" style={{ width: '120px' }}>Forma / Pendiente:</span>
                        <span className="pdf-data-value">{avaluo.formaTerreno || 'Regular'} / {avaluo.pendiente || 'Plana'}</span>
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                        <span className="pdf-data-label" style={{ width: '120px' }}>Esquina / Acceso:</span>
                        <span className="pdf-data-value">{avaluo.esquina || 'No'} / {avaluo.accesoCalle || 'Acceso directo'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLINDANCIAS SEGÚN CANTIDAD DE FINCAS (REGISTRALES Y FÍSICAS - SOLICITUD AROLDO) */}
                <div style={{ display: 'grid', gridTemplateColumns: fincas.length > 1 ? '1fr 1fr' : '1fr', gap: '0.45rem' }}>
                  {fincas.map((f, i) => {
                    const col = f.colindancias || (i === 0 ? avaluo.colindancias : {}) || {};
                    const rootCol = avaluo.colindancias || {};

                    const rNorte = col.norte || (i === 0 ? rootCol.norte : '') || 'S/D';
                    const rSur = col.sur || (i === 0 ? rootCol.sur : '') || 'S/D';
                    const rEste = col.este || (i === 0 ? rootCol.este : '') || 'S/D';
                    const rOeste = col.oeste || (i === 0 ? rootCol.oeste : '') || 'S/D';

                    const fNorte = col.norteFisica || (i === 0 ? rootCol.norteFisica : '') || rNorte || 'S/D';
                    const fSur = col.surFisica || (i === 0 ? rootCol.surFisica : '') || rSur || 'S/D';
                    const fEste = col.esteFisica || (i === 0 ? rootCol.esteFisica : '') || rEste || 'S/D';
                    const fOeste = col.oesteFisica || (i === 0 ? rootCol.oesteFisica : '') || rOeste || 'S/D';

                    return (
                      <div key={i} className="pdf-boxed-table" style={{ border: '1px solid #1e293b' }}>
                        <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.2rem 0.4rem', fontSize: '0.74rem', textAlign: 'center', letterSpacing: '0.04em' }}>
                          COLINDANCIAS{fincas.length > 1 ? ` — FINCA: ${f.finca || (i + 1)}` : ''}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ width: '48px', padding: '0.14rem 0.3rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #cbd5e1' }}>RUMBO</th>
                              <th style={{ padding: '0.14rem 0.3rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #cbd5e1' }}>REGISTRAL (RGP)</th>
                              <th style={{ padding: '0.14rem 0.3rem', textAlign: 'left', fontWeight: 700, color: company.accentColor }}>FÍSICA (IN SITU)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.14rem 0.3rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Norte:</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', borderRight: '1px solid #cbd5e1', lineHeight: 1.25 }}>{rNorte}</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', lineHeight: 1.25 }}>{fNorte}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.14rem 0.3rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Sur:</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', borderRight: '1px solid #cbd5e1', lineHeight: 1.25 }}>{rSur}</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', lineHeight: 1.25 }}>{fSur}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.14rem 0.3rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Este:</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', borderRight: '1px solid #cbd5e1', lineHeight: 1.25 }}>{rEste}</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', lineHeight: 1.25 }}>{fEste}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '0.14rem 0.3rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Oeste:</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', borderRight: '1px solid #cbd5e1', lineHeight: 1.25 }}>{rOeste}</td>
                              <td style={{ padding: '0.14rem 0.3rem', color: '#0f172a', lineHeight: 1.25 }}>{fOeste}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Línea de Cierre Legal de la Hoja */}
            <div style={{ marginTop: '0.85rem', padding: '0.35rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.04em' }}>
              <strong>*** FIN DE LA INFORMACIÓN REGISTRAL Y CATASTRAL ***</strong>
            </div>
          </div>

          <PageFooter pageNum={4} />
        </section>

        {/* ==============================================================
            PÁGINA 5: SERVICIOS Y CARACTERÍSTICAS DE CONSTRUCCIÓN
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            {/* CORRECCIÓN: Lista oficial de Servicios e Infraestructura (31 Elementos solicitados por Aroldo) */}
            <div className="pdf-boxed-table">
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.35rem 0.6rem', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                SERVICIOS E INFRAESTRUCTURA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {/* Columna Izquierda: Elementos 1 al 16 */}
                <div style={{ borderRight: '1px solid #cbd5e1' }}>
                  {SERVICIOS_INFRAESTRUCTURA_LIST.slice(0, 16).map((item, idx) => (
                    <div key={item.key} className="pdf-data-row" style={{ padding: '0.14rem 0.45rem', borderBottom: idx === 15 ? 'none' : '1px solid #e2e8f0' }}>
                      <span className="pdf-data-label" style={{ width: '150px', fontSize: '0.67rem', color: '#334155', fontWeight: 600 }}>
                        {item.label}:
                      </span>
                      <span className="pdf-data-value" style={{ fontSize: '0.67rem', color: '#0f172a' }}>
                        {avaluo.servicios?.[item.key] !== undefined && avaluo.servicios?.[item.key] !== '' ? avaluo.servicios[item.key] : item.defaultVal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Columna Derecha: Elementos 17 al 31 */}
                <div>
                  {SERVICIOS_INFRAESTRUCTURA_LIST.slice(16).map((item, idx) => (
                    <div key={item.key} className="pdf-data-row" style={{ padding: '0.14rem 0.45rem', borderBottom: idx === 14 ? 'none' : '1px solid #e2e8f0' }}>
                      <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.67rem', color: '#334155', fontWeight: 600 }}>
                        {item.label}:
                      </span>
                      <span className="pdf-data-value" style={{ fontSize: '0.67rem', color: '#0f172a' }}>
                        {avaluo.servicios?.[item.key] !== undefined && avaluo.servicios?.[item.key] !== '' ? avaluo.servicios[item.key] : item.defaultVal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {avaluo.serviciosAdicionales?.length > 0 && (
                <div style={{ borderTop: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: company.navyColor, marginBottom: '2px' }}>
                    Servicios Adicionales:
                  </div>
                  <div style={{ fontSize: '0.67rem', color: '#334155' }}>
                    {avaluo.serviciosAdicionales.join(' • ')}
                  </div>
                </div>
              )}
            </div>

            {/* Características de Construcción */}
            <div className="pdf-boxed-table" style={{ marginTop: '0.85rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.35rem 0.6rem', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                CARACTERÍSTICAS DE CONSTRUCCIÓN
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Edad aproximada:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.edadAprox || '5 años'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Estado actual:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}><strong>{avaluo.construccion?.estadoActual || 'Bueno'}</strong></span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Construcciones apropiadas al sector:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.apropiadaSector || 'Sí'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Distribución:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.distribucion || 'Ambientes completos'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Estructura:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.estructura || 'Concreto armado y mampostería'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Paredes:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.paredes || 'Block pómez con repello y cernido'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Techo y entre piso:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.techoEntrePiso || 'Losa de concreto'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Piso:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.piso || 'Cerámico'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Puertas:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.puertas || 'Madera y metal'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Ventanas:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.ventanas || 'Aluminio y vidrio'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Instalación sanitaria:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.sanitaria || 'Artefactos estándar'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Instalación eléctrica:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.electrica || 'Instalación empotrada'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Factores positivos:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.factoresPositivos || 'Ubicación y estado de conservación'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.18rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Factores negativos:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.construccion?.factoresNegativos || 'Ninguno de gravedad'}</span>
              </div>
            </div>
          </div>

          <PageFooter pageNum={5} />
        </section>

        {/* ==============================================================
            PÁGINA 6: DICTAMEN DE GARANTÍA Y VALUACIÓN COMERCIAL
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-dictamen-callout" style={{ border: '1px solid #0f172a', background: '#f8fafc', padding: '0.65rem 0.85rem', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.45, textAlign: 'justify' }}>
              {avaluo.dictamenGarantia !== undefined && avaluo.dictamenGarantia !== '' 
                ? avaluo.dictamenGarantia 
                : DEFAULT_DICTAMEN_GARANTIA}
            </div>

            {/* SECCIÓN 1: VALUACIÓN COMERCIAL */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.85rem', marginBottom: '0.45rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                1. VALUACIÓN COMERCIAL
              </div>

              {/* TABLA DE VALORACIÓN DEL TERRENO: Solo si aplicaTerreno es true */}
              {aplicaTerreno && (
                <div className="pdf-valuation-block" style={{ marginBottom: '0.6rem' }}>
                  <table className="pdf-blue-table">
                    <thead>
                      <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                        <th colSpan={6} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.85rem', padding: '0.3rem', border: `1px solid ${company.navyColor}` }}>TERRENO</th>
                      </tr>
                      <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.78rem' }}>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>FINCA</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>EQUIVALENTE EN VARAS² (v²)</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.78rem' }}>
                      {terrainItems.map((item, i) => {
                        const areaVal = Number(item.area || 0);
                        const varas = Number(item.varasCuadradas || (areaVal * 1.43115));
                        const unitVal = Number(item.valorUnitario || 0);
                        const subtotal = item.total != null ? Number(item.total) : parseFloat((areaVal * unitVal).toFixed(2));

                        return (
                          <tr key={i}>
                            <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.28rem 0.4rem' }}>{item.finca || `Finca ${i + 1}`}</td>
                            <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{areaVal.toFixed(2)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: company.accentColor, padding: '0.28rem 0.4rem' }}>
                              {varas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{item.unidad || 'm²'}</td>
                            <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>{formatQ(unitVal)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.28rem 0.4rem' }}>{formatQ(subtotal)}</td>
                          </tr>
                        );
                      })}
                      {terrainItems.length > 1 && (
                        <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>TOTAL:</td>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{totalTerrenoArea.toFixed(2)}</td>
                          <td style={{ textAlign: 'center', color: company.accentColor, padding: '0.28rem 0.4rem' }}>
                            {totalTerrenoVaras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>m²</td>
                          <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>-</td>
                          <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.28rem 0.4rem' }}>{formatQ(totalTerrenoSubtotal)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABLA DE VALORACIÓN DE CONSTRUCCIÓN */}
              <div className="pdf-valuation-block" style={{ marginBottom: '0.6rem' }}>
                <table className="pdf-blue-table">
                  <thead>
                    <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                      <th colSpan={5} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.85rem', padding: '0.3rem', border: `1px solid ${company.navyColor}` }}>CONSTRUCCION</th>
                    </tr>
                    <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.78rem' }}>
                      <th style={{ background: company.navyColor, color: '#ffffff', textAlign: 'left', paddingLeft: '8px', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>DESCRIPCIÓN</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.78rem' }}>
                    {constructionItems.map((item, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'left', paddingLeft: '8px', fontWeight: 600, padding: '0.28rem 0.4rem' }}>{item.descripcion || 'Construcción'}</td>
                        <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{Number(item.area || 0).toFixed(2)}</td>
                        <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{item.unidad || 'm²'}</td>
                        <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>{formatQ(item.valorUnitario)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.28rem 0.4rem' }}>
                          {formatQ(item.total != null ? item.total : (Number(item.area || 0) * Number(item.valorUnitario || 0)))}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                      <td style={{ textAlign: 'left', paddingLeft: '8px', padding: '0.28rem 0.4rem' }}>TOTAL CONSTRUCCIÓN:</td>
                      <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{totalConstruccionArea.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>m²</td>
                      <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>-</td>
                      <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.28rem 0.4rem' }}>{formatQ(totalConstruccionTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Resumen Total al Pie de la Valuación Comercial */}
              <div style={{ marginTop: '0.6rem', padding: '0.65rem 1rem', background: '#f8fafc', border: `1.5px solid ${company.navyColor}`, borderRadius: '4px', textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  SUMA TOTAL VALOR COMERCIAL:
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: company.navyColor, margin: '2px 0' }}>
                  {formatQ(computedComercialGTQ)}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                  Equivalente en Dólares: <strong style={{ color: company.accentColor }}>{formatUSD(computedComercialUSD)}</strong> (T/C: {avaluo.tipoCambio})
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={6} />
        </section>

        {/* ==============================================================
            PÁGINA 7: VALUACIÓN BANCARIA
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            {/* SECCIÓN 2: VALUACIÓN BANCARIA */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.85rem', marginBottom: '0.45rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                2. VALUACIÓN BANCARIA
              </div>

              {/* TABLA DE VALORACIÓN DEL TERRENO BANCARIO: Solo si aplicaTerreno es true */}
              {aplicaTerreno && (
                <div className="pdf-valuation-block" style={{ marginBottom: '0.6rem' }}>
                  <table className="pdf-blue-table">
                    <thead>
                      <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                        <th colSpan={6} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.85rem', padding: '0.3rem', border: `1px solid ${company.navyColor}` }}>TERRENO</th>
                      </tr>
                      <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.78rem' }}>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>FINCA</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>EQUIVALENTE EN VARAS² (v²)</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                        <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.78rem' }}>
                      {terrainItems.map((item, i) => {
                        const areaVal = Number(item.area || 0);
                        const varas = Number(item.varasCuadradas || (areaVal * 1.43115));
                        const unitVal80 = parseFloat((Number(item.valorUnitario || 0) * 0.8).toFixed(2));
                        const subtotal80 = parseFloat(((item.total != null ? Number(item.total) : (areaVal * Number(item.valorUnitario || 0))) * 0.8).toFixed(2));

                        return (
                          <tr key={i}>
                            <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.28rem 0.4rem' }}>{item.finca || `Finca ${i + 1}`}</td>
                            <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{areaVal.toFixed(2)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: company.accentColor, padding: '0.28rem 0.4rem' }}>
                              {varas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{item.unidad || 'm²'}</td>
                            <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>{formatQ(unitVal80)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.28rem 0.4rem' }}>{formatQ(subtotal80)}</td>
                          </tr>
                        );
                      })}
                      {terrainItems.length > 1 && (
                        <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>TOTAL:</td>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{totalTerrenoArea.toFixed(2)}</td>
                          <td style={{ textAlign: 'center', color: company.accentColor, padding: '0.28rem 0.4rem' }}>
                            {totalTerrenoVaras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>m²</td>
                          <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>-</td>
                          <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.28rem 0.4rem' }}>{formatQ(parseFloat((totalTerrenoSubtotal * 0.8).toFixed(2)))}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABLA DE VALORACIÓN DE CONSTRUCCIÓN BANCARIA */}
              <div className="pdf-valuation-block" style={{ marginBottom: '0.6rem' }}>
                <table className="pdf-blue-table">
                  <thead>
                    <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                      <th colSpan={5} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.85rem', padding: '0.3rem', border: `1px solid ${company.navyColor}` }}>CONSTRUCCION</th>
                    </tr>
                    <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.78rem' }}>
                      <th style={{ background: company.navyColor, color: '#ffffff', textAlign: 'left', paddingLeft: '8px', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>DESCRIPCIÓN</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                      <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.28rem 0.4rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '0.78rem' }}>
                    {constructionItems.map((item, i) => {
                      const unit80 = parseFloat((Number(item.valorUnitario || 0) * 0.8).toFixed(2));
                      const subtotal80 = parseFloat(((item.total != null ? Number(item.total) : (Number(item.area || 0) * Number(item.valorUnitario || 0))) * 0.8).toFixed(2));
                      return (
                        <tr key={i}>
                          <td style={{ textAlign: 'left', paddingLeft: '8px', fontWeight: 600, padding: '0.28rem 0.4rem' }}>{item.descripcion || 'Construcción'}</td>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{Number(item.area || 0).toFixed(2)}</td>
                          <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{item.unidad || 'm²'}</td>
                          <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>{formatQ(unit80)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.28rem 0.4rem' }}>{formatQ(subtotal80)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                      <td style={{ textAlign: 'left', paddingLeft: '8px', padding: '0.28rem 0.4rem' }}>TOTAL CONSTRUCCIÓN:</td>
                      <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>{totalConstruccionArea.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', padding: '0.28rem 0.4rem' }}>m²</td>
                      <td style={{ textAlign: 'right', padding: '0.28rem 0.4rem' }}>-</td>
                      <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.28rem 0.4rem' }}>{formatQ(parseFloat((totalConstruccionTotal * 0.8).toFixed(2)))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Resumen Total Bancario - Solicitado por Aroldo */}
              <div style={{ marginTop: '0.6rem', padding: '0.65rem 1rem', background: '#f8fafc', border: `1.5px solid ${company.navyColor}`, borderRadius: '4px', textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  SUMA TOTAL VALOR BANCARIO:
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: company.navyColor, margin: '2px 0' }}>
                  {formatQ(computedBancarioGTQ)}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                  Equivalente en Dólares: <strong style={{ color: company.accentColor }}>{formatUSD(computedBancarioUSD)}</strong> (T/C: {avaluo.tipoCambio})
                </div>
              </div>
            </div>

            {/* Cláusula de cierre de valoración para evitar alteraciones o adiciones */}
            <div style={{ marginTop: '0.75rem', padding: '0.35rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.04em' }}>
              <strong>*** ÚLTIMA LÍNEA DE CÁLCULO DE VALORACIÓN — FIN DEL CUADRO DE LIQUIDACIÓN ***</strong>
            </div>
          </div>

          <PageFooter pageNum={7} />
        </section>

        {/* ==============================================================
            PÁGINAS DE FOTOGRAFÍAS (ENTORNO, INGRESO, INTERIOR, UBICACIÓN, CROQUIS)
            Sección oficial del informe de avalúos. Muestra el registro fotográfico o los recuadros oficiales cerrados.
            Soporta múltiples fotos por sección distribuidas dinámicamente en páginas sin desbordamiento.
            ============================================================== */}
        {photoPages.map((pageCards, pIdx) => (
          <section key={`photo-page-${pIdx}`} className="pdf-sheet-page">
            <PageHeader />

            <div className="pdf-sheet-content">
              <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
                FOTOGRAFÍAS {photoPages.length > 1 ? `(PARTE ${pIdx + 1} DE ${photoPages.length})` : ''}
              </div>

              {/* Visualización robusta de fotos con carga síncrona para PDF */}
              <div className="pdf-photos-layout">
                {pageCards.map((card) => (
                  <div 
                    key={card.id} 
                    className="pdf-photo-box" 
                    style={card.span === 2 ? { gridColumn: 'span 2' } : {}}
                  >
                    <div className="pdf-photo-num">{card.label}</div>
                    <div 
                      className="pdf-photo-frame" 
                      style={{ height: card.span === 2 ? '180px' : '140px' }}
                    >
                      {card.src ? (
                        <img 
                          src={card.src} 
                          alt={card.label} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: card.category === 'croquis' ? 'contain' : 'cover', 
                            display: 'block' 
                          }} 
                          loading="eager" 
                          decoding="sync" 
                        />
                      ) : (
                        <div className="pdf-photo-empty" style={{ background: '#f8fafc', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>[ RECUADRO CERRADO — SIN REGISTRO ]</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Seguridad Contractual {company.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PageFooter pageNum={8 + pIdx} />
          </section>
        ))}

        {/* ==============================================================
            PÁGINA: MATRICULA DICABI Y RESUMEN DE CONSULTAS ELECTRÓNICAS RGP
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              MATRICULA DICABI
            </div>

            {normalizedFotos.dicabi.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: normalizedFotos.dicabi.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {normalizedFotos.dicabi.map((src, idx) => (
                  <div key={idx} className="pdf-photo-frame" style={{ height: '320px' }}>
                    <img 
                      src={src} 
                      alt={`Matrícula DICABI ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
                      loading="eager" 
                      decoding="sync" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pdf-photo-frame" style={{ height: '220px', marginBottom: '1.5rem' }}>
                <div className="pdf-photo-empty" style={{ background: '#f8fafc', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>[ RECUADRO CERRADO — DOCUMENTO DICABI NO ADJUNTO ]</span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                    {avaluo.dicabiMatricula ? `Matrícula: ${avaluo.dicabiMatricula} • ` : ''}Seguridad Contractual {company.name}
                  </span>
                </div>
              </div>
            )}

            {/* Resumen de Consultas Electrónicas RGP */}
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              CONSULTAS ELECTRÓNICAS DEL REGISTRO GENERAL DE LA PROPIEDAD (RGP)
            </div>

            {rgpPages && rgpPages.length > 0 ? (
              <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: company.navyColor, fontWeight: 700, fontSize: '0.82rem' }}>
                  <FileText size={18} style={{ color: company.accentColor }} />
                  <span>Certificaciones Registrales Incorporadas ({rgpPages.length} {rgpPages.length === 1 ? 'página' : 'páginas'})</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                  Las certificaciones registrales electrónicas oficiales se presentan a continuación desglosadas a página completa (<strong>1 página por hoja</strong>) para garantizar la total legibilidad de sellos, firmas, razones registrales e historial de dominio.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {avaluo.consultasPdfs && avaluo.consultasPdfs.length > 0 ? (
                    avaluo.consultasPdfs.map((docItem, dIdx) => (
                      <div key={dIdx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: company.navyColor }}>{docItem.name}</span>
                        {docItem.pages && docItem.pages.length > 0 && (
                          <span style={{ background: avaluoTenant.colores?.lightBg || '#ecfdf5', color: company.accentColor, padding: '1px 6px', borderRadius: '3px', fontWeight: 600, fontSize: '0.68rem' }}>
                            {docItem.pages.length} {docItem.pages.length === 1 ? 'pág.' : 'págs.'}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 10px', fontSize: '0.72rem', color: company.navyColor, fontWeight: 600 }}>
                      {rgpPages.length} {rgpPages.length === 1 ? 'página adjunta' : 'páginas adjuntas'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pdf-photo-frame" style={{ height: '150px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>[ RECUADRO CERRADO — SIN CERTIFICACIONES RGP ADJUNTAS ]</span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>Inmueble amparado bajo antecedentes registrales verificados en cuerpo del dictamen</span>
              </div>
            )}
          </div>

          <PageFooter pageNum={dicabiPageNum} />
        </section>

        {/* ==============================================================
            PÁGINAS DE CERTIFICACIONES RGP: 1 DOCUMENTO POR HOJA
            ============================================================== */}
        {rgpPages.map((p, pIdx) => (
          <section key={p.id || `rgp-page-${pIdx}`} className="pdf-sheet-page">
            <PageHeader />

            <div className="pdf-sheet-content">
              <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.88rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.4rem', marginBottom: '0.65rem' }}>
                CONSULTAS ELECTRÓNICAS DEL REGISTRO GENERAL DE LA PROPIEDAD (RGP)
              </div>

              {/* Encabezado del documento individual y numeración de página */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem 0.85rem', marginBottom: '0.65rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: company.navyColor }}>
                  <FileText size={16} style={{ color: company.accentColor, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </span>
                <span style={{ background: company.navyColor, color: '#ffffff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, flexShrink: 0 }}>
                  Página {p.pageIndex} de {p.totalPaginas}
                </span>
              </div>

              {/* Imagen a página completa: 1 por hoja para máxima legibilidad */}
              <div className="pdf-photo-frame" style={{ height: '780px', maxHeight: '810px', background: '#ffffff', border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={p.dataUrl} 
                  alt={`Certificación RGP - ${p.name} (Pág. ${p.pageIndex})`} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
                  loading="eager" 
                  decoding="sync" 
                />
              </div>
            </div>

            <PageFooter pageNum={dicabiPageNum + 1 + pIdx} />
          </section>
        ))}

      </div>
    </div>
  );
}
