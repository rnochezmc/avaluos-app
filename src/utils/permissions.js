/**
 * Funciones de permisos y control de acceso (Aroldo Ruiz vs Asistentes / Personal Técnico)
 */

export const isAroldoOrAdminUser = (user) => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  return (
    user.rol === 'admin' ||
    user.rol === 'soporte' ||
    user.rol === 'autorizador' ||
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
export const canUserEditAvaluo = (avaluo, user, role = 'autorizador') => {
  if (!avaluo) return false;
  // Si el avalúo NO está autorizado (borrador, en_revision, devuelto), los asistentes pueden editarlo
  if (avaluo.estado !== 'autorizado') return true;
  
  // Si el avalúo ESTÁ autorizado:
  // Si el rol activo en pantalla es "ingreso" (asistente / técnico), queda bloqueado
  if (role === 'ingreso') return false;
  
  // Solo Aroldo o usuario con rol autorizador/admin puede editarlo
  return role === 'autorizador' || isAroldoOrAdminUser(user);
};

/**
 * Requerimiento 3: Los asistentes de Aroldo, cuando deseen checar o trabajar con un avalúo,
 * no podrán ver en el PDF las firmas de los abogados/valuadores.
 */
export const canUserViewSignatures = (user, role = 'autorizador') => {
  // Si el rol activo en pantalla es "ingreso" (asistente / técnico), se ocultan las firmas
  if (role === 'ingreso') return false;
  
  // Solo Aroldo o autorizadores pueden ver las firmas gráficas
  return role === 'autorizador' || isAroldoOrAdminUser(user);
};
