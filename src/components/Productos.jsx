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

export default function Productos({ usuario, onRequireLogin }) {
  const fileInputRef = useRef(null);

  const [productos, setProductos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [clientes, setClientes] = useState([]);
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

  const [carrito, setCarrito] = useState([]);
  const [clienteCarrito, setClienteCarrito] = useState('');
  const [productoModal, setProductoModal] = useState(null);
  const [idInventarioModal, setIdInventarioModal] = useState('');
  const [cantidadModal, setCantidadModal] = useState(1);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [vendiendo, setVendiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const esAdmin = usuario?.rol === 'admin';
  const esVistaTienda = !usuario || usuario?.rol === 'cliente';
  const puedeVender =
   !!usuario &&
  (usuario?.rol === 'admin' ||
    usuario?.rol === 'empleado' ||
    usuario?.rol === 'cliente');
  esAdmin || usuario?.rol === 'empleado' || usuario?.rol === 'cliente';

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');

      const [productosRes, inventarioRes, clientesRes] = await Promise.all([
        api.get('/productos'),
        api.get('/inventario'),
        api.get('/clientes'),
      ]);

      setProductos(productosRes.data.data || []);
      setInventario(inventarioRes.data.data || []);
      setClientes(clientesRes.data.data || []);
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

  const carritoTotal = useMemo(() => {
    return carrito.reduce((acc, item) => {
      return acc + (Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0);
    }, 0);
  }, [carrito]);

  const carritoUnidades = useMemo(() => {
    return carrito.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
  }, [carrito]);

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

  const getVariantesProducto = (producto) => {
    if (!producto) return [];

    return inventario.filter((item) => {
      return String(item.id_producto) === String(producto.id_producto) && Number(item.stock) > 0;
    });
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
      setError(err.response?.data?.message || 'No se pudo guardar el producto');
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

  const abrirModalCarrito = (producto) => {
    const variantes = getVariantesProducto(producto);

    setProductoModal(producto);
    setIdInventarioModal(variantes[0]?.id_inventario || '');
    setCantidadModal(1);
    setMensaje('');
  };

  const cerrarModalCarrito = () => {
    setProductoModal(null);
    setIdInventarioModal('');
    setCantidadModal(1);
  };

  const agregarAlCarrito = () => {
    const inv = inventario.find((item) => String(item.id_inventario) === String(idInventarioModal));

    if (!productoModal || !inv) {
      setError('Selecciona una talla/color disponible');
      return;
    }

    const cantidad = Number(cantidadModal);

    if (!cantidad || cantidad <= 0) {
      setError('La cantidad debe ser mayor que cero');
      return;
    }

    if (cantidad > Number(inv.stock)) {
      setError(`Stock insuficiente. Disponible: ${inv.stock}`);
      return;
    }

    setCarrito((prev) => {
      const existente = prev.find((item) => String(item.id_inventario) === String(inv.id_inventario));

      if (existente) {
        return prev.map((item) => {
          if (String(item.id_inventario) !== String(inv.id_inventario)) return item;

          const nuevaCantidad = Number(item.cantidad) + cantidad;
          const cantidadFinal = Math.min(nuevaCantidad, Number(inv.stock));

          return {
            ...item,
            cantidad: cantidadFinal,
          };
        });
      }

      return [
        ...prev,
        {
          id_inventario: inv.id_inventario,
          id_producto: productoModal.id_producto,
          producto: productoModal.nombre,
          marca: productoModal.marca,
          imagen_url: productoModal.imagen_url,
          talla: inv.talla,
          color: inv.color,
          stock: inv.stock,
          cantidad,
          precio_unitario: Number(productoModal.precio) || Number(inv.precio) || 0,
        },
      ];
    });

    setMostrarCarrito(true);
    cerrarModalCarrito();
  };

  const quitarDelCarrito = (idInventario) => {
    setCarrito((prev) => prev.filter((item) => String(item.id_inventario) !== String(idInventario)));
  };

  const actualizarCantidadCarrito = (idInventario, cantidad) => {
    setCarrito((prev) => prev.map((item) => {
      if (String(item.id_inventario) !== String(idInventario)) return item;

      const nuevaCantidad = Math.max(1, Math.min(Number(cantidad) || 1, Number(item.stock) || 1));

      return {
        ...item,
        cantidad: nuevaCantidad,
      };
    }));
  };

  const finalizarVentaCarrito = async () => {
  
  if (!clienteFinal) {
    setError('Selecciona un cliente para finalizar la venta');
    return;
  }

  if (carrito.length === 0) {
    setError('El carrito esta vacio');
    return;
  }
    const clienteSesion = clientes.find((c) =>
  String(c.email || '').toLowerCase() === String(usuario?.email || '').toLowerCase()
  || String(c.nombre || '').toLowerCase() === String(usuario?.nombre || '').toLowerCase()
);

const clienteFinal =
  usuario?.rol === 'cliente'
    ? (usuario?.id_cliente || clienteSesion?.id_cliente)
    : clienteCarrito;

if (!clienteFinal) {
  setError(
    usuario?.rol === 'cliente'
      ? 'No se encontró tu cliente registrado. Crea o revisa tu cuenta de cliente.'
      : 'Selecciona un cliente para finalizar la venta'
  );
  return;
}

    if (carrito.length === 0) {
      setError('El carrito esta vacio');
      return;
    }

    try {
      setVendiendo(true);
      setError('');

      await api.post('/ventas', {
        id_cliente: clienteFinal,
        detalles: carrito.map((item) => ({
          id_inventario: item.id_inventario,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      });

      setCarrito([]);
      setClienteCarrito('');
      setMostrarCarrito(false);
      setMensaje('Venta realizada correctamente desde el carrito');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo finalizar la venta');
    } finally {
      setVendiendo(false);
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
        * { box-sizing: border-box; }

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
          position: relative;
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
          justify-content: space-between;
          gap: 20px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            linear-gradient(to right, rgba(0,0,0,0.56), rgba(0,0,0,0.25)),
            linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.10)),
            url(${bgImage});
          background-size: cover;
          background-position: center top;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
        }

        .products-hero::before {
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
        }

        .premium-select option {
          background: #111214;
          color: white;
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

        .error-box,
        .success-box {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        .error-box {
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5;
        }

        .success-box {
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
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
        .product-availability {
  margin-top: -6px;
  margin-bottom: 16px;
  color: rgba(255,255,255,0.58);
  font-size: 13px;
  line-height: 1.5;
}
          font-size: 26px;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .product-actions {
          display: flex;
          flex-wrap: wrap;
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

        .cart-floating {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 1500;
          border-radius: 999px;
          padding: 16px 22px;
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
          width: min(720px, 100%);
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

        .cart-list {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 74px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 12px;
          border-radius: 18px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .cart-img {
          width: 74px;
          height: 84px;
          border-radius: 14px;
          overflow: hidden;
          background: #15161a;
        }

        .cart-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cart-name {
          font-weight: 900;
          margin-bottom: 4px;
        }

        .cart-meta {
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          line-height: 1.5;
        }

        .cart-total {
          margin-top: 18px;
          padding: 18px;
          border-radius: 18px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.12), transparent 28%),
            rgba(255,255,255,0.04);
          border: 1px solid rgba(214,180,105,0.18);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .cart-total-value {
          color: #d6b469;
          font-size: 28px;
          font-weight: 900;
        }

.atelier-footer {
  margin-top: 42px;
  padding: 28px;
  border-radius: 26px;
  background: rgba(18, 19, 24, 0.74);
  border: 1px solid rgba(255,255,255,0.10);
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  color: rgba(255,255,255,0.68);
}

.footer-brand {
  font-family: Georgia, 'Times New Roman', serif;
  letter-spacing: 6px;
  color: #f2eee7;
  font-size: 26px;
  margin-bottom: 8px;
}

.atelier-footer p {
  margin: 0;
  max-width: 520px;
  line-height: 1.7;
  font-size: 14px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.footer-links span {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  font-size: 12px;
  color: rgba(255,255,255,0.78);
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
        .atelier-footer {
  flex-direction: column;
  align-items: flex-start;
}

.footer-links {
  justify-content: flex-start;
}
          .products-page {
            padding: 16px;
          }

          .products-hero {
            min-height: 280px;
            padding: 22px;
            flex-direction: column;
            align-items: flex-start;
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

          .cart-item {
            grid-template-columns: 1fr;
          }

          .cart-img {
            width: 100%;
            height: 220px;
          }
        }
      `}</style>

      <div className="products-page">
        <div className="products-container">
          <section className="products-hero">
            <div className="hero-content">
              <div className="eyebrow">
  {esVistaTienda ? 'Atelier collection' : 'Catálogo premium'}
</div>

<h1>
  {esVistaTienda
    ? 'Colección premium para vestir con estilo.'
    : 'Productos con foto, stock y carrito.'}
</h1>

<p>
  {esVistaTienda
    ? 'Explora prendas exclusivas, elige tu talla y compra de forma rápida cuando encuentres tu favorita.'
    : 'Agrega productos con imagen desde tu ordenador y vende desde el catálogo usando el carrito.'}
</p>
            </div>

            {puedeVender && (
              <div className="hero-action">
                <button className="btn-gold" onClick={() => setMostrarCarrito(true)}>
                  Carrito ({carritoUnidades})
                </button>
              </div>
            )}
          </section>

          <section className="stats-grid">
  {esVistaTienda ? (
    <>
      <div className="stat-card">
        <div className="stat-label">Nueva colección</div>
        <div className="stat-value">2026</div>
        <div className="stat-accent">Piezas seleccionadas</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Cambios</div>
        <div className="stat-value">48h</div>
        <div className="stat-accent">Por talla o ajuste</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Compra segura</div>
        <div className="stat-value">100%</div>
        <div className="stat-accent">Proceso protegido</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Estilo premium</div>
        <div className="stat-value">AT</div>
        <div className="stat-accent">Atelier selection</div>
      </div>
    </>
  ) : (
    <>
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
    </>
  )}
          </section>

          <section className="toolbar">
            {esAdmin && (
              <div className="glass-card">
                <h2 className="card-title">
                  {editando ? 'Editar producto' : 'Agregar producto'}
                </h2>

                <p className="card-subtitle">
                  Selecciona la foto desde tu ordenador.
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
                        Presiona Agregar foto y selecciona una imagen.
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
                {mensaje && <div className="success-box">{mensaje}</div>}
              </div>
            )}

            <div className="glass-card">
              <h2 className="card-title">
  {esVistaTienda ? 'Encuentra tu próxima prenda' : 'Explorar catálogo'}
</h2>

<p className="card-subtitle">
  {esVistaTienda
    ? 'Busca por nombre o marca y descubre piezas disponibles para tu estilo.'
    : 'Busca productos por nombre o marca.'}
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

              {!esAdmin && error && <div className="error-box">{error}</div>}
              {!esAdmin && mensaje && <div className="success-box">{mensaje}</div>}
            </div>
          </section>

          {productosFiltrados.length === 0 ? (
            <div className="empty-box">
              No hay productos para mostrar.
            </div>
          ) : (
            <section className="products-grid">
              {productosFiltrados.map((p) => {
                const variantes = getVariantesProducto(p);
                const disponible = variantes.length > 0;

                return (
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
                      <div className="product-availability">
  {disponible
    ? 'Disponible en tallas y colores seleccionados'
    : 'No disponible actualmente'}
</div>

                      <div className="product-actions">
                        {puedeVender && (
                          <button
                            className={disponible ? 'btn-gold' : 'btn-dark'}
                            onClick={() => abrirModalCarrito(p)}
                            disabled={!disponible}
                            title={!disponible ? 'No hay stock disponible en inventario' : ''}
                          >
                            {disponible ? 'Agregar al carrito' : 'Sin stock'}
                          </button>
                        )}
                        {!usuario && (
  <button
    className="btn-gold"
    onClick={onRequireLogin}
  >
    Iniciar sesión para comprar
  </button>
)}

                        {esAdmin && (
                          <>
                            <button className="btn-dark" onClick={() => editar(p)}>
                              Editar
                            </button>

                            <button className="btn-danger" onClick={() => eliminar(p.id_producto)}>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
          
                    {esVistaTienda && (
            <footer className="atelier-footer">
              <div>
                <div className="footer-brand">ATELIER</div>
                <p>
                  Moda que trasciende. Diseñado para quienes buscan presencia,
                  estilo y elegancia.
                </p>
              </div>

              <div className="footer-links">
                <span>Catálogo premium</span>
                <span>Cambios por talla</span>
                <span>Compra segura</span>
                <span>Servicio al cliente</span>
              </div>
            </footer>
          )}

          {puedeVender && carrito.length > 0 && (
            <button className="btn-gold cart-floating" onClick={() => setMostrarCarrito(true)}>
              Carrito · {carritoUnidades} uds · {formatPrecio(carritoTotal)}
            </button>
          )}

          {productoModal && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h2 className="modal-title">Agregar al carrito</h2>
                  <button className="btn-dark" onClick={cerrarModalCarrito}>Cerrar</button>
                </div>

                <div className="cart-item">
                  <div className="cart-img">
                    <img
                      src={productoModal.imagen_url || PLACEHOLDER}
                      alt={productoModal.nombre}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER;
                      }}
                    />
                  </div>

                  <div>
                    <div className="cart-name">{productoModal.nombre}</div>
                    <div className="cart-meta">{productoModal.marca || 'ATELIER'} · {formatPrecio(productoModal.precio)}</div>
                  </div>
                </div>

                <div className="field" style={{ marginTop: 18 }}>
                  <label>Talla / color disponible</label>
                  <select
                    className="premium-select"
                    value={idInventarioModal}
                    onChange={(e) => setIdInventarioModal(e.target.value)}
                  >
                    <option value="">Selecciona una opcion</option>
                    {getVariantesProducto(productoModal).map((item) => (
                      <option key={item.id_inventario} value={item.id_inventario}>
                        Talla {item.talla} · {item.color || 'Sin color'} · Stock {item.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label>Cantidad</label>
                  <input
                    className="premium-input"
                    type="number"
                    min="1"
                    value={cantidadModal}
                    onChange={(e) => setCantidadModal(e.target.value)}
                  />
                </div>

                <div className="actions-row">
                  <button className="btn-gold" onClick={agregarAlCarrito}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          )}

          {mostrarCarrito && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h2 className="modal-title">Carrito</h2>
                  <button className="btn-dark" onClick={() => setMostrarCarrito(false)}>Cerrar</button>
                </div>

             {usuario?.rol !== 'cliente' && (
  <div className="field">
    <label>Cliente</label>
    <select
      className="premium-select"
      value={clienteCarrito}
      onChange={(e) => setClienteCarrito(e.target.value)}
    >
      <option value="">Selecciona un cliente</option>
      {clientes
        .filter((cliente) => cliente.estado !== 'inactivo')
        .map((cliente) => (
          <option key={cliente.id_cliente} value={cliente.id_cliente}>
            {cliente.nombre}
          </option>
        ))}
    </select>
  </div>
)}
{usuario?.rol === 'cliente' && (
  <div className="success-box">
    Comprarás como {usuario?.nombre || usuario?.email}
  </div>
)}

                {carrito.length === 0 ? (
                  <div className="empty-box">
                    El carrito esta vacio.
                  </div>
                ) : (
                  <div className="cart-list">
                    {carrito.map((item) => (
                      <div className="cart-item" key={item.id_inventario}>
                        <div className="cart-img">
                          <img
                            src={item.imagen_url || PLACEHOLDER}
                            alt={item.producto}
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER;
                            }}
                          />
                        </div>

                        <div>
                          <div className="cart-name">{item.producto}</div>
                          <div className="cart-meta">
                            {item.marca || 'ATELIER'} · Talla {item.talla} · {item.color || 'Sin color'}
                          </div>
                          <div className="cart-meta">
                            Precio: {formatPrecio(item.precio_unitario)} · Stock: {item.stock}
                          </div>

                          <div className="field" style={{ marginTop: 10, maxWidth: 160 }}>
                            <label>Cantidad</label>
                            <input
                              className="premium-input"
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.cantidad}
                              onChange={(e) => actualizarCantidadCarrito(item.id_inventario, e.target.value)}
                            />
                          </div>
                        </div>

                        <button className="btn-danger" onClick={() => quitarDelCarrito(item.id_inventario)}>
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="cart-total">
                  <div>
                    <div className="card-title" style={{ margin: 0 }}>Total</div>
                    <div className="card-subtitle" style={{ margin: 0 }}>
                      {carritoUnidades} unidades en carrito
                    </div>
                  </div>

                  <div className="cart-total-value">
                    {formatPrecio(carritoTotal)}
                  </div>
                </div>

                <div className="actions-row">
                  <button
                    className="btn-gold"
                    onClick={finalizarVentaCarrito}
                    disabled={vendiendo || carrito.length === 0}
                  >
                    {vendiendo ? 'Procesando...' : 'Finalizar venta'}
                  </button>

                  <button
                    className="btn-dark"
                    onClick={() => setCarrito([])}
                    disabled={carrito.length === 0}
                  >
                    Vaciar carrito
                  </button>
                </div>

                {error && <div className="error-box">{error}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
