# 🚀 Laboratorio de Travesuras: React vs. Vue en Bluehost

¡Bienvenido al laboratorio! Este documento contiene la guía rápida y las ideas para probar y comparar **React** y **Vue** mañana, incluyendo cómo compilar ambos para que corran en tu servidor **Bluehost**.

---

## 💡 ¿Vue también es SPA?
**¡Sí, 100%!** 
Vue nació precisamente como un framework para crear **SPAs (Single Page Applications)**. 
- Funciona exactamente igual que React en el navegador: carga un único archivo `index.html` y luego JavaScript cambia el contenido en pantalla al instante sin recargar la página ni parpadear.
- Ambos usan **Vite** para compilarse en una carpeta estática `dist/` que no requiere Node.js en Bluehost.

---

## 🧪 Comparativa rápida: React vs. Vue

| Concepto | React | Vue |
| :--- | :--- | :--- |
| **Extensión de archivo** | `.jsx` | `.vue` (Single File Component) |
| **Cómo se programa** | Todo es JS (`return <h1>Hola</h1>`) | Tres bloques limpios: `<template>`, `<script>`, `<style>` |
| **Inputs / Formularios** | `value={nombre} onChange={e => setNombre(e.target.value)}` | `v-model="nombre"` (enlace automático bidireccional) |
| **Condicionales** | `{activo ? <Componente /> : null}` | `<div v-if="activo">...</div>` |
| **Listas y Bucles** | `{items.map(item => <li key={item.id}>{item.nombre}</li>)}` | `<li v-for="item in items" :key="item.id">{{ item.nombre }}</li>` |

---

## 🛠️ Comandos mágicos para iniciar proyectos con Vite

Para crear cada proyecto en segundos en tu terminal (en la carpeta de proyectos fuera de este repo):

### 1. Para crear el proyecto React:
```bash
npm create vite@latest demo-react -- --template react
cd demo-react
npm install
npm run dev
```

### 2. Para crear el proyecto Vue:
```bash
npm create vite@latest demo-vue -- --template vue
cd demo-vue
npm install
npm run dev
```

---

## 🎯 Las 2 Ideas Ficticias para Mañana

### Idea 1 (En React): ☕ *Café Metrics — Tablero de Cata y Ventas de Café Especial*
* **De qué trata:** Una mini app para registrar lotes de café de Guatemala (Antigua, Huehuetenango, Cobán), calificar notas de cata (acidez, cuerpo, fragancia con estrellas interactivas) y calcular márgenes de venta.
* **Qué probamos:** Estados en React (`useState`), componentes modulares, tarjetas interactivas y cálculo automático de totales.

### Idea 2 (En Vue): 🛸 *AstroFleet — Catálogo y Simulador de Naves Espaciales*
* **De qué trata:** Un catálogo interactivo de naves de exploración espacial donde puedes filtrar en vivo por velocidad warp, tipo de tripulación y cambiarle el color/equipamiento a la nave en tiempo real.
* **Qué probamos:** La reactividad mágica de Vue (`v-model`, `computed`), directivas sencillas (`v-if`, `v-for`) y el formato `.vue` con HTML, JS y CSS en un solo archivo.

---

## 🌐 Cómo dejar cualquiera de los dos listo para Bluehost

En ambos proyectos, para que funcionen tanto en subdominios (`demo.tudominio.com`) como en subcarpetas (`tudominio.com/pruebas/`):

1. En `vite.config.js`, agregar `base: './'`:
   ```javascript
   export default defineConfig({
     base: './',
     plugins: [...]
   })
   ```
2. Ejecutar la compilación:
   ```bash
   npm run build
   ```
3. Subir el contenido de la carpeta `dist/` resultante a tu `public_html/nombre-carpeta` en Bluehost.
4. Agregar el archivo `.htaccess` en esa misma carpeta de Bluehost:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---
*¡Listo para la acción cuando gustes! Mañana lo despegamos paso a paso.*
