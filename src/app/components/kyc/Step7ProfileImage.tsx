import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { KYCData } from '../KYCModal';
import { supabase } from '../../../lib/supabase';

interface Step7Props {
  isActive: boolean;
  direction: 'forward' | 'back';
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
  userId?: string;
}

export function Step7ProfileImage({ isActive, direction, data, updateData, userId }: Step7Props) {
  // `data.profileImage` is the public URL that will be persisted to
  // `users.avatar_url` in handleFinish. We keep `localPreview` for the
  // instant-feedback render between file-pick and Storage upload completing.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preview = localPreview ?? data.profileImage ?? null;

  const getClassName = () => {
    if (isActive) return 'kyc-step-active';
    if (direction === 'forward') return 'kyc-step-exit-left';
    return 'kyc-step-exit-right';
  };

  // #78.2 — upload picked image to the `avatars` Supabase Storage bucket
  // (public-read + owner-write via RLS). We mirror SettingsPage.handleAvatarFile
  // so the bucket layout is identical and a returning user editing in Settings
  // overwrites the same object.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Pick an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }
    if (!userId) {
      toast.error('You must be signed in to upload a photo.');
      return;
    }

    // Instant preview from local FileReader while the upload runs.
    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache-buster so the new image renders immediately even though the URL
      // is stable across overwrites.
      const url = `${pub.publicUrl}?v=${Date.now()}`;
      updateData({ profileImage: url });
      setLocalPreview(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      setLocalPreview(null);
    } finally {
      setUploading(false);
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
      <h1 className="font-['Cormorant_Garamond'] text-[clamp(28px,4vw,40px)] font-light italic leading-[1.15] tracking-[-0.02em] text-white/90 mb-[10px]">
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
          disabled={uploading}
          className="w-full max-w-[380px] py-[16px] px-6 rounded-full border-none font-['Inter'] text-[11px] tracking-[0.22em] uppercase bg-[#7FFF00] hover:bg-[#c8ff4f] disabled:opacity-60 disabled:cursor-not-allowed text-[#050705] transition-all flex items-center justify-center gap-2"
        >
          <Upload size={14} strokeWidth={2.5} />
          {uploading ? 'Uploading…' : preview ? 'Change image' : 'Upload image'}
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