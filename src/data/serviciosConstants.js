/**
 * Lista oficial de Servicios e Infraestructura requerida para Avalúos LEX ROSAM
 * Solicitud de Aroldo: 31 elementos en orden oficial
 */

export const SERVICIOS_INFRAESTRUCTURA_LIST = [
  { key: 'pavimentos', label: 'Pavimentos', defaultVal: 'Asfalto en buen estado', category: 'urbana' },
  { key: 'tipoCalle', label: 'Tipo de calle', defaultVal: 'Urbana', category: 'urbana' },
  { key: 'bordillos', label: 'Bordillos', defaultVal: 'Concreto', category: 'urbana' },
  { key: 'aceras', label: 'Aceras', defaultVal: 'Concreto 1.20m', category: 'urbana' },
  { key: 'alumbradoPublico', label: 'Alumbrado Público', defaultVal: 'Sí', category: 'urbana' },
  { key: 'drenajeNegras', label: 'Drenaje de Aguas Negras', defaultVal: 'Red municipal', category: 'urbana' },
  { key: 'drenajePluviales', label: 'Drenaje Aguas Pluviales', defaultVal: 'Red pluvial', category: 'urbana' },
  { key: 'agua', label: 'Servicio de Agua', defaultVal: 'Red municipal', category: 'urbana' },
  { key: 'energia', label: 'Servicio de Energía Eléctrica', defaultVal: '120/240V', category: 'urbana' },
  { key: 'telefono', label: 'Servicio Telefónico', defaultVal: 'Sí', category: 'urbana' },
  { key: 'internetCable', label: 'Internet y Cable', defaultVal: 'Fibra óptica', category: 'urbana' },
  { key: 'garita', label: 'Garita', defaultVal: 'No', category: 'amenidades' },
  { key: 'camaras', label: 'Cámaras de Video vigilancia', defaultVal: 'No', category: 'amenidades' },
  { key: 'gimnasio', label: 'Gimnasio Equipado', defaultVal: 'No', category: 'amenidades' },
  { key: 'coworking', label: 'Coworking', defaultVal: 'No', category: 'amenidades' },
  { key: 'salasEstar', label: 'Salas de Estar', defaultVal: 'No', category: 'amenidades' },
  { key: 'areasSociales', label: 'Áreas Sociales y Eventos', defaultVal: 'No', category: 'amenidades' },
  { key: 'entretenimientoFamilia', label: 'Entretenimiento y Familia', defaultVal: 'No', category: 'amenidades' },
  { key: 'canchasPolideportivas', label: 'Canchas Polideportivas', defaultVal: 'No', category: 'amenidades' },
  { key: 'piscinaClimatizada', label: 'Piscina Climatizada', defaultVal: 'No', category: 'amenidades' },
  { key: 'parqueosVisitas', label: 'Parqueos de Visitas', defaultVal: 'No', category: 'amenidades' },
  { key: 'kidsClub', label: 'Kids Club y Área Exterior de Juegos Infantiles', defaultVal: 'No', category: 'amenidades' },
  { key: 'casaClub', label: 'Casa Club', defaultVal: 'No', category: 'amenidades' },
  { key: 'laguna', label: 'Laguna', defaultVal: 'No', category: 'amenidades' },
  { key: 'jacuzziSpa', label: 'Jacuzzi y Spa', defaultVal: 'No', category: 'amenidades' },
  { key: 'canchasTenisPadel', label: 'Canchas de Tenis, Pádel y Pickleball', defaultVal: 'No', category: 'amenidades' },
  { key: 'infinityPool', label: 'Infinity Pool', defaultVal: 'No', category: 'amenidades' },
  { key: 'muellesDecks', label: 'Muelles y Decks', defaultVal: 'No', category: 'amenidades' },
  { key: 'lagunaSenderos', label: 'Laguna con Senderos a su Alrededor', defaultVal: 'No', category: 'amenidades' },
  { key: 'areasPetFriendly', label: 'Áreas Pet Friendly', defaultVal: 'No', category: 'amenidades' },
  { key: 'helipuerto', label: 'Helipuerto', defaultVal: 'No', category: 'amenidades' }
];

export const getDefaultServicios = (existing = {}) => {
  const result = {};
  SERVICIOS_INFRAESTRUCTURA_LIST.forEach(item => {
    result[item.key] = existing?.[item.key] !== undefined && existing?.[item.key] !== null 
      ? existing[item.key] 
      : item.defaultVal;
  });
  return result;
};
