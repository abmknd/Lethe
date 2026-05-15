import { useState } from "react";
import DiagnosticModal from "./DiagnosticModal";

interface Props {
  onEmailSubmitted: (email: string) => void;
}

export default function DiagnosticSection({ onEmailSubmitted }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

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
          font-family: 'DM Mono', monospace;
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
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(16px, 1.9vw, 20px);
          font-weight: 300;
          line-height: 1.7;
          color: rgba(255,255,255,0.42);
          max-width: 520px;
          margin-bottom: 44px;
        }
        .diag-cta-btn {
          font-family: 'DM Mono', monospace;
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
        @media (max-width: 640px) {
          .diag-section { padding: 80px 24px; }
        }
      `}</style>

      <section className="diag-section">
        <p className="diag-section-eyebrow relethe-reveal">Network Diagnostic</p>
        <h2 className="diag-section-heading relethe-reveal">
          Ready to leap, but scared of the unknown?
        </h2>
        <p className="diag-section-sub relethe-reveal">
          Same. But now, you can explore what lies in wait before you face it.
        </p>
        <button
          className="diag-cta-btn relethe-reveal"
          onClick={() => setModalOpen(true)}
        >
          Explore the Unknown
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="#050705" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      <DiagnosticModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEmailSubmitted={(em) => {
          onEmailSubmitted(em);
          setModalOpen(false);
        }}
      />
    </>
  );
}
