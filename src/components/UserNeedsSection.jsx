import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  { label: "The Connector", text: "I have a podcast and need to meet the kind of guests my audience hasn't heard yet." },
  { label: "The Builder",   text: "I'm raising a seed round and need warm intros to operators who've actually done it." },
  { label: "The Thinker",   text: "I'm writing a book and need researchers who think in the same direction I do." },
  { label: "The Investor",  text: "I run a climate fund and need founders who are serious, not just interesting." },
];

// ─── Orb canvas ──────────────────────────────────────────────────────────────
// Six radial-gradient "orbs" composited in screen mode on a near-black fill.
// Each orb follows a slow sinusoidal path. The overlapping screen blends create
// the organic plasma pools seen in the reference image, but in Relethe's
// chartreuse / white / black palette.
function initOrbs(canvas) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, raf = 0;

  const ORBS = [
    // Large ambient chartreuse wash (barely moves — creates permanent tint)
    { bx:0.50, by:0.50, r:0.88, rgb:[127,255,0],   a:0.045, fx:0.9e-4, fy:0.9e-4, ax:0.06, ay:0.06, ph:0.5 },
    // Primary bright orb — upper-left quadrant
    { bx:0.30, by:0.46, r:0.60, rgb:[127,255,0],   a:0.170, fx:2.6e-4, fy:2.0e-4, ax:0.22, ay:0.17, ph:0.0 },
    // Secondary — lower-right
    { bx:0.72, by:0.54, r:0.52, rgb:[127,255,0],   a:0.130, fx:1.8e-4, fy:3.3e-4, ax:0.26, ay:0.23, ph:2.5 },
    // Hot-spot highlight (pale chartreuse, small, intense) — creates the bright
    // region where two main orbs meet, matching the near-white cores in the ref
    { bx:0.50, by:0.36, r:0.26, rgb:[210,255,170], a:0.260, fx:3.9e-4, fy:2.7e-4, ax:0.10, ay:0.19, ph:1.2 },
    // Bottom-left accent
    { bx:0.16, by:0.74, r:0.38, rgb:[ 93,200,0],   a:0.105, fx:3.1e-4, fy:1.6e-4, ax:0.19, ay:0.14, ph:3.8 },
    // Top-right accent
    { bx:0.84, by:0.26, r:0.36, rgb:[160,255, 60], a:0.115, fx:2.2e-4, fy:4.1e-4, ax:0.14, ay:0.21, ph:1.7 },
  ];

  function resize() {
    const p = canvas.parentElement;
    W = canvas.width  = (p ? p.clientWidth  : 0) || window.innerWidth;
    H = canvas.height = (p ? p.clientHeight : 0) || window.innerHeight;
  }

  function draw(ts) {
    ctx.fillStyle = "#020402";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "screen";
    for (const o of ORBS) {
      const x = (o.bx + Math.sin(ts * o.fx * Math.PI * 2 + o.ph)        * o.ax) * W;
      const y = (o.by + Math.sin(ts * o.fy * Math.PI * 2 + o.ph + 1.57) * o.ay) * H;
      const r = o.r * Math.min(W, H);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const [R, G, B] = o.rgb;
      g.addColorStop(0,   `rgba(${R},${G},${B},${o.a})`);
      g.addColorStop(0.30,`rgba(${R},${G},${B},${+(o.a * 0.58).toFixed(3)})`);
      g.addColorStop(0.65,`rgba(${R},${G},${B},${+(o.a * 0.15).toFixed(3)})`);
      g.addColorStop(1,   `rgba(${R},${G},${B},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function loop(ts) { draw(ts); raf = requestAnimationFrame(loop); }

  resize();
  raf = requestAnimationFrame(loop);

  return {
    resize,
    destroy: () => cancelAnimationFrame(raf),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function UserNeedsSection() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const cardRefs     = useRef([]);
  const dotRefs      = useRef([]);

  // Canvas: init + ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const orbs = initOrbs(canvas);
    const ro = new ResizeObserver(() => orbs.resize());
    ro.observe(canvas.parentElement);
    return () => { orbs.destroy(); ro.disconnect(); };
  }, []);

  // GSAP: pin section + scrub card transitions
  useEffect(() => {
    const cards = cardRefs.current;
    const dots  = dotRefs.current;
    if (!cards.every(Boolean) || !dots.every(Boolean)) return;

    const gctx = gsap.context(() => {
      // Initial states
      gsap.set(cards, { opacity: 0, y: 40, scale: 0.97 });
      gsap.set(dots,  { scaleX: 1, opacity: 0.25 });

      // Timeline total = 10 units, mapped to 400vh of pinned scroll.
      // Each card occupies a 2.5-unit slot (~100vh).
      // Slot: in (0.5u) → hold (~1.5u) → out (0.5u)
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      function addCard(card, dot, inAt, outAt) {
        tl.fromTo(card, { opacity:0, y:40, scale:0.97 }, { opacity:1, y:0, scale:1, duration:0.5 }, inAt);
        tl.fromTo(dot,  { scaleX:1, opacity:0.25 },      { scaleX:3.5, opacity:1, duration:0.5 }, inAt);
        if (outAt !== null) {
          tl.to(card, { opacity:0, y:-40, scale:0.97, duration:0.5 }, outAt);
          tl.to(dot,  { scaleX:1, opacity:0.25, duration:0.5 }, outAt);
        }
      }

      addCard(cards[0], dots[0], 0.0,  2.0);   // slot 0–2.5
      addCard(cards[1], dots[1], 2.5,  4.5);   // slot 2.5–5.0
      addCard(cards[2], dots[2], 5.0,  7.0);   // slot 5.0–7.5
      addCard(cards[3], dots[3], 7.5,  null);  // slot 7.5–10, holds

      // Pad to ensure card 4 has full hold time
      tl.set({}, {}, 10);

      ScrollTrigger.create({
        trigger:  containerRef.current,
        start:    "top top",
        end:      "+=400%",     // 400vh of pinned scroll (4 cards × ~100vh)
        pin:      true,
        scrub:    1.5,
        animation: tl,
      });
    }, containerRef);

    return () => gctx.revert();
  }, []);

  return (
    <>
      <style>{`
        /* ── Section shell ─────────────────────────────────────────── */
        #user-needs {
          position: relative;
          height: 100vh;
          overflow: hidden;
        }

        /* ── Orb canvas ─────────────────────────────────────────────── */
        #water-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        /* ── Film grain (inline SVG feTurbulence, screen blend) ───── */
        .un-grain {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0.10;
        }

        /* ── Vignette: focuses eye on centre card ────────────────── */
        .un-vignette {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: radial-gradient(
            ellipse 72% 72% at 50% 50%,
            transparent 20%,
            rgba(2,4,2,0.68) 100%
          );
        }

        /* ── Cards stage ─────────────────────────────────────────── */
        .un-cards-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* ── Card shell ───────────────────────────────────────────── */
        .un-card {
          position: absolute;
          width: min(600px, 88vw);
          padding: 44px 52px 48px;
          background: rgba(2, 4, 2, 0.72);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 2px;          /* near-sharp — bounding-box aesthetic */
          will-change: transform, opacity;
        }

        /* Chartreuse corner bracket — top-left */
        .un-card::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px;
          width: 20px; height: 20px;
          border-top:  2px solid rgba(127,255,0,0.72);
          border-left: 2px solid rgba(127,255,0,0.72);
        }
        /* Chartreuse corner bracket — bottom-right */
        .un-card::after {
          content: '';
          position: absolute;
          bottom: -1px; right: -1px;
          width: 20px; height: 20px;
          border-bottom: 2px solid rgba(127,255,0,0.72);
          border-right:  2px solid rgba(127,255,0,0.72);
        }

        /* Eyebrow label */
        .un-card-label {
          font-family: var(--font-sans);
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.65);
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .un-card-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(127,255,0,0.20);
        }

        /* Quote body */
        .un-card-text {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          font-size: clamp(20px, 2.2vw, 27px);
          color: rgba(255,255,255,0.88);
          line-height: 1.56;
          letter-spacing: -0.01em;
          margin: 0;
        }

        /* Chartreuse rule */
        .un-card-rule {
          width: 38px;
          height: 1px;
          background: rgba(127,255,0,0.40);
          margin-top: 26px;
        }

        /* ── Progress dots ────────────────────────────────────────── */
        .un-dots {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .un-dot {
          width: 6px;
          height: 2px;
          border-radius: 1px;
          background: rgba(127,255,0,0.55);
          transform-origin: left center;
          will-change: transform, opacity;
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 767px) {
          .un-card {
            padding: 28px 24px 32px;
          }
          .un-card-text {
            font-size: 19px;
          }
          .un-dots {
            bottom: 24px;
          }
        }
      `}</style>

      <section id="user-needs" ref={containerRef}>
        {/* Orb canvas */}
        <canvas ref={canvasRef} id="water-bg" />

        {/* Film grain — inline SVG feTurbulence */}
        <svg
          className="un-grain"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="un-noise-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.68 0.68"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#un-noise-filter)" />
        </svg>

        {/* Radial vignette */}
        <div className="un-vignette" />

        {/* Cards */}
        <div className="un-cards-stage">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="un-card"
              ref={(el) => (cardRefs.current[i] = el)}
            >
              <div className="un-card-label">{card.label}</div>
              <p className="un-card-text">{card.text}</p>
              <div className="un-card-rule" />
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="un-dots">
          {CARDS.map((_, i) => (
            <div
              key={i}
              className="un-dot"
              ref={(el) => (dotRefs.current[i] = el)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
