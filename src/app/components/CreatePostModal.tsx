import { Image, FileText, Plus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
}

export function CreatePostModal({ isOpen, onClose, avatarUrl }: CreatePostModalProps) {
  const { theme } = useTheme();
  const [postText, setPostText] = useState("");

  if (!isOpen) return null;

  const bg = theme === "dark" ? "bg-[#1a1a1a]" : "bg-white";
  const text = theme === "dark" ? "text-white" : "text-black";
  const textSecondary = theme === "dark" ? "text-[#6B6B6B]" : "text-[#9B9B9B]";
  const iconColor = theme === "dark" ? "text-[#6B6B6B]" : "text-[#9B9B9B]";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";
  const border = theme === "dark" ? "border-[#2a2a2a]" : "border-[#E5E5E5]";

  const handlePost = () => {
    // Handle post creation
    console.log("Creating post:", postText);
    setPostText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/30">
      <div 
        className={`${bg} border ${border} rounded-2xl p-6 w-full max-w-2xl transition-colors duration-300`}
      >
        {/* Header with avatar and username */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={avatarUrl}
            alt="Your avatar"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-1 ring-[#2a2a2a]"
          />
          <span className={`${text} text-[16px] font-light font-sans tracking-wide`}>
            Camus
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="What's on your mind?"
          className={`w-full ${bg} ${text} placeholder:${textSecondary} resize-none focus:outline-none font-sans text-[15px] min-h-[100px] mb-6`}
          autoFocus
        />

        {/* Divider line */}
        <div className={`border-t ${border} mb-4`} />

        {/* Bottom actions */}
        <div className="flex items-center justify-between">
          {/* Left: Icon buttons */}
          <div className="flex items-center gap-3">
            <button className={`${iconColor} hover:opacity-70 transition-opacity`}>
              <Image className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className={`${iconColor} hover:opacity-70 transition-opacity`}>
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className={`${iconColor} hover:opacity-70 transition-opacity`}>
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Right: Cancel and Post buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`px-5 py-2 text-[13px] font-sans ${textSecondary} hover:opacity-70 transition-opacity tracking-wide`}
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={!postText.trim()}
              className={`px-5 py-2 rounded-full text-[13px] font-sans transition-all duration-300 tracking-wide`}
              style={{
                backgroundColor: postText.trim() ? accentColor : "#3A3A3A",
                color: postText.trim() 
                  ? "#000" 
                  : "#6B6B6B",
                cursor: postText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}