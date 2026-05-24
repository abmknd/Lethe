import marcusWebbImg from "../../assets/marcus-webb.png";
import danielHartmannImg from "../../assets/daniel-hartmann.png";
import sofiaMendesImg from "../../assets/sofia-mendes.png";
import priyaNairImg from "../../assets/priya-nair.png";
import nadiaElAminImg from "../../assets/nadia-el-amin.png";
import laurenShepardImg from "../../assets/lauren-shepard.png";
import anikaSharmaImg from "../../assets/anika-sharma.png";
import eleanorHughesImg from "../../assets/eleanor-hughes.png";
import remiFaladeImg from "../../assets/remi-falade.png";

// TODO: Replace placeholder profiles with real founding cohort members before launch
const MEMBERS = [
  {
    name: "Marcus Webb",
    initials: "MW",
    image: marcusWebbImg,
    role: "Pre-seed founder, B2B SaaS · Austin, TX",
    intent: "Looking to meet operators who've scaled logistics startups before.",
  },
  {
    name: "Daniel Hartmann",
    initials: "DH",
    image: danielHartmannImg,
    role: "Indie hacker, second-time founder · Berlin, Germany",
    intent: "Looking to meet peer builders at the same stage. Not advisors.",
  },
  {
    name: "Sofia Mendes",
    initials: "SM",
    image: sofiaMendesImg,
    role: "Head of Product, Series B · Lisbon, Portugal",
    intent: "Looking to meet senior product peers for candid roadmap pressure-testing.",
  },
  {
    name: "Priya Nair",
    initials: "PN",
    image: priyaNairImg,
    role: "Angel investor · Bangalore, India",
    intent: "Looking to meet technical B2B SaaS and devtools founders pre-Series A.",
  },
  {
    name: "Nadia El-Amin",
    initials: "NE",
    image: nadiaElAminImg,
    role: "AI ethics researcher · Amsterdam, Netherlands",
    intent: "Looking to meet engineers and policymakers who take AI governance seriously.",
  },
  {
    name: "Lauren Shepard",
    initials: "LS",
    image: laurenShepardImg,
    role: "Principal engineer · Seattle, WA",
    intent: "Looking to meet product-minded collaborators who can help me think about user problems, not just technical ones.",
  },
  {
    name: "Anika Sharma",
    initials: "AS",
    image: anikaSharmaImg,
    role: "Climate VC, seed fund · Singapore",
    intent: "Looking to meet PhD researchers and scientists in carbon capture or sustainable materials.",
  },
  {
    name: "Eleanor Hughes",
    initials: "EH",
    image: eleanorHughesImg,
    role: "Conflict mediation consultant · Edinburgh, Scotland",
    intent: "Looking to meet peers with direct experience in peacebuilding or international governance.",
  },
  {
    name: "Remi Falade",
    initials: "RF",
    image: remiFaladeImg,
    role: "Organizational psychologist, executive coach · Paris, France",
    intent: "Looking to meet first-time founders navigating leadership for the first time.",
  },
];

const BENEFITS = [
  {
    label: "Priority placement",
    detail: "Founding members surface first in the matching queue when the engine activates.",
  },
  {
    label: "Your handle reserved",
    detail: "Your relethe.com/handle is locked to you before the public launch.",
  },
  {
    label: "CEP at activation",
    detail: "Founding cohort members receive the first Contextual Entry Profile when matchmaking begins.",
  },
];

export default function FoundingCohort() {
  return (
    <>
      <style>{`
        .cohort-section {
          padding: 120px 48px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 3;
        }
        .cohort-heading {
          font-family: var(--font-display);
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.15;
          letter-spacing: -.02em;
          color: var(--fg-dim);
          margin-bottom: 56px;
        }
        .cohort-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .cohort-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color .25s, background .25s;
        }
        .cohort-card:hover {
          border-color: rgba(127,255,0,0.15);
          background: rgba(127,255,0,0.02);
        }
        .cohort-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(127,255,0,0.1);
          border: 1px solid rgba(127,255,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cohort-avatar span {
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          letter-spacing: .1em;
          color: rgba(127,255,0,0.75);
        }
        .cohort-name {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 400;
          font-style: italic;
          color: var(--fg-dim);
          line-height: 1.2;
        }
        .cohort-role {
          font-family: var(--font-sans);
          font-size: 10px;
          letter-spacing: .08em;
          color: rgba(255,255,255,0.32);
          line-height: 1.5;
        }
        .cohort-intent {
          font-family: var(--font-sans);
          font-size: 14px;
          font-style: italic;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          line-height: var(--leading-relaxed);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 12px;
          margin-top: 2px;
        }
        .cohort-divider {
          border: none;
          border-top: 1px solid var(--line);
          margin: 56px 0;
        }
        .cohort-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .cohort-benefit-tab {
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cohort-benefit-label {
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.7);
        }
        .cohort-benefit-detail {
          font-family: var(--font-sans);
          font-size: var(--text-md);
          font-weight: 300;
          line-height: var(--leading-relaxed);
          color: rgba(255,255,255,0.48);
        }
        @media (max-width: 968px) {
          .cohort-grid { grid-template-columns: repeat(2, 1fr); }
          .cohort-benefits-grid { grid-template-columns: repeat(2, 1fr); }
          .cohort-section { padding: 80px 24px; }
        }
        @media (max-width: 720px) {
          .cohort-grid { grid-template-columns: 1fr; }
          .cohort-benefits-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section
        className="cohort-section"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", display: "none" }}
      >
        <h2 className="cohort-heading relethe-reveal">You'll be in good company</h2>
        <div className="cohort-grid">
          {MEMBERS.map((m, i) => (
            <div
              key={m.name}
              className={`cohort-card relethe-reveal relethe-reveal-d${Math.min((i % 3) + 1, 3)}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={m.image}
                  alt={m.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.removeAttribute('style');
                  }}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div className="cohort-avatar" style={{ display: 'none' }}>
                  <span>{m.initials}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p className="cohort-name">{m.name}</p>
                  <p className="cohort-role">{m.role}</p>
                </div>
              </div>
              <p className="cohort-intent">"{m.intent}"</p>
            </div>
          ))}
        </div>

        <hr className="cohort-divider" />

        <div className="cohort-benefits-grid">
          {BENEFITS.map((b) => (
            <div key={b.label} className="cohort-benefit-tab relethe-reveal">
              <p className="cohort-benefit-label">{b.label}</p>
              <p className="cohort-benefit-detail">{b.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
