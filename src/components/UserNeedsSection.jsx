import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Card data ────────────────────────────────────────────────────────────────
const CARDS = [
  { label: "The Connector", text: "I have a podcast and need to meet the kind of guests my audience hasn't heard yet." },
  { label: "The Builder",   text: "I'm raising a seed round and need warm intros to operators who've actually done it." },
  { label: "The Thinker",   text: "I'm writing a book and need researchers who think in the same direction I do." },
  { label: "The Investor",  text: "I run a climate fund and need founders who are serious, not just interesting." },
];

// ─── WebGL shaders ────────────────────────────────────────────────────────────
const VERT = `#version 300 es
in  vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv        = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Display: reads CPU-uploaded height field, renders dark-water + chartreuse reflection
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_h;
uniform vec2      u_tx;
in  vec2 v_uv;
out vec4 out_col;

float dec(float v) { return (v - 0.498) * 20.0; }

void main() {
  float h  = dec(texture(u_h, v_uv).r);
  float hl = dec(texture(u_h, v_uv - vec2(u_tx.x, 0.0)).r);
  float hr = dec(texture(u_h, v_uv + vec2(u_tx.x, 0.0)).r);
  float hu = dec(texture(u_h, v_uv - vec2(0.0, u_tx.y)).r);
  float hd = dec(texture(u_h, v_uv + vec2(0.0, u_tx.y)).r);

  // Surface slope — drives chartreuse shimmer
  float slope   = length(vec2(hr - hl, hd - hu));
  float shimmer = clamp(slope * 3.0 + abs(h) * 0.55, 0.0, 1.0);

  vec3 dark = vec3(0.008, 0.016, 0.008);  // #020402
  vec3 ch   = vec3(0.498, 1.000, 0.000);  // #7FFF00

  // Blend: dark water to chartreuse reflection on wave crests
  vec3 col = mix(dark, ch, pow(shimmer, 1.35) * 0.60);
  // Constant dim ambient green tint so the water reads "alive" even flat
  col += ch * 0.012;

  out_col = vec4(col, 1.0);
}`;

