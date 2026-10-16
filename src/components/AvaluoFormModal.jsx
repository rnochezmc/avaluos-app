import React, { useState } from 'react';
import { X, Save, MapPin, Camera, Building, DollarSign, FileText, Plus, Trash2, Crosshair } from 'lucide-react';

export default function AvaluoFormModal({ avaluo, onClose, onSave }) {
  const isEditing = Boolean(avaluo?.id);

  const [activeStep, setActiveStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);

  // Form State initialized with defaults or editing values
  const [formData, setFormData] = useState({
    id: avaluo?.id || `lr-2026-${Date.now().toString().slice(-4)}`,
    codigo: avaluo?.codigo || `LR-2026-00${Math.floor(Math.random() * 90) + 10}`,
    tipoAvaluo: avaluo?.tipoAvaluo || 'Comercial',
    solicitante: avaluo?.solicitante || 'BANCO G&T CONTINENTAL',
    fechaSolicitud: avaluo?.fechaSolicitud || new Date().toISOString().slice(0, 10),
    fechaActualizacion: avaluo?.fechaActualizacion || new Date().toISOString().slice(0, 10),
    direccion: avaluo?.direccion || '',
    coordenadas: avaluo?.coordenadas || '',
    descripcionGeneral: avaluo?.descripcionGeneral || '',
    dpi: avaluo?.dpi || '',
    referenciaActualizacion: avaluo?.referenciaActualizacion || 'Inspección física y certificación de valor',
    estado: avaluo?.estado || 'proceso',

    // Registral
    propietarioPrincipal: avaluo?.propietarioPrincipal || '',
    fincas: avaluo?.fincas || [
      { finca: '', folio: '', libro: '', propietario: '' }
    ],
    areaRegistrada: avaluo?.areaRegistrada || 0,
    areaDesmembrada: avaluo?.areaDesmembrada || 0,
    areaActualRegistrada: avaluo?.areaActualRegistrada || 0,
    areaFisica: avaluo?.areaFisica || 0,
    areaValuada: avaluo?.areaValuada || 0,

    limitaciones: avaluo?.limitaciones || '',
    gravamenes: avaluo?.gravamenes || 'Libre de gravámenes vigentes',
    servidumbres: avaluo?.servidumbres || 'Sin servidumbres',
    areasComunes: avaluo?.areasComunes || 'No aplica',
    desmembracion: avaluo?.desmembracion || 'No',

    // DICABI & Terreno
    dicabiNombre: avaluo?.dicabiNombre || '',
    dicabiDireccion: avaluo?.dicabiDireccion || '',
    dicabiMatricula: avaluo?.dicabiMatricula || '',
    dicabiArea: avaluo?.dicabiArea || '',
    sector: avaluo?.sector || 'Urbano',
    usoSuelo: avaluo?.usoSuelo || 'Comercial',
    nivelSocioeconomico: avaluo?.nivelSocioeconomico || 'Medio-Alto',
    formaTerreno: avaluo?.formaTerreno || 'Regular',
    pendiente: avaluo?.pendiente || 'Plana',
    esquina: avaluo?.esquina || 'No',
    accesoCalle: avaluo?.accesoCalle || 'Calle asfaltada',
    colindancias: avaluo?.colindancias || {
      norte: '',
      sur: '',
      este: '',
      oeste: ''
    },

    // Servicios
    servicios: avaluo?.servicios || {
      drenajeNegras: 'Red municipal',
      drenajePluviales: 'Red pluvial',
      pavimentos: 'Asfalto',
      bordillos: 'Concreto',
      aceras: 'Concreto',
      agua: 'Red municipal',
      telefono: 'Sí',
      internetCable: 'Fibra óptica',
      energia: 'EEGSA 120/240V',
      garita: 'No',
      camaras: 'No',
      alumbradoPublico: 'Sí',
      tipoCalle: 'Urbana'
    },

    // Construcción
    construccion: avaluo?.construccion || {
      edadAprox: '5 años',
      estadoActual: 'Bueno',
      apropiadaSector: 'Sí',
      distribucion: '',
      estructura: 'Concreto armado y mampostería',
      paredes: 'Block pómez con repello y cernido',
      techoEntrePiso: 'Losa de concreto',
      piso: 'Cerámico',
      puertas: 'Madera y metal',
      ventanas: 'Aluminio y vidrio',
      sanitaria: 'Artefactos estándar',
      electrica: 'Instalación empotrada',
      factoresPositivos: 'Ubicación y estado de conservación',
      factoresNegativos: 'Ninguno de gravedad'
    },

    // Cálculos
    desgloseTerreno: avaluo?.desgloseTerreno || { area: 0, unidad: 'm²', valorUnitario: 0, total: 0 },
    desgloseConstruccion: avaluo?.desgloseConstruccion || { area: 0, unidad: 'm²', valorUnitario: 0, total: 0 },
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

    // Fotos
    fotos: avaluo?.fotos || {
      entorno: '',
      ingreso: '',
      interior: '',
      ubicacion: '',
      croquis: '',
      dicabi: ''
    }
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

  // Dynamic calculations for values and currency exchange
  const handleCalcUpdate = (field, subfield, value) => {
    const num = parseFloat(value) || 0;
    
    setFormData(prev => {
      const next = { ...prev };
      if (field === 'desgloseTerreno') {
        next.desgloseTerreno = { ...next.desgloseTerreno, [subfield]: num };
        next.desgloseTerreno.total = next.desgloseTerreno.area * next.desgloseTerreno.valorUnitario;
      } else if (field === 'desgloseConstruccion') {
        next.desgloseConstruccion = { ...next.desgloseConstruccion, [subfield]: num };
        next.desgloseConstruccion.total = next.desgloseConstruccion.area * next.desgloseConstruccion.valorUnitario;
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

  // Add / Remove Fincas
  const addFinca = () => {
    setFormData(prev => ({
      ...prev,
      fincas: [...prev.fincas, { finca: '', folio: '', libro: '', propietario: '' }]
    }));
  };

  const removeFinca = (index) => {
    setFormData(prev => ({
      ...prev,
      fincas: prev.fincas.filter((_, i) => i !== index)
    }));
  };

  const updateFinca = (index, field, value) => {
    setFormData(prev => {
      const newFincas = [...prev.fincas];
      newFincas[index] = { ...newFincas[index], [field]: value };
      return { ...prev, fincas: newFincas };
    });
  };

  // Handle Photo File Upload (supports mobile camera with auto-compression for localStorage)
  const handlePhotoUpload = (category, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar automáticamente fotos pesadas de celulares a máx 1280px
        const maxDim = 1280;
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

        // Convertir a JPEG optimizado (calidad 0.75) para ocupar ~150KB en vez de 6MB
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

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
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Evitar que el teclado virtual del celular cierre y guarde el formulario al presionar Enter/Intro en un input
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Form Header */}
          <div className="modal-header">
            <div className="modal-header-left">
              <div className="brand-logo-icon" style={{ width: 34, height: 34 }}>
                <Building size={20} />
              </div>
              <div>
                <h2>{isEditing ? `Editar Avalúo ${formData.codigo}` : 'Nuevo Registro de Avalúo'}</h2>
                <div className="modal-header-sub">
                  Paso {activeStep} de 5 — Complete o actualice el expediente
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: 'var(--cverde-accent)' }}
              >
                <Save size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Guardar
              </button>
              <button type="button" className="modal-close-btn" onClick={onClose} title="Cerrar sin guardar">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Step Indicator Tabs */}
          <div style={{ padding: '0 1.5rem', backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
            <div className="modal-tabs" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 1 ? 'active' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <span>1. Solicitud</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 2 ? 'active' : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <span>2. Registral</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 3 ? 'active' : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <span>3. Terreno & Servicios</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 4 ? 'active' : ''}`}
                onClick={() => setActiveStep(4)}
              >
                <span>4. Valores & Cálculos</span>
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeStep === 5 ? 'active' : ''}`}
                onClick={() => setActiveStep(5)}
              >
                <span>5. Fotografías</span>
              </button>
            </div>
          </div>

          {/* Form Body Steps */}
          <div className="modal-body">
            {/* STEP 1: SOLICITUD E IDENTIFICACIÓN */}
            {activeStep === 1 && (
              <div>
                <div className="form-section-title">
                  <FileText size={16} />
                  <span>Identificación y Datos del Solicitante</span>
                </div>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Código de Avalúo *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="LR-2026-001"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Entidad Solicitante *</label>
                    <select
                      className="form-select"
                      value={formData.solicitante}
                      onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                    >
                      <option value="BANCO G&T CONTINENTAL">BANCO G&T CONTINENTAL</option>
                      <option value="BANCO INDUSTRIAL">BANCO INDUSTRIAL</option>
                      <option value="BANCO AGROMERCANTIL (BAM)">BANCO AGROMERCANTIL (BAM)</option>
                      <option value="BANRURAL">BANRURAL</option>
                      <option value="BAC CREDOMATIC">BAC CREDOMATIC</option>
                      <option value="PARTICULAR / INDEPENDIENTE">PARTICULAR / INDEPENDIENTE</option>
                    </select>
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
                      <option value="Finca / Terreno">Finca / Terreno</option>
                    </select>
                  </div>
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
                    <label className="form-label">Fecha de Actualización</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fechaActualizacion}
                      onChange={(e) => setFormData({ ...formData, fechaActualizacion: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Estado del Expediente</label>
                    <select
                      className="form-select"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    >
                      <option value="borrador">Borrador</option>
                      <option value="proceso">En Proceso</option>
                      <option value="completado">Completado</option>
                    </select>
                  </div>
                </div>

                <div className="form-field" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Dirección Completa del Inmueble *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej. 15 Avenida 4-32 Zona 10, Ciudad de Guatemala"
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginTop: '1rem' }}>
                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">Ubicación según Coordenadas GPS</label>
                      <button
                        type="button"
                        onClick={captureGPS}
                        disabled={isLocating}
                        style={{ fontSize: '0.72rem', color: 'var(--cverde-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Crosshair size={13} />
                        {isLocating ? 'Obteniendo GPS...' : 'Usar mi GPS actual'}
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.coordenadas}
                      onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                      placeholder="14.59821, -90.51423"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">DPI del Solicitante / Propietario</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dpi}
                      onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                      placeholder="1892 45871 0101"
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Descripción General del Inmueble</label>
                  <textarea
                    className="form-textarea"
                    value={formData.descripcionGeneral}
                    onChange={(e) => setFormData({ ...formData, descripcionGeneral: e.target.value })}
                    placeholder="Breve reseña del estado físico y destino del bien..."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: INFORMACIÓN REGISTRAL */}
            {activeStep === 2 && (
              <div>
                <div className="form-section-title">
                  <FileText size={16} />
                  <span>Fincas Registradas (Registro General de la Propiedad)</span>
                  <button
                    type="button"
                    onClick={addFinca}
                    className="card-action-btn"
                    style={{ marginLeft: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: 'var(--cverde-primary)' }}
                  >
                    <Plus size={13} /> Agregar Finca
                  </button>
                </div>

                {formData.fincas.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', alignItems: 'center', background: 'var(--slate-50)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Finca"
                        value={f.finca}
                        onChange={(e) => updateFinca(idx, 'finca', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Folio"
                        value={f.folio}
                        onChange={(e) => updateFinca(idx, 'folio', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Libro (ej. 85E de Guatemala)"
                        value={f.libro}
                        onChange={(e) => updateFinca(idx, 'libro', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Propietario Registral"
                        value={f.propietario}
                        onChange={(e) => updateFinca(idx, 'propietario', e.target.value)}
                      />
                    </div>
                    {formData.fincas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFinca(idx)}
                        style={{ color: 'var(--status-danger)', padding: '0.4rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <div className="form-field" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Nombre del Propietario Principal / Representante</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.propietarioPrincipal}
                    onChange={(e) => setFormData({ ...formData, propietarioPrincipal: e.target.value })}
                    placeholder="Ej. Inmobiliaria Las Cumbres S.A."
                  />
                </div>

                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                  <span>Áreas del Inmueble (m²)</span>
                </div>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Área Registrada (m²)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.areaRegistrada}
                      onChange={(e) => setFormData({ ...formData, areaRegistrada: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Área Física (m²)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.areaFisica}
                      onChange={(e) => setFormData({ ...formData, areaFisica: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Área Valuada / Sujeta a Garantía (m²)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      style={{ fontWeight: 700, borderColor: 'var(--cverde-accent)' }}
                      value={formData.areaValuada}
                      onChange={(e) => setFormData({ ...formData, areaValuada: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                  <span>Limitaciones y Gravámenes</span>
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Anotaciones y Gravámenes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.gravamenes}
                      onChange={(e) => setFormData({ ...formData, gravamenes: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Servidumbres</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.servidumbres}
                      onChange={(e) => setFormData({ ...formData, servidumbres: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TERRENO, DICABI Y SERVICIOS */}
            {activeStep === 3 && (
              <div>
                <div className="form-section-title">
                  <MapPin size={16} />
                  <span>Datos DICABI y Características del Terreno</span>
                </div>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Matrícula DICABI</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.dicabiMatricula}
                      onChange={(e) => setFormData({ ...formData, dicabiMatricula: e.target.value })}
                      placeholder="01-10-8452-9"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Sector</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Uso de Suelo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.usoSuelo}
                      onChange={(e) => setFormData({ ...formData, usoSuelo: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Forma</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.formaTerreno}
                      onChange={(e) => setFormData({ ...formData, formaTerreno: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Topografía / Pendiente</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pendiente}
                      onChange={(e) => setFormData({ ...formData, pendiente: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Esquina</label>
                    <select
                      className="form-select"
                      value={formData.esquina}
                      onChange={(e) => setFormData({ ...formData, esquina: e.target.value })}
                    >
                      <option value="No">No</option>
                      <option value="Sí">Sí</option>
                    </select>
                  </div>
                </div>

                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
                  <span>Servicios Públicos e Infraestructura</span>
                </div>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Agua Potable</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.servicios.agua}
                      onChange={(e) => setFormData({ ...formData, servicios: { ...formData.servicios, agua: e.target.value } })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Energía Eléctrica</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.servicios.energia}
                      onChange={(e) => setFormData({ ...formData, servicios: { ...formData.servicios, energia: e.target.value } })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Drenajes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.servicios.drenajeNegras}
                      onChange={(e) => setFormData({ ...formData, servicios: { ...formData.servicios, drenajeNegras: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONSTRUCCIÓN Y VALORES */}
            {activeStep === 4 && (
              <div>
                <div className="form-section-title">
                  <DollarSign size={16} />
                  <span>Desglose Matemático de Valoración</span>
                </div>

                {/* Terreno Desglose */}
                <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--cverde-primary)' }}>
                    VALORACIÓN DEL TERRENO
                  </div>
                  <div className="form-grid-3">
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
                      <label className="form-label">Valor Unitario (Q / m²)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={formData.desgloseTerreno.valorUnitario}
                        onChange={(e) => handleCalcUpdate('desgloseTerreno', 'valorUnitario', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Subtotal Terreno (Q)</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontWeight: 700 }}
                        value={'Q. ' + Number(formData.desgloseTerreno.total || 0).toLocaleString('es-GT')}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Construcción Desglose */}
                <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--cverde-primary)' }}>
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
                        value={'Q. ' + Number(formData.desgloseConstruccion.total || 0).toLocaleString('es-GT')}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Totales y Moneda Extranjera */}
                <div className="form-grid-3" style={{ background: 'var(--cverde-light-bg)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--cverde-accent)' }}>
                  <div className="form-field">
                    <label className="form-label" style={{ color: 'var(--cverde-primary)' }}>Tipo de Cambio Banguat</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.tipoCambio}
                      onChange={(e) => handleCalcUpdate('tipoCambio', null, e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ color: 'var(--cverde-primary)' }}>Valor Comercial Total (Q)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cverde-primary)' }}>
                      Q. {Number(formData.valorComercialGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label" style={{ color: 'var(--cverde-primary)' }}>Valor en Dólares (USD)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-700)' }}>
                      $ {Number(formData.valorComercialUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: FOTOGRAFÍAS */}
            {activeStep === 5 && (
              <div>
                <div className="form-section-title">
                  <Camera size={16} />
                  <span>Álbum Fotográfico (Captura desde Celular o Archivo)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1rem' }}>
                  Presione en cada recuadro para tomar la fotografía directamente con la cámara de su móvil o seleccionar del carrete.
                </p>

                <div className="photos-grid">
                  {[
                    { key: 'entorno', label: '1. Entorno / Calle' },
                    { key: 'ingreso', label: '2. Ingreso / Fachada' },
                    { key: 'interior', label: '3. Interior Inmueble' },
                    { key: 'ubicacion', label: '4. Ubicación Satelital' },
                    { key: 'croquis', label: '5. Croquis / Plano' },
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
                            <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)' }}>Cargar / Tomar Foto</span>
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
              </div>
            )}
          </div>

          {/* Form Footer with Step Navigation */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveStep(prev => prev - 1)}
                  style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                >
                  ← Anterior
                </button>
              )}
              {activeStep < 5 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--cverde-primary)', borderColor: 'var(--cverde-accent)' }}
                >
                  Siguiente ({activeStep + 1}/5) →
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '0.6rem 1.25rem',
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
