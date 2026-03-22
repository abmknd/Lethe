import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MessageCircle, Share, X, MoreVertical } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Tooltip } from "./Tooltip";
import ArcticonsTetherfi from "../../imports/ArcticonsTetherfi";
import { PostOptionsMenu } from "./PostOptionsMenu";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";

interface PostCardProps {
  avatar: string;
  username: string;
  timestamp: string;
  text: string;
  image?: string;
  halfLifeProgress: number;
  status: "flowing" | "fading" | "faded";
  isFollowing?: boolean;
  fadingIn?: string; // e.g., "6mins"
  onFadedClick?: () => void; // Optional click handler for faded posts
}

// Circular progress indicator component
// function HalfLifeIndicator({ progress, status }: { progress: number; status: string }) {
//   const bars = 12; // Number of bars in the spinner
//   const activeBars = Math.round((progress / 100) * bars);
//   const isFossil = status === 'faded';
  
//   return (
//     <div 
//       className="relative w-[18px] h-[18px] flex items-center justify-center"
//       title={`${progress}% fresh`}
//     >
//       <svg width="18" height="18" viewBox="0 0 18 18">
//         {Array.from({ length: bars }).map((_, index) => {
//           const angle = (index * 360) / bars;
//           const isActive = index < activeBars;
//           // No green bars for fossil posts
//           const strokeColor = (isActive && !isFossil) ? "rgb(127, 255, 0)" : "rgb(58, 58, 58)";
//           const opacity = (isActive && !isFossil) ? 0.9 : 0.25;
          
//           return (
//             <line
//               key={index}
//               x1="9"
//               y1="2.5"
//               x2="9"
//               y2="5"
//               stroke={strokeColor}
//               strokeWidth="1.5"
//               strokeLinecap="round"
//               opacity={opacity}
//               transform={`rotate(${angle} 9 9)`}
//             />
//           );
//         })}
//       </svg>
//     </div>
//   );
// }

