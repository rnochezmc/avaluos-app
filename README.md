# C VERDE — Sistema de Registro, Control y Manejo de Avalúos

Aplicación web progresiva (PWA) responsiva para la gestión integral de avalúos comerciales, residenciales e industriales, basada en el formato oficial de **C VERDE S.A. / Avalúos & Negocios Inmobiliarios** (Guatemala).

---

## 📌 Contexto del Proyecto

* **Propietario / Contacto Principal**: Lic. Aroldo Oliverio Ruiz Orozco (Valuador autorizado 2572-R-2026).
* **Valuador Revisor**: Lic. Luis Felipe Tolaque Tobias (Valuador autorizado 193-T-93).
* **Entidades bancarias soportadas**: Banco G&T Continental, Banco Industrial, Banco Agromercantil (BAM), Banrural, BAC Credomatic.
* **Objetivo de la Fase 1**: Base de datos de acceso gratuito y ágil para Aroldo desde su celular y computadora, sin costos recurrentes de servidores, con almacenamiento de datos y fotografías de campo.
* **Objetivo de la Fase 2 (Monetizable)**: Integración con Inteligencia Artificial (Gemini Multimodal) para escaneo OCR de documentos del Registro General de la Propiedad (RGP) / DICABI, redacción automatizada de dictámenes y exportación automática a PDF oficial.

---

## 🚀 Inicio Rápido (Comandos)

El proyecto está construido con React 19 + Vite y estilizado con un sistema de diseño propio en Vanilla CSS.

```bash
# 1. Ingresar a la carpeta del proyecto
cd /Users/rnochezmc/.gemini/antigravity-ide/scratch/avaluos-app

# 2. Instalar dependencias (si es necesario)
npm install

# 3. Iniciar el servidor local de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

Servidor de desarrollo por defecto: **http://127.0.0.1:5173/**

---

## 🔍 Funcionalidades Principales

### 1. Motor de Búsqueda Omnicanal (Omnisearch)
* **Búsqueda en tiempo real**: Por código de expediente (`LR-2026-001`), nombre del propietario (`Las Cumbres`, `Mendoza`), banco solicitante (`G&T`, `BAM`), dirección / sector (`Zona 10`, `Fraijanes`) o datos registrales (`Finca 4521`, `Folio 21`, `Libro 85E`).
* **Filtros por Estado**: Todos, Completados, En Proceso, Borradores.
* **Filtros por Tipo de Bien**: Comercial, Residencial, Industrial, Finca/Terreno.
* **Filtros por Banco Solicitante**.
* **Doble Modo de Vista**: Modo Tarjetas (ideal para teléfono móvil) y Modo Tabla (alta densidad para computadora).

### 2. Visor y Asistente de Creación de Expedientes
* **Formulario por Pasos (Wizard)**:
  1. *Solicitud e Identificación*: Código, banco, dirección y botón **"Usar mi GPS actual"** (toma las coordenadas satelitales en el terreno).
  2. *Información Registral*: Fincas dinámicas (Finca, Folio, Libro, Propietario) y comparación de áreas (Registrada, Desmembrada, Física y Valuada en m²).
  3. *Terreno y Servicios*: Matrícula DICABI, topografía, colindancias cardinales y checklist de 12 servicios públicos.
  4. *Construcción y Valores*: Cuadros matemáticos con **cálculo automático de subtotales**, valor comercial, valor bancario (80%) y conversión a dólares según el Tipo de Cambio del Banco de Guatemala.
  5. *Álbum Fotográfico*: Carga o captura directa con la cámara del celular en 6 categorías (Entorno, Ingreso, Interiores, Ubicación Satelital, Croquis y Boleta DICABI).

### 3. Impresión Oficial de 9 Páginas Idéntica al Formato Cverde
* Al presionar **"Imprimir"** en cualquier expediente se despliega la **Vista Previa Oficial**:
  * **Página 1**: Solicitante, fechas, coordenadas, resumen registral y áreas.
  * **Página 2**: Limitaciones, cuadro de valores (Q y USD), tipo de cambio y firmas de los dos valuadores autorizados.
  * **Página 3**: Calificación de garantía y las 6 consideraciones generales del informe.
  * **Página 4**: Consulta a distancia, RGP, IUSI, áreas y aspectos legales.
  * **Página 5**: Dirección de Catastro (DICABI), características del terreno y colindancias.
  * **Página 6**: Servicios públicos y características constructivas.
  * **Página 7**: Dictamen de garantía y los **dos cuadros de valoración oficiales con encabezados azules** (Terreno y Construcción).
  * **Página 8**: Galería fotográfica con 5 recuadros numerados.
  * **Página 9**: Matrícula DICABI y consultas electrónicas RGP.
* Reglas `@media print` integradas para generar el PDF limpio a través de `Cmd + P`.

### 4. Seguridad de Datos y Cero Costo
* **Persistencia local inmediata** en `localStorage`.
* **Exportar BD**: Descarga un archivo `.json` de respaldo de todos los expedientes y fotos.
* **Restaurar BD**: Carga la base de datos completa en cualquier momento.

---

## 🎨 Ajuste Final de Nombre de Empresa y Colores Institucionales

Cuando Haroldo confirme el nombre definitivo y los colores oficiales:

1. **Datos de la Empresa / Membrete**: En `src/components/OfficialReportPrintView.jsx`:
   ```javascript
   const company = {
     name: "C VERDE", // Reemplazar por el nombre definitivo
     tagline: "AVALÚOS & NEGOCIOS INMOBILIARIOS",
     phone: "+502 6203-0795",
     emails: "oruiz@cverde.com.gt   jmmorales@cverde.com.gt",
     logoColor: "#0f5132",
     accentColor: "#198754"
   };
   ```
2. **Colores en la Web App**: En `src/index.css`:
   ```css
   :root {
     --cverde-primary: #064e3b; /* Color institucional principal */
     --cverde-accent: #059669;  /* Color de acento / detalles */
     /* ... */
   }
   ```

---

## 📁 Estructura del Proyecto

```text
avaluos-app/
├── index.html                           # Entrada HTML con fuentes Google (Outfit e Inter)
├── package.json                         # Dependencias (React, Lucide-React, Vite)
├── README.md                            # Documentación del proyecto
└── src/
    ├── main.jsx                         # Punto de montaje React
    ├── App.jsx                          # Estado global, búsqueda, filtros y modales
    ├── index.css                        # Tokens CSS, diseño responsivo y reglas @media print
    ├── data/
    │   └── mockAvaluos.js               # Expedientes de prueba con datos reales de Guatemala
    └── components/
        ├── Navbar.jsx                   # Barra superior con logo, respaldo y perfil
        ├── SearchAndFilters.jsx         # Motor omnisearch, filtros de estado/banco y vistas
        ├── StatsOverview.jsx            # Indicadores de cartera (Totales Q y USD)
        ├── AvaluoCard.jsx               # Tarjeta responsiva con fotos y acciones rápidas
        ├── AvaluoTable.jsx              # Vista tabular para computadora
        ├── AvaluoDetailModal.jsx        # Visor interactivo del expediente por pestañas
        ├── AvaluoFormModal.jsx          # Asistente de creación con captura GPS y fotos
        ├── OfficialReportPrintView.jsx  # Replicación exacta de las 9 páginas para imprimir/PDF
        └── MobileBottomNav.jsx          # Barra inferior para navegación en smartphones
```
