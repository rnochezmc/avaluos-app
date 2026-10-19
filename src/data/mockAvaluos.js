// Mock inicial de expedientes de avalúos basados exactamente en el formato LEX ROSAM S.A.
export const initialAvaluos = [
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
        areaValuada: 145.08
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
        areaValuada: 54.00
      }
    ],
    propietarioPrincipal: "WALTER MANFREDO GOMEZ HIGUEROS",
    areaRegistrada: 361.08,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 361.08,
    areaFisica: 361.08,
    areaValuada: 199.08,
    
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
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
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
      oeste: "10.76 m con lote colindante"
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
      ubicacion: "",
      croquis: "",
      dicabi: ""
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
        areaValuada: 285.25
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
        areaValuada: 285.25
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
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
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
      ubicacion: "",
      croquis: "",
      dicabi: ""
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
    observacionesAutorizador: "Haroldo Ruiz: Por favor verificar la medida de desmembración en Finca 8912 e ingresar las colindancias exactas del plano.",
    
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
        areaValuada: 350.00
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
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
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
      ubicacion: "",
      croquis: "",
      dicabi: ""
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
        areaValuada: 1250.00
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
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
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
      ubicacion: "",
      croquis: "",
      dicabi: ""
    },
    consultasPdfs: []
  }
];
