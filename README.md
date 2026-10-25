# Plataforma de Gestión, Valuación y Emisión de Avalúos (Multi-Tenant)

Aplicación web profesional de alto rendimiento diseñada para la administración integral de avalúos comerciales, residenciales, bancarios e industriales en Guatemala. Cuenta con una arquitectura **Multi-Tenant** que permite operar de forma aislada o consolidada las firmas **LEX ROSAM, S.A.** y **C VERDE, S.A.**

---

## 🏛️ Entidades y Arquitectura Multi-Tenant

La plataforma soporta la operación independiente de dos firmas con identidades, numeraciones, firmantes y colores corporativos diferenciados, administradas centralizadamente desde [src/data/tenantsConfig.js](src/data/tenantsConfig.js):

| Firma | Identificador | Correlativo | Paleta Corporativa | Sitio / Contacto |
| :--- | :---: | :---: | :---: | :--- |
| **LEX ROSAM, S.A.** | `lex-rosam` | `LR-2026-XXX` | Azul Marino (`#0d2847`) & Slate (`#1b497d`) | [lexrosam.com](https://lexrosam.com/) |
| **C VERDE, S.A.** | `cverde` | `CV-2026-XXX` | Verde Bosque (`#004e3b`) & Esmeralda (`#007956`) | [cverde.com.gt](https://cverde.com.gt) |
| **Modo Consolidado** | `all` *(Todas)* | Mixto | Vista Unificada Ejecutiva | Control Maestro |

### Selector de Empresa en Barra Superior (Navbar)
* **Filtrado por Empresa**: Permite enfocar la pantalla en **LEX ROSAM** o en **C VERDE**. Al seleccionar una entidad, las métricas del dashboard, los expedientes mostrados, los correlativos sugeridos y los temas visuales se adaptan automáticamente a dicha firma.
* **Modo "Todas" (Consolidado)**: Diseñado para la dirección general de **Lic. Aroldo Ruiz**, permitiendo visualizar la cartera completa combinada, exportar respaldos consolidados y auditar todos los expedientes en un solo lugar.
* **Aislamiento por Expediente**: Cada avalúo almacena su campo `tenantId`. Sin importar en qué vista se encuentre el usuario, cada avalúo individual conservará siempre su identidad, su membrete oficial, sus datos de contacto y sus colores propios.

---

## 👥 Equipo y Roles del Sistema

1. **Lic. Aroldo Ruiz** — *Dueño y Administrador de la Plataforma*:
   - Valuador Autorizado No. 2572-R-2026.
   - Acceso irrestricto a todas las empresas (`tenantId: 'all'`).
   - Gestión de usuarios y colaboradores del equipo.
   - Aprobación final de avalúos y habilitación de modificaciones para técnicos de campo.
2. **Ramiro Nóchez** — *Soporte Técnico (Technical Support)*:
   - Configuración de infraestructura, soporte de software y mantenimiento evolutivo.
3. **Colaboradores y Técnicos de Campo**:
   - Levantamiento de fichas, registro de inspección, toma de fotografías y captura de coordenadas satelitales.

---

## 🔍 Funcionalidades Principales

### 1. Motor de Búsqueda Omnicanal (Omnisearch)
* **Búsqueda en tiempo real**: Por código (`LR-2026-001`, `CV-2026-072`), nombre de propietario o solicitante, banco (`G&T`, `Industrial`, `BAM`, `Banrural`), dirección física o datos registrales (`Finca`, `Folio`, `Libro`).
* **Filtros Avanzados**: Por Empresa (Tenant), Estado (Borrador, En Proceso, Completado), Tipo de Inmueble y Banco Solicitante.
* **Doble Modo de Visualización**: Modo Tarjetas (diseñado para teléfonos y tablets) y Modo Tabla (alta densidad de datos para computadora).

### 2. Asistente Integral de Creación y Edición de Expedientes
* **Captura GPS Satelital**: Botón con geolocalización directa de coordenadas in situ (`lat, lng`).
* **Soporte Multi-Finca**: Registro detallado de múltiples fincas, folios y libros, con áreas individualizadas (Original Registrada, Desmembrada, Física y Valuada).
* **Fórmula Oficial de Conversión**: Cálculo automático de varas cuadradas ($v^2 = m^2 \times 1.43115$).
* **Régimen de Propiedad Horizontal**: Interruptor (*toggle*) para activar o desactivar la valoración del terreno en apartamentos y edificios en PH.
* **Fechas Mutuamente Excluyentes**: Control estricto entre *Fecha de Inspección* y *Fecha de Actualización* según normativa bancaria.
* **Valoración Dual**: Cuadros de Valuación Comercial y Valuación Bancaria (80%) con conversión automática a Dólares según el Tipo de Cambio del Banco de Guatemala.
* **Dictamen de Garantía Editable**: Selección rápida de plantillas oficiales con posibilidad de personalización para casos especiales.
* **31 Servicios Públicos e Infraestructura**: Checklist completo estandarizado para inspección de campo.

### 3. Carga y Procesamiento de Documentos Registrales (RGP y DICABI)
* **Certificaciones Electrónicas RGP**: Carga de archivos PDF del Registro General de la Propiedad, procesados mediante PDF.js y presentados a **1 página por hoja** para garantizar total legibilidad de firmas, sellos y razones registrales.
* **Almacenamiento Híbrido Resiliente**: Almacenamiento seguro en Google Cloud Firestore con soporte offline e IndexedDB para documentos de gran tamaño.
* **Álbum Fotográfico Completo**: Entorno, Ingreso, Interiores, Ubicación Satelital, Croquis y Boleta DICABI.

### 4. Informe Oficial de Impresión Idéntico al Formato Físico
* Vista previa de alta fidelidad que replica exactamente el estándar oficial de 9+ páginas:
  - **Página 1**: Identificación del inmueble, solicitante, coordenadas y cuadro de *RESÚMENES*.
  - **Página 2**: Limitaciones, dictamen resumido, cuadro de valores y firmas autorizadas.
  - **Página 3**: Calificación de garantía y consideraciones generales del informe.
  - **Página 4**: Consulta a distancia, antecedentes registrales, desglose de áreas y aspectos legales.
  - **Página 5**: Dirección de Catastro (DICABI), características del terreno y colindancias por rumbo cardinal (físicas y registrales).
  - **Página 6**: Servicios e infraestructura, características constructivas y **1. Valuación Comercial** (Terreno y Construcción).
  - **Página 7**: **2. Valuación Bancaria**, cuadros de liquidación bancaria (80%) y cláusula de cierre.
  - **Páginas 8+**: Registro fotográfico numerado.
  - **Páginas Finales**: Matrícula DICABI y certificaciones electrónicas del RGP (desglosadas a página completa).
* **Colores Corporativos Dinámicos**: Tanto en pantalla como al imprimir (`Cmd + P` o exportar PDF), los encabezados y recuadros de valuación adoptan el color de la empresa emisora (**Verde Bosque** `#004e3b` para C VERDE, **Azul Marino** `#0d2847` para LEX ROSAM).

---

## 🛠️ Tecnologías Utilizadas

* **Frontend**: React 19, JavaScript moderno (ESNext), Vite 8.
* **Estilizado**: Vanilla CSS con variables CSS personalizadas, diseño responsivo y optimización de impresión `@media print`.
* **Iconografía**: Lucide React.
* **Renderizado de PDFs**: PDF.js (`pdfjs-dist`).
* **Backend y Almacenamiento**: Google Firebase (Cloud Firestore y Authentication).

---

## 💻 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar paquete de producción
npm run build

# Análisis de código (Linter)
npm run lint
```
