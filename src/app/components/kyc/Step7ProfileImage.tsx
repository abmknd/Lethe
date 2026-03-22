import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { KYCData } from '../KYCModal';

interface Step7Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}

export function Step7ProfileImage({ isActive, direction, data, updateData }: Step7Props) {
  const [preview, setPreview] = useState<string | null>(data.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        updateData({ profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`kyc-step ${getClassName()}`}>
      <span className="font-['Inter'] text-[10px] tracking-[0.3em] uppercase text-[#7FFF00]/50 mb-[14px] block">
        Your profile
      </span>
      <h1 className="font-['Libre_Baskerville'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
        Add a profile<br />
        <em className="not-italic text-[#7FFF00]">image.</em>
      </h1>
      <p className="text-[15px] font-light leading-[1.75] text-white/45 mb-10">
        This basic information will be shown to your matches every week. Tell us what you'd like to show!
      </p>

      {/* Profile Image Display */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-[140px] h-[140px] mb-6">
          {preview ? (
            <img 
              src={preview} 
              alt="Profile preview" 
              className="w-full h-full rounded-full object-cover border-2 border-white/[0.12]"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#7FFF00]/[0.04] flex items-center justify-center border-2 border-[#7FFF00]/30">
              <svg 
                width="60" 
                height="80" 
                viewBox="0 0 60 80" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-100"
              >
                {/* Head */}
                <circle cx="30" cy="20" r="15" fill="#7FFF00" />
                {/* Shoulders/body */}
                <path 
                  d="M0 80 C0 80, 10 50, 30 50 C50 50, 60 80, 60 80 Z" 
                  fill="#7FFF00"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUploadClick}
          className="w-full max-w-[380px] py-[16px] px-6 rounded-full border-none font-['Inter'] text-[11px] tracking-[0.22em] uppercase bg-[#7FFF00] hover:bg-[#c8ff4f] text-[#050705] transition-all flex items-center justify-center gap-2"
        >
          <Upload size={14} strokeWidth={2.5} />
          {preview ? 'Change image' : 'Upload image'}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Optional: Skip message */}
      <p className="text-center font-['Inter'] text-[10px] tracking-[0.14em] text-white/30 mt-6">
        You can always add this later in your profile settings
      </p>
    </div>
  );
}