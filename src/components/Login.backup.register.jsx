import { useState } from 'react';
import api from '../api/api';
import bgImage from '../assets/login-bg.jpg';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Completa el correo y la contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

      if (remember) {
        localStorage.setItem('rememberEmail', form.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      onLogin(res.data.usuario);
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #0a0a0a;
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          justify-content: center;
          background:
            linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0.46)),
            linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.05)),
            url(${bgImage});
          background-size: cover;
          background-position: center;
        }

        .login-left-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(214,180,105,0.12), transparent 28%),
            radial-gradient(circle at bottom right, rgba(255,255,255,0.07), transparent 20%);
          pointer-events: none;
        }

        .login-left-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          z-index: 1;
        }

        .brand-badge {
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
          color: #f6f1e7;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          animation: fadeUp 0.7s ease;
        }

        .hero-copy {
          max-width: 480px;
          animation: fadeUp 0.9s ease;
        }

        .hero-title {
          font-size: 56px;
          line-height: 1.05;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #fff;
          letter-spacing: -1px;
        }

        .hero-subtitle {
          font-size: 17px;
          line-height: 1.8;
          color: rgba(255,255,255,0.78);
          margin-bottom: 28px;
        }

        .hero-pills {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-pill {
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          color: #f7f3ec;
          font-size: 13px;
          animation: softFloat 4s ease-in-out infinite;
        }

        .hero-footer {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: rgba(255,255,255,0.86);
          animation: fadeUp 1s ease;
        }

        .hero-footer-small {
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero-footer-line {
          width: 110px;
          height: 2px;
          background: linear-gradient(90deg, #d6b469, rgba(214,180,105,0.1));
          border-radius: 20px;
        }

        .hero-footer-text {
          font-size: 14px;
          color: rgba(255,255,255,0.75);
        }

        .login-right {
          width: 46%;
          min-width: 520px;
          background:
            radial-gradient(circle at top right, rgba(214,180,105,0.08), transparent 20%),
            linear-gradient(180deg, #0b0b0c 0%, #111214 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 540px;
          background: rgba(21, 22, 26, 0.72);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          backdrop-filter: blur(18px);
          border-radius: 28px;
          padding: 40px;
          animation: fadeUp 0.8s ease;
        }

        .login-brand {
          text-align: center;
          margin-bottom: 26px;
        }

        .login-brand-title {
          margin: 0;
          font-size: 44px;
          font-weight: 300;
          letter-spacing: 10px;
          color: #f2eee7;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .login-brand-subtitle {
          margin-top: 8px;
          font-size: 12px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #d6b469;
        }

        .welcome-title {
          text-align: center;
          margin: 10px 0 10px;
          font-size: 42px;
          line-height: 1.15;
          font-weight: 500;
          color: #ffffff;
        }

        .welcome-text {
          text-align: center;
          color: rgba(255,255,255,0.68);
          margin: 0 0 30px 0;
          font-size: 15px;
          line-height: 1.7;
        }

        .error-box {
          width: 100%;
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.28);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .field-group {
          margin-bottom: 18px;
        }

        .field-label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          color: #f2f2f2;
          font-weight: 500;
        }

        .input-wrap {
          position: relative;
        }

        .premium-input {
          width: 100%;
          height: 58px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.03);
          color: #fff;
          padding: 0 48px 0 18px;
          font-size: 15px;
          outline: none;
          transition: all 0.25s ease;
        }

        .premium-input::placeholder {
          color: rgba(255,255,255,0.38);
        }

        .premium-input:focus {
          border-color: rgba(214,180,105,0.75);
          box-shadow: 0 0 0 4px rgba(214,180,105,0.10);
          background: rgba(255,255,255,0.045);
        }

        .input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 14px;
          padding: 4px 6px;
        }

        .options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 8px 0 24px;
          flex-wrap: wrap;
        }

        .remember-box {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.84);
          font-size: 14px;
          cursor: pointer;
          user-select: none;
        }

        .remember-box input {
          width: 16px;
          height: 16px;
          accent-color: #d6b469;
          cursor: pointer;
        }

        .link-text {
          background: none;
          border: none;
          color: #d6b469;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
        }

        .submit-btn {
          width: 100%;
          height: 58px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #141414;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 16px 30px rgba(185, 141, 70, 0.22);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 36px rgba(185, 141, 70, 0.30);
        }

        .submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0 22px;
          color: rgba(255,255,255,0.45);
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.14);
        }

        .social-btn {
          width: 100%;
          height: 54px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          margin-bottom: 12px;
          transition: all 0.25s ease;
        }

        .social-google {
          background: #ffffff;
          color: #171717;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .social-apple {
          background: #090909;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.14);
        }

        .social-btn:hover {
          transform: translateY(-2px);
        }

        .signup-text {
          margin-top: 26px;
          text-align: center;
          color: rgba(255,255,255,0.65);
          font-size: 15px;
        }

        .signup-link {
          color: #d6b469;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .login-page {
            flex-direction: column;
          }

          .login-left {
            min-height: 360px;
          }

          .login-right {
            width: 100%;
            min-width: 100%;
            padding: 24px;
          }

          .login-card {
            max-width: 700px;
          }
        }

        @media (max-width: 640px) {
          .login-left-content {
            padding: 24px;
          }

          .hero-title {
            font-size: 38px;
          }

          .login-right {
            padding: 16px;
          }

          .login-card {
            padding: 24px;
            border-radius: 22px;
          }

          .login-brand-title {
            font-size: 34px;
            letter-spacing: 7px;
          }

          .welcome-title {
            font-size: 30px;
          }

          .options-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="login-page">
        {/* PANEL IZQUIERDO */}
        <div className="login-left">
          <div className="login-left-overlay" />

          <div className="login-left-content">
            <div className="brand-badge">Colección masculina premium</div>

            <div className="hero-copy">
              <h1 className="hero-title">
                Estilo que vende.
                <br />
                Gestión que escala.
              </h1>

              <p className="hero-subtitle">
                Administra tu tienda de ropa con una experiencia visual elegante,
                moderna y profesional. Diseñado para marcas que quieren verse grandes.
              </p>

              <div className="hero-pills">
                <div className="hero-pill">Moda premium</div>
                <div className="hero-pill" style={{ animationDelay: '0.3s' }}>
                  Panel elegante
                </div>
                <div className="hero-pill" style={{ animationDelay: '0.6s' }}>
                  Experiencia moderna
                </div>
              </div>
            </div>

            <div className="hero-footer">
              <div className="hero-footer-small">Colección Otoño / Invierno 2026</div>
              <div className="hero-footer-line" />
              <div className="hero-footer-text">
                Diseñado para destacar. Construido para vender.
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-brand">
              <h1 className="login-brand-title">ATELIER</h1>
              <div className="login-brand-subtitle">Moda que trasciende</div>
            </div>

            <h2 className="welcome-title">Bienvenido de nuevo</h2>
            <p className="welcome-text">
              Nos alegra verte nuevamente. Inicia sesión para continuar.
            </p>

            {error && <div className="error-box">{error}</div>}

            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <div className="input-wrap">
                <input
                  className="premium-input"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                <span className="input-icon">
                  <MailIcon />
                </span>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Contraseña</label>
              <div className="input-wrap">
                <input
                  className="premium-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <div className="options-row">
              <label className="remember-box">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                className="link-text"
                onClick={() => alert('Aquí puedes redirigir a recuperación de contraseña')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
            </button>

            <div className="divider">o</div>

            <button
              type="button"
              className="social-btn social-google"
              onClick={() => alert('Conecta aquí tu login con Google si lo deseas')}
            >
              <GoogleIcon />
              Continuar con Google
            </button>

            <button
              type="button"
              className="social-btn social-apple"
              onClick={() => alert('Conecta aquí tu login con Apple si lo deseas')}
            >
              <AppleIcon />
              Continuar con Apple
            </button>

            <div className="signup-text">
              ¿No tienes cuenta?{' '}
              <span
                className="signup-link"
                onClick={() => alert('Aquí puedes redirigir al registro')}
              >
                Crear cuenta
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6H20C20.5523 6 21 6.44772 21 7V17C21 17.5523 20.5523 18 20 18H4C3.44772 18 3 17.5523 3 17V7C3 6.44772 3.44772 6 4 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 7L12 13L20.5 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path
        d="M44.5 20H24V28.5H35.8C34.7 34 30.1 37 24 37C16.8 37 11 31.2 11 24C11 16.8 16.8 11 24 11C27.1 11 30 12.1 32.2 14L38.3 7.9C34.5 4.5 29.5 2.5 24 2.5C12.1 2.5 2.5 12.1 2.5 24C2.5 35.9 12.1 45.5 24 45.5C35.5 45.5 44.5 37.5 44.5 25.2C44.5 23.5 44.3 21.7 44.5 20Z"
        fill="#FFC107"
      />
      <path
        d="M6.7 14.7L13.7 19.8C15.6 15.1 19.4 11.8 24 11.8C27.1 11.8 30 12.9 32.2 14.8L38.3 8.7C34.5 5.3 29.5 3.3 24 3.3C16 3.3 9 7.9 6.7 14.7Z"
        fill="#FF3D00"
      />
      <path
        d="M24 45.5C29.4 45.5 34.2 43.7 37.9 40.4L31.2 34.7C29.1 36.3 26.7 37.1 24 37.1C18 37.1 13 33.2 11.2 27.8L4.3 33.1C6.6 40 14.7 45.5 24 45.5Z"
        fill="#4CAF50"
      />
      <path
        d="M44.5 20H24V28.5H35.8C35.3 31.1 33.8 33.3 31.2 34.8L37.9 40.5C41.7 37 44.5 31.8 44.5 25.2C44.5 23.5 44.3 21.7 44.5 20Z"
        fill="#1976D2"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.37 12.21C16.4 15.08 18.89 16.03 18.92 16.04C18.9 16.11 18.53 17.39 17.63 18.72C16.85 19.87 16.04 21 14.77 21C13.53 21 13.2 20.26 11.79 20.26C10.38 20.26 10 21 8.79 21C7.56 21 6.7 19.8 5.91 18.66C4.31 16.35 3.08 12.11 4.72 9.25C5.53 7.84 6.99 6.95 8.57 6.93C9.77 6.91 10.91 7.75 11.64 7.75C12.36 7.75 13.73 6.74 15.18 6.88C15.79 6.91 17.49 7.12 18.59 8.73C18.5 8.78 16.35 10.03 16.37 12.21ZM14.22 5.46C14.88 4.66 15.32 3.55 15.2 2.44C14.25 2.48 13.1 3.07 12.42 3.87C11.81 4.58 11.28 5.72 11.42 6.81C12.48 6.89 13.56 6.26 14.22 5.46Z" />
    </svg>
  );
}