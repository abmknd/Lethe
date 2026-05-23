import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  "I have a podcast and need to meet the kind of guests my audience hasn't heard yet.",
  "I'm raising a seed round and need warm intros to operators who've actually done it.",
  "I'm writing a book and need researchers who think in the same direction I do.",
  "I run a climate fund and need founders who are serious, not just interesting.",
];

// ─── Water Canvas Controller ────────────────────────────────────────────────
function createWaterController(canvas) {
  const ctx = canvas.getContext("2d");
  const offscreen = document.createElement("canvas");
  const offCtx = offscreen.getContext("2d");

  let W, H, simW, simH, buf1, buf2;
  let rafId = null;
  let spawnTimer = null;
  let scrollProgress = 0;

  const BASE_R = 5, BASE_G = 7, BASE_B = 5;
  const PEAK_R = 127, PEAK_G = 255, PEAK_B = 0;
  const THRESHOLD = 30;
  const BASE_DAMPING = 0.985;

  function init() {
    W = canvas.width;
    H = canvas.height;
    const scale = W < 768 ? 0.3 : 0.5;
    simW = Math.max(4, Math.ceil(W * scale));
    simH = Math.max(4, Math.ceil(H * scale));
    buf1 = new Float32Array(simW * simH);
    buf2 = new Float32Array(simW * simH);
    offscreen.width = simW;
    offscreen.height = simH;
  }

  function getProgressMult() {
    if (scrollProgress < 0.5) return 0.4 + scrollProgress * 1.2;
    return 1.0 - (scrollProgress - 0.5) * 1.4;
  }

  function addRipple(x, y, radius, strength) {
    const sx = Math.floor((x / W) * simW);
    const sy = Math.floor((y / H) * simH);
    const r = Math.ceil(radius);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = sx + dx, ny = sy + dy;
        if (nx >= 0 && nx < simW && ny >= 0 && ny < simH) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= r) buf1[ny * simW + nx] += strength * (1 - dist / r);
        }
      }
    }
  }

  function scheduleSpawn() {
    spawnTimer = setTimeout(() => {
      const mult = Math.max(0.3, getProgressMult());
      addRipple(
        Math.random() * W,
        Math.random() * H,
        2 + Math.random() * 2,
        (180 + Math.random() * 75) * mult
      );
      scheduleSpawn();
    }, 600 + Math.random() * 300);
  }

  function update() {
    const mult = Math.max(0.3, getProgressMult());
    const damping = BASE_DAMPING - (mult - 0.3) * 0.008;
    for (let y = 1; y < simH - 1; y++) {
      for (let x = 1; x < simW - 1; x++) {
        const idx = y * simW + x;
        const val =
          (buf1[(y - 1) * simW + x] +
            buf1[(y + 1) * simW + x] +
            buf1[y * simW + (x - 1)] +
            buf1[y * simW + (x + 1)]) / 2 - buf2[idx];
        buf2[idx] = val * damping;
      }
    }
    const tmp = buf1; buf1 = buf2; buf2 = tmp;
  }

  function render() {
    const imgData = offCtx.createImageData(simW, simH);
    const d = imgData.data;
    for (let i = 0; i < simW * simH; i++) {
      const h = Math.abs(buf1[i]);
      let r = BASE_R, g = BASE_G, b = BASE_B;
      if (h > THRESHOLD) {
        const t = Math.min((h - THRESHOLD) / (255 - THRESHOLD), 1) * 0.12;
        r = Math.round(BASE_R + (PEAK_R - BASE_R) * t);
        g = Math.round(BASE_G + (PEAK_G - BASE_G) * t);
        b = Math.round(BASE_B + (PEAK_B - BASE_B) * t);
      }
      const p = i * 4;
      d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, W, H);
  }

  function loop() {
    update();
    render();
    rafId = requestAnimationFrame(loop);
  }

  init();
  loop();
  scheduleSpawn();

  return {
    setScrollProgress(p) { scrollProgress = p; },
    activateBurst() {
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        setTimeout(() => addRipple(
          Math.random() * W, Math.random() * H,
          3 + Math.random() * 2, 200 + Math.random() * 55
        ), (i * 400) / count);
      }
    },
    resize() { init(); },
    destroy() {
      cancelAnimationFrame(rafId);
      clearTimeout(spawnTimer);
    },
  };
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function UserNeedsSection() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const waterRef     = useRef(null);
  const cardRefs     = useRef([]);
  const turbRefs     = useRef([]);
  const dispRefs     = useRef([]);
  const seedsRef     = useRef([0, 10, 20, 30]);
  const ratesRef     = useRef([0.004, 0.004, 0.004, 0.004]);

  // Canvas init + resize
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let water = null;

    const initOrResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      canvas.width  = w;
      canvas.height = h;
      if (!water) {
        water = createWaterController(canvas);
        waterRef.current = water;
      } else {
        water.resize();
      }
    };

    const ro = new ResizeObserver(initOrResize);
    ro.observe(container);
    initOrResize();

    return () => {
      water?.destroy();
      ro.disconnect();
    };
  }, []);

  // GSAP ScrollTrigger + ticker
  useEffect(() => {
    const cards = cardRefs.current;
    if (!cards.every(Boolean)) return;

    // Set initial state
    gsap.set(cards, { y: 80, opacity: 0, scale: 0.96 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#user-needs",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          pin: ".un-sticky",
          anticipatePin: 1,
          onEnter: () => waterRef.current?.activateBurst(),
          onUpdate: (self) => waterRef.current?.setScrollProgress(self.progress),
        },
      });

      // Card 1 in (0–12%)
      tl.fromTo(cards[0],
        { y: 80, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: "power2.out", duration: 0.12 }, 0);
      // Card 1 out (20–30%)
      tl.to(cards[0],
        { y: -60, opacity: 0, scale: 0.97, ease: "power1.in", duration: 0.10 }, 0.20);

      // Card 2 in (20–32%)
      tl.fromTo(cards[1],
        { y: 80, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: "power2.out", duration: 0.12 }, 0.20);
      // Card 2 out (40–50%)
      tl.to(cards[1],
        { y: -60, opacity: 0, scale: 0.97, ease: "power1.in", duration: 0.10 }, 0.40);

      // Card 3 in (40–52%)
      tl.fromTo(cards[2],
        { y: 80, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: "power2.out", duration: 0.12 }, 0.40);
      // Card 3 out (60–70%)
      tl.to(cards[2],
        { y: -60, opacity: 0, scale: 0.97, ease: "power1.in", duration: 0.10 }, 0.60);

      // Card 4 in (60–72%)
      tl.fromTo(cards[3],
        { y: 80, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: "power2.out", duration: 0.12 }, 0.60);
      // Card 4 hold (72–100%)
      tl.to(cards[3], { opacity: 1, duration: 0.28 }, 0.72);
    });

    // Ticker: animate liquid border seeds
    const tickerCb = () => {
      turbRefs.current.forEach((el, i) => {
        if (!el) return;
        seedsRef.current[i] += ratesRef.current[i];
        el.setAttribute("seed", String(seedsRef.current[i]));
      });
    };
    gsap.ticker.add(tickerCb);

    return () => {
      gsap.ticker.remove(tickerCb);
      ctx.revert();
    };
  }, []);

  const onEnter = (i) => {
    const disp = dispRefs.current[i];
    if (disp) gsap.to(disp, { attr: { scale: 9 }, duration: 0.3 });
    ratesRef.current[i] = 0.009;
    const ring = cardRefs.current[i]?.querySelector(".card-glow-ring");
    if (ring) ring.style.animationDuration = "1.4s";
  };

  const onLeave = (i) => {
    const disp = dispRefs.current[i];
    if (disp) gsap.to(disp, { attr: { scale: 4 }, duration: 0.3 });
    ratesRef.current[i] = 0.004;
    const ring = cardRefs.current[i]?.querySelector(".card-glow-ring");
    if (ring) ring.style.animationDuration = "3s";
  };

  return (
    <>
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        #user-needs {
          height: 500vh;
          overflow: hidden;
          position: relative;
        }
        .un-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }
        #water-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        .un-cards-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding-bottom: 8vh;
        }
        .un-card {
          position: absolute;
          width: 560px;
          height: 280px;
          border-radius: 12px;
          background: rgba(10, 12, 10, 0.82);
          will-change: transform, opacity;
          cursor: none;
        }
        .card-border {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          border: 1px solid rgba(127, 255, 0, 0.35);
          box-shadow: 0 0 12px rgba(127, 255, 0, 0.15),
                      inset 0 0 8px rgba(127, 255, 0, 0.05);
          pointer-events: none;
          z-index: 1;
        }
        .card-glow-ring {
          position: absolute;
          inset: -1px;
          border-radius: 13px;
          background: conic-gradient(
            from var(--angle),
            transparent 0%,
            rgba(127, 255, 0, 0.6) 8%,
            transparent 16%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 1px;
          animation: spin-glow 3s linear infinite;
          pointer-events: none;
          z-index: 2;
        }
        @keyframes spin-glow {
          to { --angle: 360deg; }
        }
        .card-content {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 40px;
        }
        .card-content p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          font-size: 20px;
          color: #D0D0C8;
          line-height: 1.6;
          text-align: center;
          max-width: 460px;
          margin: 0;
        }
        @media (max-width: 767px) {
          .un-card {
            width: 88vw;
            height: auto;
            min-height: 200px;
          }
          .card-border {
            filter: url(#liquid-border-0) !important;
          }
        }
      `}</style>

      {/* One SVG filter per card */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          {CARDS.map((_, i) => (
            <filter key={i} id={`liquid-border-${i}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence
                ref={(el) => (turbRefs.current[i] = el)}
                type="fractalNoise"
                baseFrequency="0.015 0.025"
                numOctaves="3"
                seed={String(i * 10)}
                result="noise"
              />
              <feDisplacementMap
                ref={(el) => (dispRefs.current[i] = el)}
                in="SourceGraphic"
                in2="noise"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>

      <section id="user-needs">
        <div className="un-sticky" ref={containerRef}>
          <canvas ref={canvasRef} id="water-bg" />
          <div className="un-cards-stage">
            {CARDS.map((text, i) => (
              <div
                key={i}
                className="un-card"
                ref={(el) => (cardRefs.current[i] = el)}
                onMouseEnter={() => onEnter(i)}
                onMouseLeave={() => onLeave(i)}
              >
                <div
                  className="card-border"
                  style={{ filter: `url(#liquid-border-${i})` }}
                />
                <div className="card-glow-ring" />
                <div className="card-content">
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
