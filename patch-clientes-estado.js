const fs = require('fs');

const path = 'src/components/Clientes.jsx';
let text = fs.readFileSync(path, 'utf8');

if (!text.includes('const cambiarEstadoCliente = async')) {
  text = text.replace(
    '  const getClienteEstado = (cliente) => {',
    `  const cambiarEstadoCliente = async (cliente) => {
    const estaInactivo = cliente.estado === 'inactivo';
    const accion = estaInactivo ? 'activar' : 'desactivar';

    const confirmar = window.confirm(
      estaInactivo
        ? \`¿Activar nuevamente al cliente \${cliente.nombre}?\`
        : \`¿Desactivar al cliente \${cliente.nombre}? Ya no aparecerá para nuevas ventas, pero conservará su historial.\`
    );

    if (!confirmar) return;

    try {
      setError('');
      setMensaje('');

      await api.post(\`/clientes/\${cliente.id_cliente}/\${accion}\`);

      setMensaje(
        estaInactivo
          ? 'Cliente activado correctamente'
          : 'Cliente desactivado correctamente'
      );

      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el estado del cliente');
    }
  };

  const getClienteEstado = (cliente) => {`
  );
}

if (!text.includes("cliente.estado === 'inactivo'")) {
  text = text.replace(
    `  const getClienteEstado = (cliente) => {
    const totalGastado = Number(cliente.total_gastado) || 0;
    const compras = Number(cliente.compras) || 0;`,
    `  const getClienteEstado = (cliente) => {
    if (cliente.estado === 'inactivo') {
      return {
        label: 'Inactivo',
        className: 'status-inactive',
      };
    }

    const totalGastado = Number(cliente.total_gastado) || 0;
    const compras = Number(cliente.compras) || 0;`
  );
}

if (!text.includes('.status-inactive')) {
  text = text.replace(
    `.status-new {
          background: rgba(59,130,246,0.13);
          color: #93c5fd;
          border-color: rgba(59,130,246,0.25);
        }`,
    `.status-new {
          background: rgba(59,130,246,0.13);
          color: #93c5fd;
          border-color: rgba(59,130,246,0.25);
        }

        .status-inactive {
          background: rgba(148,163,184,0.13);
          color: #cbd5e1;
          border-color: rgba(148,163,184,0.25);
        }`
  );
}

text = text.replace(
  `<button className="btn-danger" onClick={() => eliminar(cliente)}>
                                  Eliminar
                                </button>`,
  `{Number(cliente.compras) > 0 ? (
                                  <button
                                    className={cliente.estado === 'inactivo' ? 'btn-gold' : 'btn-dark'}
                                    onClick={() => cambiarEstadoCliente(cliente)}
                                  >
                                    {cliente.estado === 'inactivo' ? 'Activar' : 'Desactivar'}
                                  </button>
                                ) : (
                                  <button className="btn-danger" onClick={() => eliminar(cliente)}>
                                    Eliminar
                                  </button>
                                )}`
);

fs.writeFileSync(path, text, 'utf8');

console.log('Clientes.jsx actualizado con activar/desactivar.');
