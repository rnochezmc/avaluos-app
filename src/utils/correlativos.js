/**
 * Módulo de Correlativos Oficiales Automáticos para Expedientes de Avalúos
 * Estructura estándar obligatoria: XX-YYYY-00000 (Ej: LR-2026-10041, CV-2026-10051)
 */

export const BASE_START_LEX_ROSAM = 10041;
export const BASE_START_CVERDE = 10051;

/**
 * Obtiene el prefijo oficial de 2 letras de la empresa (LR o CV)
 */
export function getTenantPrefix(tenantId) {
  const t = (tenantId || '').toLowerCase();
  return (t === 'cverde' || t === 'cv') ? 'CV' : 'LR';
}

/**
 * Obtiene el año actual de 4 dígitos
 */
export function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Formatea un número a un string de al menos 5 dígitos con ceros a la izquierda si fuera menor a 10000
 */
export function formatCorrelativoNumber(num) {
  const n = parseInt(num, 10);
  if (isNaN(n) || n < 0) return '10041';
  return n.toString().padStart(5, '0');
}

/**
 * Ensambla el código oficial estandarizado: XX-YYYY-00000
 */
export function buildCodigo(tenantId, number, year = getCurrentYear()) {
  const prefix = getTenantPrefix(tenantId);
  const formattedNum = formatCorrelativoNumber(number);
  return `${prefix}-${year}-${formattedNum}`;
}

/**
 * Extrae de forma robusta el número correlativo de cualquier código (incluso con prefijos antiguos como AVALUO)
 */
