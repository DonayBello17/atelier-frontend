import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import bgImage from '../assets/login-bg.jpg';

const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#111214" />
          <stop offset="100%" stop-color="#1f2024" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <text x="50%" y="46%" text-anchor="middle" fill="#d6b469" font-size="46" font-family="Arial, sans-serif">
        ATELIER
      </text>
      <text x="50%" y="56%" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial, sans-serif">
        Imagen no disponible
      </text>
    </svg>
  `);

export default function Productos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    marca: '',
    precio: '',
    id_categoria: '',
    imagen_url: '',
  });

  const esAdmin = usuario?.rol === 'admin';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/productos');
      setProductos(res.data.data || []);
    } catch (err) {
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const texto = `${p.nombre || ''} ${p.marca || ''}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  }, [productos, busqueda]);

  const stats = useMemo(() => {
    const total = productos.length;
    const damas = productos.filter((p) => String(p.id_categoria) === '2').length;
    const caballeros = productos.filter((p) => String(p.id_categoria) === '1').length;

    const valorTotal = productos.reduce((acc, p) => {
      const precio = Number(p.precio) || 0;
      return acc + precio;
    }, 0);

    return {
      total,
      damas,
      caballeros,
      valorTotal,
    };
  }, [productos]);

  const guardar = async () => {
    if (!form.nombre || !form.marca || !form.precio || !form.id_categoria) {
      setError('Completa nombre, marca, precio y categoría');
      return;
    }

    try {
      setError('');

      const payload = {
        nombre: form.nombre,
        marca: form.marca,
        precio: form.precio,
        id_categoria: form.id_categoria,
        imagen_url: form.imagen_url,
      };

      if (editando) {
        await api.put(`/productos/${editando}`, payload);
      } else {
        await api.post('/productos', payload);
      }

      setForm({
        nombre: '',
        marca: '',
        precio: '',
        id_categoria: '',
        imagen_url: '',
      });
      setEditando(null);
      cargar();
    } catch (err) {
      setError(
        'No se pudo guardar. Si agregaste imagen_url y falla, probablemente falta ese campo en tu backend o base de datos.'
      );
    }
  };

  const editar = (p) => {
    setEditando(p.id_producto);
    setForm({
      nombre: p.nombre || '',
      marca: p.marca || '',
      precio: p.precio || '',
      id_categoria: p.id_categoria || '',
      imagen_url: p.imagen_url || p.imagen || p.foto || p.url_imagen || '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cancelar = () => {
    setEditando(null);
    setForm({
      nombre: '',
      marca: '',
      precio: '',
      id_categoria: '',
      imagen_url: '',
    });
    setError('');
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;

    try {
      await api.delete(`/productos/${id}`);
      cargar();
    } catch (err) {
      setError('No se pudo eliminar el producto');
    }
  };

  const getCategoriaNombre = (id) => {
    if (String(id) === '1') return 'Caballeros';
    if (String(id) === '2') return 'Damas';
    return 'Categoría';
  };

  const getProductImage = (p) => {
    return p.imagen_url || p.imagen || p.foto || p.url_imagen || PRODUCT_PLACEHOLDER;
  };

  const formatPrecio = (precio) => {
    const valor = Number(precio) || 0;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      maximumFractionDigits: 2,
    }).format(valor);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0b0c0f',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Cargando productos...
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
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .productos-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 20%),
            linear-gradient(180deg, #090a0d 0%, #111214 100%);
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .productos-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          min-height: 320px;
          padding: 34px;
          display: flex;
          align-items: flex-end;
          background:
            linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.22)),
            linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.10)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 60px rgba(0,0,0,0.28);
          animation: fadeUp 0.65s ease;
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(214,180,105,0.10), transparent 28%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 650px;
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

        .hero h1 {
          margin: 0 0 14px 0;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -1px;
        }

        .hero p {
          margin: 0;
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255,255,255,0.82);
          max-width: 580px;
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
          background: rgba(18, 19, 24, 0.72);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          border-radius: 24px;
        }

        .stat-card {
          padding: 22px;
        }

        .stat-label {
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #fff;
        }

        .stat-accent {
          margin-top: 10px;
          font-size: 13px;
          color: #d6b469;
        }

        .toolbar {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 18px;
          animation: fadeUp 0.8s ease;
        }

        .glass-card {
          padding: 24px;
        }

        .card-title {
          margin: 0 0 8px 0;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
        }

        .card-subtitle {
          margin: 0 0 20px 0;
          font-size: 14px;
          color: rgba(255,255,255,0.64);
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
          font-weight: 500;
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
          margin-top: 18px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-gold,
        .btn-dark,
        .btn-danger {
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
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
          background: rgba(220, 38, 38, 0.16);
          color: #fca5a5;
          border: 1px solid rgba(220, 38, 38, 0.26);
        }

        .btn-gold:hover,
        .btn-dark:hover,
        .btn-danger:hover {
          transform: translateY(-2px);
        }

        .preview-box {
          margin-top: 18px;
          width: 100%;
          height: 220px;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          background: #0f1013;
        }

        .preview-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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
          margin-top: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.64);
        }

        .error-box {
          margin-top: 18px;
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.25);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        .products-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
          gap: 18px;
          animation: fadeUp 0.9s ease;
        }

        .product-card {
          overflow: hidden;
          border-radius: 24px;
          background: rgba(18, 19, 24, 0.72);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 22px 44px rgba(0,0,0,0.24);
        }

        .product-image-wrap {
          position: relative;
          height: 260px;
          overflow: hidden;
          background: #121316;
        }

        .product-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .category-badge {
          position: absolute;
          left: 14px;
          top: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(10,10,10,0.68);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f6f1e7;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .product-content {
          padding: 18px;
        }

        .product-brand {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.6px;
          color: #d6b469;
          margin-bottom: 8px;
        }

        .product-name {
          margin: 0 0 10px 0;
          font-size: 22px;
          line-height: 1.2;
          color: white;
        }

        .product-price {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }

        .product-actions {
          display: flex;
          gap: 10px;
        }

        .product-actions button {
          flex: 1;
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
          .productos-page {
            padding: 16px;
          }

          .hero {
            min-height: 280px;
            padding: 22px;
          }

          .hero h1 {
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

          .product-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="productos-page">
        <div className="productos-container">
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">Catálogo premium</div>
              <h1>Productos con estilo, imagen y presencia de marca.</h1>
              <p>
                Administra tu catálogo de moda con una vista elegante, moderna y coherente
                con el login premium. Cada producto puede mostrar su propia imagen para que
                todo se vea mucho más profesional.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total productos</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-accent">Catálogo general</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Caballeros</div>
              <div className="stat-value">{stats.caballeros}</div>
              <div className="stat-accent">Colección masculina</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Damas</div>
              <div className="stat-value">{stats.damas}</div>
              <div className="stat-accent">Colección femenina</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Valor catálogo</div>
              <div className="stat-value">{formatPrecio(stats.valorTotal)}</div>
              <div className="stat-accent">Suma de precios</div>
            </div>
          </section>

          <section className="toolbar">
            {esAdmin && (
              <div className="glass-card">
                <h2 className="card-title">
                  {editando ? 'Editar producto' : 'Agregar producto'}
                </h2>
                <p className="card-subtitle">
                  Completa la información y añade una imagen por URL para que cada producto
                  tenga una presentación visual premium.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Nombre</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Blazer Slim Fit"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Marca</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Atelier"
                      value={form.marca}
                      onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Precio</label>
                    <input
                      className="premium-input"
                      type="number"
                      placeholder="Ej. 3490"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Categoría</label>
                    <select
                      className="premium-select"
                      value={form.id_categoria}
                      onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="1">Caballeros</option>
                      <option value="2">Damas</option>
                    </select>
                  </div>

                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>URL de la imagen</label>
                    <input
                      className="premium-input"
                      placeholder="https://..."
                      value={form.imagen_url}
                      onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="preview-box">
                  <img
                    src={form.imagen_url || PRODUCT_PLACEHOLDER}
                    alt="Vista previa del producto"
                    onError={(e) => {
                      e.currentTarget.src = PRODUCT_PLACEHOLDER;
                    }}
                  />
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={guardar}>
                    {editando ? 'Guardar cambios' : 'Agregar producto'}
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
              <h2 className="card-title">Explorar catálogo</h2>
              <p className="card-subtitle">
                Busca productos por nombre o marca y revisa su presentación visual.
              </p>

              <div className="search-row">
                <div className="field">
                  <label>Búsqueda</label>
                  <input
                    className="premium-input"
                    placeholder="Buscar por nombre o marca..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <button className="btn-dark" onClick={() => setBusqueda('')}>
                  Limpiar
                </button>
              </div>

              <div className="search-meta">
                Mostrando {productosFiltrados.length} de {productos.length} productos.
              </div>
            </div>
          </section>

          {productosFiltrados.length === 0 ? (
            <div className="empty-box">
              No hay productos para mostrar.
            </div>
          ) : (
            <section className="products-grid">
              {productosFiltrados.map((p) => (
                <article key={p.id_producto} className="product-card">
                  <div className="product-image-wrap">
                    <img
                      src={getProductImage(p)}
                      alt={p.nombre}
                      onError={(e) => {
                        e.currentTarget.src = PRODUCT_PLACEHOLDER;
                      }}
                    />
                    <div className="category-badge">
                      {getCategoriaNombre(p.id_categoria)}
                    </div>
                  </div>

                  <div className="product-content">
                    <div className="product-brand">{p.marca || 'Marca'}</div>
                    <h3 className="product-name">{p.nombre}</h3>
                    <div className="product-price">{formatPrecio(p.precio)}</div>

                    {esAdmin && (
                      <div className="product-actions">
                        <button className="btn-gold" onClick={() => editar(p)}>
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => eliminar(p.id_producto)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  );
}