export function PostCard({ 
  avatar, 
  username, 
  timestamp, 
  text, 
  image,
  halfLifeProgress,
  status,
  isFollowing = false,
  fadingIn,
  onFadedClick
}: PostCardProps) {
  const { theme } = useTheme();
  
  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const badgeBg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#EFEFEF]";
  const badgeBorder = theme === "dark" ? "border-[#1a1a1a]" : "border-[#D0D0D0]";
  const textPrimary = theme === "dark" ? "text-white" : "text-black";
  const textSecondary = theme === "dark" ? "text-[#d4d4d4]" : "text-[#3A3A3A]";
  const shadowColor = theme === "dark" ? "shadow-black/60" : "shadow-black/10";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  // Determine status badge styling
  const getStatusBadge = () => {
    if (status === "faded") {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeBg} border ${badgeBorder} transition-colors duration-300`}>
          <div className="w-1 h-1 rounded-full bg-[#6B6B6B]" />
          <span className="text-[#6B6B6B] text-[9px] tracking-[0.2em] uppercase font-light">FADED</span>
        </div>
      );
    }
    if (status === "fading" && fadingIn) {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeBg} border ${badgeBorder} transition-colors duration-300`}>
          <div className="w-1 h-1 rounded-full bg-[#CC9933]" />
          <span className="text-[#CC9933] text-[9px] tracking-[0.2em] uppercase font-light">FADING IN {fadingIn}</span>
        </div>
      );
    }
    return null;
  };

  // Apply visual effects based on status
  const getTextOpacity = () => {
    if (status === "fading") return "opacity-75";
    if (status === "faded") return "opacity-50 blur-[0.3px]";
    return "";
  };

  const isFossil = status === "faded";
  const isFading = status === "fading";
  const actionButtonColor = isFossil ? "text-[#3A3A3A]" : "text-[#6B6B6B]";
  const actionButtonHoverColor = isFossil ? "" : "hover:text-white";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const navigate = useNavigate();

  return (
    <article 
      className={`relative ${bg} rounded-2xl border ${border} shadow-2xl ${shadowColor} overflow-hidden group transition-colors duration-300 ${isFossil && onFadedClick ? 'cursor-pointer' : ''}`} 
      data-status={status}
      onClick={() => {
        if (isFossil && onFadedClick) {
          onFadedClick();
        }
      }}
    >
      {/* Optional image at top */}
      {image && (
        <div className={`w-full bg-black max-h-48 overflow-hidden ${isFossil ? "blur-[8px]" : ""}`}>
          <ImageWithFallback
            src={image}
            alt="Post image"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative p-5" ref={menuRef}>
        {/* Header with Avatar, Username, and Top-Right Actions */}
        <div className="flex gap-3 mb-4">
          {/* Avatar */}
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/${username}`);
            }}
          >
            <ImageWithFallback
              src={avatar}
              alt={username}
              className="w-10 h-10 rounded-full object-cover bg-[#1a1a1a] ring-1 ring-[#2a2a2a] hover:ring-[#7FFF00]/40 transition-all"
            />
          </div>

          {/* Username and timestamp */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2.5">
                <span 
                  className="text-white text-[15px] font-light font-sans tracking-wide cursor-pointer hover:text-[#7FFF00] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${username}`);
                  }}
                >
                  {username}
                </span>
                <span className="text-[#6B6B6B] text-[13px] tracking-wider font-light font-sans">
                  {timestamp}
                </span>
              </div>
              <button className={`text-[13px] tracking-wide font-light transition-colors text-left font-sans ${
                isFollowing ? 'text-[#6B6B6B] hover:text-[#9B9B9B]' : 'text-white hover:text-[#7FFF00]'
              }`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Top-right actions: three dots only */}
          <div className="flex-shrink-0 self-start flex items-center gap-3">
            <button 
              ref={buttonRef}
              onClick={handleMenuClick}
              className="text-[#3A3A3A] hover:text-[#6B6B6B] transition-colors"
            >
              <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Post Options Menu */}
        {isMenuOpen && buttonRef.current && (
          <PostOptionsMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            type="feed"
            position={{
              top: buttonRef.current.getBoundingClientRect().bottom + 4,
              left: buttonRef.current.getBoundingClientRect().left - 220,
            }}
          />
        )}

        {/* Status Badge */}
        <div className="mb-3">
          {getStatusBadge()}
        </div>

        {/* Post text */}
        <div className="relative mb-5">
          <p className={`leading-[1.7] tracking-wide text-[14px] font-light font-serif ${
            status === 'faded' ? 'text-[#6B6B6B] blur-[3px] select-none' : 
            status === 'fading' ? 'text-[#8B8B8B]' : 'text-[#d4d4d4]'
          }`}>
            {text}
          </p>
          {status === 'faded' && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 backdrop-blur-[0.5px] pointer-events-none" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button 
              disabled={isFossil}
              className={`flex items-center gap-2 ${actionButtonColor} ${actionButtonHoverColor} transition-colors group/btn ${isFossil ? 'cursor-not-allowed' : ''}`}
            >
              <MessageCircle className={`w-[18px] h-[18px] ${isFossil ? '' : 'group-hover/btn:scale-110'} transition-transform`} strokeWidth={1.5} />
            </button>
            
            <Tooltip text="echo this post">
              <button 
                disabled={isFossil}
                className={`flex items-center gap-2 ${actionButtonColor} ${actionButtonHoverColor} transition-colors group/btn ${isFossil ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`w-[18px] h-[18px] ${isFossil ? '' : 'group-hover/btn:scale-110'} transition-transform`} style={{ color: 'currentColor' }}>
                  <ArcticonsTetherfi />
                </div>
              </button>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-4">
            {/* <div className="flex items-center">
              <HalfLifeIndicator progress={halfLifeProgress} status={status} />
            </div> */}
            
            <button 
              disabled={isFossil}
              className={`flex items-center gap-2 ${actionButtonColor} ${actionButtonHoverColor} transition-colors group/btn ${isFossil ? 'cursor-not-allowed' : ''}`}
            >
              <Share className={`w-[18px] h-[18px] ${isFossil ? '' : 'group-hover/btn:scale-110'} transition-transform`} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}