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
      <text x="50%" y="48%" text-anchor="middle" fill="#d6b469" font-size="52" font-family="Arial">ATELIER</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#ffffff" font-size="22" font-family="Arial">Sin imagen</text>
    </svg>
  `);

export default function Ventas({ usuario }) {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idCliente, setIdCliente] = useState('');
  const [items, setItems] = useState([
    { id_inventario: '', cantidad: 1, precio_unitario: '' },
  ]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const esAdmin = usuario?.rol === 'admin';
  const puedeVender = esAdmin || usuario?.rol === 'empleado';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');

      const [ventasRes, clientesRes, inventarioRes] = await Promise.all([
        api.get('/ventas'),
        api.get('/clientes'),
        api.get('/inventario'),
      ]);

      setVentas(ventasRes.data.data || []);
      setClientes(clientesRes.data.data || []);
      setInventario(inventarioRes.data.data || []);
    } catch (err) {
      setError('No se pudo cargar el modulo de ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      const texto = `${venta.id_venta || ''} ${venta.cliente || ''}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  }, [ventas, busqueda]);

  const totalFormulario = useMemo(() => {
    return items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      return acc + cantidad * precio;
    }, 0);
  }, [items]);

  const stats = useMemo(() => {
    const ingresos = ventas.reduce((acc, venta) => acc + (Number(venta.total) || 0), 0);
    const unidades = ventas.reduce((acc, venta) => acc + (Number(venta.unidades) || 0), 0);
    const totalVentas = ventas.length;
    const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;

    return {
      ingresos,
      unidades,
      totalVentas,
      ticketPromedio,
    };
  }, [ventas]);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';

    return new Date(value).toLocaleString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInventario = (idInventario) => {
    return inventario.find((item) => String(item.id_inventario) === String(idInventario));
  };

  const agregarItem = () => {
    setItems((prev) => [
      ...prev,
      { id_inventario: '', cantidad: 1, precio_unitario: '' },
    ]);
  };

  const eliminarItem = (index) => {
    if (items.length === 1) return;

    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarItem = (index, campo, valor) => {
    setItems((prev) => {
      const nuevos = [...prev];
      nuevos[index] = {
        ...nuevos[index],
        [campo]: valor,
      };

      if (campo === 'id_inventario') {
        const inv = getInventario(valor);

        nuevos[index].precio_unitario = inv?.precio || '';
        nuevos[index].cantidad = 1;
      }

      return nuevos;
    });
  };

  const limpiarVenta = () => {
    setIdCliente('');
    setItems([{ id_inventario: '', cantidad: 1, precio_unitario: '' }]);
    setError('');
  };

  const guardarVenta = async () => {
    if (!idCliente) {
      setError('Selecciona un cliente');
      return;
    }

    if (items.some((item) => !item.id_inventario || !item.cantidad || !item.precio_unitario)) {
      setError('Completa todos los productos de la venta');
      return;
    }

    for (const item of items) {
      const inv = getInventario(item.id_inventario);
      const cantidad = Number(item.cantidad);

      if (!inv) {
        setError('Uno de los productos seleccionados no existe en inventario');
        return;
      }

      if (cantidad <= 0) {
        setError('La cantidad debe ser mayor que cero');
        return;
      }

      if (cantidad > Number(inv.stock)) {
        setError(`Stock insuficiente para ${inv.producto}. Disponible: ${inv.stock}`);
        return;
      }
    }

    try {
      setGuardando(true);
      setError('');

      await api.post('/ventas', {
        id_cliente: idCliente,
        detalles: items.map((item) => ({
          id_inventario: item.id_inventario,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      });

      limpiarVenta();
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la venta');
    } finally {
      setGuardando(false);
    }
  };

  const verDetalle = async (idVenta) => {
    try {
      const res = await api.get(`/ventas/${idVenta}/detalles`);
      setDetalle({
        id_venta: idVenta,
        items: res.data.data || [],
      });
    } catch (err) {
      setError('No se pudo cargar el detalle de la venta');
    }
  };

  if (loading) {
    return (
      <div className="sales-loading">
        Cargando ventas...
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

        .sales-loading {
          min-height: 100vh;
          background: #08090b;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
        }

        .sales-page {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 22%),
            linear-gradient(180deg, #08090b 0%, #101114 100%);
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .sales-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sales-hero {
          position: relative;
          overflow: hidden;
          min-height: 300px;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            linear-gradient(to right, rgba(0,0,0,0.58), rgba(0,0,0,0.28)),
            linear-gradient(to top, rgba(0,0,0,0.60), rgba(0,0,0,0.10)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          animation: fadeUp 0.65s ease;
        }

        .sales-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(214,180,105,0.12), transparent 28%);
        }

        .hero-content,
        .hero-action {
          position: relative;
          z-index: 1;
        }

        .hero-content {
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

        .sales-hero h1 {
          margin: 0 0 14px;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -1px;
        }

        .sales-hero p {
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
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .sale-item {
          display: grid;
          grid-template-columns: 1.5fr 0.6fr 0.8fr auto;
          gap: 12px;
          align-items: end;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 12px;
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

        .btn-gold:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .sale-total-box {
          margin-top: 16px;
          padding: 18px;
          border-radius: 18px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.12), transparent 28%),
            rgba(255,255,255,0.04);
          border: 1px solid rgba(214,180,105,0.18);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .sale-total-label {
          color: rgba(255,255,255,0.65);
          font-size: 14px;
        }

        .sale-total-value {
          color: #d6b469;
          font-size: 30px;
          font-weight: 900;
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

        .sales-table-card {
          margin-top: 24px;
          overflow: hidden;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .sales-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .sales-table thead {
          background: rgba(255,255,255,0.045);
        }

        .sales-table th {
          text-align: left;
          padding: 18px;
          color: rgba(255,255,255,0.64);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sales-table td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          vertical-align: middle;
        }

        .sale-id {
          color: #d6b469;
          font-weight: 900;
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

        .empty-box {
          margin-top: 24px;
          padding: 34px;
          border-radius: 24px;
          border: 1px dashed rgba(255,255,255,0.14);
          text-align: center;
          color: rgba(255,255,255,0.66);
          background: rgba(255,255,255,0.03);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-card {
          width: min(900px, 100%);
          max-height: 86vh;
          overflow: auto;
          background: rgba(18, 19, 24, 0.96);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 26px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.55);
          padding: 24px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          margin: 0;
          font-size: 24px;
        }

        .detail-grid {
          display: grid;
          gap: 14px;
        }

        .detail-item {
          display: grid;
          grid-template-columns: 86px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
        }

        .detail-img {
          width: 86px;
          height: 96px;
          border-radius: 16px;
          overflow: hidden;
          background: #15161a;
          border: 1px solid rgba(255,255,255,0.10);
        }

        .detail-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .detail-name {
          font-weight: 900;
          margin-bottom: 6px;
        }

        .detail-meta {
          color: rgba(255,255,255,0.62);
          font-size: 13px;
        }

        .detail-price {
          text-align: right;
          font-weight: 900;
          color: #d6b469;
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
          .sales-page {
            padding: 16px;
          }

          .sales-hero {
            min-height: 280px;
            padding: 22px;
            flex-direction: column;
            align-items: flex-start;
          }

          .sales-hero h1 {
            font-size: 36px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .sale-item {
            grid-template-columns: 1fr;
          }

          .search-row,
          .actions-row {
            flex-direction: column;
            align-items: stretch;
          }

          .detail-item {
            grid-template-columns: 1fr;
          }

          .detail-img {
            width: 100%;
            height: 220px;
          }

          .detail-price {
            text-align: left;
          }
        }
      `}</style>

      <div className="sales-page">
        <div className="sales-container">
          <section className="sales-hero">
            <div className="hero-content">
              <div className="eyebrow">Modulo comercial</div>
              <h1>Ventas con control de stock y detalle premium.</h1>
              <p>
                Registra ventas seleccionando cliente, producto, talla, color y cantidad.
                El sistema descuenta automaticamente del inventario.
              </p>
            </div>

            {puedeVender && (
              <div className="hero-action">
                <button
                  className="btn-gold"
                  onClick={() => {
                    setMostrarForm(!mostrarForm);
                    setError('');
                  }}
                >
                  {mostrarForm ? 'Cerrar venta' : 'Nueva venta'}
                </button>
              </div>
            )}
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Ingresos totales</div>
              <div className="stat-value">{formatMoney(stats.ingresos)}</div>
              <div className="stat-accent">Ventas registradas</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Ventas</div>
              <div className="stat-value">{stats.totalVentas}</div>
              <div className="stat-accent">Operaciones completadas</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Unidades vendidas</div>
              <div className="stat-value">{stats.unidades}</div>
              <div className="stat-accent">Prendas facturadas</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Ticket promedio</div>
              <div className="stat-value">{formatMoney(stats.ticketPromedio)}</div>
              <div className="stat-accent">Promedio por venta</div>
            </div>
          </section>

          <section className="toolbar">
            {puedeVender && mostrarForm && (
              <div className="glass-card">
                <h2 className="card-title">Nueva venta</h2>
                <p className="card-subtitle">
                  Selecciona un cliente y agrega los productos vendidos. El total se calcula automaticamente.
                </p>

                <div className="form-grid">
                  <div className="field">
                    <label>Cliente</label>
                    <select
                      className="premium-select"
                      value={idCliente}
                      onChange={(e) => setIdCliente(e.target.value)}
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {items.map((item, index) => {
                      const inv = getInventario(item.id_inventario);

                      return (
                        <div className="sale-item" key={index}>
                          <div className="field">
                            <label>Producto / talla / color</label>
                            <select
                              className="premium-select"
                              value={item.id_inventario}
                              onChange={(e) => actualizarItem(index, 'id_inventario', e.target.value)}
                            >
                              <option value="">Selecciona producto</option>
                              {inventario
                                .filter((invItem) => Number(invItem.stock) > 0)
                                .map((invItem) => (
                                  <option key={invItem.id_inventario} value={invItem.id_inventario}>
                                    {invItem.producto} - {invItem.talla} - {invItem.color || 'Sin color'} | Stock: {invItem.stock}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="field">
                            <label>Cantidad</label>
                            <input
                              className="premium-input"
                              type="number"
                              min="1"
                              max={inv?.stock || 1}
                              value={item.cantidad}
                              onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                            />
                          </div>

                          <div className="field">
                            <label>Precio</label>
                            <input
                              className="premium-input"
                              type="number"
                              min="1"
                              value={item.precio_unitario}
                              onChange={(e) => actualizarItem(index, 'precio_unitario', e.target.value)}
                            />
                          </div>

                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => eliminarItem(index)}
                          >
                            Quitar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="actions-row">
                  <button className="btn-dark" onClick={agregarItem}>
                    + Agregar producto
                  </button>
                </div>

                <div className="sale-total-box">
                  <div>
                    <div className="sale-total-label">Total de la venta</div>
                    <div className="card-subtitle" style={{ margin: 0 }}>
                      Verifica stock, cliente y cantidades antes de guardar.
                    </div>
                  </div>

                  <div className="sale-total-value">
                    {formatMoney(totalFormulario)}
                  </div>
                </div>

                <div className="actions-row">
                  <button
                    className="btn-gold"
                    onClick={guardarVenta}
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar venta'}
                  </button>

                  <button
                    className="btn-dark"
                    onClick={() => {
                      limpiarVenta();
                      setMostrarForm(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>

                {error && <div className="error-box">{error}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">Explorar ventas</h2>
              <p className="card-subtitle">
                Busca por cliente o numero de venta.
              </p>

              <div className="search-row">
                <div className="field">
                  <label>Busqueda</label>
                  <input
                    className="premium-input"
                    placeholder="Buscar venta o cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <button className="btn-dark" onClick={() => setBusqueda('')}>
                  Limpiar
                </button>
              </div>

              <div className="search-meta">
                Mostrando {ventasFiltradas.length} de {ventas.length} ventas.
              </div>

              {!mostrarForm && error && <div className="error-box">{error}</div>}
            </div>
          </section>

          {ventasFiltradas.length === 0 ? (
            <div className="empty-box">
              No hay ventas registradas.
            </div>
          ) : (
            <section className="glass-card sales-table-card">
              <div className="table-wrapper">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Venta</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Unidades</th>
                      <th>Total</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventasFiltradas.map((venta) => (
                      <tr key={venta.id_venta}>
                        <td>
                          <span className="sale-id">#{venta.id_venta}</span>
                        </td>

                        <td>{venta.cliente || 'Sin cliente'}</td>

                        <td>{formatDate(venta.fecha)}</td>

                        <td>
                          <span className="pill">
                            {venta.unidades || 0} uds
                          </span>
                        </td>

                        <td>
                          <strong>{formatMoney(venta.total)}</strong>
                        </td>

                        <td>
                          <button
                            className="btn-dark"
                            onClick={() => verDetalle(venta.id_venta)}
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {detalle && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h2 className="modal-title">Detalle venta #{detalle.id_venta}</h2>

                  <button className="btn-dark" onClick={() => setDetalle(null)}>
                    Cerrar
                  </button>
                </div>

                {detalle.items.length === 0 ? (
                  <div className="empty-box">
                    Esta venta no tiene detalles.
                  </div>
                ) : (
                  <div className="detail-grid">
                    {detalle.items.map((item, index) => (
                      <div className="detail-item" key={index}>
                        <div className="detail-img">
                          <img
                            src={item.imagen_url || PLACEHOLDER}
                            alt={item.producto}
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER;
                            }}
                          />
                        </div>

                        <div>
                          <div className="detail-name">{item.producto}</div>
                          <div className="detail-meta">
                            {item.marca || 'ATELIER'} · Talla {item.talla} · {item.color || 'Sin color'}
                          </div>
                          <div className="detail-meta">
                            Cantidad: {item.cantidad} · Precio unitario: {formatMoney(item.precio_unitario)}
                          </div>
                        </div>

                        <div className="detail-price">
                          {formatMoney(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
