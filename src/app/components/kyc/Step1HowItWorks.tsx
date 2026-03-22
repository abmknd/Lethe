import { Zap, Eye, Clock, Play } from 'lucide-react';
import { useState, useRef } from 'react';

interface Step1Props {
  isActive: boolean;
  direction: 'forward' | 'back';
}

export function Step1HowItWorks({ isActive, direction }: Step1Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const handlePlayClick = () => {
    console.log('Play button clicked');
    setIsPlaying(true);
    if (videoRef.current) {
      console.log('Video element exists, attempting to play');
      videoRef.current.play().catch((error) => {
        console.error('Video play error:', error);
        setVideoError(true);
        setIsPlaying(false);
      });
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video loading error');
    setVideoError(true);
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Getting started
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        Meet people<br />
        <em className="not-italic text-[#7FFF00]">worth meeting.</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-8">
        Lethe's matching is different. Here's what to expect.
      </p>

      <div className="flex flex-col gap-[1px]">
        {/* Feature 1 */}
        <div className="flex items-start gap-5 py-[22px] border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[#7FFF00]/[0.06] border border-[#7FFF00]/[0.12] flex items-center justify-center text-[#7FFF00]/70">
            <Zap size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[17px] font-normal text-white/90 mb-1">
              One match, every week
            </div>
            <div className="text-[14px] font-light leading-[1.7] text-white/45">
              Lethe finds one person worth talking to and makes the introduction. Not a hundred maybes — one considered yes.
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-5 py-[22px] border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[#7FFF00]/[0.06] border border-[#7FFF00]/[0.12] flex items-center justify-center text-[#7FFF00]/70">
            <Eye size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[17px] font-normal text-white/90 mb-1">
              Context before you meet
            </div>
            <div className="text-[14px] font-light leading-[1.7] text-white/45">
              Their feed gives you a sense of who they are. Not a LinkedIn bio — real thoughts, real perspective.
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-5 py-[22px] border-b border-white/[0.07]">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 bg-[#7FFF00]/[0.06] border border-[#7FFF00]/[0.12] flex items-center justify-center text-[#7FFF00]/70">
            <Clock size={18} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[17px] font-normal text-white/90 mb-1">
              Always in control
            </div>
            <div className="text-[14px] font-light leading-[1.7] text-white/45">
              Pause anytime. Skip a week. No guilt, no consequences. This is yours to use on your terms.
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="mt-8">
        <h2 className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3">
          See it in motion
        </h2>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a0f0a] border border-white/[0.07]">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onEnded={() => setIsPlaying(false)}
            controls={isPlaying}
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
            onLoadStart={handleVideoLoad}
            onError={handleVideoError}
          >
            <source src="https://github.com/user-attachments/assets/2671d9df-961e-445e-9c31-8b6f566c1f15" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Thumbnail Overlay with Play Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f0a]/95 backdrop-blur-sm">
              {/* Play Button */}
              <button
                onClick={handlePlayClick}
                className="w-16 h-16 rounded-full bg-[#7FFF00]/20 hover:bg-[#7FFF00]/30 border border-[#7FFF00]/40 hover:border-[#7FFF00]/60 flex items-center justify-center transition-all group"
              >
                <Play size={28} strokeWidth={1.5} fill="#7FFF00" className="text-[#7FFF00] ml-[3px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}