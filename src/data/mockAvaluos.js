// Dictamen Oficial de Garantía Crediticia predeterminado y plantillas rápidas
export const DEFAULT_DICTAMEN_GARANTIA = '“El inmueble evaluado reúne las condiciones necesarias para ser aceptado como garantía. La entidad financiera determinará los términos y políticas aplicables al otorgamiento del crédito correspondiente.” Tomar en cuenta: observaciones, notas y recomendaciones.';

export const DICTAMEN_PRESETS = {
  favorable: '“El inmueble evaluado reúne las condiciones necesarias para ser aceptado como garantía. La entidad financiera determinará los términos y políticas aplicables al otorgamiento del crédito correspondiente.” Tomar en cuenta: observaciones, notas y recomendaciones.',
  condicionado: '“El inmueble evaluado reúne las condiciones para ser aceptado como garantía crediticia, condicionado al estricto cumplimiento de las observaciones técnicas y recomendaciones estipuladas en el presente dictamen.”',
  noFavorable: '“El inmueble evaluado NO reúne las condiciones técnicas necesarias para ser aceptado como garantía hipotecaria bajo las políticas de riesgo vigentes.”',
  construccion: '“El inmueble evaluado reúne las condiciones necesarias para garantía crediticia conforme al avance físico de obra verificado a la fecha de inspección y sujeto a supervisión periódica de desembolsos.”'
};

