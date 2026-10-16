// Mock inicial de expedientes de avalúos basados exactamente en el formato Cverde S.A.
export const initialAvaluos = [
  {
    id: "lr-2026-001",
    codigo: "LR-2026-001",
    tipoAvaluo: "Comercial",
    solicitante: "BANCO G&T CONTINENTAL",
    fechaSolicitud: "2026-07-20",
    fechaActualizacion: "2026-07-24",
    direccion: "15 Avenida 4-32 Zona 10, Ciudad de Guatemala",
    coordenadas: "14.59821, -90.51423",
    descripcionGeneral: "Inmueble de dos niveles con oficinas corporativas, área de atención al cliente y parqueo frontal para 6 vehículos.",
    dpi: "1892 45871 0101",
    referenciaActualizacion: "Inspección física y certificación de valor 2026",
    estado: "completado",
    
    // Información Registral
    fincas: [
      { finca: "4521", folio: "21", libro: "85E de Guatemala", propietario: "Inmobiliaria Las Cumbres S.A." },
      { finca: "4522", folio: "22", libro: "85E de Guatemala", propietario: "Inmobiliaria Las Cumbres S.A." }
    ],
    propietarioPrincipal: "Inmobiliaria Las Cumbres S.A.",
    areaRegistrada: 570.50,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 570.50,
    areaFisica: 572.00,
    areaValuada: 570.50,
    
    // Aspectos Legales
    limitaciones: "Servidumbre de paso recíproca con predio colindante.",
    anotaciones: "Ninguna vigente.",
    gravamenes: "Primera hipoteca a favor de Banco G&T Continental S.A.",
    servidumbres: "Servidumbre de paso y drenaje pluvial.",
    areasComunes: "Acceso pavimentado común.",
    desmembracion: "Sin desmembraciones pendientes.",
    
    // Valores
    valorComercialGTQ: 3850000,
    valorBancarioGTQ: 3080000,
    tipoCambio: 7.62581,
    valorComercialUSD: 504864.40,
    valorBancarioUSD: 403891.52,
    
    // Valuadores
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
    // DICABI & Terreno
    dicabiNombre: "Inmobiliaria Las Cumbres S.A.",
    dicabiDireccion: "15 Avenida 4-32 Zona 10",
    dicabiMatricula: "01-10-8452-9",
    dicabiArea: "570.50 m²",
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
    
    // Servicios
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
    
    // Construcción
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
      factoresNegativos: "Congestionamiento vehicular en horas pico."
    },
    
    // Desglose de Cálculo
    desgloseTerreno: { area: 570.50, unidad: "m²", valorUnitario: 3500, total: 1996750 },
    desgloseConstruccion: { area: 480.00, unidad: "m²", valorUnitario: 3860.94, total: 1853250 },
    
    // Fotografías y Anexos
    fotos: {
      entorno: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "lr-2026-002",
    codigo: "LR-2026-002",
    tipoAvaluo: "Residencial",
    solicitante: "BANCO INDUSTRIAL",
    fechaSolicitud: "2026-08-05",
    fechaActualizacion: "2026-08-10",
    direccion: "Km 18.5 Carretera a Fraijanes, Condominio Las Luces, Casa 45",
    coordenadas: "14.51230, -90.46890",
    descripcionGeneral: "Vivienda unifamiliar aislada de dos niveles con jardín posterior, garaje techado para 3 vehículos y pérgola.",
    dpi: "2450 31245 0101",
    referenciaActualizacion: "Solicitud de crédito hipotecario para adquisición de vivienda",
    estado: "proceso",
    
    fincas: [
      { finca: "9820", folio: "320", libro: "115E de Guatemala", propietario: "Carlos Fernando Mendoza Morales" }
    ],
    propietarioPrincipal: "Carlos Fernando Mendoza Morales",
    areaRegistrada: 420.00,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 420.00,
    areaFisica: 420.00,
    areaValuada: 420.00,
    
    limitaciones: "Reglamento interno de copropiedad y construcción de Condominio Las Luces.",
    anotaciones: "Ninguna.",
    gravamenes: "Libre de gravámenes vigentes.",
    servidumbres: "Paso vehicular, drenajes y electricidad subterránea.",
    areasComunes: "Casa club, piscina, canchas de tenis y áreas verdes comunes.",
    desmembracion: "No.",
    
    valorComercialGTQ: 2150000,
    valorBancarioGTQ: 1720000,
    tipoCambio: 7.62581,
    valorComercialUSD: 281937.26,
    valorBancarioUSD: 225549.81,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
    dicabiNombre: "Carlos Fernando Mendoza Morales",
    dicabiDireccion: "Condominio Las Luces, Manzana D, Casa 45",
    dicabiMatricula: "01-18-9921-3",
    dicabiArea: "420.00 m²",
    sector: "Fraijanes / Carretera a El Salvador",
    usoSuelo: "Residencial Condominio",
    nivelSocioeconomico: "Medio-Alto",
    formaTerreno: "Regular",
    pendiente: "Suave inclinación descendente (3%)",
    esquina: "Sí",
    accesoCalle: "Boulevard interno de concreto con bordillo",
    colindancias: {
      norte: "28.00 m con Lote 44",
      sur: "28.00 m con Calle interna",
      este: "15.00 m con Lote 46",
      oeste: "15.00 m con Avenida Las Luces"
    },
    
    servicios: {
      drenajeNegras: "Planta de tratamiento de condominio",
      drenajePluviales: "Red interna de drenaje",
      pavimentos: "Concreto estampado",
      bordillos: "Concreto",
      aceras: "Concreto con gramaquín",
      agua: "Pozo propio del condominio",
      telefono: "Red subterránea",
      internetCable: "Claro / Tigo fibra óptica",
      energia: "EEGSA acometida 240V",
      garita: "Doble garita de seguridad con tag electrónico",
      camaras: "Monitoreo 24/7",
      alumbradoPublico: "Faroles coloniales LED",
      tipoCalle: "Vía interna de condominio"
    },
    
    construccion: {
      edadAprox: "3 años",
      estadoActual: "Excelente",
      apropiadaSector: "Armoniza perfectamente con las normas de fachada del condominio",
      distribucion: "Sala principal, comedor, cocina con isla, 4 dormitorios con baño, sala familiar, lavandería.",
      estructura: "Mampostería reforzada con zapatas y soleras de amarre",
      paredes: "Block de primera con alisado plástico",
      techoEntrePiso: "Losa tradicional con teja decorativa impermeable",
      piso: "Piso cerámico imitación madera en dormitorios y porcelanato en áreas sociales",
      puertas: "Madera de ciprés tratada",
      ventanas: "PVC blanco con doble vidrio aislante",
      sanitaria: "Inodoros ecológicos y grifería monocontrol",
      electrica: "Tablero centralizado con breakers termo-magnéticos",
      factoresPositivos: "Condominio de alta seguridad, áreas verdes infantiles, clima fresco.",
      factoresNegativos: "Distancia al centro urbano de la capital."
    },
    
    desgloseTerreno: { area: 420.00, unidad: "m²", valorUnitario: 1800, total: 756000 },
    desgloseConstruccion: { area: 320.00, unidad: "m²", valorUnitario: 4356.25, total: 1394000 },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "lr-2026-003",
    codigo: "LR-2026-003",
    tipoAvaluo: "Industrial",
    solicitante: "BANCO AGROMERCANTIL (BAM)",
    fechaSolicitud: "2026-09-02",
    fechaActualizacion: "2026-09-08",
    direccion: "Calzada Roosevelt 34-12 Zona 11, Complejo Industrial Las Rosas, Ofibodega 8",
    coordenadas: "14.62105, -90.56214",
    descripcionGeneral: "Ofibodega con área de almacenamiento a doble altura, rampa de carga para contenedores y mezanine de oficinas.",
    dpi: "1654 99872 0101",
    referenciaActualizacion: "Línea de crédito comercial y garantía prendaria/hipotecaria",
    estado: "completado",
    
    fincas: [
      { finca: "12845", folio: "45", libro: "302E de Guatemala", propietario: "Logística y Distribución Maya S.A." }
    ],
    propietarioPrincipal: "Logística y Distribución Maya S.A.",
    areaRegistrada: 780.00,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 780.00,
    areaFisica: 780.00,
    areaValuada: 780.00,
    
    limitaciones: "Anotación de servidumbre de paso de transporte pesado.",
    anotaciones: "Sin demandas ni embargos.",
    gravamenes: "Hipotecaria a favor de BAM.",
    servidumbres: "Patio de maniobras compartido.",
    areasComunes: "Báscula de pesaje y seguridad 24 horas.",
    desmembracion: "No.",
    
    valorComercialGTQ: 5600000,
    valorBancarioGTQ: 4480000,
    tipoCambio: 7.62581,
    valorComercialUSD: 734348.22,
    valorBancarioUSD: 587478.58,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
    dicabiNombre: "Logística y Distribución Maya S.A.",
    dicabiDireccion: "Calzada Roosevelt 34-12 Zona 11, Bodega 8",
    dicabiMatricula: "01-11-2309-1",
    dicabiArea: "780.00 m²",
    sector: "Roosevelt / Zona 11 Industrial",
    usoSuelo: "Industrial Liviano / Almacenamiento",
    nivelSocioeconomico: "Comercial / Logístico",
    formaTerreno: "Rectangular",
    pendiente: "Totalmente plana",
    esquina: "No",
    accesoCalle: "Avenida apta para transporte pesado y cabezales",
    colindancias: {
      norte: "39.00 m con Bodega 7",
      sur: "39.00 m con Bodega 9",
      este: "20.00 m con Patio de maniobras",
      oeste: "20.00 m con Muro perimetral"
    },
    
    servicios: {
      drenajeNegras: "Red municipal",
      drenajePluviales: "Trinchera de desagüe pluvial",
      pavimentos: "Concreto de alta resistencia 4000 PSI",
      bordillos: "Concreto reforzado",
      aceras: "Peatonal frontal",
      agua: "Red municipal",
      telefono: "Líneas de planta telefónica",
      internetCable: "Fibra simétrica",
      energia: "Trifásica de alta capacidad con transformador",
      garita: "Control de acceso de transporte pesado",
      camaras: "CCTV periférico",
      alumbradoPublico: "Proyectores industriales",
      tipoCalle: "Pavimento pesado"
    },
    
    construccion: {
      edadAprox: "4 años",
      estadoActual: "Excelente",
      apropiadaSector: "Diseño industrial de última generación",
      distribucion: "Nave de 600m² a 8 metros de cumbrera, mezanine administrativo de 180m², 2 baños con ducha, anden de carga.",
      estructura: "Pórticos metálicos de alma llena con pernos de alta resistencia",
      paredes: "Muro perimetral de block hasta 3 metros y lámina termoacústica esmaltada",
      techoEntrePiso: "Lámina Aluzinc con tragaluces de policarbonato al 15%",
      piso: "Concreto pulido tratado con endurecedor de cuarzo",
      puertas: "Persiana metálica enrollable motorizada de 5x5m",
      ventanas: "Ventanería de aluminio natural en área de oficinas",
      sanitaria: "Instalaciones para personal de bodega y visitas",
      electrica: "Iluminación campanas LED industriales",
      factoresPositivos: "Ubicación logística estratégica sobre Calzada Roosevelt con conexión inmediata a periferia.",
      factoresNegativos: "Restricción de horario para transporte pesado en la calzada principal."
    },
    
    desgloseTerreno: { area: 780.00, unidad: "m²", valorUnitario: 2800, total: 2184000 },
    desgloseConstruccion: { area: 780.00, unidad: "m²", valorUnitario: 4379.49, total: 3416000 },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
    }
  },
  {
    id: "lr-2026-004",
    codigo: "LR-2026-004",
    tipoAvaluo: "Residencial",
    solicitante: "BANCO G&T CONTINENTAL",
    fechaSolicitud: "2026-10-01",
    fechaActualizacion: "2026-10-12",
    direccion: "Avenida Las Américas 18-40 Zona 14, Apartamento 10B, Edificio Torre Bellavista",
    coordenadas: "14.58210, -90.52110",
    descripcionGeneral: "Apartamento de lujo en décimo nivel con vista panorámica hacia los volcanes, balcón amplio y 3 parqueos individuales en sótano.",
    dpi: "1923 88124 0101",
    referenciaActualizacion: "Avalúo de garantía hipotecaria",
    estado: "borrador",
    
    fincas: [
      { finca: "18920", folio: "420", libro: "510E de Propiedad Horizontal", propietario: "María René Castillo Asturias" }
    ],
    propietarioPrincipal: "María René Castillo Asturias",
    areaRegistrada: 215.00,
    areaDesmembrada: 0.00,
    areaActualRegistrada: 215.00,
    areaFisica: 215.00,
    areaValuada: 215.00,
    
    limitaciones: "Sujeto a Régimen de Propiedad Horizontal de Torre Bellavista.",
    anotaciones: "Ninguna.",
    gravamenes: "En trámite de constitución hipotecaria.",
    servidumbres: "De paso común, elevadores y ductos técnicos.",
    areasComunes: "Lobby de triple altura, gimnasio, piscina climatizada, salón social, business center.",
    desmembracion: "No.",
    
    valorComercialGTQ: 2950000,
    valorBancarioGTQ: 2360000,
    tipoCambio: 7.62581,
    valorComercialUSD: 386843.91,
    valorBancarioUSD: 309475.13,
    
    valuadorPrincipal: "Lic. Aroldo Oliverio Ruiz Orozco",
    registroPrincipal: "Valuador autorizado 2572-R-2026",
    valuadorRevisor: "Lic. Luis Felipe Tolaque Tobias",
    registroRevisor: "Valuador autorizado 193-T-93",
    
    dicabiNombre: "María René Castillo Asturias",
    dicabiDireccion: "Avenida Las Américas 18-40 Zona 14, Apto 10B",
    dicabiMatricula: "01-14-1102-5",
    dicabiArea: "215.00 m²",
    sector: "Zona 14 / Las Américas",
    usoSuelo: "Residencial Vertical de Lujo",
    nivelSocioeconomico: "Alto / Premium",
    formaTerreno: "Finca Filial (Propiedad Horizontal)",
    pendiente: "No aplica",
    esquina: "Sí (Torre en esquina)",
    accesoCalle: "Boulevard Las Américas",
    colindancias: {
      norte: "Con Apartamento 10A",
      sur: "Con Balcón exterior hacia Av. Las Américas",
      este: "Con Pasillo de elevadores",
      oeste: "Con Fachada lateral poniente"
    },
    
    servicios: {
      drenajeNegras: "Red de bajadas del edificio",
      drenajePluviales: "Captación pluvial técnica del edificio",
      pavimentos: "Pavimento urbano de primer orden",
      bordillos: "Concreto y adoquín decorativo",
      aceras: "Plaza peatonal arbolada",
      agua: "Pozo propio y cisterna con tratamiento",
      telefono: "Red IP centralizada",
      internetCable: "Fibra hasta el apartamento",
      energia: "Generador eléctrico de respaldo total (100% de la torre)",
      garita: "Recepción y concierge 24 horas",
      camaras: "Sistema integral de videovigilancia biométrica",
      alumbradoPublico: "Iluminación de bulevar",
      tipoCalle: "Bulevar de alta categoría"
    },
    
    construccion: {
      edadAprox: "1 año (Prácticamente nuevo)",
      estadoActual: "Excelente / Impecable",
      apropiadaSector: "Máximo estándar de calidad residencial en el país",
      distribucion: "Vestíbulo de ingreso, sala-comedor integrados, terraza panorámica, cocina italiana equipada, máster suite con walk-in closet y tina, 2 habitaciones secundarias con baño, cuarto de servicio.",
      estructura: "Concreto postensado y muros sismorresistentes",
      paredes: "Tablayeso acústico doble con aislamiento de lana de vidrio",
      techoEntrePiso: "Cielos falsos suspendidos con diseño de iluminación indirecta",
      piso: "Piso de madera de ingeniería en dormitorios y mármol en áreas sociales",
      puertas: "Puertas enchapadas en madera natural de piso a cielo (2.70m de altura)",
      ventanas: "Ventanería alemana termoacústica de piso a cielo",
      sanitaria: "Artefactos suspendidos con grifería alemana Hansgrohe",
      electrica: "Domótica integrada para iluminación y cortinas",
      factoresPositivos: "Exclusividad residencial de Zona 14, amenidades de lujo, plusvalía asegurada.",
      factoresNegativos: "Cuota de mantenimiento mensual elevada."
    },
    
    desgloseTerreno: { area: 45.00, unidad: "m² (cuota copropiedad)", valorUnitario: 8000, total: 360000 },
    desgloseConstruccion: { area: 215.00, unidad: "m²", valorUnitario: 12046.51, total: 2590000 },
    
    fotos: {
      entorno: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      ingreso: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      interior: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      ubicacion: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
      croquis: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
      dicabi: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
    }
  }
];
