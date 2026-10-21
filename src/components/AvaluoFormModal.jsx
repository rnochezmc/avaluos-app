import React, { useState } from 'react';
import { 
  X, Save, MapPin, Camera, Building, DollarSign, FileText, Plus, 
  Trash2, Crosshair, FileUp, CheckSquare, Square, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { SERVICIOS_INFRAESTRUCTURA_LIST, getDefaultServicios } from '../data/serviciosConstants';
import { convertPdfOrImageToPageImages } from '../utils/pdfHelper';

export default function AvaluoFormModal({ avaluo, onClose, onSave }) {
  const isEditing = Boolean(avaluo?.id);

  const [activeStep, setActiveStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState('');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfProcessStatus, setPdfProcessStatus] = useState('');

  // Form State initialized with defaults or editing values
  const [formData, setFormData] = useState({
    id: avaluo?.id || `lr-2026-${Date.now().toString().slice(-4)}`,
    codigo: avaluo?.codigo || `LR-2026-0${Math.floor(Math.random() * 90) + 10}`,
    tipoAvaluo: avaluo?.tipoAvaluo || 'Comercial',
    solicitante: avaluo?.solicitante || 'BANCO G&T CONTINENTAL',
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
    propietarioPrincipal: avaluo?.propietarioPrincipal || '',
    fincas: avaluo?.fincas && avaluo.fincas.length > 0 ? avaluo.fincas : [
      { 
        finca: '', 
        folio: '', 
        libro: '', 
        propietario: '',
        areaRegistrada: 0,
        areaDesmembrada: 0,
        areaActualRegistrada: 0,
        areaFisica: 0,
        areaValuada: 0
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
      oeste: ''
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

    // Valuadores
    valuadorPrincipal: avaluo?.valuadorPrincipal || 'Lic. Aroldo Oliverio Ruiz Orozco',
    registroPrincipal: avaluo?.registroPrincipal || 'Valuador autorizado 2572-R-2026',
    valuadorRevisor: avaluo?.valuadorRevisor || 'Lic. Luis Felipe Tolaque Tobias',
    registroRevisor: avaluo?.registroRevisor || 'Valuador autorizado 193-T-93',

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
          areaValuada: 0
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
      return recalcularTotalesFincas({ ...prev, fincas: newFincas });
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

  // Dynamic calculations for values, conversion to Varas Cuadradas and currency exchange
  const handleCalcUpdate = (field, subfield, value) => {
    const num = parseFloat(value) || 0;
    
    setFormData(prev => {
      const next = { ...prev };
      if (field === 'desgloseTerreno') {
        const currentTerreno = { ...next.desgloseTerreno };
        if (subfield === 'area') {
          currentTerreno.area = num;
          // Fórmula oficial de Haroldo: Varas Cuadradas = Área m² * 1.43115
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
      next.valorBancarioGTQ = Math.round(totalComercial * 0.8); // 80% standard bank guarantee
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
    const valBancario = Math.round(totalComercial * 0.8);

    return {
      ...prev,
      desgloseConstruccion: nextDesglose,
      valorComercialGTQ: totalComercial,
      valorBancarioGTQ: valBancario,
      valorComercialUSD: parseFloat((totalComercial / tc).toFixed(2)),
      valorBancarioUSD: parseFloat((valBancario / tc).toFixed(2))
    };
  };

  // Botón y toggle oficial de Haroldo para habilitar o deshabilitar terreno (Régimen PH / Apartamentos)
  const handleToggleAplicaTerreno = (applies) => {
    setFormData(prev => {
      const next = { ...prev, aplicaTerreno: applies };
      const terrenoTotal = applies ? (parseFloat(next.desgloseTerreno?.total) || 0) : 0;
      const totalComercial = parseFloat((terrenoTotal + (next.desgloseConstruccion?.total || 0)).toFixed(2));
      next.valorComercialGTQ = totalComercial;
      next.valorBancarioGTQ = Math.round(totalComercial * 0.8);
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
      const valBancario = Math.round(totalComercial * 0.8);

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
      const valBancario = Math.round(totalComercial * 0.8);

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
      const valBancario = Math.round(totalComercial * 0.8);

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
  // Regla de Haroldo: Fecha de Inspección o Fecha de Actualización (mutuamente excluyentes)
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
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)', flexShrink: 0 }}>
            <div className="modal-header-left">
              <div style={{ background: '#ffffff', borderRadius: '6px', padding: '3px 5px', display: 'flex', alignItems: 'center' }}>
                <img src="/lex-rosam-logo.png" alt="Lex Rosam" style={{ height: '28px', width: 'auto' }} />
              </div>
              <div>
                <h2 style={{ color: '#ffffff' }}>{isEditing ? `Editar Avalúo ${formData.codigo}` : 'Nuevo Expediente de Avalúo'}</h2>
                <div className="modal-header-sub" style={{ color: '#cbd5e1' }}>
                  Paso {activeStep} de 5 — Formato Oficial LEX ROSAM S.A.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: '#2563eb' }}
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
                <span>4. Valores & Terreno</span>
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

                <div className="form-grid-2">
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

                {/* Aspectos Legales con Textos Amplios */}
                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                  <FileText size={16} />
                  <span>Aspectos Legales (Permite Detalle y Textos Largos)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Limitaciones o Servidumbres</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.limitaciones}
                      onChange={(e) => setFormData({ ...formData, limitaciones: e.target.value })}
                      placeholder="Describa servidumbres de paso, acueducto, vista o limitaciones inscritas..."
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Anotaciones Registrales</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.anotaciones}
                      onChange={(e) => setFormData({ ...formData, anotaciones: e.target.value })}
                      placeholder="Anotaciones de demanda, embargos o ninguna vigente..."
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Gravámenes e Hipotecas</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.gravamenes}
                      onChange={(e) => setFormData({ ...formData, gravamenes: e.target.value })}
                      placeholder="Hipotecas a favor de bancos o entidades, montos y fechas..."
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Detalle de Desmembraciones / Áreas Comunes</label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={formData.desmembracion}
                      onChange={(e) => setFormData({ ...formData, desmembracion: e.target.value })}
                      placeholder="Detalle de fracciones desmembradas o áreas comunes del inmueble..."
                    />
                  </div>
                </div>

                {/* DICABI Independiente del RGP */}
                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                  <Building size={16} />
                  <span>Dirección de Catastro y Avalúo de Bienes Inmuebles (DICABI) — Datos Independientes</span>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Matrícula Fiscal DICABI</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dicabiMatricula}
                      onChange={(e) => setFormData({ ...formData, dicabiMatricula: e.target.value })}
                      placeholder="Ej: 04-03-1258-1"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Nombre del Titular Catastral</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dicabiNombre}
                      onChange={(e) => setFormData({ ...formData, dicabiNombre: e.target.value })}
                      placeholder="Nombre según padrón fiscal DICABI"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Área Catastral Registrada</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dicabiArea}
                      onChange={(e) => setFormData({ ...formData, dicabiArea: e.target.value })}
                      placeholder="Ej: 199.08 m²"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Dirección según DICABI / IUSI</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dicabiDireccion}
                      onChange={(e) => setFormData({ ...formData, dicabiDireccion: e.target.value })}
                      placeholder="Dirección catastral municipal"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Observaciones Catastrales DICABI</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dicabiObservaciones}
                      onChange={(e) => setFormData({ ...formData, dicabiObservaciones: e.target.value })}
                      placeholder="Datos cotejados con el padrón fiscal catastral."
                    />
                  </div>
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
                    <div className="form-section-title">
                      <MapPin size={16} />
                      <span>Colindancias Registrales del Terreno (Norte, Sur, Este, Oeste)</span>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label className="form-label">Norte</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.colindancias?.norte || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            colindancias: { ...formData.colindancias, norte: e.target.value }
                          })}
                          placeholder="Ej: 18.50 m con calle pública municipal"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Sur</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.colindancias?.sur || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            colindancias: { ...formData.colindancias, sur: e.target.value }
                          })}
                          placeholder="Ej: 18.50 m con Finca 5288"
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label className="form-label">Este</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.colindancias?.este || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            colindancias: { ...formData.colindancias, este: e.target.value }
                          })}
                          placeholder="Ej: 10.76 m con propiedad privada particular"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Oeste</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.colindancias?.oeste || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            colindancias: { ...formData.colindancias, oeste: e.target.value }
                          })}
                          placeholder="Ej: 10.76 m con lote colindante"
                        />
                      </div>
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

                    {/* Tarjeta Bancaria 80% - Regla Oficial Haroldo */}
                    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '6px', border: '1.5px solid #2563eb' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                        2. SUMA TOTAL VALOR BANCARIO (80% MÁXIMO)
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
                        Q. {Number(formData.valorBancarioGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                        $ {Number(formData.valorBancarioUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
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
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                      ℹ️ El informe PDF genera automáticamente el cuadro bancario al 80% (unitario y subtotal) para garantía bancaria.
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
