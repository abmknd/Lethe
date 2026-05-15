import { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";

type Community = "independents" | "epistemics" | "social_impact";
type Archetype = "underdistributed" | "signal_seeker" | "isolated_practitioner" | "blocked_mover";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEmailSubmitted: (email: string) => void;
  onComplete?: () => void;
}

const PROGRESS = [9, 18, 27, 36, 45, 55, 64, 82, 91, 100];

const QUESTIONS = [
  {
    label: "THE ACCESS AUDIT",
    query: "QUERY 1/5",
    text: "When you need a real conversation with someone who understands the specific thing you're navigating, what actually happens?",
    options: [
      "I don't know who that person is.",
      "I know who they are, but I can't reach them.",
      "I reach out and get something polite and empty.",
      "I don't ask. I figure it out alone.",
    ],
  },
  {
    label: "THE ROOM CHECK",
    query: "QUERY 2/5",
    text: "Think about the last professional or intellectual gathering you were in. What did you leave with?",
    options: [
      "Nothing. It was the wrong room entirely.",
      "A few contacts I never followed up on.",
      "One interesting exchange that went nowhere.",
      "I've stopped going to these things.",
    ],
  },
  {
    label: "THE PLATFORM SIGNAL",
    query: "QUERY 3/5",
    text: "When you open LinkedIn right now, what's your honest reaction?",
    options: [
      "Noise. I scroll and leave with nothing.",
      "FOMO. Everyone looks like they're further ahead.",
      "Invisible. I post, but nothing lands.",
      "Irrelevant. The people I actually need aren't there.",
    ],
  },
  {
    label: "THE LAST REAL CONVERSATION",
    query: "QUERY 4/5",
    text: "The last conversation that genuinely changed how you think or opened something new: how long ago was it?",
    options: [
      "I can't remember one.",
      "Over a year ago.",
      "A few months back, but it was luck, not system.",
      "Recently, but it took years to get to that person.",
    ],
  },
  {
    label: "THE GAP",
    query: "QUERY 5/5",
    text: "If you could add one type of person to your life right now, who would they be?",
    options: [
      "Someone who has already navigated what I'm navigating.",
      "Someone who thinks in a way that sharpens how I think.",
      "Someone building something adjacent who actually gets the work.",
      "Someone with access to the rooms I haven't reached yet.",
    ],
  },
];

const TEASER: Record<Archetype, string> = {
  underdistributed: "Connection gap: High-trust signal, low-volume network.",
  signal_seeker: "Signal gap: No trusted validators in range.",
  isolated_practitioner: "Peer gap: Doing serious work without a room to match.",
  blocked_mover: "Access gap: Right direction, wrong room.",
};

const RESULT_COPY: Record<
  Archetype,
  { name: string; tagline: string; variants: Record<Community, { gap: string; who: string }> }
