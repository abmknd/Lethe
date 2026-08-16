import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { StepProps } from './kycData';
import { supabase } from '../../../lib/supabase';
import { Button, StepHeader } from '../../../rebrand/primitives';

/**
 * Step 7.
 *
 * Light, like the rest of the flow — and here the convention earns it twice
 * over: the photo is the first thing that becomes KNOWN about you, and known
 * reads light. (redesign.md 5.11, surface encodes what is known.)
 */
export function Step7ProfileImage({ data, updateData, userId }: StepProps & { userId?: string }) {
  // `data.profileImage` is the public URL that will be persisted to
  // `users.avatar_url` in handleFinish. We keep `localPreview` for the
  // instant-feedback render between file-pick and Storage upload completing.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preview = localPreview ?? data.profileImage ?? null;

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

  return (
    <div>
      <StepHeader
        label="YOUR PROFILE"
        heading={
          <>
            Add a profile
            <br />
            <span className="text-[var(--color-blue-600)]">image.</span>
          </>
        }
        body="Your matches see this every week. Tell us what you'd like to show."
      />

      <div className="flex flex-col items-center gap-[20px] py-[24px]">
        <div
          className="grid size-[140px] place-items-center overflow-hidden rounded-full"
          // A hatch, not a grey disc: an empty avatar has to read as "nothing
          // here yet" rather than as a photo that failed to load. Both stripes
          // are ramp steps.
          style={{
            background: preview
              ? undefined
              : 'repeating-linear-gradient(135deg, var(--color-black-50) 0 6px, var(--color-black-100) 6px 12px)',
          }}
        >
          {preview ? (
            <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <span className="rounded-[6px] bg-[var(--color-white)] px-[8px] py-[5px] text-[12px] leading-none text-[var(--color-black-700)]">
              portrait
            </span>
          )}
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full max-w-[380px]"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'UPLOADING…' : preview ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
        </Button>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      <p className="text-center text-[13px] leading-[18px] text-[var(--color-black-500)]">
        You can always add this later in your profile settings.
      </p>
    </div>
  );
}