export function extractCorrelativoNumber(codigo) {
  if (!codigo || typeof codigo !== 'string') return 0;
  // Extrae el último grupo de dígitos numéricos del código (soporta 3 a 6 dígitos)
  const match = codigo.match(/(\d{3,6})(?!.*\d)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

/**
 * Calcula el siguiente correlativo sugerido para una empresa basándose en la lista de avaluos existentes
 */
export function getNextCorrelativoNumber(tenantId, avaluosList = []) {
  const isTargetCV = getTenantPrefix(tenantId) === 'CV';
  const baseStart = isTargetCV ? BASE_START_CVERDE : BASE_START_LEX_ROSAM;

  if (!Array.isArray(avaluosList) || avaluosList.length === 0) {
    return baseStart;
  }

  // Filtrar expedientes pertenecientes estrictamente a esta empresa
  const usedNumbers = new Set();

  avaluosList.forEach(item => {
    if (!item) return;
    const isItemCV = item.tenantId === 'cverde' || item.tenantId === 'cv' || (item.codigo && item.codigo.startsWith('CV-'));

    // Separación estricta entre Lex Rosam y C Verde
    if (isTargetCV === isItemCV) {
      const num = extractCorrelativoNumber(item.codigo);
      if (num >= 1000) {
        usedNumbers.add(num);
      }
    }
  });

  // Encontrar el siguiente número disponible a partir de la base
  let candidate = baseStart;
  while (usedNumbers.has(candidate)) {
    candidate++;
  }

  return candidate;
}

/**
 * Genera el siguiente código completo listo para usar (Ej: LR-2026-10041)
 */
export function getNextCodigo(tenantId, avaluosList = []) {
  const nextNum = getNextCorrelativoNumber(tenantId, avaluosList);
  return buildCodigo(tenantId, nextNum);
}

/**
 * Control de Concurrencia y Verificación de No-Duplicados al Guardar.
 * Si dos personas intentan guardar con el mismo código, resuelve de forma atómica el siguiente número libre.
 */
export function resolveUniqueCodigo(desiredCodigo, tenantId, avaluosList = [], currentAvaluoId = null) {
  if (!desiredCodigo || typeof desiredCodigo !== 'string') {
    return {
      codigo: getNextCodigo(tenantId, avaluosList),
      wasConflict: false
    };
  }

  // Normalizar código objetivo
  const cleanDesired = desiredCodigo.trim().toUpperCase();

  // Verificar si existe conflicto con otro expediente diferente al actual
  const hasConflict = avaluosList.some(item => {
    if (!item) return false;
    // Si es el mismo documento que se está editando, no hay conflicto consigo mismo
    if (currentAvaluoId && item.id === currentAvaluoId) return false;
    const existingCode = (item.codigo || '').trim().toUpperCase();
    return existingCode === cleanDesired;
  });

  if (!hasConflict) {
    return {
      codigo: cleanDesired,
      wasConflict: false
    };
  }

  // Si hubo conflicto (otra persona guardó ese número mientras el usuario llenaba el formulario):
  const prefix = getTenantPrefix(tenantId);
  const year = getCurrentYear();
  let candidateNum = extractCorrelativoNumber(cleanDesired) + 1;
  const isCV = prefix === 'CV';
  const minBase = isCV ? BASE_START_CVERDE : BASE_START_LEX_ROSAM;
  if (candidateNum < minBase) candidateNum = minBase;

  const existingCodesSet = new Set(
    avaluosList
      .filter(it => it && (!currentAvaluoId || it.id !== currentAvaluoId))
      .map(it => (it.codigo || '').trim().toUpperCase())
  );

  let newCodigo = `${prefix}-${year}-${formatCorrelativoNumber(candidateNum)}`;
  while (existingCodesSet.has(newCodigo)) {
    candidateNum++;
    newCodigo = `${prefix}-${year}-${formatCorrelativoNumber(candidateNum)}`;
  }

  return {
    codigo: newCodigo,
    wasConflict: true,
    previousCodigo: cleanDesired
  };
}

/**
 * Genera el siguiente correlativo automático para Certificaciones de Valor.
 * Nomenclatura obligatoria oficial: XX-YYYY-00000 (Ej: CV-2026-00015, CV-2026-00016, LR-2026-00001)
 * Para C Verde: los números 1 al 14 quedan reservados/disponibles para correcciones de expedientes anteriores.
 * El correlativo automático continúa en 15 (o en el siguiente al máximo existente).
 */
export function getNextCertificacionCodigo(tenantId, avaluosList = []) {
  const prefix = getTenantPrefix(tenantId);
  const year = getCurrentYear();
  const isTargetCV = prefix === 'CV';

  const usedNumbers = new Set();
  let maxNumber = 0;

  if (Array.isArray(avaluosList)) {
    avaluosList.forEach(item => {
      if (!item) return;
      // Una certificación de valor es estrictamente un registro de tipo Certificación o que tiene objeto certificacion
      // NUNCA debe incluir avalúos ordinarios (que usan series independientes 10000+)
      const isCert = item.tipoAvaluo === 'Certificación de Valor' || 
                     item.tipoAvaluo === 'Certificación' || 
                     Boolean(item.certificacion);
      
      if (isCert) {
        const isItemCV = item.tenantId === 'cverde' || item.tenantId === 'cv' || (item.codigo && item.codigo.startsWith('CV-'));
        if (isTargetCV === isItemCV) {
          const code = item.codigo || item.numeroReferencia || item.certificacion?.numeroReferencia || '';
          const num = extractCorrelativoNumber(code);
          // Las series de certificaciones son independientes y no deben mezclarse con números de avalúos (> 5000)
          if (num > 0 && num < 5000) {
            usedNumbers.add(num);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      }
    });
  }

  let candidate;
  if (isTargetCV) {
    // Si no existe la 15 aún, arranca en 15. Si ya existe la 15 (o superior), continúa en maxNumber + 1.
    const baseMin = 15;
    if (maxNumber < baseMin) {
      candidate = baseMin;
    } else {
      candidate = maxNumber + 1;
    }
    while (usedNumbers.has(candidate)) {
      candidate++;
    }
  } else {
    candidate = 1;
    while (usedNumbers.has(candidate)) {
      candidate++;
    }
  }

  return `${prefix}-${year}-${formatCorrelativoNumber(candidate)}`;
}
