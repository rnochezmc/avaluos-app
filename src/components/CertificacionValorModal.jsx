import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Award, Printer, Save, Plus, Trash2, RefreshCw, FileText, 
  Building, Calendar, DollarSign, Check, AlertCircle, FileUp, Paperclip 
} from 'lucide-react';
import { formatFechaEnLetras, convertPdfOrImageToPageImages } from '../utils/pdfHelper';

export const TIPOS_SOLICITUD = [
  'CERTIFICACIÓN DE VALOR'
];

export const PRESET_BANCOS = [
  'BANCO G&T CONTINENTAL, S.A.',
  'BANCO INDUSTRIAL, S.A.',
  'BANCO DE DESARROLLO RURAL, S.A. (BANRURAL)',
  'COOPERATIVA DE AHORRO Y CRÉDITO INTEGRAL GUADALUPANA, R.L.',
  'BANCO AGROMERCANTIL DE GUATEMALA, S.A. (BAM)',
  'BANCO DE AMÉRICA CENTRAL, S.A. (BAC CREDOMATIC)',
  'BANCO PROMERICA, S.A.',
  'BANCO DE LOS TRABAJADORES (BANTRAB)',
  'CRÉDITO HIPOTECARIO NACIONAL (CHN)',
  'BANCO INMOBILIARIO, S.A.',
  'VIVIBANCO, S.A.'
];

