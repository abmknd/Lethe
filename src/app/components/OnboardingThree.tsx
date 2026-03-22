import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import LetheLogo from "../../imports/LetheLogo";

export function OnboardingThree({ onContinue, onBack, onNext }: { onContinue: () => void; onBack: () => void; onNext: () => void }) {
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

  useEffect(() => {
    const lagInterval = setInterval(() => {
      setGlowPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.08,
        y: prev.y + (mousePosition.y - prev.y) * 0.08,
      }));
    }, 16);

    return () => clearInterval(lagInterval);
  }, [mousePosition]);

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

  // Radial spinner progress indicator with greyed-out bars
  function HalfLifeIndicator({ progress }: { progress: number }) {
    const bars = 12;
    const activeBars = Math.round((progress / 100) * bars);
    
    return (
      <div className="relative w-[16px] h-[16px] flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16">
          {Array.from({ length: bars }).map((_, index) => {
            const angle = (index * 360) / bars;
            const isActive = index < activeBars;
            const strokeColor = isActive ? "rgb(127, 255, 0)" : "rgb(58, 58, 58)";
            const opacity = isActive ? 0.9 : 0.25;
            
            return (
              <line
                key={index}
                x1="8"
                y1="2"
                x2="8"
                y2="4.5"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={opacity}
                transform={`rotate(${angle} 8 8)`}
              />
            );
          })}
        </svg>
      </div>
    );
  }

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

      {/* Navigation Arrows - Bottom Positioned */}
      <button
        onClick={onBack}
        className="fixed left-8 bottom-8 z-30 text-[#6B6B6B] hover:text-[#7FFF00] transition-colors duration-300 group"
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
      </button>

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
          <div className="w-5 h-5">
            <LetheLogo />
          </div>
          <h1 className="text-[#6B6B6B] text-[11px] tracking-[0.35em] uppercase font-light font-serif">
            LETHE
          </h1>
        </div>

        {/* Center Content */}
        <div className="max-w-2xl w-full text-center space-y-10">
          {/* Main Heading */}
          <div className="space-y-6">
            <h2 className="font-serif text-white text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-normal italic">
              Everything you share
              <br />
              has a <span style={{ color: "#7FFF00" }}>half-life</span>.
            </h2>
          </div>

          {/* Evolution Timeline - Smaller and better aligned */}
          <div className="space-y-4 pt-4">
            {/* NOW */}
            <div className="flex items-center gap-4">
              <span className="text-[#6B6B6B] text-[10px] tracking-[0.25em] uppercase font-light w-16 text-right font-sans flex-shrink-0">
                NOW
              </span>
              <div className="flex-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-4 py-3 text-left flex items-center justify-between gap-3">
                <p className="text-white text-[13px] leading-[1.6] font-light font-serif">
                  I think I finally understand what I want from life. It's not comfort — it's meaning.
                </p>
                <HalfLifeIndicator progress={100} />
              </div>
            </div>

            {/* 6 MONTHS */}
            <div className="flex items-center gap-4">
              <span className="text-[#6B6B6B] text-[10px] tracking-[0.25em] uppercase font-light w-16 text-right font-sans flex-shrink-0">
                6 MONTHS
              </span>
              <div className="flex-1 bg-[#0a0a0a] border border-[#151515] rounded-lg px-4 py-3 text-left flex items-center justify-between gap-3">
                <p className="text-[#8B8B8B] text-[13px] leading-[1.6] font-light font-serif opacity-70">
                  Something about meaning and comfort... a shift in what I was seeking.
                </p>
                <HalfLifeIndicator progress={45} />
              </div>
            </div>

            {/* 3 YEARS */}
            <div className="flex items-center gap-4">
              <span className="text-[#6B6B6B] text-[10px] tracking-[0.25em] uppercase font-light w-16 text-right font-sans flex-shrink-0">
                3 YEARS
              </span>
              <div className="flex-1 bg-[#070707] border border-[#0f0f0f] rounded-lg px-4 py-3 text-left flex items-center justify-between gap-3">
                <p className="text-[#4a4a4a] text-[13px] leading-[1.6] font-light font-serif opacity-40 blur-[0.5px]">
                  A moment of clarity about what matters.
                </p>
                <HalfLifeIndicator progress={12} />
              </div>
            </div>
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