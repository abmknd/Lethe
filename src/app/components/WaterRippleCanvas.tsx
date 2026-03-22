import { useEffect, useRef } from "react";

export default function WaterRippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let ripples: Ripple[] = [];
    let lastRipple = 0;
    let mouse = { x: -1000, y: -1000 };
    let moving = false, moveTimer: ReturnType<typeof setTimeout>;

    window.addEventListener("resize", () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    class Ripple {
      x: number; y: number; r: number;
      max: number; speed: number;
      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.r = 0;
        this.max = 75 + Math.random() * 65;
        this.speed = 1.1 + Math.random() * 0.8;
      }
      get alive() { return this.r < this.max; }
      get alpha() { return 0.30 * (1 - this.r / this.max); }
      tick() { this.r += this.speed; }
      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        c.strokeStyle = `rgba(173,255,47,${this.alpha})`;
        c.lineWidth = 0.65 * (1 - this.r / this.max * 0.4);
        c.stroke();
      }
    }

    // Glow pool
    let gx = -1000, gy = -1000, ga = 0;
    const drawGlow = () => {
      if (ga < 0.01) return;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 210);
      g.addColorStop(0, `rgba(173,255,47,${0.042 * ga})`);
      g.addColorStop(0.5, `rgba(173,255,47,${0.016 * ga})`);
      g.addColorStop(1, "rgba(173,255,47,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(gx, gy, 210, 0, Math.PI * 2); ctx.fill();
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      moving = true; clearTimeout(moveTimer);
      moveTimer = setTimeout(() => moving = false, 160);
      const now = Date.now();
      if (now - lastRipple > 75) {
        ripples.push(new Ripple(e.clientX, e.clientY));
        lastRipple = now;
      }
    };
    window.addEventListener("mousemove", onMove);

    let rafId: number;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#040604"); bg.addColorStop(1, "#020402");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      gx += (mouse.x - gx) * 0.065; gy += (mouse.y - gy) * 0.065;
      ga += ((moving ? 1 : 0) - ga) * 0.04;
      drawGlow();
      ripples = ripples.filter(r => r.alive);
      ripples.forEach(r => { r.tick(); r.draw(ctx); });
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        zIndex: 0, pointerEvents: "none"
      }}
    />
  );
}