> = {
  underdistributed: {
    name: "THE UNDERDISTRIBUTED EXPERT",
    tagline: "You have the signal. The right rooms just don't know you're in them yet.",
    variants: {
      independents: {
        gap: "What you're building is real and the direction is clear. But the people who could open the right doors, make the right introductions, or simply recognise what you're doing at a glance are not in your current orbit. That is not a capability problem. It is a proximity problem.",
        who: "Builders one or two stages ahead who can place you in rooms that your current network cannot reach.",
      },
      epistemics: {
        gap: "Your thinking is serious and your work is honest. But the people who operate at the same standard, who would push back in the right ways and recognise the distinction between a sharp idea and a performed one, are somewhere else entirely. You have not found each other yet.",
        who: "Thinkers who will sharpen your models rather than validate them. People worth being wrong in front of.",
      },
      social_impact: {
        gap: "You know what you're working on and why it matters. The gap is that the people working on the same problems at the same level of seriousness are scattered. The infrastructure for finding each other does not exist yet. Relethe is that infrastructure.",
        who: "Operators working at the intersection of the same systems, with enough overlap to collaborate and enough difference to challenge.",
      },
    },
  },
  signal_seeker: {
    name: "THE SIGNAL SEEKER",
    tagline: "You know what you're moving toward. You need someone who's already been through it.",
    variants: {
      independents: {
        gap: "You are making real decisions, alone, without enough signal from people who have faced the same variables. The advice available to you is either too generic or too far removed from the specifics of what you're building to be useful. Encouragement is not the same as feedback.",
        who: "Builders who have already made the move you are trying to make and will tell you what it actually cost.",
      },
      epistemics: {
        gap: "The question you're working through is live and consequential. But the people around you are not close enough to the problem to give you real signal. You need someone who has thought about this carefully, arrived somewhere, and is willing to show you their working.",
        who: "Thinkers two or three steps into the same terrain who will engage with the specific problem, not the general category it belongs to.",
      },
      social_impact: {
        gap: "The system you are trying to change is complex and the path through it is not obvious. The people who have navigated it before exist, but they are not easy to find and even harder to get honest time with. What you need is not more information. It is grounded perspective from someone who has been inside.",
        who: "Operators who have worked inside the same systems you are trying to move and are willing to give you the unvarnished version.",
      },
    },
  },
  isolated_practitioner: {
    name: "THE ISOLATED PRACTITIONER",
    tagline: "You're doing serious work. You're doing it alone.",
    variants: {
      independents: {
        gap: "You have momentum. What you do not have is a room of people who understand it without needing it explained. The people around you are supportive but not proximate. Peers who are building at the same altitude, with the same level of honesty about what it takes, are harder to find than they should be.",
        who: "Builders at a similar stage working on adjacent problems. People who get the work because they are in it too.",
      },
      epistemics: {
        gap: "Serious thinking is lonely by design, but it does not have to be isolated. The ideas you are working through deserve interlocutors who can meet them on their own terms: people who will notice the distinction that matters, push on the assumption you have not examined, and still be there next week.",
        who: "Thinkers who are genuinely curious about the same territory and rigorous enough to make the conversation worth having.",
      },
      social_impact: {
        gap: "The work you are doing is long-horizon and the feedback loops are slow. Most people in your immediate circle do not share your orientation toward scale and consequence. Finding collaborators who are thinking at the same level, with the same sense of what is actually at stake, requires more luck than it should.",
        who: "Operators working at a similar intersection with enough shared context to make the conversation immediately useful.",
      },
    },
  },
  blocked_mover: {
    name: "THE BLOCKED MOVER",
    tagline: "The next move is clear. The door is not open.",
    variants: {
      independents: {
        gap: "You know where you're going. You have tried to get there. The gap is not capability or direction: it is access. One introduction to the right person could shift your trajectory, and your current network is not able to produce it.",
        who: "Builders and connectors with direct presence in the space you are trying to enter. Not advisors. Doors.",
      },
      epistemics: {
        gap: "The intellectual move you are trying to make, whether that is a field shift, a publishing ambition, or a new research direction, requires access to people and institutions that your current network does not touch. The ideas are ready. The room has not opened yet.",
        who: "Thinkers with roots in the space you are trying to enter, who can make an introduction that actually means something.",
      },
      social_impact: {
        gap: "The problem is clear, the work is credible, and the next step involves reaching people or institutions that your current network cannot connect you to. Every door you need is one relationship away from opening. That relationship is what is missing.",
        who: "Operators with established presence in the policy, funding, or implementation spaces you are trying to reach.",
      },
    },
  },
};

function classifyCommunity(text: string): Community {
  const lower = text.toLowerCase();
  const scores = { independents: 0, epistemics: 0, social_impact: 0 };
  const signals: Record<Community, string[]> = {
    independents: ["build", "building", "startup", "founder", "company", "freelance", "independent", "autonomy", "product", "launch", "bootstrap", "venture"],
    epistemics: ["think", "research", "understand", "idea", "write", "writing", "theory", "model", "knowledge", "curious", "intellectual", "scholar", "study", "question"],
    social_impact: ["impact", "change", "policy", "climate", "system", "systemic", "justice", "nonprofit", "community", "cause", "matter", "world", "society", "operator"],
  };
  for (const c of ["independents", "epistemics", "social_impact"] as Community[]) {
    for (const word of signals[c]) {
      if (lower.includes(word)) scores[c]++;
    }
  }
  const max = Math.max(scores.independents, scores.epistemics, scores.social_impact);
  if (max === 0) return "independents";
  const tied = (["independents", "epistemics", "social_impact"] as Community[]).filter((c) => scores[c] === max);
  return tied.length > 1 ? "independents" : tied[0];
}

