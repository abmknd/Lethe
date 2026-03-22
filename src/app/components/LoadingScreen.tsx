import { useEffect, useState } from "react";

export function LoadingScreen({ userName }: { userName: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress animation over 3 seconds
    const duration = 3000;
    const intervalTime = 16; // ~60fps
    const increment = (100 / duration) * intervalTime;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-between min-h-screen px-8 py-16">
        {/* Wordmark */}
        <div className="pt-4">
          <h1 className="text-[#6B6B6B] text-[11px] tracking-[0.35em] uppercase font-light font-serif">
            LETHE
          </h1>
        </div>

        {/* Center Content */}
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="space-y-6">
            <h2 className="font-serif text-white text-[2.5rem] md:text-[3rem] leading-[1.15] font-normal italic">
              Welcome, {userName}.
            </h2>
            
            <div className="text-[#6B6B6B] text-[15px] italic font-serif space-y-1">
              <p>The river remembers nothing.</p>
              <p>And that is its gift.</p>
            </div>
          </div>
        </div>

        {/* Bottom Loading Bar */}
        <div className="w-full max-w-xl">
          <div className="h-[1px] bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7FFF00] transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}