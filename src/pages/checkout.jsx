import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const carrito = state?.carrito || []
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
  const [form, setForm] = useState({ nombre: '', email: '', direccion: '', ciudad: '', tarjeta: '', vencimiento: '', cvv: '' })
  const [enviado, setEnviado] = useState(false)

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function handlePagar() {
    if (!form.nombre || !form.email || !form.direccion || !form.tarjeta) return alert('Por favor completa todos los campos')
    setEnviado(true)
  }

  if (enviado) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',sans-serif",background:'#fafaf8'}}>
      <div style={{textAlign:'center',padding:'2rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>✅</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',marginBottom:'0.5rem'}}>¡Pedido confirmado!</h2>
        <p style={{color:'#999',marginBottom:'2rem'}}>Gracias por tu compra. Te enviaremos un correo pronto.</p>
        <Link to="/" style={{background:'#1a1a1a',color:'#fff',padding:'0.8rem 2rem',borderRadius:'10px',textDecoration:'none',fontSize:'0.9rem'}}>Volver a la tienda</Link>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf8; color: #1a1a1a; }
        .checkout-wrap { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .checkout-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; }
        .checkout-logo span { color: #c8a96e; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
        @media (max-width: 700px) { .checkout-grid { grid-template-columns: 1fr; } }
        .seccion { background: #fff; border-radius: 16px; border: 1px solid #eeeee8; padding: 1.5rem; }
        .seccion h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; margin-bottom: 1.2rem; }
        .campo { margin-bottom: 1rem; }
        .campo label { display: block; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.4rem; color: #555; }
        .campo input { width: 100%; padding: 0.65rem 0.9rem; border: 1.5px solid #e0e0da; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .campo input:focus { border-color: #c8a96e; }
        .campo-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .resumen-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #f5f5f0; font-size: 0.88rem; }
        .resumen-item:last-of-type { border-bottom: none; }
        .resumen-total { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #1a1a1a; }
        .pagar-btn { width: 100%; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; padding: 1rem; font-family: 'DM Sans', sans-serif; font-size: 1rem; cursor: pointer; margin-top: 1.2rem; transition: background 0.2s; }
        .pagar-btn:hover { background: #c8a96e; }
        .volver-link { font-size: 0.82rem; color: #999; text-decoration: none; display: inline-block; margin-bottom: 1.5rem; }
        .volver-link:hover { color: #c8a96e; }
      `}</style>
      <div className="checkout-wrap">
        <div className="checkout-logo">VESTI<span>R</span></div>
        <Link to="/" className="volver-link">← Volver a la tienda</Link>
        <div className="checkout-grid">
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <div className="seccion">
              <h3>Datos de envío</h3>
              <div className="campo"><label>Nombre completo</label><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" /></div>
              <div className="campo"><label>Correo</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" /></div>
              <div className="campo"><label>Dirección</label><input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle y número" /></div>
              <div className="campo"><label>Ciudad</label><input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ciudad" /></div>
            </div>
            <div className="seccion">
              <h3>Datos de pago</h3>
              <div className="campo"><label>Número de tarjeta</label><input name="tarjeta" value={form.tarjeta} onChange={handleChange} placeholder="•••• •••• •••• ••••" maxLength={19} /></div>
              <div className="campo-row">
                <div className="campo"><label>Vencimiento</label><input name="vencimiento" value={form.vencimiento} onChange={handleChange} placeholder="MM/AA" /></div>
                <div className="campo"><label>CVV</label><input name="cvv" value={form.cvv} onChange={handleChange} placeholder="•••" maxLength={4} /></div>
              </div>
            </div>
          </div>
          <div>
            <div className="seccion">
              <h3>Resumen del pedido</h3>
              {carrito.length === 0 ? <p style={{color:'#aaa',fontSize:'0.88rem'}}>Carrito vacío</p> : carrito.map(p => (
                <div className="resumen-item" key={p.id_producto}>
                  <span>{p.nombre} ×{p.cantidad}</span>
                  <span>${(p.precio * p.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <div className="resumen-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button className="pagar-btn" onClick={handlePagar}>Confirmar pago →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}