export default function CertificacionValorModal({ 
  avaluoBase: initialAvaluoBase, 
  allAvaluos = [], 
  onClose, 
  onPreviewPrint, 
  onSaveCertificacion,
  currentUser,
  currentRole = 'autorizador'
}) {
  const [selectedAvaluoId, setSelectedAvaluoId] = useState(initialAvaluoBase?.id || (initialAvaluoBase ? initialAvaluoBase.id : '__manual__'));
  const [currentBase, setCurrentBase] = useState(initialAvaluoBase && initialAvaluoBase.id !== '__manual__' ? initialAvaluoBase : null);
  const [isCustomSolicitante, setIsCustomSolicitante] = useState(false);
  const [manualCodigoRef, setManualCodigoRef] = useState('LR-2026-10037');
  const [manualMesRef, setManualMesRef] = useState('octubre de 2026');
  const [isUploadingRgp, setIsUploadingRgp] = useState(false);
  const rgpInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    id: `cert-${Date.now().toString().slice(-5)}`,
    avaluoId: initialAvaluoBase?.id || '',
    avaluoCodigo: initialAvaluoBase?.codigo || 'LR-2026-10037',
    tenantId: initialAvaluoBase?.tenantId || (initialAvaluoBase?.codigo?.startsWith('CV-') ? 'cverde' : 'cverde'),
    empresaNombre: (initialAvaluoBase?.tenantId === 'lex-rosam') ? 'LEX ROSAM, S.A.' : 'CVERDE, S.A.',
    solicitante: initialAvaluoBase?.solicitante || 'BANCO G&T CONTINENTAL S.A.',
    tipoSolicitud: 'CERTIFICACIÓN DE VALOR',
    numeroReferencia: initialAvaluoBase?.codigo 
      ? initialAvaluoBase.codigo.replace('LR-2026-', 'CV-').replace('AVALUO-', '').replace('AVALÚO-', '')
      : 'CV-10001',
    direccion: initialAvaluoBase?.direccion || '',
    descripcionInmueble: initialAvaluoBase?.descripcionGeneral || initialAvaluoBase?.direccion || '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fincas: [],
    observaciones: '',
    valores: [],
    incluirAnexosRgp: true
  });

  // Generador de texto legal estándar para observaciones
  const generateDefaultObservaciones = (codigo, mes, empresa) => {
    const cod = codigo || 'LR-2026-10037';
    const m = mes || 'noviembre de 2026';
    const emp = empresa || 'CVERDE, S.A.';
    return ` Este documento es una certificación de valor del inmueble descrito, con base en el avalúo No. ${cod}, del mes de ${m}.
 No se realizó visita ni inspección interna al inmueble ya que es una certificación de valor, por lo que para el cálculo de valor se asume que el estado de conservación de las construcciones es nuevo tomando como referencia el avalúo ${cod}, del mes de ${m}. realizado por ${emp} en donde se han analizado las condiciones vigentes del mercado inmobiliario en la zona. Si al realizar inspección completa del inmueble se observan condiciones diferentes a las supuestas, el valor final consignado en esta certificación puede variar.
 La presente certificación se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe, circunscrita a las condiciones específicas detalladas en el informe y al marco de mercado vigente al momento de su elaboración. Se advierte que los valores y conclusiones aquí expresados están sujetos a variaciones futuras derivadas de cambios en las dinámicas del mercado, modificaciones en la situación legal del inmueble o actualizaciones en los registros públicos que puedan incidir en su valoración.`;
  };

  // Inicializar o cargar datos cuando cambia el avalúo base
  useEffect(() => {
    if (selectedAvaluoId === '__manual__') {
      setCurrentBase(null);
      setFormData(prev => ({
        ...prev,
        avaluoId: 'manual',
        avaluoCodigo: manualCodigoRef || 'LR-2026-10037',
        solicitante: prev.solicitante || 'BANCO G&T CONTINENTAL, S.A.',
        tipoSolicitud: 'CERTIFICACIÓN DE VALOR',
        numeroReferencia: prev.numeroReferencia || 'CV-10001',
        direccion: prev.direccion || '',
        descripcionInmueble: prev.descripcionInmueble || '',
        fincas: (prev.fincas && prev.fincas.length > 0) ? prev.fincas : [{ finca: '', folio: '', libro: '', areaRegistrada: '', propietario: '' }],
        valores: (prev.valores && prev.valores.length > 0) ? prev.valores : [{ descripcion: 'APARTAMENTO', area: '0.00', unidad: 'm2', valorUnitario: 0, total: 0 }],
        observaciones: generateDefaultObservaciones(manualCodigoRef, manualMesRef, prev.empresaNombre)
      }));
      return;
    }

    const base = allAvaluos.find(a => a.id === selectedAvaluoId) || initialAvaluoBase;
    if (base && base.id !== '__manual__') {
      setCurrentBase(base);
      const isCV = base.tenantId === 'cverde' || (base.codigo && base.codigo.startsWith('CV-'));
      const emp = isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.';
      
      // Extraer mes del avalúo base
      const fechaBase = base.fechaInspeccion || base.fecha || base.fechaSolicitud || '';
      let mesNombre = 'noviembre de 2026';
      if (fechaBase) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const parts = fechaBase.split('-');
        if (parts.length === 3) {
          const mIdx = parseInt(parts[1], 10) - 1;
          mesNombre = `${meses[mIdx] || 'noviembre'} de ${parts[0]}`;
        }
      }

      // Extraer fincas
      const baseFincas = (base.fincas && base.fincas.length > 0)
        ? base.fincas.map(f => ({
            finca: f.finca || '',
            folio: f.folio || '',
            libro: f.libro || '',
            areaRegistrada: f.areaRegistrada ? `${f.areaRegistrada} m2` : (f.areaValuada ? `${f.areaValuada} m2` : ''),
            propietario: f.propietario || base.propietarioPrincipal || ''
          }))
        : [{
            finca: base.finca || '681',
            folio: base.folio || '181',
            libro: base.libro || '662E DE PH DE GUATEMALA',
            areaRegistrada: base.areaValuada ? `${base.areaValuada} m2` : '55.66 m2',
            propietario: base.propietarioPrincipal || 'DESARROLLO TYN, SOCIEDAD ANÓNIMA'
          }];

      // Extraer valores (construcciones o desglose)
      let baseValores = [];
      if (base.desgloseConstruccion?.items && base.desgloseConstruccion.items.length > 0) {
        baseValores = base.desgloseConstruccion.items.map(it => {
          const a = parseFloat(it.area) || 0;
          const u = parseFloat(it.valorUnitario) || 0;
          return {
            descripcion: it.descripcion || 'Construcción',
            area: it.area || '0',
            unidad: it.unidad || 'm2',
            valorUnitario: u,
            total: it.total != null ? Number(it.total) : parseFloat((a * u).toFixed(2))
          };
        });
      } else {
        baseValores = [
          { descripcion: 'APARTAMENTO 403', area: '55.66', unidad: 'm2', valorUnitario: 17715, total: 986016.90 },
          { descripcion: 'PARQUEO 403', area: '25.00', unidad: 'm2', valorUnitario: 12000, total: 300000.00 }
        ];
      }

      setFormData(prev => ({
        ...prev,
        avaluoId: base.id,
        avaluoCodigo: base.codigo || 'LR-2026-10037',
        tenantId: isCV ? 'cverde' : 'lex-rosam',
        empresaNombre: emp,
        solicitante: base.solicitante || 'BANCO G&T CONTINENTAL S.A.',
        direccion: base.direccion || '',
        descripcionInmueble: base.descripcionGeneral || base.direccion || '',
        numeroReferencia: base.codigo 
          ? base.codigo.replace('LR-2026-', 'CV-').replace('AVALUO-', '').replace('AVALÚO-', '')
          : 'CV-10001',
        fincas: baseFincas,
        valores: baseValores,
        observaciones: generateDefaultObservaciones(base.codigo, mesNombre, emp),
        consultasPdfs: base.consultasPdfs || []
      }));
    }
  }, [selectedAvaluoId, initialAvaluoBase, manualCodigoRef, manualMesRef]);

  // Manejo de Fincas
  const handleAddFinca = () => {
    setFormData(prev => ({
      ...prev,
      fincas: [
        ...prev.fincas,
        { finca: '', folio: '', libro: '', areaRegistrada: '', propietario: prev.fincas[0]?.propietario || '' }
      ]
    }));
  };

  const handleUpdateFinca = (index, field, value) => {
    setFormData(prev => {
      const next = [...prev.fincas];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, fincas: next };
    });
  };

  const handleRemoveFinca = (index) => {
    setFormData(prev => {
      if (prev.fincas.length <= 1) {
        alert('Debe mantener al menos una finca registrada.');
        return prev;
      }
      return { ...prev, fincas: prev.fincas.filter((_, i) => i !== index) };
    });
  };

  // Manejo de Renglones de Valores
  const handleAddValor = () => {
    setFormData(prev => ({
      ...prev,
      valores: [
        ...prev.valores,
        { descripcion: '', area: '', unidad: 'm2', valorUnitario: 0, total: 0 }
      ]
    }));
  };

  const handleUpdateValor = (index, field, value) => {
    setFormData(prev => {
      const next = [...prev.valores];
      const item = { ...next[index], [field]: value };
      if (field === 'area' || field === 'valorUnitario') {
        const a = parseFloat(field === 'area' ? value : item.area) || 0;
        const u = parseFloat(field === 'valorUnitario' ? value : item.valorUnitario) || 0;
        item.total = parseFloat((a * u).toFixed(2));
      }
      next[index] = item;
      return { ...prev, valores: next };
    });
  };

  const handleRemoveValor = (index) => {
    setFormData(prev => {
      if (prev.valores.length <= 1) {
        alert('Debe mantener al menos un renglón de valor.');
        return prev;
      }
      return { ...prev, valores: prev.valores.filter((_, i) => i !== index) };
    });
  };

  // Cambio de Empresa (C VERDE vs LEX ROSAM)
  const handleTenantChange = (tId) => {
    const isCV = tId === 'cverde';
    const emp = isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.';
    setFormData(prev => {
      // Reemplazar el nombre en el texto de observaciones
      let obs = prev.observaciones;
      if (isCV) {
        obs = obs.replace(/LEX ROSAM, S\.A\./g, 'CVERDE, S.A.');
      } else {
        obs = obs.replace(/CVERDE, S\.A\./g, 'LEX ROSAM, S.A.').replace(/C VERDE, S\.A\./g, 'LEX ROSAM, S.A.');
      }
      return {
        ...prev,
        tenantId: tId,
        empresaNombre: emp,
        observaciones: obs
      };
    });
  };

  const handleUploadRgpForCert = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingRgp(true);
    try {
      const pages = await convertPdfOrImageToPageImages(file);
      if (pages && pages.length > 0) {
        setFormData(prev => ({
          ...prev,
          consultasPdfs: [{ id: `rgp-${Date.now()}`, name: file.name, pages }],
          incluirAnexosRgp: true
        }));
        alert(`Se adjuntaron con éxito ${pages.length} página(s) de la Certificación RGP.`);
      }
    } catch (err) {
      alert('Error al procesar el archivo PDF: ' + err.message);
    } finally {
      setIsUploadingRgp(false);
    }
  };

  const totalCalculado = formData.valores.reduce((acc, v) => acc + (Number(v.total) || 0), 0);

  const handlePreview = () => {
    if (onPreviewPrint) {
      onPreviewPrint(formData, currentBase);
    }
  };

  const handleSave = () => {
    if (onSaveCertificacion) {
      onSaveCertificacion(formData);
      alert('Certificación guardada con éxito.');
    }
  };

  const isCVerde = formData.tenantId === 'cverde';
  const themeColor = isCVerde ? '#004e3b' : '#0d2847';

  return (
    <div 
      className="modal-backdrop" 
      onClick={(e) => e.stopPropagation()} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
      >
        {/* Header Modal */}
        <div style={{
          background: themeColor,
          color: '#ffffff',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Award size={22} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Emisión de Certificación de Valor (PDF)
              </h2>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1' }}>
                Con base en avalúo existente · Formato legal oficial de dictamen para entidades financieras
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePreview}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Printer size={15} />
              <span>Ver / Imprimir PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
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

        {/* Body Formulario */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Fila 1: Selección de Avalúo Base + Empresa Emisora */}
          <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                1. Avalúo de Referencia (Base de Datos):
              </label>
              <select
                className="form-select"
                value={selectedAvaluoId}
                onChange={(e) => setSelectedAvaluoId(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', fontWeight: 600, color: '#0f172a' }}
              >
                <optgroup label="Variante 2: Inmueble Nuevo / Independiente">
                  <option value="__manual__">📝 Certificación Manual / Inmueble nuevo (sin avalúo previo en base de datos)</option>
                </optgroup>
                <optgroup label="Variante 1: Con base en Avalúo del Sistema">
                  {allAvaluos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} — {a.solicitante || 'Sin solicitante'} ({a.direccion ? a.direccion.slice(0, 35) + '...' : 'Sin dir'})
                    </option>
                  ))}
                </optgroup>
              </select>

              {selectedAvaluoId === '__manual__' && (
                <div style={{ marginTop: '0.5rem', background: '#eff6ff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.78rem', color: '#1e40af' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                    📝 Certificación Independiente (Inmueble no registrado):
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#334155', marginBottom: '6px' }}>
                    Complete los datos del inmueble (solicitante, dirección, descripción, fincas y valores) y especifique qué avalúo citará como antecedente en las observaciones legales:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block' }}>No. Avalúo citado:</span>
                      <input
                        type="text"
                        className="form-control"
                        value={manualCodigoRef}
                        onChange={(e) => {
                          setManualCodigoRef(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            observaciones: generateDefaultObservaciones(e.target.value, manualMesRef, prev.empresaNombre)
                          }));
                        }}
                        placeholder="Ej: LR-2026-10037"
                        style={{ fontSize: '0.78rem', padding: '3px 6px', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '140px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block' }}>Mes citado:</span>
                      <input
                        type="text"
                        className="form-control"
                        value={manualMesRef}
                        onChange={(e) => {
                          setManualMesRef(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            observaciones: generateDefaultObservaciones(manualCodigoRef, e.target.value, prev.empresaNombre)
                          }));
                        }}
                        placeholder="Ej: octubre de 2026"
                        style={{ fontSize: '0.78rem', padding: '3px 6px', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                2. Empresa Emisora de la Certificación:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleTenantChange('cverde')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: formData.tenantId === 'cverde' ? '2px solid #004e3b' : '1px solid #cbd5e1',
                    background: formData.tenantId === 'cverde' ? '#ecfdf5' : '#ffffff',
                    color: formData.tenantId === 'cverde' ? '#004e3b' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  🌲 C VERDE, S.A.
                </button>
                <button
                  type="button"
                  onClick={() => handleTenantChange('lex-rosam')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: formData.tenantId === 'lex-rosam' ? '2px solid #0d2847' : '1px solid #cbd5e1',
                    background: formData.tenantId === 'lex-rosam' ? '#eff6ff' : '#ffffff',
                    color: formData.tenantId === 'lex-rosam' ? '#0d2847' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  🏛️ LEX ROSAM, S.A.
                </button>
              </div>
            </div>
          </div>

          {/* Fila 2: Solicitante, Tipo de Solicitud y Número de Referencia */}
          <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Solicitante:
              </label>
              <select
                className="form-select"
                value={isCustomSolicitante ? '__custom__' : formData.solicitante}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setIsCustomSolicitante(true);
                  } else {
                    setIsCustomSolicitante(false);
                    setFormData(prev => ({ ...prev, solicitante: val }));
                  }
                }}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', fontWeight: 600, color: '#0f172a' }}
              >
                {Array.from(new Set([
                  ...PRESET_BANCOS,
                  ...(formData.solicitante && !PRESET_BANCOS.includes(formData.solicitante) ? [formData.solicitante] : []),
                  ...(initialAvaluoBase?.solicitante && !PRESET_BANCOS.includes(initialAvaluoBase.solicitante) ? [initialAvaluoBase.solicitante] : [])
                ])).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="__custom__">✏️ Otro Solicitante (Escribir manualmente)...</option>
              </select>

              {isCustomSolicitante && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Escriba el nombre del solicitante..."
                  value={formData.solicitante}
                  onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.4rem', borderRadius: '6px', marginTop: '6px', border: '1.5px solid #2563eb' }}
                  autoFocus
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Tipo de Solicitud:
              </label>
              <select
                className="form-select"
                value={formData.tipoSolicitud}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoSolicitud: e.target.value }))}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', fontWeight: 600 }}
              >
                {TIPOS_SOLICITUD.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Número de Referencia:
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.numeroReferencia}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroReferencia: e.target.value }))}
                placeholder="Ej. CV-10001"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', fontWeight: 700, color: themeColor }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Fecha de Emisión:
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.fechaEmision}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaEmision: e.target.value }))}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px' }}
              />
            </div>
          </div>

          {/* Fila 3: Dirección y Descripción del Inmueble */}
          <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Dirección del Inmueble:
              </label>
              <textarea
                rows={2}
                className="form-input"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Descripción del Inmueble:
              </label>
              <textarea
                rows={2}
                className="form-input"
                value={formData.descripcionInmueble}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcionInmueble: e.target.value }))}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Fila 4: Cuadro de Fincas (Dinámico con Agregar/Eliminar) */}
          <div style={{ flexShrink: 0, border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#f8fafc', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                📋 Tabla de Fincas Registrales ({formData.fincas.length})
              </span>
              <button
                type="button"
                onClick={handleAddFinca}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Plus size={15} />
                <span>Agregar Finca</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', padding: '0.75rem', background: '#ffffff' }}>
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#334155', fontSize: '0.76rem', fontWeight: 800 }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '105px' }}>FINCA</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '105px' }}>FOLIO</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '180px' }}>LIBRO</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '140px' }}>ÁREA REGISTRADA</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '220px' }}>PROPIETARIO</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '45px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.fincas.map((f, i) => (
                    <tr key={i} style={{ background: '#ffffff' }}>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.finca}
                          onChange={(e) => handleUpdateFinca(i, 'finca', e.target.value)}
                          placeholder="Finca"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.folio}
                          onChange={(e) => handleUpdateFinca(i, 'folio', e.target.value)}
                          placeholder="Folio"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.libro}
                          onChange={(e) => handleUpdateFinca(i, 'libro', e.target.value)}
                          placeholder="Ej. 1007 de Guatemala"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.areaRegistrada}
                          onChange={(e) => handleUpdateFinca(i, 'areaRegistrada', e.target.value)}
                          placeholder="Ej. 55.66 m²"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.propietario}
                          onChange={(e) => handleUpdateFinca(i, 'propietario', e.target.value)}
                          placeholder="Nombre del Propietario Registral"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveFinca(i)}
                          title="Eliminar finca"
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', padding: '6px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fila 5: Cuadro de Valores (Dinámico con Recálculo Automático) */}
          <div style={{ flexShrink: 0, border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#f8fafc', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                💰 Cuadro de Valores Inmobiliarios ({formData.valores.length} renglones)
              </span>
              <button
                type="button"
                onClick={handleAddValor}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Plus size={15} />
                <span>Agregar Renglón</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', padding: '0.75rem', background: '#ffffff' }}>
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#334155', fontSize: '0.76rem', fontWeight: 800 }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '240px' }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '130px' }}>ÁREA (m²)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '160px' }}>VALOR M² (Q)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '170px' }}>SUBTOTAL (Q)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '45px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.valores.map((v, i) => (
                    <tr key={i} style={{ background: '#ffffff' }}>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={v.descripcion}
                          onChange={(e) => handleUpdateValor(i, 'descripcion', e.target.value)}
                          placeholder="Ej. APARTAMENTO 403 / PARQUEO"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={v.area}
                          onChange={(e) => handleUpdateValor(i, 'area', e.target.value)}
                          placeholder="55.66"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={v.valorUnitario}
                          onChange={(e) => handleUpdateValor(i, 'valorUnitario', e.target.value)}
                          placeholder="17715.00"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 0.65rem', textAlign: 'right', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#ffffff' }}
                        />
                      </td>
                      <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 800, color: '#1e40af', fontSize: '0.95rem' }}>
                        Q. {Number(v.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveValor(i)}
                          title="Eliminar renglón"
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', padding: '6px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f0f9ff', fontWeight: 800, borderTop: '2px solid #bae6fd' }}>
                    <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right', textTransform: 'uppercase', color: '#0369a1', fontSize: '0.85rem' }}>
                      TOTAL VALORACIÓN CERTIFICADA:
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: themeColor, fontSize: '1.05rem', fontWeight: 800 }}>
                      Q. {totalCalculado.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Fila 6: Observaciones Oficiales (Viñetas Legales Editables) */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                Observaciones y Consideraciones Técnicas (Viñetas Oficiales):
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  observaciones: generateDefaultObservaciones(prev.avaluoCodigo, 'noviembre de 2026', prev.empresaNombre)
                }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} />
                <span>Restablecer texto legal estándar</span>
              </button>
            </div>
            <textarea
              rows={6}
              className="form-input"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.45, padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#ffffff', minHeight: '110px' }}
            />
          </div>

          {/* Fila 7: Anexos RGP + Botón para Cargar PDF */}
          <div style={{ flexShrink: 0, background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
              <FileText size={20} color="#0284c7" />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  Anexar Consultas Electrónicas del RGP al final del documento
                </span>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                  {formData.consultasPdfs?.length > 0
                    ? `Se adjuntarán las páginas RGP disponibles (${formData.consultasPdfs.reduce((acc, d) => acc + (d.pages?.length || 0), 0)} pág(s) a 1 por hoja).`
                    : 'Las hojas de la certificación registral se imprimirán a página completa al final del dictamen.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="file"
                ref={rgpInputRef}
                accept=".pdf,application/pdf"
                onChange={handleUploadRgpForCert}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => rgpInputRef.current?.click()}
                disabled={isUploadingRgp}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: isUploadingRgp ? 'wait' : 'pointer'
                }}
              >
                <Paperclip size={13} />
                <span>{isUploadingRgp ? 'Procesando PDF...' : (formData.consultasPdfs?.length > 0 ? '📎 Cambiar PDF RGP' : '📎 Cargar PDF RGP')}</span>
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.incluirAnexosRgp}
                  onChange={(e) => setFormData(prev => ({ ...prev, incluirAnexosRgp: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Incluir en PDF</span>
              </label>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div style={{
          background: '#f8fafc',
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: '#ffffff',
                border: '1px solid #004e3b',
                color: '#004e3b',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={handlePreview}
              style={{
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                padding: '0.5rem 1.4rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Printer size={16} />
              <span>Ver / Imprimir Certificación Oficial (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
