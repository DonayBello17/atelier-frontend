import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [editando, setEditando] = useState(null);
 const esAdmin = usuario?.rol === 'admin';
const puedeAgregar = esAdmin || usuario?.rol === 'empleado';

  const cargar = () => {
    api.get('/clientes')
      .then(res => setClientes(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    if (editando) {
      await api.put(`/clientes/${editando}`, form);
    } else {
      await api.post('/clientes', form);
    }
    setForm({ nombre: '', email: '', telefono: '' });
    setEditando(null);
    cargar();
  };

  const eliminar = async (id) => {
    if (confirm('¿Eliminar este cliente?')) {
      await api.delete(`/clientes/${id}`);
      cargar();
    }
  };

  const editar = (c) => {
    setEditando(c.id_cliente);
    setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono });
  };

  const cancelar = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', telefono: '' });
  };

  if (loading) return <p style={{ padding: '2rem' }}>Cargando clientes...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Clientes</h1>

      {/* Formulario solo para admin */}
     {puedeAgregar && (
        <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            {editando ? 'Editar cliente' : 'Agregar cliente'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <input placeholder="Nombre" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input placeholder="Telefono" value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={guardar}
              style={{ padding: '0.7rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {editando ? 'Guardar cambios' : 'Agregar'}
            </button>
            {editando && (
              <button onClick={cancelar}
                style={{ padding: '0.7rem 1.5rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tarjetas de clientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {clientes.map(c => (
          <div key={c.id_cliente} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{c.nombre}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{c.email}</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{c.telefono}</p>
            {esAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button onClick={() => editar(c)}
                  style={{ flex: 1, padding: '0.5rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => eliminar(c.id_cliente)}
                  style={{ flex: 1, padding: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}