// Mock inicial de expedientes de avalúos basados exactamente en el formato LEX ROSAM S.A.
export const initialAvaluos = [
  {
    id: "lr-2026-10031",
    codigo: "LR-2026-10031",
    tipoAvaluo: "Apartamento / PH",
    solicitante: "BANCO G&T CONTINENTAL",
    fechaSolicitud: "2026-07-28",
    fechaInspeccion: "30 de julio de 2026",
    fechaActualizacion: "",
    bienMostradoPor: "Lic. Aroldo Oliverio Ruiz Orozco",
    direccion: "Apartamento No. 1102, ubicado en el Nivel No.11 del Edificio Vantier, 2 parqueos ubicados en el sótano No. 3 y bodega ubicada en el sotano No. uno.",
    coordenadas: "14.59512, -90.51834",
    descripcionGeneral: "Apartamento No. 1102 en Nivel 11 de Edificio Vantier, con 2 parqueos en sótano 3 y bodega en sótano 1. Inmueble constituido bajo Régimen de Propiedad Horizontal.",
    dpi: "1789 54210 0101",
    referenciaActualizacion: "Inspección física y certificación de valor 2026",
    estado: "autorizado",
    observacionesAutorizador: "Expediente revisado y verificado en campo. Régimen de propiedad horizontal y fincas filiales verificadas sin terrenos rústicos independientes.",
    aplicaTerreno: false,
    
    fincas: [
      { 
        finca: "10031", 
        folio: "31", 
        libro: "250E de Propiedad Horizontal de Guatemala", 
        propietario: "Inversiones y Desarrollos Inmobiliarios S.A.",
        areaRegistrada: 104.77,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 104.77,
        areaFisica: 104.77,
        areaValuada: 104.77,
        dicabiNombre: "Inversiones y Desarrollos Inmobiliarios S.A.",
        dicabiDireccion: "Apartamento No. 1102, ubicado en el Nivel No.11 del Edificio Vantier",
        dicabiMatricula: "01-14-5521-8",
        dicabiArea: "104.77 m²",
        dicabiObservaciones: "Matrícula fiscal individual de apartamento."
      },
      { 
        finca: "10032", 
        folio: "32", 
        libro: "250E de Propiedad Horizontal de Guatemala", 
        propietario: "Inversiones y Desarrollos Inmobiliarios S.A.",
        areaRegistrada: 25.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 25.00,
        areaFisica: 25.00,
        areaValuada: 25.00,
        dicabiNombre: "Inversiones y Desarrollos Inmobiliarios S.A.",
        dicabiDireccion: "2 parqueos ubicados en el sótano No. 3 del Edificio Vantier",
        dicabiMatricula: "",
        dicabiArea: "25.00 m²",
        dicabiObservaciones: "Finca no inscrita en DICABI."
      },
      { 
        finca: "10033", 
        folio: "33", 
        libro: "250E de Propiedad Horizontal de Guatemala", 
        propietario: "Inversiones y Desarrollos Inmobiliarios S.A.",
        areaRegistrada: 7.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 7.00,
        areaFisica: 7.00,
        areaValuada: 7.00,
        dicabiNombre: "Inversiones y Desarrollos Inmobiliarios S.A.",
        dicabiDireccion: "Bodega ubicada en el sótano No. uno del Edificio Vantier",
        dicabiMatricula: "",
        dicabiArea: "7.00 m²",
        dicabiObservaciones: "Finca no inscrita en DICABI."
      }
    ],
    propietarioPrincipal: "Inversiones y Desarrollos Inmobiliarios S.A.",
    areaRegistrada: 136.77,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 136.77,
    areaFisica: 136.77,
    areaValuada: 136.77,
    
    limitaciones: "Sometido al régimen de propiedad horizontal y reglamento de copropiedad y administración del Edificio Vantier.",
    anotaciones: "Ninguna vigente según certificación electrónica del Registro General de la Propiedad.",
    gravamenes: "Libre de gravámenes hipotecarios.",
    servidumbres: "Servidumbres inherentes al régimen de propiedad horizontal (ductos, pasillos comunes, elevadores y accesos).",
    areasComunes: "Lobby con recepción, elevadores de alta velocidad, gimnasio, salón social, terraza lounge y parqueo de visitas.",
    desmembracion: "Fincas filiales desmembradas de la finca matriz del proyecto.",
    
    valorComercialGTQ: 1285085,
    valorBancarioGTQ: 1028068,
    tipoCambio: 7.62581,
    valorComercialUSD: 168517.84,
    valorBancarioUSD: 134814.27,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    
    dicabiNombre: "",
    dicabiDireccion: "Apartamento No. 1102, ubicado en el Nivel No.11 del Edificio Vantier, 2 parqueos ubicados en el sótano No. 3 y bodega ubicada en el sotano No. uno.",
    dicabiMatricula: "Pendiente",
    dicabiArea: "136.77 m²",
    dicabiObservaciones: "Finca No inscrita en DICABI.",
    sector: "Zona Urbana Residencial Vertical",
    usoSuelo: "Residencial / Apartamentos",
    nivelSocioeconomico: "Alto",
    formaTerreno: "",
    pendiente: "",
    esquina: "No",
    accesoCalle: "Avenida pavimentada con garita y lobby de acceso",
    colindancias: {
      norte: "",
      sur: "",
      este: "",
      oeste: ""
    },
    
    servicios: {
      drenajeNegras: "Red municipal",
      drenajePluviales: "Red pluvial municipal",
      pavimentos: "Asfalto y concreto",
      bordillos: "Concreto",
      aceras: "Concreto 1.50 m",
      agua: "Red municipal y cisterna propia del edificio",
      telefono: "Líneas fijas y móviles",
      internetCable: "Fibra óptica instalada",
      energia: "EEGSA 120/240V monofásica",
      garita: "Garita y lobby de control 24/7",
      camaras: "Circuito cerrado propio en todo el edificio",
      alumbradoPublico: "Alumbrado LED municipal y propio",
      tipoCalle: "Avenida urbana principal"
    },
    serviciosAdicionales: ["Planta eléctrica de emergencia general", "Elevadores de alta velocidad", "Pozo propio y cisterna"],
    
    construccion: {
      edadAprox: "1 año (A estrenar)",
      estadoActual: "Excelente",
      apropiadaSector: "Totalmente adecuada al estándar contemporáneo del sector",
      distribucion: "Apartamento 1102: Sala, comedor con balcón, cocina integrada con isla, área de lavandería, baño de visitas, dormitorio principal con walk-in closet y baño privado, dormitorio secundario con closet y baño completo. Sótano 3: 2 plazas de parqueo. Sótano 1: Bodega privada.",
      estructura: "Marcos de concreto armado y losas postensadas",
      paredes: "Muros de concreto y mampostería con acabados lisos",
      techoEntrePiso: "Losa postensada de concreto con cielo falso decorativo",
      piso: "Piso vinílico SPC imitación madera en áreas sociales y porcelanato en baños",
      puertas: "Puerta principal enchapada con cerradura digital y puertas interiores de madera semisólida",
      ventanas: "Perfilería europea de aluminio termoacústico con doble vidrio",
      sanitaria: "Artefactos suspendidos de bajo consumo y grifería de alta gama",
      electrica: "Instalación empotrada con iluminación LED indirecta",
      factoresPositivos: "Vista panorámica desde nivel 11, acabados de primera línea, excelentes amenidades.",
      factoresNegativos: "Cuota de mantenimiento mensual del régimen de copropiedad."
    },
    
    desgloseTerreno: { 
      area: 0, 
      unidad: "m²", 
      valorUnitario: 0, 
      total: 0,
      fincaAsociada: "Áreas comunes no privativas",
      varasCuadradas: 0
    },
    desgloseConstruccion: { 
      items: [
        { id: 1, descripcion: "Apartamento No. 1102 (Área habitable Nivel 11)", area: 104.77, unidad: "m²", valorUnitario: 10500, total: 1100085 },
        { id: 2, descripcion: "2 Parqueos ubicados en Sótano No. 3", area: 25.00, unidad: "m²", valorUnitario: 6000, total: 150000 },
        { id: 3, descripcion: "Bodega ubicada en Sótano No. 1", area: 7.00, unidad: "m²", valorUnitario: 5000, total: 35000 }
      ],
      area: 136.77, 
      unidad: "m²", 
      valorUnitario: 9396.07, 
      total: 1285085 
    },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: [
      { name: "Consulta_Electronica_RGP_Vantier_10031.pdf", size: "385 KB", fecha: "2026-07-30" }
    ]
  },
  {
    id: "lr-2026-08",
    codigo: "LR-2026-08",
    tipoAvaluo: "Comercial",
    solicitante: "COOPERATIVA DE AHORRO Y CREDITO INTEGRAL PARROQUIAL GUADALUPANA R.L.",
    fechaSolicitud: "2026-07-13",
    fechaInspeccion: "17 de julio de 2026 y 23 de julio de 2026",
    fechaActualizacion: "2026-07-27",
    bienMostradoPor: "WALTER MANFREDO GOMEZ HIGUEROS",
    direccion: "Lote en 1ra. Calle número 3-71 zona 2, Tecpán Guatemala, Chimaltenango",
    coordenadas: "14°45'47.5\"N 90°59'22.2\"W",
    descripcionGeneral: "Inmueble de tres niveles de uso habitacional y comercial con locales en planta baja y área residencial en niveles superiores.",
    dpi: "2570 51244 0406",
    referenciaActualizacion: "Inspección física y certificación de valor 2026",
    estado: "autorizado",
    observacionesAutorizador: "Expediente revisado y verificado en campo. Valores técnicos aprobados según tabla de mercado.",
    
    // Información Registral con áreas individuales por finca
    fincas: [
      { 
        finca: "5289", 
        folio: "289", 
        libro: "71E de Chimaltenango", 
        propietario: "WALTER MANFREDO GOMEZ HIGUEROS",
        areaRegistrada: 253.08,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 253.08,
        areaFisica: 253.08,
        areaValuada: 145.08,
        dicabiNombre: "WALTER MANFREDO GOMEZ HIGUEROS",
        dicabiDireccion: "1ra. Calle 3-71 Zona 2, Tecpán",
        dicabiMatricula: "04-03-1258-1",
        dicabiArea: "145.08 m²",
        dicabiObservaciones: "Matrícula fiscal cotejada con el catastro municipal de Tecpán Chimaltenango.",
        colindancias: {
          norte: "18.50 m con calle pública municipal",
          sur: "18.50 m con Finca 5288",
          este: "10.76 m con propiedad privada particular",
          oeste: "10.76 m con lote colindante",
          norteFisica: "18.50 m con calle pavimentada y acera municipal",
          surFisica: "18.50 m con muro de block perimetral",
          esteFisica: "10.76 m con pared de block colindante",
          oesteFisica: "10.76 m con cerramiento y lote vecino"
        }
      },
      { 
        finca: "7172", 
        folio: "172", 
        libro: "75E de Chimaltenango", 
        propietario: "WALTER MANFREDO GOMEZ HIGUEROS",
        areaRegistrada: 108.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 108.00,
        areaFisica: 108.00,
        areaValuada: 54.00,
        dicabiNombre: "WALTER MANFREDO GOMEZ HIGUEROS",
        dicabiDireccion: "1ra. Calle 3-71 Zona 2, Tecpán",
        dicabiMatricula: "",
        dicabiArea: "54.00 m²",
        dicabiObservaciones: "Finca no inscrita en DICABI.",
        colindancias: {
          norte: "10.00 m con Finca 5289",
          sur: "10.00 m con Finca 7173",
          este: "10.80 m con callejón comunal",
          oeste: "10.80 m con propiedad privada",
          norteFisica: "10.00 m con patio interno delimitado",
          surFisica: "10.00 m con servidumbre de paso",
          esteFisica: "10.80 m con callejón empedrado",
          oesteFisica: "10.80 m con muro prefabricado"
        }
      },
      { 
        finca: "7173", 
        folio: "173", 
        libro: "75E de Chimaltenango", 
        propietario: "WALTER MANFREDO GOMEZ HIGUEROS",
        areaRegistrada: 60.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 60.00,
        areaFisica: 60.00,
        areaValuada: 60.00,
        dicabiNombre: "WALTER MANFREDO GOMEZ HIGUEROS",
        dicabiDireccion: "1ra. Calle 3-71 Zona 2, Tecpán",
        dicabiMatricula: "",
        dicabiArea: "60.00 m²",
        dicabiObservaciones: "Finca no inscrita en DICABI.",
        colindancias: {
          norte: "6.00 m con Finca 7172",
          sur: "6.00 m con Finca 7174",
          este: "10.00 m con callejón comunal",
          oeste: "10.00 m con propiedad privada",
          norteFisica: "6.00 m con servidumbre de paso",
          surFisica: "6.00 m con área de parqueo común",
          esteFisica: "10.00 m con callejón empedrado",
          oesteFisica: "10.00 m con muro prefabricado"
        }
      },
      { 
        finca: "7174", 
        folio: "174", 
        libro: "75E de Chimaltenango", 
        propietario: "WALTER MANFREDO GOMEZ HIGUEROS",
        areaRegistrada: 40.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 40.00,
        areaFisica: 40.00,
        areaValuada: 40.00,
        dicabiNombre: "WALTER MANFREDO GOMEZ HIGUEROS",
        dicabiDireccion: "1ra. Calle 3-71 Zona 2, Tecpán",
        dicabiMatricula: "",
        dicabiArea: "40.00 m²",
        dicabiObservaciones: "Finca no inscrita en DICABI.",
        colindancias: {
          norte: "4.00 m con Finca 7173",
          sur: "4.00 m con lote matriz vecino",
          este: "10.00 m con callejón comunal",
          oeste: "10.00 m con propiedad privada",
          norteFisica: "4.00 m con área de parqueo común",
          surFisica: "4.00 m con cerca de alambre y seto vivo",
          esteFisica: "10.00 m con final de callejón",
          oesteFisica: "10.00 m con pared de block"
        }
      }
    ],
    propietarioPrincipal: "WALTER MANFREDO GOMEZ HIGUEROS",
    areaRegistrada: 461.08,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 461.08,
    areaFisica: 461.08,
    areaValuada: 299.08,
    
    // Aspectos Legales (con textos amplios y detallados)
    limitaciones: "Servidumbre de paso recíproca con predio colindante para acometida de servicios.",
    anotaciones: "Ninguna vigente según certificación electrónica del Registro General de la Propiedad.",
    gravamenes: "Primera hipoteca a favor de Cooperativa Parroquial Guadalupana R.L.",
    servidumbres: "Servidumbre de paso y drenaje pluvial.",
    areasComunes: "Acceso pavimentado común municipal.",
    desmembracion: "Sin desmembraciones pendientes inscritas.",
    
    // Valores
    valorComercialGTQ: 964980,
    valorBancarioGTQ: 771984,
    tipoCambio: 7.61893,
    valorComercialUSD: 126655.58,
    valorBancarioUSD: 101324.46,
    
    // Valuadores Oficiales
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    
    // DICABI (Independiente del RGP)
    dicabiNombre: "WALTER MANFREDO GOMEZ HIGUEROS",
    dicabiDireccion: "1ra. Calle 3-71 Zona 2, Tecpán",
    dicabiMatricula: "04-03-1258-1",
    dicabiArea: "199.08 m²",
    dicabiObservaciones: "Matrícula fiscal cotejada con el catastro municipal de Tecpán Chimaltenango.",
    sector: "Zona 2 Urbana Central",
    usoSuelo: "Comercial / Residencial",
    nivelSocioeconomico: "Medio",
    formaTerreno: "Regular / Rectangular",
    pendiente: "Plana (0.5%)",
    esquina: "No",
    accesoCalle: "Calle principal pavimentada con aceras",
    colindancias: {
      norte: "18.50 m con calle pública municipal",
      sur: "18.50 m con Finca 5288",
      este: "10.76 m con propiedad privada particular",
      oeste: "10.76 m con lote colindante",
      norteFisica: "18.50 m con calle pavimentada y acera municipal",
      surFisica: "18.50 m con muro de block perimetral",
      esteFisica: "10.76 m con pared de block colindante",
      oesteFisica: "10.76 m con cerramiento y lote vecino"
    },
    
    // Servicios con checklist
    servicios: {
      drenajeNegras: "Red municipal",
      drenajePluviales: "Red pluvial municipal",
      pavimentos: "Adoquín y concreto en buen estado",
      bordillos: "Concreto",
      aceras: "Concreto 1.20 m",
      agua: "Red municipal comunitaria",
      telefono: "Líneas móviles y fijas",
      internetCable: "Fibra óptica disponible",
      energia: "DEOCSA 120/240V",
      garita: "No aplica (calle pública)",
      camaras: "No",
      alumbradoPublico: "Lámparas públicas activas",
      tipoCalle: "Urbana comercial"
    },
    serviciosAdicionales: ["Recolección de basura municipal", "Transporte urbano cercano"],
    
    // Construcción
    construccion: {
      edadAprox: "4 años",
      estadoActual: "Bueno",
      apropiadaSector: "Adecuada a las construcciones de la zona comercial",
      distribucion: "Nivel 1: Dos locales comerciales con baño. Niveles 2 y 3: Sala, comedor, cocina, 4 dormitorios, lavandería y terraza.",
      estructura: "Marcos de concreto armado y mampostería reforzada",
      paredes: "Block de pómez con repello y cernido",
      techoEntrePiso: "Losa de concreto armado",
      piso: "Cerámico",
      puertas: "Metal y madera",
      ventanas: "Aluminio anodizado y vidrio claro",
      sanitaria: "Artefactos estándar vitrificados en buen estado",
      electrica: "Instalación empotrada monofásica",
      factoresPositivos: "Excelente ubicación sobre calle comercial transitada, estructura sólida.",
      factoresNegativos: "Ninguno de consideración"
    },
    
    // Desglose matemático con relación de fincas y varas cuadradas
    desgloseTerreno: { 
      area: 199.08, 
      unidad: "m²", 
      valorUnitario: 1200, 
      total: 238896,
      fincaAsociada: "5289 y 7172",
      varasCuadradas: 284.91
    },
    desgloseConstruccion: { 
      items: [
        { id: 1, descripcion: "Primer Nivel (Vivienda principal)", area: 180.00, unidad: "m²", valorUnitario: 2500, total: 450000 },
        { id: 2, descripcion: "Segundo Nivel (Dormitorios y terrazas)", area: 110.43, unidad: "m²", valorUnitario: 2500, total: 276084 }
      ],
      area: 290.43, 
      unidad: "m²", 
      valorUnitario: 2500, 
      total: 726084 
    },
    
    // Fotos
    fotos: {
      entorno: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: [
      { name: "Certificacion_Electronica_RGP_Chimaltenango_5289.pdf", size: "340 KB", fecha: "2026-07-27" }
    ]
  },
  {
    id: "lr-2026-001",
    codigo: "LR-2026-001",
    tipoAvaluo: "Comercial",
    solicitante: "BANCO G&T CONTINENTAL",
    fechaSolicitud: "2026-07-20",
    fechaInspeccion: "22 de julio de 2026",
    fechaActualizacion: "2026-07-24",
    bienMostradoPor: "Arq. Roberto Méndez",
    direccion: "15 Avenida 4-32 Zona 10, Ciudad de Guatemala",
    coordenadas: "14.59821, -90.51423",
    descripcionGeneral: "Inmueble de dos niveles con oficinas corporativas, área de atención al cliente y parqueo frontal para 6 vehículos.",
    dpi: "1892 45871 0101",
    referenciaActualizacion: "Inspección física y certificación de valor 2026",
    estado: "en_revision",
    observacionesAutorizador: "Pendiente de firma del revisor técnico.",
    
    fincas: [
      { 
        finca: "4521", 
        folio: "21", 
        libro: "85E de Guatemala", 
        propietario: "Inmobiliaria Las Cumbres S.A.",
        areaRegistrada: 285.25,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 285.25,
        areaFisica: 286.00,
        areaValuada: 285.25,
        dicabiNombre: "Inmobiliaria Las Cumbres S.A.",
        dicabiDireccion: "15 Avenida 4-32 Zona 10",
        dicabiMatricula: "01-10-8452-9",
        dicabiArea: "285.25 m²",
        dicabiObservaciones: "Matrícula fiscal al día con pago de IUSI."
      },
      { 
        finca: "4522", 
        folio: "22", 
        libro: "85E de Guatemala", 
        propietario: "Inmobiliaria Las Cumbres S.A.",
        areaRegistrada: 285.25,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 285.25,
        areaFisica: 286.00,
        areaValuada: 285.25,
        dicabiNombre: "Inmobiliaria Las Cumbres S.A.",
        dicabiDireccion: "15 Avenida 4-32 Zona 10",
        dicabiMatricula: "",
        dicabiArea: "285.25 m²",
        dicabiObservaciones: "Finca no inscrita en DICABI."
      }
    ],
    propietarioPrincipal: "Inmobiliaria Las Cumbres S.A.",
    areaRegistrada: 570.50,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 570.50,
    areaFisica: 572.00,
    areaValuada: 570.50,
    
    limitaciones: "Servidumbre de paso recíproca con predio colindante para acceso vehicular.",
    anotaciones: "Ninguna vigente.",
    gravamenes: "Primera hipoteca a favor de Banco G&T Continental S.A. inscrita en la inscripción número 3.",
    servidumbres: "Servidumbre de paso y drenaje pluvial.",
    areasComunes: "Acceso pavimentado común.",
    desmembracion: "Sin desmembraciones pendientes.",
    
    valorComercialGTQ: 3850000,
    valorBancarioGTQ: 3080000,
    tipoCambio: 7.62581,
    valorComercialUSD: 504864.40,
    valorBancarioUSD: 403891.52,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    
    dicabiNombre: "Inmobiliaria Las Cumbres S.A.",
    dicabiDireccion: "15 Avenida 4-32 Zona 10",
    dicabiMatricula: "01-10-8452-9",
    dicabiArea: "570.50 m²",
    dicabiObservaciones: "Matrícula fiscal al día con pago de IUSI.",
    sector: "Zona 10 / Zona Viva",
    usoSuelo: "Comercial / Oficinas",
    nivelSocioeconomico: "Alto",
    formaTerreno: "Regular / Rectangular",
    pendiente: "Plana (1%)",
    esquina: "No",
    accesoCalle: "Avenida principal asfaltada con bordillo y acera",
    colindancias: {
      norte: "25.00 m con Finca 4520",
      sur: "25.00 m con 15 Avenida",
      este: "22.82 m con Lote 5",
      oeste: "22.82 m con Lote 7"
    },
    
    servicios: {
      drenajeNegras: "Red municipal",
      drenajePluviales: "Conexión a pozo de absorción",
      pavimentos: "Asfalto en excelente estado",
      bordillos: "Concreto",
      aceras: "Concreto 1.50m",
      agua: "Red municipal EMPAGUA",
      telefono: "Líneas fijas activas",
      internetCable: "Fibra óptica disponible",
      energia: "EEGSA 120/240V trifásica",
      garita: "No aplica (frente a calle pública)",
      camaras: "Circuito cerrado propio",
      alumbradoPublico: "Lámparas LED municipales",
      tipoCalle: "Avenida urbana comercial"
    },
    serviciosAdicionales: ["Vigilancia motorizada de zona", "Fibra óptica redundante"],
    
    construccion: {
      edadAprox: "6 años",
      estadoActual: "Muy Bueno",
      apropiadaSector: "Totalmente adecuada al estándar corporativo de Zona 10",
      distribucion: "Recepción, 8 cubículos, 2 salas de juntas, cafetería, 4 baterías de baños.",
      estructura: "Marcos de concreto armado y vigas de acero",
      paredes: "Block pómez con repello + cernido liso y tablayeso",
      techoEntrePiso: "Losa maciza de concreto",
      piso: "Porcelanato rectificado 60x60cm",
      puertas: "Madera cedro en despachos y vidrio templado en accesos",
      ventanas: "Perfilería europea de aluminio y vidrio atérmico",
      sanitaria: "Loza blanca Kohler en perfecto funcionamiento",
      electrica: "Ductería empotrada e iluminación LED",
      factoresPositivos: "Ubicación privilegiada en Zona 10, alta demanda de alquiler, excelente mantenimiento.",
      factoresNegativos: "Tráfico vehicular en horas pico sobre avenida principal."
    },
    
    desgloseTerreno: { 
      area: 570.50, 
      unidad: "m²", 
      valorUnitario: 3500, 
      total: 1996750,
      fincaAsociada: "4521 y 4522",
      varasCuadradas: 816.47
    },
    desgloseConstruccion: { 
      area: 420.00, 
      unidad: "m²", 
      valorUnitario: 4412.50, 
      total: 1853250 
    },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: [
      { name: "Certificacion_RGP_Zona10.pdf", size: "480 KB", fecha: "2026-07-24" }
    ]
  },
  {
    id: "lr-2026-002",
    codigo: "LR-2026-002",
    tipoAvaluo: "Residencial",
    solicitante: "BANCO INDUSTRIAL",
    fechaSolicitud: "2026-08-05",
    fechaInspeccion: "08 de agosto de 2026",
    fechaActualizacion: "2026-08-11",
    bienMostradoPor: "Sra. María Elena Morales",
    direccion: "Km 18.5 Carretera a El Salvador, Condominio Prados del Encinal, Casa 14",
    coordenadas: "14.53120, -90.46231",
    descripcionGeneral: "Vivienda unifamiliar aislada de dos niveles con jardín posterior, pérgola y estacionamiento techado para 3 autos.",
    dpi: "2341 87654 0108",
    referenciaActualizacion: "Inspección física y certificación de valor 2026",
    estado: "devuelto",
    observacionesAutorizador: "Aroldo Ruiz: Por favor verificar la medida de desmembración en Finca 8912 e ingresar las colindancias exactas del plano.",
    
    fincas: [
      { 
        finca: "8912", 
        folio: "112", 
        libro: "145E de Guatemala", 
        propietario: "Carlos Enrique Morales Fuentes",
        areaRegistrada: 400.00,
        areaDesmembrada: 50.00,
        areaActualRegistrada: 350.00,
        areaFisica: 350.00,
        areaValuada: 350.00,
        dicabiNombre: "Carlos Enrique Morales Fuentes",
        dicabiDireccion: "Condominio Prados del Encinal Casa 14, Fraijanes",
        dicabiMatricula: "01-14-3321-4",
        dicabiArea: "350.00 m²",
        dicabiObservaciones: "Inscrito en catastro de Fraijanes."
      }
    ],
    propietarioPrincipal: "Carlos Enrique Morales Fuentes",
    areaRegistrada: 400.00,
    areaDesmembrada: 50.00,
    areaActualRegistrada: 350.00,
    areaFisica: 350.00,
    areaValuada: 350.00,
    
    limitaciones: "Régimen de propiedad horizontal y reglamento interno del condominio.",
    anotaciones: "Ninguna vigente.",
    gravamenes: "Libre de gravámenes hipotecarios.",
    servidumbres: "Servidumbre de paso vehicular, acueducto y vista.",
    areasComunes: "Casa club, piscina, canchas deportivas y áreas verdes comunes.",
    desmembracion: "Desmembración inscrita de 50 m² para vía de acceso común.",
    
    valorComercialGTQ: 1750000,
    valorBancarioGTQ: 1400000,
    tipoCambio: 7.62581,
    valorComercialUSD: 229483.82,
    valorBancarioUSD: 183587.05,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    
    dicabiNombre: "Carlos Enrique Morales Fuentes",
    dicabiDireccion: "Condominio Prados del Encinal Casa 14, Fraijanes",
    dicabiMatricula: "01-14-3321-4",
    dicabiArea: "350.00 m²",
    dicabiObservaciones: "Inscrito en catastro de Fraijanes.",
    sector: "Carretera a El Salvador / Fraijanes",
    usoSuelo: "Residencial Condominio Cerrado",
    nivelSocioeconomico: "Medio-Alto",
    formaTerreno: "Regular",
    pendiente: "Inclinada leve (5%)",
    esquina: "No",
    accesoCalle: "Boulevard interno de concreto con adoquín decorativo",
    colindancias: {
      norte: "14.00 m con Lote 13",
      sur: "14.00 m con Lote 15",
      este: "25.00 m con calle interior del condominio",
      oeste: "25.00 m con área de bosque protegido"
    },
    
    servicios: {
      drenajeNegras: "Planta de tratamiento propia del condominio",
      drenajePluviales: "Drenajes internos conectados a colector",
      pavimentos: "Adoquín decorativo de alta resistencia",
      bordillos: "Concreto prefabricado",
      aceras: "Concreto lavado 1.20m",
      agua: "Pozo propio del condominio con servicio continuo",
      telefono: "Red telefónica instalada",
      internetCable: "Fibra óptica Claro y Tigo",
      energia: "EEGSA 120/240V bifásica",
      garita: "Garita principal con talanquera y lector de tags",
      camaras: "Circuito cerrado perimetral monitoreado 24/7",
      alumbradoPublico: "Faroles coloniales LED",
      tipoCalle: "Calle privada de condominio"
    },
    serviciosAdicionales: ["Garita de seguridad privada 24 horas", "Planta de tratamiento de aguas"],
    
    construccion: {
      edadAprox: "3 años",
      estadoActual: "Excelente",
      apropiadaSector: "Armónica con el reglamento arquitectónico del condominio",
      distribucion: "Nivel 1: Sala con chimenea, comedor, cocina con gabinetes, baño de visitas, dormitorio de servicio con baño, lavandería, pérgola con churrasquera. Nivel 2: Sala familiar, dormitorio principal con walk-in closet y baño con tina, 2 dormitorios secundarios con baño compartido.",
      estructura: "Concreto armado y muros de carga reforzados",
      paredes: "Block pómez con acabados lisos alisados y pintura vinílica lavable",
      techoEntrePiso: "Losa tradicional de concreto con teja decorativa",
      piso: "Piso cerámico imitación madera en dormitorios y porcelanato en áreas sociales",
      puertas: "Puertas interiores en madera enchapada y principal en madera sólida",
      ventanas: "Ventanería de PVC blanco con vidrio reflectivo de 5mm",
      sanitaria: "Sanitarios y grifería importada de bajo consumo",
      electrica: "Tablero de 16 circuitos con protección y polo a tierra",
      factoresPositivos: "Condominio de alta plusvalía, doble garita de seguridad, diseño contemporáneo.",
      factoresNegativos: "Distancia al centro de la ciudad en horas de alto tráfico."
    },
    
    desgloseTerreno: { 
      area: 350.00, 
      unidad: "m²", 
      valorUnitario: 1400, 
      total: 490000,
      fincaAsociada: "8912",
      varasCuadradas: 500.90
    },
    desgloseConstruccion: { 
      area: 280.00, 
      unidad: "m²", 
      valorUnitario: 4500, 
      total: 1260000 
    },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: []
  },
  {
    id: "lr-2026-003",
    codigo: "LR-2026-003",
    tipoAvaluo: "Industrial",
    solicitante: "BANCO DE AMÉRICA CENTRAL (BAC)",
    fechaSolicitud: "2026-09-02",
    fechaInspeccion: "05 de septiembre de 2026",
    fechaActualizacion: "2026-09-08",
    bienMostradoPor: "Ing. Fernando Estrada",
    direccion: "Calzada Atanasio Tzul 22-00 Zona 12, Parque Industrial El Trébol, Bodega B-4",
    coordenadas: "14.58210, -90.53420",
    descripcionGeneral: "Bodega industrial con estructura de marcos metálicos, piso de alta resistencia, área de andenes de carga y descarga y mezzanina para oficinas.",
    dpi: "1678 23901 0101",
    referenciaActualizacion: "Inspección física y certificación de valor 2026",
    estado: "borrador",
    observacionesAutorizador: "Borrador en captura técnica.",
    
    fincas: [
      { 
        finca: "12450", 
        folio: "450", 
        libro: "320E de Guatemala", 
        propietario: "Logística Industrial del Sur S.A.",
        areaRegistrada: 1250.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 1250.00,
        areaFisica: 1250.00,
        areaValuada: 1250.00,
        dicabiNombre: "Logística Industrial del Sur S.A.",
        dicabiDireccion: "Calzada Atanasio Tzul 22-00 Zona 12",
        dicabiMatricula: "01-12-9904-2",
        dicabiArea: "1250.00 m²",
        dicabiObservaciones: "Matrícula fiscal industrial."
      }
    ],
    propietarioPrincipal: "Logística Industrial del Sur S.A.",
    areaRegistrada: 1250.00,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 1250.00,
    areaFisica: 1250.00,
    areaValuada: 1250.00,
    
    limitaciones: "Servidumbre de paso para maniobra de furgones y camiones pesados.",
    anotaciones: "Ninguna anotación judicial o embargo.",
    gravamenes: "Hipotecas bancarias vigentes inscritas a favor del banco solicitante.",
    servidumbres: "Servidumbre de paso vehicular pesado y líneas de alta tensión.",
    areasComunes: "Patios de maniobras, planta eléctrica de emergencia general y pozo común.",
    desmembracion: "No reporta desmembraciones.",
    
    valorComercialGTQ: 6200000,
    valorBancarioGTQ: 4960000,
    tipoCambio: 7.62581,
    valorComercialUSD: 813028.39,
    valorBancarioUSD: 650422.71,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    
    dicabiNombre: "Logística Industrial del Sur S.A.",
    dicabiDireccion: "Calzada Atanasio Tzul 22-00 Zona 12",
    dicabiMatricula: "01-12-9904-2",
    dicabiArea: "1250.00 m²",
    dicabiObservaciones: "Matrícula fiscal industrial.",
    sector: "Zona 12 Industrial / Atanasio Tzul",
    usoSuelo: "Industrial / Logístico Pesado",
    nivelSocioeconomico: "Industrial",
    formaTerreno: "Regular / Rectangular profundo",
    pendiente: "Plana (0%)",
    esquina: "No",
    accesoCalle: "Calzada principal de alto tonelaje para transporte pesado",
    colindancias: {
      norte: "50.00 m con Bodega B-3",
      sur: "50.00 m con Bodega B-5",
      este: "25.00 m con patio común de maniobras",
      oeste: "25.00 m con Calzada Atanasio Tzul"
    },
    
    servicios: {
      drenajeNegras: "Red municipal industrial",
      drenajePluviales: "Drenaje pluvial con desarenadores",
      pavimentos: "Pavimento de concreto hidráulico de 20cm",
      bordillos: "Concreto pesado",
      aceras: "Concreto reforzado",
      agua: "Pozo propio del complejo con capacidad de 100 GPM",
      telefono: "Troncal digital",
      internetCable: "Fibra óptica dedicada simétrica",
      energia: "Servicio trifásico industrial 480/277V con transformador propio de 150 kVA",
      garita: "Garita de control de transporte pesado con báscula",
      camaras: "Sistema CCTV perimetral con domos PTZ",
      alumbradoPublico: "Iluminación industrial con reflectores LED",
      tipoCalle: "Avenida de transporte pesado"
    },
    serviciosAdicionales: ["Báscula para furgones en garita", "Transformador propio de 150 kVA"],
    
    construccion: {
      edadAprox: "5 años",
      estadoActual: "Muy Bueno",
      apropiadaSector: "Diseño industrial moderno con altura libre de 8.5 metros",
      distribucion: "Área de almacenaje libre de columnas intermedias (950 m²), área de carga con 2 andenes hidráulicos, oficinas administrativas en mezzanina con baños para personal operativo y administrativo.",
      estructura: "Marcos rígidos de acero estructural tipo I y costaneras galvanizadas",
      paredes: "Muros perimetrales de block hasta 3m de altura y cerramiento superior de lámina troquelada prepintada",
      techoEntrePiso: "Cubierta curva autoportante con láminas traslúcidas de policarbonato y losacero en área de oficinas",
      piso: "Losa de concreto de 18 cm con endurecedor metálico antipolvo pulido espejo",
      puertas: "Portones metálicos enrollables motorizados de 5x5 metros en andenes",
      ventanas: "Perfilería de aluminio anodizado en área administrativa",
      sanitaria: "Servicios sanitarios completos con duchas y vestidores para operarios",
      electrica: "Luminarias tipo campana LED de alta bahía e instalación contra incendios",
      factoresPositivos: "Excelente conectividad logística hacia el puerto y vías principales, altura libre óptima.",
      factoresNegativos: "Restricción municipal de horarios para circulación de transporte pesado."
    },
    
    desgloseTerreno: { 
      area: 1250.00, 
      unidad: "m²", 
      valorUnitario: 2200, 
      total: 2750000,
      fincaAsociada: "12450",
      varasCuadradas: 1788.94
    },
    desgloseConstruccion: { 
      area: 1150.00, 
      unidad: "m²", 
      valorUnitario: 3000, 
      total: 3450000 
    },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: []
  },
  {
    id: "cv-2026-001",
    codigo: "CV-2026-001",
    tenantId: "cverde",
    tipoAvaluo: "Residencial",
    solicitante: "BANCO INDUSTRIAL, S.A.",
    fechaSolicitud: "2026-08-05",
    fechaInspeccion: "10 de agosto de 2026",
    fechaActualizacion: "",
    bienMostradoPor: "Ing. Carlos Enrique Villagrán",
    direccion: "Km 18.5 Carretera a El Salvador, Condominio Los Encinos, Lote 45, Manzana C, Fraijanes, Guatemala",
    coordenadas: "14.52184, -90.45892",
    descripcionGeneral: "Residencia campestre de dos niveles con estructura de concreto armado, techo de teja decorativa sobre losa, finos acabados de madera tratada, jardín frontal, pérgola social y garaje techado para 3 vehículos.",
    dpi: "2541 68912 0101",
    referenciaActualizacion: "Avalúo comercial formal para garantía hipotecaria",
    estado: "autorizado",
    observacionesAutorizador: "Inspección técnica física y análisis de mercado conformes a normativas bancarias. Garantía calificada de primer orden.",
    aplicaTerreno: true,
    dictamenGarantia: "“El inmueble reúne las condiciones técnicas, físicas y de mercado requeridas para constituir garantía fiduciaria o hipotecaria ante entidades del sistema bancario nacional, según las normativas y políticas crediticias vigentes.”",
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    incluirFirmaRevisor: true,
    
    fincas: [
      { 
        finca: "3412", 
        folio: "112", 
        libro: "45E de Guatemala", 
        propietario: "Desarrollos Campestres Los Encinos, S.A.",
        areaRegistrada: 450.00,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 450.00,
        areaFisica: 450.00,
        areaValuada: 450.00,
        dicabiNombre: "Desarrollos Campestres Los Encinos, S.A.",
        dicabiDireccion: "Km 18.5 Carretera a El Salvador, Condominio Los Encinos, Lote 45",
        dicabiMatricula: "01-08-4123-5",
        dicabiArea: "450.00 m²",
        dicabiObservaciones: "Inmueble solvente en IUSI municipal de Fraijanes."
      }
    ],

    colindancias: {
      norte: "Con Lote 46 en 30.00 metros",
      sur: "Con Lote 44 en 30.00 metros",
      este: "Con calle principal del condominio en 15.00 metros",
      oeste: "Con área verde comunal en 15.00 metros",
      norteFisica: "Muro perimetral propio de block visto",
      surFisica: "Muro medianero con vivienda vecina",
      esteFisica: "Portón de ingreso vehicular y peatonal",
      oesteFisica: "Muro perimetral colindante a bosque de pinos"
    },

    formaTerreno: "Regular / Rectangular",
    pendiente: "Inclinación suave hacia el este (2%)",
    orientacion: "Oriente",
    
    servicios: {
      agua: true,
      drenajes: true,
      electricidad: true,
      alumbrado: true,
      pavimento: true,
      aceras: true,
      telefono: true,
      cable: true,
      internet: true,
      transporte: true,
      seguridad: true,
      pozoPropio: true,
      garita: true
    },

    valorComercialGTQ: 2150000,
    valorBancarioGTQ: 1720000,
    valorComercialUSD: 281937,
    valorBancarioUSD: 225550,
    tipoCambio: 7.62581,
    
    factores: {
      ubicacion: "Sector campestre de alta plusvalía residencial en Fraijanes.",
      entorno: "Condominio cerrado de alta categoría con garita de control 24/7.",
      acceso: "Boulevard principal asfaltado de cuatro carriles.",
      tendencia: "Crecimiento inmobiliario y consolidación residencial sostenida.",
      factoresPositivos: "Entorno natural con amplias áreas verdes y excelente seguridad privada.",
      factoresNegativos: "Tráfico vehicular en horas pico sobre Carretera a El Salvador."
    },
    
    desgloseTerreno: { 
      area: 450.00, 
      unidad: "m²", 
      valorUnitario: 1800, 
      total: 810000,
      fincaAsociada: "3412",
      varasCuadradas: 644.02
    },
    desgloseConstruccion: { 
      area: 320.00, 
      unidad: "m²", 
      valorUnitario: 4187.50, 
      total: 1340000 
    },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: []
  },
  {
    id: "cv-2026-002",
    codigo: "CV-2026-002",
    tenantId: "cverde",
    tipoAvaluo: "Comercial",
    solicitante: "BANCO AGROMERCANTIL (BAM)",
    fechaSolicitud: "2026-08-14",
    fechaInspeccion: "16 de agosto de 2026",
    fechaActualizacion: "",
    bienMostradoPor: "Ing. Carlos Enrique Villagrán",
    direccion: "4ta Avenida 12-59 Zona 10, Plaza Comercial Fontabella, Local 204, Ciudad de Guatemala",
    coordenadas: "14.59821, -90.51231",
    descripcionGeneral: "Local comercial ubicado en segundo nivel de prestigiosa plaza comercial en Zona Viva. Cuenta con mezzanine, vitrina de exhibición en vidrio templado y acabados corporativos.",
    dpi: "1982 45120 0101",
    referenciaActualizacion: "Valuación comercial para garantía de línea de crédito",
    estado: "revision",
    observacionesAutorizador: "Pendiente confirmación de solvencia de cuota de mantenimiento de la plaza.",
    aplicaTerreno: false,
    dictamenGarantia: "“El inmueble reúne las condiciones técnicas, físicas y de mercado requeridas para constituir garantía fiduciaria o hipotecaria ante entidades del sistema bancario nacional, según las normativas y políticas crediticias vigentes.”",
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Edgar Rolando Martínez Larios",
    registroRevisor: "Valuador autorizado 2571-M-2026",
    incluirFirmaRevisor: true,
    
    fincas: [
      { 
        finca: "7820", 
        folio: "120", 
        libro: "180E de Propiedad Horizontal de Guatemala", 
        propietario: "Inversiones Comerciales Plaza Viva, S.A.",
        areaRegistrada: 85.50,
        areaDesmembrada: 0.00,
        areaActualRegistrada: 85.50,
        areaFisica: 85.50,
        areaValuada: 85.50,
        dicabiNombre: "Inversiones Comerciales Plaza Viva, S.A.",
        dicabiDireccion: "4ta Avenida 12-59 Zona 10, Local 204",
        dicabiMatricula: "01-10-8912-3",
        dicabiArea: "85.50 m²",
        dicabiObservaciones: "Matrícula fiscal de filial en PH."
      }
    ],

    colindancias: {
      norte: "Con pasillo de circulación comercial en 7.00 metros",
      sur: "Con Local 203 en 12.21 metros",
      este: "Con Local 205 en 12.21 metros",
      oeste: "Con fachada exterior en 7.00 metros"
    },

    formaTerreno: "Regular",
    pendiente: "Plano (Nivel 2)",
    orientacion: "Poniente",
    
    servicios: {
      agua: true,
      drenajes: true,
      electricidad: true,
      alumbrado: true,
      pavimento: true,
      aceras: true,
      telefono: true,
      cable: true,
      internet: true,
      transporte: true,
      seguridad: true,
      pozoPropio: false,
      garita: true
    },

    valorComercialGTQ: 1850000,
    valorBancarioGTQ: 1480000,
    valorComercialUSD: 242597,
    valorBancarioUSD: 194078,
    tipoCambio: 7.62581,
    
    desgloseTerreno: { 
      area: 0, 
      unidad: "m²", 
      valorUnitario: 0, 
      total: 0 
    },
    desgloseConstruccion: { 
      area: 85.50, 
      unidad: "m²", 
      valorUnitario: 21637.42, 
      total: 1850000 
    },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
    },
    consultasPdfs: []
  }
];
