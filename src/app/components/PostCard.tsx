import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MessageCircle, Share, MoreVertical } from "lucide-react";
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
  onFadedClick?: () => void;
}

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
  onFadedClick,
}: PostCardProps) {
  const isFossil = status === "faded";
  const isFading = status === "fading";

  const getStatusBadge = () => {
    if (status === "faded") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-relethe-surface border border-relethe-line-dim transition-colors duration-300">
          <div className="w-1 h-1 rounded-full bg-relethe-status-faded" />
          <span className="text-relethe-status-faded text-[length:var(--relethe-text-2xs)] tracking-[length:var(--relethe-tracking-ui)] uppercase font-light">
            FADED
          </span>
        </div>
      );
    }
    if (status === "fading" && fadingIn) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-relethe-surface border border-relethe-line-dim transition-colors duration-300">
          <div className="w-1 h-1 rounded-full bg-relethe-status-fading" />
          <span className="text-relethe-status-fading text-[length:var(--relethe-text-2xs)] tracking-[length:var(--relethe-tracking-ui)] uppercase font-light">
            FADING IN {fadingIn}
          </span>
        </div>
      );
    }
    return null;
  };

  const actionColor = isFossil
    ? "text-relethe-line-dim"
    : "text-relethe-muted hover:text-relethe-fg";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = (e: MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const navigate = useNavigate();

  return (
    <article
      className={`relative bg-relethe-surface rounded-2xl border border-relethe-line shadow-2xl overflow-hidden group transition-colors duration-300 ${
        isFossil && onFadedClick ? "cursor-pointer" : ""
      }`}
      data-status={status}
      onClick={() => {
        if (isFossil && onFadedClick) onFadedClick();
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
        {/* Header */}
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
              className="w-10 h-10 rounded-full object-cover bg-relethe-raised ring-1 ring-relethe-line-subtle hover:ring-relethe-accent/40 transition-all"
            />
          </div>

          {/* Username and timestamp */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2.5">
                <span
                  className="text-relethe-fg text-[length:var(--relethe-text-md)] font-light font-sans tracking-wide cursor-pointer hover:text-relethe-accent transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${username}`);
                  }}
                >
                  {username}
                </span>
                <span className="text-relethe-muted text-[length:var(--relethe-text-sm)] tracking-wider font-light font-sans">
                  {timestamp}
                </span>
              </div>
              <button
                className={`text-[length:var(--relethe-text-sm)] tracking-wide font-light transition-colors text-left font-sans ${
                  isFollowing
                    ? "text-relethe-muted hover:text-relethe-ghost"
                    : "text-relethe-fg hover:text-relethe-accent"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="flex-shrink-0 self-start flex items-center gap-3">
            <button
              ref={buttonRef}
              onClick={handleMenuClick}
              className="text-relethe-line-dim hover:text-relethe-muted transition-colors"
            >
              <MoreVertical className="w-[var(--relethe-icon-md)] h-[var(--relethe-icon-md)]" strokeWidth={1.5} />
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
        <div className="mb-3">{getStatusBadge()}</div>

        {/* Post text */}
        <div className="relative mb-5">
          <p
            className={`leading-[var(--relethe-leading-loose)] tracking-[var(--relethe-tracking-body)] text-[length:var(--relethe-text-sm)] font-light font-display ${
              status === "faded"
                ? "text-relethe-muted blur-[3px] select-none"
                : status === "fading"
                ? "text-relethe-muted"
                : "text-relethe-dim"
            }`}
          >
            {text}
          </p>
          {status === "faded" && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 backdrop-blur-[0.5px] pointer-events-none" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              disabled={isFossil}
              className={`flex items-center gap-2 ${actionColor} transition-colors group/btn ${isFossil ? "cursor-not-allowed" : ""}`}
            >
              <MessageCircle
                className={`w-[var(--relethe-icon-md)] h-[var(--relethe-icon-md)] ${isFossil ? "" : "group-hover/btn:scale-110"} transition-transform`}
                strokeWidth={1.5}
              />
            </button>

            <Tooltip text="echo this post">
              <button
                disabled={isFossil}
                className={`flex items-center gap-2 ${actionColor} transition-colors group/btn ${isFossil ? "cursor-not-allowed" : ""}`}
              >
                <div
                  className={`w-[var(--relethe-icon-md)] h-[var(--relethe-icon-md)] ${isFossil ? "" : "group-hover/btn:scale-110"} transition-transform`}
                  style={{ color: "currentColor" }}
                >
                  <ArcticonsTetherfi />
                </div>
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-4">
            <button
              disabled={isFossil}
              className={`flex items-center gap-2 ${actionColor} transition-colors group/btn ${isFossil ? "cursor-not-allowed" : ""}`}
            >
              <Share
                className={`w-[var(--relethe-icon-md)] h-[var(--relethe-icon-md)] ${isFossil ? "" : "group-hover/btn:scale-110"} transition-transform`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
