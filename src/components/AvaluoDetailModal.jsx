import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Printer, Edit3, MapPin, Building, Calendar, Sparkles, 
  CheckCircle, FileText, Camera, DollarSign, Scale, ExternalLink,
  ShieldCheck, AlertTriangle, ArrowRight, CornerDownLeft, Download, Trash2,
  Upload, Loader, ZoomIn
} from 'lucide-react';
import { SERVICIOS_INFRAESTRUCTURA_LIST } from '../data/serviciosConstants';
import { convertPdfOrImageToPageImages } from '../utils/pdfHelper';
import { fetchRgpPagesFromCloud, fetchFotosFromCloud } from '../firebase';
import { getAvaluoFromLocalDb } from '../utils/localDb';
import { DEFAULT_DICTAMEN_GARANTIA } from '../data/mockAvaluos';
import { getTenantConfig } from '../data/tenantsConfig';

export default function AvaluoDetailModal({ 
  avaluo, 
  onClose, 
  onEdit, 
  onPrint, 
  currentRole = 'autorizador',
  onStatusChange,
  onRemovePdf,
  onUploadPdf,
  onUpdateField
}) {
  const avaluoTenant = getTenantConfig(avaluo?.tenantId || (avaluo?.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam'));
  const [activeTab, setActiveTab] = useState('registral');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [previewPageImage, setPreviewPageImage] = useState(null);
  const [hydratedConsultasPdfs, setHydratedConsultasPdfs] = useState(avaluo?.consultasPdfs || []);
  const [hydratedFotos, setHydratedFotos] = useState(avaluo?.fotos || {});
  const [isEditingNota, setIsEditingNota] = useState(false);
  const [notaText, setNotaText] = useState(avaluo?.notaDireccion || avaluo?.nota || 'Inmueble plenamente identificado en inspección física de campo.');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setNotaText(avaluo?.notaDireccion || avaluo?.nota || 'Inmueble plenamente identificado en inspección física de campo.');
  }, [avaluo?.notaDireccion, avaluo?.nota]);

  const getInitialLimitacionesCheck = (av) => ({
    gravamenes: av?.limitacionesCheck?.gravamenes || (av?.gravamenes && !/libre|ningun/i.test(av.gravamenes.trim()) ? 'Si' : 'Si'),
    servidumbres: av?.limitacionesCheck?.servidumbres || (av?.servidumbres && !/sin servidumbres|no aplica|ningun/i.test(av.servidumbres.trim()) ? 'Si' : 'Si'),
    areasComunes: av?.limitacionesCheck?.areasComunes || (av?.areasComunes && !/no aplica|sin areas|ningun/i.test(av.areasComunes.trim()) ? 'Si' : 'Si'),
    desmembracion: av?.limitacionesCheck?.desmembracion || (av?.desmembracion && !/sin desmembracion|no aplica|ningun/i.test(av.desmembracion.trim()) && !/elementos comunes|areas comunes/i.test(av.desmembracion.trim()) ? 'Si' : 'No'),
    copropiedad: av?.limitacionesCheck?.copropiedad || ((av?.tipoAvaluo === 'Apartamento / PH' || av?.tipoAvaluo === 'Apartamento' || (av?.limitaciones && /copropiedad|propiedad horizontal/i.test(av.limitaciones))) ? 'Si' : 'Si')
  });

  const [localLimitacionesCheck, setLocalLimitacionesCheck] = useState(() => getInitialLimitacionesCheck(avaluo));

  useEffect(() => {
    if (avaluo) {
      setLocalLimitacionesCheck(getInitialLimitacionesCheck(avaluo));
    }
  }, [avaluo]);

  const handleToggleLimitacionItem = (key, val) => {
    const updated = { ...localLimitacionesCheck, [key]: val };
    setLocalLimitacionesCheck(updated);
    if (onUpdateField && avaluo?.id) {
      onUpdateField(avaluo.id, { limitacionesCheck: updated });
    }
  };

  // Hidratar páginas y dataUrls de RGP desde la nube o IndexedDB si vienen compactadas
  useEffect(() => {
    let isMounted = true;
    const rawList = avaluo?.consultasPdfs || [];

    if (rawList.length === 0 && avaluo?.id) {
      fetchRgpPagesFromCloud(avaluo.id).then(cloudPages => {
        if (!isMounted || !cloudPages || cloudPages.length === 0) return;
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
        setHydratedConsultasPdfs(docs);
      }).catch(e => console.warn('Error fetching cloud RGP pages in detail modal:', e));
      return;
    }

    const needsData = rawList.some(d => Array.isArray(d.pages) && d.pages.some(p => !p.dataUrl));
    if (needsData && avaluo?.id) {
      getAvaluoFromLocalDb(avaluo.id).then(local => {
        if (local?.consultasPdfs?.some(d => d.pages?.some(p => p.dataUrl))) {
          if (isMounted) setHydratedConsultasPdfs(local.consultasPdfs);
          return;
        }
        return fetchRgpPagesFromCloud(avaluo.id).then(cloudPages => {
          if (!isMounted || !cloudPages || cloudPages.length === 0) return;
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
          if (isMounted) setHydratedConsultasPdfs(merged);
        });
      }).catch(e => console.warn('Error hydrating RGP pages:', e));
    } else {
      setHydratedConsultasPdfs(rawList);
    }

    return () => { isMounted = false; };
  }, [avaluo?.consultasPdfs, avaluo?.id]);

  // Hidratar fotos desde Firestore fotosGallery y IndexedDB
  useEffect(() => {
    let isMounted = true;
    setHydratedFotos(avaluo?.fotos || {});

    if (avaluo?.id) {
      // 1. IndexedDB local
      getAvaluoFromLocalDb(avaluo.id).then(local => {
        if (!isMounted || !local?.fotos) return;
        setHydratedFotos(prev => {
          const merged = { ...(prev || {}) };
          ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
            const lList = Array.isArray(local.fotos[cat]) ? local.fotos[cat] : (local.fotos[cat] ? [local.fotos[cat]] : []);
            const mList = Array.isArray(merged[cat]) ? merged[cat] : (merged[cat] ? [merged[cat]] : []);
            if (lList.length > 0 && mList.length === 0) {
              merged[cat] = lList;
            }
          });
          return merged;
        });
      }).catch(() => {});

      // 2. Subcolección fotosGallery en Firestore (fotos de otros dispositivos)
      fetchFotosFromCloud(avaluo.id).then(cloudFotos => {
        if (!isMounted || !cloudFotos) return;
        setHydratedFotos(prev => {
          const merged = { ...(prev || {}) };
          ['entorno', 'ingreso', 'interior', 'ubicacion', 'croquis', 'dicabi'].forEach(cat => {
            const cList = Array.isArray(cloudFotos[cat]) ? cloudFotos[cat] : [];
            const mList = Array.isArray(merged[cat]) ? merged[cat] : (merged[cat] ? [merged[cat]] : []);
            if (cList.length > 0 && (mList.length === 0 || cList.length >= mList.length)) {
              merged[cat] = cList;
            }
          });
          return merged;
        });
      }).catch(err => console.warn('Error fetching cloud fotos in modal:', err));
    }

    return () => { isMounted = false; };
  }, [avaluo?.fotos, avaluo?.id]);

  const handlePhotoUploadFromModal = (category, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);

          setHydratedFotos(prev => {
            const currentList = Array.isArray(prev?.[category])
              ? prev[category]
              : (prev?.[category] ? [prev[category]] : []);
            const updatedCategory = [...currentList, compressedDataUrl];
            const updatedFotos = {
              ...prev,
              [category]: updatedCategory
            };
            if (onUpdateField && avaluo?.id) {
              onUpdateField(avaluo.id, { fotos: updatedFotos });
            }
            return updatedFotos;
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const handleRemovePhotoFromModal = (category, index) => {
    if (!window.confirm('¿Está seguro de eliminar esta fotografía?')) return;
    setHydratedFotos(prev => {
      const currentList = Array.isArray(prev?.[category])
        ? prev[category]
        : (prev?.[category] ? [prev[category]] : []);
      const updatedCategory = currentList.filter((_, i) => i !== index);
      const updatedFotos = {
        ...prev,
        [category]: updatedCategory
      };
      if (onUpdateField && avaluo?.id) {
        onUpdateField(avaluo.id, { fotos: updatedFotos });
      }
      return updatedFotos;
    });
  };

  const handlePdfUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingPdf(true);
    try {
      const newDocs = [];
      for (const file of files) {
        const pages = await convertPdfOrImageToPageImages(file);
        newDocs.push({
          id: `rgp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          fecha: new Date().toISOString().slice(0, 10),
          pages: pages
        });
      }
      if (onUploadPdf) {
        await onUploadPdf(avaluo.id, newDocs);
      }
    } catch (err) {
      console.error('Error al subir certificación RGP:', err);
      alert('Error al procesar el archivo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsUploadingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!avaluo) return null;

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

  const handlePrint = () => {
    if (onPrint) {
      onPrint(avaluo);
    } else {
      window.print();
    }
  };

  const handleAuthorize = () => {
    if (window.confirm(`¿Confirmar autorización del expediente ${avaluo.codigo} como Valuador Autorizado?`)) {
      if (onStatusChange) {
        onStatusChange(avaluo.id, 'autorizado', `Autorizado y firmado por ${avaluo.valuadorPrincipal || 'Lic. Aroldo Ruiz'}`);
      }
    }
  };

  const handleReturnToModify = () => {
    if (!rejectionComment.trim()) {
      alert('Por favor ingrese las observaciones o correcciones requeridas antes de regresar el avalúo.');
      return;
    }
    if (onStatusChange) {
      onStatusChange(avaluo.id, 'devuelto', rejectionComment.trim());
    }
    setIsRejecting(false);
    setRejectionComment('');
  };

  const handleSendToReview = () => {
    if (window.confirm(`¿Desea enviar el expediente ${avaluo.codigo} para autorización del Lic. Aroldo Ruiz?`)) {
      if (onStatusChange) {
        onStatusChange(avaluo.id, 'en_revision', 'Enviado por técnico para revisión y autorización');
      }
    }
  };

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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px' }}>
        
        {/* Modal Top Header with Tenant Branding */}
        <div className="modal-header" style={{ background: avaluoTenant.colores?.gradientModal || 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)' }}>
          <div className="modal-header-left">
            <div style={{ background: '#ffffff', borderRadius: '6px', padding: '3px 6px', display: 'flex', alignItems: 'center' }}>
              <img src={avaluoTenant.logoUrl || '/lex-rosam-logo.png'} alt={avaluoTenant.nombreCorto} style={{ height: '30px', width: 'auto', maxHeight: '30px' }} />
            </div>
            <div>
              <h2 style={{ color: '#ffffff' }}>EXPEDIENTE DE AVALÚO: {avaluo.codigo}</h2>
              <div className="modal-header-sub" style={{ color: '#cbd5e1' }}>
                {avaluoTenant.nombre} | {avaluo.solicitante} | {avaluo.tipoAvaluo}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="card-action-btn"
              onClick={handlePrint}
              title="Imprimir Expediente / Exportar a PDF"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'transparent' }}
            >
              <Printer size={15} />
              <span className="desktop-only">Imprimir (9 Páginas)</span>
            </button>
            <button
              type="button"
              className="card-action-btn"
              onClick={() => { onClose(); onEdit(avaluo); }}
              title="Editar Expediente"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', borderColor: 'transparent' }}
            >
              <Edit3 size={15} />
              <span className="desktop-only">Editar</span>
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status & Approval Action Ribbon */}
        <div style={{
          background: avaluo.estado === 'autorizado' ? '#eff6ff' : avaluo.estado === 'devuelto' ? '#fef2f2' : avaluo.estado === 'en_revision' ? '#fefce8' : '#f8fafc',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {avaluo.estado === 'autorizado' && (
              <>
                <ShieldCheck size={20} style={{ color: '#2563eb' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.85rem' }}>Expediente Autorizado</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Aprobado y certificado por {avaluo.valuadorPrincipal || 'Lic. Aroldo Ruiz'} ({avaluo.registroPrincipal || 'Reg. 2572-R-2026'})</div>
                </div>
              </>
            )}
            {avaluo.estado === 'devuelto' && (
              <>
                <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.85rem' }}>Devuelto para Modificación</span>
                  <div style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>
                    <strong>Observación:</strong> {avaluo.observacionesAutorizador || 'Verificar medidas y documentación.'}
                  </div>
                </div>
              </>
            )}
            {avaluo.estado === 'en_revision' && (
              <>
                <FileText size={20} style={{ color: '#d97706' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem' }}>Pendiente de Autorización</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Enviado por técnico para validación del aprobador</div>
                </div>
              </>
            )}
            {(avaluo.estado === 'borrador' || !avaluo.estado) && (
              <>
                <Edit3 size={20} style={{ color: '#64748b' }} />
                <div>
                  <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Borrador en Captura</span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Completar datos técnicos antes de enviar a autorización</div>
                </div>
              </>
            )}
          </div>

          {/* Workflow Buttons according to current role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentRole === 'autorizador' ? (
              <>
                {avaluo.estado !== 'autorizado' && (
                  <button
                    type="button"
                    onClick={handleAuthorize}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>Autorizar Avalúo</span>
                  </button>
                )}
                {avaluo.estado !== 'devuelto' && (
                  <button
                    type="button"
                    onClick={() => setIsRejecting(prev => !prev)}
                    style={{
                      background: '#ffffff',
                      color: '#b91c1c',
                      border: '1.5px solid #f87171',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CornerDownLeft size={15} />
                    <span>Regresar para Modificar</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {avaluo.estado !== 'autorizado' && avaluo.estado !== 'en_revision' && (
                  <button
                    type="button"
                    onClick={handleSendToReview}
                    style={{
                      background: '#0d2847',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <ArrowRight size={15} />
                    <span>Enviar a Autorización</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Regresar para Modificar (si Aroldo activó el botón) */}
        {isRejecting && (
          <div style={{ background: '#fef2f2', padding: '1rem 1.5rem', borderBottom: '2px solid #ef4444' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#991b1b', marginBottom: '0.4rem' }}>
              Indicar observaciones de modificación para el técnico de campo:
            </div>
            <textarea
              rows={2}
              className="form-input"
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Ej: Favor verificar el área desmembrada de la finca 2 y actualizar la foto de fachada..."
              style={{ width: '100%', marginBottom: '0.5rem', background: '#ffffff' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsRejecting(false)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReturnToModify}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirmar y Regresar Avalúo
              </button>
            </div>
          </div>
        )}

        {/* Modal Tabs Navigation */}
        <div style={{ padding: '0 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <div className="modal-tabs" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'registral' ? 'active' : ''}`}
              onClick={() => setActiveTab('registral')}
            >
              <FileText size={16} />
              <span>1. Solicitud & Fincas</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'valores' ? 'active' : ''}`}
              onClick={() => setActiveTab('valores')}
            >
              <DollarSign size={16} />
              <span>2. Valores & Firmas</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'terreno' ? 'active' : ''}`}
              onClick={() => setActiveTab('terreno')}
            >
              <MapPin size={16} />
              <span>3. Terreno & Colindancias</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'construccion' ? 'active' : ''}`}
              onClick={() => setActiveTab('construccion')}
            >
              <Building size={16} />
              <span>4. Construcción & Servicios</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
              onClick={() => setActiveTab('fotos')}
            >
              <Camera size={16} />
              <span>5. Fotos & PDFs RGP</span>
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'legal' ? 'active' : ''}`}
              onClick={() => setActiveTab('legal')}
            >
              <Scale size={16} />
              <span>6. Dictamen {avaluoTenant.nombreCorto}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* TAB 1: INFORMACIÓN GENERAL Y REGISTRAL */}
          {activeTab === 'registral' && (
            <div>
              <div className="form-section-title">
                <FileText size={16} />
                <span>Datos Generales de la Solicitud e Inspección</span>
              </div>
              <div className="form-grid-3">
                <div className="form-field">
                  <label className="form-label">Código de Expediente</label>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0d2847' }}>{avaluo.codigo}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Tipo de Avalúo</label>
                  <div style={{ fontWeight: 600 }}>{avaluo.tipoAvaluo}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Solicitante</label>
                  <div style={{ fontWeight: 600 }}>{avaluo.solicitante}</div>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Propietario Principal (Según RGP)</label>
                  <div style={{ fontWeight: 700, color: '#1e3a8a' }}>
                    {avaluo.propietarioPrincipal || avaluo.fincas?.[0]?.propietario || avaluo.bienMostradoPor || 'No asignado'}
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Bien Mostrado Por</label>
                  <div style={{ fontWeight: 600 }}>{avaluo.bienMostradoPor || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">DPI / Identificación</label>
                  <div>{avaluo.dpi || 'N/A'}</div>
                </div>
              </div>

              <div className="form-grid-4" style={{ marginTop: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Fecha de Solicitud</label>
                  <div>{formatDateDisplay(avaluo.fechaSolicitud) || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Fecha de Inspección Física</label>
                  <div style={{ fontWeight: 600, color: '#0d2847' }}>{avaluo.fechaInspeccion ? (formatDateDisplay(avaluo.fechaInspeccion) || avaluo.fechaInspeccion) : '-'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Fecha de Consulta a Distancia</label>
                  <div style={{ fontWeight: 600, color: '#16a34a' }}>
                    {formatDateDisplay(avaluo.fechaConsultaDistancia) || avaluo.fechaConsultaDistancia || formatDateDisplay(avaluo.fechaActualizacion) || avaluo.fechaActualizacion || '-'}
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Fecha de Actualización</label>
                  <div>{avaluo.fechaActualizacion ? (formatDateDisplay(avaluo.fechaActualizacion) || avaluo.fechaActualizacion) : '-'}</div>
                </div>
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label">Dirección Física o Catastral</label>
                  <div style={{ fontWeight: 500 }}>{avaluo.direccion || 'N/A'}</div>
                </div>
                <div className="form-field">
                  <label className="form-label">Dirección según IUSI</label>
                  <div style={{ fontWeight: 500, color: '#334155' }}>
                    {avaluo.direccionIusi || avaluo.iusiDireccion || avaluo.direccion || 'N/A'}
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Coordenadas GPS</label>
                  <div style={{ fontFamily: 'monospace', color: '#1e293b' }}>{avaluo.coordenadas || 'N/A'}</div>
                </div>
              </div>

              {/* Campo oficial NOTA de Identificación Física */}
              <div className="form-field" style={{ marginTop: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, color: '#0d2847' }}>
                    Nota
                  </label>
                  {onUpdateField && !isEditingNota && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingNota(true);
                        setNotaText(avaluo.notaDireccion || avaluo.nota || 'Inmueble plenamente identificado en inspección física de campo.');
                      }}
                      style={{ fontSize: '0.72rem', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '0.15rem 0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                    >
                      <Edit3 size={11} /> Editar Nota
                    </button>
                  )}
                </div>
                {isEditingNota ? (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={notaText}
                      onChange={(e) => setNotaText(e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateField(avaluo.id, { notaDireccion: notaText, nota: notaText });
                        setIsEditingNota(false);
                      }}
                      style={{ background: '#0d2847', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '0 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingNota(false)}
                      style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div style={{ fontWeight: 500, color: '#1e293b', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span>{avaluo.notaDireccion || avaluo.nota || 'Inmueble plenamente identificado en inspección física de campo.'}</span>
                  </div>
                )}
              </div>

              {avaluo.descripcionGeneral && (
                <div className="form-field" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Descripción General del Inmueble</label>
                  <div style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {avaluo.descripcionGeneral}
                  </div>
                </div>
              )}

              {/* Fincas Registradas con Áreas Individuales */}
              <div className="form-section-title" style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={16} />
                  <span>Información Registral y Desglose de Fincas</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  Consulta a distancia: <span style={{ color: '#0d2847' }}>{formatDateDisplay(avaluo.fechaConsultaDistancia) || avaluo.fechaConsultaDistancia || formatDateDisplay(avaluo.fechaActualizacion) || avaluo.fechaActualizacion || 'Pendiente'}</span>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th>FINCA</th>
                      <th>FOLIO</th>
                      <th>LIBRO</th>
                      <th>PROPIETARIO</th>
                      <th>ORIG. REGISTRADA</th>
                      <th>DESMEMBRADA</th>
                      <th>ACT. REGISTRADA</th>
                      <th>VALUADA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fincas.map((f, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{f.finca}</td>
                        <td>{f.folio}</td>
                        <td>{f.libro}</td>
                        <td>{f.propietario || avaluo.propietarioPrincipal}</td>
                        <td>{Number(f.areaRegistrada || 0).toFixed(6)} m²</td>
                        <td style={{ color: Number(f.areaDesmembrada) > 0 ? '#b91c1c' : 'inherit' }}>
                          {Number(f.areaDesmembrada || 0).toFixed(6)} m²
                        </td>
                        <td style={{ fontWeight: 600 }}>{Number(f.areaActualRegistrada || f.areaRegistrada || 0).toFixed(6)} m²</td>
                        <td style={{ fontWeight: 700, color: '#0d2847' }}>{Number(f.areaValuada || 0).toFixed(6)} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Desglose de Direcciones según el RGP por Finca */}
              <div style={{ marginTop: '0.85rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d2847', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={14} />
                  <span>Dirección según el RGP por Finca (Cuadro Oficial Página 4):</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {fincas.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: 700, color: '#0d2847', minWidth: '95px' }}>Finca {f.finca || (i + 1)}:</span>
                      <span style={{ color: '#334155' }}>
                        {f.direccionRgp || f.direccionRegistral || (fincas.length === 1 ? avaluo.direccion : (f.dicabiDireccion || avaluo.direccion || 'Sin dirección registral individual registrada.'))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aspectos Legales con Textos Amplios */}
              <div className="form-section-title" style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={16} />
                  <span>Aspectos Legales y Gravámenes (Cuadro Oficial LIMITACIONES Página 4)</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Anotaciones y Gravámenes:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>{avaluo.gravamenes || 'Libre de gravámenes vigentes.'}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Servidumbres:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>{avaluo.servidumbres || 'Sin servidumbres activas.'}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Áreas Comunes:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>{avaluo.areasComunes || 'No aplica'}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Desmembración:</strong>
                  <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px', fontWeight: 500 }}>{avaluo.desmembracion || 'Sin desmembraciones pendientes.'}</div>
                </div>
                <div style={{ 
                  gridColumn: '1 / -1', 
                  padding: '0.65rem 0.85rem', 
                  background: '#f8fafc', 
                  borderRadius: '6px', 
                  border: '1px solid #cbd5e1',
                  marginTop: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d2847', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    📋 Limitaciones Oficiales (Página 2):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { key: 'gravamenes', label: 'Anotaciones y gravámenes' },
                      { key: 'servidumbres', label: 'Servidumbres' },
                      { key: 'areasComunes', label: 'Áreas comunes' },
                      { key: 'desmembracion', label: 'Desmembración' },
                      { key: 'copropiedad', label: 'Régimen de copropiedad' }
                    ].map(item => {
                      const currentVal = localLimitacionesCheck[item.key] || 'No';
                      return (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{item.label}:</span>
                          <div style={{ display: 'inline-flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleLimitacionItem(item.key, 'Si')}
                              style={{
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: currentVal === 'Si' ? '#0d2847' : '#ffffff',
                                color: currentVal === 'Si' ? '#ffffff' : '#64748b'
                              }}
                            >
                              Si
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleLimitacionItem(item.key, 'No')}
                              style={{
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                border: 'none',
                                borderLeft: '1px solid #cbd5e1',
                                cursor: 'pointer',
                                background: currentVal === 'No' ? '#0d2847' : '#ffffff',
                                color: currentVal === 'No' ? '#ffffff' : '#64748b'
                              }}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {avaluo.limitaciones && (
                  <div style={{ gridColumn: '1 / -1', paddingTop: '0.25rem' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Otras Limitaciones Registrales:</strong>
                    <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px' }}>{avaluo.limitaciones}</div>
                  </div>
                )}
                {avaluo.anotaciones && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#475569' }}>Anotaciones de Demanda o Embargo:</strong>
                    <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '2px' }}>{avaluo.anotaciones}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VALORES & FIRMAS */}
          {activeTab === 'valores' && (
            <div>
              <div className="form-section-title">
                <DollarSign size={16} />
                <span>Valores Comerciales y Bancarios Certificados</span>
              </div>

              <div className="form-grid-2">
                <div style={{ background: '#f0f4f9', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0d2847' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>VALOR COMERCIAL TOTAL</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d2847', marginTop: '4px' }}>
                    {formatQ(avaluo.valorComercialGTQ)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginTop: '2px' }}>
                    {formatUSD(avaluo.valorComercialUSD)} USD
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    Tipo de cambio oficial Banguat: {avaluo.tipoCambio || 7.62581}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>VALOR BANCARIO SUGERIDO (80%)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                    {formatQ(avaluo.valorBancarioGTQ)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                    {formatUSD(avaluo.valorBancarioUSD)} USD
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    Base estándar para otorgamiento de crédito hipotecario
                  </div>
                </div>
              </div>

              {/* Valuadores Autorizados */}
              <div className="form-section-title" style={{ marginTop: '2rem' }}>
                <ShieldCheck size={16} />
                <span>Profesionales Valuadores Autorizados</span>
              </div>
              <div className="form-grid-2" style={{ gridTemplateColumns: avaluo.incluirFirmaRevisor === false ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Valuador Principal</div>
                    <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Firma Oficial</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d2847' }}>{avaluo.valuadorPrincipal || 'Lic. Aroldo Oliverio Ruiz Orozco'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>{avaluo.registroPrincipal || 'Valuador autorizado 2572-R-2026'}</div>
                  <div style={{ marginTop: '0.35rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '6px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <img src="/signatures/firma_aroldo_ruiz.png" alt="Firma Aroldo Ruiz" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                  </div>
                </div>
                {avaluo.incluirFirmaRevisor !== false && (
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Valuador Revisor</div>
                      <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#004e3b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Segundo Firmante</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d2847' }}>
                      {avaluo.valuadorRevisor && !avaluo.valuadorRevisor.includes('Tolaque') && !avaluo.valuadorRevisor.includes('Morales Solares') ? avaluo.valuadorRevisor : 'Lic. Edgar Rolando Martínez Larios'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>
                      {avaluo.registroRevisor && !avaluo.registroRevisor.includes('193-T-93') && !avaluo.registroRevisor.includes('412-T-2018') ? avaluo.registroRevisor : 'Valuador autorizado 2571-M-2026'}
                    </div>
                    <div style={{ marginTop: '0.35rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '6px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                      <img src="/signatures/firma_edgar_martinez.png" alt="Firma Edgar Martínez" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TERRENO & COLINDANCIAS */}
          {activeTab === 'terreno' && (
            <div>
              {avaluo.aplicaTerreno === false && (
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#fef2f2', borderRadius: '8px', border: '1.5px solid #ef4444', color: '#991b1b', fontSize: '0.88rem' }}>
                  🏢 <strong>Terreno Omitido (No Aplica):</strong> Este avalúo fue configurado sin terreno independiente (Régimen de Propiedad Horizontal). Las secciones de terreno y colindancias se omiten en el informe oficial PDF y su valor es Q. 0.00.
                </div>
              )}
              <div className="form-section-title">
                <MapPin size={16} />
                <span>Valoración de Terreno con Fincas y Varas Cuadradas</span>
              </div>

              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#0d2847', color: '#ffffff' }}>
                      <th style={{ color: '#ffffff' }}>FINCA</th>
                      <th style={{ color: '#ffffff' }}>ÁREA (m²)</th>
                      <th style={{ color: '#ffffff' }}>EQUIV. VARAS² (v²)</th>
                      <th style={{ color: '#ffffff' }}>UNIDAD</th>
                      <th style={{ color: '#ffffff' }}>VALOR UNITARIO</th>
                      <th style={{ color: '#ffffff' }}>SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terrainItems.map((item, i) => {
                      const area = Number(item.area || 0);
                      const varas = Number(item.varasCuadradas || (area * 1.43115));
                      const unit = Number(item.valorUnitario || 0);
                      const subtotal = item.total != null ? Number(item.total) : (area * unit);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{item.finca || `Finca ${i + 1}`}</td>
                          <td>{area.toFixed(2)}</td>
                          <td style={{ fontWeight: 600, color: '#1e40af' }}>
                            {varas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td>{item.unidad || 'm²'}</td>
                          <td>{formatQ(unit)}</td>
                          <td style={{ fontWeight: 700 }}>{formatQ(subtotal)}</td>
                        </tr>
                      );
                    })}
                    {terrainItems.length > 1 && (
                      <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                        <td>TOTAL:</td>
                        <td>{totalTerrenoArea.toFixed(2)}</td>
                        <td style={{ color: '#1e40af' }}>
                          {totalTerrenoVaras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>m²</td>
                        <td>-</td>
                        <td style={{ color: '#1e40af' }}>{formatQ(totalTerrenoSubtotal)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Valoración Bancaria de Terreno (80% Máximo de Garantía) */}
              {avaluo.aplicaTerreno !== false && (
                <>
                  <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                    <DollarSign size={16} />
                    <span>Valoración Bancaria de Terreno</span>
                  </div>
                  <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                    <table className="data-table">
                      <thead>
                        <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                          <th style={{ color: '#ffffff' }}>FINCA</th>
                          <th style={{ color: '#ffffff' }}>ÁREA (m²)</th>
                          <th style={{ color: '#ffffff' }}>EQUIV. VARAS² (v²)</th>
                          <th style={{ color: '#ffffff' }}>UNIDAD</th>
                          <th style={{ color: '#ffffff' }}>VALOR UNITARIO (80%)</th>
                          <th style={{ color: '#ffffff' }}>SUBTOTAL (80%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {terrainItems.map((item, i) => {
                          const area = Number(item.area || 0);
                          const varas = Number(item.varasCuadradas || (area * 1.43115));
                          const unit80 = parseFloat((Number(item.valorUnitario || 0) * 0.8).toFixed(2));
                          const subtotal80 = parseFloat(((item.total != null ? Number(item.total) : (area * Number(item.valorUnitario || 0))) * 0.8).toFixed(2));
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 700 }}>{item.finca || `Finca ${i + 1}`}</td>
                              <td>{area.toFixed(2)}</td>
                              <td style={{ fontWeight: 600, color: '#1e40af' }}>
                                {varas.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td>{item.unidad || 'm²'}</td>
                              <td>{formatQ(unit80)}</td>
                              <td style={{ fontWeight: 700 }}>{formatQ(subtotal80)}</td>
                            </tr>
                          );
                        })}
                        {terrainItems.length > 1 && (
                          <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                            <td>TOTAL BANCARIO:</td>
                            <td>{totalTerrenoArea.toFixed(2)}</td>
                            <td style={{ color: '#1e40af' }}>
                              {totalTerrenoVaras.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td>m²</td>
                            <td>-</td>
                            <td style={{ color: '#1e40af' }}>{formatQ(totalTerrenoSubtotal * 0.8)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Colindancias según cantidad de fincas con Registral y Física */}
              <div className="form-section-title">
                <MapPin size={16} />
                <span>Colindancias Registrales y Físicas — {fincas.length} {fincas.length === 1 ? 'Cuadro' : 'Cuadros según fincas'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: fincas.length > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '1rem' }}>
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
                    <div key={i} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ background: '#0d2847', color: '#ffffff', padding: '0.4rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>
                        COLINDANCIAS{fincas.length > 1 ? ` — FINCA: ${f.finca || (i + 1)}` : ''}
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ width: '65px', padding: '0.35rem 0.5rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>Rumbo</th>
                            <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>Registral (RGP)</th>
                            <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left', fontWeight: 700, color: '#1e40af' }}>Física (In Situ)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Norte:</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>{rNorte}</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a' }}>{fNorte}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Sur:</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>{rSur}</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a' }}>{fSur}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Este:</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>{rEste}</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a' }}>{fEste}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Oeste:</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>{rOeste}</td>
                            <td style={{ padding: '0.35rem 0.5rem', color: '#0f172a' }}>{fOeste}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>

              {/* DICABI Independiente - Formato Oficial Aroldo según cantidad de fincas */}
              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <Building size={16} />
                <span>Dirección de Catastro y Avalúo de Bienes Inmuebles (DICABI) — {fincas.length} {fincas.length === 1 ? 'Cuadro' : 'Cuadros'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {fincas.map((f, i) => {
                  const isFirst = i === 0;
                  const fNombre = f.dicabiNombre || (isFirst ? (avaluo.dicabiNombre || '') : '') || '-';
                  const fDireccion = f.dicabiDireccion || (isFirst ? (avaluo.dicabiDireccion || '') : '') || '-';
                  const fMatricula = f.dicabiMatricula || (isFirst ? (avaluo.dicabiMatricula || '') : '') || '-';
                  const fArea = f.dicabiArea || (isFirst ? (avaluo.dicabiArea || '') : '') || '-';
                  const fObservaciones = f.dicabiObservaciones !== undefined && f.dicabiObservaciones !== '' 
                    ? f.dicabiObservaciones 
                    : (isFirst && avaluo.dicabiObservaciones ? avaluo.dicabiObservaciones : '-');

                  return (
                    <div key={i} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ background: '#0d2847', color: '#ffffff', padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', letterSpacing: '0.04em' }}>
                        DIRECCIÓN DE CATASTRO Y AVALÚO DE BIENES INMUEBLES (DICABI){fincas.length > 1 ? ` — FINCA: ${f.finca || (i + 1)}` : ''}
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ width: '135px', padding: '0.4rem 0.6rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                              Nombre:
                            </td>
                            <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a' }}>
                              {fNombre}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ width: '135px', padding: '0.4rem 0.6rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                              Dirección:
                            </td>
                            <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a' }}>
                              {fDireccion}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ width: '135px', padding: '0.4rem 0.6rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                              Matricula:
                            </td>
                            <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a' }}>
                              {fMatricula ? <strong>{fMatricula}</strong> : '-'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ width: '135px', padding: '0.4rem 0.6rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                              Área:
                            </td>
                            <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a' }}>
                              {fArea}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ width: '135px', padding: '0.4rem 0.6rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                              Observaciones:
                            </td>
                            <td style={{ padding: '0.4rem 0.6rem', color: '#0f172a' }}>
                              {fObservaciones}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CONSTRUCCIÓN & SERVICIOS */}
          {activeTab === 'construccion' && (
            <div>
              {/* Desglose Matricial de Construcción */}
              <div className="form-section-title">
                <Building size={16} />
                <span>Valoración Matricial de Construcción</span>
              </div>
              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#0d2847', color: '#ffffff' }}>
                      <th style={{ color: '#ffffff', textAlign: 'left' }}>DESCRIPCIÓN</th>
                      <th style={{ color: '#ffffff', textAlign: 'center' }}>ÁREA (m²)</th>
                      <th style={{ color: '#ffffff', textAlign: 'center' }}>UNIDAD</th>
                      <th style={{ color: '#ffffff', textAlign: 'right' }}>VALOR UNITARIO</th>
                      <th style={{ color: '#ffffff', textAlign: 'right' }}>SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(avaluo.desgloseConstruccion?.items && avaluo.desgloseConstruccion.items.length > 0 ? avaluo.desgloseConstruccion.items : [{
                      descripcion: 'Construcción Principal',
                      area: avaluo.desgloseConstruccion?.area || 0,
                      unidad: avaluo.desgloseConstruccion?.unidad || 'm²',
                      valorUnitario: avaluo.desgloseConstruccion?.valorUnitario || 0,
                      total: avaluo.desgloseConstruccion?.total || 0
                    }]).map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{c.descripcion || 'Construcción'}</td>
                        <td style={{ textAlign: 'center' }}>{Number(c.area || 0).toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>{c.unidad || 'm²'}</td>
                        <td style={{ textAlign: 'right' }}>{formatQ(c.valorUnitario)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQ(c.total != null ? c.total : (Number(c.area || 0) * Number(c.valorUnitario || 0)))}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                      <td>TOTAL CONSTRUCCIÓN:</td>
                      <td style={{ textAlign: 'center' }}>{Number(avaluo.desgloseConstruccion?.area || 0).toFixed(2)} m²</td>
                      <td style={{ textAlign: 'center' }}>m²</td>
                      <td style={{ textAlign: 'right' }}>-</td>
                      <td style={{ textAlign: 'right', color: '#1e40af' }}>{formatQ(avaluo.desgloseConstruccion?.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Desglose Bancario de Construcción al 80% */}
              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <DollarSign size={16} />
                <span>Valoración Bancaria de Construcción</span>
              </div>
              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                      <th style={{ color: '#ffffff', textAlign: 'left' }}>DESCRIPCIÓN</th>
                      <th style={{ color: '#ffffff', textAlign: 'center' }}>ÁREA (m²)</th>
                      <th style={{ color: '#ffffff', textAlign: 'center' }}>UNIDAD</th>
                      <th style={{ color: '#ffffff', textAlign: 'right' }}>VALOR UNITARIO (80%)</th>
                      <th style={{ color: '#ffffff', textAlign: 'right' }}>SUBTOTAL (80%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(avaluo.desgloseConstruccion?.items && avaluo.desgloseConstruccion.items.length > 0 ? avaluo.desgloseConstruccion.items : [{
                      descripcion: 'Construcción Principal',
                      area: avaluo.desgloseConstruccion?.area || 0,
                      unidad: avaluo.desgloseConstruccion?.unidad || 'm²',
                      valorUnitario: avaluo.desgloseConstruccion?.valorUnitario || 0,
                      total: avaluo.desgloseConstruccion?.total || 0
                    }]).map((c, i) => {
                      const unit80 = parseFloat((Number(c.valorUnitario || 0) * 0.8).toFixed(2));
                      const subtotal80 = parseFloat(((c.total != null ? Number(c.total) : (Number(c.area || 0) * Number(c.valorUnitario || 0))) * 0.8).toFixed(2));
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{c.descripcion || 'Construcción'}</td>
                          <td style={{ textAlign: 'center' }}>{Number(c.area || 0).toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>{c.unidad || 'm²'}</td>
                          <td style={{ textAlign: 'right' }}>{formatQ(unit80)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQ(subtotal80)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                      <td>TOTAL CONSTRUCCIÓN BANCARIA:</td>
                      <td style={{ textAlign: 'center' }}>{Number(avaluo.desgloseConstruccion?.area || 0).toFixed(2)} m²</td>
                      <td style={{ textAlign: 'center' }}>m²</td>
                      <td style={{ textAlign: 'right' }}>-</td>
                      <td style={{ textAlign: 'right', color: '#1e40af' }}>{formatQ(Number(avaluo.desgloseConstruccion?.total || 0) * 0.8)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="form-section-title">
                <Building size={16} />
                <span>Características Físicas de la Construcción</span>
              </div>
              <div className="form-grid-3">
                <div><strong>Edad Aproximada:</strong> {avaluo.construccion?.edadAprox || '5 años'}</div>
                <div><strong>Estado Actual:</strong> {avaluo.construccion?.estadoActual || 'Bueno'}</div>
                <div><strong>Apropiada Sector:</strong> {avaluo.construccion?.apropiadaSector || 'Sí'}</div>
              </div>

              <div style={{ margin: '0.75rem 0' }}>
                <strong>Distribución:</strong> {avaluo.construccion?.distribucion || 'Ambientes completos'}
              </div>

              <div className="form-grid-3" style={{ marginTop: '0.75rem' }}>
                <div><strong>Estructura:</strong> {avaluo.construccion?.estructura}</div>
                <div><strong>Paredes:</strong> {avaluo.construccion?.paredes}</div>
                <div><strong>Techo:</strong> {avaluo.construccion?.techoEntrePiso}</div>
              </div>

              <div className="form-section-title" style={{ marginTop: '1.75rem' }}>
                <FileText size={16} />
                <span>Servicios e Infraestructura (31 Elementos Oficiales)</span>
              </div>
              <div className="form-grid-3" style={{ fontSize: '0.82rem', gap: '0.6rem' }}>
                {SERVICIOS_INFRAESTRUCTURA_LIST.map(srv => (
                  <div key={srv.key} style={{ background: '#f8fafc', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.73rem', display: 'block', fontWeight: 600 }}>{srv.label}:</span>
                    <strong style={{ color: '#0d2847', fontSize: '0.82rem' }}>
                      {avaluo.servicios?.[srv.key] !== undefined && avaluo.servicios?.[srv.key] !== '' ? avaluo.servicios[srv.key] : srv.defaultVal}
                    </strong>
                  </div>
                ))}
              </div>

              {avaluo.serviciosAdicionales?.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Servicios Adicionales:</strong> {avaluo.serviciosAdicionales.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FOTOS & PDFS RGP */}
          {activeTab === 'fotos' && (
            <div>
              <div className="form-section-title">
                <Camera size={16} />
                <span>Álbum Fotográfico Oficial</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                {[
                  { key: 'entorno', label: '1. Entorno Inmediato' },
                  { key: 'ingreso', label: '2. Ingreso / Fachada' },
                  { key: 'interior', label: '3. Interior de Inmueble' },
                  { key: 'ubicacion', label: '4. Ubicación Satelital' },
                  { key: 'croquis', label: '5. Croquis / Plano Catastral' },
                  { key: 'dicabi', label: '6. Boleta o Matrícula DICABI' }
                ].map(({ key, label }) => {
                  const raw = hydratedFotos?.[key] || avaluo.fotos?.[key];
                  const photoList = Array.isArray(raw)
                    ? raw.filter(u => u && typeof u === 'string' && u.trim().length > 0)
                    : (typeof raw === 'string' && raw.trim().length > 0 ? [raw] : []);

                  return (
                    <div key={key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Camera size={16} style={{ color: '#0d2847' }} />
                          <strong style={{ fontSize: '0.9rem', color: '#0d2847' }}>{label}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px', background: photoList.length > 0 ? '#dcfce7' : '#f1f5f9', color: photoList.length > 0 ? '#166534' : '#64748b' }}>
                            {photoList.length} {photoList.length === 1 ? 'foto' : 'fotos'}
                          </span>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, background: '#0d2847', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            <Camera size={12} />
                            <span>+ Subir Foto</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={(e) => handlePhotoUploadFromModal(key, e)} 
                              style={{ display: 'none' }} 
                            />
                          </label>
                        </div>
                      </div>

                      {photoList.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                          {photoList.map((src, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                              <img
                                src={src}
                                alt={`${label} ${idx + 1}`}
                                style={{ width: '100%', height: '140px', objectFit: key === 'croquis' || key === 'dicabi' ? 'contain' : 'cover', display: 'block', background: '#f8fafc' }}
                              />
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.25rem 0.5rem', background: 'rgba(13,40,71,0.85)', color: '#ffffff', fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Foto #{idx + 1}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <a href={src} target="_blank" rel="noreferrer" style={{ color: '#93c5fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <ExternalLink size={11} /> Ver
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhotoFromModal(key, idx)}
                                    style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem' }}
                                    title="Eliminar foto"
                                  >
                                    <Trash2 size={11} /> Borrar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '0.85rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', background: '#ffffff', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                          Sin registro fotográfico adjunto para esta sección
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Consultas Electrónicas RGP (PDFs o Imágenes) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem', marginBottom: '0.85rem' }}>
                <div className="form-section-title" style={{ margin: 0 }}>
                  <FileText size={16} />
                  <span>Consultas Electrónicas del Registro General de la Propiedad (PDFs Adjuntos)</span>
                </div>
                {onUploadPdf && (
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePdfUpload} 
                      accept="application/pdf,image/jpeg,image/png,image/webp" 
                      multiple 
                      style={{ display: 'none' }} 
                    />
                    <button
                      type="button"
                      disabled={isUploadingPdf}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: isUploadingPdf ? '#94a3b8' : '#0d2847',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: isUploadingPdf ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isUploadingPdf ? (
                        <>
                          <Loader size={14} className="spin" />
                          <span>Procesando archivo...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>+ Adjuntar Certificación RGP (PDF / Imagen)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {hydratedConsultasPdfs && hydratedConsultasPdfs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {hydratedConsultasPdfs.map((pdf, idx) => (
                    <div 
                      key={pdf.id || idx}
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={22} style={{ color: '#ef4444' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0d2847' }}>{pdf.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {pdf.size ? `Tamaño: ${pdf.size} • ` : ''}{pdf.fecha ? `Adjuntado el ${pdf.fecha} • ` : ''}
                              {pdf.pages && pdf.pages.length > 0 && (
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  {pdf.pages.length} {pdf.pages.length === 1 ? 'página' : 'páginas'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {pdf.dataUrl && (
                            <a 
                              href={pdf.dataUrl} 
                              download={pdf.name}
                              style={{
                                background: '#0d2847',
                                color: '#ffffff',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Download size={13} /> Descargar
                            </a>
                          )}
                          {onRemovePdf && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Está seguro de eliminar la certificación "${pdf.name}" de este expediente?`)) {
                                  onRemovePdf(avaluo.id, idx);
                                }
                              }}
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Eliminar certificación del expediente"
                            >
                              <Trash2 size={13} /> Eliminar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Vista previa de páginas individuales si existen */}
                      {pdf.pages && pdf.pages.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem', marginTop: '0.5rem', background: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          {pdf.pages.map((p, pIdx) => (
                            <div 
                              key={pIdx} 
                              onClick={() => {
                                if (p.dataUrl) {
                                  setPreviewPageImage({ dataUrl: p.dataUrl, name: `${pdf.name} (Pág. ${p.pageIndex || pIdx + 1})` });
                                }
                              }}
                              title="Clic para ampliar documento"
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                background: '#f8fafc', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '6px', 
                                overflow: 'hidden', 
                                cursor: p.dataUrl ? 'pointer' : 'default',
                                position: 'relative'
                              }}
                            >
                              <div style={{ height: '140px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {p.dataUrl ? (
                                  <>
                                    <img src={p.dataUrl} alt={`Página ${p.pageIndex || pIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(13,40,71,0.75)', color: '#fff', borderRadius: '3px', padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                                      <ZoomIn size={12} />
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.7rem' }}>
                                    <Loader size={16} className="spin" />
                                    <span>Cargando...</span>
                                  </div>
                                )}
                              </div>
                              <div style={{ padding: '3px 6px', background: '#e2e8f0', fontSize: '0.68rem', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                                Pág. {p.pageIndex || pIdx + 1} de {p.totalPaginas || pdf.pages.length}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : pdf.dataUrl && pdf.dataUrl.startsWith('data:image/') ? (
                        <div style={{ maxWidth: '140px', marginTop: '0.5rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer' }}
                          onClick={() => setPreviewPageImage({ dataUrl: pdf.dataUrl, name: pdf.name })}
                        >
                          <img src={pdf.dataUrl} alt={pdf.name} style={{ width: '100%', height: '140px', objectFit: 'contain' }} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '0.85rem', 
                  padding: '1.25rem', 
                  background: '#f8fafc', 
                  border: '1.5px dashed #cbd5e1', 
                  borderRadius: '8px', 
                  textAlign: 'center' 
                }}>
                  <p style={{ margin: '0 0 0.6rem 0' }}>No se han adjuntado certificaciones electrónicas en PDF para este expediente.</p>
                  {onUploadPdf && (
                    <button
                      type="button"
                      disabled={isUploadingPdf}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '5px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Seleccionar archivo PDF o imagen ahora
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DICTAMEN LEGAL TENANT */}
          {activeTab === 'legal' && (
            <div>
              <div className="form-section-title">
                <Scale size={16} />
                <span>Dictamen Bancario y Consideraciones Generales {avaluoTenant.nombre}</span>
              </div>

              <div style={{ padding: '1.25rem', background: avaluoTenant.id === 'cverde' ? '#ecfdf5' : '#eff6ff', borderRadius: '8px', border: `1.5px solid ${avaluoTenant.colores?.primary || '#2563eb'}`, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ color: avaluoTenant.colores?.primary || '#1e40af' }}>Dictamen de Garantía Oficial (Pág. 6):</strong>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEdit(avaluo);
                      }}
                      style={{ background: '#ffffff', color: avaluoTenant.colores?.primary || '#1e40af', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={13} /> Editar Dictamen
                    </button>
                  )}
                </div>
                <p style={{ marginTop: '0.4rem', color: '#0f172a', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {avaluo.dictamenGarantia || avaluoTenant.dictamenDefault || DEFAULT_DICTAMEN_GARANTIA}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                <p><strong>I.</strong> El bien valuado puede ser considerado como sujeto de garantía.</p>
                <p><strong>II.</strong> El presente avalúo se emite como una opinión técnica fundamentada en criterios profesionales y de buena fe.</p>
                <p><strong>III.</strong> El informe se emite con fines informativos de garantía crediticia.</p>
                <p><strong>IV.</strong> Datos registrales verificados mediante consulta electrónica oficial del Registro de la Propiedad.</p>
                <p><strong>V.</strong> {avaluoTenant.nombre} es una entidad independiente y no mantiene vínculo con las partes intervinientes.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar Ficha
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handlePrint}
            style={{ background: avaluoTenant.colores?.primary || '#0d2847' }}
          >
            <Printer size={15} style={{ display: 'inline', marginRight: '5px' }} />
            Imprimir Formato Oficial PDF
          </button>
        </div>
      </div>

      {/* Lightbox / Modal de Vista Previa en Tamaño Completo para Páginas RGP */}
      {previewPageImage && (
        <div 
          onClick={() => setPreviewPageImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 23, 43, 0.88)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', background: '#0d2847', color: '#ffffff' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{previewPageImage.name}</span>
              <button 
                type="button" 
                onClick={() => setPreviewPageImage(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
              <img 
                src={previewPageImage.dataUrl} 
                alt={previewPageImage.name} 
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
