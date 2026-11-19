/**
 * Funciones de permisos y control de acceso (Aroldo Ruiz vs Asistentes / Personal Técnico)
 */

export const isAroldoOrAdminUser = (user) => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const rol = (user.rol || '').toLowerCase().trim();
  return (
    rol === 'admin' ||
    rol === 'soporte' ||
    rol === 'autorizador' ||
    email === 'aroldoruiz100@gmail.com' ||
    email === 'oruiz@cverde.com.gt' ||
    email === 'cverdeavaluos@gmail.com' ||
    email === 'rnochezmc@gmail.com'
  );
};

/**
 * Requerimiento 2: Una vez autorizado un caso por parte de Aroldo,
 * sus asistentes no deberían poder modificar ningún dato. Solo Aroldo puede modificarlo.
 */
export const canUserEditAvaluo = (avaluo, user, role) => {
  if (!avaluo) return false;
  // Si el avalúo NO está autorizado (borrador, en_revision, devuelto), los asistentes pueden editarlo para llenarlo
  if (avaluo.estado !== 'autorizado') return true;
  
  // Si el avalúo ESTÁ autorizado:
  // Si se está simulando rol de ingreso/técnico, queda bloqueado
  if (role === 'ingreso') return false;
  
  // Solo Aroldo o usuario con rol autorizador/admin verificado puede editarlo
  return isAroldoOrAdminUser(user);
};

/**
 * Requerimiento 3: Los asistentes de Aroldo, cuando deseen checar o trabajar con un avalúo,
 * no podrán ver en el PDF las firmas de los abogados/valuadores.
 */
export const canUserViewSignatures = (user, role) => {
  // Si el rol activo en pantalla es "ingreso" (asistente / técnico), se ocultan las firmas
  if (role === 'ingreso') return false;
  
  // Solo Aroldo o autorizadores verificados pueden ver las firmas gráficas
  return isAroldoOrAdminUser(user);
};
