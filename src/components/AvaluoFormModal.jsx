import React, { useState, useEffect } from 'react';
import { 
  X, Save, MapPin, Camera, Building, DollarSign, FileText, Plus, 
  Trash2, Crosshair, FileUp, CheckSquare, Square, Check, RefreshCw, Copy,
  ShieldCheck
} from 'lucide-react';
import { SERVICIOS_INFRAESTRUCTURA_LIST, getDefaultServicios } from '../data/serviciosConstants';
import { convertPdfOrImageToPageImages } from '../utils/pdfHelper';
import { fetchRgpPagesFromCloud } from '../firebase';
import { getAvaluoFromLocalDb } from '../utils/localDb';
import { DEFAULT_DICTAMEN_GARANTIA, DICTAMEN_PRESETS } from '../data/mockAvaluos';
import { getTenantConfig } from '../data/tenantsConfig';

export default function AvaluoFormModal({ avaluo, usuarios = [], onClose, onSave, currentTenant }) {
  const isEditing = Boolean(avaluo?.id);
  const activeTenantId = avaluo?.tenantId || (avaluo?.codigo?.startsWith('CV-') ? 'cverde' : (currentTenant?.id || 'lex-rosam'));
  const tenantConfig = getTenantConfig(activeTenantId);

  const [activeStep, setActiveStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState('');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfProcessStatus, setPdfProcessStatus] = useState('');

  // Asegurar que al abrir para editar o crear siempre inicie en el Paso 1 (Solicitud & Inspección)
  useEffect(() => {
    setActiveStep(1);
  }, [avaluo?.id]);

  // Form State initialized with defaults or editing values
  const [formData, setFormData] = useState({
    tenantId: activeTenantId,
    id: avaluo?.id || `${activeTenantId === 'cverde' ? 'cv' : 'lr'}-2026-${Date.now().toString().slice(-4)}`,
    codigo: avaluo?.codigo || `${tenantConfig.codigoPrefix || 'LR-2026-'}0${Math.floor(Math.random() * 90) + 10}`,
    tipoAvaluo: avaluo?.tipoAvaluo || 'Comercial',
    solicitante: avaluo?.solicitante || (tenantConfig.id === 'cverde' ? 'BANCO INDUSTRIAL, S.A.' : 'BANCO G&T CONTINENTAL'),
    fechaSolicitud: avaluo?.fechaSolicitud || new Date().toISOString().slice(0, 10),
    fechaInspeccion: avaluo ? (avaluo.fechaInspeccion || '') : new Date().toISOString().slice(0, 10),
    fechaActualizacion: avaluo ? (avaluo.fechaInspeccion ? '' : (avaluo.fechaActualizacion || '')) : '',
    bienMostradoPor: avaluo?.bienMostradoPor || '',
    direccion: avaluo?.direccion || '',
    coordenadas: avaluo?.coordenadas || '',
    descripcionGeneral: avaluo?.descripcionGeneral || '',
    dpi: avaluo?.dpi || '',
    referenciaActualizacion: avaluo?.referenciaActualizacion || 'Inspección física y certificación de valor',
    estado: avaluo?.estado || 'borrador',
    observacionesAutorizador: avaluo?.observacionesAutorizador || '',

    // Información Registral con múltiples fincas y áreas independientes
    propietarioPrincipal: avaluo?.propietarioPrincipal || avaluo?.fincas?.[0]?.propietario || '',
    fincas: avaluo?.fincas && avaluo.fincas.length > 0 
      ? avaluo.fincas.map((f, i) => ({
          finca: f.finca || '',
          folio: f.folio || '',
          libro: f.libro || '',
          propietario: f.propietario || avaluo?.propietarioPrincipal || '',
          areaRegistrada: f.areaRegistrada !== undefined ? f.areaRegistrada : 0,
          areaDesmembrada: f.areaDesmembrada !== undefined ? f.areaDesmembrada : 0,
          areaActualRegistrada: f.areaActualRegistrada !== undefined ? f.areaActualRegistrada : (f.areaRegistrada || 0),
          areaFisica: f.areaFisica !== undefined ? f.areaFisica : (f.areaRegistrada || 0),
          areaValuada: f.areaValuada !== undefined ? f.areaValuada : 0,
          dicabiNombre: f.dicabiNombre || (i === 0 ? (avaluo?.dicabiNombre || '') : ''),
          dicabiDireccion: f.dicabiDireccion || (i === 0 ? (avaluo?.dicabiDireccion || '') : ''),
          dicabiMatricula: f.dicabiMatricula || (i === 0 ? (avaluo?.dicabiMatricula || '') : ''),
          dicabiArea: f.dicabiArea || (i === 0 ? (avaluo?.dicabiArea || '') : ''),
          dicabiObservaciones: f.dicabiObservaciones !== undefined ? f.dicabiObservaciones : (i === 0 ? (avaluo?.dicabiObservaciones || '') : ''),
          colindancias: f.colindancias ? {
            norte: f.colindancias.norte || '',
            sur: f.colindancias.sur || '',
            este: f.colindancias.este || '',
            oeste: f.colindancias.oeste || '',
            norteFisica: f.colindancias.norteFisica || '',
            surFisica: f.colindancias.surFisica || '',
            esteFisica: f.colindancias.esteFisica || '',
            oesteFisica: f.colindancias.oesteFisica || ''
          } : (i === 0 ? {
            norte: avaluo?.colindancias?.norte || '',
            sur: avaluo?.colindancias?.sur || '',
            este: avaluo?.colindancias?.este || '',
            oeste: avaluo?.colindancias?.oeste || '',
            norteFisica: avaluo?.colindancias?.norteFisica || '',
            surFisica: avaluo?.colindancias?.surFisica || '',
            esteFisica: avaluo?.colindancias?.esteFisica || '',
            oesteFisica: avaluo?.colindancias?.oesteFisica || ''
          } : {
            norte: '',
            sur: '',
            este: '',
            oeste: '',
            norteFisica: '',
            surFisica: '',
            esteFisica: '',
            oesteFisica: ''
          })
        }))
      : [
        { 
          finca: avaluo?.finca || '', 
          folio: avaluo?.folio || '', 
          libro: avaluo?.libro || '', 
          propietario: avaluo?.propietarioPrincipal || '',
          areaRegistrada: avaluo?.areaRegistrada || 0,
          areaDesmembrada: avaluo?.areaDesmembrada || 0,
          areaActualRegistrada: avaluo?.areaActualRegistrada || 0,
          areaFisica: avaluo?.areaFisica || 0,
          areaValuada: avaluo?.areaValuada || 0,
          dicabiNombre: avaluo?.dicabiNombre || '',
          dicabiDireccion: avaluo?.dicabiDireccion || '',
          dicabiMatricula: avaluo?.dicabiMatricula || '',
          dicabiArea: avaluo?.dicabiArea || '',
          dicabiObservaciones: avaluo?.dicabiObservaciones || '',
          colindancias: {
            norte: avaluo?.colindancias?.norte || '',
            sur: avaluo?.colindancias?.sur || '',
            este: avaluo?.colindancias?.este || '',
            oeste: avaluo?.colindancias?.oeste || '',
            norteFisica: avaluo?.colindancias?.norteFisica || '',
            surFisica: avaluo?.colindancias?.surFisica || '',
            esteFisica: avaluo?.colindancias?.esteFisica || '',
            oesteFisica: avaluo?.colindancias?.oesteFisica || ''
          }
        }
      ],
    areaRegistrada: avaluo?.areaRegistrada || 0,
    areaDesmembrada: avaluo?.areaDesmembrada || 0,
    areaActualRegistrada: avaluo?.areaActualRegistrada || 0,
    areaFisica: avaluo?.areaFisica || 0,
    areaValuada: avaluo?.areaValuada || 0,

    // Aspectos Legales (textos amplios)
    limitaciones: avaluo?.limitaciones || 'Sin limitaciones vigentes inscritas.',
    anotaciones: avaluo?.anotaciones || 'Ninguna vigente según consulta electrónica del RGP.',
    gravamenes: avaluo?.gravamenes || 'Libre de gravámenes hipotecarios.',
    servidumbres: avaluo?.servidumbres || 'Sin servidumbres activas.',
    areasComunes: avaluo?.areasComunes || 'No aplica',
    desmembracion: avaluo?.desmembracion || 'Sin desmembraciones pendientes.',

    // DICABI (Independiente del RGP)
    dicabiNombre: avaluo?.dicabiNombre || '',
    dicabiDireccion: avaluo?.dicabiDireccion || '',
    dicabiMatricula: avaluo?.dicabiMatricula || '',
    dicabiArea: avaluo?.dicabiArea || '',
    dicabiObservaciones: avaluo?.dicabiObservaciones || '',

    // Terreno & Sector
    aplicaTerreno: avaluo?.aplicaTerreno !== undefined ? avaluo.aplicaTerreno : (avaluo?.tipoAvaluo !== 'Apartamento / PH' && avaluo?.tipoAvaluo !== 'Apartamento'),
    sector: avaluo?.sector || 'Urbano Comercial',
    usoSuelo: avaluo?.usoSuelo || 'Comercial / Residencial',
    nivelSocioeconomico: avaluo?.nivelSocioeconomico || 'Medio-Alto',
    formaTerreno: avaluo?.formaTerreno || 'Regular / Rectangular',
    pendiente: avaluo?.pendiente || 'Plana (1%)',
    esquina: avaluo?.esquina || 'No',
    accesoCalle: avaluo?.accesoCalle || 'Calle asfaltada con acera y bordillo',
    
    // Colindancias
    colindancias: avaluo?.colindancias || {
      norte: '',
      sur: '',
      este: '',
      oeste: '',
      norteFisica: '',
      surFisica: '',
      esteFisica: '',
      oesteFisica: ''
    },

    // Servicios e Infraestructura (31 elementos oficiales)
    servicios: getDefaultServicios(avaluo?.servicios),
    serviciosAdicionales: avaluo?.serviciosAdicionales || [],

    // Construcción
    construccion: avaluo?.construccion || {
      edadAprox: '5 años',
      estadoActual: 'Bueno',
      apropiadaSector: 'Sí, acorde al entorno urbano',
      distribucion: 'Ambientes completos según plano',
      estructura: 'Concreto armado y mampostería reforzada',
      paredes: 'Block pómez con repello y cernido',
      techoEntrePiso: 'Losa maciza de concreto',
      piso: 'Piso cerámico',
      puertas: 'Madera y metal',
      ventanas: 'Aluminio y vidrio claro',
      sanitaria: 'Artefactos estándar en buen estado',
      electrica: 'Instalación empotrada protegida',
      factoresPositivos: 'Excelente ubicación y mantenimiento continuo',
      factoresNegativos: 'Ninguno de gravedad'
    },

    // Cálculos
    desgloseTerreno: (() => {
      if (avaluo?.desgloseTerreno?.items && Array.isArray(avaluo.desgloseTerreno.items) && avaluo.desgloseTerreno.items.length > 0) {
        const items = avaluo.desgloseTerreno.items.map((it, idx) => {
          const area = parseFloat(it.area) || 0;
          const unit = parseFloat(it.valorUnitario) || 0;
          return {
            id: it.id || idx + 1,
            finca: it.finca || '',
            area,
            varasCuadradas: it.varasCuadradas != null ? it.varasCuadradas : parseFloat((area * 1.43115).toFixed(2)),
            unidad: it.unidad || 'm²',
            valorUnitario: unit,
            total: it.total != null ? it.total : parseFloat((area * unit).toFixed(2))
          };
        });
        const sumArea = items.reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0);
        const sumTotal = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
        return {
          ...avaluo.desgloseTerreno,
          area: parseFloat(sumArea.toFixed(2)),
          varasCuadradas: parseFloat((sumArea * 1.43115).toFixed(2)),
          total: parseFloat(sumTotal.toFixed(2)),
          items
        };
      }
      const baseFincas = avaluo?.fincas && avaluo.fincas.length > 0
        ? avaluo.fincas
        : [{ finca: avaluo?.desgloseTerreno?.fincaAsociada || 'Principal', areaValuada: avaluo?.areaValuada || avaluo?.desgloseTerreno?.area || 0 }];
      const defaultUnit = parseFloat(avaluo?.desgloseTerreno?.valorUnitario) || 0;
      const items = baseFincas.map((f, idx) => {
        const area = parseFloat(f.areaValuada || f.areaRegistrada || (avaluo?.desgloseTerreno?.area ? avaluo.desgloseTerreno.area / baseFincas.length : 0)) || 0;
        const unit = parseFloat(f.valorUnitarioTerreno != null ? f.valorUnitarioTerreno : defaultUnit) || 0;
        return {
          id: idx + 1,
          finca: f.finca || `Finca ${idx + 1}`,
          area,
          varasCuadradas: parseFloat((area * 1.43115).toFixed(2)),
          unidad: 'm²',
          valorUnitario: unit,
          total: parseFloat((area * unit).toFixed(2))
        };
      });
      const sumArea = items.reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0);
      const sumTotal = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
      return {
        area: parseFloat(sumArea.toFixed(2)),
        unidad: 'm²',
        valorUnitario: items.length === 1 ? items[0].valorUnitario : (sumArea > 0 ? parseFloat((sumTotal / sumArea).toFixed(2)) : defaultUnit),
        total: parseFloat(sumTotal.toFixed(2)),
        varasCuadradas: parseFloat((sumArea * 1.43115).toFixed(2)),
        items
      };
    })(),
    desgloseConstruccion: (() => {
      if (avaluo?.desgloseConstruccion?.items && Array.isArray(avaluo.desgloseConstruccion.items) && avaluo.desgloseConstruccion.items.length > 0) {
        return {
          ...avaluo.desgloseConstruccion,
          items: avaluo.desgloseConstruccion.items.map((it, idx) => ({
            id: it.id || idx + 1,
            descripcion: it.descripcion || 'Construcción Principal',
            area: it.area != null ? it.area : 0,
            unidad: it.unidad || 'm²',
            valorUnitario: it.valorUnitario != null ? it.valorUnitario : 0,
            total: it.total != null ? it.total : ((parseFloat(it.area) || 0) * (parseFloat(it.valorUnitario) || 0))
          }))
        };
      }
      const initialArea = avaluo?.desgloseConstruccion?.area != null ? avaluo.desgloseConstruccion.area : (avaluo?.areaConstruida || 0);
      const initialUnit = avaluo?.desgloseConstruccion?.valorUnitario != null ? avaluo.desgloseConstruccion.valorUnitario : 0;
      const initialTotal = avaluo?.desgloseConstruccion?.total != null ? avaluo.desgloseConstruccion.total : ((parseFloat(initialArea) || 0) * (parseFloat(initialUnit) || 0));
      return {
        items: [
          {
            id: 1,
            descripcion: avaluo?.desgloseConstruccion?.descripcion || 'Construcción Principal',
            area: initialArea,
            unidad: avaluo?.desgloseConstruccion?.unidad || 'm²',
            valorUnitario: initialUnit,
            total: initialTotal
          }
        ],
        area: initialArea,
        unidad: avaluo?.desgloseConstruccion?.unidad || 'm²',
        valorUnitario: initialUnit,
        total: initialTotal
      };
    })(),
    tipoCambio: avaluo?.tipoCambio || 7.62581,
    valorComercialGTQ: avaluo?.valorComercialGTQ || 0,
    valorBancarioGTQ: avaluo?.valorBancarioGTQ || 0,
    valorComercialUSD: avaluo?.valorComercialUSD || 0,
    valorBancarioUSD: avaluo?.valorBancarioUSD || 0,

    // Valuadores y Firmantes Oficiales (Reporte PDF)
    valuadorPrincipal: avaluo?.valuadorPrincipal || tenantConfig.valuadorPrincipal,
    registroPrincipal: avaluo?.registroPrincipal || tenantConfig.registroPrincipal,
    valuadorRevisor: avaluo?.valuadorRevisor !== undefined ? avaluo.valuadorRevisor : tenantConfig.valuadorRevisor,
    registroRevisor: avaluo?.registroRevisor !== undefined ? avaluo.registroRevisor : tenantConfig.registroRevisor,
    incluirFirmaRevisor: avaluo?.incluirFirmaRevisor !== false,

    // Dictamen Oficial de Garantía Crediticia (Pág. 6 del reporte PDF)
    dictamenGarantia: avaluo?.dictamenGarantia !== undefined ? avaluo.dictamenGarantia : (tenantConfig.dictamenPredeterminado || DEFAULT_DICTAMEN_GARANTIA),

    // Fotos optimizadas (soporta múltiples fotos por categoría)
    fotos: (() => {
      const initialFotos = {
        entorno: [],
        ingreso: [],
        interior: [],
        ubicacion: [],
        croquis: [],
        dicabi: []
      };
      if (!avaluo?.fotos) return initialFotos;
      ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(key => {
        const val = avaluo.fotos[key];
        if (Array.isArray(val)) {
          initialFotos[key] = val.filter(u => u && typeof u === 'string' && u.trim().length > 0);
        } else if (typeof val === 'string' && val.trim().length > 0) {
          initialFotos[key] = [val];
        }
      });
      return initialFotos;
    })(),

    // Consultas Electrónicas RGP (PDFs adjuntos)
    consultasPdfs: avaluo?.consultasPdfs || []
  });

  // Hidratar páginas y dataUrls de RGP desde la nube o IndexedDB si faltan al editar
  useEffect(() => {
    let isMounted = true;
    if (avaluo?.id) {
      const rawList = avaluo.consultasPdfs || [];
      const needsData = rawList.length === 0 || rawList.some(d => Array.isArray(d.pages) && d.pages.some(p => !p.dataUrl));
      if (needsData) {
        getAvaluoFromLocalDb(avaluo.id).then(local => {
          if (local?.consultasPdfs?.some(d => d.pages?.some(p => p.dataUrl))) {
            if (isMounted) {
              setFormData(prev => ({ ...prev, consultasPdfs: local.consultasPdfs }));
            }
            return;
          }
          return fetchRgpPagesFromCloud(avaluo.id).then(cloudPages => {
            if (!isMounted || !cloudPages || cloudPages.length === 0) return;
            if (rawList.length === 0) {
              const grouped = {};
              cloudPages.forEach(cp => {
                const key = cp.docId || cp.docName || 'doc';
                if (!grouped[key]) {
                  grouped[key] = {
                    id: key,
                    name: cp.docName || cp.fileName || 'Certificación RGP',
                    size: '',
                    fecha: '',
                    pages: []
                  };
                }
                grouped[key].pages.push(cp);
              });
              const docs = Object.values(grouped).map(d => ({
                ...d,
                pages: d.pages.sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0))
              }));
              setFormData(prev => ({ ...prev, consultasPdfs: docs }));
            } else {
              const merged = rawList.map(d => {
                const pagesWithData = (d.pages || []).map(p => {
                  if (p.dataUrl) return p;
                  const found = cloudPages.find(cp => 
                    (cp.docId === d.id || cp.docName === d.name || cp.fileName === d.name) && 
                    Number(cp.pageIndex) === Number(p.pageIndex)
                  );
                  return found?.dataUrl ? { ...p, dataUrl: found.dataUrl } : p;
                });
                return { ...d, pages: pagesWithData };
              });
              setFormData(prev => ({ ...prev, consultasPdfs: merged }));
            }
          });
        }).catch(err => console.warn('Error hydrating RGP pages in form modal:', err));
      }
    }
    return () => { isMounted = false; };
  }, [avaluo?.id]);

  // Handle GPS coordinate capture directly on mobile phone
  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este navegador.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setFormData(prev => ({
          ...prev,
          coordenadas: `${lat}, ${lng}`
        }));
      },
      (err) => {
        setIsLocating(false);
        alert('No se pudo obtener la ubicación GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Manejo de Fincas con Áreas Independientes y cálculo de Desmembración
  const addFinca = () => {
    setFormData(prev => ({
      ...prev,
      fincas: [
        ...prev.fincas, 
        { 
          finca: '', 
          folio: '', 
          libro: '', 
          propietario: prev.propietarioPrincipal || '',
          areaRegistrada: 0,
          areaDesmembrada: 0,
          areaActualRegistrada: 0,
          areaFisica: 0,
          areaValuada: 0,
          dicabiNombre: '',
          dicabiDireccion: '',
          dicabiMatricula: '',
          dicabiArea: '',
          dicabiObservaciones: '',
          colindancias: {
            norte: '',
            sur: '',
            este: '',
            oeste: '',
            norteFisica: '',
            surFisica: '',
            esteFisica: '',
            oesteFisica: ''
          }
        }
      ]
    }));
  };

  const removeFinca = (index) => {
    setFormData(prev => {
      const updated = prev.fincas.filter((_, i) => i !== index);
      return recalcularTotalesFincas({ ...prev, fincas: updated });
    });
  };

  const updateFinca = (index, field, value) => {
    setFormData(prev => {
      const newFincas = [...prev.fincas];
      const target = { ...newFincas[index], [field]: value };

      // Si se actualiza área original o desmembrada, auto-calcular Actual Registrada = Original - Desmembrada
      if (field === 'areaRegistrada' || field === 'areaDesmembrada') {
        const orig = parseFloat(field === 'areaRegistrada' ? value : target.areaRegistrada) || 0;
        const desm = parseFloat(field === 'areaDesmembrada' ? value : target.areaDesmembrada) || 0;
        target.areaActualRegistrada = parseFloat(Math.max(0, orig - desm).toFixed(6));
      }

      newFincas[index] = target;

      // Sincronizar campos principales de DICABI con Finca 0 para compatibilidad histórica
      const extra = {};
      if (index === 0) {
        if (field === 'dicabiMatricula') extra.dicabiMatricula = value;
        if (field === 'dicabiNombre') extra.dicabiNombre = value;
        if (field === 'dicabiDireccion') extra.dicabiDireccion = value;
        if (field === 'dicabiArea') extra.dicabiArea = value;
        if (field === 'dicabiObservaciones') extra.dicabiObservaciones = value;
      }

      return recalcularTotalesFincas({ ...prev, ...extra, fincas: newFincas });
    });
  };

  // Recalcular sumas globales de áreas a partir de las fincas individuales
  const recalcularTotalesFincas = (state) => {
    const totOrig = state.fincas.reduce((acc, f) => acc + (parseFloat(f.areaRegistrada) || 0), 0);
    const totDesm = state.fincas.reduce((acc, f) => acc + (parseFloat(f.areaDesmembrada) || 0), 0);
    const totAct = state.fincas.reduce((acc, f) => acc + (parseFloat(f.areaActualRegistrada) || 0), 0);
    const totFis = state.fincas.reduce((acc, f) => acc + (parseFloat(f.areaFisica) || 0), 0);
    const totVal = state.fincas.reduce((acc, f) => acc + (parseFloat(f.areaValuada) || 0), 0);

    const next = {
      ...state,
      areaRegistrada: parseFloat(totOrig.toFixed(6)),
      areaDesmembrada: parseFloat(totDesm.toFixed(6)),
      areaActualRegistrada: parseFloat(totAct.toFixed(6)),
      areaFisica: parseFloat(totFis.toFixed(6)),
      areaValuada: parseFloat(totVal.toFixed(6))
    };

    // Auto actualizar área en terreno si está en 0 y aplica terreno
    if (next.aplicaTerreno !== false && (!next.desgloseTerreno.area || next.desgloseTerreno.area === 0) && totVal > 0) {
      next.desgloseTerreno = {
        ...next.desgloseTerreno,
        area: totVal,
        varasCuadradas: parseFloat((totVal * 1.43115).toFixed(2)),
        total: parseFloat((totVal * (next.desgloseTerreno.valorUnitario || 0)).toFixed(2))
      };
    }

    return next;
  };

  // Manejo de Colindancias por Finca (Registrales y Físicas)
  const updateFincaColindancia = (fIndex, field, value) => {
    setFormData(prev => {
      const newFincas = [...prev.fincas];
      const target = { ...newFincas[fIndex] };
      const col = { ...(target.colindancias || (fIndex === 0 ? prev.colindancias : {}) || {}) };
      col[field] = value;
      target.colindancias = col;
      newFincas[fIndex] = target;

      const extra = {};
      if (fIndex === 0) {
        extra.colindancias = {
          ...(prev.colindancias || {}),
          [field]: value
        };
      }

      return {
        ...prev,
        ...extra,
        fincas: newFincas
      };
    });
  };

  const copyRegistralToFisica = (fIndex) => {
    setFormData(prev => {
      const newFincas = [...prev.fincas];
      const target = { ...newFincas[fIndex] };
      const col = { ...(target.colindancias || (fIndex === 0 ? prev.colindancias : {}) || {}) };
      col.norteFisica = col.norte || '';
      col.surFisica = col.sur || '';
      col.esteFisica = col.este || '';
      col.oesteFisica = col.oeste || '';
      target.colindancias = col;
      newFincas[fIndex] = target;

      const extra = {};
      if (fIndex === 0) {
        extra.colindancias = {
          ...(prev.colindancias || {}),
          norteFisica: col.norte || '',
          surFisica: col.sur || '',
          esteFisica: col.este || '',
          oesteFisica: col.oeste || ''
        };
      }

      return { ...prev, ...extra, fincas: newFincas };
    });
  };

  const copyColindanciasToAll = (sourceIndex) => {
    setFormData(prev => {
      const sourceCol = prev.fincas[sourceIndex]?.colindancias || (sourceIndex === 0 ? prev.colindancias : {}) || {};
      const newFincas = prev.fincas.map((f, idx) => {
        if (idx === sourceIndex) return f;
        return {
          ...f,
          colindancias: { ...sourceCol }
        };
      });
      return { ...prev, fincas: newFincas };
    });
  };

  // Dynamic calculations for values, conversion to Varas Cuadradas and currency exchange
  const handleCalcUpdate = (field, subfield, value) => {
    const num = parseFloat(value) || 0;
    
    setFormData(prev => {
      const next = { ...prev };
      if (field === 'desgloseTerreno') {
        const currentTerreno = { ...next.desgloseTerreno };
        if (subfield === 'area') {
          currentTerreno.area = num;
          // Fórmula oficial de Aroldo: Varas Cuadradas = Área m² * 1.43115
          currentTerreno.varasCuadradas = parseFloat((num * 1.43115).toFixed(2));
        } else if (subfield === 'fincaAsociada') {
          currentTerreno.fincaAsociada = value;
        } else {
          currentTerreno[subfield] = num;
        }
        currentTerreno.total = parseFloat(((currentTerreno.area || 0) * (currentTerreno.valorUnitario || 0)).toFixed(2));
        next.desgloseTerreno = currentTerreno;
      } else if (field === 'desgloseConstruccion') {
        const currentConst = { ...next.desgloseConstruccion, [subfield]: num };
        currentConst.total = parseFloat(((currentConst.area || 0) * (currentConst.valorUnitario || 0)).toFixed(2));
        next.desgloseConstruccion = currentConst;
      } else if (field === 'tipoCambio') {
        next.tipoCambio = num;
      }

      // Recompute total commercial & bank values considering aplicaTerreno
      const terrenoTotal = next.aplicaTerreno !== false ? (parseFloat(next.desgloseTerreno?.total) || 0) : 0;
      const totalComercial = parseFloat((terrenoTotal + (next.desgloseConstruccion?.total || 0)).toFixed(2));
      next.valorComercialGTQ = totalComercial;
      next.valorBancarioGTQ = parseFloat((totalComercial * 0.8).toFixed(2)); // 80% standard bank guarantee con decimales exactos
      const tc = next.tipoCambio || 7.62581;
      next.valorComercialUSD = parseFloat((totalComercial / tc).toFixed(2));
      next.valorBancarioUSD = parseFloat((next.valorBancarioGTQ / tc).toFixed(2));

      return next;
    });
  };

  // Manejadores para la matriz dinámica de valoración de construcción
  const handleAddConstruccionItem = () => {
    setFormData(prev => {
      const currentItems = prev.desgloseConstruccion?.items || [];
      const newItem = {
        id: Date.now(),
        descripcion: '',
        area: '',
        unidad: 'm²',
        valorUnitario: '',
        total: 0
      };
      const nextItems = [...currentItems, newItem];
      return recalculateConstruction(prev, nextItems);
    });
  };

  const handleRemoveConstruccionItem = (id) => {
    setFormData(prev => {
      const currentItems = prev.desgloseConstruccion?.items || [];
      if (currentItems.length <= 1) {
        alert('Debe mantener al menos una fila en la valoración de construcción.');
        return prev;
      }
      const nextItems = currentItems.filter(it => it.id !== id);
      return recalculateConstruction(prev, nextItems);
    });
  };

  const handleUpdateConstruccionItem = (id, field, value) => {
    setFormData(prev => {
      const currentItems = prev.desgloseConstruccion?.items || [];
      const nextItems = currentItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'area' || field === 'valorUnitario') {
            const a = field === 'area' ? (parseFloat(value) || 0) : (parseFloat(item.area) || 0);
            const u = field === 'valorUnitario' ? (parseFloat(value) || 0) : (parseFloat(item.valorUnitario) || 0);
            updated.total = parseFloat((a * u).toFixed(2));
          }
          return updated;
        }
        return item;
      });
      return recalculateConstruction(prev, nextItems);
    });
  };

  const recalculateConstruction = (prev, items) => {
    const sumArea = items.reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0);
    const sumTotal = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
    const avgUnit = sumArea > 0 ? parseFloat((sumTotal / sumArea).toFixed(2)) : 0;

    const nextDesglose = {
      ...prev.desgloseConstruccion,
      items,
      area: parseFloat(sumArea.toFixed(2)),
      valorUnitario: avgUnit,
      total: parseFloat(sumTotal.toFixed(2))
    };

    const terrenoTotal = prev.aplicaTerreno !== false ? (parseFloat(prev.desgloseTerreno?.total) || 0) : 0;
    const totalComercial = parseFloat((terrenoTotal + nextDesglose.total).toFixed(2));
    const tc = parseFloat(prev.tipoCambio) || 7.62581;
    const valBancario = parseFloat((totalComercial * 0.8).toFixed(2));

    return {
      ...prev,
      desgloseConstruccion: nextDesglose,
      valorComercialGTQ: totalComercial,
      valorBancarioGTQ: valBancario,
      valorComercialUSD: parseFloat((totalComercial / tc).toFixed(2)),
      valorBancarioUSD: parseFloat((valBancario / tc).toFixed(2))
    };
  };

  // Botón y toggle oficial de Aroldo para habilitar o deshabilitar terreno (Régimen PH / Apartamentos)
  const handleToggleAplicaTerreno = (applies) => {
    setFormData(prev => {
      const next = { ...prev, aplicaTerreno: applies };
      const terrenoTotal = applies ? (parseFloat(next.desgloseTerreno?.total) || 0) : 0;
      const totalComercial = parseFloat((terrenoTotal + (next.desgloseConstruccion?.total || 0)).toFixed(2));
      next.valorComercialGTQ = totalComercial;
      next.valorBancarioGTQ = parseFloat((totalComercial * 0.8).toFixed(2));
      const tc = next.tipoCambio || 7.62581;
      next.valorComercialUSD = parseFloat((totalComercial / tc).toFixed(2));
      next.valorBancarioUSD = parseFloat((next.valorBancarioGTQ / tc).toFixed(2));
      return next;
    });
  };

  // Manejadores para la matriz dinámica de valoración de terreno por fincas con valor independiente
  const handleTerrenoItemChange = (id, field, value) => {
    setFormData(prev => {
      const items = (prev.desgloseTerreno?.items || []).map(it => {
        if (it.id === id) {
          const updated = { ...it };
          if (field === 'area') {
            const area = parseFloat(value) || 0;
            updated.area = value;
            updated.varasCuadradas = parseFloat((area * 1.43115).toFixed(2));
            const unit = parseFloat(updated.valorUnitario) || 0;
            updated.total = parseFloat((area * unit).toFixed(2));
          } else if (field === 'valorUnitario') {
            const unit = parseFloat(value) || 0;
            updated.valorUnitario = value;
            const area = parseFloat(updated.area) || 0;
            updated.total = parseFloat((area * unit).toFixed(2));
          } else {
            updated[field] = value;
          }
          return updated;
        }
        return it;
      });

      const sumArea = items.reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0);
      const sumTotal = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
      const avgUnit = sumArea > 0 ? parseFloat((sumTotal / sumArea).toFixed(2)) : 0;

      const nextTerreno = {
        ...prev.desgloseTerreno,
        items,
        area: parseFloat(sumArea.toFixed(2)),
        varasCuadradas: parseFloat((sumArea * 1.43115).toFixed(2)),
        valorUnitario: avgUnit,
        total: parseFloat(sumTotal.toFixed(2))
      };

      const terrenoTotal = prev.aplicaTerreno !== false ? nextTerreno.total : 0;
      const totalComercial = parseFloat((terrenoTotal + (prev.desgloseConstruccion?.total || 0)).toFixed(2));
      const tc = parseFloat(prev.tipoCambio) || 7.62581;
      const valBancario = parseFloat((totalComercial * 0.8).toFixed(2));

      return {
        ...prev,
        desgloseTerreno: nextTerreno,
        valorComercialGTQ: totalComercial,
        valorBancarioGTQ: valBancario,
        valorComercialUSD: parseFloat((totalComercial / tc).toFixed(2)),
        valorBancarioUSD: parseFloat((valBancario / tc).toFixed(2))
      };
    });
  };

  const handleAddTerrenoItem = () => {
    setFormData(prev => {
      const items = [...(prev.desgloseTerreno?.items || [])];
      const newId = items.length > 0 ? Math.max(...items.map(it => it.id || 0)) + 1 : 1;
      const defaultUnit = items.length > 0 ? (parseFloat(items[0].valorUnitario) || 0) : 0;
      items.push({
        id: newId,
        finca: `Finca ${newId}`,
        area: 0,
        varasCuadradas: 0,
        unidad: 'm²',
        valorUnitario: defaultUnit,
        total: 0
      });
      return {
        ...prev,
        desgloseTerreno: {
          ...prev.desgloseTerreno,
          items
        }
      };
    });
  };

  const handleRemoveTerrenoItem = (id) => {
    setFormData(prev => {
      const items = (prev.desgloseTerreno?.items || []).filter(it => it.id !== id);
      if (items.length === 0) return prev;

      const sumArea = items.reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0);
      const sumTotal = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
      const avgUnit = sumArea > 0 ? parseFloat((sumTotal / sumArea).toFixed(2)) : 0;

      const nextTerreno = {
        ...prev.desgloseTerreno,
        items,
        area: parseFloat(sumArea.toFixed(2)),
        varasCuadradas: parseFloat((sumArea * 1.43115).toFixed(2)),
        valorUnitario: avgUnit,
        total: parseFloat(sumTotal.toFixed(2))
      };

      const terrenoTotal = prev.aplicaTerreno !== false ? nextTerreno.total : 0;
      const totalComercial = parseFloat((terrenoTotal + (prev.desgloseConstruccion?.total || 0)).toFixed(2));
      const tc = parseFloat(prev.tipoCambio) || 7.62581;
      const valBancario = parseFloat((totalComercial * 0.8).toFixed(2));

      return {
        ...prev,
        desgloseTerreno: nextTerreno,
        valorComercialGTQ: totalComercial,
        valorBancarioGTQ: valBancario,
        valorComercialUSD: parseFloat((totalComercial / tc).toFixed(2)),
        valorBancarioUSD: parseFloat((valBancario / tc).toFixed(2))
      };
    });
  };

  // Sincronizar fincas del Paso 1 (Registral) a la matriz de valoración de terreno con áreas exactas
  const handleSyncFincasToTerreno = () => {
    setFormData(prev => {
      const existingItems = prev.desgloseTerreno?.items || [];
      const defaultUnit = existingItems.length > 0 ? (parseFloat(existingItems[0].valorUnitario) || 0) : (parseFloat(prev.desgloseTerreno?.valorUnitario) || 0);
      const nextItems = (prev.fincas || []).map((f, idx) => {
        const area = parseFloat(f.areaValuada || f.areaRegistrada || 0);
        const found = existingItems.find(it => (it.finca && f.finca && it.finca.trim() === f.finca.trim()) || it.id === idx + 1);
        const unit = found ? (parseFloat(found.valorUnitario) || 0) : (parseFloat(f.valorUnitarioTerreno) || defaultUnit);
        return {
          id: idx + 1,
          finca: f.finca || `Finca ${idx + 1}`,
          area,
          varasCuadradas: parseFloat((area * 1.43115).toFixed(2)),
          unidad: 'm²',
          valorUnitario: unit,
          total: parseFloat((area * unit).toFixed(2))
        };
      });

      const sumArea = nextItems.reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0);
      const sumTotal = nextItems.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
      const avgUnit = sumArea > 0 ? parseFloat((sumTotal / sumArea).toFixed(2)) : 0;

      const nextTerreno = {
        ...prev.desgloseTerreno,
        items: nextItems,
        area: parseFloat(sumArea.toFixed(2)),
        varasCuadradas: parseFloat((sumArea * 1.43115).toFixed(2)),
        valorUnitario: avgUnit,
        total: parseFloat(sumTotal.toFixed(2))
      };

      const terrenoTotal = prev.aplicaTerreno !== false ? nextTerreno.total : 0;
      const totalComercial = parseFloat((terrenoTotal + (prev.desgloseConstruccion?.total || 0)).toFixed(2));
      const tc = parseFloat(prev.tipoCambio) || 7.62581;
      const valBancario = parseFloat((totalComercial * 0.8).toFixed(2));

      return {
        ...prev,
        desgloseTerreno: nextTerreno,
        valorComercialGTQ: totalComercial,
        valorBancarioGTQ: valBancario,
        valorComercialUSD: parseFloat((totalComercial / tc).toFixed(2)),
        valorBancarioUSD: parseFloat((valBancario / tc).toFixed(2))
      };
    });
  };

  // Compresión fotográfica optimizada (evita bug de cuotas móviles y Firestore)
  // Regla de Aroldo: Fecha de Inspección o Fecha de Actualización (mutuamente excluyentes)
  const handleFechaInspeccionChange = (val) => {
    setFormData(prev => ({
      ...prev,
      fechaInspeccion: val,
      fechaActualizacion: val.trim() ? '' : prev.fechaActualizacion
    }));
  };

  const handleFechaActualizacionChange = (val) => {
    setFormData(prev => ({
      ...prev,
      fechaActualizacion: val,
      fechaInspeccion: val.trim() ? '' : prev.fechaInspeccion
    }));
  };

  const handlePhotoUpload = (category, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionar fotos a max 800px para garantizar rendimiento móvil y documentos < 300KB
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Calidad 0.65 JPEG genera imágenes ligeras (~40KB) extremadamente nítidas para PDF
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);

          setFormData(prev => {
            const currentList = Array.isArray(prev.fotos?.[category])
              ? prev.fotos[category]
              : (prev.fotos?.[category] ? [prev.fotos[category]] : []);
            return {
              ...prev,
              fotos: {
                ...prev.fotos,
                [category]: [...currentList, compressedDataUrl]
              }
            };
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (category, index) => {
    setFormData(prev => {
      const currentList = Array.isArray(prev.fotos?.[category])
        ? prev.fotos[category]
        : (prev.fotos?.[category] ? [prev.fotos[category]] : []);
      const nextList = currentList.filter((_, idx) => idx !== index);
      return {
        ...prev,
        fotos: {
          ...prev.fotos,
          [category]: nextList
        }
      };
    });
  };

  // Soporte para adjuntar múltiples archivos PDF o Imágenes de Consultas Electrónicas RGP
  const handlePdfUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingPdf(true);
    const newItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setPdfProcessStatus(`Procesando documento ${i + 1} de ${files.length} (${file.name})...`);
      try {
        const pages = await convertPdfOrImageToPageImages(file);
        newItems.push({
          id: `rgp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          fecha: new Date().toISOString().slice(0, 10),
          pages: pages
        });
      } catch (err) {
        console.error('Error al procesar archivo:', err);
        alert(`No se pudo procesar el archivo "${file.name}": ${err.message || 'Error desconocido'}`);
      }
    }

    if (newItems.length > 0) {
      setFormData(prev => ({
        ...prev,
        consultasPdfs: [...(prev.consultasPdfs || []), ...newItems]
      }));
    }

    setIsProcessingPdf(false);
    setPdfProcessStatus('');
    if (e.target) e.target.value = '';
  };

  const handleRemovePdf = (index) => {
    setFormData(prev => ({
      ...prev,
      consultasPdfs: prev.consultasPdfs.filter((_, i) => i !== index)
    }));
  };

  const handleRemovePdfPage = (docIndex, pageIndex) => {
    setFormData(prev => {
      const docs = [...(prev.consultasPdfs || [])];
      const targetDoc = docs[docIndex];
      if (!targetDoc) return prev;
      const updatedPages = (targetDoc.pages || []).filter((_, pIdx) => pIdx !== pageIndex);
      if (updatedPages.length === 0) {
        return {
          ...prev,
          consultasPdfs: docs.filter((_, dIdx) => dIdx !== docIndex)
        };
      }
      docs[docIndex] = {
        ...targetDoc,
        pages: updatedPages.map((p, idx) => ({ ...p, pageIndex: idx + 1, totalPaginas: updatedPages.length }))
      };
      return {
        ...prev,
        consultasPdfs: docs
      };
    });
  };

  // Agregar servicio personalizado a la lista
  const handleAddCustomServicio = () => {
    if (!nuevoServicio.trim()) return;
    setFormData(prev => ({
      ...prev,
      serviciosAdicionales: [...(prev.serviciosAdicionales || []), nuevoServicio.trim()]
    }));
    setNuevoServicio('');
  };

  const handleRemoveCustomServicio = (index) => {
    setFormData(prev => ({
      ...prev,
      serviciosAdicionales: prev.serviciosAdicionales.filter((_, i) => i !== index)
    }));
  };

  const activeTenantConfig = getTenantConfig(formData.tenantId || activeTenantId);

  const handleTenantChange = (newTenantId) => {
    const newCfg = getTenantConfig(newTenantId);
    setFormData(prev => {
      let newCodigo = prev.codigo || '';
      if (!isEditing) {
        if (newTenantId === 'cverde') {
          newCodigo = newCodigo.replace(/^LR-/, 'CV-');
          if (!newCodigo.startsWith('CV-')) newCodigo = `${newCfg.codigoPrefix || 'CV-2026-'}0${Math.floor(Math.random() * 90) + 10}`;
        } else {
          newCodigo = newCodigo.replace(/^CV-/, 'LR-');
          if (!newCodigo.startsWith('LR-')) newCodigo = `${newCfg.codigoPrefix || 'LR-2026-'}0${Math.floor(Math.random() * 90) + 10}`;
        }
      }
      return {
        ...prev,
        tenantId: newTenantId,
        codigo: newCodigo,
        solicitante: !isEditing && (prev.solicitante === 'BANCO G&T CONTINENTAL' || prev.solicitante === 'BANCO INDUSTRIAL, S.A.')
          ? (newTenantId === 'cverde' ? 'BANCO INDUSTRIAL, S.A.' : 'BANCO G&T CONTINENTAL')
          : prev.solicitante
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.codigo) {
      alert('Por favor especifique el código del avalúo.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          {/* Form Header */}
          <div className="modal-header" style={{ background: activeTenantConfig.colores?.gradientModal || 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)', flexShrink: 0 }}>
            <div className="modal-header-left">
              <div style={{ background: '#ffffff', borderRadius: '6px', padding: '3px 6px', display: 'flex', alignItems: 'center' }}>
                <img src={activeTenantConfig.logoUrl || '/lex-rosam-logo.png'} alt={activeTenantConfig.nombreCorto} style={{ height: '30px', width: 'auto', maxHeight: '30px' }} />
              </div>
              <div>
                <h2 style={{ color: '#ffffff' }}>{isEditing ? `Editar Avalúo ${formData.codigo}` : `Nuevo Expediente — ${activeTenantConfig.nombreCorto}`}</h2>
                <div className="modal-header-sub" style={{ color: '#cbd5e1' }}>
                  Paso {activeStep} de 5 — Formato Oficial {activeTenantConfig.nombre}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: activeTenantConfig.colores?.primary || '#2563eb' }}
              >
                <Save size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Guardar Expediente
              </button>
              <button type="button" className="modal-close-btn" onClick={onClose} title="Cerrar sin guardar">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Step Indicator Tabs */}
          <div style={{ padding: '0 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div className="modal-tabs" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 1 ? 'active' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <span>1. Solicitud & Inspección</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 2 ? 'active' : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <span>2. Fincas & DICABI</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 3 ? 'active' : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <span>3. Colindancias & Servicios</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 4 ? 'active' : ''}`}
                onClick={() => setActiveStep(4)}
              >
                <span>4. Valores & Dictamen</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 5 ? 'active' : ''}`}
                onClick={() => setActiveStep(5)}
              >
                <span>5. Fotos & PDFs RGP</span>
              </button>
            </div>
          </div>

          {/* Form Body Steps */}
          <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>
            
            {/* ==============================================================
                PASO 1: SOLICITUD, INSPECCIÓN Y DATOS GENERALES
                ============================================================== */}
            {activeStep === 1 && (
              <div>
                {/* Empresa Emisora Selector */}
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '0.85rem 1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                      Empresa Valuadora Emisora (Multi-Tenant)
                    </label>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                      Expediente emitido bajo el formato oficial de: <span style={{ color: activeTenantConfig.colores?.primary }}>{activeTenantConfig.nombre}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleTenantChange('lex-rosam')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '7px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: (formData.tenantId || activeTenantId) === 'lex-rosam' ? '2px solid #002B49' : '1px solid #cbd5e1',
                        background: (formData.tenantId || activeTenantId) === 'lex-rosam' ? '#eff6ff' : '#ffffff',
                        color: (formData.tenantId || activeTenantId) === 'lex-rosam' ? '#002B49' : '#64748b'
                      }}
                    >
                      <img src="/lex-rosam-logo.png" alt="Lex Rosam" style={{ height: '18px', width: 'auto' }} />
                      <span>LEX ROSAM, S.A.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTenantChange('cverde')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '7px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: (formData.tenantId || activeTenantId) === 'cverde' ? '2px solid #004e3b' : '1px solid #cbd5e1',
                        background: (formData.tenantId || activeTenantId) === 'cverde' ? '#ecfdf5' : '#ffffff',
                        color: (formData.tenantId || activeTenantId) === 'cverde' ? '#004e3b' : '#64748b'
                      }}
                    >
                      <img src="/cverde-logo.jpg" alt="C Verde" style={{ height: '18px', width: 'auto', borderRadius: '2px' }} />
                      <span>C VERDE, S.A.</span>
                    </button>
                  </div>
                </div>

                <div className="form-section-title">
                  <FileText size={16} />
                  <span>Identificación del Avalúo y Datos de Solicitud</span>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Código de Expediente *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="Ej: LR-2026-08"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Tipo de Avalúo</label>
                    <select
                      className="form-select"
                      value={formData.tipoAvaluo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          tipoAvaluo: val,
                          aplicaTerreno: val === 'Apartamento / PH' || val === 'Apartamento' ? false : prev.aplicaTerreno
                        }));
                      }}
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Residencial">Residencial</option>
                      <option value="Apartamento / PH">Apartamento / PH (Propiedad Horizontal)</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Terreno / Rústico">Terreno / Rústico</option>
                      <option value="Finca Agrícola">Finca Agrícola</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Solicitante (Banco o Institución)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.solicitante}
                      onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                      placeholder="Ej: BANCO G&T CONTINENTAL, COOPERATIVA GUADALUPANA"
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Fecha de Solicitud</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fechaSolicitud}
                      onChange={(e) => setFormData({ ...formData, fechaSolicitud: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Fecha de Inspección Física</span>
                      {formData.fechaInspeccion ? (
                        <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>● Activa</span>
                      ) : null}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.fechaInspeccion}
                      onChange={(e) => handleFechaInspeccionChange(e.target.value)}
                      placeholder="Ej: 17 de julio de 2026 y 23 de julio de 2026"
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                      Si se llena, la fecha de actualización queda en blanco.
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Fecha de Actualización / Emisión</span>
                      {formData.fechaActualizacion ? (
                        <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>● Activa</span>
                      ) : null}
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fechaActualizacion}
                      onChange={(e) => handleFechaActualizacionChange(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                      Solo para revaluaciones (deja en blanco la fecha de inspección).
                    </div>
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Propietario Principal (Según RGP o Solicitud) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.propietarioPrincipal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          propietarioPrincipal: val,
                          fincas: prev.fincas.map((f, i) => (i === 0 && (!f.propietario || f.propietario === prev.propietarioPrincipal)) ? { ...f, propietario: val } : f)
                        }));
                      }}
                      placeholder="Ej: JUAN PEREZ / INMOBILIARIA S.A."
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Bien Mostrado Por (Nombre completo)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.bienMostradoPor}
                      onChange={(e) => setFormData({ ...formData, bienMostradoPor: e.target.value })}
                      placeholder="Ej: WALTER MANFREDO GOMEZ HIGUEROS"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">DPI / Cédula del Propietario o Solicitante</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dpi}
                      onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                      placeholder="Ej: 2570 51244 0406"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Dirección Completa del Inmueble</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Lote en 1ra. Calle número 3-71 zona 2, Tecpán Guatemala, Chimaltenango"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Ubicación según Coordenadas GPS</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.coordenadas}
                        onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                        placeholder={"Ej: 14°45'47.5\"N 90°59'22.2\"W ó 14.59821, -90.51423"}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={captureGPS}
                        disabled={isLocating}
                        title="Capturar GPS del celular"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                      >
                        <Crosshair size={14} />
                        <span>{isLocating ? 'Capturando...' : 'Capturar GPS'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Referencia de Actualización</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.referenciaActualizacion}
                      onChange={(e) => setFormData({ ...formData, referenciaActualizacion: e.target.value })}
                      placeholder="Ej: Inspección física y certificación de valor"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Descripción General del Inmueble</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.descripcionGeneral}
                    onChange={(e) => setFormData({ ...formData, descripcionGeneral: e.target.value })}
                    placeholder="Descripción física y funcional del inmueble..."
                  />
                </div>

                {/* Profesionales Valuadores y Firmantes Oficiales */}
                <div className="form-section-title" style={{ marginTop: '2rem' }}>
                  <ShieldCheck size={16} />
                  <span>Profesionales Valuadores y Firmantes Oficiales (Páginas 2 y 3 del Reporte)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  Configure los profesionales valuadores autorizados que certificarán y firmarán este expediente. Puede seleccionar de los accesos rápidos o escribir cualquier nombre y registro oficial libremente.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: formData.incluirFirmaRevisor ? '1fr 1fr' : '1fr', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #e2e8f0' }}>
                  
                  {/* Valuador Principal (Firma Derecha) */}
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0d2847' }}>
                        Valuador Principal (Firma Oficial) *
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        Firma Principal
                      </span>
                    </div>

                    <div className="form-field" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px', display: 'block' }}>Nombre y Título del Valuador</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.valuadorPrincipal}
                        onChange={(e) => setFormData({ ...formData, valuadorPrincipal: e.target.value })}
                        placeholder="Ej: Lic. Aroldo Oliverio Ruiz Orozco"
                        required
                      />
                    </div>

                    <div className="form-field" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px', display: 'block' }}>Número de Registro / Autorización</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.registroPrincipal}
                        onChange={(e) => setFormData({ ...formData, registroPrincipal: e.target.value })}
                        placeholder="Ej: Valuador autorizado 2572-R-2026"
                        required
                      />
                    </div>

                    {/* Accesos rápidos Valuador Principal */}
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Accesos rápidos:</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            valuadorPrincipal: 'Lic. Aroldo Oliverio Ruiz Orozco',
                            registroPrincipal: 'Valuador autorizado 2572-R-2026'
                          })}
                          style={{ fontSize: '0.72rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Lic. Aroldo Ruiz (2572-R-2026)
                        </button>
                        {usuarios && usuarios.filter(u => u.rol === 'admin' || u.rol === 'valuador').map(u => (
                          <button
                            key={u.id || u.email}
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              valuadorPrincipal: u.nombre || u.email,
                              registroPrincipal: u.titulo || 'Valuador Autorizado'
                            })}
                            style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                          >
                            {u.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Valuador Revisor / Segundo Firmante (Firma Izquierda) */}
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0d2847' }}>
                        Valuador Revisor (Segundo Firmante)
                      </span>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.incluirFirmaRevisor}
                          onChange={(e) => setFormData({ ...formData, incluirFirmaRevisor: e.target.checked })}
                        />
                        <span style={{ fontWeight: 700, color: formData.incluirFirmaRevisor ? '#16a34a' : '#94a3b8' }}>
                          {formData.incluirFirmaRevisor ? 'Activo (2 Firmas)' : 'Omitido (1 Firma)'}
                        </span>
                      </label>
                    </div>

                    {formData.incluirFirmaRevisor ? (
                      <>
                        <div className="form-field" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px', display: 'block' }}>Nombre y Título del Revisor</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.valuadorRevisor}
                            onChange={(e) => setFormData({ ...formData, valuadorRevisor: e.target.value })}
                            placeholder="Ej: Lic. Luis Felipe Tolaque Tobias"
                          />
                        </div>

                        <div className="form-field" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px', display: 'block' }}>Número de Registro / Autorización</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.registroRevisor}
                            onChange={(e) => setFormData({ ...formData, registroRevisor: e.target.value })}
                            placeholder="Ej: Valuador autorizado 193-T-93"
                          />
                        </div>

                        {/* Accesos rápidos Valuador Revisor */}
                        <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Accesos rápidos:</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                valuadorRevisor: 'Lic. Edgar Rolando Martínez Larios',
                                registroRevisor: 'Valuador autorizado 2571-M-2026'
                              })}
                              style={{ fontSize: '0.72rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Lic. Edgar Martínez (2571-M-2026)
                            </button>
                            {usuarios && usuarios.filter(u => u.rol === 'admin' || u.rol === 'valuador').map(u => (
                              <button
                                key={u.id || u.email}
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  valuadorRevisor: u.nombre || u.email,
                                  registroRevisor: u.titulo || 'Valuador Autorizado'
                                })}
                                style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer' }}
                              >
                                {u.nombre}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                        ℹ️ Segunda firma omitida. El reporte oficial PDF centrará la firma del Valuador Principal en las páginas 2 y 3.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ==============================================================
                PASO 2: FINCAS (ÁREAS INDEPENDIENTES Y DESMEMBRACIONES) Y DICABI
                ============================================================== */}
            {activeStep === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="form-section-title" style={{ margin: 0 }}>
                    <Building size={16} />
                    <span>Fincas Registradas y Áreas Individuales</span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={addFinca}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderColor: '#2563eb', color: '#1b497d', fontWeight: 600 }}
                  >
                    <Plus size={14} style={{ marginRight: '4px', display: 'inline' }} />
                    Agregar Otra Finca
                  </button>
                </div>

                <div className="form-field" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Propietario Principal del Inmueble</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.propietarioPrincipal}
                    onChange={(e) => setFormData({ ...formData, propietarioPrincipal: e.target.value })}
                    placeholder="Nombre completo del propietario o empresa titular"
                  />
                </div>

                {/* Lista de Fincas con campos individuales */}
                {formData.fincas.map((fincaItem, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      background: '#ffffff', 
                      borderRadius: '8px', 
                      border: '1.5px solid #cbd5e1', 
                      padding: '1rem', 
                      marginBottom: '1rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0d2847' }}>
                        Finca #{index + 1} {fincaItem.finca ? `(No. ${fincaItem.finca})` : ''}
                      </span>
                      {formData.fincas.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={() => removeFinca(index)}
                          title="Eliminar esta finca"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="form-grid-4">
                      <div className="form-field">
                        <label className="form-label">No. Finca *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fincaItem.finca}
                          onChange={(e) => updateFinca(index, 'finca', e.target.value)}
                          placeholder="Ej: 5289"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Folio *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fincaItem.folio}
                          onChange={(e) => updateFinca(index, 'folio', e.target.value)}
                          placeholder="Ej: 289"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Libro *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fincaItem.libro}
                          onChange={(e) => updateFinca(index, 'libro', e.target.value)}
                          placeholder="Ej: 71E de Chimaltenango"
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Propietario de la Finca</label>
                        <input
                          type="text"
                          className="form-input"
                          value={fincaItem.propietario || formData.propietarioPrincipal}
                          onChange={(e) => updateFinca(index, 'propietario', e.target.value)}
                          placeholder="Propietario de la finca"
                        />
                      </div>
                    </div>

                    {/* Desglose de Áreas Individuales para esta finca */}
                    <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Áreas Individuales de esta Finca (m²)
                      </div>
                      <div className="form-grid-5">
                        <div className="form-field">
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>Orig. Registrada (m²)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            value={fincaItem.areaRegistrada || 0}
                            onChange={(e) => updateFinca(index, 'areaRegistrada', e.target.value)}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label" style={{ fontSize: '0.72rem', color: '#b91c1c' }}>Desmembrada (m²)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            value={fincaItem.areaDesmembrada || 0}
                            onChange={(e) => updateFinca(index, 'areaDesmembrada', e.target.value)}
                            title="Se resta automáticamente del área original"
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d2847' }}>Act. Registrada (m²)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            style={{ fontWeight: 700, background: '#f1f5f9' }}
                            value={fincaItem.areaActualRegistrada || 0}
                            readOnly
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>Área Física (m²)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            value={fincaItem.areaFisica || 0}
                            onChange={(e) => updateFinca(index, 'areaFisica', e.target.value)}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af' }}>Área Valuada (m²)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            style={{ fontWeight: 700, borderColor: '#3b82f6' }}
                            value={fincaItem.areaValuada || 0}
                            onChange={(e) => updateFinca(index, 'areaValuada', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Resumen Total de Áreas */}
                <div style={{ background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>
                    <strong>Totales Acumulados:</strong> Original: <strong>{formData.areaRegistrada} m²</strong> | Desmembrada: <strong>{formData.areaDesmembrada} m²</strong> | Actual Registrada: <strong>{formData.areaActualRegistrada} m²</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 700 }}>
                    Área Valuada Total: {formData.areaValuada} m² ({parseFloat(((formData.areaValuada || 0) * 1.43115).toFixed(2))} v²)
                  </div>
                </div>

                {/* Aspectos Legales y Gravámenes - Cuadro Oficial LIMITACIONES (Página 2 del Reporte) */}
                <div className="form-section-title" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} />
                    <span>Aspectos Legales y Gravámenes (Cuadro Oficial LIMITACIONES Página 2)</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 'normal' }}>
                    Se imprime directamente en la Página 2 del Formato Oficial
                  </span>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Anotaciones y Gravámenes *</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gravamenes: 'Libre de gravámenes hipotecarios.' })}
                        style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                      >
                        + Libre de gravámenes
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.gravamenes}
                      onChange={(e) => setFormData({ ...formData, gravamenes: e.target.value })}
                      placeholder="Ej: Hipoteca a favor de Banco G&T Continental, Sociedad Anónima, en cada una de las fincas..."
                    />
                  </div>

                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Servidumbres *</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, servidumbres: 'Sin servidumbres activas.' })}
                        style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                      >
                        + Sin servidumbres
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.servidumbres}
                      onChange={(e) => setFormData({ ...formData, servidumbres: e.target.value })}
                      placeholder="Ej: Servidumbre de paso recíproca con predio colindante / Sin servidumbres activas..."
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: '0.65rem' }}>
                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Áreas Comunes *</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, areasComunes: 'No aplica' })}
                        style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                      >
                        + No aplica
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.areasComunes}
                      onChange={(e) => setFormData({ ...formData, areasComunes: e.target.value })}
                      placeholder="Ej: Soportan y gozan de los elementos comunes que constan en la Finca 1334, Folio 334, Libro 1163E / No aplica..."
                    />
                  </div>

                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Desmembración *</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, desmembracion: 'Sin desmembraciones pendientes.' })}
                        style={{ fontSize: '0.72rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                      >
                        + Sin desmembraciones
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.desmembracion}
                      onChange={(e) => setFormData({ ...formData, desmembracion: e.target.value })}
                      placeholder="Ej: Sin desmembraciones pendientes / Desmembraciones de fracciones autorizadas / No aplica..."
                    />
                  </div>
                </div>

                <div className="form-grid-2" style={{ marginTop: '0.65rem' }}>
                  <div className="form-field">
                    <label className="form-label">Otras Limitaciones o Régimen Inscrito</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.limitaciones}
                      onChange={(e) => setFormData({ ...formData, limitaciones: e.target.value })}
                      placeholder="Ej: Sometido al régimen de propiedad horizontal y reglamento interno..."
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Anotaciones de Demanda o Embargo</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.anotaciones}
                      onChange={(e) => setFormData({ ...formData, anotaciones: e.target.value })}
                      placeholder="Ej: Ninguna anotación de demanda vigente según consulta electrónica del RGP..."
                    />
                  </div>
                </div>

                {/* DICABI Independiente del RGP - Cuadro(s) según cantidad de fincas */}
                <div className="form-section-title" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={16} />
                    <span>Dirección de Catastro y Avalúo de Bienes Inmuebles (DICABI) — {formData.fincas.length} {formData.fincas.length === 1 ? 'Cuadro' : 'Cuadros según fincas'}</span>
                  </div>
                  {formData.fincas.length > 1 && (
                    <button
                      type="button"
                      className="btn-text"
                      style={{ fontSize: '0.75rem', color: '#1e40af', padding: '0.25rem 0.65rem', background: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        const first = formData.fincas[0] || {};
                        const baseNombre = first.dicabiNombre || formData.propietarioPrincipal;
                        const baseDir = first.dicabiDireccion || formData.direccion;
                        setFormData(prev => ({
                          ...prev,
                          fincas: prev.fincas.map((f, idx) => idx === 0 ? f : {
                            ...f,
                            dicabiNombre: f.dicabiNombre || baseNombre,
                            dicabiDireccion: f.dicabiDireccion || baseDir,
                            dicabiObservaciones: f.dicabiObservaciones || (f.dicabiMatricula ? '' : 'Finca no inscrita en DICABI.')
                          })
                        }));
                      }}
                      title="Copia el titular catastral y la dirección a todas las fincas"
                    >
                      Copiar Titular y Dirección a las demás fincas
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                  {formData.fincas.map((fincaItem, fIndex) => (
                    <div 
                      key={fIndex} 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ background: '#0d2847', color: '#ffffff', padding: '0.45rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                        <span>
                          CUADRO DICABI {formData.fincas.length > 1 ? `— FINCA: ${fincaItem.finca || `No. ${fIndex + 1}`}` : ''}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#93c5fd' }}>
                          {fIndex === 0 ? 'Finca Principal' : `Finca Filial ${fIndex + 1}`}
                        </span>
                      </div>

                      <div style={{ padding: '0.85rem' }}>
                        <div className="form-grid-3">
                          <div className="form-field">
                            <label className="form-label">Matrícula Fiscal DICABI</label>
                            <input
                              type="text"
                              className="form-input"
                              value={fincaItem.dicabiMatricula || ''}
                              onChange={(e) => updateFinca(fIndex, 'dicabiMatricula', e.target.value)}
                              placeholder={fIndex === 0 ? "Ej: 04-03-1258-1 o Pendiente" : "Ej: 04-03-1258-2 o vacía"}
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label">Nombre del Titular Catastral</label>
                            <input
                              type="text"
                              className="form-input"
                              value={fincaItem.dicabiNombre || ''}
                              onChange={(e) => updateFinca(fIndex, 'dicabiNombre', e.target.value)}
                              placeholder="Nombre según padrón fiscal DICABI (opcional)"
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label">Área Catastral Registrada</label>
                            <input
                              type="text"
                              className="form-input"
                              value={fincaItem.dicabiArea || ''}
                              onChange={(e) => updateFinca(fIndex, 'dicabiArea', e.target.value)}
                              placeholder="Ej: 400.00 m² (opcional)"
                            />
                          </div>
                        </div>

                        <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
                          <div className="form-field">
                            <label className="form-label">Dirección según DICABI / IUSI</label>
                            <input
                              type="text"
                              className="form-input"
                              value={fincaItem.dicabiDireccion || ''}
                              onChange={(e) => updateFinca(fIndex, 'dicabiDireccion', e.target.value)}
                              placeholder="Dirección catastral municipal (opcional)"
                            />
                          </div>
                          <div className="form-field">
                            <label className="form-label">Observaciones Catastrales DICABI</label>
                            <input
                              type="text"
                              className="form-input"
                              value={fincaItem.dicabiObservaciones || ''}
                              onChange={(e) => updateFinca(fIndex, 'dicabiObservaciones', e.target.value)}
                              placeholder="Ej: Finca no inscrita en DICABI (opcional)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==============================================================
                PASO 3: COLINDANCIAS, SERVICIOS (CHECKLIST) Y CONSTRUCCIÓN
                ============================================================== */}
            {activeStep === 3 && (
              <div>
                {/* Checkbox y Botón de Terreno / Colindancias */}
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: formData.aplicaTerreno === false ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: formData.aplicaTerreno === false ? '1.5px solid #ef4444' : '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.aplicaTerreno !== false}
                        onChange={(e) => handleToggleAplicaTerreno(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                      <span>El inmueble cuenta con terreno independiente y colindancias</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleAplicaTerreno(formData.aplicaTerreno === false ? true : false)}
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid', borderColor: formData.aplicaTerreno === false ? '#ef4444' : '#64748b', background: '#ffffff', color: formData.aplicaTerreno === false ? '#ef4444' : '#334155', cursor: 'pointer', fontWeight: 700 }}
                    >
                      {formData.aplicaTerreno === false ? '✓ Activar Terreno' : '✕ Quitar Terreno (No Aplica)'}
                    </button>
                  </div>
                  {formData.aplicaTerreno === false ? (
                    <div style={{ margin: '0.5rem 0 0 1.75rem', fontSize: '0.8rem', color: '#991b1b', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                      🏢 <strong>Régimen de Propiedad Horizontal / Apartamento:</strong> Se omitirán las secciones de terreno y colindancias en el informe oficial impreso para evitar espacios en blanco legales y no sumará al valor comercial.
                    </div>
                  ) : (
                    <div style={{ margin: '0.35rem 0 0 1.75rem', fontSize: '0.74rem', color: '#64748b' }}>
                      Desmarcar o presionar "Quitar Terreno" si es un apartamento o inmueble en régimen vertical para que no deje espacios vacíos en el PDF.
                    </div>
                  )}
                </div>

                {formData.aplicaTerreno !== false && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div className="form-section-title" style={{ margin: 0 }}>
                        <MapPin size={16} />
                        <span>Colindancias Registrales y Físicas del Terreno — {formData.fincas.length} {formData.fincas.length === 1 ? 'Cuadro' : 'Cuadros según Fincas'}</span>
                      </div>
                      {formData.fincas.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => copyColindanciasToAll(0)}
                          title="Copia las colindancias registrales y físicas de la Finca 1 a las demás fincas"
                        >
                          <Copy size={13} />
                          <span>Copiar Colindancias de Finca 1 a las demás</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {formData.fincas.map((fincaItem, fIndex) => {
                        const col = fincaItem.colindancias || (fIndex === 0 ? formData.colindancias : {}) || {};
                        return (
                          <div 
                            key={fIndex} 
                            style={{ 
                              background: '#ffffff', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ background: '#0d2847', color: '#ffffff', padding: '0.45rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>
                                  CUADRO DE COLINDANCIAS {formData.fincas.length > 1 ? `— FINCA: ${fincaItem.finca || `No. ${fIndex + 1}`}` : ''}
                                </span>
                                {formData.fincas.length > 1 && (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#93c5fd' }}>
                                    ({fIndex === 0 ? 'Finca Principal' : `Finca Filial ${fIndex + 1}`})
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  color: '#ffffff',
                                  borderRadius: '4px',
                                  padding: '0.2rem 0.55rem',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                                onClick={() => copyRegistralToFisica(fIndex)}
                                title="Copia las colindancias registrales a las colindancias físicas de esta finca"
                              >
                                <Copy size={12} />
                                <span>Copiar Registrales a Físicas</span>
                              </button>
                            </div>

                            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {/* Grid con dos paneles: Colindancias Registrales vs Colindancias Físicas */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                                {/* Panel Registrales */}
                                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.6rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem' }}>
                                    🏛️ Colindancias Registrales (RGP)
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Norte Registral</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem' }}
                                        value={col.norte || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'norte', e.target.value)}
                                        placeholder="Ej: 18.50 m con calle pública municipal"
                                      />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Sur Registral</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem' }}
                                        value={col.sur || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'sur', e.target.value)}
                                        placeholder="Ej: 18.50 m con Finca 5288"
                                      />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Este Registral</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem' }}
                                        value={col.este || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'este', e.target.value)}
                                        placeholder="Ej: 10.76 m con propiedad privada particular"
                                      />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem' }}>Oeste Registral</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem' }}
                                        value={col.oeste || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'oeste', e.target.value)}
                                        placeholder="Ej: 10.76 m con lote colindante"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Panel Físicas */}
                                <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.6rem', borderBottom: '1px solid #86efac', paddingBottom: '0.3rem' }}>
                                    📍 Colindancias Físicas (In Situ / Campo)
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem', color: '#14532d' }}>Norte Físico</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem', borderColor: '#86efac' }}
                                        value={col.norteFisica || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'norteFisica', e.target.value)}
                                        placeholder="Ej: 18.50 m con calle pavimentada"
                                      />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem', color: '#14532d' }}>Sur Físico</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem', borderColor: '#86efac' }}
                                        value={col.surFisica || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'surFisica', e.target.value)}
                                        placeholder="Ej: 18.50 m con pared perimetral y casa vecina"
                                      />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem', color: '#14532d' }}>Este Físico</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem', borderColor: '#86efac' }}
                                        value={col.esteFisica || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'esteFisica', e.target.value)}
                                        placeholder="Ej: 10.76 m con muro medianero"
                                      />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.15rem', color: '#14532d' }}>Oeste Físico</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: '0.82rem', borderColor: '#86efac' }}
                                        value={col.oesteFisica || ''}
                                        onChange={(e) => updateFincaColindancia(fIndex, 'oesteFisica', e.target.value)}
                                        placeholder="Ej: 10.76 m con callejón de acceso o lote baldío"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Servicios con Checklist */}
                <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                  <CheckSquare size={16} />
                  <span>Servicios e Infraestructura (Checklist Oficial — 31 Elementos)</span>
                </div>

                <div className="form-grid-3">
                  {SERVICIOS_INFRAESTRUCTURA_LIST.map(srv => {
                    const currentVal = formData.servicios?.[srv.key] !== undefined ? formData.servicios[srv.key] : '';
                    const trimmed = typeof currentVal === 'string' ? currentVal.trim().toLowerCase() : '';
                    const isSelectedSi = trimmed === 'sí' || trimmed === 'si';
                    const isSelectedNo = trimmed === 'no';
                    const hasYesNoButtons = srv.key !== 'tipoCalle';

                    return (
                      <div key={srv.key} className="form-field">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <label className="form-label" style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                            {srv.label}
                          </label>

                          {/* Botones rápidos Sí / No para todos los campos excepto Tipo de calle */}
                          {hasYesNoButtons ? (
                            <div style={{ display: 'flex', gap: '3px' }}>
                              <button
                                type="button"
                                style={{
                                  padding: '1px 7px',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  borderRadius: '3px',
                                  border: isSelectedSi ? '1px solid #0d2847' : '1px solid #cbd5e1',
                                  background: isSelectedSi ? '#0d2847' : '#ffffff',
                                  color: isSelectedSi ? '#ffffff' : '#475569',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onClick={() => setFormData({
                                  ...formData,
                                  servicios: { ...formData.servicios, [srv.key]: 'Sí' }
                                })}
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                style={{
                                  padding: '1px 7px',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  borderRadius: '3px',
                                  border: isSelectedNo ? '1px solid #475569' : '1px solid #cbd5e1',
                                  background: isSelectedNo ? '#475569' : '#ffffff',
                                  color: isSelectedNo ? '#ffffff' : '#475569',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onClick={() => setFormData({
                                  ...formData,
                                  servicios: { ...formData.servicios, [srv.key]: 'No' }
                                })}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            /* Atajos rápidos de material para Tipo de calle */
                            <div style={{ display: 'flex', gap: '3px' }}>
                              {['Asfalto', 'Adoquín', 'Terracería'].map(tipo => (
                                <button
                                  key={tipo}
                                  type="button"
                                  style={{
                                    padding: '1px 5px',
                                    fontSize: '0.63rem',
                                    fontWeight: 600,
                                    borderRadius: '3px',
                                    border: trimmed === tipo.toLowerCase() ? '1px solid #0d2847' : '1px solid #cbd5e1',
                                    background: trimmed === tipo.toLowerCase() ? '#0d2847' : '#ffffff',
                                    color: trimmed === tipo.toLowerCase() ? '#ffffff' : '#64748b',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => setFormData({
                                    ...formData,
                                    servicios: { ...formData.servicios, [srv.key]: tipo }
                                  })}
                                >
                                  {tipo}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          value={currentVal}
                          onChange={(e) => setFormData({
                            ...formData,
                            servicios: { ...formData.servicios, [srv.key]: e.target.value }
                          })}
                          placeholder={srv.defaultVal}
                          style={{ fontSize: '0.8rem' }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Agregar servicios adicionales */}
                <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0d2847', marginBottom: '0.5rem' }}>
                    + Agregar Otros Servicios a la Lista
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={nuevoServicio}
                      onChange={(e) => setNuevoServicio(e.target.value)}
                      placeholder="Ej: Pozo propio de absorción, Vigilancia privada 24h, etc."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomServicio();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddCustomServicio}
                      style={{ whiteSpace: 'nowrap', borderColor: '#2563eb', color: '#1e40af' }}
                    >
                      <Plus size={15} /> Agregar
                    </button>
                  </div>

                  {formData.serviciosAdicionales?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {formData.serviciosAdicionales.map((s, idx) => (
                        <span 
                          key={idx}
                          style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Check size={12} />
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomServicio(idx)}
                            style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: '4px' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Características de Construcción */}
                <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                  <Building size={16} />
                  <span>Características de la Construcción</span>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Edad Aproximada</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.edadAprox || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, edadAprox: e.target.value }
                      })}
                      placeholder="Ej: 5 años"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Estado Actual</label>
                    <select
                      className="form-select"
                      value={formData.construccion?.estadoActual || 'Bueno'}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, estadoActual: e.target.value }
                      })}
                    >
                      <option value="Excelente">Excelente</option>
                      <option value="Muy Bueno">Muy Bueno</option>
                      <option value="Bueno">Bueno</option>
                      <option value="Regular">Regular</option>
                      <option value="Malo">Malo</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Apropiada al Sector</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.apropiadaSector || 'Sí'}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, apropiadaSector: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Distribución de Ambientes</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={formData.construccion?.distribucion || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      construccion: { ...formData.construccion, distribucion: e.target.value }
                    })}
                    placeholder="Describa ambientes por nivel: salas, dormitorios, baños, cocinas, etc."
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Estructura</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.estructura || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, estructura: e.target.value }
                      })}
                      placeholder="Concreto armado / Marcos de acero"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Paredes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.paredes || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, paredes: e.target.value }
                      })}
                      placeholder="Block pómez / repello y cernido"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Techo y Entrepiso</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.techoEntrePiso || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, techoEntrePiso: e.target.value }
                      })}
                      placeholder="Losa maciza de concreto"
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Piso</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.piso || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, piso: e.target.value }
                      })}
                      placeholder="Cerámico / Porcelanato"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Puertas</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.puertas || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, puertas: e.target.value }
                      })}
                      placeholder="Madera y metal"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Ventanas</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.ventanas || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, ventanas: e.target.value }
                      })}
                      placeholder="Aluminio y vidrio"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Instalación Sanitaria</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.sanitaria || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, sanitaria: e.target.value }
                      })}
                      placeholder="Artefactos estándar en buen estado"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Instalación Eléctrica</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.electrica || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, electrica: e.target.value }
                      })}
                      placeholder="Empotrada monofásica / trifásica"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Factores Positivos</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.factoresPositivos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, factoresPositivos: e.target.value }
                      })}
                      placeholder="Ubicación comercial, alta demanda, estado de conservación"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Factores Negativos</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.construccion?.factoresNegativos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        construccion: { ...formData.construccion, factoresNegativos: e.target.value }
                      })}
                      placeholder="Ninguno de gravedad / tráfico en horas pico"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                PASO 4: VALORES, FINCAS ASOCIADAS Y VARAS CUADRADAS
                ============================================================== */}
            {activeStep === 4 && (
              <div>
                {/* Cuadro Oficial Editable: Dictamen de Garantía Crediticia (Pág. 6 del reporte) */}
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0d2847', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} style={{ color: '#1e40af' }} />
                      <span style={{ fontWeight: 800, color: '#0d2847', fontSize: '0.92rem', textTransform: 'uppercase' }}>
                        Dictamen Oficial de Garantía Crediticia (Cuadro Superior Pág. 6)
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Editable para el informe oficial PDF
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    Este texto se imprime en el recuadro superior de la página 6 del reporte. Puede editarlo directamente o seleccionar una de las plantillas oficiales predefinidas:
                  </p>

                  {/* Botones de plantilla rápida */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dictamenGarantia: DICTAMEN_PRESETS.favorable })}
                      style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✓ Favorable Estándar
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dictamenGarantia: DICTAMEN_PRESETS.condicionado })}
                      style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⚠️ Favorable Condicionado
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dictamenGarantia: DICTAMEN_PRESETS.noFavorable })}
                      style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✕ No Favorable
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dictamenGarantia: DICTAMEN_PRESETS.construccion })}
                      style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      🏗️ En Construcción
                    </button>
                  </div>

                  <textarea
                    className="form-input"
                    rows={3}
                    style={{ width: '100%', fontStyle: 'italic', fontSize: '0.86rem', lineHeight: 1.5, padding: '0.65rem 0.85rem' }}
                    value={formData.dictamenGarantia !== undefined ? formData.dictamenGarantia : DEFAULT_DICTAMEN_GARANTIA}
                    onChange={(e) => setFormData({ ...formData, dictamenGarantia: e.target.value })}
                    placeholder="Escriba el dictamen de garantía oficial..."
                  />
                </div>

                <div className="form-section-title">
                  <DollarSign size={16} />
                  <span>Desglose Matemático de Valoración (Terreno con Fincas y Varas²)</span>
                </div>

                {/* Terreno con columna de Finca, Varas Cuadradas y Valores Independientes */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: formData.aplicaTerreno === false ? '1.5px solid #ef4444' : '1.5px solid #0d2847', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0d2847', fontSize: '0.95rem' }}>
                        VALORACIÓN DEL TERRENO (VALOR INDEPENDIENTE POR FINCA)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Cada finca o porción de terreno cuenta con su propia área y su valor unitario independiente en Q/m²
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAplicaTerreno(formData.aplicaTerreno === false ? true : false)}
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid', borderColor: formData.aplicaTerreno === false ? '#ef4444' : '#64748b', background: '#ffffff', color: formData.aplicaTerreno === false ? '#ef4444' : '#334155', cursor: 'pointer', fontWeight: 700 }}
                      >
                        {formData.aplicaTerreno === false ? '✓ Activar Terreno' : '✕ Quitar Terreno (No Aplica)'}
                      </button>
                      <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        Factor Oficial: 1 m² = 1.43115 v²
                      </span>
                    </div>
                  </div>

                  {formData.aplicaTerreno === false ? (
                    <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '6px', border: '1px dashed #fca5a5', textAlign: 'center', color: '#991b1b', fontSize: '0.85rem' }}>
                      🏢 <strong>Terreno Omitido (No Aplica):</strong> Este avalúo no liquida valor de terreno (Régimen de Propiedad Horizontal o No Aplica). La tabla de terreno no se imprimirá en el PDF y su valor es Q. 0.00.
                    </div>
                  ) : (
                    <>
                      <div className="table-container" style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', overflowX: 'auto', marginBottom: '0.75rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ background: '#0d2847', color: '#ffffff', textAlign: 'center' }}>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '120px' }}>FINCA</th>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '110px' }}>ÁREA (m²)</th>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '130px' }}>EQUIV. VARAS² (v²)</th>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '60px' }}>UNIDAD</th>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '150px' }}>VALOR UNITARIO (Q/m²)</th>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '130px' }}>SUBTOTAL (Q)</th>
                              <th style={{ padding: '0.45rem', border: '1px solid #1e3a8a', width: '40px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(formData.desgloseTerreno?.items || []).map((it, idx) => (
                              <tr key={it.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ textAlign: 'center', fontWeight: 700, padding: '0.3rem 0.4rem', fontSize: '0.82rem' }}
                                    value={it.finca || ''}
                                    onChange={(e) => handleTerrenoItemChange(it.id, 'finca', e.target.value)}
                                    placeholder={`Finca ${idx + 1}`}
                                  />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    step="any"
                                    className="form-input"
                                    style={{ textAlign: 'center', padding: '0.3rem 0.4rem', fontSize: '0.82rem' }}
                                    value={it.area}
                                    onChange={(e) => handleTerrenoItemChange(it.id, 'area', e.target.value)}
                                  />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', fontWeight: 600, color: '#1e40af', background: '#eff6ff' }}>
                                  {(Number(it.varasCuadradas || (Number(it.area || 0) * 1.43115))).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                                  m²
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                                  <input
                                    type="number"
                                    step="any"
                                    className="form-input"
                                    style={{ textAlign: 'right', fontWeight: 700, padding: '0.3rem 0.4rem', fontSize: '0.82rem', borderColor: '#2563eb' }}
                                    value={it.valorUnitario}
                                    onChange={(e) => handleTerrenoItemChange(it.id, 'valorUnitario', e.target.value)}
                                    placeholder="0.00"
                                  />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', fontWeight: 700, color: '#0d2847' }}>
                                  Q. {Number(it.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '0.35rem 0.4rem', textAlign: 'center' }}>
                                  {(formData.desgloseTerreno?.items || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTerrenoItem(it.id)}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      title="Eliminar este terreno"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: '#f1f5f9', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                              <td style={{ padding: '0.45rem', textAlign: 'center' }}>TOTAL:</td>
                              <td style={{ padding: '0.45rem', textAlign: 'center' }}>
                                {(formData.desgloseTerreno?.items || []).reduce((acc, it) => acc + (parseFloat(it.area) || 0), 0).toFixed(2)} m²
                              </td>
                              <td style={{ padding: '0.45rem', textAlign: 'center', color: '#1e40af' }}>
                                {(formData.desgloseTerreno?.items || []).reduce((acc, it) => acc + (parseFloat(it.varasCuadradas || ((parseFloat(it.area) || 0) * 1.43115)) || 0), 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} v²
                              </td>
                              <td style={{ padding: '0.45rem', textAlign: 'center' }}>m²</td>
                              <td style={{ padding: '0.45rem', textAlign: 'right', color: '#64748b' }}>-</td>
                              <td style={{ padding: '0.45rem', textAlign: 'right', color: '#0d2847' }}>
                                Q. {(formData.desgloseTerreno?.items || []).reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={handleAddTerrenoItem}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: '#ffffff', border: '1px dashed #2563eb', color: '#2563eb', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <Plus size={14} />
                            <span>Agregar otra Finca / Fracción de Terreno</span>
                          </button>
                          {formData.fincas && formData.fincas.length > 0 && (
                            <button
                              type="button"
                              onClick={handleSyncFincasToTerreno}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                              title="Cargar automáticamente las fincas del Paso 1 con sus áreas valuadas"
                            >
                              <RefreshCw size={13} />
                              <span>Sincronizar con Fincas Registrales ({formData.fincas.length})</span>
                            </button>
                          )}
                        </div>

                        <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#0d2847' }}>
                          Subtotal Terreno: {formData.aplicaTerreno === false ? 'Q. 0.00 (No Aplica)' : `Q. ${Number(formData.desgloseTerreno.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Construcción Matricial */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0d2847', fontSize: '0.95rem' }}>
                        VALORACIÓN DE CONSTRUCCIÓN
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Matriz de valoración por niveles, áreas o ambientes constructivos
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleAddConstruccionItem}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: '#2563eb', color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', background: '#eff6ff' }}
                    >
                      <Plus size={15} />
                      <span>Agregar Fila / Renglón</span>
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)', color: '#ffffff' }}>
                          <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left', minWidth: '220px' }}>Descripción / Ambiente</th>
                          <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '130px' }}>Área (m²)</th>
                          <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '140px' }}>Valor Unitario (Q/m²)</th>
                          <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '150px' }}>Subtotal (Q)</th>
                          <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '45px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formData.desgloseConstruccion?.items || []).map((item, idx) => (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.84rem', padding: '0.4rem 0.6rem' }}
                                value={item.descripcion || ''}
                                placeholder="Ej: Primer Nivel, Garaje, Bodega, etc."
                                onChange={(e) => handleUpdateConstruccionItem(item.id, 'descripcion', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                step="any"
                                className="form-input"
                                style={{ fontSize: '0.84rem', padding: '0.4rem 0.6rem', textAlign: 'right' }}
                                value={item.area === 0 ? '' : item.area}
                                placeholder="0.00"
                                onChange={(e) => handleUpdateConstruccionItem(item.id, 'area', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                step="any"
                                className="form-input"
                                style={{ fontSize: '0.84rem', padding: '0.4rem 0.6rem', textAlign: 'right' }}
                                value={item.valorUnitario === 0 ? '' : item.valorUnitario}
                                placeholder="0.00"
                                onChange={(e) => handleUpdateConstruccionItem(item.id, 'valorUnitario', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0d2847', fontSize: '0.88rem' }}>
                              Q. {Number(item.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}>
                              {(formData.desgloseConstruccion?.items || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveConstruccionItem(item.id)}
                                  title="Eliminar esta fila"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                          <td style={{ padding: '0.65rem 0.75rem', color: '#0d2847' }}>
                            TOTAL CONSTRUCCIÓN ({formData.desgloseConstruccion?.items?.length || 1} {(formData.desgloseConstruccion?.items?.length || 1) === 1 ? 'renglón' : 'renglones'})
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#0d2847' }}>
                            {Number(formData.desgloseConstruccion?.area || 0).toFixed(2)} m²
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#64748b' }}>-</td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#1e40af', fontSize: '0.95rem' }}>
                            Q. {Number(formData.desgloseConstruccion?.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Totales Comerciales y Bancarios (80%) */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}>
                  <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
                    {/* Tarjeta Comercial 100% */}
                    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '6px', border: '1.5px solid #0d2847' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        1. VALOR COMERCIAL TOTAL (100%)
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0d2847', marginTop: '4px' }}>
                        Q. {Number(formData.valorComercialGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginTop: '2px' }}>
                        $ {Number(formData.valorComercialUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </div>
                    </div>

                    {/* Tarjeta Bancaria 80% - Regla Oficial Aroldo */}
                    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '6px', border: '1.5px solid #2563eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                          2. SUMA TOTAL VALOR BANCARIO
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#dbeafe', color: '#1e40af' }}>
                          80% Garantía
                        </span>
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
                        Q. {Number(formData.valorBancarioGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                        $ {Number(formData.valorBancarioUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </div>
                      {/* Botones de acción rápida para recalcular o ajustar el porcentaje bancario */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const com = parseFloat(formData.valorComercialGTQ) || 0;
                            const exact80 = parseFloat((com * 0.8).toFixed(2));
                            const tc = parseFloat(formData.tipoCambio) || 7.62581;
                            setFormData(prev => ({
                              ...prev,
                              valorBancarioGTQ: exact80,
                              valorBancarioUSD: parseFloat((exact80 / tc).toFixed(2))
                            }));
                          }}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#ffffff', border: '1px solid #93c5fd', borderRadius: '4px', color: '#1d4ed8', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ⚡ 80% Estándar (Q. {(Number(formData.valorComercialGTQ || 0) * 0.8).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const com = parseFloat(formData.valorComercialGTQ) || 0;
                            const exact70 = parseFloat((com * 0.7).toFixed(2));
                            const tc = parseFloat(formData.tipoCambio) || 7.62581;
                            setFormData(prev => ({
                              ...prev,
                              valorBancarioGTQ: exact70,
                              valorBancarioUSD: parseFloat((exact70 / tc).toFixed(2))
                            }));
                          }}
                          style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                        >
                          70% (Q. {(Number(formData.valorComercialGTQ || 0) * 0.7).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className="form-label" style={{ color: '#475569', margin: 0, fontSize: '0.85rem' }}>Tipo de Cambio Banguat:</label>
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          style={{ width: '100px', padding: '0.35rem 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}
                          value={formData.tipoCambio}
                          onChange={(e) => handleCalcUpdate('tipoCambio', null, e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label className="form-label" style={{ color: '#475569', margin: 0, fontSize: '0.85rem' }}>Ajustar Valor Bancario (Q):</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          style={{ width: '140px', padding: '0.35rem 0.5rem', fontSize: '0.85rem', fontWeight: 700 }}
                          value={formData.valorBancarioGTQ || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const tc = parseFloat(formData.tipoCambio) || 7.62581;
                            setFormData(prev => ({
                              ...prev,
                              valorBancarioGTQ: val,
                              valorBancarioUSD: parseFloat((val / tc).toFixed(2))
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                      ℹ️ El informe PDF genera automáticamente el cuadro bancario al 80% con 2 decimales exactos.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==============================================================
                PASO 5: FOTOGRAFÍAS (OPTIMIZADAS) Y CONSULTAS ELECTRÓNICAS RGP (PDFS)
                ============================================================== */}
            {activeStep === 5 && (
              <div>
                <div className="form-section-title">
                  <Camera size={16} />
                  <span>Álbum Fotográfico Oficial (Múltiples Fotos por Sección)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Puede cargar una o más fotografías por sección directamente desde su celular o galería. Se comprimen automáticamente para garantizar alta velocidad y documentos ligeros.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  {[
                    { key: 'entorno', label: '1. Entorno / Calle', desc: 'Vistas de la calle, accesos y entorno urbano' },
                    { key: 'ingreso', label: '2. Ingreso / Fachada', desc: 'Fachada principal, portones y accesos peatonales o vehiculares' },
                    { key: 'interior', label: '3. Interior Inmueble', desc: 'Ambientes interiores: sala, comedor, cocina, dormitorios, baños' },
                    { key: 'ubicacion', label: '4. Ubicación Satelital', desc: 'Vista aérea o satelital con delimitación del polígono' },
                    { key: 'croquis', label: '5. Croquis / Plano Catastral', desc: 'Croquis de localización, polígono registral o plano' },
                    { key: 'dicabi', label: '6. Matrícula DICABI', desc: 'Boleta oficial o constancia de matrícula catastral DICABI' }
                  ].map(({ key, label, desc }) => {
                    const photoList = Array.isArray(formData.fotos?.[key])
                      ? formData.fotos[key]
                      : (formData.fotos?.[key] ? [formData.fotos[key]] : []);

                    return (
                      <div key={key} style={{ background: '#ffffff', borderRadius: '8px', border: '1.5px solid #cbd5e1', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0d2847', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{label}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: photoList.length > 0 ? '#e0f2fe' : '#f1f5f9', color: photoList.length > 0 ? '#0369a1' : '#64748b' }}>
                                {photoList.length} {photoList.length === 1 ? 'foto' : 'fotos'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              {desc}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {key === 'ubicacion' && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.coordenadas || formData.direccion || 'Guatemala')}&t=k`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.75rem', color: '#0284c7', background: '#f0f9ff', padding: '0.35rem 0.65rem', borderRadius: '4px', textDecoration: 'none', border: '1px solid #bae6fd', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Abrir Google Maps en modo satélite para capturar la imagen"
                              >
                                🗺️ Abrir Google Maps (Satélite)
                              </a>
                            )}
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', background: '#2563eb', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer' }}>
                              <Plus size={15} />
                              <span>Agregar Foto(s)</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => handlePhotoUpload(key, e)}
                                style={{ display: 'none' }}
                              />
                            </label>
                          </div>
                        </div>

                        {photoList.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.85rem' }}>
                            {photoList.map((photoUrl, pIdx) => (
                              <div 
                                key={pIdx} 
                                style={{ 
                                  position: 'relative', 
                                  borderRadius: '6px', 
                                  overflow: 'hidden', 
                                  border: '1.5px solid #0d2847', 
                                  height: '140px',
                                  background: '#f8fafc' 
                                }}
                              >
                                <img 
                                  src={photoUrl} 
                                  alt={`${label} ${pIdx + 1}`} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                                />
                                <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(13, 40, 71, 0.85)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                  #{pIdx + 1}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(key, pIdx)}
                                  title="Eliminar esta foto"
                                  style={{ 
                                    position: 'absolute', 
                                    top: '6px', 
                                    right: '6px', 
                                    background: '#ef4444', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    borderRadius: '50%', 
                                    width: '26px', 
                                    height: '26px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }}>
                            <Camera size={28} style={{ color: '#94a3b8', marginBottom: '6px' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sin fotos en esta sección</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Haga clic para tomar o seleccionar una o más imágenes</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handlePhotoUpload(key, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Consultas Electrónicas RGP (PDFs o Imágenes Adjuntos) */}
                <div className="form-section-title" style={{ marginTop: '2rem' }}>
                  <FileUp size={16} />
                  <span>Consultas Electrónicas del Registro de la Propiedad (PDFs o Imágenes)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Adjunte las certificaciones o consultas electrónicas descargadas del Registro General de la Propiedad (RGP). Cada página se procesa para mostrarse visualmente en el reporte oficial PDF.
                </p>

                {isProcessingPdf && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0.85rem', background: '#eff6ff', borderRadius: '8px', border: '1.5px solid #93c5fd', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>{pdfProcessStatus || 'Procesando páginas de certificación a alta resolución...'}</span>
                  </div>
                )}

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px dashed #cbd5e1', textAlign: 'center', marginBottom: '1rem' }}>
                  <label style={{ cursor: isProcessingPdf ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', background: isProcessingPdf ? '#94a3b8' : '#0d2847', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, transition: 'background 0.2s' }}>
                    <FileUp size={16} />
                    <span>{isProcessingPdf ? 'Procesando Documentos...' : 'Seleccionar Certificaciones (PDF o Imagen)'}</span>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      multiple
                      disabled={isProcessingPdf}
                      onChange={handlePdfUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Soporta archivos PDF multipágina e imágenes escaneadas (JPG, PNG). Puede seleccionar varios a la vez.
                  </div>
                </div>

                {/* Lista de Documentos RGP Cargados con Vista Previa de Páginas */}
                {formData.consultasPdfs && formData.consultasPdfs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {formData.consultasPdfs.map((pdf, idx) => (
                      <div
                        key={pdf.id || idx}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.85rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} style={{ color: '#ef4444' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{pdf.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Tamaño: {pdf.size} • Adjuntado el {pdf.fecha}
                                {pdf.pages && pdf.pages.length > 0 && (
                                  <span style={{ marginLeft: '8px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                    {pdf.pages.length} {pdf.pages.length === 1 ? 'página' : 'páginas'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Está seguro de eliminar el documento "${pdf.name}"?`)) {
                                handleRemovePdf(idx);
                              }
                            }}
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1.5px solid #fca5a5',
                              padding: '0.4rem 0.85rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            title="Eliminar certificación completa"
                          >
                            <Trash2 size={15} />
                            <span>Eliminar Documento</span>
                          </button>
                        </div>

                        {/* Mosaico de páginas individuales con botón de eliminación por página */}
                        {pdf.pages && pdf.pages.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem', marginTop: '0.5rem', background: '#f8fafc', padding: '0.6rem', borderRadius: '6px' }}>
                            {pdf.pages.map((p, pIdx) => (
                              <div key={pIdx} style={{ position: 'relative', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`¿Desea eliminar la página ${p.pageIndex || pIdx + 1} de este documento?`)) {
                                      handleRemovePdfPage(idx, pIdx);
                                    }
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    background: 'rgba(239, 68, 68, 0.95)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    zIndex: 2
                                  }}
                                  title="Eliminar solo esta página"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <div style={{ height: '140px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  <img 
                                    src={p.dataUrl} 
                                    alt={`Página ${p.pageIndex || pIdx + 1}`} 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                  />
                                </div>
                                <div style={{ padding: '3px 6px', background: '#e2e8f0', fontSize: '0.68rem', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                                  Pág. {p.pageIndex || pIdx + 1} de {p.totalPaginas || pdf.pages.length}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : pdf.dataUrl && pdf.dataUrl.startsWith('data:image/') ? (
                          <div style={{ maxWidth: '140px', marginTop: '0.5rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ height: '140px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={pdf.dataUrl} alt={pdf.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ padding: '3px 6px', background: '#e2e8f0', fontSize: '0.68rem', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                              Pág. 1 de 1
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.82rem', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #e2e8f0' }}>
                    No hay documentos PDF o certificaciones adjuntas actualmente.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveStep(prev => prev - 1)}
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                >
                  ← Anterior
                </button>
              )}
              {activeStep < 5 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', borderColor: '#3b82f6' }}
                >
                  Siguiente ({activeStep + 1}/5) →
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #1b497d 0%, #2563eb 100%)',
                padding: '0.55rem 1.25rem',
                fontSize: '0.88rem',
                marginLeft: 'auto'
              }}
            >
              <Save size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {isEditing ? 'Guardar Cambios' : 'Guardar Avalúo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
