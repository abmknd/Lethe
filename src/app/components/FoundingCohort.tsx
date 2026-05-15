const MEMBERS = [
  {
    name: "Marcus Webb",
    initials: "MW",
    role: "Pre-seed founder, B2B SaaS · Austin, TX",
    intent: "Looking to meet operators who've scaled logistics startups before.",
  },
  {
    name: "Daniel Hartmann",
    initials: "DH",
    role: "Indie hacker, second-time founder · Berlin, Germany",
    intent: "Looking to meet peer builders at the same stage. Not advisors.",
  },
  {
    name: "Sofia Mendes",
    initials: "SM",
    role: "Head of Product, Series B · Lisbon, Portugal",
    intent: "Looking to meet senior product peers for candid roadmap pressure-testing.",
  },
  {
    name: "Priya Nair",
    initials: "PN",
    role: "Angel investor · Bangalore, India",
    intent: "Looking to meet technical B2B SaaS and devtools founders pre-Series A.",
  },
  {
    name: "Nadia El-Amin",
    initials: "NE",
    role: "AI ethics researcher · Amsterdam, Netherlands",
    intent: "Looking to meet engineers and policymakers who take AI governance seriously.",
  },
  {
    name: "Lauren Shepard",
    initials: "LS",
    role: "Principal engineer · Seattle, WA",
    intent: "Looking to meet product-minded collaborators who can help me think about user problems, not just technical ones.",
  },
  {
    name: "Anika Sharma",
    initials: "AS",
    role: "Climate VC, seed fund · Singapore",
    intent: "Looking to meet PhD researchers and scientists in carbon capture or sustainable materials.",
  },
  {
    name: "Eleanor Hughes",
    initials: "EH",
    role: "Conflict mediation consultant · Edinburgh, Scotland",
    intent: "Looking to meet peers with direct experience in peacebuilding or international governance.",
  },
  {
    name: "Remi Falade",
    initials: "RF",
    role: "Organizational psychologist, executive coach · Paris, France",
    intent: "Looking to meet first-time founders navigating leadership for the first time.",
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
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.15;
          letter-spacing: -.02em;
          color: rgba(255,255,255,0.88);
          margin-bottom: 56px;
        }
        .cohort-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .cohort-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
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
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .1em;
          color: rgba(127,255,0,0.75);
        }
        .cohort-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          line-height: 1.2;
        }
        .cohort-role {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .08em;
          color: rgba(255,255,255,0.32);
          line-height: 1.5;
        }
        .cohort-intent {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-style: italic;
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          line-height: 1.65;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 12px;
          margin-top: 2px;
        }
        @media (max-width: 968px) {
          .cohort-grid { grid-template-columns: repeat(2, 1fr); }
          .cohort-section { padding: 80px 24px; }
        }
        @media (max-width: 640px) {
          .cohort-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section
        className="cohort-section"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h2 className="cohort-heading relethe-reveal">Who's already here</h2>
        <div className="cohort-grid">
          {MEMBERS.map((m, i) => (
            <div
              key={m.name}
              className={`cohort-card relethe-reveal relethe-reveal-d${Math.min((i % 3) + 1, 3)}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="cohort-avatar">
                  <span>{m.initials}</span>
                </div>
                <div>
                  <p className="cohort-name">{m.name}</p>
                  <p className="cohort-role">{m.role}</p>
                </div>
              </div>
              <p className="cohort-intent">"{m.intent}"</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
