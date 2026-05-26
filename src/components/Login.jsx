import { useState } from 'react';
import api from '../api/api';
import bgImage from '../assets/login-nosotros.png';

export default function Login({ onLogin, onBackCatalogo }) {
  const [modo, setModo] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
  });

  const esRegistro = modo === 'registro';

  const actualizarCampo = (campo, valor) => {
    setError('');
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const guardarSesion = (data) => {
    const usuario = data.usuario || data.user;

    if (!usuario) {
      throw new Error('El servidor no devolvió usuario');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    localStorage.setItem('usuario', JSON.stringify(usuario));
    onLogin(usuario);
  };

  const enviar = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    if (esRegistro) {
      if (!form.nombre) {
        setError('El nombre es obligatorio');
        return;
      }

      if (form.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      if (form.password !== form.confirmarPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      const endpoint = esRegistro ? '/auth/register' : '/auth/login';

      const res = await api.post(endpoint, {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        confirmarPassword: form.confirmarPassword,
      });

      guardarSesion(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No se pudo completar la operación'
      );
    } finally {
      setLoading(false);
    }
  };

  const cambiarModo = () => {
    setError('');
    setModo(esRegistro ? 'login' : 'registro');
    setForm({
      nombre: '',
      email: '',
      password: '',
      confirmarPassword: '',
    });
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

   .login-page {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #08090b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 40px;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.login-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 80% 12%;
  z-index: 0;
  filter: brightness(0.92) contrast(1.04);
}

.login-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.58) 26%,
    rgba(0, 0, 0, 0.26) 55%,
    rgba(0, 0, 0, 0.06) 100%
  );
}

        .login-card {
          position: relative;
          z-index: 2;
          width: min(460px, 100%);
          padding: 34px;
          border-radius: 28px;
          background: rgba(12, 13, 16, 0.78);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 30px 80px rgba(0,0,0,0.44);
          backdrop-filter: blur(18px);
        }

        .back-store-btn {
          margin-bottom: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.82);
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .back-store-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(214,180,105,0.42);
          color: #f6e7bf;
          background: rgba(214,180,105,0.10);
        }

        .brand {
          margin-bottom: 26px;
        }

        .brand-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 44px;
          letter-spacing: 8px;
          color: #f2eee7;
          line-height: 1;
          margin-bottom: 8px;
        }

        .brand-subtitle {
          color: #d6b469;
          font-size: 12px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
        }

        .login-title {
          margin: 0 0 10px;
          font-size: 28px;
          line-height: 1.15;
        }

        .login-text {
          margin: 0 0 24px;
          color: rgba(255,255,255,0.68);
          line-height: 1.7;
          font-size: 14px;
        }

        .form {
          display: grid;
          gap: 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.82);
        }

        .premium-input {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.13);
          background: rgba(255,255,255,0.055);
          color: white;
          outline: none;
          padding: 0 16px;
          font-size: 14px;
        }

        .premium-input::placeholder {
          color: rgba(255,255,255,0.34);
        }

        .premium-input:focus {
          border-color: rgba(214,180,105,0.85);
          box-shadow: 0 0 0 4px rgba(214,180,105,0.10);
        }

        .btn-gold,
        .btn-dark {
          width: 100%;
          border: none;
          border-radius: 16px;
          min-height: 54px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-gold {
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #131313;
          box-shadow: 0 16px 32px rgba(185,141,70,0.24);
        }

        .btn-dark {
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .btn-gold:hover,
        .btn-dark:hover {
          transform: translateY(-2px);
        }

        .btn-gold:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: rgba(255,255,255,0.42);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .divider::before,
        .divider::after {
          content: '';
          height: 1px;
          flex: 1;
          background: rgba(255,255,255,0.12);
        }

        .google-disabled {
  opacity: 0.72;
  cursor: not-allowed;
  background: rgba(255,255,255,0.055);
  color: rgba(255,255,255,0.72);
}

        .switch-text {
          margin-top: 20px;
          color: rgba(255,255,255,0.66);
          text-align: center;
          font-size: 14px;
        }

        .switch-btn {
          color: #d6b469;
          background: none;
          border: none;
          font-weight: 900;
          cursor: pointer;
          margin-left: 4px;
        }

        .error-box {
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.26);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
        }

        .hint-box {
  margin-top: 18px;
  padding: 13px 14px;
  border-radius: 16px;
  background: rgba(214,180,105,0.055);
  border: 1px solid rgba(214,180,105,0.13);
  color: rgba(255,255,255,0.64);
  font-size: 12.5px;
  line-height: 1.7;
}

        @media (max-width: 700px) {
          .login-page {
            padding: 18px;
            align-items: center;
            background-position: center center;
          }

          .login-card {
            padding: 24px;
          }

          .brand-title {
            font-size: 34px;
            letter-spacing: 6px;
          }
        }
      `}</style>

      <div className="login-page">
          <img src={bgImage} alt="Atelier moda premium" className="login-bg-image" />
  <div className="login-overlay"></div>
        <div className="login-card">
          {onBackCatalogo && (
            <button
              className="back-store-btn"
              type="button"
              onClick={onBackCatalogo}
            >
              ← Volver al catálogo
            </button>
          )}

          <div className="brand">
            <div className="brand-title">ATELIER</div>
            <div className="brand-subtitle">Moda que trasciende</div>
          </div>

          <h1 className="login-title">
            {esRegistro ? 'Únete a Atelier' : 'Bienvenido de nuevo'}
          </h1>

          <p className="login-text">
           {esRegistro ? 'Crea tu cuenta para guardar tu experiencia, comprar y explorar la colección premium.'
  : 'Ingresa para administrar tu experiencia o continuar tu compra en Atelier.'}
          </p>

          <form className="form" onSubmit={enviar}>
            {esRegistro && (
              <div className="field">
                <label>Nombre completo</label>
                <input
                  className="premium-input"
                  placeholder="Ej. Juan Pérez"
                  value={form.nombre}
                  onChange={(e) => actualizarCampo('nombre', e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <input
                className="premium-input"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => actualizarCampo('email', e.target.value)}
              />
            </div>

            <div className="field">
              <label>Contraseña</label>
              <input
                className="premium-input"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => actualizarCampo('password', e.target.value)}
              />
            </div>

            {esRegistro && (
              <div className="field">
                <label>Confirmar contraseña</label>
                <input
                  className="premium-input"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmarPassword}
                  onChange={(e) => actualizarCampo('confirmarPassword', e.target.value)}
                />
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <button className="btn-gold" disabled={loading}>
              {loading
                ? 'Procesando...'
                : esRegistro
                  ? 'Crear cuenta'
                  : 'Entrar'}
            </button>
          </form>

          <div className="divider">o</div>

          <button
  className="btn-dark google-disabled"
  type="button"
  disabled
  title="Disponible en una próxima versión"
>
  Continuar con Google
</button>

          <div className="switch-text">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button className="switch-btn" type="button" onClick={cambiarModo}>
              {esRegistro ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </div>

   
        </div>
      </div>
    </>
  );
}