function computeArchetype(answers: Record<string, string>): Archetype {
  const scores: Record<Archetype, number> = {
    underdistributed: 0, signal_seeker: 0, isolated_practitioner: 0, blocked_mover: 0,
  };
  const table: Record<string, Record<string, [Archetype, number]>> = {
    q1: { A: ["underdistributed", 2], B: ["blocked_mover", 2], C: ["signal_seeker", 1], D: ["isolated_practitioner", 2] },
    q2: { A: ["blocked_mover", 1], B: ["signal_seeker", 1], C: ["isolated_practitioner", 1], D: ["isolated_practitioner", 2] },
    q3: { A: ["signal_seeker", 1], B: ["underdistributed", 1], C: ["isolated_practitioner", 2], D: ["blocked_mover", 2] },
    q4: { A: ["signal_seeker", 2], B: ["signal_seeker", 1], C: ["underdistributed", 1], D: ["blocked_mover", 1] },
    q5: { A: ["signal_seeker", 2], B: ["underdistributed", 2], C: ["isolated_practitioner", 2], D: ["blocked_mover", 2] },
  };
  for (const [q, ans] of Object.entries(answers)) {
    if (table[q]?.[ans]) {
      const [arch, pts] = table[q][ans];
      scores[arch] += pts;
    }
  }
  const max = Math.max(...Object.values(scores));
  const winners = (Object.entries(scores) as [Archetype, number][]).filter(([, v]) => v === max);
  if (winners.length === 1) return winners[0][0];
  const q5Tie: Record<string, Archetype> = {
    A: "signal_seeker", B: "underdistributed", C: "isolated_practitioner", D: "blocked_mover",
  };
  return q5Tie[answers.q5] ?? "signal_seeker";
}

function OrganismSVG() {
  return (
    <svg className="diagnostic-organism" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="18" rx="10" ry="14" stroke="rgba(127,255,0,0.55)" strokeWidth="1" />
      <ellipse cx="18" cy="18" rx="14" ry="9" stroke="rgba(127,255,0,0.35)" strokeWidth="1" />
      <circle cx="18" cy="18" r="3.5" fill="rgba(127,255,0,0.45)" />
      <circle cx="18" cy="18" r="1.5" fill="rgba(127,255,0,0.9)" />
    </svg>
  );
}

function Waveform() {
  const heights = [6, 10, 16, 12, 20, 14, 18, 10, 14, 8, 16, 10];
  return (
    <svg width="96" height="28" viewBox="0 0 96 28" style={{ opacity: 0.45 }}>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 8 + 2}
          y={14 - h / 2}
          width={4}
          height={h}
          rx={2}
          fill="#7FFF00"
          style={{
            animation: `diagWave 1.4s ease-in-out ${i * 0.1}s infinite alternate`,
          }}
        />
      ))}
    </svg>
  );
}

function PulseRings() {
  return (
    <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            position: "absolute",
            width: n * 22,
            height: n * 22,
            borderRadius: "50%",
            border: "1px solid rgba(127,255,0,0.25)",
            animation: `diagPulse ${1.6 + n * 0.5}s ease-in-out ${n * 0.25}s infinite alternate`,
          }}
        />
      ))}
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(127,255,0,0.65)", position: "relative", zIndex: 1 }} />
    </div>
  );
}

const OPT_KEYS = ["A", "B", "C", "D"];

