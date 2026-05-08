import { useEffect, useMemo, useRef, useState } from 'react';
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
      <text x="50%" y="48%" text-anchor="middle" fill="#d6b469" font-size="52" font-family="Arial">ATELIER</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial">Sin imagen</text>
    </svg>
  `);

export default function Productos({ usuario }) {
  const fileInputRef = useRef(null);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [preview, setPreview] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    marca: '',
    precio: '',
    id_categoria: '',
    imagen_url: '',
    foto: null,
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
    const caballeros = productos.filter((p) => String(p.id_categoria) === '1').length;
    const damas = productos.filter((p) => String(p.id_categoria) === '2').length;

    const valorTotal = productos.reduce((acc, p) => {
      return acc + (Number(p.precio) || 0);
    }, 0);

    return {
      total,
      caballeros,
      damas,
      valorTotal,
    };
  }, [productos]);

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      maximumFractionDigits: 2,
    }).format(Number(precio) || 0);
  };

  const getCategoria = (id) => {
    if (String(id) === '1') return 'Caballeros';
    if (String(id) === '2') return 'Damas';
    return 'Categoria';
  };

  const limpiarForm = () => {
    setForm({
      nombre: '',
      marca: '',
      precio: '',
      id_categoria: '',
      imagen_url: '',
      foto: null,
    });

    setPreview('');
    setEditando(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const seleccionarFoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecciona una imagen valida');
      return;
    }

    setForm((prev) => ({
      ...prev,
      foto: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio || !form.id_categoria) {
      setError('Completa nombre, precio y categoria');
      return;
    }

    try {
      setError('');

      const data = new FormData();
      data.append('nombre', form.nombre);
      data.append('marca', form.marca || '');
      data.append('precio', form.precio);
      data.append('id_categoria', form.id_categoria);
      data.append('imagen_url', form.imagen_url || '');

      if (form.foto) {
        data.append('foto', form.foto);
      }

      if (editando) {
        await api.put(`/productos/${editando}`, data);
      } else {
        await api.post('/productos', data);
      }

      limpiarForm();
      cargar();
    } catch (err) {
      setError('No se pudo guardar el producto');
    }
  };

  const editar = (p) => {
    setEditando(p.id_producto);

    setForm({
      nombre: p.nombre || '',
      marca: p.marca || '',
      precio: p.precio || '',
      id_categoria: p.id_categoria || '',
      imagen_url: p.imagen_url || '',
      foto: null,
    });

    setPreview(p.imagen_url || '');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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

  if (loading) {
    return (
      <div className="products-loading">
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
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .products-loading {
          min-height: 100vh;
          background: #08090b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
        }

        .products-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .products-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .products-hero {
          position: relative;
          overflow: hidden;
          min-height: 300px;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            linear-gradient(to right, rgba(0,0,0,0.56), rgba(0,0,0,0.25)),
            linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.10)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          animation: fadeUp 0.65s ease;
        }

        .products-hero::before {
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
          max-width: 720px;
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

        .products-hero h1 {
          margin: 0 0 14px;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -1px;
        }

        .products-hero p {
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
        }

        .stat-card,
        .glass-card,
        .product-card {
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
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
          margin-top: 24px;
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
          color: white;
        }

        .premium-input:focus,
        .premium-select:focus {
          border-color: rgba(214,180,105,0.85);
          box-shadow: 0 0 0 4px rgba(214,180,105,0.10);
        }

        .photo-box {
          margin-top: 18px;
          min-height: 220px;
          border-radius: 22px;
          overflow: hidden;
          border: 1px dashed rgba(214,180,105,0.35);
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.10), transparent 28%),
            rgba(255,255,255,0.025);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .photo-box img {
          width: 100%;
          height: 260px;
          object-fit: cover;
          display: block;
        }

        .photo-empty {
          padding: 24px;
        }

        .photo-empty-title {
          color: #d6b469;
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: 2px;
          font-size: 28px;
          margin-bottom: 10px;
        }

        .photo-empty-text {
          color: rgba(255,255,255,0.68);
          font-size: 14px;
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

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
          gap: 18px;
          margin-top: 24px;
        }

        .product-card {
          overflow: hidden;
        }

        .product-image {
          position: relative;
          height: 280px;
          background: #141519;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.04);
        }

        .category-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(0,0,0,0.65);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f6f1e7;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .product-info {
          padding: 18px;
        }

        .product-brand {
          color: #d6b469;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .product-name {
          margin: 0 0 10px;
          font-size: 22px;
          line-height: 1.2;
        }

        .product-price {
          font-size: 26px;
          font-weight: 900;
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
          .products-page {
            padding: 16px;
          }

          .products-hero {
            min-height: 280px;
            padding: 22px;
          }

          .products-hero h1 {
            font-size: 36px;
          }

          .stats-grid,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .search-row,
          .product-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      <div className="products-page">
        <div className="products-container">
          <section className="products-hero">
            <div className="hero-content">
              <div className="eyebrow">Catalogo premium</div>
              <h1>Productos con imagen cargada desde tu ordenador.</h1>
              <p>
                Agrega productos de forma mas facil: completa la informacion,
                presiona Agregar foto y selecciona la imagen desde tu PC.
              </p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total productos</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-accent">Catalogo general</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Caballeros</div>
              <div className="stat-value">{stats.caballeros}</div>
              <div className="stat-accent">Coleccion masculina</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Damas</div>
              <div className="stat-value">{stats.damas}</div>
              <div className="stat-accent">Coleccion femenina</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Valor catalogo</div>
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
                  Ya no necesitas escribir rutas. Selecciona una imagen desde tu ordenador.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Nombre</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Camisa manga larga"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Marca</label>
                    <input
                      className="premium-input"
                      placeholder="Ej. Levis"
                      value={form.marca}
                      onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Precio</label>
                    <input
                      className="premium-input"
                      type="number"
                      placeholder="Ej. 1200"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Categoria</label>
                    <select
                      className="premium-select"
                      value={form.id_categoria}
                      onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}
                    >
                      <option value="">Selecciona una categoria</option>
                      <option value="1">Caballeros</option>
                      <option value="2">Damas</option>
                    </select>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={seleccionarFoto}
                />

                <div className="actions-row">
                  <button
                    type="button"
                    className="btn-dark"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Agregar foto
                  </button>

                  {(preview || form.imagen_url) && (
                    <button
                      type="button"
                      className="btn-dark"
                      onClick={() => {
                        setPreview('');
                        setForm({ ...form, foto: null, imagen_url: '' });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Quitar foto
                    </button>
                  )}
                </div>

                <div className="photo-box">
                  {preview || form.imagen_url ? (
                    <img src={preview || form.imagen_url} alt="Vista previa" />
                  ) : (
                    <div className="photo-empty">
                      <div className="photo-empty-title">Imagen del producto</div>
                      <div className="photo-empty-text">
                        Presiona Agregar foto y selecciona una imagen desde tu ordenador.
                      </div>
                    </div>
                  )}
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={guardar}>
                    {editando ? 'Guardar cambios' : 'Agregar producto'}
                  </button>

                  {editando && (
                    <button className="btn-dark" onClick={limpiarForm}>
                      Cancelar edicion
                    </button>
                  )}
                </div>

                {error && <div className="error-box">{error}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">Explorar catalogo</h2>
              <p className="card-subtitle">
                Busca productos por nombre o marca.
              </p>

              <div className="search-row">
                <div className="field">
                  <label>Busqueda</label>
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
                  <div className="product-image">
                    <img
                      src={p.imagen_url || PLACEHOLDER}
                      alt={p.nombre}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER;
                      }}
                    />

                    <div className="category-badge">
                      {getCategoria(p.id_categoria)}
                    </div>
                  </div>

                  <div className="product-info">
                    <div className="product-brand">{p.marca || 'ATELIER'}</div>
                    <h3 className="product-name">{p.nombre}</h3>
                    <div className="product-price">{formatPrecio(p.precio)}</div>

                    {esAdmin && (
                      <div className="product-actions">
                        <button className="btn-gold" onClick={() => editar(p)}>
                          Editar
                        </button>

                        <button className="btn-danger" onClick={() => eliminar(p.id_producto)}>
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
