import React, { useState, useEffect } from 'react';
import { 
  X, FileSpreadsheet, Download, Check, Plus, Trash2, 
  Layers, Filter, Eye, RefreshCw, FileText, Sparkles 
} from 'lucide-react';

export const AVAILABLE_REPORT_FIELDS = [
  // Generales
  { id: 'codigo', label: 'Código de Expediente', category: 'General', default: true },
  { id: 'solicitante', label: 'Solicitante / Cliente', category: 'General', default: true },
  { id: 'dirigidoA', label: 'Dirigido a (Entidad)', category: 'General', default: true },
  { id: 'estado', label: 'Estado del Expediente', category: 'General', default: true },
  { id: 'tipoAvaluo', label: 'Tipo de Avalúo', category: 'General', default: true },
  { id: 'empresa', label: 'Empresa Emisora', category: 'General', default: false },

  // Inmueble y Ubicación
  { id: 'propietarioPrincipal', label: 'Propietario Registral', category: 'Inmueble', default: true },
  { id: 'bienMostradoPor', label: 'Bien Mostrado Por', category: 'Inmueble', default: false },
  { id: 'direccion', label: 'Dirección del Inmueble', category: 'Inmueble', default: true },
  { id: 'coordenadas', label: 'Coordenadas GPS', category: 'Inmueble', default: false },
  { id: 'descripcionGeneral', label: 'Descripción General', category: 'Inmueble', default: false },

  // Fechas
  { id: 'fechaInspeccion', label: 'Fecha de Inspección', category: 'Fechas', default: true },
  { id: 'fechaSolicitud', label: 'Fecha de Solicitud', category: 'Fechas', default: false },
  { id: 'fechaEmision', label: 'Fecha de Emisión', category: 'Fechas', default: false },

  // Registro y Áreas
  { id: 'fincasResumen', label: 'Fincas (Finca / Folio / Libro)', category: 'Registro & Áreas', default: true },
  { id: 'fincasCount', label: 'Cantidad de Fincas', category: 'Registro & Áreas', default: false },
  { id: 'areaValuada', label: 'Área Valuada (m²)', category: 'Registro & Áreas', default: true },
  { id: 'areaRegistrada', label: 'Área Registrada (m²)', category: 'Registro & Áreas', default: false },
  { id: 'areaFisica', label: 'Área Física (m²)', category: 'Registro & Áreas', default: false },

  // Valores Financieros
  { id: 'valorComercialGTQ', label: 'Valor Comercial (Q)', category: 'Valores Financieros', default: true, isCurrencyGTQ: true },
  { id: 'valorBancarioGTQ', label: 'Valor Bancario (Q)', category: 'Valores Financieros', default: true, isCurrencyGTQ: true },
  { id: 'valorComercialUSD', label: 'Valor Comercial ($)', category: 'Valores Financieros', default: true, isCurrencyUSD: true },
  { id: 'valorBancarioUSD', label: 'Valor Bancario ($)', category: 'Valores Financieros', default: false, isCurrencyUSD: true },
  { id: 'tipoCambio', label: 'Tipo de Cambio', category: 'Valores Financieros', default: false },

  // Terreno y Sector
  { id: 'usoSuelo', label: 'Uso del Suelo', category: 'Terreno', default: false },
  { id: 'nivelSocioeconomico', label: 'Nivel Socioeconómico', category: 'Terreno', default: false },
  { id: 'formaTerreno', label: 'Forma del Terreno', category: 'Terreno', default: false },
  { id: 'pendiente', label: 'Topografía / Pendiente', category: 'Terreno', default: false },
  { id: 'ubicacionEsquina', label: 'Ubicación de Esquina', category: 'Terreno', default: false },
  { id: 'desdeCalle', label: 'Desde la Calle', category: 'Terreno', default: false },
  { id: 'accesoCalle', label: 'Acceso de Calle', category: 'Terreno', default: false },

  // Legal
  { id: 'gravamenes', label: 'Gravámenes', category: 'Aspectos Legales', default: false },
  { id: 'limitaciones', label: 'Limitaciones', category: 'Aspectos Legales', default: false },
  { id: 'anotaciones', label: 'Anotaciones', category: 'Aspectos Legales', default: false },

  // Control y Firmas
  { id: 'valuadorPrincipal', label: 'Valuador Principal', category: 'Control & Firmas', default: false },
  { id: 'autorizadoPor', label: 'Autorizado Por', category: 'Control & Firmas', default: false },
  { id: 'creadoPorNombre', label: 'Ingresado Por', category: 'Control & Firmas', default: false }
];

