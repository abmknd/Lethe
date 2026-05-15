import { useState, useEffect, useRef, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import demoThumb from "../assets/a70a950bf7228e76ca10f85df8f58e89c216f662.png";
import ReletheLogo from "../imports/ReletheLogo";
import DiagnosticSection from "./components/DiagnosticSection";
import FoundingCohort from "./components/FoundingCohort";
import FoundingMember from "./components/FoundingMember";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [showHeroSuccess, setShowHeroSuccess] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showHeroDuplicate, setShowHeroDuplicate] = useState(false);
  const [showSignupDuplicate, setShowSignupDuplicate] = useState(false);
  const [isSubmitting1, setIsSubmitting1] = useState(false);
  const [isSubmitting2, setIsSubmitting2] = useState(false);
  const [diagnosticEmail, setDiagnosticEmail] = useState<string | null>(null);

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

  const getCountry = async (): Promise<string | null> => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return (data.country_name as string) ?? null;
    } catch {
      return null;
    }
  };

  const sendConfirmationEmail = async (email: string) => {
    try {
      await supabase.functions.invoke("send-confirmation", { body: { email } });
    } catch {
      // silently fail — confirmation email is best-effort
    }
  };

  const handleHeroSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email1) return;
    setIsSubmitting1(true);
    const country = await getCountry();
    const { error } = await supabase.from("waitlist").insert({ email: email1, country });
    if (error) {
      if (error.code === "23505") {
        setShowHeroDuplicate(true);
      } else {
        setIsSubmitting1(false);
      }
      return;
    }
    await sendConfirmationEmail(email1);
    setShowHeroSuccess(true);
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email2) return;
    setIsSubmitting2(true);
    const country = await getCountry();
    const { error } = await supabase.from("waitlist").insert({ email: email2, country });
    if (error) {
      if (error.code === "23505") {
        setShowSignupDuplicate(true);
      } else {
        setIsSubmitting2(false);
      }
      return;
    }
    await sendConfirmationEmail(email2);
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
    if (window.matchMedia('(pointer: coarse)').matches) return;
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

    let rafId: number;
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

      rafId = requestAnimationFrame(loop);
    }

    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(loop);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    loop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Custom cursor
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
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
      "a,button,input,.relethe-product-card,.relethe-demo-card"
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
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(".relethe-hero-eyebrow", { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
      gsap.to(".relethe-hero-h1", { opacity: 1, y: 0, duration: 0.9, delay: 0.35 });
      gsap.to(".relethe-hero-h2", { opacity: 1, y: 0, duration: 0.9, delay: 0.5 });
      gsap.to(".relethe-hero-sub", { opacity: 1, y: 0, duration: 0.9, delay: 0.65 });
      gsap.to(".relethe-hero-form", { opacity: 1, y: 0, duration: 0.9, delay: 0.8 });
      gsap.to(".relethe-hero-meta", { opacity: 1, y: 0, duration: 0.9, delay: 0.95 });
    } else {
      document.querySelectorAll('.relethe-hero-eyebrow, .relethe-hero-h1, .relethe-hero-h2, .relethe-hero-sub, .relethe-hero-form, .relethe-hero-meta')
        .forEach(el => { (el as HTMLElement).style.opacity = '1'; });
    }
  }, []);


  // Typewriter story
  useEffect(() => {
    const stories = [
      {
        l1: "Most platforms are built",
        l2: "to keep you scrolling.",
        l3: "Relethe is built to send you home.",
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
        l4: "Your network should compound the longer you show up.",
      },
    ];
    let storyIdx = 0;
    let paused = false;
    const refs = [ls1Ref, ls2Ref, ls3Ref, ls4Ref];
    const storySection = document.getElementById('relethe-story');
    if (storySection) {
      storySection.addEventListener('mouseenter', () => { paused = true; });
      storySection.addEventListener('mouseleave', () => { paused = false; });
    }

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
      cursor.className = "relethe-cursor-blink";
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
            if (!paused) { storyIdx++; playStory(); }
            else { setTimeout(() => { storyIdx++; playStory(); }, 500); }
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
      trigger: "#relethe-story",
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
      { threshold: 0.05 }
    );
    document.querySelectorAll(".relethe-reveal").forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  // Demo parallax
  useEffect(() => {
    const wrap = demoWrapRef.current;
    if (!wrap) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#relethe-demo",
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
      const cards = track.querySelectorAll(".relethe-product-card");
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
          --dim: rgba(255,255,255,0.60);
          --ghost: rgba(255,255,255,0.28);
          --serif: 'Cormorant Garamond', serif;
          --mono: 'DM Mono', monospace;
          --sans-serif: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
        #relethe-cur-dot {
          position: fixed; width: 5px; height: 5px;
          background: rgba(173,255,47,0.85); border-radius: 50%;
          pointer-events: none; z-index: 100001;
          transform: translate(-50%,-50%);
          mix-blend-mode: screen; transition: width .22s, height .22s;
        }
        #relethe-cur-ring {
          position: fixed; width: 32px; height: 32px;
          border: 1px solid rgba(173,255,47,0.2); border-radius: 50%;
          pointer-events: none; z-index: 100000;
          transform: translate(-50%,-50%);
          transition: width .3s, height .3s, border-color .3s;
        }
        #relethe-cur-dot.hover  { width: 10px; height: 10px; }
        #relethe-cur-ring.hover { width: 48px; height: 48px; border-color: rgba(173,255,47,0.4); }

        /* ── Water canvas ── */
        #relethe-water-canvas {
          position: fixed; inset: 0;
          width: 100%; height: 100%;
          z-index: 0; pointer-events: none;
        }

        /* ── Noise overlay ── */
        .relethe-noise {
          position: fixed; inset: 0; opacity: 0.022; pointer-events: none; z-index: 2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── NAV ── */
        .relethe-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px; padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(5,7,5,0.88); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        @media (min-width: 640px) {
          .relethe-nav { padding: 0 40px; }
        }
        .relethe-nav-logo {
          font-family: var(--serif); font-size: 14px; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--text); text-decoration: none;
          transition: opacity .3s;
        }
        .relethe-nav-logo:hover { opacity: 0.7; }
        .relethe-nav-links { display: flex; align-items: center; gap: 32px; }
        .relethe-nav-links a {
          font-family: var(--sans-serif); font-size: 11px; letter-spacing: .25em;
          text-transform: uppercase; color: var(--dim);
          text-decoration: none; transition: opacity .3s;
          padding: 6px 8px;
        }
        .relethe-nav-links a:hover { opacity: 0.7; }
        .relethe-nav-cta {
          font-family: var(--sans-serif); font-size: 11px; letter-spacing: .2em;
          text-transform: uppercase; color: var(--ch); font-weight: 300;
          background: transparent; border: 1px solid var(--ch); border-radius: 9999px;
          padding: 6px 16px;
          text-decoration: none; transition: all .3s;
          display: inline-block;
        }
        .relethe-nav-cta:hover { 
          background: rgba(127, 255, 0, 0.15); 
          color: var(--ch);
        }

        /* ── HERO ── */
        #relethe-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 48px 100px;
          position: relative; overflow: hidden;
          text-align: center; z-index: 3;
        }
        .relethe-hero-eyebrow {
          font-family: var(--mono); font-size: 11px; letter-spacing: .32em;
          text-transform: uppercase; color: rgba(173,255,47,0.55);
          margin-bottom: 32px; opacity: 0;
        }
        .relethe-hero-h1 {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 300; font-style: italic;
          line-height: 1.0; letter-spacing: -.03em;
          color: rgba(255,255,255,0.92); margin-bottom: 8px; opacity: 0;
          max-width: 800px; margin-left: auto; margin-right: auto;
        }
        .relethe-hero-h1 em { font-style: normal; color: var(--ch); }
        .relethe-hero-h1-dim { color: var(--dim); display: block; }
        .relethe-hero-h2 {
          font-size: clamp(17px, 2vw, 22px);
          font-weight: 300; font-style: italic; line-height: 1.55; letter-spacing: .01em;
          color: rgba(255,255,255,0.5); margin-bottom: 40px; opacity: 0;
          max-width: 580px;
        }
        .relethe-hero-sub {
          font-size: clamp(15px, 1.8vw, 18px); font-weight: 300;
          line-height: 1.75; letter-spacing: .02em;
          color: var(--dim); max-width: 540px; margin-bottom: 52px; opacity: 0;
        }
        .relethe-hero-sub em { color: rgba(255,255,255,0.62); font-style: italic; }
        .relethe-hero-form {
          display: flex; max-width: 460px; width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border); border-radius: 28px;
          overflow: hidden; padding: 5px; opacity: 0;
        }
        .relethe-hero-form input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: var(--mono); font-size: 16px; letter-spacing: .04em;
          color: var(--text); padding: 12px 18px;
        }
        .relethe-hero-form input::placeholder { color: var(--ghost); }
        .relethe-hero-form button {
          font-family: var(--mono); font-size: 11px; letter-spacing: .3em;
          text-transform: uppercase; color: #6B6B6B;
          background: transparent; border: none; border-radius: 22px;
          padding: 12px 24px; cursor: none; transition: all .3s; white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
        }
        .relethe-hero-form button:hover { color: var(--ch); }
        .relethe-hero-meta {
          margin-top: 22px; display: flex; flex-direction: column;
          align-items: center; gap: 24px; opacity: 0;
        }
        .relethe-waitlist {
          font-family: var(--mono); font-size: 11px;
          letter-spacing: .14em; color: var(--ghost);
        }
        .relethe-waitlist span { color: rgba(173,255,47,0.5); }
        .relethe-scroll-hint {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .relethe-scroll-hint span {
          font-family: var(--mono); font-size: 10px; letter-spacing: .22em;
          text-transform: uppercase; color: var(--ghost);
        }
        .relethe-scroll-line {
          width: 1px; height: 36px;
          background: linear-gradient(to bottom, rgba(173,255,47,0.4), transparent);
          animation: reletheScrollDrop 2s ease-in-out infinite;
        }
        @keyframes reletheScrollDrop {
          0%, 100% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          40%, 60%  { opacity: 1; transform: scaleY(1); }
        }

        /* ── STORY (typewriter section) ── */
        #relethe-story {
          padding: 140px 48px;
          display: flex; align-items: center; justify-content: center;
          background: #020402;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          position: relative; overflow: hidden; z-index: 3;
          min-height: 60vh;
        }
        .relethe-story-inner { max-width: 860px; text-align: center; }
        .relethe-story-line {
          display: block; min-height: 1.4em;
          font-size: clamp(24px, 3.2vw, 44px);
          font-weight: 300; line-height: 1.35; letter-spacing: -.01em;
          margin-bottom: 8px;
        }
        .relethe-story-line.dim    { color: rgba(255,255,255,0.22); }
        .relethe-story-line.bright { color: rgba(255,255,255,0.88); }
        .relethe-story-line.accent { color: var(--ch); font-style: italic; }
        .relethe-story-line.small  { font-size: clamp(15px, 1.8vw, 20px); color: var(--dim); font-style: italic; margin-top: 8px; }
        .relethe-cursor-blink {
          display: inline-block; width: 2px; height: 1em;
          background: var(--ch); margin-left: 3px; vertical-align: middle;
          animation: reletheBlink .8s step-end infinite;
        }
        @keyframes reletheBlink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── HOW IT WORKS ── */
        #relethe-how {
          padding: 120px 48px;
          max-width: 1200px; margin: 0 auto;
          position: relative; z-index: 3;
        }
        .relethe-section-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: .3em;
          text-transform: uppercase; color: rgba(173,255,47,0.5);
          margin-bottom: 64px; display: block;
        }
        .relethe-steps {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
        }
        .relethe-step {
          padding: 48px 40px;
          background: rgba(255,255,255,0.025);
          border: 1px solid var(--border);
          position: relative; overflow: hidden;
          transition: background .3s;
        }
        .relethe-step:first-child { border-radius: 20px 0 0 20px; }
        .relethe-step:last-child  { border-radius: 0 20px 20px 0; }
        .relethe-step:hover { background: rgba(255,255,255,0.042); }
        .relethe-step::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          background: radial-gradient(circle at 30% 30%, rgba(173,255,47,0.06), transparent 60%);
          transition: opacity .4s;
        }
        .relethe-step:hover::before { opacity: 1; }
        .relethe-step-num {
          font-family: var(--mono); font-size: 11px; letter-spacing: .2em;
          color: rgba(173,255,47,0.4); margin-bottom: 28px; display: block;
        }
        .relethe-step-title {
          font-size: 28px; font-weight: 300; font-style: italic;
          color: var(--text); margin-bottom: 16px; line-height: 1.2;
        }
        .relethe-step-body {
          font-size: 15px; font-weight: 300; line-height: 1.85;
          color: var(--dim); letter-spacing: .02em;
        }
        .relethe-step-body strong { color: rgba(255,255,255,0.65); font-weight: 400; }

        /* ── DEMO ── */
        #relethe-demo {
          padding: 120px 48px;
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 3;
        }
        .relethe-demo-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: .3em;
          text-transform: uppercase; color: rgba(173,255,47,0.5);
          margin-bottom: 24px;
        }
        .relethe-demo-title {
          font-size: clamp(32px, 4vw, 56px); font-weight: 300; font-style: italic;
          line-height: 1.1; letter-spacing: -.02em; color: var(--text);
          margin-bottom: 56px; text-align: center;
        }
        .relethe-demo-wrap {
          width: 100%; max-width: 900px;
          position: relative;
          will-change: transform;
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .relethe-demo-card {
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
        .relethe-demo-card:hover {
          box-shadow:
            0 48px 120px rgba(0,0,0,0.8),
            0 0 0 1px rgba(173,255,47,0.12),
            0 0 100px rgba(173,255,47,0.1);
        }
        .relethe-demo-thumb {
          width: 100%; display: block;
          aspect-ratio: 16/9; object-fit: cover;
          background: #0a0d0a;
        }
        .relethe-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(2,4,2,0.3);
          transition: background .3s;
        }
        .relethe-play-overlay:hover { background: rgba(2,4,2,0.15); }
        .relethe-play-btn {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(173,255,47,0.12);
          border: 1.5px solid rgba(173,255,47,0.4);
          display: flex; align-items: center; justify-content: center;
          transition: all .35s; backdrop-filter: blur(8px);
        }
        .relethe-play-overlay:hover .relethe-play-btn {
          background: rgba(173,255,47,0.22);
          border-color: rgba(173,255,47,0.7);
          transform: scale(1.1);
        }
        .relethe-play-btn svg { margin-left: 4px; width: 24px; height: 24px; }
        .relethe-demo-card::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 2;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%);
        }
        .relethe-demo-video {
          display: none; width: 100%; aspect-ratio: 16/9;
        }

        .relethe-view-demo-btn {
          display: inline-block; margin-top: 24px;
          font-family: var(--mono); font-size: 11px; letter-spacing: .2em;
          text-transform: uppercase; color: rgba(173,255,47,0.4);
          background: transparent; border: 1px solid rgba(173,255,47,0.25);
          border-radius: 22px; padding: 12px 28px; cursor: none;
          transition: color .25s, border-color .25s, background .25s;
        }
        .relethe-view-demo-btn:hover {
          color: rgba(173,255,47,1);
          border-color: rgba(173,255,47,0.8);
          background: rgba(173,255,47,0.08);
        }

        .relethe-demo-overlay {
          position: fixed; inset: 0; z-index: 10000;
          background: #0a0a0a; opacity: 1; backdrop-filter: none;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px;
        }
        .relethe-demo-overlay-close {
          position: absolute; top: 24px; right: 32px;
          font-family: var(--mono); font-size: 20px; line-height: 1;
          color: rgba(255,255,255,0.35); background: transparent; border: none;
          cursor: none; transition: color .2s; padding: 8px;
        }
        .relethe-demo-overlay-close:hover { color: rgba(255,255,255,0.75); }
        .relethe-demo-overlay-glow {
          position: absolute; width: 480px; height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(173,255,47,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .relethe-demo-overlay-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 0;
          max-width: 400px; width: 100%; text-align: center;
        }
        .relethe-demo-overlay-h {
          font-family: var(--serif); font-size: clamp(28px,4vw,42px);
          font-weight: 300; font-style: italic; line-height: 1.1;
          color: var(--text); margin-bottom: 14px;
        }
        .relethe-demo-overlay-sub {
          font-family: var(--mono); font-size: 12px; letter-spacing: .08em;
          color: var(--dim); margin-bottom: 36px;
        }
        .relethe-demo-overlay-form {
          display: flex; gap: 10px; width: 100%; max-width: 360px;
          margin-bottom: 14px;
        }
        .relethe-demo-overlay-form input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 22px; padding: 12px 20px;
          font-family: var(--mono); font-size: 16px; letter-spacing: .06em;
          color: var(--text); outline: none;
          transition: border-color .2s;
        }
        .relethe-demo-overlay-form input::placeholder { color: var(--ghost); }
        .relethe-demo-overlay-form input:focus { border-color: rgba(173,255,47,0.35); }
        .relethe-demo-overlay-form button {
          font-family: var(--mono); font-size: 11px; letter-spacing: .2em;
          text-transform: uppercase; color: #050705;
          background: rgba(173,255,47,0.85); border: none;
          border-radius: 22px; padding: 12px 22px;
          cursor: none; transition: background .2s; white-space: nowrap;
        }
        .relethe-demo-overlay-form button:hover { background: rgba(173,255,47,1); }
        .relethe-demo-overlay-error {
          font-family: var(--mono); font-size: 11px; letter-spacing: .06em;
          color: rgba(220,80,80,0.75); min-height: 16px;
        }

        /* ── SEE IT ── */
        #relethe-see {
          padding: 120px 0;
          overflow: hidden;
          position: relative; z-index: 3;
        }
        .relethe-see-header {
          padding: 0 48px; margin-bottom: 64px;
          display: flex; align-items: flex-end; justify-content: space-between;
        }
        .relethe-see-title {
          font-size: clamp(36px, 5vw, 64px); font-weight: 300; font-style: italic;
          line-height: 1.1; letter-spacing: -.02em; color: var(--text);
        }
        .relethe-see-title em { color: var(--ch); font-style: normal; }
        .relethe-scroll-hint-h {
          font-family: var(--mono); font-size: 11px; letter-spacing: .18em;
          text-transform: uppercase; color: var(--ghost);
          display: flex; align-items: center; gap: 12px; padding-bottom: 8px;
        }
        .relethe-scroll-hint-h::after {
          content: '→'; font-size: 16px; color: rgba(173,255,47,0.5);
          animation: reletheNudge 2s ease-in-out infinite;
        }
        @keyframes reletheNudge { 0%,100%{transform:translateX(0)} 50%{transform:translateX(6px)} }

        .relethe-cards-track {
          display: flex; gap: 20px;
          padding: 40px 48px 60px;
          overflow-x: auto; overflow-y: visible;
          scrollbar-width: none; cursor: grab;
        }
        .relethe-cards-track::-webkit-scrollbar { display: none; }
        .relethe-cards-track.dragging { cursor: grabbing; }

        .relethe-product-card {
          flex-shrink: 0; width: 320px;
          background: var(--dark2);
          border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          transition: transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s;
          transform-origin: bottom center;
        }
        .relethe-product-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(173,255,47,0.06);
          border-color: rgba(173,255,47,0.15);
        }
        .relethe-card-screen {
          width: 100%; height: 220px;
          background: #0d120d; position: relative; overflow: hidden;
        }

        /* Screen mockups */
        .relethe-screen-feed { background: linear-gradient(180deg,#080d08,#050705); padding: 16px; }
        .relethe-mock-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .relethe-mock-logo { width:36px; height:7px; background:rgba(255,255,255,0.5); border-radius:2px; }
        .relethe-mock-search { width:90px; height:7px; background:rgba(255,255,255,0.1); border-radius:10px; }
        .relethe-mock-btn { width:28px; height:7px; background:rgba(173,255,47,0.3); border-radius:10px; }
        .relethe-mock-masonry { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
        .relethe-mock-post { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:8px; }
        .relethe-mock-post.tall { grid-row:span 2; }
        .relethe-mock-line { height:4px; background:rgba(255,255,255,0.12); border-radius:2px; margin-bottom:4px; }
        .relethe-mock-line.short { width:60%; }
        .relethe-mock-line.accent { background:rgba(173,255,47,0.25); width:40%; }
        .relethe-mock-arc { width:14px; height:14px; border-radius:50%; border:1.5px solid rgba(173,255,47,0.5); margin-top:6px; }

        .relethe-screen-fading { background:linear-gradient(180deg,#080d08,#050705); padding:16px; display:flex; flex-direction:column; gap:8px; }
        .relethe-fading-post { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; }
        .relethe-fading-post.blur .relethe-mock-line { filter:blur(1.5px); opacity:.4; }
        .relethe-fading-badge { font-family:var(--mono); font-size:8px; letter-spacing:.15em; color:rgba(204,153,51,0.7); margin-bottom:5px; text-transform:uppercase; }
        .relethe-fading-badge.faded { color:rgba(255,255,255,0.2); }

        .relethe-screen-depth { background:linear-gradient(175deg,#0c110c,#020402); padding:24px 20px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; }
        .relethe-depth-ripple { width:44px; height:44px; position:relative; display:flex; align-items:center; justify-content:center; }
        .relethe-depth-ripple::before,.relethe-depth-ripple::after { content:''; position:absolute; border-radius:50%; border:1px solid rgba(173,255,47,0.2); animation:reletheMockRipple 2.4s ease-out infinite; }
        .relethe-depth-ripple::after { animation-delay:1.2s; }
        .relethe-depth-dot { width:5px; height:5px; border-radius:50%; background:rgba(173,255,47,0.5); }
        @keyframes reletheMockRipple { 0%{width:5px;height:5px;opacity:.6} 100%{width:44px;height:44px;opacity:0} }
        .relethe-depth-text { font-family:var(--serif); font-size:13px; font-style:italic; font-weight:300; color:rgba(255,255,255,0.7); text-align:center; line-height:1.4; }
        .relethe-depth-btn-mock { font-family:var(--mono); font-size:8px; letter-spacing:.15em; text-transform:uppercase; color:rgba(173,255,47,0.6); border:1px solid rgba(173,255,47,0.2); padding:5px 14px; border-radius:12px; background:rgba(173,255,47,0.05); }

        .relethe-screen-connect { background:linear-gradient(180deg,#080d08,#050705); padding:16px; }
        .relethe-connect-cards { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .relethe-connect-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; overflow:hidden; }
        .relethe-connect-img { width:100%; height:60px; background:rgba(255,255,255,0.06); }
        .relethe-connect-info { padding:8px; }
        .relethe-connect-name { height:5px; background:rgba(255,255,255,0.3); border-radius:2px; width:70%; margin-bottom:4px; }
        .relethe-connect-tag { height:4px; background:rgba(173,255,47,0.2); border-radius:2px; width:45%; }
        .relethe-connect-actions { display:flex; gap:4px; padding:6px 8px; }
        .relethe-connect-match { flex:1; height:18px; background:rgba(255,255,255,0.08); border-radius:6px; }
        .relethe-connect-pass  { flex:1; height:18px; background:rgba(255,255,255,0.03); border-radius:6px; border:1px solid rgba(255,255,255,0.06); }

        .relethe-screen-profile { background:linear-gradient(180deg,#080d08,#050705); padding:16px; }
        .relethe-profile-head { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .relethe-profile-ava { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.12); }
        .relethe-profile-name-mock { height:6px; background:rgba(255,255,255,0.4); border-radius:2px; width:80px; margin-bottom:4px; }
        .relethe-profile-handle { height:4px; background:rgba(255,255,255,0.15); border-radius:2px; width:54px; }
        .relethe-profile-tabs { display:flex; gap:1px; margin-bottom:12px; }
        .relethe-ptab { flex:1; height:24px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:4px; display:flex; align-items:center; justify-content:center; }
        .relethe-ptab.active { background:rgba(173,255,47,0.08); border-color:rgba(173,255,47,0.18); }
        .relethe-ptab-label { height:4px; width:40px; background:rgba(255,255,255,0.15); border-radius:2px; }
        .relethe-ptab.active .relethe-ptab-label { background:rgba(173,255,47,0.4); }
        .relethe-profile-posts { display:flex; flex-direction:column; gap:6px; }
        .relethe-profile-post { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:6px; padding:8px; display:flex; justify-content:space-between; align-items:flex-end; }
        .relethe-profile-post.faded-post { opacity:.45; filter:blur(.3px); }
        .relethe-revive-btn { font-family:var(--mono); font-size:7px; letter-spacing:.12em; text-transform:uppercase; color:rgba(173,255,47,0.6); border:1px solid rgba(173,255,47,0.2); padding:3px 8px; border-radius:8px; white-space:nowrap; }

        .relethe-screen-matches { background:linear-gradient(180deg,#080d08,#050705); padding:16px; }
        .relethe-matches-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .relethe-matches-title-mock { height:6px; width:100px; background:rgba(255,255,255,0.3); border-radius:2px; }
        .relethe-matches-toggle { width:28px; height:14px; border-radius:7px; background:rgba(173,255,47,0.4); }
        .relethe-match-row { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:8px; margin-bottom:6px; }
        .relethe-match-ava { width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.1); flex-shrink:0; }
        .relethe-match-info { flex:1; }
        .relethe-match-name { height:5px; background:rgba(255,255,255,0.3); border-radius:2px; width:80%; margin-bottom:4px; }
        .relethe-match-date { height:4px; background:rgba(255,255,255,0.1); border-radius:2px; width:55%; }
        .relethe-match-status { font-family:var(--mono); font-size:7px; letter-spacing:.1em; padding:3px 7px; border-radius:8px; }
        .relethe-match-status.upcoming { background:rgba(173,255,47,0.12); color:rgba(173,255,47,0.7); }
        .relethe-match-status.met { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.35); }

        .relethe-card-label { padding:20px 22px 22px; }
        .relethe-card-tag { font-family:var(--mono); font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:rgba(173,255,47,0.45); margin-bottom:6px; display:block; }
        .relethe-card-title { font-size:20px; font-weight:300; font-style:italic; color:rgba(255,255,255,0.82); line-height:1.2; }

        /* ── SIGNUP ── */
        #relethe-signup {
          padding: 140px 48px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          background: #020402;
          border-top: 1px solid var(--border);
          position: relative; overflow: hidden; z-index: 3;
        }
        #relethe-signup::before {
          content: ''; position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(173,255,47,0.06) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
        }
        .relethe-signup-pre { font-family:var(--mono); font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:rgba(173,255,47,0.45); margin-bottom:28px; }
        .relethe-signup-h { font-size:clamp(36px,5vw,68px); font-weight:300; font-style:italic; line-height:1.1; letter-spacing:-.02em; color:var(--text); margin-bottom:16px; }
        .relethe-signup-sub { font-size:15px; font-weight:300; line-height:1.7; color:var(--dim); max-width:440px; margin-bottom:52px; }
        .relethe-signup-form {
          display:flex; max-width:460px; width:100%;
          background:rgba(255,255,255,0.04); border:1px solid var(--border);
          border-radius:28px; overflow:hidden; padding:5px; position:relative; z-index:1;
        }
        .relethe-signup-form input { flex:1; background:transparent; border:none; outline:none; font-family:var(--mono); font-size:16px; letter-spacing:.04em; color:var(--text); padding:12px 18px; }
        .relethe-signup-form input::placeholder { color:var(--ghost); }
        .relethe-signup-form button { font-family:var(--mono); font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:#6B6B6B; background:transparent; border:none; border-radius:22px; padding:12px 24px; cursor:none; transition:all .3s; white-space:nowrap; display: flex; align-items: center; gap: 8px; }
        .relethe-signup-form button:hover { color:var(--ch); }
        .relethe-signup-note { margin-top:18px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; color:var(--ghost); position:relative; z-index:1; }
        .relethe-form-success { padding: 16px 0; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
        .relethe-form-success-title {
          font-family: var(--serif); font-size: 18px; font-style: italic;
          font-weight: 300; color: rgba(173,255,47,0.9); margin-bottom: 0;
          display: flex; align-items: center; justify-content: center; gap: 0; position: relative;
        }
        .relethe-form-success-sub {
          font-family: var(--mono); font-size: 12px; letter-spacing: .06em;
          color: var(--dim);
        }
        .relethe-confetti { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 0; height: 0; pointer-events: none; }
        .relethe-confetti span {
          position: absolute; width: 4px; height: 4px; border-radius: 1px;
          top: 50%; left: 50%; margin: -2px;
          animation: reletheConfetti var(--dur, .65s) ease-out var(--delay, 0s) both;
        }
        @keyframes reletheConfetti {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--tx,0px), var(--ty,-30px)) rotate(var(--rot,180deg)); opacity: 0; }
        }

        /* ── FOOTER ── */
        .relethe-footer {
          padding: 48px;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--border); position: relative; z-index: 3;
        }
        .relethe-footer-logo { font-family:var(--serif); font-size:13px; font-weight:300; letter-spacing:.38em; text-transform:uppercase; color:var(--dim); }
        .relethe-footer-tag { font-family:var(--serif); font-size:14px; font-style:italic; font-weight:300; color:var(--ghost); }
        .relethe-footer-link { font-family:var(--mono); font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--ghost); text-decoration:none; transition:color .25s; }
        .relethe-footer-link:hover { color:var(--dim); }

        /* ── Scroll reveal ── */
        .relethe-reveal { opacity:0; transform:translateY(28px); transition:opacity .8s ease, transform .8s ease; }
        .relethe-reveal.visible { opacity:1; transform:translateY(0); }
        .relethe-reveal-d1 { transition-delay:.1s; }
        .relethe-reveal-d2 { transition-delay:.2s; }
        .relethe-reveal-d3 { transition-delay:.3s; }

        @media (max-width: 968px) {
          .relethe-steps { grid-template-columns: 1fr; gap: 16px; }
          .relethe-step:first-child { border-radius: 20px 20px 0 0; }
          .relethe-step:last-child { border-radius: 0 0 20px 20px; }
          .relethe-nav { padding: 0 24px; }
          .relethe-nav-links { gap: 20px; font-size: 10px; }
          .relethe-see-header { flex-direction: column; align-items: flex-start; gap: 20px; }
        }

        /* ── Cards fade wrapper ── */
        .relethe-cards-fade-wrapper { position: relative; overflow: hidden; }
        .relethe-cards-fade-wrapper::after {
          content: ''; position: absolute; top: 0; right: 0;
          width: 80px; height: 100%;
          background: linear-gradient(to right, transparent, var(--dark));
          pointer-events: none; z-index: 2;
        }

        /* ── Typewriter static fallback ── */
        .relethe-story-line:empty::before { content: '\\00a0'; display: block; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          #relethe-hero    { padding: 100px 24px 80px; }
          #relethe-story   { padding: 80px 24px; }
          #relethe-how     { padding: 80px 24px; }
          #relethe-demo    { padding: 80px 24px; }
          #relethe-see     { padding: 80px 0; }
          #relethe-signup  { padding: 100px 24px; }
          .relethe-footer  { padding: 40px 24px; flex-direction: column; align-items: flex-start; gap: 20px; }
          .relethe-footer-tag { display: none; }
          .relethe-see-header { padding: 0 24px; }
          .relethe-nav-links a { display: none; }
          .relethe-nav-links { gap: 0; }
          .relethe-hero-form {
            flex-direction: column; border-radius: 16px; padding: 8px; gap: 8px;
          }
          .relethe-hero-form input { padding: 14px 16px; text-align: center; }
          .relethe-hero-form button { width: 100%; justify-content: center; padding: 14px 24px; border-radius: 12px; }
          .relethe-signup-form {
            flex-direction: column; border-radius: 16px; padding: 8px; gap: 8px;
          }
          .relethe-signup-form input { padding: 14px 16px; text-align: center; }
          .relethe-signup-form button { width: 100%; justify-content: center; padding: 14px 24px; border-radius: 12px; }
          .relethe-step { padding: 32px 24px; }
          .relethe-step:first-child { border-radius: 16px 16px 0 0; }
          .relethe-step:last-child  { border-radius: 0 0 16px 16px; }
          .relethe-product-card { width: 280px; }
          .relethe-cards-track  { padding: 32px 24px 48px; }
          .relethe-section-label { margin-bottom: 32px; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .relethe-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          .diagnostic-organism { animation: none !important; }
          .relethe-cursor-blink { animation: none !important; opacity: 1; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:wght@300;400&display=swap"
        rel="stylesheet"
      />

      <canvas id="relethe-water-canvas" ref={canvasRef}></canvas>
      <div className="relethe-noise"></div>
      <div id="relethe-cur-dot" ref={cursorDotRef}></div>
      <div id="relethe-cur-ring" ref={cursorRingRef}></div>

      {/* NAV */}
      <nav className="relethe-nav">
        <a
          href="/"
          className="relethe-nav-logo flex items-center gap-2"
          style={{ textDecoration: 'none' }}
        >
          <div className="w-5 h-5">
            <ReletheLogo />
          </div>
          RELETHE
        </a>
        <div className="relethe-nav-links">
          <a href="#relethe-how">HOW IT WORKS</a>
          <a href="#relethe-see">THE PRODUCT</a>
          <button
            onClick={() => {
              const el = document.getElementById('relethe-signup');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="border rounded-full text-[11px] tracking-[0.2em] uppercase font-light font-sans transition-all duration-300"
            style={{
              borderColor: '#7FFF00',
              color: '#7FFF00',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              paddingTop: '11px',
              paddingBottom: '11px',
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
      <section id="relethe-hero">
        <p className="relethe-hero-eyebrow">Private beta — limited access</p>
        <h1 className="relethe-hero-h1">
          You should be more intentional
          <span className="relethe-hero-h1-dim"> about meeting people.</span>
        </h1>
        <h2 className="relethe-hero-h2">Everything you dream of achieving lies within the unexplored gap in your network.</h2>
        <p className="relethe-hero-sub">
          Up to five introductions a week, matched to who you actually are. A daily feed that ends. A network that compounds the longer you show up.
        </p>
        {!showHeroSuccess && !showHeroDuplicate ? (
          <form className="relethe-hero-form" onSubmit={handleHeroSubmit}>
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
        ) : showHeroDuplicate ? (
          <div className="relethe-form-success">
            <p className="relethe-form-success-title">{"You're already on the list."}</p>
            <p className="relethe-form-success-sub">We'll reach out when the first batch opens.</p>
          </div>
        ) : (
          <div className="relethe-form-success">
            <p className="relethe-form-success-title">
              <span className="relethe-confetti" aria-hidden="true">
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
            <p className="relethe-form-success-sub">We'll be in touch when the first batch opens.</p>
            <a
              href="https://twitter.com/intent/tweet?text=Just joined the Relethe waitlist. Networking without the performance. relethe.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ch)', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}
            >
              Share on X →
            </a>
          </div>
        )}
        <div className="relethe-hero-meta">
          <p className="relethe-waitlist">
            Limited spots. Post-beta is invite only.
          </p>
          <div className="relethe-scroll-hint">
            <span>Scroll</span>
            <div className="relethe-scroll-line"></div>
          </div>
        </div>
      </section>

      {/* STORY (typewriter) */}
      <section id="relethe-story">
        <div className="relethe-story-inner">
          <span className="relethe-story-line dim" ref={ls1Ref}></span>
          <span className="relethe-story-line bright" ref={ls2Ref}></span>
          <span className="relethe-story-line accent" ref={ls3Ref}></span>
          <span className="relethe-story-line small" ref={ls4Ref}></span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="relethe-how">
        <span className="relethe-section-label relethe-reveal">How it works</span>
        <div className="relethe-steps">
          <div className="relethe-step relethe-reveal relethe-reveal-d1">
            <span className="relethe-step-num">01</span>
            <h3 className="relethe-step-title">Get introduced</h3>
            <p className="relethe-step-body">
              Relethe matches you with up to five people a week based on who you actually are, not who you perform to be. <strong>The feed gives you context.</strong> The match is the point.
            </p>
          </div>
          <div className="relethe-step relethe-reveal relethe-reveal-d2">
            <span className="relethe-step-num">02</span>
            <h3 className="relethe-step-title">Meet on your terms</h3>
            <p className="relethe-step-body">
              Set your availability, your frequency, your boundaries. Every introduction is a deliberate choice. <strong>You scan your weekly matches and choose who makes the cut.</strong>
            </p>
          </div>
          <div className="relethe-step relethe-reveal relethe-reveal-d3">
            <span className="relethe-step-num">03</span>
            <h3 className="relethe-step-title">Stay in the signal</h3>
            <p className="relethe-step-body">
              A daily edition of selected posts. Short-form, intentional, finite. It ends. <strong>That is the point.</strong> The feed exists so you show up knowing who you are meeting and why.
            </p>
          </div>
        </div>
      </section>

      <DiagnosticSection onEmailSubmitted={setDiagnosticEmail} />
      <FoundingCohort />
      <FoundingMember diagnosticEmail={diagnosticEmail} />

      {/* DEMO */}
      <section id="relethe-demo">
        <p className="relethe-demo-label relethe-reveal">Watch a demo</p>
        <h2 className="relethe-demo-title relethe-reveal">See it in motion.</h2>
        <div className="relethe-demo-wrap relethe-reveal" ref={demoWrapRef}>
          <div className="relethe-demo-card">
            <img
              ref={thumbRef}
              className="relethe-demo-thumb"
              src={demoThumb}
              alt="Relethe product demo showing the matching interface and daily feed"
            />
            <div
              className="relethe-play-overlay"
              ref={playOverlayRef}
              onClick={handlePlayDemo}
            >
              <div className="relethe-play-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14l11-7-11-7z" fill="rgba(173,255,47,0.9)" />
                </svg>
              </div>
            </div>
            <video 
              className="relethe-demo-video" 
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
          className="relethe-view-demo-btn"
          onClick={() => navigate("/feed")}
        >
          View full demo
        </button>
      </section>

      {/* SEE IT */}
      <section id="relethe-see">
        <div className="relethe-see-header relethe-reveal">
          <h2 className="relethe-see-title">
            Meet people who
            <br />
            update your <em>priors.</em>
          </h2>
          <p className="relethe-scroll-hint-h">Drag to explore</p>
        </div>
        <div className="relethe-cards-fade-wrapper">
        <div className="relethe-cards-track" ref={cardsTrackRef}>
          {/* Card 1: Connect */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen" style={{ background: "linear-gradient(180deg,#080d08,#050705)", display: "flex", flexDirection: "column", padding: "16px", gap: "10px" }}>
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
            <div className="relethe-card-label">
              <span className="relethe-card-tag">Your weekly match</span>
              <p className="relethe-card-title">
                Up to five introductions a week, selected based on your behavioral signal. You choose who makes the cut.
              </p>
            </div>
          </div>

          {/* Card 2: Hyper-personalized matching */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen" style={{ background: "#0a0f0a", display: "flex", flexDirection: "column", padding: "20px", gap: "14px" }}>
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
            <div className="relethe-card-label">
              <span className="relethe-card-tag">Your criteria</span>
              <p className="relethe-card-title">
                You choose who you meet. The more honest you are, the better the match.
              </p>
            </div>
          </div>

          {/* Card 3: Availability */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen" style={{ background: "#0a0f0a", display: "flex", flexDirection: "column", padding: "18px", gap: "11px" }}>
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
            <div className="relethe-card-label">
              <span className="relethe-card-tag">Your availability</span>
              <p className="relethe-card-title">
                Set when you show up. Pause anytime. Your meetings, your terms.
              </p>
            </div>
          </div>

          {/* Card 4: Daily edition */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen" style={{ background: "linear-gradient(180deg,#080d08,#050705)", display: "flex", flexDirection: "column", padding: "14px", gap: "10px" }}>
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
            <div className="relethe-card-label">
              <span className="relethe-card-tag">The daily edition</span>
              <p className="relethe-card-title">
                60 posts. A quiet end. Back to your own life.
              </p>
            </div>
          </div>

          {/* Card 5: Intentional scrolling */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen relethe-screen-depth">
              <div className="relethe-depth-ripple">
                <div className="relethe-depth-dot"></div>
              </div>
              <p className="relethe-depth-text">
                You've reached
                <br />
                the softened hours.
              </p>
              <div className="relethe-depth-btn-mock">Return to the present</div>
            </div>
            <div className="relethe-card-label">
              <span className="relethe-card-tag">Intentional scrolling</span>
              <p className="relethe-card-title">
                The feed has a shape. Limited daily editions of selected posts. No doomscrolling.
              </p>
            </div>
          </div>

          {/* Card 6: Communities */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen" style={{ background: "#0a0f0a", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
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
                  <div className="relethe-mock-line" style={{ width: "90%" }}></div>
                  <div className="relethe-mock-line short"></div>
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
            <div className="relethe-card-label">
              <span className="relethe-card-tag">Your communities</span>
              <p className="relethe-card-title">
                Find your guild. Post to people who already get it.
              </p>
            </div>
          </div>

          {/* Card 7: Profile */}
          <div className="relethe-product-card">
            <div className="relethe-card-screen" style={{ background: "linear-gradient(180deg,#080d08,#050705)", display: "flex", flexDirection: "column", padding: "16px", gap: "12px", overflowY: "hidden" }}>
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
            <div className="relethe-card-label">
              <span className="relethe-card-tag">Your profile</span>
              <p className="relethe-card-title">
                See your full timeline. Revive anything. Your posts, your choice
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* SIGNUP */}
      <section id="relethe-signup">
        <p className="relethe-signup-pre relethe-reveal">Private beta</p>
        <h2 className="relethe-signup-h relethe-reveal">Your seat is still open.</h2>
        <p className="relethe-signup-sub relethe-reveal">
          Relethe is in private beta. The founding cohort shapes how the matching engine learns. Join before it closes.
        </p>
        {!showSignupSuccess && !showSignupDuplicate ? (
          <form className="relethe-signup-form relethe-reveal" onSubmit={handleSignupSubmit}>
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
        ) : showSignupDuplicate ? (
          <div className="relethe-form-success">
            <p className="relethe-form-success-title">{"You're already on the list."}</p>
            <p className="relethe-form-success-sub">We'll reach out when the first batch opens.</p>
          </div>
        ) : (
          <div className="relethe-form-success">
            <p className="relethe-form-success-title">
              <span className="relethe-confetti" aria-hidden="true">
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
            <p className="relethe-form-success-sub">We'll be in touch when the first batch opens.</p>
            <a
              href="https://twitter.com/intent/tweet?text=Just joined the Relethe waitlist. Networking without the performance. relethe.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ch)', textDecoration: 'none', marginTop: '12px', display: 'inline-block' }}
            >
              Share on X →
            </a>
          </div>
        )}
        <p className="relethe-signup-note relethe-reveal">
          No spam. No noise. Just a note when we're ready.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="relethe-footer">
        <span className="relethe-footer-logo">Relethe</span>
        <span className="relethe-footer-tag">
          Networking without the performance.
        </span>
        <a href="https://www.linkedin.com/company/relethe" target="_blank" rel="noopener noreferrer" className="relethe-footer-link" style={{ padding: '12px 0', display: 'inline-block' }}>
          LinkedIn ↗
        </a>
      </footer>
    </>
  );
}