// ─── Water controller ─────────────────────────────────────────────────────────
function createWater(canvas) {
  const gl = canvas.getContext("webgl2");
  if (!gl) return null;

  const SIM = 256;
  let W = 0, H = 0, raf = 0;
  let b1 = new Float32Array(SIM * SIM); // height at t
  let b2 = new Float32Array(SIM * SIM); // height at t-1
  const u8 = new Uint8Array(SIM * SIM);
  let spawnId = null;

  // Shader
  function mkShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(VERT, gl.VERTEX_SHADER));
  gl.attachShader(prog, mkShader(FRAG, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Fullscreen quad
  const qbuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, qbuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uH  = gl.getUniformLocation(prog, "u_h");
  const uTx = gl.getUniformLocation(prog, "u_tx");
  gl.uniform1i(uH, 0);
  gl.uniform2f(uTx, 1 / SIM, 1 / SIM);

  // Single-channel 8-bit texture (R8 — linear filterable in WebGL2)
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // ── Physics ─────────────────────────────────────────────────────────────────
  function step() {
    for (let y = 1; y < SIM - 1; y++) {
      for (let x = 1; x < SIM - 1; x++) {
        const i = y * SIM + x;
        const h = (b1[(y-1)*SIM+x] + b1[(y+1)*SIM+x] +
                   b1[y*SIM+(x-1)] + b1[y*SIM+(x+1)]) * 0.5 - b2[i];
        b2[i] = h * 0.986; // damping
      }
    }
    const tmp = b1; b1 = b2; b2 = tmp;
  }

  // Add ripple impulse at normalised position
  function addImpulse(xn, yn, rn, str) {
    const cx = Math.floor(xn * SIM);
    const cy = Math.floor(yn * SIM);
    const r  = Math.ceil(rn * SIM);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < SIM && ny >= 0 && ny < SIM) {
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d <= r) b1[ny * SIM + nx] += str * (1 - d / r);
        }
      }
    }
  }

  // Ambient spawner — keeps the surface permanently alive
  function spawnAmbient() {
    addImpulse(Math.random(), Math.random(), 0.025 + Math.random() * 0.022, 0.55 + Math.random() * 0.4);
    spawnId = setTimeout(spawnAmbient, 650 + Math.random() * 420);
  }
  spawnAmbient();

  function resize() {
    const p = canvas.parentElement;
    W = canvas.width  = (p ? p.clientWidth  : 0) || window.innerWidth;
    H = canvas.height = (p ? p.clientHeight : 0) || window.innerHeight;
  }

  function frame() {
    step();
    // Encode float → uint8 for R8 upload
    for (let i = 0; i < SIM * SIM; i++) {
      u8[i] = Math.max(0, Math.min(255, b1[i] * 12.75 + 127.5)) | 0;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, SIM, SIM, 0, gl.RED, gl.UNSIGNED_BYTE, u8);
    gl.viewport(0, 0, W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }

  resize();
  frame();

  return { addImpulse, resize, destroy() { cancelAnimationFrame(raf); clearTimeout(spawnId); } };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserNeedsSection() {
  const canvasRef    = useRef(null);
  const sectionRef   = useRef(null);
  const waterRef     = useRef(null);
  const cardRefs     = useRef([]);
  const dotRefs      = useRef([]);
  // Track which cards have had their char animation fired
  const charDoneRef  = useRef([false, false, false, false]);

  // ── WebGL water setup ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const water = createWater(canvas);
    waterRef.current = water;

    const ro = new ResizeObserver(() => water?.resize());
    ro.observe(canvas.parentElement);

    // Click → water tap
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      water?.addImpulse(
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top)  / rect.height,
        0.04, 2.5
      );
    };
    canvas.addEventListener("click", onClick);

    return () => {
      water?.destroy();
      ro.disconnect();
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  // ── Card tilt (3-D perspective on hover) ──────────────────────────────────
  const setupTilt = (card) => {
    if (!card) return;
    const onMove = (e) => {
      const r  = card.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2; // -1 to 1
      const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      gsap.to(card, {
        rotateY:  dx * 9,
        rotateX: -dy * 6,
        transformPerspective: 900,
        ease: "power2.out",
        duration: 0.25,
      });
      // Pulse water under the card too
      const cx = (r.left + r.width  * 0.5) / window.innerWidth;
      const cy = (r.top  + r.height * 0.5) / window.innerHeight;
      if (Math.random() < 0.08) {
        waterRef.current?.addImpulse(cx + (Math.random()-0.5)*0.1, cy + (Math.random()-0.5)*0.1, 0.022, 0.35);
      }
    };
    const onLeave = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "power3.out" });
    };
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  };

  // Attach tilt listeners after mount
  useEffect(() => {
    const cleanups = cardRefs.current.map(setupTilt);
    return () => cleanups.forEach(fn => fn?.());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dancy character animation (fires once per card entry) ─────────────────
  const animateChars = (cardEl) => {
    const spans = cardEl.querySelectorAll(".un-ch");
    gsap.fromTo(
      spans,
      { opacity: 0, y: 14, rotation: () => (Math.random() - 0.5) * 12 },
      { opacity: 1, y: 0, rotation: 0, stagger: 0.018, duration: 0.45, ease: "back.out(1.7)" }
    );
  };

  // ── GSAP scroll: CSS-sticky section + scrubbed timeline ───────────────────
  useEffect(() => {
    const cards = cardRefs.current;
    const dots  = dotRefs.current;
    if (!cards.every(Boolean) || !dots.every(Boolean)) return;

    const gctx = gsap.context(() => {
      // Cards start hidden; chars start hidden via inline style on spans
      gsap.set(cards, { opacity: 0, y: 44, scale: 0.97 });
      gsap.set(dots,  { scaleX: 1, opacity: 0.22 });

      // Timeline total = 10 units spanning 400vh of sticky scroll
      // Card slots: 0–2.5, 2.5–5.0, 5.0–7.5, 7.5–10
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

      [0, 2.5, 5.0, 7.5].forEach((inAt, i) => {
        const outAt = i < 3 ? inAt + 2.0 : null;
        // Card opacity/position
        tl.fromTo(cards[i],
          { opacity: 0, y: 44, scale: 0.97 },
          { opacity: 1, y: 0,  scale: 1,    duration: 0.5 }, inAt);
        if (outAt) tl.to(cards[i], { opacity: 0, y: -44, scale: 0.97, duration: 0.5 }, outAt);
        // Progress dot
        tl.fromTo(dots[i],
          { scaleX: 1,   opacity: 0.22 },
          { scaleX: 3.5, opacity: 1,    duration: 0.5 }, inAt);
        if (outAt) tl.to(dots[i], { scaleX: 1, opacity: 0.22, duration: 0.5 }, outAt);
      });

      tl.set({}, {}, 10); // pad to 10 so card 4 has hold time

      // The card entry progress thresholds (0–1) for char animation
      const ENTRY_P = [0, 0.25, 0.50, 0.75];

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start:   "top top",
        end:     "bottom bottom", // 500vh section → 400vh of sticky scroll
        scrub:   1,
        animation: tl,
        onUpdate(self) {
          const p = self.progress;
          ENTRY_P.forEach((ep, i) => {
            if (p >= ep + 0.01 && !charDoneRef.current[i]) {
              charDoneRef.current[i] = true;
              animateChars(cards[i]);
            }
            if (p < ep) charDoneRef.current[i] = false; // reset on scroll-back
          });
        },
      });
    }, sectionRef);

    return () => gctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Tall scroll container — CSS sticky does the pinning ─────────── */
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

        /* ── Canvas ──────────────────────────────────────────────────────── */
        #water-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          cursor: crosshair;
        }

        /* ── Vignette ─────────────────────────────────────────────────────── */
        .un-vig {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(
            ellipse 80% 80% at 50% 50%,
            transparent 18%,
            rgba(2,4,2,0.78) 100%
          );
        }

        /* ── Cards stage ─────────────────────────────────────────────────── */
        .un-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }

        /* ── Card — styled after the reference screenshot ─────────────────
           Dark glass, deep shadow, Cormorant text, no border-radius to match
           that architectural panel feel. Corner brackets replace a full border. */
        .un-card {
          position: absolute;
          width: min(540px, 88vw);
          padding: 48px 52px 52px;
          background: rgba(3, 6, 3, 0.68);
          backdrop-filter: blur(18px) saturate(1.3);
          -webkit-backdrop-filter: blur(18px) saturate(1.3);
          box-shadow:
            0 32px 80px rgba(0,0,0,0.72),
            0 8px 24px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.05);
          border-radius: 3px;
          will-change: transform, opacity;
          transform-style: preserve-3d;
          pointer-events: all;
          cursor: none;
        }

        /* Chartreuse L-brackets (bounding-box aesthetic from reference) */
        .un-card::before,
        .un-card::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
        }
        .un-card::before {
          top: -1px; left: -1px;
          border-top:  1.5px solid rgba(127,255,0,0.65);
          border-left: 1.5px solid rgba(127,255,0,0.65);
        }
        .un-card::after {
          bottom: -1px; right: -1px;
          border-bottom: 1.5px solid rgba(127,255,0,0.65);
          border-right:  1.5px solid rgba(127,255,0,0.65);
        }

        /* Dim white border around full card */
        .un-card-border {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 3px;
          pointer-events: none;
        }

        /* ── Label ────────────────────────────────────────────────────────── */
        .un-label {
          font-family: var(--font-sans);
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(127,255,0,0.60);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .un-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(127,255,0,0.18);
        }

        /* ── Quote text — mirrors the reference screenshot typography ─────── */
        .un-text {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          font-size: clamp(22px, 2.4vw, 30px);
          color: rgba(255,255,255,0.84);
          line-height: 1.52;
          letter-spacing: -0.02em;
          margin: 0;
          /* no word-break — let the split spans handle it */
        }

        /* Individual character spans for dancy typed animation */
        .un-ch {
          display: inline-block;
          opacity: 0; /* starts hidden; GSAP reveals on entry */
          will-change: transform, opacity;
        }

        /* ── Rule ─────────────────────────────────────────────────────────── */
        .un-rule {
          width: 32px;
          height: 1px;
          background: rgba(127,255,0,0.38);
          margin-top: 28px;
        }

        /* ── Progress dots ────────────────────────────────────────────────── */
        .un-dots {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .un-dot {
          width: 6px;
          height: 2px;
          border-radius: 1px;
          background: rgba(127,255,0,0.50);
          transform-origin: left center;
          will-change: transform, opacity;
        }

        @media (max-width: 767px) {
          .un-card { padding: 32px 28px 36px; }
          .un-text  { font-size: 20px; }
          .un-dots  { bottom: 20px; }
        }
      `}</style>

      {/* ── 500vh scroll container with CSS sticky inner ───────────────────── */}
      <section id="user-needs" ref={sectionRef}>
        <div className="un-sticky">

          {/* WebGL water canvas */}
          <canvas ref={canvasRef} id="water-bg" />

          {/* Radial vignette */}
          <div className="un-vig" />

          {/* Cards */}
          <div className="un-stage">
            {CARDS.map((card, i) => (
              <div
                key={i}
                className="un-card"
                ref={(el) => (cardRefs.current[i] = el)}
              >
                <div className="un-card-border" />
                <div className="un-label">{card.label}</div>
                {/* Text split into individual character spans for the dancy effect */}
                <p className="un-text" aria-label={card.text}>
                  {card.text.split("").map((ch, j) =>
                    ch === " "
                      ? <span key={j}>&nbsp;</span>
                      : <span key={j} className="un-ch">{ch}</span>
                  )}
                </p>
                <div className="un-rule" />
              </div>
            ))}
          </div>

          {/* Progress indicator */}
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