export const REPORT_PRESETS = [
  {
    id: 'ejecutivo',
    label: '💼 Reporte Ejecutivo Oficial',
    desc: 'Código, Cliente, Banco, Dirección, Estado, Áreas y Valores principales',
    fields: ['codigo', 'solicitante', 'dirigidoA', 'propietarioPrincipal', 'direccion', 'estado', 'fincasResumen', 'areaValuada', 'valorComercialGTQ', 'valorBancarioGTQ', 'valorComercialUSD']
  },
  {
    id: 'financiero',
    label: '💰 Reporte de Valores Financieros',
    desc: 'Enfocado en cifras monetarias, tipo de cambio y comparativa Q vs $',
    fields: ['codigo', 'solicitante', 'dirigidoA', 'fechaInspeccion', 'estado', 'valorComercialGTQ', 'valorBancarioGTQ', 'valorComercialUSD', 'valorBancarioUSD', 'tipoCambio']
  },
  {
    id: 'registral',
    label: '🏛️ Reporte Registral y Catastral',
    desc: 'Fincas, libros, áreas registradas, propietarios y gravámenes',
    fields: ['codigo', 'propietarioPrincipal', 'fincasResumen', 'fincasCount', 'areaRegistrada', 'areaValuada', 'gravamenes', 'limitaciones', 'anotaciones']
  },
  {
    id: 'terreno',
    label: '📐 Reporte de Terreno y Sector',
    desc: 'Uso de suelo, nivel socioeconómico, forma, pendiente y acceso',
    fields: ['codigo', 'solicitante', 'direccion', 'usoSuelo', 'nivelSocioeconomico', 'formaTerreno', 'pendiente', 'ubicacionEsquina', 'desdeCalle', 'accesoCalle']
  }
];

