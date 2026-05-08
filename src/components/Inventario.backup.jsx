import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Inventario() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inventario')
      .then(res => setInventario(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>Cargando inventario...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Inventario</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <thead>
          <tr style={{ background: '#1e293b', color: '#fff' }}>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Producto</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Talla</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Color</th>
            <th style={{ padding: '0.8rem', textAlign: 'left' }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map(i => (
            <tr key={i.id_inventario} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '0.8rem' }}>{i.producto}</td>
              <td style={{ padding: '0.8rem' }}>{i.talla}</td>
              <td style={{ padding: '0.8rem' }}>{i.color}</td>
              <td style={{ padding: '0.8rem' }}>
                <span style={{ background: i.stock > 20 ? '#dcfce7' : '#fee2e2', color: i.stock > 20 ? '#16a34a' : '#dc2626', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                  {i.stock} uds
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
