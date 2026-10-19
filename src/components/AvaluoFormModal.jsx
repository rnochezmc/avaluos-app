import React, { useState } from 'react';
import { 
  X, Save, MapPin, Camera, Building, DollarSign, FileText, Plus, 
  Trash2, Crosshair, FileUp, CheckSquare, Square, Check, AlertCircle 
} from 'lucide-react';

export default function AvaluoFormModal({ avaluo, onClose, onSave }) {
  const isEditing = Boolean(avaluo?.id);

  const [activeStep, setActiveStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState('');

  // Form State initialized with defaults or editing values
  const [formData, setFormData] = useState({
    id: avaluo?.id || `lr-2026-${Date.now().toString().slice(-4)}`,
    codigo: avaluo?.codigo || `LR-2026-0${Math.floor(Math.random() * 90) + 10}`,
    tipoAvaluo: avaluo?.tipoAvaluo || 'Comercial',
    solicitante: avaluo?.solicitante || 'BANCO G&T CONTINENTAL',
    fechaSolicitud: avaluo?.fechaSolicitud || new Date().toISOString().slice(0, 10),
    fechaInspeccion: avaluo?.fechaInspeccion || new Date().toISOString().slice(0, 10),
    fechaActualizacion: avaluo?.fechaActualizacion || new Date().toISOString().slice(0, 10),
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
    dicabiObservaciones: avaluo?.dicabiObservaciones || 'Datos cotejados con el padrón fiscal catastral.',

    // Terreno & Sector
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

    // Servicios e Infraestructura
    servicios: avaluo?.servicios || {
      drenajeNegras: 'Red municipal',
      drenajePluviales: 'Red pluvial',
      pavimentos: 'Asfalto en buen estado',
      bordillos: 'Concreto',
      aceras: 'Concreto 1.20m',
      agua: 'Red municipal',
      telefono: 'Sí',
      internetCable: 'Fibra óptica',
      energia: 'EEGSA / DEOCSA 120/240V',
      garita: 'No',
      camaras: 'No',
      alumbradoPublico: 'Sí',
      tipoCalle: 'Urbana'
    },
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
    desgloseTerreno: avaluo?.desgloseTerreno || { 
      area: 0, 
      unidad: 'm²', 
      valorUnitario: 0, 
      total: 0,
      fincaAsociada: '',
      varasCuadradas: 0
    },
    desgloseConstruccion: avaluo?.desgloseConstruccion || { 
      area: 0, 
      unidad: 'm²', 
      valorUnitario: 0, 
      total: 0 
    },
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

    // Fotos optimizadas
    fotos: avaluo?.fotos || {
      entorno: '',
      ingreso: '',
      interior: '',
      ubicacion: '',
      croquis: '',
      dicabi: ''
    },

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
        target.areaActualRegistrada = parseFloat(Math.max(0, orig - desm).toFixed(2));
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
      areaRegistrada: parseFloat(totOrig.toFixed(2)),
      areaDesmembrada: parseFloat(totDesm.toFixed(2)),
      areaActualRegistrada: parseFloat(totAct.toFixed(2)),
      areaFisica: parseFloat(totFis.toFixed(2)),
      areaValuada: parseFloat(totVal.toFixed(2))
    };

    // Auto actualizar área en terreno si está en 0
    if ((!next.desgloseTerreno.area || next.desgloseTerreno.area === 0) && totVal > 0) {
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

      // Recompute total commercial & bank values
      const totalComercial = (next.desgloseTerreno?.total || 0) + (next.desgloseConstruccion?.total || 0);
      next.valorComercialGTQ = totalComercial;
      next.valorBancarioGTQ = Math.round(totalComercial * 0.8); // 80% standard bank guarantee
      const tc = next.tipoCambio || 7.62581;
      next.valorComercialUSD = parseFloat((totalComercial / tc).toFixed(2));
      next.valorBancarioUSD = parseFloat((next.valorBancarioGTQ / tc).toFixed(2));

      return next;
    });
  };

  // Compresión fotográfica optimizada (evita bug de cuotas móviles y Firestore)
  const handlePhotoUpload = (category, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

        setFormData(prev => ({
          ...prev,
          fotos: {
            ...prev.fotos,
            [category]: compressedDataUrl
          }
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (category) => {
    setFormData(prev => ({
      ...prev,
      fotos: {
        ...prev.fotos,
        [category]: ''
      }
    }));
  };

  // Soporte para adjuntar múltiples archivos PDF de Consultas Electrónicas RGP
  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert(`El archivo ${file.name} no es un documento PDF.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const pdfData = {
          id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          fecha: new Date().toISOString().slice(0, 10),
          dataUrl: event.target.result
        };

        setFormData(prev => ({
          ...prev,
          consultasPdfs: [...(prev.consultasPdfs || []), pdfData]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePdf = (index) => {
    setFormData(prev => ({
      ...prev,
      consultasPdfs: prev.consultasPdfs.filter((_, i) => i !== index)
    }));
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
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Form Header */}
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)' }}>
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
          <div style={{ padding: '0 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
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
          <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
            
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
                      onChange={(e) => setFormData({ ...formData, tipoAvaluo: e.target.value })}
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Residencial">Residencial</option>
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
                    <label className="form-label">Fecha de Inspección Física (Observación Haroldo)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.fechaInspeccion}
                      onChange={(e) => setFormData({ ...formData, fechaInspeccion: e.target.value })}
                      placeholder="Ej: 17 de julio de 2026 y 23 de julio de 2026"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Fecha de Actualización / Emisión</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fechaActualizacion}
                      onChange={(e) => setFormData({ ...formData, fechaActualizacion: e.target.value })}
                    />
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
                    <label className="form-label">Matrícula Fiscal DICABI *</label>
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
                {/* Colindancias */}
                <div className="form-section-title">
                  <MapPin size={16} />
                  <span>Colindancias Registrales del Terreno (Norte, Sur, Este, Oeste)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Norte *</label>
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
                    <label className="form-label">Sur *</label>
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
                    <label className="form-label">Este *</label>
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
                    <label className="form-label">Oeste *</label>
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

                {/* Servicios con Checklist */}
                <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                  <CheckSquare size={16} />
                  <span>Servicios e Infraestructura Urbana (Checklist & Adicionales)</span>
                </div>

                <div className="form-grid-3">
                  {[
                    { key: 'agua', label: 'Servicio de Agua', defaultVal: 'Red municipal' },
                    { key: 'drenajeNegras', label: 'Drenaje Aguas Negras', defaultVal: 'Red municipal' },
                    { key: 'drenajePluviales', label: 'Drenaje Pluvial', defaultVal: 'Red pluvial' },
                    { key: 'energia', label: 'Energía Eléctrica', defaultVal: '120/240V' },
                    { key: 'alumbradoPublico', label: 'Alumbrado Público', defaultVal: 'Sí' },
                    { key: 'pavimentos', label: 'Pavimentos', defaultVal: 'Asfalto / Adoquín' },
                    { key: 'bordillos', label: 'Bordillos', defaultVal: 'Concreto' },
                    { key: 'aceras', label: 'Aceras', defaultVal: 'Concreto' },
                    { key: 'telefono', label: 'Telefonía', defaultVal: 'Sí' },
                    { key: 'internetCable', label: 'Internet y Cable', defaultVal: 'Fibra óptica' },
                    { key: 'garita', label: 'Garita de Seguridad', defaultVal: 'No' },
                    { key: 'camaras', label: 'Cámaras de Seguridad', defaultVal: 'No' },
                    { key: 'tipoCalle', label: 'Tipo de Calle', defaultVal: 'Urbana' }
                  ].map(srv => (
                    <div key={srv.key} className="form-field">
                      <label className="form-label">{srv.label}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.servicios?.[srv.key] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          servicios: { ...formData.servicios, [srv.key]: e.target.value }
                        })}
                        placeholder={srv.defaultVal}
                      />
                    </div>
                  ))}
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

                {/* Terreno con columna de Finca y Varas Cuadradas */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0d2847', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#0d2847', fontSize: '0.95rem' }}>
                      VALORACIÓN DEL TERRENO
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Factor Oficial: 1 m² = 1.43115 v²
                    </span>
                  </div>

                  <div className="form-grid-4">
                    <div className="form-field">
                      <label className="form-label">Finca(s) Asociada(s)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.desgloseTerreno.fincaAsociada || (formData.fincas.map(f => f.finca).filter(Boolean).join(', '))}
                        onChange={(e) => handleCalcUpdate('desgloseTerreno', 'fincaAsociada', e.target.value)}
                        placeholder="Ej: 5289 y 7172"
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Área Terreno (m²)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={formData.desgloseTerreno.area}
                        onChange={(e) => handleCalcUpdate('desgloseTerreno', 'area', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" style={{ color: '#1e40af', fontWeight: 700 }}>
                        Equivalente en Varas² (v²)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontWeight: 700, background: '#eff6ff', color: '#1e40af' }}
                        value={formData.desgloseTerreno.varasCuadradas || parseFloat(((formData.desgloseTerreno.area || 0) * 1.43115).toFixed(2))}
                        readOnly
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Valor Unitario (Q / m²)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={formData.desgloseTerreno.valorUnitario}
                        onChange={(e) => handleCalcUpdate('desgloseTerreno', 'valorUnitario', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#0d2847' }}>
                    Subtotal Terreno: Q. {Number(formData.desgloseTerreno.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Construcción */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#0d2847', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    VALORACIÓN DE CONSTRUCCIÓN
                  </div>

                  <div className="form-grid-3">
                    <div className="form-field">
                      <label className="form-label">Área Construida (m²)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={formData.desgloseConstruccion.area}
                        onChange={(e) => handleCalcUpdate('desgloseConstruccion', 'area', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Valor Unitario (Q / m²)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={formData.desgloseConstruccion.valorUnitario}
                        onChange={(e) => handleCalcUpdate('desgloseConstruccion', 'valorUnitario', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Subtotal Construcción (Q)</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontWeight: 700 }}
                        value={'Q. ' + Number(formData.desgloseConstruccion.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Totales y Moneda Extranjera */}
                <div className="form-grid-3" style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #2563eb' }}>
                  <div className="form-field">
                    <label className="form-label" style={{ color: '#0d2847' }}>Tipo de Cambio Banguat</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.tipoCambio}
                      onChange={(e) => handleCalcUpdate('tipoCambio', null, e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ color: '#0d2847' }}>Valor Comercial Total (Q)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d2847' }}>
                      Q. {Number(formData.valorComercialGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ color: '#0d2847' }}>Valor en Dólares (USD)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e40af' }}>
                      $ {Number(formData.valorComercialUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  <span>Álbum Fotográfico Oficial (Compresión Automática para PDF)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  Tome las fotos directamente con la cámara del celular o selecciónelas de su galería. Se procesan de forma optimizada para impresión y almacenamiento.
                </p>

                <div className="photos-grid">
                  {[
                    { key: 'entorno', label: '1. Entorno / Calle' },
                    { key: 'ingreso', label: '2. Ingreso / Fachada' },
                    { key: 'interior', label: '3. Interior Inmueble' },
                    { key: 'ubicacion', label: '4. Ubicación Satelital' },
                    { key: 'croquis', label: '5. Croquis / Plano Catastral' },
                    { key: 'dicabi', label: '6. Matrícula DICABI' }
                  ].map(({ key, label }) => {
                    const hasPhoto = Boolean(formData.fotos[key]);
                    return (
                      <div key={key} className={`photo-slot-card ${hasPhoto ? 'has-photo' : ''}`}>
                        {hasPhoto ? (
                          <>
                            <img src={formData.fotos[key]} alt={label} className="photo-slot-img" />
                            <div className="photo-slot-footer">
                              <span className="photo-slot-category">{label}</span>
                              <button
                                type="button"
                                className="btn-remove-photo"
                                onClick={() => handleRemovePhoto(key)}
                                title="Eliminar Foto"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="btn-upload-photo-label">
                            <Camera size={26} />
                            <span>{label}</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Cargar / Tomar Foto</span>
                            <input
                              type="file"
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

                {/* Consultas Electrónicas RGP (PDFs Adjuntos) */}
                <div className="form-section-title" style={{ marginTop: '2rem' }}>
                  <FileUp size={16} />
                  <span>Consultas Electrónicas del Registro de la Propiedad (Carga de uno o más PDFs)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Adjunte las certificaciones o consultas electrónicas en PDF descargadas del Registro General de la Propiedad (RGP).
                </p>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px dashed #cbd5e1', textAlign: 'center', marginBottom: '1rem' }}>
                  <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0d2847', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <FileUp size={16} />
                    <span>Seleccionar Archivos PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={handlePdfUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Puede seleccionar uno o varios archivos PDF a la vez.
                  </div>
                </div>

                {/* Lista de PDFs Cargados */}
                {formData.consultasPdfs && formData.consultasPdfs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.consultasPdfs.map((pdf, idx) => (
                      <div
                        key={pdf.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 1rem',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={18} style={{ color: '#ef4444' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{pdf.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tamaño: {pdf.size} • Adjuntado el {pdf.fecha}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(idx)}
                          style={{ color: '#ef4444', padding: '4px' }}
                          title="Eliminar PDF"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No hay documentos PDF adjuntos actualmente.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
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