export default function ReporteriaModal({
  isOpen,
  onClose,
  avaluos = [],
  currentTenant,
  selectedTenantId = 'lex-rosam',
  currentUser
}) {
  const [selectedFields, setSelectedFields] = useState(
    AVAILABLE_REPORT_FIELDS.filter(f => f.default).map(f => f.id)
  );
  const [scopeFilter, setScopeFilter] = useState('todos_tenant'); // 'todos_tenant' | 'en_revision' | 'autorizados'
  const [fieldToAdd, setFieldToAdd] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Cargar el logotipo actual en Base64 para incrustarlo nativamente en el Excel
  useEffect(() => {
    const logoPath = selectedTenantId === 'cverde' ? '/cverde-logo.jpg' : '/lex-rosam-logo.png';
    fetch(logoPath)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => setLogoBase64(''));
  }, [selectedTenantId]);

  if (!isOpen) return null;

  // Filtrado de expedientes según el alcance seleccionado
  const expedientesParaReporte = avaluos.filter(item => {
    if (scopeFilter === 'en_revision') {
      return item.estado === 'en_revision' || item.estado === 'proceso';
    }
    if (scopeFilter === 'autorizados') {
      return item.estado === 'autorizado' || item.estado === 'completado';
    }
    return true;
  });

  const handleToggleField = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleAddFieldFromSelect = (e) => {
    const val = e.target.value;
    if (val && !selectedFields.includes(val)) {
      setSelectedFields(prev => [...prev, val]);
    }
    setFieldToAdd('');
  };

  const handleApplyPreset = (presetFields) => {
    setSelectedFields(presetFields);
  };

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_REPORT_FIELDS.map(f => f.id));
  };

  const handleClearAll = () => {
    setSelectedFields(['codigo', 'solicitante']);
  };

  // Obtener el valor formateado de cada campo para un avalúo
  const getFieldValue = (item, fieldId) => {
    switch (fieldId) {
      case 'codigo':
        return item.codigo || item.id || '-';
      case 'solicitante':
        return item.solicitante || '-';
      case 'dirigidoA':
        return item.dirigidoA || '-';
      case 'estado': {
        const st = (item.estado || '').toLowerCase();
        if (st === 'autorizado' || st === 'completado') return 'AUTORIZADO';
        if (st === 'en_revision' || st === 'proceso') return 'EN REVISIÓN';
        if (st === 'devuelto') return 'DEVUELTO';
        if (st === 'borrador') return 'BORRADOR';
        return item.estado?.toUpperCase() || '-';
      }
      case 'tipoAvaluo':
        return item.tipoAvaluo || '-';
      case 'empresa': {
        const isCV = item.tenantId === 'cverde' || item.codigo?.startsWith('CV-');
        return isCV ? 'C VERDE, S.A.' : 'LEX ROSAM, S.A.';
      }
      case 'propietarioPrincipal':
        return item.propietarioPrincipal || item.fincas?.[0]?.propietario || '-';
      case 'bienMostradoPor':
        return item.bienMostradoPor || '-';
      case 'direccion':
        return item.direccion || '-';
      case 'coordenadas':
        return item.coordenadas || '-';
      case 'descripcionGeneral':
        return item.descripcionGeneral || '-';
      case 'fechaInspeccion':
        return item.fechaInspeccion || '-';
      case 'fechaSolicitud':
        return item.fechaSolicitud || '-';
      case 'fechaEmision':
        return item.fechaEmision || '-';
      case 'fincasResumen': {
        if (!item.fincas || item.fincas.length === 0) return '-';
        return item.fincas.map((f, i) => `Finca ${f.finca || '-'}, Folio ${f.folio || '-'}, Libro ${f.libro || '-'}`).join(' // ');
      }
      case 'fincasCount':
        return item.fincas ? item.fincas.length : 1;
      case 'areaValuada':
        return item.areaValuada ? Number(item.areaValuada).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²' : '-';
      case 'areaRegistrada':
        return item.areaRegistrada ? Number(item.areaRegistrada).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²' : '-';
      case 'areaFisica':
        return item.areaFisica ? Number(item.areaFisica).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²' : '-';
      case 'valorComercialGTQ':
        return Number(item.valorComercialGTQ) || 0;
      case 'valorBancarioGTQ':
        return Number(item.valorBancarioGTQ) || 0;
      case 'valorComercialUSD':
        return Number(item.valorComercialUSD) || 0;
      case 'valorBancarioUSD':
        return Number(item.valorBancarioUSD) || 0;
      case 'tipoCambio':
        return item.tipoCambio ? Number(item.tipoCambio).toFixed(5) : '-';
      case 'usoSuelo':
        return item.usoSuelo || item.terreno?.uso || '-';
      case 'nivelSocioeconomico':
        return item.nivelSocioeconomico || item.terreno?.nivelSocioEconomico || '-';
      case 'formaTerreno':
        return item.formaTerreno || '-';
      case 'pendiente':
        return item.pendiente || '-';
      case 'ubicacionEsquina':
        return item.esquina || item.ubicacionEsquina || 'No';
      case 'desdeCalle':
        return item.desdeCalle || 'En frente';
      case 'accesoCalle':
        return item.accesoCalle || '-';
      case 'gravamenes':
        return item.gravamenes || '-';
      case 'limitaciones':
        return item.limitaciones || '-';
      case 'anotaciones':
        return item.anotaciones || '-';
      case 'valuadorPrincipal':
        return item.valuadorPrincipal || '-';
      case 'autorizadoPor':
        return item.autorizadoPor || (item.estado === 'autorizado' ? 'Lic. Aroldo Oliverio Ruiz Orozco' : '-');
      case 'creadoPorNombre':
        return item.creadoPorNombre || item.creadoPor || '-';
      default:
        return item[fieldId] || '-';
    }
  };

  // Generador de Excel oficial formateado con Logo a la izquierda
  const handleExportToExcel = () => {
    setIsExporting(true);

    try {
      const isCV = selectedTenantId === 'cverde';
      const companyName = isCV ? 'C VERDE, SOCIEDAD ANÓNIMA' : 'LEX ROSAM, SOCIEDAD ANÓNIMA';
      const companySubtitle = isCV ? 'SERVICIOS INMOBILIARIOS Y AVALÚOS' : 'SERVICIOS TÉCNICOS Y AVALÚOS PROFESIONALES';
      const headerColor = isCV ? '#004e3b' : '#0d2847';
      const secondaryHeaderColor = isCV ? '#002c22' : '#07172b';
      const accentColor = isCV ? '#00bb7f' : '#38bdf8';

      const activeColumns = AVAILABLE_REPORT_FIELDS.filter(f => selectedFields.includes(f.id));
      const colSpanTotal = Math.max(activeColumns.length, 5);

      const todayStr = new Date().toLocaleDateString('es-GT', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });

      // Cálculo de totales si existen columnas monetarias
      let sumComercialGTQ = 0;
      let sumBancarioGTQ = 0;
      let sumComercialUSD = 0;

      expedientesParaReporte.forEach(item => {
        sumComercialGTQ += Number(item.valorComercialGTQ) || 0;
        sumBancarioGTQ += Number(item.valorBancarioGTQ) || 0;
        sumComercialUSD += Number(item.valorComercialUSD) || 0;
      });

      // Construcción del documento HTML con formato para Microsoft Excel / Numbers
      let excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Reporte de Avalúos</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; }
          .title-company { font-size: 16pt; font-weight: bold; color: ${headerColor}; }
          .subtitle-company { font-size: 10pt; color: #475569; }
          .report-meta { font-size: 9pt; color: #64748b; }
          .table-header { background-color: ${headerColor}; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #1e293b; padding: 8px 6px; }
          .data-cell { font-size: 9pt; border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: middle; }
          .cell-code { font-weight: bold; color: ${headerColor}; text-align: center; }
          .cell-status-autorizado { background-color: #ecfdf5; color: #047857; font-weight: bold; text-align: center; }
          .cell-status-revision { background-color: #fffbeb; color: #b45309; font-weight: bold; text-align: center; }
          .cell-status-devuelto { background-color: #fef2f2; color: #b91c1c; font-weight: bold; text-align: center; }
          .cell-status-borrador { background-color: #f1f5f9; color: #475569; font-weight: bold; text-align: center; }
          .cell-currency { text-align: right; font-weight: 500; }
          .cell-number { text-align: right; }
          .row-zebra { background-color: #f8fafc; }
          .row-total { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid ${headerColor}; border-bottom: 2px solid ${headerColor}; font-size: 10pt; }
        </style>
      </head>
      <body>
        <table>
          <!-- Fila de Encabezado con Logo a la izquierda -->
          <tr>
            <td colspan="2" rowspan="3" style="vertical-align: middle; text-align: center; padding: 10px; background-color: #ffffff; border-bottom: 3px solid ${headerColor};">
              ${logoBase64 ? `<img src="${logoBase64}" width="140" height="42" alt="Logo" />` : `<strong>${isCV ? 'C VERDE' : 'LEX ROSAM'}</strong>`}
            </td>
            <td colspan="${colSpanTotal - 2}" style="font-size: 15pt; font-weight: bold; color: ${headerColor}; padding-top: 10px; padding-left: 12px;">
              ${companyName}
            </td>
          </tr>
          <tr>
            <td colspan="${colSpanTotal - 2}" style="font-size: 10pt; font-weight: bold; color: #334155; padding-left: 12px;">
              REPORTE OFICIAL DE EXPEDIENTES DE AVALÚOS · ${scopeFilter === 'en_revision' ? 'SOLO EN REVISIÓN' : (scopeFilter === 'autorizados' ? 'SOLO AUTORIZADOS' : 'CONSOLIDADO COMPLETO')}
            </td>
          </tr>
          <tr>
            <td colspan="${colSpanTotal - 2}" style="font-size: 8.5pt; color: #64748b; padding-left: 12px; padding-bottom: 10px; border-bottom: 3px solid ${headerColor};">
              Generado el: ${todayStr} | Emitido por: ${currentUser?.nombre || 'Usuario Autorizado'} | Registros incluidos: ${expedientesParaReporte.length}
            </td>
          </tr>

          <!-- Espacio en blanco antes de la tabla -->
          <tr style="height: 12px;"><td colspan="${colSpanTotal}"></td></tr>

          <!-- Encabezados de Columnas -->
          <tr>
            <th class="table-header" style="width: 40px;">No.</th>
            ${activeColumns.map(col => `
              <th class="table-header">${col.label}</th>
            `).join('')}
          </tr>
      `;

      // Filas de Datos
      expedientesParaReporte.forEach((item, index) => {
        const isZebra = index % 2 === 1;
        const rowClass = isZebra ? 'row-zebra' : '';

        excelHtml += `<tr class="${rowClass}">
          <td class="data-cell" style="text-align: center; color: #64748b;">${index + 1}</td>
        `;

        activeColumns.forEach(col => {
          const rawVal = getFieldValue(item, col.id);

          if (col.id === 'codigo') {
            excelHtml += `<td class="data-cell cell-code">${rawVal}</td>`;
          } else if (col.id === 'estado') {
            const st = (item.estado || '').toLowerCase();
            let stClass = 'cell-status-borrador';
            if (st === 'autorizado' || st === 'completado') stClass = 'cell-status-autorizado';
            else if (st === 'en_revision' || st === 'proceso') stClass = 'cell-status-revision';
            else if (st === 'devuelto') stClass = 'cell-status-devuelto';

            excelHtml += `<td class="data-cell ${stClass}">${rawVal}</td>`;
          } else if (col.isCurrencyGTQ) {
            const num = Number(rawVal) || 0;
            excelHtml += `<td class="data-cell cell-currency" style="mso-number-format:'Q\\ #\\,##0\\.00';">
              Q ${num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>`;
          } else if (col.isCurrencyUSD) {
            const num = Number(rawVal) || 0;
            excelHtml += `<td class="data-cell cell-currency" style="mso-number-format:'\\$\\ #\\,##0\\.00';">
              $ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>`;
          } else {
            excelHtml += `<td class="data-cell">${rawVal}</td>`;
          }
        });

        excelHtml += `</tr>`;
      });

      // Fila de Totales si hay columnas de moneda
      const hasCurrency = activeColumns.some(c => c.isCurrencyGTQ || c.isCurrencyUSD);
      if (hasCurrency && expedientesParaReporte.length > 0) {
        excelHtml += `
          <tr class="row-total">
            <td class="data-cell" colspan="2" style="text-align: right; font-weight: bold; color: ${headerColor};">
              TOTALES:
            </td>
        `;

        activeColumns.slice(1).forEach(col => {
          if (col.id === 'valorComercialGTQ') {
            excelHtml += `<td class="data-cell cell-currency" style="font-weight: bold; color: ${headerColor};">
              Q ${sumComercialGTQ.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>`;
          } else if (col.id === 'valorBancarioGTQ') {
            excelHtml += `<td class="data-cell cell-currency" style="font-weight: bold; color: ${headerColor};">
              Q ${sumBancarioGTQ.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>`;
          } else if (col.id === 'valorComercialUSD') {
            excelHtml += `<td class="data-cell cell-currency" style="font-weight: bold; color: ${headerColor};">
              $ ${sumComercialUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>`;
          } else {
            excelHtml += `<td class="data-cell" style="background-color: #f1f5f9;">-</td>`;
          }
        });

        excelHtml += `</tr>`;
      }

      excelHtml += `
          </table>
        </body>
      </html>
      `;

      // Descarga del archivo .xls
      const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const filename = `Reporte_${isCV ? 'C_VERDE' : 'LEX_ROSAM'}_${new Date().toISOString().slice(0, 10)}.xls`;
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error al generar Excel:', err);
      alert('Ocurrió un error al generar el archivo Excel. Por favor intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeColumnsList = AVAILABLE_REPORT_FIELDS.filter(f => selectedFields.includes(f.id));

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
      >
        {/* Modal Header */}
        <div 
          style={{
            background: selectedTenantId === 'cverde' 
              ? 'linear-gradient(135deg, #002c22 0%, #004e3b 100%)' 
              : 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)',
            padding: '1.1rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <FileSpreadsheet size={24} color="#34d399" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>
                Reportería Personalizada y Exportación a Excel
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Empresa activa: <strong>{selectedTenantId === 'cverde' ? 'C VERDE, S.A.' : 'LEX ROSAM, S.A.'}</strong> · Seleccione las columnas que desea ver en su reporte
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Fila 1: Alcance de los datos + Plantillas rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            
            {/* Alcance del Reporte */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                <Filter size={13} style={{ display: 'inline', marginRight: '4px' }} />
                1. ¿Qué expedientes incluir en el reporte?
              </label>
              <select
                className="form-select"
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.65rem', borderRadius: '8px' }}
              >
                <option value="todos_tenant">Todos los expedientes de la empresa ({avaluos.length} disponibles)</option>
                <option value="en_revision">⏳ Solo los pendientes de revisión / proceso ({avaluos.filter(a => a.estado === 'en_revision' || a.estado === 'proceso').length})</option>
                <option value="autorizados">✓ Solo los expedientes autorizados ({avaluos.filter(a => a.estado === 'autorizado' || a.estado === 'completado').length})</option>
              </select>
            </div>

            {/* Plantillas Rápidas sugeridas */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                <Sparkles size={13} style={{ display: 'inline', marginRight: '4px', color: '#d97706' }} />
                2. Plantillas rápidas de columnas
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {REPORT_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.fields)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fila 2: Selector Desplegable de Variables / Campos */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                  <Layers size={15} style={{ display: 'inline', marginRight: '5px', color: '#2563eb' }} />
                  Variables seleccionadas para el Excel ({selectedFields.length} columnas)
                </span>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                  Añada más campos desde la lista desplegable o haga clic en la (x) para removerlos.
                </p>
              </div>

              {/* Botones de acción rápida sobre campos */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.55rem', cursor: 'pointer' }}
                >
                  Seleccionar Todas
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.55rem', cursor: 'pointer' }}
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Desplegable para Agregar Variable */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <select
                className="form-select"
                value={fieldToAdd}
                onChange={handleAddFieldFromSelect}
                style={{ flex: 1, fontSize: '0.82rem', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1.5px solid #2563eb' }}
              >
                <option value="">➕ Seleccione un campo adicional para agregarlo al reporte...</option>
                {AVAILABLE_REPORT_FIELDS
                  .filter(f => !selectedFields.includes(f.id))
                  .map(f => (
                    <option key={f.id} value={f.id}>
                      [{f.category}] {f.label}
                    </option>
                  ))}
              </select>
            </div>

            {/* Pills de campos actualmente seleccionados */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '140px', overflowY: 'auto', padding: '4px 0' }}>
              {selectedFields.map(fieldId => {
                const fieldObj = AVAILABLE_REPORT_FIELDS.find(f => f.id === fieldId) || { label: fieldId };
                return (
                  <span
                    key={fieldId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '9999px',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                  >
                    <span>{fieldObj.label}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleField(fieldId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Quitar esta columna"
                    >
                      <X size={13} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Fila 3: Vista Previa de la Tabla (primeros 5 registros) */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
              style={{ 
                background: '#f8fafc', 
                padding: '0.6rem 1rem', 
                borderBottom: '1px solid #cbd5e1',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                <Eye size={15} color="#2563eb" />
                <span>Vista Previa del Formato Excel ({expedientesParaReporte.length} filas en total)</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Mostrando los primeros 4 expedientes de muestra
              </span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '240px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ background: selectedTenantId === 'cverde' ? '#004e3b' : '#0d2847', color: '#ffffff' }}>
                    <th style={{ padding: '0.5rem 0.6rem', textAlign: 'center', width: '35px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>#</th>
                    {activeColumnsList.map(col => (
                      <th key={col.id} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expedientesParaReporte.slice(0, 4).map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                      <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{idx + 1}</td>
                      {activeColumnsList.map(col => {
                        const val = getFieldValue(item, col.id);
                        const isCurGTQ = col.isCurrencyGTQ;
                        const isCurUSD = col.isCurrencyUSD;

                        return (
                          <td 
                            key={col.id} 
                            style={{ 
                              padding: '0.45rem 0.75rem', 
                              whiteSpace: 'nowrap',
                              borderRight: '1px solid #e2e8f0',
                              textAlign: (isCurGTQ || isCurUSD) ? 'right' : 'left',
                              fontWeight: col.id === 'codigo' ? 700 : 'normal',
                              color: col.id === 'codigo' ? (selectedTenantId === 'cverde' ? '#004e3b' : '#0d2847') : '#0f172a'
                            }}
                          >
                            {isCurGTQ ? `Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                             isCurUSD ? `$ ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                             val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div 
          style={{
            padding: '1rem 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Se generará un archivo Excel nativo con <strong>{expedientesParaReporte.length} expedientes</strong> y <strong>{selectedFields.length} columnas</strong>, con el membrete y logo oficial.
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleExportToExcel}
              disabled={isExporting || selectedFields.length === 0 || expedientesParaReporte.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: selectedTenantId === 'cverde' ? 'linear-gradient(135deg, #007956 0%, #004e3b 100%)' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.35rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: (isExporting || selectedFields.length === 0 || expedientesParaReporte.length === 0) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.15s ease',
                opacity: (isExporting || selectedFields.length === 0 || expedientesParaReporte.length === 0) ? 0.6 : 1
              }}
            >
              <Download size={18} />
              <span>{isExporting ? 'Generando Excel...' : 'Descargar Reporte en Excel (.xls)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

