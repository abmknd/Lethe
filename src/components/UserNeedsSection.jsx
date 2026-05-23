import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Card data ────────────────────────────────────────────────────────────────
const CARDS = [
  { label: "The Creator",   text: "I have a podcast and need to meet the kind of guests my audience hasn't heard yet." },
  { label: "The Builder",   text: "I'm raising a seed round and need warm intros to operators who've actually done it." },
  { label: "The Thinker",   text: "I'm writing a book and need researchers who think in the same direction I do." },
  { label: "The Investor",  text: "I run a climate fund and need founders who are serious, not just interesting." },
];

// ─── Water simulation ─────────────────────────────────────────────────────────
// Ported faithfully from the reference Framer component provided.
// Three-buffer CPU wave equation → rendered to offscreen canvas at sim-res,
// then scaled up via 2D ctx.drawImage. Lighting: surface normals + specular +
// chartreuse spot + vignette. Identical physics config as the reference.

const BASE  = { r: 5,   g: 7,   b: 10  }; // #05070A
const LIGHT = { r: 199, g: 255, b: 60  }; // #C7FF3C

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createWaterSim(canvas, container) {
  // Config values matching the reference component's property-control defaults
  const LIGHT_INTENSITY   = 0.15;
  const LIGHT_SIZE        = 0.50;
  const LIGHT_MOTION_SPD  = 0.08;
  const POKE_STRENGTH     = 0.70;
  const POKE_RADIUS       = 0.030;
  const DENSITY           = 1.2;
  const DAMPING           = 0.985;
  const SPEED             = 1.0;
  const AUTO_RATE         = 0.7;   // ripples per second
  const AUTO_STRENGTH     = 0.22;
  const RES               = 1.0;

  let W = 0, H = 0, simW = 0, simH = 0;
  let prev, curr, next;
  let offscreen = null, octx = null, ctx = null, imgData = null;
  let raf = null, running = false, lastTime = 0;
  let lightX = 0.62, lightY = 0.42, lightTX = 0.62, lightTY = 0.42;
  let lightMoveIndex = 0, lightMoveAcc = 0, autoAcc = 0;
  const seed = Math.floor(Math.random() * 1e9);

  function initSim() {
    simW = clamp(Math.round(220 * RES), 80, 460);
    simH = clamp(Math.round((simW * 900) / 1440), 50, 320);
    prev = new Float32Array(simW * simH);
    curr = new Float32Array(simW * simH);
    next = new Float32Array(simW * simH);
    if (!offscreen) offscreen = document.createElement("canvas");
    offscreen.width  = simW;
    offscreen.height = simH;
    octx   = offscreen.getContext("2d", { willReadFrequently: true });
    imgData = octx.createImageData(simW, simH);
    const rnd = mulberry32(seed);
    for (let i = 0; i < curr.length; i++) { curr[i] = (rnd() - 0.5) * 0.006; prev[i] = curr[i]; }
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    W = canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
    H = canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(1, 0, 0, 1, 0, 0);
    initSim();
  }

  function poke(nx, ny, str) {
    const cx = clamp(Math.floor(nx * simW), 0, simW - 1);
    const cy = clamp(Math.floor(ny * simH), 0, simH - 1);
    const rad = clamp(Math.round((POKE_RADIUS * Math.min(simW, simH)) / DENSITY), 2, Math.round(Math.min(simW, simH) * 0.25));
    const r2 = rad * rad;
    for (let dy = -rad; dy <= rad; dy++) {
      const yy = cy + dy;
      if (yy < 1 || yy >= simH - 1) continue;
      for (let dx = -rad; dx <= rad; dx++) {
        const xx = cx + dx;
        if (xx < 1 || xx >= simW - 1) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        curr[yy * simW + xx] -= str * (1 - d2 / r2);
      }
    }
  }

  function stepSim(dt) {
    const damp = clamp(DAMPING, 0.7, 0.9995);
    const c    = clamp(SPEED * DENSITY, 0.6, 2.2);
    for (let y = 1; y < simH - 1; y++) {
      const row = y * simW;
      for (let x = 1; x < simW - 1; x++) {
        const i   = row + x;
        const avg = (curr[i - simW] + curr[i + simW] + curr[i + 1] + curr[i - 1]) * 0.25;
        const val = (avg * 2 - prev[i]) * damp;
        let out   = curr[i] + (val - curr[i]) * clamp(dt * 60 * c, 0.15, 1);
        const sm  = clamp(1.25 - DENSITY, 0, 0.85);
        if (sm > 0) out = out * (1 - sm) + avg * sm;
        next[i] = out;
      }
    }
    prev.set(curr);
    curr.set(next);
  }

  function render() {
    if (!ctx || !octx || !imgData) return;
    const d = imgData.data;
    const bR = BASE.r,  bG = BASE.g,  bB = BASE.b;
    const lR = LIGHT.r, lG = LIGHT.g, lB = LIGHT.b;
    const cX = lightX * simW, cY = lightY * simH;
    const sp = Math.max(8, LIGHT_SIZE * Math.min(simW, simH) * 1.35);
    const is = 1 / (sp * sp);
    const lx = -0.6, ly = -0.35, lz = 0.72, ns = 2.1;
    const vx = simW * 0.5, vy = simH * 0.55;
    const dx = 1 / (simW * 0.62), dy = 1 / (simH * 0.62);
    let p = 0;
    for (let y = 0; y < simH; y++) {
      const row = y * simW;
      for (let x = 0; x < simW; x++) {
        const i  = row + x;
        const hC = curr[i];
        const hL = x > 0         ? curr[i - 1]    : hC;
        const hR = x < simW - 1  ? curr[i + 1]    : hC;
        const hU = y > 0         ? curr[i - simW] : hC;
        const hD = y < simH - 1  ? curr[i + simW] : hC;
        const ddx = (hR - hL) * ns, ddy = (hD - hU) * ns;
        let nx2 = -ddx, ny2 = -ddy, nz = 1;
        const il = 1 / Math.sqrt(nx2*nx2 + ny2*ny2 + nz*nz);
        nx2 *= il; ny2 *= il; nz *= il;
        const ndotl = clamp(nx2*lx + ny2*ly + nz*lz, 0, 1);
        const rx = x - cX, ry = y - cY;
        const spot = Math.exp(-(rx*rx + ry*ry) * is);
        const spec = Math.pow(clamp(ndotl, 0, 1), 8) * (0.35 + 0.65 * spot);
        const bl = 0.06 + ndotl * 0.06;
        let r = bR*(1+bl), g = bG*(1+bl), b = bB*(1+bl);
        const slope = clamp((Math.abs(ddx) + Math.abs(ddy)) * 1.8, 0, 1);
        const glow  = clamp(spot * (0.35 + slope) * LIGHT_INTENSITY * 1.1, 0, 1.6);
        r = r*(1-glow*0.55) + lR*glow*0.55;
        g = g*(1-glow)      + lG*glow;
        b = b*(1-glow*0.35) + lB*glow*0.35;
        const s = clamp(spec * LIGHT_INTENSITY * 1.05, 0, 1);
        r = r*(1-s)+lR*s; g = g*(1-s)+lG*s; b = b*(1-s)+lB*s;
        const vdx = (x-vx)*dx, vdy = (y-vy)*dy;
        const vig = clamp(1-(vdx*vdx+vdy*vdy), 0.65, 1);
        d[p++] = r*vig; d[p++] = g*vig; d[p++] = b*vig; d[p++] = 255;
      }
    }
    octx.putImageData(imgData, 0, 0);
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, W, H);
    ctx.restore();
  }

  function tick(t) {
    if (!running) return;
    if (!lastTime) lastTime = t;
    const dt = clamp((t - lastTime) / 1000, 0.001, 0.05);
    lastTime = t;
    // Light motion
    lightMoveAcc += dt;
    const k = 1 - Math.exp(-dt * LIGHT_MOTION_SPD * 60);
    lightX += (lightTX - lightX) * k;
    lightY += (lightTY - lightY) * k;
    const ex = lightTX - lightX, ey = lightTY - lightY;
    if (ex*ex + ey*ey < 0.0009 || lightMoveAcc > 18) {
      lightMoveAcc = 0; lightMoveIndex++;
      const rr = mulberry32(seed + lightMoveIndex * 1337);
      lightTX = clamp(0.12 + rr() * 0.76, 0, 1);
      lightTY = clamp(0.12 + rr() * 0.76, 0, 1);
    }
    // Auto-ripples
    autoAcc += dt;
    const interval = 1 / clamp(AUTO_RATE, 0.05, 10);
    if (autoAcc >= interval) {
      autoAcc = 0;
      const rr = mulberry32(seed + Math.floor(t));
      poke(clamp(0.18 + rr() * 0.64, 0, 1), clamp(0.15 + rr() * 0.7, 0, 1), AUTO_STRENGTH);
    }
    stepSim(dt);
    render();
    raf = requestAnimationFrame(tick);
  }

  const start = () => { if (running) return; running = true; raf = requestAnimationFrame(tick); };
  const stop  = () => { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } };

  const io = new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0.05 });
  io.observe(container);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  return {
    onPointerDown(e) {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top)  / rect.height;
      poke(nx, ny, POKE_STRENGTH);
      const mix = 0.35;
      lightX = lightX*(1-mix) + nx*mix;
      lightY = lightY*(1-mix) + ny*mix;
      lightTX = nx; lightTY = ny; lightMoveAcc = 0;
    },
    destroy() { stop(); io.disconnect(); ro.disconnect(); },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserNeedsSection() {
  const canvasRef   = useRef(null);
  const sectionRef  = useRef(null);
  const stickyRef   = useRef(null);
  const waterRef    = useRef(null);
  const cardRefs    = useRef([]);   // outer shell — scroll animation target (opacity/y/scale)
  const innerRefs   = useRef([]);   // inner visual — tilt target (rotateX/rotateY)
  const dotRefs     = useRef([]);
  const charDone    = useRef([false, false, false, false]);

  // ── Water setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = stickyRef.current;
    if (!canvas || !container) return;
    const sim = createWaterSim(canvas, container);
    waterRef.current = sim;
    return () => sim.destroy();
  }, []);

  // ── Card 3-D tilt ──────────────────────────────────────────────────────────
  // Pure CSS transform — no GSAP involved. GSAP's scrub ticker was killing
  // each rotateX/rotateY tween before it could settle (new gsap.to() calls
  // overwrite the previous one on every mousemove). Direct style + CSS
  // transition runs on the compositor thread and nothing can interfere.
  useEffect(() => {
    const cleanups = cardRefs.current.map((card, i) => {
      const inner = innerRefs.current[i];
      if (!card || !inner) return null;

      const onMove = (e) => {
        const r  = card.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2; // -1 → 1
        const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        inner.style.transform =
          `perspective(650px) rotateY(${(dx * 22).toFixed(2)}deg) rotateX(${(-dy * 15).toFixed(2)}deg)`;
        if (Math.random() < 0.06) {
          waterRef.current?.onPointerDown({
            clientX: r.left + r.width  * (0.2 + Math.random() * 0.6),
            clientY: r.top  + r.height * (0.2 + Math.random() * 0.6),
          });
        }
      };
      const onLeave = () => { inner.style.transform = "perspective(650px) rotateY(0deg) rotateX(0deg)"; };

      card.addEventListener("mousemove",  onMove);
      card.addEventListener("mouseleave", onLeave);
      return () => {
        card.removeEventListener("mousemove",  onMove);
        card.removeEventListener("mouseleave", onLeave);
      };
    });
    return () => cleanups.forEach(fn => fn?.());
  }, []);

  // ── Dancy character reveal ─────────────────────────────────────────────────
  const animateChars = (cardEl) => {
    gsap.fromTo(
      cardEl.querySelectorAll(".un-word"),
      { opacity: 0, y: 16, rotation: () => (Math.random() - 0.5) * 10 },
      { opacity: 1, y: 0, rotation: 0, stagger: 0.055, duration: 0.50, ease: "back.out(1.8)" }
    );
  };

  // ── Scroll: CSS sticky + scrubbed GSAP timeline ────────────────────────────
  useEffect(() => {
    const cards = cardRefs.current;
    const dots  = dotRefs.current;
    if (!cards.every(Boolean) || !dots.every(Boolean)) return;

    const gctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 44, scale: 0.97 });
      gsap.set(dots,  { scaleX: 1, opacity: 0.22 });

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      // 4 equal card slots across the 10-unit timeline (= 400vh sticky scroll)
      [0, 2.5, 5.0, 7.5].forEach((inAt, i) => {
        const outAt = i < 3 ? inAt + 2.0 : null;
        tl.fromTo(cards[i], { opacity:0, y:44, scale:0.97 }, { opacity:1, y:0, scale:1, duration:0.5 }, inAt);
        if (outAt) tl.to(cards[i], { opacity:0, y:-44, scale:0.97, duration:0.5 }, outAt);
        tl.fromTo(dots[i],  { scaleX:1, opacity:0.22 }, { scaleX:3.5, opacity:1, duration:0.5 }, inAt);
        if (outAt) tl.to(dots[i], { scaleX:1, opacity:0.22, duration:0.5 }, outAt);
      });

      tl.set({}, {}, 10);

      const ENTRY_P = [0, 0.25, 0.50, 0.75];

      ScrollTrigger.create({
        trigger:   sectionRef.current,
        start:     "top top",
        end:       "bottom bottom",
        scrub:     1,
        animation: tl,
        onUpdate(self) {
          const p = self.progress;

          // All 4 cards are position:absolute stacked at the same coordinates.
          // Card 4 is last in DOM, so it sits on top in z-order and swallows
          // every mousemove — even at opacity:0 — making cards 1–3 untiltable.
          // Fix: only the currently-visible card gets pointer-events:all.
          const activeIdx = p < 0.25 ? 0 : p < 0.50 ? 1 : p < 0.75 ? 2 : 3;
          cards.forEach((card, i) => {
            card.style.pointerEvents = i === activeIdx ? 'all' : 'none';
          });

          ENTRY_P.forEach((ep, i) => {
            if (p >= ep + 0.01 && !charDone.current[i]) {
              charDone.current[i] = true;
              animateChars(cards[i]);
            }
            if (p < ep) charDone.current[i] = false;
          });
        },
      });

      // Recalculate all trigger positions after this 500vh block is in the layout.
      // Fixes mobile: iOS viewport height changes (address bar show/hide) and
      // any layout shift from the sticky section can misplace downstream triggers.
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => gctx.revert();
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* 500vh section — CSS sticky keeps the canvas pinned for 400vh of scroll */
        #user-needs {
          height: 500vh;
          position: relative;
        }
        .un-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }

        /* Canvas fills the sticky viewport — explicit z-index 0 anchors the stack */
        #water-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          z-index: 0;
          cursor: none; /* keep site-wide custom cursor; no crosshair */
        }

        /* Vignette — focuses eye on centre */
        .un-vig {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            ellipse 80% 80% at 50% 50%,
            transparent 15%,
            rgba(2,4,2,0.70) 100%
          );
        }

        /* Cards stage — sits clearly above water (z 2) and vignette (z 1) */
        .un-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          pointer-events: none;
        }

        /* ── Card outer shell — scroll animation target only (no visuals here) */
        .un-card {
          position: absolute;
          z-index: 1;
          width: min(540px, 88vw);
          will-change: transform, opacity;
          pointer-events: none; /* JS controls this — only the active card gets 'all' */
          cursor: none;
        }

        /* ── Card inner — tilt target + all visuals ─────────────────────────
           Keeping tilt on a separate element from the scroll-animated outer
           prevents GSAP scrub from overwriting rotateX/rotateY mid-tween. */
        .un-card-inner {
          width: 100%;
          padding: 48px 52px 52px;
          background: rgba(3, 6, 3, 0.88);
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          border: 1px solid rgba(127,255,0,0.30);
          border-radius: var(--radius-lg);
          box-shadow:
            0 40px 100px rgba(0,0,0,0.80),
            0 12px 32px  rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          /* CSS transition drives the tilt — smooth, compositor-only, GSAP-free */
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
        }

        /* Glowing dot + ring — from reference screenshot */
        .un-dot-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(127,255,0,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          flex-shrink: 0;
        }
        .un-dot-inner {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(127,255,0,0.85);
          box-shadow: 0 0 10px rgba(127,255,0,0.7), 0 0 22px rgba(127,255,0,0.30);
          animation: un-pulse 2.8s ease-in-out infinite;
        }
        @keyframes un-pulse {
          0%,100% { transform: scale(1);    opacity: 0.85; }
          50%      { transform: scale(1.18); opacity: 1.00; }
        }

        /* Eyebrow */
        .un-label {
          font-family: var(--font-sans);
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.30em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.60);
          margin-bottom: 20px;
        }

        /* Quote body — exactly matches the .relethe-story-line spec */
        .un-text {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          font-size: clamp(24px, 3.2vw, 44px);
          color: rgba(255,255,255,0.88);
          line-height: 1.35;
          letter-spacing: -0.01em;
          margin: 0;
          /* normal word-wrap — lines break between words, never mid-word */
          word-break: normal;
          overflow-wrap: normal;
        }

        /* Word spans for dancy reveal — inline-block keeps each word intact
           but allows the browser to wrap lines between words naturally */
        .un-word {
          display: inline-block;
          white-space: nowrap;
          opacity: 0;
          will-change: transform, opacity;
        }

        /* Chartreuse rule */
        .un-rule {
          width: 30px;
          height: 1px;
          background: rgba(127,255,0,0.40);
          margin-top: 28px;
          flex-shrink: 0;
        }

        /* Progress dots */
        .un-dots {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .un-dot {
          width: 6px;
          height: 2px;
          border-radius: 1px;
          background: rgba(127,255,0,0.48);
          transform-origin: left center;
          will-change: transform, opacity;
        }

        @media (max-width: 767px) {
          .un-card-inner { padding: 36px 28px 40px; }
          .un-text  { font-size: 20px; }
          .un-dots  { bottom: 20px; }
        }
      `}</style>

      <section id="user-needs" ref={sectionRef}>
        <div
          className="un-sticky"
          ref={stickyRef}
          onPointerDown={(e) => waterRef.current?.onPointerDown(e)}
        >
          <canvas ref={canvasRef} id="water-bg" />
          <div className="un-vig" />

          <div className="un-stage">
            {CARDS.map((card, i) => (
              <div key={i} className="un-card" ref={(el) => (cardRefs.current[i] = el)}>
                <div className="un-card-inner" ref={(el) => (innerRefs.current[i] = el)}>
                {/* Glowing dot — reference screenshot detail */}
                <div className="un-dot-wrap">
                  <div className="un-dot-inner" />
                </div>

                <div className="un-label">{card.label}</div>

                {/* Split into word spans — lines break naturally between words;
                    each word bounces in individually for the dancy effect */}
                <p className="un-text" aria-label={card.text}>
                  {card.text.split(" ").map((word, j, arr) => (
                    <span key={j} className="un-word">
                      {word}{j < arr.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>

                <div className="un-rule" />
                </div>
              </div>
            ))}
          </div>

          <div className="un-dots">
            {CARDS.map((_, i) => (
              <div key={i} className="un-dot" ref={(el) => (dotRefs.current[i] = el)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
