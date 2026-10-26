// ==========================================================================
// CONFIGURACIÓN CENTRAL MULTI-TENANT (LEX ROSAM & CVERDE)
// ==========================================================================

export const TENANTS = {
  'lex-rosam': {
    id: 'lex-rosam',
    nombre: 'LEX ROSAM, S.A.',
    nombreCorto: 'LEX ROSAM',
    tipoEntidad: 'Sociedad Anónima · Avalúos',
    tagline: 'SOCIEDAD ANÓNIMA — AVALÚOS',
    subtitulo: 'Sistema de Registro, Valuación y Emisión de Avalúos',
    logoUrl: '/lex-rosam-logo.png',
    logoBg: '#ffffff',
    codigoPrefix: 'LR-2026-',
    email: 'solicituddeavaluos@lexrosam.com',
    telefono: '+502 6203-0795',
    sitioWeb: 'https://lexrosam.com/',
    direccion: 'Ciudad de Guatemala, Guatemala C.A.',
    
    // Paleta Ejecutiva Lex Rosam (Navy & Slate)
    colores: {
      primary: '#0d2847',
      primaryHover: '#07172b',
      accent: '#1b497d',
      accentLight: '#2563eb',
      lightBg: '#f0f4f9',
      border: '#cbd5e1',
      gold: '#c59b27',
      goldBg: '#fef9e7',
      gradientNavbar: 'linear-gradient(135deg, #07172b 0%, #0d2847 50%, #16325c 100%)',
      gradientModal: 'linear-gradient(135deg, #07172b 0%, #0d2847 100%)',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeText: '#38bdf8',
      badgeBorder: 'rgba(56, 189, 248, 0.3)'
    },

    // Firmantes por defecto
    valuadorPrincipal: 'Lic. Aroldo Oliverio Ruiz Orozco',
    registroPrincipal: 'Valuador autorizado 2572-R-2026',
    firmaPrincipalImg: '/signatures/firma_aroldo_ruiz.png',
    valuadorRevisor: 'Lic. Edgar Rolando Martínez Larios',
    registroRevisor: 'Valuador autorizado 2571-M-2026',
    firmaRevisorImg: '/signatures/firma_edgar_martinez.png',
    requiereRevisorPorDefecto: true,

    // Dictamen
    dictamenPredeterminado: '“El inmueble evaluado reúne las condiciones necesarias para ser aceptado como garantía. La entidad financiera determinará los términos y políticas aplicables al otorgamiento del crédito correspondiente.” Tomar en cuenta: observaciones, notas y recomendaciones.'
  },

  'cverde': {
    id: 'cverde',
    nombre: 'C VERDE, S.A.',
    nombreCorto: 'C VERDE',
    tipoEntidad: 'Avalúos & Negocios Inmobiliarios',
    tagline: 'C VERDE, S.A. — AVALÚOS & NEGOCIOS INMOBILIARIOS',
    subtitulo: 'Plataforma Oficial de Peritaje y Tasación Inmobiliaria',
    logoUrl: '/cverde-logo.jpg',
    logoBg: '#ffffff',
    codigoPrefix: 'CV-2026-',
    email: 'oruiz@cverde.com.gt / jmmorales@cverde.com.gt',
    emails: 'oruiz@cverde.com.gt / jmmorales@cverde.com.gt',
    telefono: '+502 2472-8503 / +502 5413-5106',
    sitioWeb: 'https://cverde.com.gt',
    direccion: '15 Avenida "A" 12-73, Colonia Miraflores II, Zona 11, Ciudad de Guatemala',
    
    // Paleta Oficial C Verde (Esmeralda Bosque y Verde Fresco)
    colores: {
      primary: '#004e3b',
      primaryHover: '#002c22',
      accent: '#007956',
      accentLight: '#00bb7f',
      lightBg: '#ecfdf5',
      border: '#a7f3d0',
      gold: '#f99c00',
      goldBg: '#fffbeb',
      gradientNavbar: 'linear-gradient(135deg, #002c22 0%, #004e3b 50%, #007956 100%)',
      gradientModal: 'linear-gradient(135deg, #002c22 0%, #004e3b 100%)',
      badgeBg: 'rgba(0, 187, 127, 0.15)',
      badgeText: '#00bb7f',
      badgeBorder: 'rgba(0, 187, 127, 0.3)'
    },

    // Firmantes por defecto
    valuadorPrincipal: 'Lic. Aroldo Oliverio Ruiz Orozco',
    registroPrincipal: 'Valuador autorizado 2572-R-2026',
    firmaPrincipalImg: '/signatures/firma_aroldo_ruiz.png',
    valuadorRevisor: 'Lic. Edgar Rolando Martínez Larios',
    registroRevisor: 'Valuador autorizado 2571-M-2026',
    firmaRevisorImg: '/signatures/firma_edgar_martinez.png',
    requiereRevisorPorDefecto: true,

    // Dictamen
    dictamenPredeterminado: '“El inmueble reúne las condiciones técnicas, físicas y de mercado requeridas para constituir garantía fiduciaria o hipotecaria ante entidades del sistema bancario nacional, según las normativas y políticas crediticias vigentes.”'
  }
};

export const DEFAULT_TENANT_ID = 'lex-rosam';

export function getTenantConfig(tenantId) {
  if (tenantId && TENANTS[tenantId]) {
    return TENANTS[tenantId];
  }
  return TENANTS[DEFAULT_TENANT_ID];
}

export function getAllTenantsList() {
  return Object.values(TENANTS);
}
