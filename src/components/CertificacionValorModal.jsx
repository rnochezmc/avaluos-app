import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Award, Printer, Save, Plus, Trash2, RefreshCw, FileText, 
  Building, Calendar, DollarSign, Check, AlertCircle, FileUp, Paperclip, ChevronDown, ChevronRight, Shield, Sparkles 
} from 'lucide-react';
import { formatFechaEnLetras, convertPdfOrImageToPageImages } from '../utils/pdfHelper';
import { isAroldoOrAdminUser } from '../utils/permissions';
import { getNextCertificacionCodigo } from '../utils/correlativos';

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
  const [isCustomSolicitante, setIsCustomSolicitante] = useState(false);
  const [isUploadingRgp, setIsUploadingRgp] = useState(false);
  const [showAutoFillAccordion, setShowAutoFillAccordion] = useState(false);
  const rgpInputRef = useRef(null);

  // Determinar si estamos editando una certificación existente o creando una nueva
  const isEditingExistingCert = Boolean(
    initialAvaluoBase && 
    initialAvaluoBase.id !== '__manual__' && 
    (initialAvaluoBase.tipoAvaluo === 'Certificación de Valor' || initialAvaluoBase.tipoAvaluo === 'Certificación' || initialAvaluoBase.codigo?.startsWith('CV-') || initialAvaluoBase.certificacion)
  );

  // Generador de texto legal estándar para observaciones
  const generateDefaultObservaciones = (codigo, mes, empresa) => {
    const cod = codigo || 'LR-2026-10037';
    const m = mes || 'noviembre de 2026';
    const emp = empresa || 'CVERDE, S.A.';
    return ` Este documento es una certificación de valor del inmueble descrito, con base en el avalúo No. ${cod}, del mes de ${m}.
 No se realizó visita ni inspección interna al inmueble ya que es una certificación de valor, por lo que para el cálculo de valor se asume que el estado de conservación de las construcciones es nuevo tomando como referencia el avalúo ${cod}, del mes de ${m}. realizado por ${emp} en donde se han analizado las condiciones vigentes del mercado inmobiliario en la zona. Si al realizar inspección completa del inmueble se observan condiciones diferentes a las supuestas, el valor final consignado en esta certificación puede variar.
 La presente certificación se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe, circunscrita a las condiciones específicas detalladas en el informe y al marco de mercado vigente al momento de su elaboración. Se advierte que los valores y conclusiones aquí expresados están sujetos a variaciones futuras derivadas de cambios en las dinámicas del mercado, modificaciones en la situación legal del inmueble o actualizaciones en los registros públicos que puedan incidir en su valoración.`;
  };

  // Inicialización inteligente del formulario
  const [formData, setFormData] = useState(() => {
    // Caso 1: Editando una certificación existente ya guardada
    if (isEditingExistingCert) {
      const src = initialAvaluoBase.certificacion || initialAvaluoBase;
      const isCV = src.tenantId === 'cverde' || src.empresaNombre?.includes('CVERDE') || src.codigo?.startsWith('CV-');
      return {
        id: initialAvaluoBase.id || src.id || `cert-${Date.now()}`,
        avaluoId: src.avaluoId || 'manual',
        avaluoCodigo: src.avaluoCodigo || 'LR-2026-10037',
        mesCitado: src.mesCitado || 'octubre de 2026',
        tenantId: isCV ? 'cverde' : 'lex-rosam',
        empresaNombre: isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.',
        solicitante: src.solicitante || 'BANCO G&T CONTINENTAL, S.A.',
        tipoSolicitud: 'CERTIFICACIÓN DE VALOR',
        numeroReferencia: src.numeroReferencia || initialAvaluoBase.codigo || getNextCertificacionCodigo(isCV ? 'cverde' : 'lex-rosam', allAvaluos),
        direccion: src.direccion || '',
        descripcionInmueble: src.descripcionInmueble || src.descripcionGeneral || '',
        fechaEmision: src.fechaEmision || new Date().toISOString().split('T')[0],
        fincas: Array.isArray(src.fincas) && src.fincas.length > 0 ? src.fincas : [{ finca: '', folio: '', libro: '', areaRegistrada: '', propietario: '', areaValuada: '' }],
        valores: Array.isArray(src.valores) && src.valores.length > 0 ? src.valores : [{ descripcion: 'APARTAMENTO', area: '0.00', unidad: 'm²', valorUnitario: 0, total: 0 }],
        observaciones: src.observaciones || generateDefaultObservaciones(src.avaluoCodigo || 'LR-2026-10037', src.mesCitado || 'octubre de 2026', isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.'),
        consultasPdfs: Array.isArray(src.consultasPdfs) ? src.consultasPdfs : [],
        incluirAnexosRgp: src.incluirAnexosRgp !== false,
        estado: src.estado || initialAvaluoBase.estado || 'en_revision'
      };
    }

    // Caso 2: Creado con base en un avalúo existente seleccionado de la lista
    if (initialAvaluoBase && initialAvaluoBase.id !== '__manual__') {
      const base = initialAvaluoBase;
      const isCV = base.tenantId === 'cverde' || base.codigo?.startsWith('CV-');
      const emp = isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.';
      const initialCertCode = getNextCertificacionCodigo(isCV ? 'cverde' : 'lex-rosam', allAvaluos);
      
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

      const baseFincas = (base.fincas && base.fincas.length > 0)
        ? base.fincas.map(f => ({
            finca: f.finca || '',
            folio: f.folio || '',
            libro: f.libro || '',
            areaRegistrada: f.areaRegistrada ? `${f.areaRegistrada} m²` : (f.areaValuada ? `${f.areaValuada} m²` : ''),
            propietario: f.propietario || base.propietarioPrincipal || '',
            areaValuada: f.areaValuada ? `${f.areaValuada} m²` : (f.areaRegistrada ? `${f.areaRegistrada} m²` : '')
          }))
        : [{
            finca: base.finca || '',
            folio: base.folio || '',
            libro: base.libro || '',
            areaRegistrada: base.areaValuada ? `${base.areaValuada} m²` : '',
            propietario: base.propietarioPrincipal || '',
            areaValuada: base.areaValuada ? `${base.areaValuada} m²` : ''
          }];

      return {
        id: `cert-${Date.now()}`,
        avaluoId: base.id,
        avaluoCodigo: base.codigo || 'LR-2026-10037',
        mesCitado: mesNombre,
        tenantId: isCV ? 'cverde' : 'lex-rosam',
        empresaNombre: emp,
        solicitante: base.solicitante || 'BANCO G&T CONTINENTAL, S.A.',
        tipoSolicitud: 'CERTIFICACIÓN DE VALOR',
        numeroReferencia: initialCertCode,
        direccion: base.direccion || '',
        descripcionInmueble: base.descripcionGeneral || base.direccion || '',
        fechaEmision: new Date().toISOString().split('T')[0],
        fincas: baseFincas,
        valores: [{ descripcion: baseFincas[0]?.finca ? `Finca ${baseFincas[0].finca}` : 'Inmueble', area: base.areaValuada || '0', unidad: 'm²', valorUnitario: 0, total: 0 }],
        observaciones: generateDefaultObservaciones(base.codigo, mesNombre, emp),
        consultasPdfs: Array.isArray(base.consultasPdfs) ? base.consultasPdfs : [],
        incluirAnexosRgp: true,
        estado: 'en_revision'
      };
    }

    // Caso 3: Nueva Certificación Manual independiente (Formulario en blanco listo para llenar)
    const targetTenant = (initialAvaluoBase?.tenantId === 'lex-rosam' || initialAvaluoBase?.tenantId === 'lexrosam') ? 'lex-rosam' : 'cverde';
    const isCV = targetTenant === 'cverde';
    const initialManualCode = getNextCertificacionCodigo(targetTenant, allAvaluos);
    return {
      id: `cert-${Date.now()}`,
      avaluoId: 'manual',
      avaluoCodigo: 'LR-2026-10037',
      mesCitado: 'octubre de 2026',
      tenantId: targetTenant,
      empresaNombre: isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.',
      solicitante: 'BANCO G&T CONTINENTAL, S.A.',
      tipoSolicitud: 'CERTIFICACIÓN DE VALOR',
      numeroReferencia: initialManualCode,
      direccion: '',
      descripcionInmueble: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fincas: [{ finca: '', folio: '', libro: '', areaRegistrada: '', propietario: '', areaValuada: '' }],
      valores: [{ descripcion: 'APARTAMENTO', area: '0.00', unidad: 'm²', valorUnitario: 0, total: 0 }],
      observaciones: generateDefaultObservaciones('LR-2026-10037', 'octubre de 2026', 'CVERDE, S.A.'),
      consultasPdfs: [],
      incluirAnexosRgp: true,
      estado: 'en_revision'
    };
  });

  // Manejo de cambio en Avalúo citado y Mes citado (actualiza dinámicamente las observaciones)
  const handleUpdateCitado = (campo, valor) => {
    setFormData(prev => {
      const nextCod = campo === 'avaluoCodigo' ? valor : prev.avaluoCodigo;
      const nextMes = campo === 'mesCitado' ? valor : prev.mesCitado;
      return {
        ...prev,
        [campo]: valor,
        observaciones: generateDefaultObservaciones(nextCod, nextMes, prev.empresaNombre)
      };
    });
  };

  // Manejadores de Fincas con Auto-Sincronización a Cuadro de Valores (Requerimiento de Aroldo: que jale las fincas)
  const handleAddFinca = () => {
    setFormData(prev => {
      const nextFincas = [
        ...prev.fincas,
        { finca: '', folio: '', libro: '', areaRegistrada: '', propietario: '', areaValuada: '' }
      ];
      const nextValores = [
        ...prev.valores,
        { descripcion: `Finca ${nextFincas.length}`, area: '0.00', unidad: 'm²', valorUnitario: 0, total: 0 }
      ];
      return {
        ...prev,
        fincas: nextFincas,
        valores: nextValores
      };
    });
  };

  const handleUpdateFinca = (index, field, value) => {
    setFormData(prev => {
      const nextFincas = [...prev.fincas];
      nextFincas[index] = { ...nextFincas[index], [field]: value };

      // Sincronizar automáticamente con el renglón correspondiente en la tabla de Valores
      const nextValores = [...(prev.valores || [])];
      if (nextValores[index]) {
        const itemVal = { ...nextValores[index] };
        if (field === 'finca' && value) {
          itemVal.descripcion = `Finca ${value}`;
        }
        if (field === 'areaValuada' || (field === 'areaRegistrada' && !nextFincas[index].areaValuada)) {
          const clean = (value || '').replace(/[^\d.]/g, '');
          if (clean) {
            itemVal.area = clean;
            const a = parseFloat(clean) || 0;
            const u = parseFloat(itemVal.valorUnitario || 0) || 0;
            itemVal.total = parseFloat((a * u).toFixed(2));
          }
        }
        nextValores[index] = itemVal;
      }

      return { ...prev, fincas: nextFincas, valores: nextValores };
    });
  };

  const handleRemoveFinca = (index) => {
    setFormData(prev => {
      if (prev.fincas.length <= 1) {
        alert('Debe mantener al menos una finca registral.');
        return prev;
      }
      const nextFincas = prev.fincas.filter((_, i) => i !== index);
      const nextValores = prev.valores.length > 1 ? prev.valores.filter((_, i) => i !== index) : prev.valores;
      return { ...prev, fincas: nextFincas, valores: nextValores };
    });
  };

  // Sincronizar Fincas con Cuadro de Valores (Requerimiento de Aroldo: que jale las fincas)
  const handleSyncFincasToValores = () => {
    if (!formData.fincas || formData.fincas.length === 0) {
      alert('No hay fincas registradas para sincronizar.');
      return;
    }
    setFormData(prev => {
      const syncedValores = prev.fincas.map((f, i) => {
        const existing = prev.valores[i];
        const cleanArea = (f.areaValuada || f.areaRegistrada || '0').replace(/[^\d.]/g, '');
        const areaNum = parseFloat(cleanArea) || 0;
        const unitario = existing ? parseFloat(existing.valorUnitario || 0) : 0;
        return {
          descripcion: f.finca ? `Finca ${f.finca}` : (existing?.descripcion || `Finca ${i + 1}`),
          area: cleanArea || '0',
          unidad: 'm²',
          valorUnitario: unitario,
          total: parseFloat((areaNum * unitario).toFixed(2))
        };
      });
      return { ...prev, valores: syncedValores };
    });
  };

  // Manejadores de Cuadro de Valores
  const handleAddValor = () => {
    setFormData(prev => ({
      ...prev,
      valores: [
        ...prev.valores,
        { descripcion: '', area: '', unidad: 'm²', valorUnitario: 0, total: 0 }
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
      let obs = prev.observaciones;
      if (isCV) {
        obs = obs.replace(/LEX ROSAM, S\.A\./g, 'CVERDE, S.A.');
      } else {
        obs = obs.replace(/CVERDE, S\.A\./g, 'LEX ROSAM, S.A.').replace(/C VERDE, S\.A\./g, 'LEX ROSAM, S.A.');
      }
      const updatedCode = !isEditingExistingCert 
        ? getNextCertificacionCodigo(tId, allAvaluos)
        : prev.numeroReferencia;
      return {
        ...prev,
        tenantId: tId,
        empresaNombre: emp,
        numeroReferencia: updatedCode,
        observaciones: obs
      };
    });
  };

  // Carga Múltiple de PDFs RGP (procesamiento robusto archivo por archivo)
  const handleUploadRgpFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingRgp(true);
    try {
      const newDocs = [];
      let totalPagesAdded = 0;
      for (const file of files) {
        try {
          const pages = await convertPdfOrImageToPageImages(file);
          if (pages && pages.length > 0) {
            totalPagesAdded += pages.length;
            newDocs.push({
              id: `rgp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              name: file.name,
              pages,
              fecha: new Date().toLocaleDateString('es-GT'),
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
            });
          }
        } catch (fileErr) {
          console.warn(`Error al procesar archivo PDF ${file.name}:`, fileErr);
        }
      }
      if (newDocs.length > 0) {
        setFormData(prev => ({
          ...prev,
          consultasPdfs: [...(prev.consultasPdfs || []), ...newDocs],
          incluirAnexosRgp: true
        }));
        alert(`Se cargaron exitosamente ${newDocs.length} documento(s) con un total de ${totalPagesAdded} página(s).`);
      } else {
        alert('No se pudieron procesar los archivos seleccionados. Verifique que sean archivos PDF o imágenes válidas.');
      }
    } catch (err) {
      alert('Error al procesar archivos PDF: ' + err.message);
    } finally {
      setIsUploadingRgp(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveRgpDoc = (docId) => {
    setFormData(prev => ({
      ...prev,
      consultasPdfs: (prev.consultasPdfs || []).filter(d => d.id !== docId)
    }));
  };

  // Autollenar desde un avalúo de la base de datos (opcional si lo desea)
  const handleAutoFillFromAvaluo = (targetId) => {
    const base = allAvaluos.find(a => a.id === targetId);
    if (!base) return;
    const isCV = base.tenantId === 'cverde' || base.codigo?.startsWith('CV-');
    const emp = isCV ? 'CVERDE, S.A.' : 'LEX ROSAM, S.A.';
    
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

    const baseFincas = (base.fincas && base.fincas.length > 0)
      ? base.fincas.map(f => ({
          finca: f.finca || '',
          folio: f.folio || '',
          libro: f.libro || '',
          areaRegistrada: f.areaRegistrada ? `${f.areaRegistrada} m²` : (f.areaValuada ? `${f.areaValuada} m²` : ''),
          propietario: f.propietario || base.propietarioPrincipal || '',
          areaValuada: f.areaValuada ? `${f.areaValuada} m²` : (f.areaRegistrada ? `${f.areaRegistrada} m²` : '')
        }))
      : [{
          finca: base.finca || '',
          folio: base.folio || '',
          libro: base.libro || '',
          areaRegistrada: base.areaValuada ? `${base.areaValuada} m²` : '',
          propietario: base.propietarioPrincipal || '',
          areaValuada: base.areaValuada ? `${base.areaValuada} m²` : ''
        }];

    setFormData(prev => ({
      ...prev,
      avaluoCodigo: base.codigo || prev.avaluoCodigo,
      mesCitado: mesNombre,
      solicitante: base.solicitante || prev.solicitante,
      direccion: base.direccion || prev.direccion,
      descripcionInmueble: base.descripcionGeneral || base.direccion || prev.descripcionInmueble,
      fincas: baseFincas,
      valores: [{ descripcion: baseFincas[0]?.finca ? `Finca ${baseFincas[0].finca}` : 'Inmueble', area: base.areaValuada || '0', unidad: 'm²', valorUnitario: 0, total: 0 }],
      observaciones: generateDefaultObservaciones(base.codigo, mesNombre, emp)
    }));
    setShowAutoFillAccordion(false);
  };

  const totalCalculado = formData.valores.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const totalRgpPages = (formData.consultasPdfs || []).reduce((acc, d) => acc + (d.pages?.length || 0), 0);

  const handlePreview = () => {
    if (onPreviewPrint) {
      onPreviewPrint(formData, initialAvaluoBase);
    }
  };

  const isAroldo = isAroldoOrAdminUser(currentUser) && currentRole !== 'ingreso';

  const handleSave = (targetEstado) => {
    if (!formData.solicitante) {
      alert('Por favor especifique el solicitante.');
      return;
    }
    const finalEstado = targetEstado || (isAroldo ? (formData.estado || 'en_revision') : 'en_revision');
    if (onSaveCertificacion) {
      onSaveCertificacion({
        ...formData,
        estado: finalEstado,
        autorizadoDirecto: finalEstado === 'autorizado'
      });
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
          maxWidth: '1100px',
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
                {isEditingExistingCert ? `Editar Certificación de Valor (${formData.numeroReferencia})` : 'Nueva Certificación de Valor'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1' }}>
                Formato legal oficial de dictamen para entidades financieras · Con o sin antecedente previo
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
          
          {/* Fila 1: Empresa Emisora + Datos Clave de Emisión */}
          <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            
            {/* Toggle Empresa Emisora */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                1. Empresa Emisora:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleTenantChange('cverde')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: formData.tenantId === 'cverde' ? '2px solid #00bb7f' : '1px solid #cbd5e1',
                    background: formData.tenantId === 'cverde' ? '#ecfdf5' : '#ffffff',
                    color: formData.tenantId === 'cverde' ? '#004e3b' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🌿 C VERDE, S.A.
                </button>
                <button
                  type="button"
                  onClick={() => handleTenantChange('lex-rosam')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: formData.tenantId === 'lex-rosam' ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                    background: formData.tenantId === 'lex-rosam' ? '#eff6ff' : '#ffffff',
                    color: formData.tenantId === 'lex-rosam' ? '#0d2847' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🏛️ LEX ROSAM, S.A.
                </button>
              </div>
            </div>

            {/* Número de Referencia (Código Certificación) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  2. Número de Referencia (Dictamen):
                </label>
                <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                  ✨ Correlativo Automático
                </span>
              </div>
              <input
                type="text"
                className="form-input"
                value={formData.numeroReferencia}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroReferencia: e.target.value }))}
                placeholder="Ej. CV-2026-00001"
                style={{ width: '100%', height: '38px', fontSize: '0.9rem', padding: '0.45rem 0.65rem', borderRadius: '8px', fontWeight: 800, color: themeColor, border: '1.5px solid #cbd5e1' }}
              />
            </div>

            {/* Fecha de Emisión */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                3. Fecha de Emisión:
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.fechaEmision}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaEmision: e.target.value }))}
                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Fila 2: Solicitante y Tipo de Solicitud */}
          <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Solicitante / Entidad Financiera:
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
                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', fontWeight: 600, color: '#0f172a', border: '1.5px solid #cbd5e1' }}
              >
                {Array.from(new Set([
                  ...PRESET_BANCOS,
                  ...(formData.solicitante && !PRESET_BANCOS.includes(formData.solicitante) ? [formData.solicitante] : [])
                ])).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="__custom__">✏️ Otro Solicitante (Escribir manualmente)...</option>
              </select>

              {isCustomSolicitante && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Escriba el nombre del solicitante o banco..."
                  value={formData.solicitante}
                  onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
                  style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', marginTop: '6px', border: '1.5px solid #2563eb' }}
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
                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0.45rem', borderRadius: '8px', fontWeight: 600, border: '1.5px solid #cbd5e1' }}
              >
                {TIPOS_SOLICITUD.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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
                placeholder="Ej. Apartamento 403, Edificio... Zona 10, Guatemala"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                style={{ width: '100%', minHeight: '52px', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Descripción del Inmueble:
              </label>
              <textarea
                rows={2}
                className="form-input"
                placeholder="Ej. Inmueble destinado a vivienda tipo apartamento en nivel..."
                value={formData.descripcionInmueble}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcionInmueble: e.target.value }))}
                style={{ width: '100%', minHeight: '52px', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Fila 4: Antecedente Legal Citado (Avalúo de Referencia para el Texto Legal) */}
          <div style={{ flexShrink: 0, background: '#f1f5f9', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>
                📌 Avalúo Citado como Antecedente en la Certificación:
              </span>
              {allAvaluos && allAvaluos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAutoFillAccordion(!showAutoFillAccordion)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {showAutoFillAccordion ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Autollenar datos desde avalúo en base de datos (opcional)</span>
                </button>
              )}
            </div>

            {showAutoFillAccordion && (
              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Seleccione un avalúo para copiar automáticamente su dirección, fincas y desglose de construcciones:
                </label>
                <select
                  className="form-select"
                  onChange={(e) => handleAutoFillFromAvaluo(e.target.value)}
                  defaultValue=""
                  style={{ width: '100%', height: '36px', fontSize: '0.82rem', padding: '0.4rem' }}
                >
                  <option value="" disabled>-- Seleccionar avalúo existente para copiar datos --</option>
                  {allAvaluos.filter(a => a.tipoAvaluo !== 'Certificación de Valor' && !a.codigo?.startsWith('CV-')).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} - {a.propietarioPrincipal || a.direccion || 'Sin titular'} ({a.solicitante})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                  No. de Avalúo citado como referencia:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.avaluoCodigo}
                  onChange={(e) => handleUpdateCitado('avaluoCodigo', e.target.value)}
                  placeholder="Ej. LR-2026-10037"
                  style={{ width: '100%', height: '36px', fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                  Mes y año del avalúo citado:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.mesCitado}
                  onChange={(e) => handleUpdateCitado('mesCitado', e.target.value)}
                  placeholder="Ej. octubre de 2026"
                  style={{ width: '100%', height: '36px', fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>

          {/* Fila 5: Tabla de Fincas Registrales (Finca, Folio, Libro, Área Registrada, Propietario, Área Valuada) */}
          <div style={{ flexShrink: 0, border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#f8fafc', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
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
                  padding: '5px 12px',
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
              <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#334155', fontSize: '0.76rem', fontWeight: 800 }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '100px' }}>FINCA</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '90px' }}>FOLIO</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '160px' }}>LIBRO</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '130px' }}>ÁREA REGISTRADA</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '180px' }}>PROPIETARIO</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '130px' }}>ÁREA VALUADA</th>
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
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.folio}
                          onChange={(e) => handleUpdateFinca(i, 'folio', e.target.value)}
                          placeholder="Folio"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.libro}
                          onChange={(e) => handleUpdateFinca(i, 'libro', e.target.value)}
                          placeholder="Ej. 1007 de Guatemala"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.areaRegistrada}
                          onChange={(e) => handleUpdateFinca(i, 'areaRegistrada', e.target.value)}
                          placeholder="Ej. 55.66 m²"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.propietario}
                          onChange={(e) => handleUpdateFinca(i, 'propietario', e.target.value)}
                          placeholder="Nombre del Propietario Registral"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={f.areaValuada}
                          onChange={(e) => handleUpdateFinca(i, 'areaValuada', e.target.value)}
                          placeholder="Ej. 55.66 m²"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
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

          {/* Fila 6: Cuadro de Valores (con botón para sincronizar fincas automáticamente) */}
          <div style={{ flexShrink: 0, border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#f8fafc', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                💰 Cuadro de Valores Inmobiliarios ({formData.valores.length} renglones)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSyncFincasToValores}
                  title="Copiar las fincas de arriba a este cuadro de valores"
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#15803d',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>🔄 Sincronizar con Fincas</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddValor}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '5px 12px',
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
            </div>

            <div style={{ overflowX: 'auto', padding: '0.75rem', background: '#ffffff' }}>
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#334155', fontSize: '0.76rem', fontWeight: 800 }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '220px' }}>FINCA</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '130px' }}>ÁREA (m²)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '160px' }}>VALOR M² (Q)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '170px' }}>TOTAL (Q)</th>
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
                          placeholder="Ej. Finca 56557 / APARTAMENTO 403"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
                        />
                      </td>
                      <td style={{ padding: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={v.area}
                          onChange={(e) => handleUpdateValor(i, 'area', e.target.value)}
                          placeholder="55.66"
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 600, padding: '0.45rem', textAlign: 'center', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
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
                          style={{ width: '100%', height: '38px', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 0.65rem', textAlign: 'right', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}
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

          {/* Fila 7: Observaciones Oficiales (Viñetas Legales Editables) */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                Observaciones y Consideraciones Técnicas (Viñetas Oficiales):
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  observaciones: generateDefaultObservaciones(prev.avaluoCodigo, prev.mesCitado, prev.empresaNombre)
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

          {/* Fila 8: Consultas RGP Adjuntas (Multi-PDF Upload & Document List) */}
          <div style={{ flexShrink: 0, background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0284c7" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                  Anexar Consultas Electrónicas del RGP ({formData.consultasPdfs?.length || 0} archivos · {totalRgpPages} páginas en total)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="file"
                  multiple
                  ref={rgpInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleUploadRgpFiles}
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
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: isUploadingRgp ? 'wait' : 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <Paperclip size={14} />
                  <span>{isUploadingRgp ? 'Procesando archivos PDF...' : '+ Cargar PDF(s) RGP'}</span>
                </button>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
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

            {/* Lista de Documentos Cargados */}
            {formData.consultasPdfs && formData.consultasPdfs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.5rem' }}>
                {formData.consultasPdfs.map((doc, idx) => (
                  <div 
                    key={doc.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        📄 {doc.name || `Documento ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        {doc.pages?.length || 1} página(s)
                      </span>
                      {doc.size && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {doc.size}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRgpDoc(doc.id)}
                      title="Eliminar este archivo"
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Quitar</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>
                No se han adjuntado consultas del RGP. Puede seleccionar varios archivos PDF simultáneamente.
              </div>
            )}
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

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAroldo ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('en_revision')}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#334155',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  title="Guardar como borrador / en revisión sin estampar firma oficial"
                >
                  <Save size={16} />
                  <span>Guardar en Revisión</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('autorizado')}
                  style={{
                    background: isCVerde ? '#004e3b' : '#0d2847',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.55rem 1.35rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0, 78, 59, 0.25)'
                  }}
                  title="Guardar y autorizar oficialmente con firma y sello del Lic. Aroldo Ruiz"
                >
                  <Shield size={16} color="#86efac" />
                  <span>Guardar y Autorizar</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSave('en_revision')}
                style={{
                  background: isCVerde ? '#004e3b' : '#0d2847',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.55rem 1.35rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                }}
                title="Guardar y enviar a revisión para aprobación del Lic. Aroldo Ruiz"
              >
                <Save size={16} />
                <span>Guardar y Enviar a Revisión</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePreview}
              style={{
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                padding: '0.55rem 1.25rem',
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
              <span>Vista Previa (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
