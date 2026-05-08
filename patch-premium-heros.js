const fs = require('fs');

const patches = [
  {
    file: 'src/components/Clientes.jsx',
    hero: `<PremiumHero
            badge="Clientes premium"
            title="Clientes, historial de compras y fidelización."
            description="Administra compradores, contacto, dirección y comportamiento de compra para que ventas y facturas tengan información completa."
          />`,
  },
  {
    file: 'src/components/Inventario.jsx',
    hero: `<PremiumHero
            badge="Inventario premium"
            title="Control de stock con imagen, talla y disponibilidad."
            description="Supervisa cada pieza de la colección con una vista elegante, clara y conectada visualmente al catálogo de productos."
          />`,
  },
  {
    file: 'src/components/Ventas.jsx',
    hero: `<PremiumHero
            badge="Módulo comercial"
            title="Ventas, facturas y control de stock."
            description="Registra ventas, descuenta inventario y genera facturas imprimibles para tus clientes."
            buttonText="Nueva venta"
            onButtonClick={() => window.scrollTo({ top: 520, behavior: 'smooth' })}
          />`,
  },
  {
    file: 'src/components/Tallas.jsx',
    hero: `<PremiumHero
            badge="Sistema de tallas"
            title="Tallas organizadas para controlar el stock por prenda."
            description="Administra las tallas disponibles y úsalas en inventario para manejar stock por producto, color y talla."
          />`,
  },
];

function addImport(text) {
  if (text.includes("import PremiumHero from './PremiumHero';")) {
    return text;
  }

  const lines = text.split('\n');
  let lastImport = -1;

  lines.forEach((line, index) => {
    if (line.trim().startsWith('import ')) {
      lastImport = index;
    }
  });

  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, "import PremiumHero from './PremiumHero';");
    return lines.join('\n');
  }

  return "import PremiumHero from './PremiumHero';\n" + text;
}

function replaceFirstHero(text, newHero) {
  const patterns = [
    /<section\s+className=(["'])[^"']*hero[^"']*\1[\s\S]*?<\/section>/,
    /<div\s+className=(["'])[^"']*hero[^"']*\1[\s\S]*?<\/div>/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return {
        changed: true,
        text: text.replace(pattern, newHero),
      };
    }
  }

  return {
    changed: false,
    text,
  };
}

for (const patch of patches) {
  if (!fs.existsSync(patch.file)) {
    console.log(`No existe: ${patch.file}`);
    continue;
  }

  let text = fs.readFileSync(patch.file, 'utf8');

  if (text.includes('<PremiumHero') && text.includes(patch.hero.split('\n')[0].trim())) {
    console.log(`${patch.file}: ya tenia PremiumHero.`);
    continue;
  }

  const result = replaceFirstHero(text, patch.hero);

  if (!result.changed) {
    console.log(`${patch.file}: no encontre un hero automatico. Revisa manualmente.`);
    continue;
  }

  text = addImport(result.text);
  fs.writeFileSync(patch.file, text, 'utf8');
  console.log(`${patch.file}: hero reemplazado.`);
}

console.log('Listo. Revisa el navegador con Ctrl + F5.');
