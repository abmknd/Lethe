import { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
  initialData: ProfileData;
}

export interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  pronouns: string;
  avatarUrl: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    github: string;
    website: string;
  };
}

export function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isHandleLocked, setIsHandleLocked] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Handle backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData({ ...formData, avatarUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnlockHandle = () => {
    setIsHandleLocked(false);
    toast.info('You can change your handle once every 30 days');
  };

  const handleSave = () => {
    onSave(formData);
    toast.success('Profile updated');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[200] bg-black/[0.72] backdrop-blur-[6px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      >
        {/* Modal */}
        <div
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 z-[201] w-[min(580px,calc(100vw-40px))] max-h-[calc(100vh-60px)] bg-[#0b0e0b] border border-white/10 rounded-[20px] flex flex-col overflow-hidden transition-all duration-[350ms] ${
            isOpen ? 'opacity-100 -translate-y-1/2' : 'opacity-0 -translate-y-[46%] pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07] flex-shrink-0">
            <h2 className="font-['Libre_Baskerville'] text-[18px] italic font-normal text-white/88">
              Edit profile
            </h2>
            <button
              onClick={onClose}
              className="w-[30px] h-[30px] rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/80 transition-all"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Avatar Section */}
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <div
                  className="relative w-[72px] h-[72px] flex-shrink-0 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar"
                    className="w-[72px] h-[72px] rounded-full object-cover border-2 border-white/10"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0b0e0b] border-[1.5px] border-white/[0.12] flex items-center justify-center text-white/50 transition-all group-hover:bg-[rgba(173,255,47,0.1)] group-hover:border-[rgba(173,255,47,0.3)] group-hover:text-[rgba(173,255,47,0.7)]">
                    <Upload size={11} strokeWidth={1.5} />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-['Libre_Baskerville'] text-[15px] text-white/88 mb-[3px]">
                    {formData.name}
                  </div>
                  <div className="text-[12px] font-light text-white/[0.28] leading-[1.5]">
                    Click your photo to upload a new one.<br />JPG or PNG, at least 200×200px.
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Bio Section */}
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="mb-4">
                <label className="block text-[12px] font-semibold tracking-[0.2em] uppercase text-white/[0.28] mb-[6px]">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold tracking-[0.2em] uppercase text-white/[0.28] mb-[6px]">
                  Handle
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    readOnly={isHandleLocked}
                    className={`flex-1 border rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors placeholder:text-white/20 ${
                      isHandleLocked
                        ? 'bg-white/[0.02] border-white/[0.06] text-white/30 cursor-not-allowed'
                        : 'bg-white/[0.04] border-white/10 focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)]'
                    }`}
                  />
                  <button
                    onClick={handleUnlockHandle}
                    className="px-3 rounded-lg bg-white/[0.05] border border-white/10 text-white/40 text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-white/[0.08] hover:text-white/70 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
                <div className="text-[12px] font-light text-white/[0.22] mt-[5px]">
                  Handle changes are limited to once every 30 days.
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-semibold tracking-[0.2em] uppercase text-white/[0.28] mb-[6px]">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write something about yourself..."
                  className="w-full h-[88px] bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20 resize-none leading-[1.7]"
                />
              </div>

              <div className="mb-0">
                <label className="block text-[12px] font-semibold tracking-[0.2em] uppercase text-white/[0.28] mb-[6px]">
                  Gender / Pronouns
                </label>
                <select
                  value={formData.pronouns}
                  onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] pr-9 text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.2)%22%20stroke-width%3D%221.5%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] bg-[length:16px]"
                >
                  <option>She / Her / Hers</option>
                  <option>He / Him / His</option>
                  <option>They / Them / Theirs</option>
                  <option>Prefer not to say</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="px-6 py-5">
              <label className="block text-[12px] font-semibold tracking-[0.2em] uppercase text-white/[0.28] mb-3">
                Social links
              </label>

              {/* LinkedIn */}
              <div className="flex items-center gap-[10px] py-[10px] border-b border-white/[0.05]">
                <div className="w-7 h-7 rounded-[7px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/30">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </div>
                <div className="text-[12px] font-normal text-white/[0.35] w-[72px] flex-shrink-0">LinkedIn</div>
                <input
                  type="text"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                  placeholder="https://linkedin.com/in/username"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20"
                />
              </div>

              {/* Twitter/X */}
              <div className="flex items-center gap-[10px] py-[10px] border-b border-white/[0.05]">
                <div className="w-7 h-7 rounded-[7px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/30">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.844l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                  </svg>
                </div>
                <div className="text-[12px] font-normal text-white/[0.35] w-[72px] flex-shrink-0">Twitter / X</div>
                <input
                  type="text"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                  placeholder="@username"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20"
                />
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-[10px] py-[10px] border-b border-white/[0.05]">
                <div className="w-7 h-7 rounded-[7px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/30">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
                  </svg>
                </div>
                <div className="text-[12px] font-normal text-white/[0.35] w-[72px] flex-shrink-0">Instagram</div>
                <input
                  type="text"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                  placeholder="@username"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20"
                />
              </div>

              {/* GitHub */}
              <div className="flex items-center gap-[10px] py-[10px] border-b border-white/[0.05]">
                <div className="w-7 h-7 rounded-[7px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/30">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </div>
                <div className="text-[12px] font-normal text-white/[0.35] w-[72px] flex-shrink-0">GitHub</div>
                <input
                  type="text"
                  value={formData.socialLinks.github}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                  placeholder="https://github.com/username"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20"
                />
              </div>

              {/* Website */}
              <div className="flex items-center gap-[10px] py-[10px]">
                <div className="w-7 h-7 rounded-[7px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-white/30">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                  </svg>
                </div>
                <div className="text-[12px] font-normal text-white/[0.35] w-[72px] flex-shrink-0">Website</div>
                <input
                  type="text"
                  value={formData.socialLinks.website}
                  onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                  placeholder="https://yoursite.com"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-[10px] px-[14px] py-[10px] text-[13px] font-light text-white/88 outline-none transition-colors focus:border-[rgba(173,255,47,0.3)] focus:bg-[rgba(173,255,47,0.02)] placeholder:text-white/20"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.07] flex gap-[10px] justify-end flex-shrink-0 bg-[#0b0e0b]">
            <button
              onClick={onClose}
              className="px-[18px] py-[10px] rounded-[10px] bg-transparent border border-white/10 text-white/40 text-[12px] font-medium tracking-[0.08em] uppercase hover:bg-white/[0.05] hover:text-white/70 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-[10px] rounded-[10px] bg-white/10 border border-white/[0.18] text-white/88 text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-white/[0.16] hover:border-white/[0.28] hover:text-white transition-all"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}