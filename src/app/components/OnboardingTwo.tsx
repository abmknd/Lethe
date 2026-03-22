import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import LetheLogo from "../../imports/LetheLogo";

export function OnboardingTwo({ onContinue, onBack }: { onContinue: (name?: string) => void; onBack?: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [glowOpacity, setGlowOpacity] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleBegin = () => {
    if (!name.trim()) {
      setError("enter a name to move on");
      return;
    }
    setError("");
    onContinue(name);
  };

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
        handleBegin();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [name]); // Depend on name so it uses current value

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
      {onBack && (
        <button
          onClick={onBack}
          className="fixed left-8 bottom-8 z-30 text-[#6B6B6B] hover:text-[#7FFF00] transition-colors duration-300 group"
          aria-label="Previous"
        >
          <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
        </button>
      )}

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
        <div className="max-w-xl w-full text-center space-y-12">
          {/* Main Question */}
          <div className="space-y-4">
            <h2 className="font-serif text-white text-[2.5rem] md:text-[3rem] leading-[1.15] font-normal italic">
              What would you
              <br />
              like to be called?
            </h2>
            
            <p className="text-[#6B6B6B] text-[15px] italic font-serif">
              a name, a word, anything
            </p>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-[#8B7355] text-white text-center text-xl font-serif italic placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#7FFF00] transition-colors pb-2"
              placeholder=""
              autoFocus
            />
            <p className="text-[#3A3A3A] text-[11px] tracking-wide font-light font-sans">
              You can change this whenever you change.
            </p>
          </div>

          {/* Philosophy Text */}
          <div className="pt-8 space-y-3">
            <p className="text-[#9B9B9B] text-[15px] leading-[1.8] font-serif">
              Post freely. Evolve naturally.
            </p>
            <p className="text-[#6B6B6B] text-[15px] leading-[1.8] font-serif">
              What matters will remain. What no longer serves you
              <br />
              will softly fade. The river always returns to stillness.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-8">
          {/* Begin Button */}
          <button
            onClick={handleBegin}
            className="group flex items-center gap-3 text-[#6B6B6B] text-[11px] tracking-[0.3em] uppercase font-light hover:text-[#7FFF00] transition-colors duration-300"
          >
            <span>BEGIN</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
          </button>
          {error && <p className="text-red-500 text-[11px] tracking-wide font-light font-sans">{error}</p>}
        </div>
      </div>
    </div>
  );
}