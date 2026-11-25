import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Configuración pública de Firebase del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBkvww64wA8GZtDnWuSY4lBWXfFYpsMdPk",
  authDomain: "lexrosam-avaluos.firebaseapp.com",
  projectId: "cverde-avaluos-gt",
  storageBucket: "cverde-avaluos-gt.firebasestorage.app",
  messagingSenderId: "541486764518",
  appId: "1:541486764518:web:5c2e67453d3bd330210627"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Permite buscar por código opcional desde la terminal: node scripts/consultar-casos.js [codigo]
const searchArg = process.argv[2] ? process.argv[2].trim().toUpperCase() : null;

async function consultar() {
  console.log('📡 Conectando a Firestore (cverde-avaluos-gt)...');

  if (searchArg) {
    console.log(`🔍 Buscando expediente con código o ID que contenga: "${searchArg}"...\n`);
    const snap = await getDocs(collection(db, 'avaluos'));
    let found = false;

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const match = (d.codigo && d.codigo.toUpperCase().includes(searchArg)) ||
                    (docSnap.id && docSnap.id.toUpperCase().includes(searchArg));
      if (match) {
        found = true;
        imprimirDetalle(docSnap.id, d);
      }
    });

    if (!found) {
      console.log(`❌ No se encontró ningún expediente con "${searchArg}".`);
    }
  } else {
    // Si no se especifica código, muestra los casos de campo recientes (10052, 10055, 10056, 10057)
    console.log('📋 Mostrando últimos expedientes de campo recientes:\n');
    const ids = [
      { id: 'cv-2026-8223', desc: 'Edificio CAUMA' },
      { id: 'cv-2026-4580', desc: 'Edificio ERA 10 - Apto 806' },
      { id: 'cv-2026-0364', desc: 'Edificio ERA 10 - Apto 804' },
      { id: 'cv-2026-2148', desc: 'Edificio ERA 10 - Apto 1010' }
    ];

    for (const item of ids) {
      const snap = await getDoc(doc(db, 'avaluos', item.id));
      if (snap.exists()) {
        imprimirDetalle(snap.id, snap.data(), item.desc);
      }
    }
    console.log('\n💡 Tip: Puedes buscar cualquier caso escribiendo: node scripts/consultar-casos.js [codigo]');
    console.log('   Ejemplo: node scripts/consultar-casos.js 10057');
  }

  process.exit(0);
}

function imprimirDetalle(id, d, extraLabel = '') {
  console.log('================================================================');
  console.log(`📌 EXPEDIENTE: ${d.codigo || 'SIN CÓDIGO'} (${id}) ${extraLabel ? `[${extraLabel}]` : ''}`);
  console.log(`   Estado: ${d.estado || 'borrador'} | Creado por: ${d.creadoPor || 'N/A'}`);
  console.log(`   Dirección: ${d.direccion || 'Sin dirección'}`);
  console.log(`   Propietario: ${d.propietarioPrincipal || 'No asignado'}`);
  console.log(`   Valor Comercial: Q. ${Number(d.valorComercialGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);
  console.log(`   Valor Bancario:  Q. ${Number(d.valorBancarioGTQ || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);

  const fincas = d.fincas || [];
  console.log(`   Fincas Registradas (${fincas.length}):`);
  fincas.forEach((f, idx) => {
    const num = f.finca || '[Finca pendiente]';
    const fol = f.folio || '-';
    const lib = f.libro || '-';
    const area = f.areaValuada || f.areaRegistrada || 0;
    console.log(`     #${idx + 1}: Finca ${num}, Folio ${fol}, Libro ${lib} | Área: ${area} m²`);
    if (f.colindancias?.norteFisica || f.colindancias?.norte) {
      console.log(`        Colindancias Norte: ${f.colindancias.norteFisica || f.colindancias.norte}`);
    }
  });

  const constItems = d.desgloseConstruccion?.items || [];
  const constArea = d.desgloseConstruccion?.area || (constItems.length > 0 ? constItems[0].area : 0);
  console.log(`   Desglose Construcción: ${constItems.length} renglones | Área total calculada: ${constArea} m²`);
  console.log('================================================================');
}

consultar().catch((err) => {
  console.error('Error consultando Firestore:', err);
  process.exit(1);
});
