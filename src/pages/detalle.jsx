import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const PLACEHOLDER = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=f0f0f0&color=555&bold=true&format=svg`

export default function Detalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from('productos').select('*, categorias(nombre)').eq('id_producto', id).single()
      setProducto(data)
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return <div style={{padding:'4rem',textAlign:'center',color:'#aaa'}}>Cargando...</div>
  if (!producto) return <div style={{padding:'4rem',textAlign:'center',color:'#aaa'}}>Producto no encontrado.</div>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; color: #1a1a1a; }
        .detalle-wrap { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .volver-btn { background: none; border: none; color: #999; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer; padding: 0; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.4rem; }
        .volver-btn:hover { color: #c8a96e; }
        .detalle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        @media (max-width: 600px) { .detalle-grid { grid-template-columns: 1fr; } }
        .detalle-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 20px; background: #f5f5f0; }
        .detalle-info { display: flex; flex-direction: column; gap: 1rem; }
        .detalle-categoria { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c8a96e; font-weight: 500; }
        .detalle-nombre { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; line-height: 1.2; }
        .detalle-marca { font-size: 0.9rem; color: #999; }
        .detalle-precio { font-size: 2rem; font-weight: 700; }
        .detalle-desc { font-size: 0.9rem; color: #666; line-height: 1.7; }
        .agregar-btn { background: #1a1a1a; color: #fff; border: none; border-radius: 12px; padding: 1rem; font-family: 'DM Sans', sans-serif; font-size: 1rem; cursor: pointer; transition: background 0.2s; margin-top: auto; }
        .agregar-btn:hover { background: #c8a96e; }
      `}</style>
      <div className="detalle-wrap">
        <button className="volver-btn" onClick={() => navigate(-1)}>← Volver</button>
        <div className="detalle-grid">
          <img className="detalle-img" src={producto.imagen_url || PLACEHOLDER(producto.nombre)} alt={producto.nombre} onError={(e) => { e.target.src = PLACEHOLDER(producto.nombre) }} />
          <div className="detalle-info">
            <div className="detalle-categoria">{producto.categorias?.nombre}</div>
            <div className="detalle-nombre">{producto.nombre}</div>
            <div className="detalle-marca">{producto.marca}</div>
            <div className="detalle-precio">${producto.precio}</div>
            {producto.descripcion && <div className="detalle-desc">{producto.descripcion}</div>}
            <button className="agregar-btn">+ Agregar al carrito</button>
          </div>
        </div>
      </div>
    </>
  )
}