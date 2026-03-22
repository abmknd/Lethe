import { useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "motion/react";

interface FadedZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitCount: number;
  onReturnToPresent: () => void;
}

const messages = [
  {
    header: null,
    mainText: ["You've reached", "the softened hours."],
    accentText: null,
  },
  {
    header: "Faded zone reached",
    mainText: [
      "Everything above is a memory.",
      "Everything below is peace.",
    ],
    accentText: "Please let go.",
  },
  {
    header: "Faded zone reached",
    mainText: [
      "Reflect on your infidelity.",
      "Your scroll ends here",
      "so the thought can begin.",
    ],
    accentText: null,
  },
  {
    header: "Faded zone reached",
    mainText: [
      "The faded zone does not",
      "have what you're looking for.",
    ],
    accentText: "Neither does the past.",
  },
  {
    header: "Faded zone reached",
    mainText: [
      "What are you searching for",
      "in someone else's yesterday?",
    ],
    accentText: null,
  },
  {
    header: "Faded zone reached",
    mainText: ["Some things don't need", "to be revisited."],
    accentText: "They need to be released.",
  },
  {
    header: "Faded zone reached",
    mainText: [
      "Every scroll down",
      "is a choice not to begin.",
    ],
    accentText: "Begin.",
  },
  {
    header: "Faded zone reached",
    mainText: [
      "It isn't judging.",
      "But you might want to",
      "explain yourself to you.",
    ],
    accentText: null,
  },
];

export function FadedZoneModal({
  isOpen,
  onClose,
  visitCount,
  onReturnToPresent,
}: FadedZoneModalProps) {
  const message = messages[visitCount % messages.length];

  // Raw mouse offset from card center
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring smoothing — makes the tilt feel physical and weighted
  const springConfig = {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Tilt angles
  const rotateX = useTransform(ySpring, [-120, 120], [8, -8]);
  const rotateY = useTransform(xSpring, [-120, 120], [-8, 8]);

  // Chartreuse glow origin shifts with tilt so light source feels 3D
  const glowX = useTransform(
    xSpring,
    [-120, 120],
    ["38%", "62%"],
  );
  const glowY = useTransform(
    ySpring,
    [-120, 120],
    ["38%", "62%"],
  );

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onReturnToPresent}
          />

          {/* Entry animation wrapper — centered on screen */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0, y: 52 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 52 }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Tilt card — outer layer for 3D transform + shadows */}
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformPerspective: 900,
                transformStyle: "preserve-3d",
                // Deep drop shadow + soft chartreuse back-glow
                boxShadow: `
                  0 40px 100px rgba(0,0,0,0.9),
                  0 16px 40px rgba(0,0,0,0.7),
                  0 0 0 1px rgba(255,255,255,0.06),
                  0 0 60px rgba(127,255,0,0.08),
                  0 0 120px rgba(127,255,0,0.04)
                `,
              }}
              className="relative w-full max-w-xl rounded-3xl overflow-hidden"
            >
              {/* Chartreuse glow layer — shifts position with tilt */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-0 rounded-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(127,255,0,0.09) 0%, rgba(127,255,0,0.03) 40%, transparent 65%)",
                  backgroundPositionX: glowX,
                  backgroundPositionY: glowY,
                }}
              />

              {/* Card surface */}
              <div
                className="relative z-10 px-12 pb-14 pt-12"
                style={{
                  background:
                    "linear-gradient(170deg, #0f140f 0%, #040604 100%)",
                  // Top edge highlight simulates light hitting the card rim
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5)",
                }}
              >
                {/* Film grain texture */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{
                    opacity: 0.028,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "180px",
                  }}
                />

                {/* Ritual ripple */}
                <div className="flex justify-center mb-9">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    style={{ overflow: "visible" }}
                  >
                    <style>{`
                      @keyframes dzExpand {
                        0%   { r: 3;  opacity: 0.7; }
                        100% { r: 58; opacity: 0; }
                      }
                      .dz-r1 { animation: dzExpand 3.6s ease-out infinite; }
                      .dz-r2 { animation: dzExpand 3.6s ease-out 1.2s infinite; }
                      .dz-r3 { animation: dzExpand 3.6s ease-out 2.4s infinite; }
                    `}</style>
                    <circle
                      className="dz-r1"
                      cx="60"
                      cy="60"
                      fill="none"
                      stroke="rgba(127,255,0,0.32)"
                      strokeWidth="1.2"
                    />
                    <circle
                      className="dz-r2"
                      cx="60"
                      cy="60"
                      fill="none"
                      stroke="rgba(127,255,0,0.32)"
                      strokeWidth="1.2"
                    />
                    <circle
                      className="dz-r3"
                      cx="60"
                      cy="60"
                      fill="none"
                      stroke="rgba(127,255,0,0.32)"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="3.5"
                      fill="rgba(127,255,0,0.52)"
                    />
                  </svg>
                </div>

                {/* Visit label */}
                {message.header && (
                  <p
                    className="text-center text-[11px] tracking-[0.28em] uppercase font-light mb-5 font-serif"
                    style={{ color: "rgba(173,255,47,0.38)" }}
                  >
                    {message.header}
                  </p>
                )}

                {/* Main message */}
                <h2
                  className="text-center font-serif font-light italic mb-4"
                  style={{
                    fontSize: "clamp(24px, 3.4vw, 38px)",
                    lineHeight: 1.22,
                    color: "rgba(255,255,255,0.90)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {message.mainText.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < message.mainText.length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
                </h2>

                {/* Accent text */}
                {message.accentText && (
                  <p
                    className="text-center font-serif font-light italic mt-2"
                    style={{
                      fontSize: "18px",
                      color: "rgba(173,255,47,0.75)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {message.accentText}
                  </p>
                )}

                {/* Chartreuse rule */}
                <div
                  className="mx-auto my-8"
                  style={{
                    width: 36,
                    height: 1,
                    background:
                      "linear-gradient(to right, transparent, rgba(173,255,47,0.42), transparent)",
                  }}
                />

                {/* Single centered button */}
                <div className="flex justify-center">
                  <button
                    onClick={onReturnToPresent}
                    className="font-serif font-light tracking-[0.22em] uppercase transition-all duration-300"
                    style={{
                      fontSize: 11,
                      color: "rgba(173,255,47,0.72)",
                      background: "rgba(173,255,47,0.07)",
                      border: "1px solid rgba(173,255,47,0.22)",
                      padding: "8px 20px",
                      borderRadius: 18,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background =
                        "rgba(173,255,47,0.14)";
                      el.style.borderColor =
                        "rgba(173,255,47,0.44)";
                      el.style.color = "rgba(173,255,47,1)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background =
                        "rgba(173,255,47,0.07)";
                      el.style.borderColor =
                        "rgba(173,255,47,0.22)";
                      el.style.color = "rgba(173,255,47,0.72)";
                    }}
                  >
                    Return to the present
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}