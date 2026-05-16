import { useState } from "react";
import DiagnosticModal from "./DiagnosticModal";

interface Props {
  onEmailSubmitted: (email: string) => void;
}

export default function DiagnosticSection({ onEmailSubmitted }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const handleReset = () => {
    setModalKey((k) => k + 1);
    setCompleted(false);
    setModalOpen(true);
  };

  return (
    <>
      <style>{`
        .diag-section {
          padding: 120px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 3;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .diag-section-eyebrow {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.5);
          margin-bottom: 28px;
        }
        .diag-section-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4.5vw, 58px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.15;
          letter-spacing: -.02em;
          color: rgba(255,255,255,0.88);
          max-width: 680px;
          margin-bottom: 20px;
        }
        .diag-section-sub {
          font-family: 'Libre Franklin', sans-serif;
          font-size: clamp(16px, 1.9vw, 20px);
          font-weight: 300;
          line-height: 1.7;
          color: rgba(255,255,255,0.42);
          max-width: 520px;
          margin-bottom: 16px;
        }
        .diagnostic-time-hint {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 10px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 36px;
        }
        .diag-cta-btn {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: #050705;
          background: rgba(127,255,0,0.88);
          border: none;
          border-radius: 9999px;
          padding: 14px 36px;
          cursor: none;
          transition: background .25s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .diag-cta-btn:hover { background: rgba(127,255,0,1); }
        .diag-complete-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .diag-complete-label {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 10px;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.6);
        }
        .diag-complete-msg {
          font-family: 'Libre Franklin', sans-serif;
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.45);
          max-width: 420px;
          line-height: 1.65;
        }
        .diag-explore-again {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.65);
          background: transparent;
          border: none;
          cursor: none;
          transition: color .2s;
          margin-top: 4px;
          padding: 12px;
        }
        .diag-explore-again:hover { color: rgba(127,255,0,1); }
        @media (max-width: 640px) {
          .diag-section { padding: 80px 24px; }
        }
      `}</style>

      <section id="relethe-diagnostic" className="diag-section">
        <p className="diag-section-eyebrow relethe-reveal">Network Diagnostic</p>
        <h2 className="diag-section-heading relethe-reveal">
          Ready to leap, but scared of the unknown?
        </h2>
        <p className="diag-section-sub relethe-reveal">
          Same. But now, you can explore what lies in wait before you face it.
        </p>
        <p className="diagnostic-time-hint relethe-reveal">
          5 questions · 2 minutes · your match profile at the end
        </p>

        {completed ? (
          <div style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--ch)', marginBottom: '16px' }}>
              NETWORK DIAGNOSTIC COMPLETE
            </p>
            <p style={{ fontFamily: 'var(--sans-serif)', fontSize: '15px', fontWeight: 300, color: 'var(--dim)', lineHeight: 1.75, marginBottom: '32px' }}>
              Your match profile has been saved. We'll use it to find your people when matchmaking opens.
            </p>
            <button
              onClick={() => { setCompleted(false); setModalOpen(true); }}
              style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ch)', background: 'none', border: 'none', cursor: 'none', opacity: 1, transition: 'opacity .2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Explore again →
            </button>
          </div>
        ) : (
          <button
            className="diag-cta-btn relethe-reveal"
            onClick={() => setModalOpen(true)}
          >
            Explore the Unknown
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="#050705" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </section>

      <DiagnosticModal
        key={modalKey}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEmailSubmitted={(em) => {
          onEmailSubmitted(em);
          setModalOpen(false);
        }}
        onComplete={() => setCompleted(true)}
      />
    </>
  );
}
