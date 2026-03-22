import { useState, useEffect } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import LetheLogo from "../../imports/LetheLogo";

export function OnboardingOne({ onContinue, onNext }: { onContinue: () => void; onNext: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [glowOpacity, setGlowOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setGlowOpacity(0.4);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smooth lag effect for glow position
  useEffect(() => {
    const lagInterval = setInterval(() => {
      setGlowPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.08,
        y: prev.y + (mousePosition.y - prev.y) * 0.08,
      }));
    }, 16); // ~60fps

    return () => clearInterval(lagInterval);
  }, [mousePosition]);

  // Fade out glow when mouse stops moving
  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      setGlowOpacity(0);
    }, 2000);

    return () => clearTimeout(fadeTimeout);
  }, [mousePosition]);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onContinue();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [onContinue]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent">
      {/* Ambient Cursor Glow */}
      <div
        className="fixed pointer-events-none z-10 transition-opacity duration-[2000ms] ease-out"
        style={{
          left: glowPosition.x,
          top: glowPosition.y,
          opacity: glowOpacity,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(127, 255, 0, 0.06) 0%, rgba(127, 255, 0, 0) 70%)",
          }}
        />
      </div>

      {/* Boat Illustration - subtle, positioned on right */}
      <div className="fixed right-16 top-1/2 -translate-y-1/2 opacity-20 z-0">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="90" rx="35" ry="8" fill="#1a3a1a" opacity="0.3" />
          <path
            d="M35 75 L60 50 L85 75 L80 80 L40 80 Z"
            fill="none"
            stroke="#2d4a2d"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <circle cx="60" cy="85" r="2" fill="#3d5a3d" opacity="0.5" />
        </svg>
      </div>

      {/* Navigation Arrows - Bottom Positioned */}
      <button
        onClick={onNext}
        className="fixed right-8 bottom-8 z-30 text-[#6B6B6B] hover:text-[#7FFF00] transition-colors duration-300 group"
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
      </button>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-between min-h-screen px-8 py-16">
        {/* Wordmark */}
        <div className="pt-4 flex items-center gap-2">
          <div className="w-5 h-5 opacity-60">
            <LetheLogo />
          </div>
          <h1 className="text-white text-[11px] tracking-[0.35em] uppercase font-light font-serif opacity-60">
            LETHE
          </h1>
        </div>

        {/* Center Text Blocks */}
        <div className="max-w-2xl text-center space-y-12">
          <h2 className="font-serif text-white leading-[1.15]">
            <span className="text-[2.75rem] md:text-[3.5rem] font-normal italic">
              You are not
            </span>
            <br />
            <span className="text-[2.75rem] md:text-[3.5rem] font-normal italic">
              who you{" "}
              <span style={{ color: "#7FFF00" }}>were.</span>
            </span>
          </h2>

          <div className="text-[#6B6B6B] text-[15px] leading-[1.8] tracking-wide font-light max-w-lg mx-auto space-y-6 font-serif">
            <p>
              The person who posted three years ago is a stranger to who you are today. Yet{" "}
              <span className="text-white font-normal">the internet remembers everything</span> — and forgives nothing.
            </p>
            <p className="text-[#6B6B6B]">Lethe was built on a different belief.</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-8">
          {/* Continue Button */}
          <button
            onClick={() => onContinue()}
            className="group flex items-center gap-3 text-[#6B6B6B] text-[11px] tracking-[0.3em] uppercase font-light hover:text-[#7FFF00] transition-colors duration-300"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}