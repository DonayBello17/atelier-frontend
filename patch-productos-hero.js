const fs = require('fs');

const path = 'src/components/Productos.jsx';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(
  'background-position: center;',
  'background-position: center 34%;'
);

text = text.replace(
  'Productos con foto, stock y carrito.',
  'Colección premium lista para vender.'
);

text = text.replace(
  'Agrega productos con imagen desde tu ordenador y vende desde el catálogo usando el carrito.',
  'Explora prendas disponibles por talla, color y stock. Una experiencia visual elegante para vender mejor.'
);

text = text.replace(
  'Catalogo premium',
  'Atelier collection'
);

fs.writeFileSync(path, text, 'utf8');

console.log('Hero de Productos actualizado.');
