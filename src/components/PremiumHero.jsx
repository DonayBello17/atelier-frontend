import heroImage from '../assets/login-bg.jpg';

export default function PremiumHero({
  badge,
  title,
  description,
  buttonText,
  onButtonClick,
}) {
  return (
    <>
      <style>{`
        .premium-hero-wrap {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto 24px;
        }

        .premium-hero {
          position: relative;
          min-height: 280px;
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          padding: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.68), rgba(0,0,0,0.28)),
            linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.10)),
            url(${heroImage});
          background-size: cover;
          background-position: center 34%;
          background-repeat: no-repeat;
        }

        .premium-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%),
            radial-gradient(circle at bottom right, rgba(214,180,105,0.12), transparent 28%);
        }

        .premium-hero-content {
          position: relative;
          z-index: 1;
          max-width: 760px;
        }

        .premium-hero-badge {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 18px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          color: #f6f1e7;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .premium-hero-title {
          margin: 0 0 14px;
          color: white;
          font-size: clamp(38px, 4.6vw, 58px);
          line-height: 1.05;
          letter-spacing: -1px;
          font-weight: 900;
        }

        .premium-hero-description {
          margin: 0;
          max-width: 720px;
          color: rgba(255,255,255,0.88);
          font-size: 16px;
          line-height: 1.8;
        }

        .premium-hero-action {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
        }

        .premium-hero-btn {
          border: none;
          border-radius: 16px;
          padding: 15px 22px;
          background: linear-gradient(135deg, #d9b878, #b88d46);
          color: #111;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(185,141,70,0.24);
          transition: all 0.25s ease;
        }

        .premium-hero-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px rgba(185,141,70,0.30);
        }

        @media (max-width: 800px) {
          .premium-hero {
            min-height: 320px;
            padding: 24px;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
          }

          .premium-hero-action {
            width: 100%;
          }

          .premium-hero-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="premium-hero-wrap">
        <section className="premium-hero">
          <div className="premium-hero-content">
            <div className="premium-hero-badge">{badge}</div>
            <h1 className="premium-hero-title">{title}</h1>
            <p className="premium-hero-description">{description}</p>
          </div>

          {buttonText && (
            <div className="premium-hero-action">
              <button className="premium-hero-btn" onClick={onButtonClick}>
                {buttonText}
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
