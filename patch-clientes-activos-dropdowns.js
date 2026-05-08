const fs = require('fs');

const files = [
  'src/components/Ventas.jsx',
  'src/components/Productos.jsx',
];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');

  if (!text.includes("clientes.filter((cliente) => cliente.estado !== 'inactivo').map")) {
    text = text.replace(
      /clientes\.map\(\(cliente\) => \(/g,
      "clientes.filter((cliente) => cliente.estado !== 'inactivo').map((cliente) => ("
    );
  }

  fs.writeFileSync(file, text, 'utf8');
  console.log(`${file} actualizado para ocultar clientes inactivos.`);
}
