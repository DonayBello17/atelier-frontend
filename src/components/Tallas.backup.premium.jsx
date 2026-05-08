import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Tallas({ usuario }) {
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const esAdmin = usuario?.rol === 'admin';

  const cargar = () => {
    api.get('/tallas')
      .then(res => setTallas(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const agregar = async () => {
    if (!nombre) return alert('Escribe el nombre de la talla');
    await api.post('/tallas', { nombre_talla: nombre });
    setNombre('');
    cargar();
  };

  const eliminar = async (id) => {
    if (confirm('¿Eliminar esta talla?')) {
      await api.delete(`/tallas/${id}`);
      cargar();
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Cargando tallas...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Tallas</h1>

      {esAdmin && (
        <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '10px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Agregar talla</h2>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <input placeholder="Ej: XXL" value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregar()}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            <button onClick={agregar}
              style={{ padding: '0.6rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Agregar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
        {tallas.map(t => (
          <div key={t.id_talla} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', background: '#fff', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.3rem', margin: '0 0 0.8rem' }}>{t.nombre_talla}</p>
            {esAdmin && (
              <button onClick={() => eliminar(t.id_talla)}
                style={{ padding: '0.3rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
