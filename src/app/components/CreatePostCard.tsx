import { useTheme } from "../context/ThemeContext";
import { Image, FileText, Plus } from "lucide-react";
import { useState } from "react";

interface CreatePostCardProps {
  avatarUrl?: string;
  username?: string;
}

export function CreatePostCard({ 
  avatarUrl = "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NzIyMTAxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  username = "Camus"
}: CreatePostCardProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const textColor = theme === "dark" ? "text-[#d4d4d4]" : "text-[#3A3A3A]";
  const textSecondary = theme === "dark" ? "text-[#6B6B6B]" : "text-[#9B9B9B]";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";
  const iconColor = theme === "dark" ? "text-[#6B6B6B]" : "text-[#9B9B9B]";
  const buttonBg = theme === "dark" ? "bg-[#1a1a1a]" : "bg-[#E5E5E5]";
  const buttonTextColor = theme === "dark" ? "text-[#d4d4d4]" : "text-[#3A3A3A]";
  
  const handleCancel = () => {
    setIsExpanded(false);
  };
  
  if (!isExpanded) {
    // Collapsed state - simple horizontal layout
    return (
      <div 
        className={`${bg} rounded-2xl border ${border} shadow-2xl ${theme === "dark" ? "shadow-black/60" : "shadow-black/10"} p-4 transition-colors duration-300 cursor-text`}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={username}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className={`flex-1 ${textSecondary} text-[15px] font-sans`}>
            What's on your mind?
          </div>
        </div>
      </div>
    );
  }
  
  // Expanded state - full form
  return (
    <div className={`${bg} rounded-2xl border ${border} shadow-2xl ${theme === "dark" ? "shadow-black/60" : "shadow-black/10"} p-5 transition-colors duration-300`}>
      {/* Top Row with Avatar and Username */}
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className={`${textColor} mb-2 font-serif`}>{username}</div>
          <textarea
            placeholder="What's on your mind?"
            className={`w-full bg-transparent border-none ${textSecondary} text-[15px] font-sans placeholder:${textSecondary} focus:outline-none resize-none leading-[1.6]`}
            rows={4}
            autoFocus
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-opacity-50" style={{ borderColor: theme === "dark" ? "#1a1a1a" : "#E5E5E5" }}>
        {/* Left: Media Icons */}
        <div className="flex items-center gap-3">
          <button className={`${iconColor} hover:text-${theme === "dark" ? "[#9B9B9B]" : "[#6B6B6B]"} transition-colors`}>
            <Image className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className={`${iconColor} hover:text-${theme === "dark" ? "[#9B9B9B]" : "[#6B6B6B]"} transition-colors`}>
            <FileText className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className={`${iconColor} hover:text-${theme === "dark" ? "[#9B9B9B]" : "[#6B6B6B]"} transition-colors`}>
            <Plus className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCancel}
            className={`${buttonBg} ${buttonTextColor} px-5 py-2 rounded-full text-[13px] font-sans transition-colors hover:opacity-80`}
          >
            Cancel
          </button>
          <button 
            className={`px-5 py-2 rounded-full text-[13px] font-sans transition-colors`}
            style={{ 
              backgroundColor: accentColor, 
              color: theme === "dark" ? "#000" : "#fff" 
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}