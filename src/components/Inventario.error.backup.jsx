import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import bgImage from '../assets/login-bg.jpg';

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#111214" />
          <stop offset="100%" stop-color="#1f2024" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <text x="50%" y="48%" text-anchor="middle" fill="#d6b469" font-size="52" font-family="Arial, sans-serif">ATELIER</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial, sans-serif">Sin imagen</text>
    </svg>
  `);

export default function Inventario({ usuario }) {
  const [inventario, setInventario] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    id_producto: '',
    id_talla: '',
    color: '',
    stock: '',
  });

  const esAdmin = usuario?.rol === 'admin';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');

      const [inventarioRes, productosRes, tallasRes] = await Promise.all([
        api.get('/inventario'),
        api.get('/productos'),
        api.get('/tallas'),
      ]);

      setInventario(inventarioRes.data.data || []);
      setProductos(productosRes.data.data || []);
      setTallas(tallasRes.data.data || []);
    } catch (err) {
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const inventarioFiltrado = useMemo(() => {
    return inventario.filter((item) => {
      const texto = `${item.producto || ''} ${item.marca || ''} ${item.talla || ''} ${item.color || ''}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  }, [inventario, busqueda]);

  const stats = useMemo(() => {
    const totalUnidades = inventario.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
    const agotados = inventario.filter((item) => Number(item.stock) <= 0).length;
    const bajoStock = inventario.filter((item) => Number(item.stock) > 0 && Number(item.stock) <= 5).length;
    const disponibles = inventario.filter((item) => Number(item.stock) > 5).length;

    return {
      totalUnidades,
      agotados,
      bajoStock,
      disponibles,
    };
  }, [inventario]);

  const estadoStock = (stock) => {
    const valor = Number(stock) || 0;

    if (valor <= 0) {
      return {
        label: 'Agotado',
        className: 'status-danger',
      };
    }

    if (valor <= 5) {
      return {
        label: 'Stock bajo',
        className: 'status-warning',
      };
    }

    return {
      label: 'Disponible',
      className: 'status-success',
    };
  };

  const getImagen = (item) => {
    return item.imagen_url || PLACEHOLDER;
  };

  const guardar = async () => {
    if (!form.id_producto || !form.id_talla || form.stock === '') {
      setError('Selecciona producto, talla y escribe el stock');
      return;
    }

    try {
      setError('');

      const payload = {
        id_producto: form.id_producto,
        id_talla: form.id_talla,
        color: form.color,
        stock: form.stock,
      };

      if (editando) {
        await api.put(`/inventario/${editando}`, payload);
      } else {
        await api.post('/inventario', payload);
      }

      setForm({
        id_producto: '',
        id_talla: '',
        color: '',
        stock: '',
      });

      setEditando(null);
      cargar();
    } catch (err) {
      setError('No se pudo guardar el inventario');
    }
  };

  const editar = (item) => {
    setEditando(item.id_inventario);
    setForm({
      id_producto: item.id_producto || '',
      id_talla: item.id_talla || '',
      color: item.color || '',
      stock: item.stock ?? '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cancelar = () => {
    setEditando(null);
    setForm({
      id_producto: '',
      id_talla: '',
      color: '',
      stock: '',
    });
    setError('');
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este registro de inventario?')) return;

    try {
      await api.delete(`/inventario/${id}`);
      cargar();
    } catch (err) {
      setError('No se pudo eliminar el registro');
    }
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        Cargando inventario...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .inventory-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: #fff;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .inventory-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .inventory-loading {
          min-height: 100vh;
          background: #08090b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
        }

        .inventory-hero {
          position: relative;
          overflow: hidden;
          min-height: 300px;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            linear-gradient(to right, rgba(0,0,0,0.52), rgba(0,0,0,0.24)),
            linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.08)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          animation: fadeUp 0.65s ease;
        }

        .inventory-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(214,180,105,0.12), transparent 28%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
        }

        .eyebrow {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 18px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #f6f1e7;
        }

        .inventory-hero h1 {
          margin: 0 0 14px;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -1px;
        }

        .inventory-hero p {
          margin: 0;
          max-width: 640px;
          color: rgba(255,255,255,0.82);
          font-size: 16px;
          line-height: 1.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-top: 24px;
          animation: fadeUp 0.75s ease;
        }

        .stat-card,
        .glass-card {
          background: rgba(18, 19, 24, 0.74);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          border-radius: 24px;
        }

        .stat-card {
          padding: 22px;
        }

        .stat-label {
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
        }

        .stat-accent {
          margin-top: 10px;
          font-size: 13px;
          color: #d6b469;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 18px;
          margin-top: 24px;
          animation: fadeUp 0.8s ease;
        }

        .glass-card {
          padding: 24px;
        }

        .card-title {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .card-subtitle {
          margin: 0 0 20px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          line-height: 1.7;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          font-weight: 600;
        }

        .premium-input,
        .premium-select {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          outline: none;
          padding: 0 16px;
          font-size: 14px;
          transition: all 0.25s ease;
        }

        .premium-select option {
          background: #111214;
          color: #fff;
        }

        .premium-input:focus,
        .premium-select:focus {
          border-color: rgba(214,180,105,0.85);
          box-shadow: 0 0 0 4px rgba(214,180,105,0.10);
        }

        .actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }

        .btn-gold,
        .btn-dark,
        .btn-danger {
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-gold {
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #131313;
          box-shadow: 0 12px 28px rgba(185,141,70,0.24);
        }

        .btn-dark {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .btn-danger {
          background: rgba(220,38,38,0.16);
          color: #fca5a5;
          border: 1px solid rgba(220,38,38,0.26);
        }

        .btn-gold:hover,
        .btn-dark:hover,
        .btn-danger:hover {
          transform: translateY(-2px);
        }

        .search-row {
          display: flex;
          align-items: end;
          gap: 12px;
        }

        .search-row .field {
          flex: 1;
        }

        .search-meta {
          margin-top: 14px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
        }

        .error-box {
          margin-top: 18px;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        .inventory-table-card {
          margin-top: 24px;
          overflow: hidden;
          animation: fadeUp 0.9s ease;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .inventory-table thead {
          background: rgba(255,255,255,0.045);
        }

        .inventory-table th {
          text-align: left;
          padding: 18px;
          color: rgba(255,255,255,0.64);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .inventory-table td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          vertical-align: middle;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .product-thumb {
          width: 72px;
          height: 82px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          background: #15161a;
          flex: 0 0 auto;
        }

        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-name {
          font-weight: 800;
          font-size: 15px;
          margin-bottom: 5px;
        }

        .product-brand {
          color: #d6b469;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.86);
        }

        .stock-number {
          font-weight: 900;
          font-size: 18px;
        }

        .status-success {
          background: rgba(34,197,94,0.13);
          color: #86efac;
          border-color: rgba(34,197,94,0.25);
        }

        .status-warning {
          background: rgba(245,158,11,0.13);
          color: #fcd34d;
          border-color: rgba(245,158,11,0.25);
        }

        .status-danger {
          background: rgba(220,38,38,0.13);
          color: #fca5a5;
          border-color: rgba(220,38,38,0.25);
        }

        .row-actions {
          display: flex;
          gap: 10px;
        }

        .empty-box {
          margin-top: 24px;
          padding: 34px;
          border-radius: 24px;
          border: 1px dashed rgba(255,255,255,0.14);
          text-align: center;
          color: rgba(255,255,255,0.66);
          background: rgba(255,255,255,0.03);
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .inventory-page {
            padding: 16px;
          }

          .inventory-hero {
            min-height: 280px;
            padding: 22px;
          }

          .inventory-hero h1 {
            font-size: 36px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .row-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="inventory-page">
        <div className="inventory-container">
          <section className="inventory-hero">
            <div className="hero-content">
              <div className="eyebrow">Inventario premium</div>
              <h1>Control de stock con imagen, talla y disponibilidad.</h1>
              <p>
                Supervisa cada pieza de la colección con una vista elegante,
                clara y conectada visualmente al catálogo de productos.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total unidades</div>
              <div className="stat-value">{stats.totalUnidades}</div>
              <div className="stat-accent">Stock acumulado</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Disponibles</div>
              <div className="stat-value">{stats.disponibles}</div>
              <div className="stat-accent">Con stock saludable</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Stock bajo</div>
              <div className="stat-value">{stats.bajoStock}</div>
              <div className="stat-accent">Requieren atención</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Agotados</div>
              <div className="stat-value">{stats.agotados}</div>
              <div className="stat-accent">Sin unidades</div>
            </div>
          </section>

          <section className="toolbar">
            {esAdmin && (
              <div className="glass-card">
                <h2 className="card-title">
                  {editando ? 'Editar inventario' : 'Agregar inventario'}
                </h2>
                <p className="card-subtitle">
                  Relaciona un producto con su talla, color y cantidad disponible.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Producto</label>
                    <select
                      className="premium-select"
                      value={form.id_producto}
                      onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map((p) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.nombre} {p.marca ? `- ${p.marca}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Talla</label>
                    <select
                      className="premium-select"
                      value={form.id_talla}
                      onChange={(e) => setForm({ ...form, id_talla: e.target.value })}
                    >
                      <option value="">Selecciona una talla</option>
                      {tallas.map((t) => (
                        <option key={t.id_talla} value={t.id_talla}>
                          {t.nombre_talla || t.talla || t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Color</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Negro, Blanco, Beige"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Stock</label>
                    <input
                      className="premium-input"
                      type="number"
                      placeholder="Ej. 12"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={guardar}>
                    {editando ? 'Guardar cambios' : 'Agregar inventario'}
                  </button>

                  {editando && (
                    <button className="btn-dark" onClick={cancelar}>
                      Cancelar edición
                    </button>
                  )}
                </div>

                {error && <div className="error-box">{error}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">Explorar stock</h2>
              <p className="card-subtitle">
                Busca por producto, marca, talla o color.
              </p>

              <div className="search-row">
                <div className="field">
                  <label>Búsqueda</label>
                  <input
                    className="premium-input"
                    placeholder="Buscar inventario..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <button className="btn-dark" onClick={() => setBusqueda('')}>
                  Limpiar
                </button>
              </div>

              <div className="search-meta">
                Mostrando {inventarioFiltrado.length} de {inventario.length} registros.
              </div>
            </div>
          </section>

          {inventarioFiltrado.length === 0 ? (
            <div className="empty-box">
              No hay registros de inventario para mostrar.
            </div>
          ) : (
            <section className="glass-card inventory-table-card">
              <div className="table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Talla</th>
                      <th>Color</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      {esAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {inventarioFiltrado.map((item) => {
                      const estado = estadoStock(item.stock);

                      return (
                        <tr key={item.id_inventario}>
                          <td>
                            <div className="product-cell">
                              <div className="product-thumb">
                                <img
                                  src={getImagen(item)}
                                  alt={item.producto}
                                  onError={(e) => {
                                    e.currentTarget.src = PLACEHOLDER;
                                  }}
                                />
                              </div>

                              <div>
                                <div className="product-name">{item.producto}</div>
                                <div className="product-brand">{item.marca || 'ATELIER'}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="pill">{item.talla}</span>
                          </td>

                          <td>{item.color || 'Sin color'}</td>

                          <td>
                            <span className="stock-number">{item.stock}</span> uds
                          </td>

                          <td>
                            <span className={`pill ${estado.className}`}>
                              {estado.label}
                            </span>
                          </td>

                          {esAdmin && (
                            <td>
                              <div className="row-actions">
                                <button className="btn-gold" onClick={() => editar(item)}>
                                  Editar
                                </button>

                                <button className="btn-danger" onClick={() => eliminar(item.id_inventario)}>
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}




cat > src/components/Inventario.jsx <<'EOF'
import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import bgImage from '../assets/login-bg.jpg';

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#111214" />
          <stop offset="100%" stop-color="#1f2024" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <text x="50%" y="48%" text-anchor="middle" fill="#d6b469" font-size="52" font-family="Arial, sans-serif">ATELIER</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial, sans-serif">Sin imagen</text>
    </svg>
  `);

export default function Inventario({ usuario }) {
  const [inventario, setInventario] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    id_producto: '',
    id_talla: '',
    color: '',
    stock: '',
  });

  const esAdmin = usuario?.rol === 'admin';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');

      const [inventarioRes, productosRes, tallasRes] = await Promise.all([
        api.get('/inventario'),
        api.get('/productos'),
        api.get('/tallas'),
      ]);

      setInventario(inventarioRes.data.data || []);
      setProductos(productosRes.data.data || []);
      setTallas(tallasRes.data.data || []);
    } catch (err) {
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const inventarioFiltrado = useMemo(() => {
    return inventario.filter((item) => {
      const texto = `${item.producto || ''} ${item.marca || ''} ${item.talla || ''} ${item.color || ''}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  }, [inventario, busqueda]);

  const stats = useMemo(() => {
    const totalUnidades = inventario.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
    const agotados = inventario.filter((item) => Number(item.stock) <= 0).length;
    const bajoStock = inventario.filter((item) => Number(item.stock) > 0 && Number(item.stock) <= 5).length;
    const disponibles = inventario.filter((item) => Number(item.stock) > 5).length;

    return {
      totalUnidades,
      agotados,
      bajoStock,
      disponibles,
    };
  }, [inventario]);

  const estadoStock = (stock) => {
    const valor = Number(stock) || 0;

    if (valor <= 0) {
      return {
        label: 'Agotado',
        className: 'status-danger',
      };
    }

    if (valor <= 5) {
      return {
        label: 'Stock bajo',
        className: 'status-warning',
      };
    }

    return {
      label: 'Disponible',
      className: 'status-success',
    };
  };

  const getImagen = (item) => {
    return item.imagen_url || PLACEHOLDER;
  };

  const guardar = async () => {
    if (!form.id_producto || !form.id_talla || form.stock === '') {
      setError('Selecciona producto, talla y escribe el stock');
      return;
    }

    try {
      setError('');

      const payload = {
        id_producto: form.id_producto,
        id_talla: form.id_talla,
        color: form.color,
        stock: form.stock,
      };

      if (editando) {
        await api.put(`/inventario/${editando}`, payload);
      } else {
        await api.post('/inventario', payload);
      }

      setForm({
        id_producto: '',
        id_talla: '',
        color: '',
        stock: '',
      });

      setEditando(null);
      cargar();
    } catch (err) {
      setError('No se pudo guardar el inventario');
    }
  };

  const editar = (item) => {
    setEditando(item.id_inventario);
    setForm({
      id_producto: item.id_producto || '',
      id_talla: item.id_talla || '',
      color: item.color || '',
      stock: item.stock ?? '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cancelar = () => {
    setEditando(null);
    setForm({
      id_producto: '',
      id_talla: '',
      color: '',
      stock: '',
    });
    setError('');
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este registro de inventario?')) return;

    try {
      await api.delete(`/inventario/${id}`);
      cargar();
    } catch (err) {
      setError('No se pudo eliminar el registro');
    }
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        Cargando inventario...
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .inventory-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: #fff;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .inventory-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .inventory-loading {
          min-height: 100vh;
          background: #08090b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
        }

        .inventory-hero {
          position: relative;
          overflow: hidden;
          min-height: 300px;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            linear-gradient(to right, rgba(0,0,0,0.52), rgba(0,0,0,0.24)),
            linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.08)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          animation: fadeUp 0.65s ease;
        }

        .inventory-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(214,180,105,0.12), transparent 28%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
        }

        .eyebrow {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 18px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #f6f1e7;
        }

        .inventory-hero h1 {
          margin: 0 0 14px;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -1px;
        }

        .inventory-hero p {
          margin: 0;
          max-width: 640px;
          color: rgba(255,255,255,0.82);
          font-size: 16px;
          line-height: 1.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-top: 24px;
          animation: fadeUp 0.75s ease;
        }

        .stat-card,
        .glass-card {
          background: rgba(18, 19, 24, 0.74);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          border-radius: 24px;
        }

        .stat-card {
          padding: 22px;
        }

        .stat-label {
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
        }

        .stat-accent {
          margin-top: 10px;
          font-size: 13px;
          color: #d6b469;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 18px;
          margin-top: 24px;
          animation: fadeUp 0.8s ease;
        }

        .glass-card {
          padding: 24px;
        }

        .card-title {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .card-subtitle {
          margin: 0 0 20px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          line-height: 1.7;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          font-weight: 600;
        }

        .premium-input,
        .premium-select {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: white;
          outline: none;
          padding: 0 16px;
          font-size: 14px;
          transition: all 0.25s ease;
        }

        .premium-select option {
          background: #111214;
          color: #fff;
        }

        .premium-input:focus,
        .premium-select:focus {
          border-color: rgba(214,180,105,0.85);
          box-shadow: 0 0 0 4px rgba(214,180,105,0.10);
        }

        .actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }

        .btn-gold,
        .btn-dark,
        .btn-danger {
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-gold {
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #131313;
          box-shadow: 0 12px 28px rgba(185,141,70,0.24);
        }

        .btn-dark {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .btn-danger {
          background: rgba(220,38,38,0.16);
          color: #fca5a5;
          border: 1px solid rgba(220,38,38,0.26);
        }

        .btn-gold:hover,
        .btn-dark:hover,
        .btn-danger:hover {
          transform: translateY(-2px);
        }

        .search-row {
          display: flex;
          align-items: end;
          gap: 12px;
        }

        .search-row .field {
          flex: 1;
        }

        .search-meta {
          margin-top: 14px;
          color: rgba(255,255,255,0.62);
          font-size: 14px;
        }

        .error-box {
          margin-top: 18px;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        .inventory-table-card {
          margin-top: 24px;
          overflow: hidden;
          animation: fadeUp 0.9s ease;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .inventory-table thead {
          background: rgba(255,255,255,0.045);
        }

        .inventory-table th {
          text-align: left;
          padding: 18px;
          color: rgba(255,255,255,0.64);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .inventory-table td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          vertical-align: middle;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .product-thumb {
          width: 72px;
          height: 82px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          background: #15161a;
          flex: 0 0 auto;
        }

        .product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .product-name {
          font-weight: 800;
          font-size: 15px;
          margin-bottom: 5px;
        }

        .product-brand {
          color: #d6b469;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.86);
        }

        .stock-number {
          font-weight: 900;
          font-size: 18px;
        }

        .status-success {
          background: rgba(34,197,94,0.13);
          color: #86efac;
          border-color: rgba(34,197,94,0.25);
        }

        .status-warning {
          background: rgba(245,158,11,0.13);
          color: #fcd34d;
          border-color: rgba(245,158,11,0.25);
        }

        .status-danger {
          background: rgba(220,38,38,0.13);
          color: #fca5a5;
          border-color: rgba(220,38,38,0.25);
        }

        .row-actions {
          display: flex;
          gap: 10px;
        }

        .empty-box {
          margin-top: 24px;
          padding: 34px;
          border-radius: 24px;
          border: 1px dashed rgba(255,255,255,0.14);
          text-align: center;
          color: rgba(255,255,255,0.66);
          background: rgba(255,255,255,0.03);
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .inventory-page {
            padding: 16px;
          }

          .inventory-hero {
            min-height: 280px;
            padding: 22px;
          }

          .inventory-hero h1 {
            font-size: 36px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .row-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="inventory-page">
        <div className="inventory-container">
          <section className="inventory-hero">
            <div className="hero-content">
              <div className="eyebrow">Inventario premium</div>
              <h1>Control de stock con imagen, talla y disponibilidad.</h1>
              <p>
                Supervisa cada pieza de la colección con una vista elegante,
                clara y conectada visualmente al catálogo de productos.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total unidades</div>
              <div className="stat-value">{stats.totalUnidades}</div>
              <div className="stat-accent">Stock acumulado</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Disponibles</div>
              <div className="stat-value">{stats.disponibles}</div>
              <div className="stat-accent">Con stock saludable</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Stock bajo</div>
              <div className="stat-value">{stats.bajoStock}</div>
              <div className="stat-accent">Requieren atención</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Agotados</div>
              <div className="stat-value">{stats.agotados}</div>
              <div className="stat-accent">Sin unidades</div>
            </div>
          </section>

          <section className="toolbar">
            {esAdmin && (
              <div className="glass-card">
                <h2 className="card-title">
                  {editando ? 'Editar inventario' : 'Agregar inventario'}
                </h2>
                <p className="card-subtitle">
                  Relaciona un producto con su talla, color y cantidad disponible.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Producto</label>
                    <select
                      className="premium-select"
                      value={form.id_producto}
                      onChange={(e) => setForm({ ...form, id_producto: e.target.value })}
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map((p) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.nombre} {p.marca ? `- ${p.marca}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Talla</label>
                    <select
                      className="premium-select"
                      value={form.id_talla}
                      onChange={(e) => setForm({ ...form, id_talla: e.target.value })}
                    >
                      <option value="">Selecciona una talla</option>
                      {tallas.map((t) => (
                        <option key={t.id_talla} value={t.id_talla}>
                          {t.nombre_talla || t.talla || t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Color</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Negro, Blanco, Beige"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Stock</label>
                    <input
                      className="premium-input"
                      type="number"
                      placeholder="Ej. 12"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={guardar}>
                    {editando ? 'Guardar cambios' : 'Agregar inventario'}
                  </button>

                  {editando && (
                    <button className="btn-dark" onClick={cancelar}>
                      Cancelar edición
                    </button>
                  )}
                </div>

                {error && <div className="error-box">{error}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">Explorar stock</h2>
              <p className="card-subtitle">
                Busca por producto, marca, talla o color.
              </p>

              <div className="search-row">
                <div className="field">
                  <label>Búsqueda</label>
                  <input
                    className="premium-input"
                    placeholder="Buscar inventario..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <button className="btn-dark" onClick={() => setBusqueda('')}>
                  Limpiar
                </button>
              </div>

              <div className="search-meta">
                Mostrando {inventarioFiltrado.length} de {inventario.length} registros.
              </div>
            </div>
          </section>

          {inventarioFiltrado.length === 0 ? (
            <div className="empty-box">
              No hay registros de inventario para mostrar.
            </div>
          ) : (
            <section className="glass-card inventory-table-card">
              <div className="table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Talla</th>
                      <th>Color</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      {esAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {inventarioFiltrado.map((item) => {
                      const estado = estadoStock(item.stock);

                      return (
                        <tr key={item.id_inventario}>
                          <td>
                            <div className="product-cell">
                              <div className="product-thumb">
                                <img
                                  src={getImagen(item)}
                                  alt={item.producto}
                                  onError={(e) => {
                                    e.currentTarget.src = PLACEHOLDER;
                                  }}
                                />
                              </div>

                              <div>
                                <div className="product-name">{item.producto}</div>
                                <div className="product-brand">{item.marca || 'ATELIER'}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="pill">{item.talla}</span>
                          </td>

                          <td>{item.color || 'Sin color'}</td>

                          <td>
                            <span className="stock-number">{item.stock}</span> uds
                          </td>

                          <td>
                            <span className={`pill ${estado.className}`}>
                              {estado.label}
                            </span>
                          </td>

                          {esAdmin && (
                            <td>
                              <div className="row-actions">
                                <button className="btn-gold" onClick={() => editar(item)}>
                                  Editar
                                </button>

                                <button className="btn-danger" onClick={() => eliminar(item.id_inventario)}>
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
