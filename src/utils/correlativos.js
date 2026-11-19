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
  const isCV = getTenantPrefix(tenantId) === 'CV';
  const baseStart = isCV ? BASE_START_CVERDE : BASE_START_LEX_ROSAM;
  const targetPrefix = isCV ? 'CV' : 'LR';

  if (!Array.isArray(avaluosList) || avaluosList.length === 0) {
    return baseStart;
  }

  // Filtrar expedientes pertenecientes a esta empresa
  const usedNumbers = new Set();

  avaluosList.forEach(item => {
    if (!item) return;
    const rawTenant = item.tenantId || (item.codigo?.startsWith('CV-') ? 'cverde' : 'lex-rosam');
    const itemPrefix = getTenantPrefix(rawTenant);

    // Solo considerar si coincide con la empresa
    if (itemPrefix === targetPrefix || (item.codigo && item.codigo.includes(targetPrefix))) {
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
