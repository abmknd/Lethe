import { useState, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import demoThumb from "../assets/a70a950bf7228e76ca10f85df8f58e89c216f662.png";
import LetheLogo from "../imports/LetheLogo";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [showHeroSuccess, setShowHeroSuccess] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [isSubmitting1, setIsSubmitting1] = useState(false);
  const [isSubmitting2, setIsSubmitting2] = useState(false);
  const [showDemoOverlay, setShowDemoOverlay] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [demoCodeError, setDemoCodeError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const demoWrapRef = useRef<HTMLDivElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbRef = useRef<HTMLImageElement>(null);
  const playOverlayRef = useRef<HTMLDivElement>(null);

  const ls1Ref = useRef<HTMLSpanElement>(null);
  const ls2Ref = useRef<HTMLSpanElement>(null);
  const ls3Ref = useRef<HTMLSpanElement>(null);
  const ls4Ref = useRef<HTMLSpanElement>(null);

  const navigate = useNavigate();

  const MC_URL = "https://gmail.us22.list-manage.com/subscribe/post?u=c4d6d5b0d24bc275d3ce10296&id=e6473f0143&f_id=00b2c2e1f0";

  const handleHeroSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email1) return;
    setIsSubmitting1(true);
    const fd = new FormData();
    fd.append("EMAIL", email1);
    fd.append("b_c4d6d5b0d24bc275d3ce10296_e6473f0143", "");
    try {
      await fetch(MC_URL, { method: "POST", mode: "no-cors", body: fd });
    } catch (_) {
      // no-cors opaque response — treat as success
    }
    setShowHeroSuccess(true);
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email2) return;
    setIsSubmitting2(true);
    const fd = new FormData();
    fd.append("EMAIL", email2);
    fd.append("b_c4d6d5b0d24bc275d3ce10296_e6473f0143", "");
    try {
      await fetch(MC_URL, { method: "POST", mode: "no-cors", body: fd });
    } catch (_) {
      // no-cors opaque response — treat as success
    }
    setShowSignupSuccess(true);
  };

  const handlePlayDemo = () => {
    if (videoRef.current && thumbRef.current && playOverlayRef.current && demoWrapRef.current) {
      thumbRef.current.style.display = "none";
      playOverlayRef.current.style.display = "none";
      videoRef.current.style.display = "block";
      demoWrapRef.current.style.transform = "none";
      demoWrapRef.current.style.transition = "transform .4s ease";
      videoRef.current.play().catch(() => {
        // If video fails to play, show thumbnail again
        if (thumbRef.current && playOverlayRef.current && videoRef.current) {
          thumbRef.current.style.display = "block";
          playOverlayRef.current.style.display = "flex";
          videoRef.current.style.display = "none";
        }
      });
    }
  };

  // Water canvas effect
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    const resize = () => {
      W = cvs.width = window.innerWidth;
      H = cvs.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Ripple {
      x: number;
      y: number;
      r: number;
      max: number;
      speed: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.r = 0;
        this.max = 80 + Math.random() * 60;
        this.speed = 1.2 + Math.random() * 0.9;
      }

      get alive() {
        return this.r < this.max;
      }

      get alpha() {
        return 0.28 * (1 - this.r / this.max);
      }

      tick() {
        this.r += this.speed;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        c.strokeStyle = `rgba(173,255,47,${this.alpha})`;
        c.lineWidth = 0.6 * (1 - (this.r / this.max) * 0.4);
        c.stroke();
      }
    }

    let ripples: Ripple[] = [];
    let lastRipple = 0;
    let gx = -1000,
      gy = -1000,
      ga = 0;
    let mx = -1000,
      my = -1000,
      moving = false,
      moveTimer: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      moving = true;
      clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => (moving = false), 150);
      const now = Date.now();
      if (now - lastRipple > 72) {
        ripples.push(new Ripple(e.clientX, e.clientY));
        lastRipple = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#040604");
      bg.addColorStop(1, "#020402");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      gx += (mx - gx) * 0.065;
      gy += (my - gy) * 0.065;
      ga += ((moving ? 1 : 0) - ga) * 0.04;

      if (ga > 0.01) {
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 200);
        g.addColorStop(0, `rgba(173,255,47,${0.04 * ga})`);
        g.addColorStop(1, "rgba(173,255,47,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(gx, gy, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      ripples = ripples.filter((r) => r.alive);
      ripples.forEach((r) => {
        r.tick();
        r.draw(ctx);
      });

      requestAnimationFrame(loop);
    }

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Custom cursor
  useEffect(() => {
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    let lx = 0,
      ly = 0,
      tdx = 0,
      tdy = 0;

    const handleMouseMove = (e: MouseEvent) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      tdx = e.clientX;
      tdy = e.clientY;
    };

    function lerpRing() {
      if (!ring) return;
      lx += (tdx - lx) * 0.11;
      ly += (tdy - ly) * 0.11;
      ring.style.left = lx + "px";
      ring.style.top = ly + "px";
      requestAnimationFrame(lerpRing);
    }

    document.addEventListener("mousemove", handleMouseMove);
    lerpRing();

    const handleMouseEnter = () => {
      dot.classList.add("hover");
      ring.classList.add("hover");
    };

    const handleMouseLeave = () => {
      dot.classList.remove("hover");
      ring.classList.remove("hover");
    };

    const interactives = document.querySelectorAll(
      "a,button,input,.lethe-product-card,.lethe-demo-card"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // GSAP Hero animations
  useEffect(() => {
    gsap.to(".lethe-hero-eyebrow", { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
    gsap.to(".lethe-hero-h1", { opacity: 1, y: 0, duration: 0.9, delay: 0.35 });
    gsap.to(".lethe-hero-h2", { opacity: 1, y: 0, duration: 0.9, delay: 0.5 });
    gsap.to(".lethe-hero-sub", { opacity: 1, y: 0, duration: 0.9, delay: 0.65 });
    gsap.to(".lethe-hero-form", { opacity: 1, y: 0, duration: 0.9, delay: 0.8 });
    gsap.to(".lethe-hero-meta", { opacity: 1, y: 0, duration: 0.9, delay: 0.95 });
  }, []);


  // Typewriter story
  useEffect(() => {
    const stories = [
      {
        l1: "Most platforms are built",
        l2: "to keep you scrolling.",
        l3: "Lethe is built to send you home.",
        l4: null,
      },
      {
        l1: "The people you need",
        l2: "are already out there.",
        l3: null,
        l4: "Up to five introductions a week, matched to who you actually are.",
      },
      {
        l1: "The feed ends.",
        l2: "That is the point.",
        l3: null,
        l4: "Sixty posts. A quiet sign-off. Then back to your own life.",
      },
      {
        l1: "Networking without",
        l2: "the performance.",
        l3: null,
        l4: "We live and Lethe live.",
      },
    ];
    let storyIdx = 0;
    const refs = [ls1Ref, ls2Ref, ls3Ref, ls4Ref];

    function typeText(
      el: HTMLSpanElement,
      text: string | null,
      cb: () => void
    ) {
      el.textContent = "";
      if (!text) {
        if (cb) cb();
        return;
      }
      let i = 0;
      const cursor = document.createElement("span");
      cursor.className = "lethe-cursor-blink";
      el.appendChild(cursor);
      const t = setInterval(() => {
        cursor.before(text[i]);
        i++;
        if (i >= text.length) {
          clearInterval(t);
          setTimeout(() => {
            cursor.remove();
            if (cb) cb();
          }, 400);
        }
      }, 38);
    }

    function playStory() {
      const s = stories[storyIdx % stories.length];
      const lines = [s.l1, s.l2, s.l3, s.l4];
      refs.forEach((ref) => {
        if (ref.current) ref.current.textContent = "";
      });
      let idx = 0;
      function next() {
        if (idx >= 4) {
          setTimeout(() => {
            storyIdx++;
            playStory();
          }, 3200);
          return;
        }
        const el = refs[idx].current;
        if (el) {
          typeText(el, lines[idx], () => {
            idx++;
            setTimeout(next, lines[idx - 1] ? 180 : 0);
          });
        }
      }
      next();
    }

    ScrollTrigger.create({
      trigger: "#lethe-story",
      start: "top 70%",
      once: true,
      onEnter: playStory,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".lethe-reveal").forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  // Demo parallax
  useEffect(() => {
    const wrap = demoWrapRef.current;
    if (!wrap) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#lethe-demo",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
        onUpdate: (self) => {
          const prog = self.progress;
          const yOffset = -50 * prog;
          const tilt = (prog - 0.5) * 4;
          const scale = 0.95 + (0.05 * (1 - Math.abs(prog - 0.5) * 2));
          wrap.style.transform = `translateY(${yOffset}px) rotateX(${tilt}deg) scale(${scale})`;
          wrap.style.transformStyle = "preserve-3d";
        },
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Drag scroll
  useEffect(() => {
    const track = cardsTrackRef.current;
    if (!track) return;

    let isDown = false,
      startX = 0,
      scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      track.classList.add("dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      track.classList.remove("dragging");
    };

    const handleMouseUp = () => {
      isDown = false;
      track.classList.remove("dragging");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.4;
    };

    const handleScroll = () => {
      const cards = track.querySelectorAll(".lethe-product-card");
      const center = track.scrollLeft + track.offsetWidth / 2;
      cards.forEach((card) => {
        const el = card as HTMLElement;
        const dist =
          (el.offsetLeft + el.offsetWidth / 2 - center) / track.offsetWidth;
        el.style.transform = `rotate(${dist * 4}deg) translateY(${Math.abs(dist) * 18}px)`;
      });
    };

    let tx = 0,
      tsl = 0;
    const handleTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].pageX;
      tsl = track.scrollLeft;
    };
    const handleTouchMove = (e: TouchEvent) => {
      track.scrollLeft = tsl - (e.touches[0].pageX - tx);
    };

    track.addEventListener("mousedown", handleMouseDown);
    track.addEventListener("mouseleave", handleMouseLeave);
    track.addEventListener("mouseup", handleMouseUp);
    track.addEventListener("mousemove", handleMouseMove);
    track.addEventListener("scroll", handleScroll);
    track.addEventListener("touchstart", handleTouchStart, { passive: true });
    track.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      track.removeEventListener("mousedown", handleMouseDown);
      track.removeEventListener("mouseleave", handleMouseLeave);
      track.removeEventListener("mouseup", handleMouseUp);
      track.removeEventListener("mousemove", handleMouseMove);
      track.removeEventListener("scroll", handleScroll);
      track.removeEventListener("touchstart", handleTouchStart);
      track.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --ch: #7FFF00;
          --ch-dim: rgba(127,255,0,0.15);
          --dark: #050705;
          --dark2: #0a0d0a;
          --border: rgba(255,255,255,0.07);
          --text: rgba(255,255,255,0.88);
          --dim: rgba(255,255,255,0.42);
          --ghost: rgba(255,255,255,0.16);
          --serif: 'Cormorant Garamond', serif;
          --mono: 'DM Mono', monospace;
          --sans-serif: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--dark);
          color: var(--text);
          font-family: var(--serif);
          overflow-x: hidden;
          cursor: none;
        }

        /* ── Custom cursor ── */
        #lethe-cur-dot {
          position: fixed; width: 5px; height: 5px;
          background: rgba(173,255,47,0.85); border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%,-50%);
          mix-blend-mode: screen; transition: width .22s, height .22s;
        }
        #lethe-cur-ring {
          position: fixed; width: 32px; height: 32px;
          border: 1px solid rgba(173,255,47,0.2); border-radius: 50%;
          pointer-events: none; z-index: 9998;
          transform: translate(-50%,-50%);
          transition: width .3s, height .3s, border-color .3s;
        }
        #lethe-cur-dot.hover  { width: 10px; height: 10px; }
        #lethe-cur-ring.hover { width: 48px; height: 48px; border-color: rgba(173,255,47,0.4); }

        /* ── Water canvas ── */
        #lethe-water-canvas {
          position: fixed; inset: 0;
          width: 100%; height: 100%;
          z-index: 0; pointer-events: none;
        }

        /* ── Noise overlay ── */
        .lethe-noise {
          position: fixed; inset: 0; opacity: 0.022; pointer-events: none; z-index: 2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── NAV ── */
        .lethe-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px; padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(5,7,5,0.88); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        @media (min-width: 640px) {
          .lethe-nav { padding: 0 40px; }
        }
        .lethe-nav-logo {
          font-family: var(--serif); font-size: 14px; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--text); text-decoration: none;
          transition: opacity .3s;
        }
        .lethe-nav-logo:hover { opacity: 0.7; }
        .lethe-nav-links { display: flex; align-items: center; gap: 32px; }
        .lethe-nav-links a {
          font-family: var(--sans-serif); font-size: 11px; letter-spacing: .25em;
          text-transform: uppercase; color: var(--dim);
          text-decoration: none; transition: opacity .3s;
          padding: 6px 8px;
        }
        .lethe-nav-links a:hover { opacity: 0.7; }
        .lethe-nav-cta {
          font-family: var(--sans-serif); font-size: 11px; letter-spacing: .2em;
          text-transform: uppercase; color: var(--ch); font-weight: 300;
          background: transparent; border: 1px solid var(--ch); border-radius: 9999px;
          padding: 6px 16px;
          text-decoration: none; transition: all .3s;
          display: inline-block;
        }
        .lethe-nav-cta:hover { 
          background: rgba(127, 255, 0, 0.15); 
          color: var(--ch);
        }

        /* ── HERO ── */
        #lethe-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 48px 100px;
          position: relative; overflow: hidden;
          text-align: center; z-index: 3;
        }
        .lethe-hero-eyebrow {
          font-family: var(--mono); font-size: 11px; letter-spacing: .32em;
          text-transform: uppercase; color: rgba(173,255,47,0.55);
          margin-bottom: 32px; opacity: 0;
        }
        .lethe-hero-h1 {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 300; font-style: italic;
          line-height: 1.0; letter-spacing: -.03em;
          color: rgba(255,255,255,0.92); margin-bottom: 8px; opacity: 0;
        }
        .lethe-hero-h1 em { font-style: normal; color: var(--ch); }
        .lethe-hero-h2 {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 300; line-height: 1.0; letter-spacing: -.03em;
          color: rgba(255,255,255,0.28); margin-bottom: 40px; opacity: 0;
        }
        .lethe-hero-sub {
          font-size: clamp(15px, 1.8vw, 18px); font-weight: 300;
          line-height: 1.75; letter-spacing: .02em;
          color: var(--dim); max-width: 540px; margin-bottom: 52px; opacity: 0;
        }
        .lethe-hero-sub em { color: rgba(255,255,255,0.62); font-style: italic; }
        .lethe-hero-form {
          display: flex; max-width: 460px; width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border); border-radius: 28px;
          overflow: hidden; padding: 5px; opacity: 0;
        }
        .lethe-hero-form input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: var(--mono); font-size: 13px; letter-spacing: .04em;
          color: var(--text); padding: 12px 18px;
        }
        .lethe-hero-form input::placeholder { color: var(--ghost); }
        .lethe-hero-form button {
          font-family: var(--mono); font-size: 11px; letter-spacing: .3em;
          text-transform: uppercase; color: #6B6B6B;
          background: transparent; border: none; border-radius: 22px;
          padding: 12px 24px; cursor: none; transition: all .3s; white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
        }
        .lethe-hero-form button:hover { color: var(--ch); }
        .lethe-hero-meta {
          margin-top: 22px; display: flex; flex-direction: column;
          align-items: center; gap: 24px; opacity: 0;
        }
        .lethe-waitlist {
          font-family: var(--mono); font-size: 11px;
          letter-spacing: .14em; color: var(--ghost);
        }
        .lethe-waitlist span { color: rgba(173,255,47,0.5); }
        .lethe-scroll-hint {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .lethe-scroll-hint span {
          font-family: var(--mono); font-size: 10px; letter-spacing: .22em;
          text-transform: uppercase; color: var(--ghost);
        }
        .lethe-scroll-line {
          width: 1px; height: 36px;
          background: linear-gradient(to bottom, rgba(173,255,47,0.4), transparent);
          animation: letheScrollDrop 2s ease-in-out infinite;
        }
        @keyframes letheScrollDrop {
          0%, 100% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          40%, 60%  { opacity: 1; transform: scaleY(1); }
        }

        /* ── STORY (typewriter section) ── */
        #lethe-story {
          padding: 140px 48px;
          display: flex; align-items: center; justify-content: center;
          background: #020402;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          position: relative; overflow: hidden; z-index: 3;
          min-height: 60vh;
        }
        .lethe-story-inner { max-width: 860px; text-align: center; }
        .lethe-story-line {
          display: block; min-height: 1.4em;
          font-size: clamp(24px, 3.2vw, 44px);
          font-weight: 300; line-height: 1.35; letter-spacing: -.01em;
          margin-bottom: 8px;
        }
        .lethe-story-line.dim    { color: rgba(255,255,255,0.22); }
        .lethe-story-line.bright { color: rgba(255,255,255,0.88); }
        .lethe-story-line.accent { color: var(--ch); font-style: italic; }
        .lethe-story-line.small  { font-size: clamp(15px, 1.8vw, 20px); color: var(--dim); font-style: italic; margin-top: 8px; }
        .lethe-cursor-blink {
          display: inline-block; width: 2px; height: 1em;
          background: var(--ch); margin-left: 3px; vertical-align: middle;
          animation: letheBlink .8s step-end infinite;
        }
        @keyframes letheBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── HOW IT WORKS ── */
        #lethe-how {
          padding: 120px 48px;
          max-width: 1200px; margin: 0 auto;
          position: relative; z-index: 3;
        }
        .lethe-section-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: .3em;
          text-transform: uppercase; color: rgba(173,255,47,0.5);
          margin-bottom: 64px; display: block;
        }
        .lethe-steps {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
        }
        .lethe-step {
          padding: 48px 40px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          position: relative; overflow: hidden;
          transition: background .3s;
        }
        .lethe-step:first-child { border-radius: 20px 0 0 20px; }
        .lethe-step:last-child  { border-radius: 0 20px 20px 0; }
        .lethe-step:hover { background: rgba(255,255,255,0.042); }
        .lethe-step::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          background: radial-gradient(circle at 30% 30%, rgba(173,255,47,0.06), transparent 60%);
          transition: opacity .4s;
        }
        .lethe-step:hover::before { opacity: 1; }
        .lethe-step-num {
          font-family: var(--mono); font-size: 11px; letter-spacing: .2em;
          color: rgba(173,255,47,0.4); margin-bottom: 28px; display: block;
        }
        .lethe-step-title {
          font-size: 28px; font-weight: 300; font-style: italic;
          color: var(--text); margin-bottom: 16px; line-height: 1.2;
        }
        .lethe-step-body {
          font-size: 15px; font-weight: 300; line-height: 1.85;
          color: var(--dim); letter-spacing: .02em;
        }
        .lethe-step-body strong { color: rgba(255,255,255,0.65); font-weight: 400; }

        /* ── DEMO ── */
        #lethe-demo {
          padding: 120px 48px;
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 3;
        }
        .lethe-demo-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: .3em;
          text-transform: uppercase; color: rgba(173,255,47,0.5);
          margin-bottom: 24px;
        }
        .lethe-demo-title {
          font-size: clamp(32px, 4vw, 56px); font-weight: 300; font-style: italic;
          line-height: 1.1; letter-spacing: -.02em; color: var(--text);
          margin-bottom: 56px; text-align: center;
        }
        .lethe-demo-wrap {
          width: 100%; max-width: 900px;
          position: relative;
          will-change: transform;
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .lethe-demo-card {
          position: relative;
          border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 40px 100px rgba(0,0,0,0.7),
            0 0 0 1px rgba(255,255,255,0.06),
            0 0 80px rgba(173,255,47,0.06);
          cursor: none;
          transition: box-shadow .4s;
        }
        .lethe-demo-card:hover {
          box-shadow:
            0 48px 120px rgba(0,0,0,0.8),
            0 0 0 1px rgba(173,255,47,0.12),
            0 0 100px rgba(173,255,47,0.1);
        }
        .lethe-demo-thumb {
          width: 100%; display: block;
          aspect-ratio: 16/9; object-fit: cover;
          background: #0a0d0a;
        }
        .lethe-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(2,4,2,0.3);
          transition: background .3s;
        }
        .lethe-play-overlay:hover { background: rgba(2,4,2,0.15); }
        .lethe-play-btn {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(173,255,47,0.12);
          border: 1.5px solid rgba(173,255,47,0.4);
          display: flex; align-items: center; justify-content: center;
          transition: all .35s; backdrop-filter: blur(8px);
        }
        .lethe-play-overlay:hover .lethe-play-btn {
          background: rgba(173,255,47,0.22);
          border-color: rgba(173,255,47,0.7);
          transform: scale(1.1);
        }
        .lethe-play-btn svg { margin-left: 4px; width: 24px; height: 24px; }
        .lethe-demo-card::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%);
        }
        .lethe-demo-video {
          display: none; width: 100%; aspect-ratio: 16/9;
        }

        .lethe-view-demo-btn {
          display: inline-block; margin-top: 24px;
          font-family: var(--mono); font-size: 11px; letter-spacing: .2em;
          text-transform: uppercase; color: rgba(173,255,47,0.4);
          background: transparent; border: 1px solid rgba(173,255,47,0.25);
          border-radius: 22px; padding: 12px 28px; cursor: none;
          transition: color .25s, border-color .25s, background .25s;
        }
        .lethe-view-demo-btn:hover {
          color: rgba(173,255,47,1);
          border-color: rgba(173,255,47,0.8);
          background: rgba(173,255,47,0.08);
        }

        .lethe-demo-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: #0a0a0a;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px;
        }
        .lethe-demo-overlay-close {
          position: absolute; top: 28px; right: 32px;
          font-family: var(--mono); font-size: 18px; line-height: 1;
          color: rgba(255,255,255,0.35); background: transparent; border: none;
          cursor: none; transition: color .2s; padding: 8px;
        }
        .lethe-demo-overlay-close:hover { color: rgba(255,255,255,0.75); }
        .lethe-demo-overlay-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--serif); font-size: 13px; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: rgba(255,255,255,0.6); margin-bottom: 52px;
        }
        .lethe-demo-overlay-glow {
          position: absolute; width: 480px; height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(173,255,47,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .lethe-demo-overlay-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 0;
          max-width: 400px; width: 100%; text-align: center;
        }
        .lethe-demo-overlay-h {
          font-family: var(--serif); font-size: clamp(28px,4vw,42px);
          font-weight: 300; font-style: italic; line-height: 1.1;
          color: var(--text); margin-bottom: 14px;
        }
        .lethe-demo-overlay-sub {
          font-family: var(--mono); font-size: 12px; letter-spacing: .08em;
          color: var(--dim); margin-bottom: 36px;
        }
        .lethe-demo-overlay-form {
          display: flex; gap: 10px; width: 100%; max-width: 360px;
          margin-bottom: 14px;
        }
        .lethe-demo-overlay-form input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 22px; padding: 12px 20px;
          font-family: var(--mono); font-size: 12px; letter-spacing: .06em;
          color: var(--text); outline: none;
          transition: border-color .2s;
        }
        .lethe-demo-overlay-form input::placeholder { color: var(--ghost); }
        .lethe-demo-overlay-form input:focus { border-color: rgba(173,255,47,0.35); }
        .lethe-demo-overlay-form button {
          font-family: var(--mono); font-size: 11px; letter-spacing: .2em;
          text-transform: uppercase; color: #050705;
          background: rgba(173,255,47,0.85); border: none;
          border-radius: 22px; padding: 12px 22px;
          cursor: none; transition: background .2s; white-space: nowrap;
        }
        .lethe-demo-overlay-form button:hover { background: rgba(173,255,47,1); }
        .lethe-demo-overlay-error {
          font-family: var(--mono); font-size: 11px; letter-spacing: .06em;
          color: rgba(220,80,80,0.75); min-height: 16px;
        }

        /* ── SEE IT ── */
        #lethe-see {
          padding: 120px 0;
          overflow: hidden;
          position: relative; z-index: 3;
        }
        .lethe-see-header {
          padding: 0 48px; margin-bottom: 64px;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .lethe-see-title {
          font-size: clamp(36px, 5vw, 64px); font-weight: 300; font-style: italic;
          line-height: 1.1; letter-spacing: -.02em; color: var(--text);
        }
        .lethe-see-title em { color: var(--ch); font-style: normal; }
        .lethe-scroll-hint-h {
          font-family: var(--mono); font-size: 11px; letter-spacing: .18em;
          text-transform: uppercase; color: var(--ghost);
          display: flex; align-items: center; gap: 12px; padding-bottom: 8px;
        }
        .lethe-scroll-hint-h::after {
          content: '→'; font-size: 16px; color: rgba(173,255,47,0.5);
          animation: letheNudge 2s ease-in-out infinite;
        }
        @keyframes letheNudge { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }

        .lethe-cards-track {
          display: flex; gap: 20px;
          padding: 40px 48px 60px;
          overflow-x: auto; overflow-y: visible;
          scrollbar-width: none; cursor: grab;
        }
        .lethe-cards-track::-webkit-scrollbar { display: none; }
        .lethe-cards-track.dragging { cursor: grabbing; }

        .lethe-product-card {
          flex-shrink: 0; width: 320px;
          background: var(--dark2);
          border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          transition: transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s;
          transform-origin: bottom center;
        }
        .lethe-product-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(173,255,47,0.06);
          border-color: rgba(173,255,47,0.15);
        }
        .lethe-card-screen {
          width: 100%; height: 220px;
          background: #0d120d; position: relative; overflow: hidden;
        }

        /* Screen mockups */
        .lethe-screen-feed { background: linear-gradient(180deg,#080d08,#050705); padding: 16px; }
        .lethe-mock-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .lethe-mock-logo { width:36px; height:7px; background:rgba(255,255,255,0.5); border-radius:2px; }
        .lethe-mock-search { width:90px; height:7px; background:rgba(255,255,255,0.1); border-radius:10px; }
        .lethe-mock-btn { width:28px; height:7px; background:rgba(173,255,47,0.3); border-radius:10px; }
        .lethe-mock-masonry { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
        .lethe-mock-post { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:8px; }
        .lethe-mock-post.tall { grid-row:span 2; }
        .lethe-mock-line { height:4px; background:rgba(255,255,255,0.12); border-radius:2px; margin-bottom:4px; }
        .lethe-mock-line.short { width:60%; }
        .lethe-mock-line.accent { background:rgba(173,255,47,0.25); width:40%; }
        .lethe-mock-arc { width:14px; height:14px; border-radius:50%; border:1.5px solid rgba(173,255,47,0.5); margin-top:6px; }

        .lethe-screen-fading { background:linear-gradient(180deg,#080d08,#050705); padding:16px; display:flex; flex-direction:column; gap:8px; }
        .lethe-fading-post { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; }
        .lethe-fading-post.blur .lethe-mock-line { filter:blur(1.5px); opacity:.4; }
        .lethe-fading-badge { font-family:var(--mono); font-size:8px; letter-spacing:.15em; color:rgba(204,153,51,0.7); margin-bottom:5px; text-transform:uppercase; }
        .lethe-fading-badge.faded { color:rgba(255,255,255,0.2); }

        .lethe-screen-depth { background:linear-gradient(175deg,#0c110c,#020402); padding:24px 20px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; }
        .lethe-depth-ripple { width:44px; height:44px; position:relative; display:flex; align-items:center; justify-content:center; }
        .lethe-depth-ripple::before,.lethe-depth-ripple::after { content:''; position:absolute; border-radius:50%; border:1px solid rgba(173,255,47,0.2); animation:letheMockRipple 2.4s ease-out infinite; }
        .lethe-depth-ripple::after { animation-delay:1.2s; }
        .lethe-depth-dot { width:5px; height:5px; border-radius:50%; background:rgba(173,255,47,0.5); }
        @keyframes letheMockRipple { 0%{width:5px;height:5px;opacity:.6} 100%{width:44px;height:44px;opacity:0} }
        .lethe-depth-text { font-family:var(--serif); font-size:13px; font-style:italic; font-weight:300; color:rgba(255,255,255,0.7); text-align:center; line-height:1.4; }
        .lethe-depth-btn-mock { font-family:var(--mono); font-size:8px; letter-spacing:.15em; text-transform:uppercase; color:rgba(173,255,47,0.6); border:1px solid rgba(173,255,47,0.2); padding:5px 14px; border-radius:12px; background:rgba(173,255,47,0.05); }

        .lethe-screen-connect { background:linear-gradient(180deg,#080d08,#050705); padding:16px; }
        .lethe-connect-cards { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .lethe-connect-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; overflow:hidden; }
        .lethe-connect-img { width:100%; height:60px; background:rgba(255,255,255,0.06); }
        .lethe-connect-info { padding:8px; }
        .lethe-connect-name { height:5px; background:rgba(255,255,255,0.3); border-radius:2px; width:70%; margin-bottom:4px; }
        .lethe-connect-tag { height:4px; background:rgba(173,255,47,0.2); border-radius:2px; width:45%; }
        .lethe-connect-actions { display:flex; gap:4px; padding:6px 8px; }
        .lethe-connect-match { flex:1; height:18px; background:rgba(255,255,255,0.08); border-radius:6px; }
        .lethe-connect-pass  { flex:1; height:18px; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.06); }

        .lethe-screen-profile { background:linear-gradient(180deg,#080d08,#050705); padding:16px; }
        .lethe-profile-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .lethe-profile-ava { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.12); }
        .lethe-profile-name-mock { height:6px; background:rgba(255,255,255,0.4); border-radius:2px; width:80px; margin-bottom:4px; }
        .lethe-profile-handle { height:4px; background:rgba(255,255,255,0.15); border-radius:2px; width:54px; }
        .lethe-profile-tabs { display:flex; gap:1px; margin-bottom:12px; }
        .lethe-ptab { flex:1; height:24px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:4px; display:flex; align-items:center; justify-content:center; }
        .lethe-ptab.active { background:rgba(173,255,47,0.08); border-color:rgba(173,255,47,0.18); }
        .lethe-ptab-label { height:4px; width:40px; background:rgba(255,255,255,0.15); border-radius:2px; }
        .lethe-ptab.active .lethe-ptab-label { background:rgba(173,255,47,0.4); }
        .lethe-profile-posts { display:flex; flex-direction:column; gap:6px; }
        .lethe-profile-post { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:6px; padding:8px; display:flex; justify-content:space-between; align-items:flex-end; }
        .lethe-profile-post.faded-post { opacity:.45; filter:blur(.3px); }
        .lethe-revive-btn { font-family:var(--mono); font-size:7px; letter-spacing:.12em; text-transform:uppercase; color:rgba(173,255,47,0.6); border:1px solid rgba(173,255,47,0.2); padding:3px 8px; border-radius:8px; white-space:nowrap; }

        .lethe-screen-matches { background:linear-gradient(180deg,#080d08,#050705); padding:16px; }
        .lethe-matches-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .lethe-matches-title-mock { height:6px; width:100px; background:rgba(255,255,255,0.3); border-radius:2px; }
        .lethe-matches-toggle { width:28px; height:14px; border-radius:7px; background:rgba(173,255,47,0.4); }
        .lethe-match-row { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:8px; margin-bottom:6px; }
        .lethe-match-ava { width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.1); flex-shrink:0; }
        .lethe-match-info { flex:1; }
        .lethe-match-name { height:5px; background:rgba(255,255,255,0.3); border-radius:2px; width:80%; margin-bottom:4px; }
        .lethe-match-date { height:4px; background:rgba(255,255,255,0.1); border-radius:2px; width:55%; }
        .lethe-match-status { font-family:var(--mono); font-size:7px; letter-spacing:.1em; padding:3px 7px; border-radius:8px; }
        .lethe-match-status.upcoming { background:rgba(173,255,47,0.12); color:rgba(173,255,47,0.7); }
        .lethe-match-status.met { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.35); }

        .lethe-card-label { padding:20px 22px 22px; }
        .lethe-card-tag { font-family:var(--mono); font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:rgba(173,255,47,0.45); margin-bottom:6px; display:block; }
        .lethe-card-title { font-size:20px; font-weight:300; font-style:italic; color:rgba(255,255,255,0.82); line-height:1.2; }

        /* ── SIGNUP ── */
        #lethe-signup {
          padding: 140px 48px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          background: #020402;
          border-top: 1px solid var(--border);
          position: relative; overflow: hidden; z-index: 3;
        }
        #lethe-signup::before {
          content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(173,255,47,0.06) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
        }
        .lethe-signup-pre { font-family:var(--mono); font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:rgba(173,255,47,0.45); margin-bottom:28px; }
        .lethe-signup-h { font-size:clamp(36px,5vw,68px); font-weight:300; font-style:italic; line-height:1.1; letter-spacing:-.02em; color:var(--text); margin-bottom:16px; }
        .lethe-signup-sub { font-size:15px; font-weight:300; line-height:1.7; color:var(--dim); max-width:440px; margin-bottom:52px; }
        .lethe-signup-form {
          display:flex; max-width:460px; width:100%;
          background:rgba(255,255,255,0.04); border:1px solid var(--border);
          border-radius:28px; overflow:hidden; padding:5px; position:relative; z-index:1;
        }
        .lethe-signup-form input { flex:1; background:transparent; border:none; outline:none; font-family:var(--mono); font-size:13px; letter-spacing:.04em; color:var(--text); padding:12px 18px; }
        .lethe-signup-form input::placeholder { color:var(--ghost); }
        .lethe-signup-form button { font-family:var(--mono); font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:#6B6B6B; background:transparent; border:none; border-radius:22px; padding:12px 24px; cursor:none; transition:all .3s; white-space:nowrap; display: flex; align-items: center; gap: 8px; }
        .lethe-signup-form button:hover { color:var(--ch); }
        .lethe-signup-note { margin-top:18px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; color:var(--ghost); position:relative; z-index:1; }
        .lethe-form-success { padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
        .lethe-form-success-title {
          font-family: var(--serif); font-size: 18px; font-style: italic;
          font-weight: 300; color: rgba(173,255,47,0.9); margin-bottom: 0;
          display: flex; align-items: center; justify-content: center; gap: 0; position: relative;
        }
        .lethe-form-success-sub {
          font-family: var(--mono); font-size: 12px; letter-spacing: .06em;
          color: var(--dim);
        }
        .lethe-confetti { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 0; height: 0; pointer-events: none; }
        .lethe-confetti span {
          position: absolute; width: 4px; height: 4px; border-radius: 1px;
          top: 50%; left: 50%; margin: -2px;
          animation: letheConfetti var(--dur, .65s) ease-out var(--delay, 0s) both;
        }
        @keyframes letheConfetti {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--tx,0px), var(--ty,-30px)) rotate(var(--rot,180deg)); opacity: 0; }
        }

        /* ── FOOTER ── */
        .lethe-footer {
          padding: 48px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--border); position: relative; z-index: 3;
        }
        .lethe-footer-logo { font-family:var(--serif); font-size:13px; font-weight:300; letter-spacing:.38em; text-transform:uppercase; color:var(--dim); }
        .lethe-footer-tag { font-family:var(--serif); font-size:14px; font-style:italic; font-weight:300; color:var(--ghost); }
        .lethe-footer-link { font-family:var(--mono); font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--ghost); text-decoration:none; transition:color .25s; }
        .lethe-footer-link:hover { color:var(--dim); }

        /* ── Scroll reveal ── */
        .lethe-reveal { opacity:0; transform:translateY(28px); transition:opacity .8s ease, transform .8s ease; }
        .lethe-reveal.visible { opacity:1; transform:translateY(0); }
        .lethe-reveal-d1 { transition-delay:.1s; }
        .lethe-reveal-d2 { transition-delay:.2s; }
        .lethe-reveal-d3 { transition-delay:.3s; }

        @media (max-width: 968px) {
          .lethe-steps { grid-template-columns: 1fr; gap: 16px; }
          .lethe-step:first-child { border-radius: 20px 20px 0 0; }
          .lethe-step:last-child { border-radius: 0 0 20px 20px; }
          .lethe-nav { padding: 0 24px; }
          .lethe-nav-links { gap: 20px; font-size: 10px; }
          .lethe-see-header { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:wght@300;400&display=swap"
        rel="stylesheet"
      />

      <canvas id="lethe-water-canvas" ref={canvasRef}></canvas>
      <div className="lethe-noise"></div>
      <div id="lethe-cur-dot" ref={cursorDotRef}></div>
      <div id="lethe-cur-ring" ref={cursorRingRef}></div>

      {/* NAV */}
      <nav className="lethe-nav">
        <button
          onClick={() => window.location.href = '#lethe-hero'}
          className="flex items-center gap-2 text-white text-sm tracking-[0.3em] uppercase font-light font-serif transition-colors duration-300 hover:opacity-70 cursor-pointer bg-transparent border-0"
          style={{ padding: 0 }}
        >
          <div className="w-5 h-5">
            <LetheLogo />
          </div>
          LETHE
        </button>
        <div className="lethe-nav-links">
          <a href="#lethe-how">HOW IT WORKS</a>
          <a href="#lethe-see">THE PRODUCT</a>
          <button
            onClick={() => {
              const el = document.getElementById('lethe-signup');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="border rounded-full text-[11px] tracking-[0.2em] uppercase font-light font-sans transition-all duration-300"
            style={{
              borderColor: '#7FFF00',
              color: '#7FFF00',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(127, 255, 0, 0.15)';
              e.currentTarget.style.color = '#7FFF00';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#7FFF00';
            }}
          >
            GET AN EARLY TASTE
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="lethe-hero">
        <p className="lethe-hero-eyebrow">Private beta — limited access</p>
        <h1 className="lethe-hero-h1">Networking without</h1>
        <h2 className="lethe-hero-h2">the performance.</h2>
        <p className="lethe-hero-sub">
          Up to five introductions a week, matched to who you actually are. A daily feed that ends. A network that compounds the longer you show up.
        </p>
        {!showHeroSuccess ? (
          <form className="lethe-hero-form" onSubmit={handleHeroSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="off"
              value={email1}
              onChange={(e) => setEmail1(e.target.value)}
            />
            <button type="submit" className="group" disabled={isSubmitting1}>
              <span>{isSubmitting1 ? "Joining..." : "Get an early taste"}</span>
              {!isSubmitting1 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />}
            </button>
          </form>
        ) : (
          <div className="lethe-form-success">
            <p className="lethe-form-success-title">
              <span className="lethe-confetti" aria-hidden="true">
                {([
                  { tx: "-8px", ty: "-28px", rot: "160deg", color: "#7FFF00", delay: "0s",    dur: ".6s"  },
                  { tx: "8px",  ty: "-30px", rot: "-140deg", color: "#ADFF2F", delay: ".05s",  dur: ".65s" },
                  { tx: "-14px",ty: "-18px", rot: "200deg",  color: "#DFFF00", delay: ".1s",   dur: ".55s" },
                  { tx: "14px", ty: "-20px", rot: "-180deg", color: "#7FFF00", delay: ".08s",  dur: ".7s"  },
                  { tx: "0px",  ty: "-32px", rot: "90deg",   color: "#ADFF2F", delay: ".12s",  dur: ".6s"  },
                  { tx: "-6px", ty: "-24px", rot: "-90deg",  color: "#DFFF00", delay: ".03s",  dur: ".68s" },
                ] as { tx: string; ty: string; rot: string; color: string; delay: string; dur: string }[]).map((p, i) => (
                  <span key={i} style={{ background: p.color, "--tx": p.tx, "--ty": p.ty, "--rot": p.rot, "--delay": p.delay, "--dur": p.dur } as React.CSSProperties} />
                ))}
              </span>
              {"You're now on the list."}
            </p>
            <p className="lethe-form-success-sub">We'll be in touch when the first batch opens.</p>
          </div>
        )}
        <div className="lethe-hero-meta">
          <p className="lethe-waitlist">
            Limited spots. Post-beta is invite only.
          </p>
          <div className="lethe-scroll-hint">
            <span>Scroll</span>
            <div className="lethe-scroll-line"></div>
          </div>
        </div>
      </section>

      {/* STORY (typewriter) */}
      <section id="lethe-story">
        <div className="lethe-story-inner">
          <span className="lethe-story-line dim" ref={ls1Ref}></span>
          <span className="lethe-story-line bright" ref={ls2Ref}></span>
          <span className="lethe-story-line accent" ref={ls3Ref}></span>
          <span className="lethe-story-line small" ref={ls4Ref}></span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="lethe-how">
        <span className="lethe-section-label lethe-reveal">How it works</span>
        <div className="lethe-steps">
          <div className="lethe-step lethe-reveal lethe-reveal-d1">
            <span className="lethe-step-num">01</span>
            <h3 className="lethe-step-title">Get introduced</h3>
            <p className="lethe-step-body">
              Lethe matches you with up to five people a week based on who you actually are, not who you perform to be. <strong>The feed gives you context.</strong> The match is the point.
            </p>
          </div>
          <div className="lethe-step lethe-reveal lethe-reveal-d2">
            <span className="lethe-step-num">02</span>
            <h3 className="lethe-step-title">Meet on your terms</h3>
            <p className="lethe-step-body">
              Set your availability, your frequency, your boundaries. Every introduction is a deliberate choice. <strong>You scan your weekly matches and choose who makes the cut.</strong>
            </p>
          </div>
          <div className="lethe-step lethe-reveal lethe-reveal-d3">
            <span className="lethe-step-num">03</span>
            <h3 className="lethe-step-title">Stay in the signal</h3>
            <p className="lethe-step-body">
              A daily edition of selected posts. Short-form, intentional, finite. It ends. <strong>That is the point.</strong> The feed exists so you show up knowing who you are meeting and why.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="lethe-demo">
        <p className="lethe-demo-label lethe-reveal">Watch a demo</p>
        <h2 className="lethe-demo-title lethe-reveal">See it in motion.</h2>
        <div className="lethe-demo-wrap lethe-reveal" ref={demoWrapRef}>
          <div className="lethe-demo-card">
            <img
              ref={thumbRef}
              className="lethe-demo-thumb"
              src={demoThumb}
              alt="Lethe demo"
            />
            <div
              className="lethe-play-overlay"
              ref={playOverlayRef}
              onClick={handlePlayDemo}
            >
              <div className="lethe-play-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14l11-7-11-7z" fill="rgba(173,255,47,0.9)" />
                </svg>
              </div>
            </div>
            <video 
              className="lethe-demo-video" 
              ref={videoRef} 
              controls
              onError={() => {
                // If video fails to load, keep thumbnail visible
                if (thumbRef.current && playOverlayRef.current && videoRef.current) {
                  thumbRef.current.style.display = "block";
                  playOverlayRef.current.style.display = "flex";
                  videoRef.current.style.display = "none";
                }
              }}
            >
              <source
                src="https://github.com/user-attachments/assets/2671d9df-961e-445e-9c31-8b6f566c1f15"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
        <button
          className="lethe-view-demo-btn"
          onClick={() => setShowDemoOverlay(true)}
        >
          View full demo
        </button>
        {showDemoOverlay && (
          <div className="lethe-demo-overlay">
            <div className="lethe-demo-overlay-glow" />
            <button
              className="lethe-demo-overlay-close"
              onClick={() => { setShowDemoOverlay(false); setDemoCode(""); setDemoCodeError(false); }}
              aria-label="Close"
            >
              ×
            </button>
            <div className="lethe-demo-overlay-logo">
              <div style={{ width: "18px", height: "18px" }}>
                <LetheLogo />
              </div>
              LETHE
            </div>
            <div className="lethe-demo-overlay-inner">
              <h2 className="lethe-demo-overlay-h">This is a preview.</h2>
              <p className="lethe-demo-overlay-sub">Enter the access code to continue.</p>
              <form
                className="lethe-demo-overlay-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (demoCode.trim().toLowerCase() === "lethelive") {
                    setShowDemoOverlay(false);
                    setDemoCode("");
                    setDemoCodeError(false);
                    navigate("/feed");
                  } else {
                    setDemoCodeError(true);
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Access code"
                  value={demoCode}
                  autoComplete="off"
                  autoFocus
                  onChange={(e) => { setDemoCode(e.target.value); setDemoCodeError(false); }}
                />
                <button type="submit">Enter</button>
              </form>
              <p className="lethe-demo-overlay-error">{demoCodeError ? "That's not it." : ""}</p>
            </div>
          </div>
        )}
      </section>

      {/* SEE IT */}
      <section id="lethe-see">
        <div className="lethe-see-header lethe-reveal">
          <h2 className="lethe-see-title">
            Meet people who
            <br />
            update your <em>priors.</em>
          </h2>
          <p className="lethe-scroll-hint-h">Drag to explore</p>
        </div>
        <div className="lethe-cards-track" ref={cardsTrackRef}>
          {/* Card 1: Connect */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen" style={{ background: "linear-gradient(180deg,#080d08,#050705)", display: "flex", flexDirection: "column", padding: "16px", gap: "10px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "rgba(127,255,0,0.6)", fontFamily: "monospace" }}>YOUR UPCOMING MATCHES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                {([
                  { day: "WED", date: "APR. 16", time: "5:00 pm BST" },
                  { day: "THU", date: "APR. 17", time: "12:00 pm BST" },
                  { day: "FRI", date: "APR. 18", time: "9:00 am BST" },
                  { day: "MON", date: "APR. 21", time: "6:00 pm BST" },
                ] as { day: string; date: string; time: string }[]).map(({ day, date, time }) => (
                  <div key={`${day}-${date}`} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "9px 10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "8px", letterSpacing: "0.1em", color: "rgba(127,255,0,0.75)", fontFamily: "monospace" }}>{day} {date}</span>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.15)", border: "1px solid rgba(127,255,0,0.3)" }}></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(127,255,0,0.8)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", fontFamily: "monospace" }}>{time}</span>
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Upcoming Match</div>
                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.28)", fontFamily: "monospace" }}>You have 5 meetings this week</div>
                  </div>
                ))}
              </div>
              <div style={{ width: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "9px 10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "8px", letterSpacing: "0.1em", color: "rgba(127,255,0,0.75)", fontFamily: "monospace" }}>TUE APR. 22</span>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.15)", border: "1px solid rgba(127,255,0,0.3)" }}></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(127,255,0,0.8)", flexShrink: 0 }}></div>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", fontFamily: "monospace" }}>2:00 pm BST</span>
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Upcoming Match</div>
                <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.28)", fontFamily: "monospace" }}>You have 5 meetings this week</div>
              </div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">Your weekly match</span>
              <p className="lethe-card-title">
                Up to five introductions a week, selected based on your behavioral signal. You choose who makes the cut.
              </p>
            </div>
          </div>

          {/* Card 2: Hyper-personalized matching */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen" style={{ background: "#0a0f0a", display: "flex", flexDirection: "column", padding: "20px", gap: "14px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(127,255,0,0.8)", fontFamily: "monospace", fontWeight: 500 }}>YOUR MATCH</div>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "15px", lineHeight: 1.45, color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>
                I want to meet people<br />
                <span style={{ color: "rgba(127,255,0,0.85)" }}>who...</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>Who they are</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>▾</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>Where they are based</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>▾</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <div style={{ flex: 1, background: "rgba(127,255,0,0.85)", borderRadius: "20px", padding: "7px 0", textAlign: "center", fontSize: "10px", letterSpacing: "0.1em", color: "#050705", fontFamily: "monospace", fontWeight: 600 }}>CONTINUE</div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "7px 0", textAlign: "center", fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>LATER</div>
              </div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">Your criteria</span>
              <p className="lethe-card-title">
                You choose who you meet. The more honest you are, the better the match.
              </p>
            </div>
          </div>

          {/* Card 3: Availability */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen" style={{ background: "#0a0f0a", display: "flex", flexDirection: "column", padding: "18px", gap: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>MEETING TIMES</span>
                <span style={{ fontSize: "9px", color: "rgba(127,255,0,0.7)", fontFamily: "monospace" }}>3 of 5 slots used</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                {([{ day: "MON", time: "7:00 AM", active: true }, { day: "TUE", time: null, active: false }, { day: "WED", time: "8:00 PM", active: true }, { day: "THU", time: null, active: false }] as { day: string; time: string | null; active: boolean }[]).map(({ day, time, active }) => (
                  <div key={day} style={{ background: active ? "rgba(127,255,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(127,255,0,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "8px 4px", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "8px", letterSpacing: "0.1em", color: active ? "rgba(127,255,0,0.9)" : "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{day}</span>
                    {time && <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>{time}</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                {([{ day: "FRI", time: null, active: false }, { day: "SAT", time: "10:00 AM", active: true }, { day: "SUN", time: null, active: false }] as { day: string; time: string | null; active: boolean }[]).map(({ day, time, active }) => (
                  <div key={day} style={{ background: active ? "rgba(127,255,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(127,255,0,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "8px 4px", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "8px", letterSpacing: "0.1em", color: active ? "rgba(127,255,0,0.9)" : "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{day}</span>
                    {time && <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>{time}</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>MEETING FREQUENCY</span>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 10px", fontSize: "9px", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>Every week ▾</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(["Meet local matches only", "Pause meetings"] as string[]).map((label) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{label}</span>
                    <div style={{ width: "26px", height: "14px", borderRadius: "7px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", position: "relative" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", position: "absolute", top: "1px", left: "2px" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">Your availability</span>
              <p className="lethe-card-title">
                Set when you show up. Pause anytime. Your meetings, your terms.
              </p>
            </div>
          </div>

          {/* Card 4: Daily edition */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen" style={{ background: "linear-gradient(180deg,#080d08,#050705)", display: "flex", flexDirection: "column", padding: "14px", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: "10px", padding: "3px 10px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em", color: "#050705", fontWeight: 600 }}>ALL</div>
                <div style={{ background: "transparent", borderRadius: "10px", padding: "3px 10px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>FOLLOWING</div>
                <div style={{ background: "transparent", borderRadius: "10px", padding: "3px 10px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>ECHOES</div>
                <div style={{ marginLeft: "auto", background: "rgba(127,255,0,0.15)", border: "1px solid rgba(127,255,0,0.3)", borderRadius: "10px", padding: "3px 10px", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em", color: "rgba(127,255,0,0.85)" }}>CREATE</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ height: "36px", background: "rgba(255,255,255,0.06)", borderRadius: "5px", marginBottom: "4px" }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.3)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>@elan</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>2h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Building in public takes courage.</div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 8</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 2</span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.2)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>@sira</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>4h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Most feedback is noise. The rest changes you.</div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 14</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 5</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.25)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>@nuri</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>1h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Attention is the only currency that matters.</div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 21</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 7</span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ height: "28px", background: "rgba(255,255,255,0.06)", borderRadius: "5px", marginBottom: "4px" }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.18)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>@mia</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>6h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Rest is not the opposite of work.</div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 6</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 1</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ height: "50px", background: "rgba(255,255,255,0.06)", borderRadius: "5px", marginBottom: "4px" }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(127,255,0,0.22)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace" }}>@haru</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>3h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Clarity is earned, not inherited.</div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 11</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">The daily edition</span>
              <p className="lethe-card-title">
                60 posts. A quiet end. Back to your own life.
              </p>
            </div>
          </div>

          {/* Card 5: Intentional scrolling */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen lethe-screen-depth">
              <div className="lethe-depth-ripple">
                <div className="lethe-depth-dot"></div>
              </div>
              <p className="lethe-depth-text">
                You've reached
                <br />
                the softened hours.
              </p>
              <div className="lethe-depth-btn-mock">Return to the present</div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">Intentional scrolling</span>
              <p className="lethe-card-title">
                The feed has a shape. Limited daily editions of selected posts. No doomscrolling.
              </p>
            </div>
          </div>

          {/* Card 6: Communities */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen" style={{ background: "#0a0f0a", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
              <div style={{ height: "48px", background: "linear-gradient(135deg, rgba(127,255,0,0.12) 0%, rgba(0,0,0,0) 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}></div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.88)", fontWeight: 600, letterSpacing: "0.01em", marginBottom: "3px" }}>Deep Work Guild</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>342 members · created by @nadia</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ background: "rgba(127,255,0,0.15)", border: "1px solid rgba(127,255,0,0.3)", borderRadius: "12px", padding: "4px 10px", fontSize: "9px", color: "rgba(127,255,0,0.9)", fontFamily: "monospace", letterSpacing: "0.08em" }}>INVITE</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
                      {([0, 1, 2] as number[]).map((i) => <div key={i} style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.35)" }}></div>)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 10px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", flexShrink: 0 }}></div>
                  <span style={{ flex: 1, fontSize: "10px", color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Share something with the guild...</span>
                  <div style={{ background: "rgba(127,255,0,0.85)", borderRadius: "6px", padding: "4px 8px", fontSize: "9px", color: "#050705", fontFamily: "monospace", fontWeight: 600 }}>POST</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", flexShrink: 0 }}></div>
                      <div>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "2px" }}>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>maren</span>
                          <span style={{ fontSize: "8px", background: "rgba(127,255,0,0.15)", color: "rgba(127,255,0,0.85)", border: "1px solid rgba(127,255,0,0.25)", borderRadius: "4px", padding: "1px 5px", fontFamily: "monospace", letterSpacing: "0.06em" }}>Admin</span>
                        </div>
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>2h ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="lethe-mock-line" style={{ width: "90%" }}></div>
                  <div className="lethe-mock-line short"></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>♡ 12</span>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>◯ 4</span>
                    </div>
                    <span style={{ fontSize: "8px", color: "rgba(127,255,0,0.6)", fontFamily: "monospace", letterSpacing: "0.08em" }}>PINNED</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">Your communities</span>
              <p className="lethe-card-title">
                Find your guild. Post to people who already get it.
              </p>
            </div>
          </div>

          {/* Card 7: Profile */}
          <div className="lethe-product-card">
            <div className="lethe-card-screen" style={{ background: "linear-gradient(180deg,#080d08,#050705)", display: "flex", flexDirection: "column", padding: "16px", gap: "12px", overflowY: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(127,255,0,0.5)", flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.88)", fontWeight: 600, marginBottom: "2px" }}>maren k.</div>
                  <div style={{ fontSize: "9px", color: "rgba(127,255,0,0.65)", fontFamily: "monospace" }}>@maren</div>
                </div>
                <div style={{ border: "1px solid rgba(127,255,0,0.4)", borderRadius: "12px", padding: "4px 10px", fontSize: "8px", color: "rgba(127,255,0,0.8)", fontFamily: "monospace", letterSpacing: "0.08em" }}>EDIT PROFILE</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Product designer. Building things that earn attention.</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>&#x25BE; London, UK</span>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>&#x25BE; she/her</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", fontFamily: "monospace", fontWeight: 600 }}>ALL POSTS 35</span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>FADED 2</span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>ECHOES 2</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ height: "40px", background: "rgba(255,255,255,0.06)" }}></div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(127,255,0,0.25)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "9px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace", fontWeight: 600 }}>maren k.</span>
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>1h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.45, marginBottom: "6px" }}>Some decisions age well. This one did.</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 9</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 2</span>
                    </div>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ height: "32px", background: "rgba(255,255,255,0.05)" }}></div>
                  <div style={{ padding: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(127,255,0,0.2)", flexShrink: 0 }}></div>
                      <span style={{ fontSize: "9px", color: "rgba(127,255,0,0.85)", fontFamily: "monospace", fontWeight: 600 }}>maren k.</span>
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>3h</span>
                    </div>
                    <div style={{ fontSize: "8px", fontStyle: "italic", color: "rgba(255,255,255,0.75)", lineHeight: 1.45, marginBottom: "6px" }}>The quieter the room, the better the work.</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>♡ 17</span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)" }}>◯ 4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lethe-card-label">
              <span className="lethe-card-tag">Your profile</span>
              <p className="lethe-card-title">
                See your full timeline. Revive anything. Your posts, your choice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNUP */}
      <section id="lethe-signup">
        <p className="lethe-signup-pre lethe-reveal">Private beta</p>
        <h2 className="lethe-signup-h lethe-reveal">Connect differently.</h2>
        <p className="lethe-signup-sub lethe-reveal">
          Lethe is in private beta. Be among the first to meet people who actually move the needle on how you think, work, and live.
        </p>
        {!showSignupSuccess ? (
          <form className="lethe-signup-form lethe-reveal" onSubmit={handleSignupSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="off"
              value={email2}
              onChange={(e) => setEmail2(e.target.value)}
            />
            <button type="submit" className="group" disabled={isSubmitting2}>
              <span>{isSubmitting2 ? "Joining..." : "Get an early taste"}</span>
              {!isSubmitting2 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />}
            </button>
          </form>
        ) : (
          <div className="lethe-form-success">
            <p className="lethe-form-success-title">
              <span className="lethe-confetti" aria-hidden="true">
                {([
                  { tx: "-8px", ty: "-28px", rot: "160deg",  color: "#7FFF00", delay: "0s",   dur: ".6s"  },
                  { tx: "8px",  ty: "-30px", rot: "-140deg", color: "#ADFF2F", delay: ".05s", dur: ".65s" },
                  { tx: "-14px",ty: "-18px", rot: "200deg",  color: "#DFFF00", delay: ".1s",  dur: ".55s" },
                  { tx: "14px", ty: "-20px", rot: "-180deg", color: "#7FFF00", delay: ".08s", dur: ".7s"  },
                  { tx: "0px",  ty: "-32px", rot: "90deg",   color: "#ADFF2F", delay: ".12s", dur: ".6s"  },
                  { tx: "-6px", ty: "-24px", rot: "-90deg",  color: "#DFFF00", delay: ".03s", dur: ".68s" },
                ] as { tx: string; ty: string; rot: string; color: string; delay: string; dur: string }[]).map((p, i) => (
                  <span key={i} style={{ background: p.color, "--tx": p.tx, "--ty": p.ty, "--rot": p.rot, "--delay": p.delay, "--dur": p.dur } as React.CSSProperties} />
                ))}
              </span>
              {"You're now on the list."}
            </p>
            <p className="lethe-form-success-sub">We'll be in touch when the first batch opens.</p>
          </div>
        )}
        <p className="lethe-signup-note lethe-reveal">
          No spam. No noise. Just a note when we're ready.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="lethe-footer">
        <span className="lethe-footer-logo">Lethe</span>
        <span className="lethe-footer-tag">
          Networking without the performance.
        </span>
        <a href="#" className="lethe-footer-link">
          LinkedIn ↗
        </a>
      </footer>
    </>
  );
}
