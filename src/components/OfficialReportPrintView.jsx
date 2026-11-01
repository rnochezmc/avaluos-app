import React from 'react';
import { X, Printer, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { SERVICIOS_INFRAESTRUCTURA_LIST } from '../data/serviciosConstants';
import { extractAllRgpPages, numeroALetras, formatFechaEnLetras } from '../utils/pdfHelper';
import { DEFAULT_DICTAMEN_GARANTIA } from '../data/mockAvaluos';
import { getTenantConfig } from '../data/tenantsConfig';
import { getAvaluoFromLocalDb } from '../utils/localDb';
import { fetchFotosFromCloud } from '../firebase';

export default function OfficialReportPrintView({ avaluo: propAvaluo, onClose, config = {} }) {
  const [hydratedAvaluo, setHydratedAvaluo] = React.useState(propAvaluo);

  React.useEffect(() => {
    setHydratedAvaluo(propAvaluo);
    if (propAvaluo?.id) {
      // 1. Hidratación local desde IndexedDB
      getAvaluoFromLocalDb(propAvaluo.id).then(localItem => {
        if (localItem) {
          setHydratedAvaluo(prev => {
            const prevFotos = prev?.fotos || {};
            const localFotos = localItem.fotos || {};
            const mergedFotos = { ...prevFotos };
            ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
              const lList = Array.isArray(localFotos[cat]) ? localFotos[cat] : (localFotos[cat] ? [localFotos[cat]] : []);
              const pList = Array.isArray(mergedFotos[cat]) ? mergedFotos[cat] : (mergedFotos[cat] ? [mergedFotos[cat]] : []);
              if (lList.length > 0 && pList.length === 0) {
                mergedFotos[cat] = lList;
              }
            });

            const hasLocalPdfs = Array.isArray(localItem.consultasPdfs) && 
              localItem.consultasPdfs.some(d => Array.isArray(d.pages) && d.pages.some(p => p.dataUrl));

            return {
              ...prev,
              fotos: mergedFotos,
              consultasPdfs: hasLocalPdfs ? localItem.consultasPdfs : prev.consultasPdfs
            };
          });
        }
      }).catch(err => console.warn('Error hydrating local in print view:', err));

      // 2. Hidratación desde Firestore fotosGallery (sincronización entre dispositivos)
      fetchFotosFromCloud(propAvaluo.id).then(cloudFotos => {
        if (cloudFotos) {
          setHydratedAvaluo(prev => {
            const currentFotos = prev?.fotos || {};
            const mergedFotos = { ...currentFotos };
            ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
              const cList = Array.isArray(cloudFotos[cat]) ? cloudFotos[cat] : [];
              const curList = Array.isArray(mergedFotos[cat]) ? mergedFotos[cat] : (mergedFotos[cat] ? [mergedFotos[cat]] : []);
              if (cList.length > 0 && (curList.length === 0 || cList.length >= curList.length)) {
                mergedFotos[cat] = cList;
              }
            });

            return {
              ...prev,
              fotos: mergedFotos
            };
          });
        }
      }).catch(err => console.warn('Error fetching cloud fotos for print:', err));
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

  const MESES_ES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const formatDateSpanish = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr === 'N/A') return '-';
    const s = String(dateStr).trim();
    if (/de\s+[a-záéíóú]+/i.test(s)) return s;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-');
      const monthIdx = parseInt(m, 10) - 1;
      const day = parseInt(d, 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} de ${MESES_ES[monthIdx]} de ${y}`;
      }
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split('/');
      const monthIdx = parseInt(m, 10) - 1;
      const day = parseInt(d, 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} de ${MESES_ES[monthIdx]} de ${y}`;
      }
    }
    return s;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr === 'N/A') return '';
    return formatDateSpanish(dateStr);
  };

  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = React.useState(false);
  const [rgpPages, setRgpPages] = React.useState([]);

  React.useEffect(() => {
    const handleAfterPrint = () => {
      setIsPreparingPrint(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

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
    setIsPreparingPrint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPreparingPrint(false);
      }, 1000);
    }, 100);
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

  const getLimitacionVal = (val, defaultVal) => {
    if (val === 'Si' || val === 'Sí' || val === true) return 'Si';
    if (val === 'No' || val === false) return 'No';
    return defaultVal;
  };

  const limitacionesCheck = {
    gravamenes: getLimitacionVal(
      avaluo?.limitacionesCheck?.gravamenes ?? avaluo?.limitacionGravamenes,
      (avaluo?.gravamenes && !/libre|ningun|sin grav/i.test(avaluo.gravamenes.trim())) ? 'Si' : 'Si'
    ),
    servidumbres: getLimitacionVal(
      avaluo?.limitacionesCheck?.servidumbres ?? avaluo?.limitacionServidumbres,
      (avaluo?.servidumbres && !/sin servidumbres|no aplica|ningun/i.test(avaluo.servidumbres.trim())) ? 'Si' : 'Si'
    ),
    areasComunes: getLimitacionVal(
      avaluo?.limitacionesCheck?.areasComunes ?? avaluo?.limitacionAreasComunes,
      (avaluo?.areasComunes && !/no aplica|sin areas|ningun/i.test(avaluo.areasComunes.trim())) ? 'Si' : 
        (avaluo?.desmembracion && /elementos comunes|areas comunes/i.test(avaluo.desmembracion.trim()) ? 'Si' : 'Si')
    ),
    desmembracion: getLimitacionVal(
      avaluo?.limitacionesCheck?.desmembracion ?? avaluo?.limitacionDesmembracion,
      (avaluo?.desmembracion && !/sin desmembracion|no aplica|ningun/i.test(avaluo.desmembracion.trim()) && !/elementos comunes|areas comunes/i.test(avaluo.desmembracion.trim())) ? 'Si' : 'No'
    ),
    copropiedad: getLimitacionVal(
      avaluo?.limitacionesCheck?.copropiedad ?? avaluo?.limitacionCopropiedad,
      (avaluo?.tipoAvaluo === 'Apartamento / PH' || avaluo?.tipoAvaluo === 'Apartamento' || (avaluo?.limitaciones && /copropiedad|propiedad horizontal/i.test(avaluo.limitaciones))) ? 'Si' : 'Si'
    )
  };

  const cleanCodigo = (avaluo.codigo || '').replace(/^(AVAL[UÚ]O:?\s*)+/i, '').trim();

  // Reusable Page Header with Official Lex Rosam Logo
  const PageHeader = () => (
    <div className="pdf-page-header" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.4rem', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img 
          src={company.logoUrl} 
          alt={company.name} 
          style={{ height: '65px', width: 'auto', objectFit: 'contain' }}
        />
      </div>
      <div className="pdf-header-code" style={{ fontSize: '0.95rem', fontWeight: 800, color: company.navyColor }}>
        AVALÚO: {cleanCodigo}
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

  const MAX_PAGE1_FINCAS = 4;
  const page1Fincas = fincas.slice(0, MAX_PAGE1_FINCAS);
  const page2Fincas = fincas.length > MAX_PAGE1_FINCAS ? fincas.slice(MAX_PAGE1_FINCAS) : [];

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

    // Paginación oficial: exactamente 2 fotografías por página máximo (tamaño media carta)
    const pages = [];
    const PHOTOS_PER_PAGE = 2;
    for (let i = 0; i < cards.length; i += PHOTOS_PER_PAGE) {
      pages.push(cards.slice(i, i + PHOTOS_PER_PAGE));
    }

    return pages.length > 0 ? pages : [[]];
  }, [normalizedFotos]);

  // Desglose oficial de fincas a ancho completo homologado por los bancos:
  // Si aplica terreno y colindancias, en Página 4 cabe 1 finca completa con DICABI y Colindancias a ancho completo.
  // Si no aplican colindancias, caben exactamente 2 fincas de DICABI a ancho completo.
  const fincasOnPage4Count = showTerrenoSections ? 1 : 2;
  const page4Fincas = fincas.slice(0, fincasOnPage4Count);
  const extraFincas = fincas.slice(fincasOnPage4Count);

  // Si hay más fincas (ej. 2 a 7 fincas), fluyen dinámicamente en hojas de continuación (caben 3 fincas por página a ancho completo sin desborde)
  const FINCAS_PER_PAGE = 3;
  const extraFincaPages = React.useMemo(() => {
    if (extraFincas.length === 0) return [];
    const pages = [];
    for (let i = 0; i < extraFincas.length; i += FINCAS_PER_PAGE) {
      pages.push(extraFincas.slice(i, i + FINCAS_PER_PAGE));
    }
    return pages;
  }, [extraFincas]);

  // Cálculo dinámico y matemático exacto de páginas antes de fotos según fincas:
  const pagesBeforePhotos = 6 + extraFincaPages.length;

  const extraPagesBeforePhotos = pagesBeforePhotos - 6;
  const totalPhotoPages = photoPages.length;
  const dicabiPageNum = pagesBeforePhotos + 1 + totalPhotoPages;
  const totalRgpPages = rgpPages.length;
  const totalPages = dicabiPageNum + totalRgpPages;

  // Helpers para renderizado continuo y fluido de Servicios, Construcción y Valuaciones
  const renderServiciosBox = () => (
    <div className="pdf-boxed-table" style={{ marginTop: '0.45rem' }}>
      <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.22rem 0.5rem', fontSize: '0.74rem', letterSpacing: '0.04em' }}>
        SERVICIOS E INFRAESTRUCTURA
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Columna Izquierda: Elementos 1 al 16 */}
        <div style={{ borderRight: '1px solid #cbd5e1' }}>
          {SERVICIOS_INFRAESTRUCTURA_LIST.slice(0, 16).map((item, idx) => (
            <div key={item.key} className="pdf-data-row" style={{ padding: '0.1rem 0.4rem', borderBottom: idx === 15 ? 'none' : '1px solid #e2e8f0' }}>
              <span className="pdf-data-label" style={{ width: '150px', fontSize: '0.66rem', color: '#334155', fontWeight: 600 }}>
                {item.label}:
              </span>
              <span className="pdf-data-value" style={{ fontSize: '0.66rem', color: '#0f172a' }}>
                {avaluo.servicios?.[item.key] !== undefined && avaluo.servicios?.[item.key] !== '' ? avaluo.servicios[item.key] : item.defaultVal}
              </span>
            </div>
          ))}
        </div>

        {/* Columna Derecha: Elementos 17 al 31 */}
        <div>
          {SERVICIOS_INFRAESTRUCTURA_LIST.slice(16).map((item, idx) => (
            <div key={item.key} className="pdf-data-row" style={{ padding: '0.1rem 0.4rem', borderBottom: idx === 14 ? 'none' : '1px solid #e2e8f0' }}>
              <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.66rem', color: '#334155', fontWeight: 600 }}>
                {item.label}:
              </span>
              <span className="pdf-data-value" style={{ fontSize: '0.66rem', color: '#0f172a' }}>
                {avaluo.servicios?.[item.key] !== undefined && avaluo.servicios?.[item.key] !== '' ? avaluo.servicios[item.key] : item.defaultVal}
              </span>
            </div>
          ))}
        </div>
      </div>

      {avaluo.serviciosAdicionales?.length > 0 && (
        <div style={{ borderTop: '1px solid #cbd5e1', padding: '0.18rem 0.45rem', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: company.navyColor, marginBottom: '2px' }}>
            Servicios Adicionales:
          </div>
          <div style={{ fontSize: '0.65rem', color: '#334155' }}>
            {avaluo.serviciosAdicionales.join(' • ')}
          </div>
        </div>
      )}
    </div>
  );

  const construccionItemsList = [
    { label: 'Edad aproximada', value: avaluo.construccion?.edadAprox || '1 año' },
    { label: 'Estado actual', value: avaluo.construccion?.estadoActual || 'Bueno', isBold: true },
    { label: 'Construcciones apropiadas al sector', value: avaluo.construccion?.apropiadaSector || 'Sí, acorde al entorno urbano' },
    { label: 'Distribución', value: avaluo.construccion?.distribucion || 'Ambientes completos según plano' },
    { label: 'Estructura', value: avaluo.construccion?.estructura || 'Concreto armado y mampostería reforzada' },
    { label: 'Paredes', value: avaluo.construccion?.paredes || 'Block pómez con repello y cernido' },
    { label: 'Techo y entre piso', value: avaluo.construccion?.techoEntrePiso || 'Losa maciza de concreto' },
    { label: 'Piso', value: avaluo.construccion?.piso || 'Piso cerámico' },
    { label: 'Puertas', value: avaluo.construccion?.puertas || 'Madera y metal' },
    { label: 'Ventanas', value: avaluo.construccion?.ventanas || 'Aluminio y vidrio claro' },
    { label: 'Instalación sanitaria', value: avaluo.construccion?.sanitaria || 'Artefactos estándar en buen estado' },
    { label: 'Instalación eléctrica', value: avaluo.construccion?.electrica || 'Instalación empotrada protegida' },
    { label: 'Factores positivos', value: avaluo.construccion?.factoresPositivos || 'Excelente ubicación y mantenimiento continuo' },
    { label: 'Factores negativos', value: avaluo.construccion?.factoresNegativos || 'Ninguno de gravedad' },
  ];

  const renderConstruccionTable = (items, title = 'CARACTERÍSTICAS DE CONSTRUCCIÓN', marginTop = '0.45rem') => (
    <div className="pdf-boxed-table" style={{ marginTop }}>
      <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.18rem 0.5rem', fontSize: '0.74rem', letterSpacing: '0.04em' }}>
        {title}
      </div>
      {items.map((it, idx) => (
        <div key={idx} className="pdf-data-row" style={{ padding: '0.08rem 0.45rem', fontSize: '0.67rem', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
          <span className="pdf-data-label" style={{ fontSize: '0.67rem', width: '220px' }}>{it.label}:</span>
          <span className="pdf-data-value" style={{ fontSize: '0.67rem' }}>
            {it.isBold ? <strong>{it.value}</strong> : it.value}
          </span>
        </div>
      ))}
    </div>
  );

  const renderDictamenCallout = () => (
    <div className="pdf-dictamen-callout" style={{ border: '1px solid #0f172a', background: '#f8fafc', padding: '0.45rem 0.65rem', fontSize: '0.73rem', fontStyle: 'italic', marginTop: '0.55rem', marginBottom: '0.2rem', lineHeight: 1.35, textAlign: 'justify' }}>
      {avaluo.dictamenGarantia !== undefined && avaluo.dictamenGarantia !== '' 
        ? avaluo.dictamenGarantia 
        : DEFAULT_DICTAMEN_GARANTIA}
    </div>
  );

  const renderValuacionesBox = () => (
    <>
      {/* SECCIÓN 1: VALUACIÓN COMERCIAL */}
      <div style={{ marginBottom: '0.45rem' }}>
        <div style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.8rem', marginBottom: '0.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          1. VALUACIÓN COMERCIAL
        </div>

        {/* TABLA DE VALORACIÓN DEL TERRENO: Solo si aplicaTerreno es true */}
        {aplicaTerreno && (
          <div className="pdf-valuation-block" style={{ marginBottom: '0.4rem' }}>
            <table className="pdf-blue-table">
              <thead>
                <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                  <th colSpan={6} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.78rem', padding: '0.2rem', border: `1px solid ${company.navyColor}` }}>TERRENO</th>
                </tr>
                <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.72rem' }}>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>FINCA</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>EQUIVALENTE EN VARAS² (v²)</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.72rem' }}>
                {terrainItems.map((item, i) => {
                  const areaVal = Number(item.area || 0);
                  const varas = Number(item.varasCuadradas || (areaVal * 1.43115));
                  const unitVal = Number(item.valorUnitario || 0);
                  const subtotal = item.total != null ? Number(item.total) : parseFloat((areaVal * unitVal).toFixed(2));

                  return (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.18rem 0.35rem' }}>{item.finca || `Finca ${i + 1}`}</td>
                      <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{areaVal.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: company.accentColor, padding: '0.18rem 0.35rem' }}>
                        {varas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{item.unidad || 'm²'}</td>
                      <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>{formatQ(unitVal)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.18rem 0.35rem' }}>{formatQ(subtotal)}</td>
                    </tr>
                  );
                })}
                {terrainItems.length > 1 && (
                  <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>TOTAL:</td>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{totalTerrenoArea.toFixed(2)}</td>
                    <td style={{ textAlign: 'center', color: company.accentColor, padding: '0.18rem 0.35rem' }}>
                      {totalTerrenoVaras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>m²</td>
                    <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>-</td>
                    <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.18rem 0.35rem' }}>{formatQ(totalTerrenoSubtotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA DE VALORACIÓN DE CONSTRUCCIÓN COMERCIAL */}
        <div className="pdf-valuation-block" style={{ marginBottom: '0.4rem' }}>
          <table className="pdf-blue-table">
            <thead>
              <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                <th colSpan={5} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.78rem', padding: '0.2rem', border: `1px solid ${company.navyColor}` }}>CONSTRUCCION</th>
              </tr>
              <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.72rem' }}>
                <th style={{ background: company.navyColor, color: '#ffffff', textAlign: 'left', paddingLeft: '8px', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>DESCRIPCIÓN</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.72rem' }}>
              {constructionItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'left', paddingLeft: '8px', fontWeight: 600, padding: '0.18rem 0.35rem' }}>{item.descripcion || 'Construcción'}</td>
                  <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{Number(item.area || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{item.unidad || 'm²'}</td>
                  <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>{formatQ(item.valorUnitario)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.18rem 0.35rem' }}>
                    {formatQ(item.total != null ? item.total : (Number(item.area || 0) * Number(item.valorUnitario || 0)))}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                <td style={{ textAlign: 'left', paddingLeft: '8px', padding: '0.18rem 0.35rem' }}>TOTAL CONSTRUCCIÓN:</td>
                <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{totalConstruccionArea.toFixed(2)}</td>
                <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>m²</td>
                <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>-</td>
                <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.18rem 0.35rem' }}>{formatQ(totalConstruccionTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen Total al Pie de la Valuación Comercial */}
        <div style={{ marginTop: '0.25rem', padding: '0.25rem 0.65rem', background: '#f8fafc', border: `1.5px solid ${company.navyColor}`, borderRadius: '4px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            SUMA TOTAL VALOR COMERCIAL:
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: company.navyColor, margin: '1px 0' }}>
            {formatQ(computedComercialGTQ)}
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#334155' }}>
            Equivalente en Dólares: <strong style={{ color: company.accentColor }}>{formatUSD(computedComercialUSD)}</strong> (T/C: {avaluo.tipoCambio})
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: VALUACIÓN BANCARIA (CONTINUA INMEDIATAMENTE ABAJO) */}
      <div style={{ marginTop: '0.35rem', marginBottom: '0.25rem' }}>
        <div style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.8rem', marginBottom: '0.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          2. VALUACIÓN BANCARIA
        </div>

        {/* TABLA DE VALORACIÓN DEL TERRENO: Solo si aplicaTerreno es true */}
        {aplicaTerreno && (
          <div className="pdf-valuation-block" style={{ marginBottom: '0.35rem' }}>
            <table className="pdf-blue-table">
              <thead>
                <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                  <th colSpan={6} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.78rem', padding: '0.18rem', border: `1px solid ${company.navyColor}` }}>TERRENO</th>
                </tr>
                <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.7rem' }}>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>FINCA</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>EQUIVALENTE EN VARAS² (v²)</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                  <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.7rem' }}>
                {terrainItems.map((item, i) => {
                  const areaVal = Number(item.area || 0);
                  const varas = Number(item.varasCuadradas || (areaVal * 1.43115));
                  const unit80 = parseFloat((Number(item.valorUnitario || 0) * 0.8).toFixed(2));
                  const subtotal80 = parseFloat(((item.total != null ? Number(item.total) : (areaVal * Number(item.valorUnitario || 0))) * 0.8).toFixed(2));

                  return (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', fontWeight: 600, padding: '0.18rem 0.35rem' }}>{item.finca || `Finca ${i + 1}`}</td>
                      <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{areaVal.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: company.accentColor, padding: '0.18rem 0.35rem' }}>
                        {varas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{item.unidad || 'm²'}</td>
                      <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>{formatQ(unit80)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.18rem 0.35rem' }}>{formatQ(subtotal80)}</td>
                    </tr>
                  );
                })}
                {terrainItems.length > 1 && (
                  <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>TOTAL:</td>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{totalTerrenoArea.toFixed(2)}</td>
                    <td style={{ textAlign: 'center', color: company.accentColor, padding: '0.18rem 0.35rem' }}>
                      {totalTerrenoVaras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>m²</td>
                    <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>-</td>
                    <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.18rem 0.35rem' }}>{formatQ(parseFloat((totalTerrenoSubtotal * 0.8).toFixed(2)))}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA DE VALORACIÓN DE CONSTRUCCIÓN BANCARIA (80% DEL VALOR COMERCIAL) */}
        <div className="pdf-valuation-block" style={{ marginBottom: '0.35rem' }}>
          <table className="pdf-blue-table">
            <thead>
              <tr style={{ background: company.navyColor, color: '#ffffff' }}>
                <th colSpan={5} style={{ background: company.navyColor, color: '#ffffff', textAlign: 'center', fontSize: '0.78rem', padding: '0.18rem', border: `1px solid ${company.navyColor}` }}>CONSTRUCCION</th>
              </tr>
              <tr style={{ background: company.navyColor, color: '#ffffff', fontSize: '0.7rem' }}>
                <th style={{ background: company.navyColor, color: '#ffffff', textAlign: 'left', paddingLeft: '8px', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>DESCRIPCIÓN</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>AREA (m²)</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>UNIDAD</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>VALOR</th>
                <th style={{ background: company.navyColor, color: '#ffffff', padding: '0.18rem 0.35rem', border: `1px solid ${company.navyColor}` }}>TOTAL</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.7rem' }}>
              {constructionItems.map((item, i) => {
                const unit80 = parseFloat((Number(item.valorUnitario || 0) * 0.8).toFixed(2));
                const subtotal80 = parseFloat(((item.total != null ? Number(item.total) : (Number(item.area || 0) * Number(item.valorUnitario || 0))) * 0.8).toFixed(2));
                return (
                  <tr key={i}>
                    <td style={{ textAlign: 'left', paddingLeft: '8px', fontWeight: 600, padding: '0.18rem 0.35rem' }}>{item.descripcion || 'Construcción'}</td>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{Number(item.area || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{item.unidad || 'm²'}</td>
                    <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>{formatQ(unit80)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, padding: '0.18rem 0.35rem' }}>{formatQ(subtotal80)}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                <td style={{ textAlign: 'left', paddingLeft: '8px', padding: '0.18rem 0.35rem' }}>TOTAL CONSTRUCCIÓN:</td>
                <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>{totalConstruccionArea.toFixed(2)}</td>
                <td style={{ textAlign: 'center', padding: '0.18rem 0.35rem' }}>m²</td>
                <td style={{ textAlign: 'right', padding: '0.18rem 0.35rem' }}>-</td>
                <td style={{ textAlign: 'right', color: company.navyColor, padding: '0.18rem 0.35rem' }}>{formatQ(parseFloat((totalConstruccionTotal * 0.8).toFixed(2)))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen Total Bancario */}
        <div style={{ marginTop: '0.25rem', padding: '0.25rem 0.65rem', background: '#f8fafc', border: `1.5px solid ${company.navyColor}`, borderRadius: '4px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            SUMA TOTAL VALOR BANCARIO:
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: company.navyColor, margin: '1px 0' }}>
            {formatQ(computedBancarioGTQ)}
          </div>
          <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#334155' }}>
            Equivalente en Dólares: <strong style={{ color: company.accentColor }}>{formatUSD(computedBancarioUSD)}</strong> (T/C: {avaluo.tipoCambio})
          </div>
        </div>
      </div>
    </>
  );

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
            style={{ 
              background: isPreparingPrint ? '#1d4ed8' : '#2563eb', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: (isPreparingPrint || (!imagesLoaded && hasAnyPhoto)) ? 'wait' : 'pointer',
              opacity: (isPreparingPrint || (!imagesLoaded && hasAnyPhoto)) ? 0.9 : 1
            }}
            disabled={(!imagesLoaded && hasAnyPhoto) || isPreparingPrint}
          >
            {isPreparingPrint ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generando vista previa ({totalPages} págs)...</span>
              </>
            ) : (!imagesLoaded && hasAnyPhoto) ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cargando Fotos para PDF...</span>
              </>
            ) : (
              <>
                <Printer size={18} />
                <span>Imprimir / Exportar PDF</span>
              </>
            )}
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
            <div className="pdf-title-line" style={{ color: company.navyColor, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
              <strong>TIPO DE AVALÚO:</strong> {avaluo.tipoAvaluo}
            </div>

            <div className="pdf-boxed-table">
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Solicitante:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}><strong>{avaluo.solicitante}</strong></span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Dirigido a:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}><strong>{avaluo.dirigidoA || avaluo.solicitante}</strong></span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Fecha de solicitud:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{formatDateSpanish(avaluo.fechaSolicitud)}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem', background: '#f8fafc' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Fecha de inspección:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}><strong>{avaluo.fechaInspeccion ? formatDateSpanish(avaluo.fechaInspeccion) : '-'}</strong></span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Fecha de actualización:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{(!avaluo.fechaInspeccion && avaluo.fechaActualizacion) ? formatDateSpanish(avaluo.fechaActualizacion) : '-'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Dirección del inmueble:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.direccion}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Ubicación según coordenadas:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.coordenadas || 'N/A'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Descripción general del inmueble:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.descripcionGeneral || 'N/A'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Bien mostrado por:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.bienMostradoPor || 'N/A'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.5rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Dpi:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.dpi || 'N/A'}</span>
              </div>
            </div>

            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '0.45rem', textAlign: 'center', padding: '0.2rem 0.35rem', fontWeight: 700, fontSize: '0.8rem' }}>
              RESÚMENES
            </div>

            {/* Cuadro de Información Registral con Áreas Individuales por Finca */}
            <div className="pdf-boxed-table" style={{ marginTop: '0.35rem' }}>
              <div className="pdf-subtable-header" style={{ background: '#f1f5f9', fontWeight: 700, padding: '0.18rem 0.45rem', borderBottom: '1px solid #cbd5e1', fontSize: '0.72rem' }}>
                INFORMACIÓN REGISTRAL
              </div>
              <table className="pdf-inner-table" style={{ fontSize: '0.69rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%', padding: '0.12rem 0.35rem' }}>FINCA</th>
                    <th style={{ width: '30%', padding: '0.12rem 0.35rem' }}>FOLIO</th>
                    <th style={{ padding: '0.12rem 0.35rem' }}>LIBRO</th>
                  </tr>
                </thead>
                <tbody>
                  {page1Fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, padding: '0.1rem 0.35rem' }}>{f.finca}</td>
                      <td style={{ padding: '0.1rem 0.35rem' }}>{f.folio}</td>
                      <td style={{ padding: '0.1rem 0.35rem' }}>{f.libro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: '0.18rem 0.45rem', borderTop: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc', fontSize: '0.72rem' }}>
                Propietario:
              </div>
              <table className="pdf-inner-table" style={{ fontSize: '0.69rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%', padding: '0.12rem 0.35rem' }}>FINCA</th>
                    <th style={{ padding: '0.12rem 0.35rem' }}>Propietario</th>
                  </tr>
                </thead>
                <tbody>
                  {page1Fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, padding: '0.1rem 0.35rem' }}>{f.finca}</td>
                      <td style={{ padding: '0.1rem 0.35rem' }}>{f.propietario || avaluo.propietarioPrincipal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cada finca muestra su propia área registrada y valuada individualmente */}
              <div style={{ padding: '0.18rem 0.45rem', borderTop: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc', fontSize: '0.72rem' }}>
                Área registrada:
              </div>
              <table className="pdf-inner-table" style={{ fontSize: '0.69rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%', padding: '0.12rem 0.35rem' }}>FINCA</th>
                    <th style={{ padding: '0.12rem 0.35rem' }}>Área</th>
                  </tr>
                </thead>
                <tbody>
                  {page1Fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, padding: '0.1rem 0.35rem' }}>{f.finca}</td>
                      <td style={{ padding: '0.1rem 0.35rem' }}>{Number(f.areaRegistrada || f.areaActualRegistrada || avaluo.areaRegistrada || 0).toFixed(6)} m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: '0.18rem 0.45rem', borderTop: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc', fontSize: '0.72rem' }}>
                Área valuada:
              </div>
              <table className="pdf-inner-table" style={{ fontSize: '0.69rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '30%', padding: '0.12rem 0.35rem' }}>FINCA</th>
                    <th style={{ padding: '0.12rem 0.35rem' }}>Área</th>
                  </tr>
                </thead>
                <tbody>
                  {page1Fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, padding: '0.1rem 0.35rem' }}>{f.finca}</td>
                      <td style={{ fontWeight: 600, color: company.navyColor, padding: '0.1rem 0.35rem' }}>
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
            PÁGINA 2: VALORES Y FIRMAS DE VALUADORES
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            {/* Si hay más de 4 fincas, la información registral restante continúa al inicio de la Página 2 */}
            {page2Fincas.length > 0 && (
              <div className="pdf-boxed-table" style={{ marginBottom: '0.65rem' }}>
                <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}>
                  INFORMACIÓN REGISTRAL (CONTINUACIÓN DE FINCAS)
                </div>
                <table className="pdf-inner-table" style={{ fontSize: '0.69rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ width: '25%', padding: '0.12rem 0.35rem' }}>FINCA</th>
                      <th style={{ width: '20%', padding: '0.12rem 0.35rem' }}>FOLIO</th>
                      <th style={{ width: '25%', padding: '0.12rem 0.35rem' }}>LIBRO</th>
                      <th style={{ padding: '0.12rem 0.35rem' }}>ÁREA REGISTRADA / VALUADA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page2Fincas.map((f, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, padding: '0.1rem 0.35rem' }}>{f.finca}</td>
                        <td style={{ padding: '0.1rem 0.35rem' }}>{f.folio}</td>
                        <td style={{ padding: '0.1rem 0.35rem' }}>{f.libro}</td>
                        <td style={{ padding: '0.1rem 0.35rem' }}>
                          {Number(f.areaRegistrada || f.areaActualRegistrada || avaluo.areaRegistrada || 0).toFixed(6)} m² / <strong style={{ color: company.navyColor }}>{Number(f.areaValuada || 0).toFixed(6)} m²</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sección Limitaciones (conceptos oficiales) */}
            <div className="pdf-boxed-table" style={{ marginBottom: '0.85rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.35rem' }}>
                LIMITACIONES
              </div>
              <div className="pdf-data-row" style={{ padding: '0.22rem 0.65rem' }}>
                <span className="pdf-data-label" style={{ width: '240px' }}>Anotaciones y gravámenes:</span>
                <span className="pdf-data-value" style={{ fontWeight: 700, color: '#0f172a' }}>{limitacionesCheck.gravamenes}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.22rem 0.65rem' }}>
                <span className="pdf-data-label" style={{ width: '240px' }}>Servidumbres:</span>
                <span className="pdf-data-value" style={{ fontWeight: 700, color: '#0f172a' }}>{limitacionesCheck.servidumbres}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.22rem 0.65rem' }}>
                <span className="pdf-data-label" style={{ width: '240px' }}>Áreas comunes:</span>
                <span className="pdf-data-value" style={{ fontWeight: 700, color: '#0f172a' }}>{limitacionesCheck.areasComunes}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.22rem 0.65rem' }}>
                <span className="pdf-data-label" style={{ width: '240px' }}>Desmembración:</span>
                <span className="pdf-data-value" style={{ fontWeight: 700, color: '#0f172a' }}>{limitacionesCheck.desmembracion}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.22rem 0.65rem' }}>
                <span className="pdf-data-label" style={{ width: '240px' }}>Régimen de copropiedad:</span>
                <span className="pdf-data-value" style={{ fontWeight: 700, color: '#0f172a' }}>{limitacionesCheck.copropiedad}</span>
              </div>
            </div>

            {/* Cuadro de Valores Oficiales */}
            <div className="pdf-boxed-table">
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

              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', lineHeight: 1.45, textAlign: 'justify' }}>
                <p style={{ margin: 0 }}>
                  Tipo de cambio {avaluo.tipoCambio || '7.62581'}, según Banco de Guatemala. A juicio del suscrito valuador el {formatFechaEnLetras(avaluo.fechaInspeccion || avaluo.fechaActualizacion || avaluo.fechaSolicitud)}, el inmueble descrito tiene un valor comercial de {numeroALetras(computedComercialGTQ, 'QUETZALES')} O LO EQUIVALENTE EN {numeroALetras(computedComercialUSD, 'DÓLARES')}.
                </p>
              </div>
            </div>

            {/* Firmas en Página 2 oficiales inmediatamente debajo del cuadro de valores por seguridad jurídica */}
            <div className="pdf-signatures-container" style={{ marginTop: '1.75rem', display: 'flex', justifyContent: avaluo.incluirFirmaRevisor === false ? 'center' : 'space-around', alignItems: 'flex-start' }}>
              
              {/* 1. Valuador Principal (Lic. Aroldo Ruiz) - A LA IZQUIERDA */}
              <div className="pdf-signature-block" style={{ width: '270px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ minHeight: '115px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '6px' }}>
                  {getFirmaPrincipalSrc() ? (
                    <img 
                      src={getFirmaPrincipalSrc()} 
                      alt="Firma y Sello Oficial Valuador Principal" 
                      style={{ maxHeight: '115px', maxWidth: '230px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                    />
                  ) : (
                    <div className="pdf-signature-line" style={{ width: '210px', height: '1px', background: '#000000', marginBottom: '8px' }}></div>
                  )}
                </div>
                <div className="pdf-sig-name" style={{ fontWeight: 700, color: '#000000', fontSize: '0.88rem', lineHeight: 1.25 }}>
                  {valPrincipalNombre}
                </div>
                <div className="pdf-sig-role" style={{ fontSize: '0.82rem', color: '#1e293b', marginTop: '2px' }}>
                  {valPrincipalRegistro}
                </div>
              </div>

              {/* 2. Valuador Revisor (Segundo Firmante) - A LA DERECHA */}
              {avaluo.incluirFirmaRevisor !== false && (
                <div className="pdf-signature-block" style={{ width: '270px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ minHeight: '115px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '6px' }}>
                    {getFirmaRevisorSrc() ? (
                      <img 
                        src={getFirmaRevisorSrc()} 
                        alt="Firma y Sello Oficial Valuador Revisor" 
                        style={{ maxHeight: '115px', maxWidth: '230px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                      />
                    ) : (
                      <div className="pdf-signature-line" style={{ width: '210px', height: '1px', background: '#000000', marginBottom: '8px' }}></div>
                    )}
                  </div>
                  <div className="pdf-sig-name" style={{ fontWeight: 700, color: '#000000', fontSize: '0.88rem', lineHeight: 1.25 }}>
                    {valRevisorNombre}
                  </div>
                  <div className="pdf-sig-role" style={{ fontSize: '0.82rem', color: '#1e293b', marginTop: '2px' }}>
                    {valRevisorRegistro}
                  </div>
                </div>
              )}
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
            PÁGINA 4: INFORMACIÓN DE LA PROPIEDAD, ÁREAS, ASPECTOS LEGALES Y DICABI
            (Continuo y completo según formato oficial de Aroldo Ruiz)
            ============================================================== */}
        <section className="pdf-sheet-page">
          <PageHeader />

          <div className="pdf-sheet-content">
            <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.8rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
              INFORMACION DE LA PROPIEDAD
            </div>

            <div className="pdf-boxed-table">
              <table className="pdf-inner-table" style={{ fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '0.15rem 0.35rem' }}>FINCA</th>
                    <th style={{ padding: '0.15rem 0.35rem' }}>FOLIO</th>
                    <th style={{ padding: '0.15rem 0.35rem' }}>LIBRO</th>
                  </tr>
                </thead>
                <tbody>
                  {fincas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, padding: '0.15rem 0.35rem' }}>{f.finca}</td>
                      <td style={{ padding: '0.15rem 0.35rem' }}>{f.folio}</td>
                      <td style={{ padding: '0.15rem 0.35rem' }}>{f.libro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Fecha de consulta a distancia:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>
                  {formatDateDisplay(avaluo.fechaConsultaDistancia) || avaluo.fechaConsultaDistancia || formatDateDisplay(avaluo.fechaActualizacion) || avaluo.fechaActualizacion || '-'}
                </span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Propietario:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}><strong>{avaluo.propietarioPrincipal}</strong></span>
              </div>

              {/* Dirección según el RGP: Tabla desglosada por Finca */}
              <div style={{ marginTop: '0.25rem', marginBottom: '0.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.2rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.74rem', padding: '0.1rem 0.4rem', color: '#1e293b' }}>
                  Dirección según el RGP:
                </div>
                <table className="pdf-inner-table" style={{ border: '1px solid #cbd5e1', fontSize: '0.7rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ width: '70px', textAlign: 'center', borderRight: '1px solid #cbd5e1', padding: '0.12rem 0.3rem' }}>FINCA</th>
                      <th style={{ textAlign: 'left', padding: '0.12rem 0.3rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fincas.map((f, i) => {
                      const dirRgp = f.direccionRgp || f.direccionRegistral || (fincas.length === 1 ? avaluo.direccion : (f.dicabiDireccion || avaluo.direccion));
                      return (
                        <tr key={i} style={{ borderBottom: i === fincas.length - 1 ? 'none' : '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, textAlign: 'center', verticalAlign: 'top', width: '70px', borderRight: '1px solid #cbd5e1', padding: '0.15rem 0.35rem' }}>
                            {f.finca}
                          </td>
                          <td style={{ textAlign: 'justify', lineHeight: 1.25, fontSize: '0.7rem', color: '#0f172a', padding: '0.15rem 0.45rem' }}>
                            {dirRgp}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Dirección física o catastral:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>{avaluo.direccion}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Dirección según IUSI:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>
                  {avaluo.direccionIusi || avaluo.iusiDireccion || avaluo.direccion || 'N/A'}
                </span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.72rem' }}>
                <span className="pdf-data-label" style={{ fontSize: '0.72rem' }}>Nota:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.72rem' }}>
                  {avaluo.notaDireccion || avaluo.nota || 'Inmueble plenamente identificado en inspección física de campo.'}
                </span>
              </div>
            </div>

            {/* ÁREA */}
            <div className="pdf-section-title-bar" style={{ background: company.navyColor, color: '#ffffff', marginTop: '0.35rem', padding: '0.18rem', fontWeight: 700, fontSize: '0.76rem' }}>
              ÁREA
            </div>

            <table className="pdf-inner-table" style={{ border: '1px solid #64748b', marginTop: '0.2rem', fontSize: '0.71rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '0.14rem 0.3rem' }}>FINCA</th>
                  <th style={{ padding: '0.14rem 0.3rem' }}>Original registrada</th>
                  <th style={{ padding: '0.14rem 0.3rem' }}>Desmembrada</th>
                  <th style={{ padding: '0.14rem 0.3rem' }}>Actual Registrada</th>
                  <th style={{ padding: '0.14rem 0.3rem' }}>Física</th>
                  <th style={{ padding: '0.14rem 0.3rem' }}>Valuada</th>
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
                      <td style={{ fontWeight: 600, padding: '0.14rem 0.3rem' }}>{f.finca}</td>
                      <td style={{ padding: '0.14rem 0.3rem' }}>{orig.toFixed(6)} m²</td>
                      <td style={{ color: desm > 0 ? '#b91c1c' : 'inherit', padding: '0.14rem 0.3rem' }}>{desm.toFixed(6)} m²</td>
                      <td style={{ fontWeight: 600, padding: '0.14rem 0.3rem' }}>{act.toFixed(6)} m²</td>
                      <td style={{ padding: '0.14rem 0.3rem' }}>{fis.toFixed(6)} m²</td>
                      <td style={{ fontWeight: 700, color: company.navyColor, padding: '0.14rem 0.3rem' }}>{val.toFixed(6)} m²</td>
                    </tr>
                  );
                })}
                {fincas.length > 1 && (
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: `2px solid ${company.navyColor}` }}>
                    <td style={{ padding: '0.14rem 0.3rem' }}>TOTAL:</td>
                    <td style={{ padding: '0.14rem 0.3rem' }}>{Number(avaluo.areaRegistrada || 0).toFixed(6)} m²</td>
                    <td style={{ color: '#b91c1c', padding: '0.14rem 0.3rem' }}>{Number(avaluo.areaDesmembrada || 0).toFixed(6)} m²</td>
                    <td style={{ padding: '0.14rem 0.3rem' }}>{Number(avaluo.areaActualRegistrada || 0).toFixed(6)} m²</td>
                    <td style={{ padding: '0.14rem 0.3rem' }}>{Number(avaluo.areaFisica || 0).toFixed(6)} m²</td>
                    <td style={{ color: company.navyColor, padding: '0.14rem 0.3rem' }}>{Number(avaluo.areaValuada || 0).toFixed(6)} m²</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ASPECTOS LEGALES (Continúa inmediatamente abajo de ÁREA sin líneas divisorias) */}
            <div className="pdf-boxed-table" style={{ marginTop: '0.35rem' }}>
              <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.18rem 0.4rem', fontSize: '0.74rem' }}>
                ASPECTOS LEGALES
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.71rem' }}>
                <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.71rem' }}>Anotación:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.71rem' }}>{avaluo.anotaciones || 'Ninguna vigente según consulta electrónica del RGP.'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.71rem' }}>
                <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.71rem' }}>Gravámenes:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.71rem' }}>{avaluo.gravamenes || 'Libre de gravámenes hipotecarios.'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.71rem' }}>
                <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.71rem' }}>Limitaciones:</span>
                <span className="pdf-data-value" style={{ textAlign: 'justify', lineHeight: 1.25, fontSize: '0.71rem' }}>
                  {avaluo.limitaciones || 'sometida al Régimen de Propiedad Horizontal.'}
                </span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.71rem' }}>
                <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.71rem' }}>Servidumbres:</span>
                <span className="pdf-data-value" style={{ textAlign: 'justify', lineHeight: 1.25, fontSize: '0.71rem' }}>{avaluo.servidumbres || 'Sin servidumbres activas.'}</span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.71rem' }}>
                <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.71rem' }}>Áreas comunes:</span>
                <span className="pdf-data-value" style={{ textAlign: 'justify', lineHeight: 1.25, fontSize: '0.71rem' }}>
                  {((!avaluo.areasComunes || avaluo.areasComunes === 'No aplica') && avaluo.desmembracion && (/elementos comunes|areas comunes|áreas comunes|comunes|finca 500|finca 1334/i.test(avaluo.desmembracion)))
                    ? avaluo.desmembracion
                    : (avaluo.areasComunes || 'No aplica')}
                </span>
              </div>
              <div className="pdf-data-row" style={{ padding: '0.12rem 0.4rem', fontSize: '0.71rem' }}>
                <span className="pdf-data-label" style={{ width: '160px', fontSize: '0.71rem' }}>Desmembración:</span>
                <span className="pdf-data-value" style={{ fontSize: '0.71rem' }}>
                  {((!avaluo.areasComunes || avaluo.areasComunes === 'No aplica') && avaluo.desmembracion && (/elementos comunes|areas comunes|áreas comunes|comunes|finca 500|finca 1334/i.test(avaluo.desmembracion)))
                    ? 'Sin desmembraciones pendientes.'
                    : (avaluo.desmembracion || 'Sin desmembraciones pendientes.')}
                </span>
              </div>
            </div>

            {/* DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI) - FORMATO ORIGINAL HOMOLOGADO POR BANCOS A ANCHO COMPLETO */}
            <div style={{ marginTop: '0.35rem' }}>
              {page4Fincas.map((f, i) => {
                const isFirst = i === 0;
                const fNombre = f.dicabiNombre || (isFirst ? (avaluo.dicabiNombre || '') : '');
                const fDireccion = f.dicabiDireccion || (isFirst ? (avaluo.dicabiDireccion || '') : '');
                const fMatricula = f.dicabiMatricula || (isFirst ? (avaluo.dicabiMatricula || '') : '');
                const fArea = f.dicabiArea || (isFirst ? (avaluo.dicabiArea || '') : '');
                const fObservaciones = f.dicabiObservaciones !== undefined && f.dicabiObservaciones !== '' 
                  ? f.dicabiObservaciones 
                  : (isFirst && avaluo.dicabiObservaciones ? avaluo.dicabiObservaciones : 'Fincas no inscritas en DICABI');

                return (
                  <div 
                    key={i} 
                    className="pdf-boxed-table" 
                    style={{ marginTop: i > 0 ? '0.35rem' : '0', border: '1px solid #1e293b' }}
                  >
                    <div 
                      className="pdf-subtable-header" 
                      style={{ 
                        background: company.navyColor, 
                        color: '#ffffff', 
                        fontWeight: 700, 
                        padding: '0.18rem 0.4rem', 
                        textAlign: 'center', 
                        fontSize: '0.72rem', 
                        letterSpacing: '0.03em' 
                      }}
                    >
                      DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI){fincas.length > 1 ? ` — FINCA: ${f.finca || (i + 1)}` : ''}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.71rem' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '120px', padding: '0.14rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                            Nombre:
                          </td>
                          <td style={{ padding: '0.14rem 0.45rem', color: '#0f172a' }}>
                            {fNombre || '-'}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '120px', padding: '0.14rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                            Dirección:
                          </td>
                          <td style={{ padding: '0.14rem 0.45rem', color: '#0f172a', lineHeight: 1.25 }}>
                            {fDireccion || '-'}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '120px', padding: '0.14rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                            Matricula:
                          </td>
                          <td style={{ padding: '0.14rem 0.45rem', color: '#0f172a' }}>
                            {fMatricula ? <strong>{fMatricula}</strong> : '-'}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '120px', padding: '0.14rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                            Área:
                          </td>
                          <td style={{ padding: '0.14rem 0.45rem', color: '#0f172a' }}>
                            {fArea || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: '120px', padding: '0.14rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                            Observaciones:
                          </td>
                          <td style={{ padding: '0.14rem 0.45rem', color: '#0f172a', lineHeight: 1.25 }}>
                            {fObservaciones}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* TERRENO Y COLINDANCIAS (Solo si aplica para lotes o fincas rústicas) */}
            {showTerrenoSections && (
              <div style={{ marginTop: '0.35rem' }}>
                <div className="pdf-boxed-table" style={{ marginBottom: '0.35rem' }}>
                  <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.18rem 0.4rem', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                    DETALLES DEL TERRENO
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ borderRight: '1px solid #cbd5e1' }}>
                      <div className="pdf-data-row" style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px', fontSize: '0.68rem' }}>Topografía / Pendiente:</span>
                        <span className="pdf-data-value" style={{ fontSize: '0.68rem' }}>{avaluo.pendiente || '1 / Plana'}</span>
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px', fontSize: '0.68rem' }}>Forma:</span>
                        <span className="pdf-data-value" style={{ fontSize: '0.68rem' }}>{avaluo.formaTerreno || 'Regular'}</span>
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px', fontSize: '0.68rem' }}>Ubicación de esquina:</span>
                        <span className="pdf-data-value" style={{ fontSize: '0.68rem' }}>{avaluo.ubicacionEsquina || 'No'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="pdf-data-row" style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px', fontSize: '0.68rem' }}>Uso del suelo:</span>
                        <span className="pdf-data-value" style={{ fontSize: '0.68rem' }}>{avaluo.usoSuelo || 'Mixto'}</span>
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px', fontSize: '0.68rem' }}>Nivel socioeconómico:</span>
                        <span className="pdf-data-value" style={{ fontSize: '0.68rem' }}>{avaluo.nivelSocioeconomico || 'Alto'}</span>
                      </div>
                      <div className="pdf-data-row" style={{ padding: '0.1rem 0.35rem', fontSize: '0.68rem' }}>
                        <span className="pdf-data-label" style={{ width: '130px', fontSize: '0.68rem' }}>Desde la calle:</span>
                        <span className="pdf-data-value" style={{ fontSize: '0.68rem' }}>{avaluo.desdeCalle || 'En frente'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {page4Fincas.map((f, i) => {
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
                      <div key={i} className="pdf-boxed-table" style={{ border: '1px solid #1e293b', width: '100%' }}>
                        <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.18rem 0.35rem', fontSize: '0.72rem', textAlign: 'center' }}>
                          COLINDANCIAS{fincas.length > 1 ? ` — FINCA: ${f.finca || (i + 1)}` : ''}
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ width: '15%', padding: '0.1rem 0.35rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #cbd5e1' }}>RUMBO</th>
                              <th style={{ width: '42.5%', padding: '0.1rem 0.35rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #cbd5e1' }}>REGISTRAL</th>
                              <th style={{ width: '42.5%', padding: '0.1rem 0.35rem', textAlign: 'left', fontWeight: 700, color: company.accentColor }}>FÍSICA</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Norte:</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rNorte}</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fNorte}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Sur:</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rSur}</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fSur}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Este:</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rEste}</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fEste}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Oeste:</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rOeste}</td>
                              <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fOeste}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <PageFooter pageNum={4} />
        </section>

        {/* ==============================================================
            FLUJO CONTINUO DE FINCAS ADICIONALES, SERVICIOS, CONSTRUCCIÓN Y VALUACIONES
            Flujo natural sin hojas en blanco ni whitespace innecesario.
            ============================================================== */}
        {extraFincas.length === 0 ? (
          <>
            {/* PÁGINA 5: SERVICIOS + CARACTERÍSTICAS DE CONSTRUCCIÓN + DICTAMEN DE GARANTÍA */}
            <section className="pdf-sheet-page">
              <PageHeader />

              <div className="pdf-sheet-content">
                {renderServiciosBox()}
                {renderConstruccionTable(construccionItemsList, 'CARACTERÍSTICAS DE CONSTRUCCIÓN', '0.45rem')}
                {renderDictamenCallout()}
              </div>

              <PageFooter pageNum={5} />
            </section>

            {/* PÁGINA 6: 1. VALUACIÓN COMERCIAL + 2. VALUACIÓN BANCARIA */}
            <section className="pdf-sheet-page">
              <PageHeader />

              <div className="pdf-sheet-content">
                {renderValuacionesBox()}
              </div>

              <PageFooter pageNum={6} />
            </section>
          </>
        ) : (
          /* CASO CON 1 O MÁS FINCAS EXTRAS (Ej. 1, 2, 3 o más fincas adicionales) */
          <>
            {extraFincaPages.map((chunk, pageIdx) => (
              <section key={`fincas-extra-${pageIdx}`} className="pdf-sheet-page">
                <PageHeader />

                <div className="pdf-sheet-content">
                  <div className="pdf-section-title-plain" style={{ fontWeight: 800, color: company.navyColor, fontSize: '0.85rem', borderBottom: `2px solid ${company.navyColor}`, paddingBottom: '0.25rem', marginBottom: '0.45rem' }}>
                    {showTerrenoSections 
                      ? 'CONTINUACIÓN DE ANTECEDENTES CATASTRALES Y COLINDANCIAS' 
                      : 'CONTINUACIÓN DE ANTECEDENTES CATASTRALES (DICABI)'}
                  </div>

                  {chunk.map((f, i) => {
                    const fincaGlobalIdx = fincasOnPage4Count + (pageIdx * FINCAS_PER_PAGE) + i;
                    const fNombre = f.dicabiNombre || '';
                    const fDireccion = f.dicabiDireccion || '';
                    const fMatricula = f.dicabiMatricula || '';
                    const fArea = f.dicabiArea || '';
                    const fObservaciones = f.dicabiObservaciones !== undefined && f.dicabiObservaciones !== '' 
                      ? f.dicabiObservaciones 
                      : 'Fincas no inscritas en DICABI';

                    const col = f.colindancias || {};
                    const rNorte = col.norte || 'S/D';
                    const rSur = col.sur || 'S/D';
                    const rEste = col.este || 'S/D';
                    const rOeste = col.oeste || 'S/D';

                    const fNorte = col.norteFisica || rNorte || 'S/D';
                    const fSur = col.surFisica || rSur || 'S/D';
                    const fEste = col.esteFisica || rEste || 'S/D';
                    const fOeste = col.oesteFisica || rOeste || 'S/D';

                    return (
                      <div key={i} style={{ marginTop: i > 0 ? '0.65rem' : '0' }}>
                        <div className="pdf-boxed-table" style={{ border: '1px solid #1e293b', width: '100%' }}>
                          <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.16rem 0.45rem', textAlign: 'center', fontSize: '0.73rem', letterSpacing: '0.03em' }}>
                            DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI) — FINCA: {f.finca || (fincaGlobalIdx + 1)}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                                <td style={{ width: '135px', padding: '0.12rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Nombre:</td>
                                <td style={{ padding: '0.12rem 0.45rem', color: '#0f172a' }}>{fNombre || '-'}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                                <td style={{ width: '135px', padding: '0.12rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Dirección:</td>
                                <td style={{ padding: '0.12rem 0.45rem', color: '#0f172a', lineHeight: 1.25 }}>{fDireccion || '-'}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                                <td style={{ width: '135px', padding: '0.12rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Matricula:</td>
                                <td style={{ padding: '0.12rem 0.45rem', color: '#0f172a' }}>{fMatricula ? <strong>{fMatricula}</strong> : '-'}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                                <td style={{ width: '135px', padding: '0.12rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Área:</td>
                                <td style={{ padding: '0.12rem 0.45rem', color: '#0f172a' }}>{fArea || '-'}</td>
                              </tr>
                              <tr>
                                <td style={{ width: '135px', padding: '0.12rem 0.45rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Observaciones:</td>
                                <td style={{ padding: '0.12rem 0.45rem', color: '#0f172a', lineHeight: 1.25 }}>{fObservaciones}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {showTerrenoSections && (
                          <div className="pdf-boxed-table" style={{ border: '1px solid #1e293b', width: '100%', marginTop: '0.35rem' }}>
                            <div className="pdf-subtable-header" style={{ background: company.navyColor, color: '#ffffff', fontWeight: 700, padding: '0.16rem 0.45rem', fontSize: '0.72rem', textAlign: 'center' }}>
                              COLINDANCIAS — FINCA: {f.finca || (fincaGlobalIdx + 1)}
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                                  <th style={{ width: '15%', padding: '0.1rem 0.35rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #cbd5e1' }}>RUMBO</th>
                                  <th style={{ width: '42.5%', padding: '0.1rem 0.35rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #cbd5e1' }}>REGISTRAL</th>
                                  <th style={{ width: '42.5%', padding: '0.1rem 0.35rem', textAlign: 'left', fontWeight: 700, color: company.accentColor }}>FÍSICA</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                  <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Norte:</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rNorte}</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fNorte}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                  <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Sur:</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rSur}</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fSur}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                  <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Este:</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rEste}</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fEste}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '0.1rem 0.35rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #cbd5e1' }}>Oeste:</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{rOeste}</td>
                                  <td style={{ padding: '0.1rem 0.35rem', color: '#0f172a' }}>{fOeste}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <PageFooter pageNum={5 + pageIdx} />
              </section>
            ))}

            {/* PÁGINA SIGUIENTE A FINCAS: SERVICIOS + CARACTERÍSTICAS DE CONSTRUCCIÓN + DICTAMEN DE GARANTÍA */}
            <section className="pdf-sheet-page">
              <PageHeader />
              <div className="pdf-sheet-content">
                {renderServiciosBox()}
                {renderConstruccionTable(construccionItemsList, 'CARACTERÍSTICAS DE CONSTRUCCIÓN', '0.45rem')}
                {renderDictamenCallout()}
              </div>
              <PageFooter pageNum={5 + extraFincaPages.length} />
            </section>

            {/* PÁGINA SIGUIENTE: 1. VALUACIÓN COMERCIAL + 2. VALUACIÓN BANCARIA */}
            <section className="pdf-sheet-page">
              <PageHeader />
              <div className="pdf-sheet-content">
                {renderValuacionesBox()}
              </div>
              <PageFooter pageNum={6 + extraFincaPages.length} />
            </section>
          </>
        )}

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

              {/* Visualización robusta de fotos con carga síncrona para PDF - Tamaño Media Carta (máximo 2 por página) */}
              <div className="pdf-photos-layout-media-carta">
                {pageCards.map((card) => (
                  <div 
                    key={card.id} 
                    className="pdf-photo-box-media-carta"
                  >
                    <div className="pdf-photo-num" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                      {card.label}
                    </div>
                    <div 
                      className="pdf-photo-frame-media-carta"
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
                          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>[ RECUADRO CERRADO — SIN REGISTRO ]</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Seguridad Contractual {company.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PageFooter pageNum={7 + extraPagesBeforePhotos + pIdx} />
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

              {/* Imagen a página completa: 1 por hoja calibrada milimétricamente para evitar saltos de página */}
              <div className="pdf-rgp-page-frame" style={{ height: '180mm', maxHeight: '180mm', background: '#ffffff', border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