export default function DiagnosticModal({ isOpen, onClose, onEmailSubmitted, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [freetext, setFreetext] = useState("");
  const [community, setCommunity] = useState<Community>("independents");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [archetype, setArchetype] = useState<Archetype>("signal_seeker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setStep(0); setFreetext(""); setCommunity("independents");
    setAnswers({}); setArchetype("signal_seeker");
    setName(""); setEmail(""); setIsSubmitting(false);
  };

  useEffect(() => { if (!isOpen) reset(); }, [isOpen]);

  // Auto-advance loading screens
  useEffect(() => {
    if (step === 1) { const t = setTimeout(() => setStep(2), 2000); return () => clearTimeout(t); }
    if (step === 7) { const t = setTimeout(() => setStep(8), 2500); return () => clearTimeout(t); }
  }, [step]);

  const handleFreetextSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!freetext.trim()) return;
    setCommunity(classifyCommunity(freetext));
    setStep(1);
  };

  const handleAnswer = (qKey: string, optKey: string) => {
    const updated = { ...answers, [qKey]: optKey };
    setAnswers(updated);
    // After Q5 (step 6), compute archetype before going to loading B
    if (qKey === "q5") setArchetype(computeArchetype(updated));
    setStep((s) => s + 1);
  };

  const handleGateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("https://ipapi.co/json/");
      const geo = await res.json().catch(() => ({}));
      const country = geo.country_name ?? null;
      await supabase.from("waitlist").insert({ email: email.trim(), name: name.trim() || null, source: "diagnostic", country });
      // Duplicate (23505) is handled silently — user still sees result
    } catch { /* best-effort */ }
    onEmailSubmitted(email.trim());
    setIsSubmitting(false);
    setStep(9);
  };

  if (!isOpen) return null;

  const progress = PROGRESS[step];
  const result = RESULT_COPY[archetype];
  const variant = result?.variants[community];

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 99998, background: "#050705",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "flex-start", overflowY: "auto", cursor: "none",
  };

  return createPortal(
    <>
      <style>{`
        @keyframes diagWave { 0% { transform: scaleY(0.4); } 100% { transform: scaleY(1.1); } }
        @keyframes diagPulse { 0% { opacity: 0.12; transform: scale(0.9); } 100% { opacity: 0.35; transform: scale(1.05); } }
        @keyframes organism-breathe { 0%,100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.06); opacity: 1; } }
        .diagnostic-organism { animation: organism-breathe 2.8s cubic-bezier(0.4,0,0.6,1) infinite; }
        .diag-opt { width: 100%; min-height: 52px; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; cursor: none; display: flex; align-items: flex-start; gap: 14px; transition: border-color .18s, background .18s; text-align: left; }
        .diag-opt:hover { border-color: rgba(127,255,0,0.35); background: rgba(127,255,0,0.04); }
        .diag-opt:active { border-color: rgba(127,255,0,0.6); background: rgba(127,255,0,0.08); }
        .diag-close { position: fixed; top: 20px; right: 24px; width: 40px; height: 40px; border-radius: 50%; background: transparent; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.4); font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: none; transition: border-color .2s, color .2s; z-index: 99999; }
        .diag-close:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.75); }
        .diag-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 13px 18px; font-family: 'DM Mono', monospace; font-size: 16px; color: rgba(255,255,255,0.88); outline: none; transition: border-color .2s; }
        .diag-input:focus { border-color: rgba(127,255,0,0.35); }
        .diag-input::placeholder { color: rgba(255,255,255,0.18); }
        .diag-btn-primary { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #050705; background: rgba(127,255,0,0.88); border: none; border-radius: 22px; padding: 13px 28px; cursor: none; transition: background .2s; width: 100%; }
        .diag-btn-primary:hover { background: rgba(127,255,0,1); }
        .diag-btn-primary:disabled { opacity: 0.5; }
        .diag-back { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,0.25); background: transparent; border: none; cursor: none; transition: color .2s; margin-top: 24px; padding: 16px; }
        .diag-back:hover { color: rgba(255,255,255,0.5); }
        .diag-section-title { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: rgba(127,255,0,0.5); margin-bottom: 4px; }
        .diag-result-section-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: rgba(127,255,0,0.45); margin-bottom: 8px; display: block; }
        @media (max-width: 640px) {
          .diag-card-inner { width: calc(100% - 32px) !important; padding: 24px !important; }
        }
      `}</style>

      <div style={overlay}>
        <button className="diag-close" onClick={onClose}>×</button>

        <div className="diag-card-inner" style={{ width: "100%", maxWidth: 640, margin: "0 auto", padding: "80px 32px 48px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh" }}>
          {/* Progress bar */}
          <div style={{ width: "100%", maxWidth: 480, marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "rgba(127,255,0,0.45)" }}>
                DIAGNOSTIC PROGRESS
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(127,255,0,0.6)" }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#7FFF00", borderRadius: 2, transition: "width .5s ease" }} />
            </div>
          </div>

          {/* ── STATE 0: Freetext ── */}
          {step === 0 && (
            <form onSubmit={handleFreetextSubmit} style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
              <p className="diag-section-title">LIFE CALIBRATION</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.3, color: "rgba(255,255,255,0.88)", margin: 0 }}>
                What direction are you currently moving in, or want to move toward, in your life?
              </h2>
              <textarea
                className="diag-input"
                rows={4}
                placeholder={"Leaving a stable career to build something... Trying to think more clearly about a hard problem... Working on something that's meant to matter beyond me..."}
                value={freetext}
                onChange={(e) => setFreetext(e.target.value)}
                style={{ resize: "none", lineHeight: 1.7 }}
              />
              <button type="submit" className="diag-btn-primary" disabled={!freetext.trim()}>
                Begin the Audit
              </button>
            </form>
          )}

          {/* ── STATE 1: Loading A ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingTop: 40 }}>
              <PulseRings />
              <div style={{ textAlign: "center", maxWidth: 400 }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>
                  Calibrating your signal for:
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
                  "{freetext.length > 60 ? freetext.slice(0, 60) + "…" : freetext}"
                </p>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                  <Waveform />
                </div>
              </div>
            </div>
          )}

          {/* ── STATES 2–6: Questions ── */}
          {step >= 2 && step <= 6 && (() => {
            const qIdx = step - 2;
            const q = QUESTIONS[qIdx];
            const qKey = `q${qIdx + 1}`;
            return (
              <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 0 }}>
                <p className="diag-section-title">{q.label}</p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 20 }}>
                  {q.query}
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px,2.8vw,30px)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.35, color: "rgba(255,255,255,0.88)", marginBottom: 28 }}>
                  {q.text}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      className="diag-opt"
                      onClick={() => handleAnswer(qKey, OPT_KEYS[i])}
                    >
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: ".2em", color: "rgba(127,255,0,0.5)", flexShrink: 0, paddingTop: 1 }}>
                        {OPT_KEYS[i]}
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
                {step > 2 && (
                  <button className="diag-back" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </button>
                )}
              </div>
            );
          })()}

          {/* ── STATE 7: Loading B ── */}
          {step === 7 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingTop: 40 }}>
              <PulseRings />
              <div style={{ textAlign: "center", maxWidth: 360 }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
                  Processing your network signal...
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                  Cross-referencing the founding cohort...
                </p>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                  <Waveform />
                </div>
              </div>
            </div>
          )}

          {/* ── STATE 8: Email gate ── */}
          {step === 8 && (
            <form onSubmit={handleGateSubmit} style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              {/* Lock icon */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                  <rect x="2" y="8" width="12" height="9" rx="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                  <path d="M5 8V5.5a3 3 0 016 0V8" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="12.5" r="1.5" fill="rgba(255,255,255,0.45)" />
                </svg>
              </div>

              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".32em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
                MATCH PROFILE GENERATED
              </p>

              {/* Teaser chip */}
              <div style={{ background: "rgba(127,255,0,0.08)", border: "1px solid rgba(127,255,0,0.35)", borderRadius: 12, padding: "14px 20px", width: "100%", display: "flex", alignItems: "center", gap: 14 }}>
                <OrganismSVG />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".1em", color: "rgba(127,255,0,0.85)", lineHeight: 1.5 }}>
                  {TEASER[archetype]}
                </span>
              </div>

              <input
                className="diag-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="diag-input"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button type="submit" className="diag-btn-primary" disabled={isSubmitting || !email.trim()}>
                {isSubmitting ? "Loading..." : "Reveal My Match Profile"}
              </button>
            </form>
          )}

          {/* ── STATE 9: Result ── */}
          {step === 9 && result && variant && (
            <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              {/* Checkmark */}
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(127,255,0,0.4)", background: "rgba(127,255,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <path d="M1.5 7L6.5 12L16.5 2" stroke="rgba(127,255,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <p className="diag-section-title" style={{ marginBottom: 12 }}>MATCH PROFILE UNLOCKED</p>

              <h2 style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(15px,2vw,18px)", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)", textAlign: "center", marginBottom: 12, lineHeight: 1.4 }}>
                {result.name}
              </h2>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(17px,2.2vw,20px)", fontStyle: "italic", fontWeight: 300, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 1.5, marginBottom: 36 }}>
                {result.tagline}
              </p>

              {/* THE GAP */}
              <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, marginBottom: 28 }}>
                <span className="diag-result-section-label">THE GAP</span>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px,1.8vw,18px)", fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.65)" }}>
                  {variant.gap}
                </p>
              </div>

              {/* WHO YOU NEED */}
              <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, marginBottom: 32 }}>
                <span className="diag-result-section-label">WHO YOU NEED</span>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px,1.8vw,18px)", fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.65)" }}>
                  {variant.who}
                </p>
              </div>

              {/* Cohort count */}
              <div style={{ width: "100%", background: "rgba(127,255,0,0.04)", border: "1px solid rgba(127,255,0,0.12)", borderRadius: 10, padding: "14px 18px", marginBottom: 32, textAlign: "center" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: ".1em", color: "rgba(255,255,255,0.45)" }}>
                  There are <span style={{ color: "rgba(127,255,0,0.75)" }}>16</span> people in the Relethe founding cohort who match this profile.
                </p>
              </div>

              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".12em", color: "rgba(255,255,255,0.3)", textAlign: "center", marginBottom: 28 }}>
                You're on the founding cohort waitlist. We'll be in touch.
              </p>

              <button
                className="diag-btn-primary"
                onClick={() => { onComplete?.(); onClose(); }}
                style={{ width: "auto", paddingLeft: 40, paddingRight: 40 }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
