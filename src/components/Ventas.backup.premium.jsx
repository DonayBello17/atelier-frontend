import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Ventas({ usuario }) {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [id_cliente, setIdCliente] = useState('');
  const [items, setItems] = useState([{ id_inventario: '', cantidad: 1, precio_unitario: '' }]);
  const esAdmin = usuario?.rol === 'admin';
const puedeVender = esAdmin || usuario?.rol === 'empleado';

  const cargar = async () => {
    const [v, c, i] = await Promise.all([
      api.get('/ventas'),
      api.get('/clientes'),
      api.get('/inventario'),
    ]);
    setVentas(v.data.data);
    setClientes(c.data.data);
    setInventario(i.data.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const verDetalle = async (id) => {
    const res = await api.get(`/ventas/${id}/detalles`);
    setDetalle({ id_venta: id, items: res.data.data });
  };

  const agregarItem = () => setItems([...items, { id_inventario: '', cantidad: 1, precio_unitario: '' }]);

  const actualizarItem = (i, campo, valor) => {
    const nuevos = [...items];
    nuevos[i][campo] = valor;
    if (campo === 'id_inventario') {
      const inv = inventario.find(x => x.id_inventario == valor);
      if (inv) nuevos[i].precio_unitario = inv.precio || '';
    }
    setItems(nuevos);
  };

  const guardarVenta = async () => {
    if (!id_cliente) return alert('Selecciona un cliente');
    if (items.some(i => !i.id_inventario || !i.cantidad || !i.precio_unitario)) return alert('Completa todos los campos');
    await api.post('/ventas', { id_cliente, detalles: items });
    setMostrarForm(false);
    setIdCliente('');
    setItems([{ id_inventario: '', cantidad: 1, precio_unitario: '' }]);
    cargar();
  };

  if (loading) return <p style={{ padding: '2rem' }}>Cargando ventas...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Ventas</h1>
        {puedeVender && (
  <button onClick={() => setMostrarForm(!mostrarForm)}
            style={{ padding: '0.7rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {mostrarForm ? 'Cancelar' : 'Nueva venta'}
          </button>
        )}
      </div>

      {/* Formulario nueva venta */}
    {puedeVender && mostrarForm && (
        <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Nueva venta</h2>
          <select value={id_cliente} onChange={e => setIdCliente(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc', width: '100%', marginBottom: '1rem' }}>
            <option value=''>Selecciona un cliente</option>
            {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
          </select>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <select value={item.id_inventario} onChange={e => actualizarItem(i, 'id_inventario', e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value=''>Selecciona producto</option>
                {inventario.map(inv => (
                  <option key={inv.id_inventario} value={inv.id_inventario}>
                    {inv.producto} - {inv.talla} - {inv.color} (stock: {inv.stock})
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Cantidad" value={item.cantidad}
                onChange={e => actualizarItem(i, 'cantidad', e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }} />
              <input type="number" placeholder="Precio unitario" value={item.precio_unitario}
                onChange={e => actualizarItem(i, 'precio_unitario', e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={agregarItem}
              style={{ padding: '0.6rem 1rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              + Agregar producto
            </button>
            <button onClick={guardarVenta}
              style={{ padding: '0.6rem 1.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Guardar venta
            </button>
          </div>
        </div>
      )}

      {/* Lista de ventas */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr style={{ background: '#1e293b', color: '#fff' }}>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Cliente</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Fecha</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Total</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length === 0 ? (
            <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No hay ventas registradas</td></tr>
          ) : ventas.map(v => (
            <tr key={v.id_venta} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '0.8rem' }}>#{v.id_venta}</td>
              <td style={{ padding: '0.8rem' }}>{v.cliente || 'Sin cliente'}</td>
              <td style={{ padding: '0.8rem' }}>{new Date(v.fecha).toLocaleDateString()}</td>
              <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>${v.total}</td>
              <td style={{ padding: '0.8rem' }}>
                <button onClick={() => verDetalle(v.id_venta)}
                  style={{ padding: '0.3rem 0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal detalle */}
      {detalle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Detalle venta #{detalle.id_venta}</h2>
              <button onClick={() => setDetalle(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>X</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Producto</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Talla</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Color</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Cant.</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {detalle.items.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.6rem' }}>{d.producto}</td>
                    <td style={{ padding: '0.6rem' }}>{d.talla}</td>
                    <td style={{ padding: '0.6rem' }}>{d.color}</td>
                    <td style={{ padding: '0.6rem' }}>{d.cantidad}</td>
                    <td style={{ padding: '0.6rem' }}>${d.precio_unitario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
