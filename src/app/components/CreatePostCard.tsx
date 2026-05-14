import { Image, FileText, Plus } from "lucide-react";
import { useState } from "react";

interface CreatePostCardProps {
  avatarUrl?: string;
  username?: string;
}

export function CreatePostCard({
  avatarUrl = "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NzIyMTAxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  username = "Camus",
}: CreatePostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCancel = () => setIsExpanded(false);

  if (!isExpanded) {
    return (
      <div
        className="bg-relethe-surface rounded-2xl border border-relethe-line shadow-2xl p-4 transition-colors duration-300 cursor-text"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={username}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 text-relethe-muted text-[length:var(--relethe-text-md)] font-sans">
            What's on your mind?
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-relethe-surface rounded-2xl border border-relethe-line shadow-2xl p-5 transition-colors duration-300">
      {/* Top Row */}
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="text-relethe-dim mb-2 font-display">{username}</div>
          <textarea
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none text-relethe-muted text-[length:var(--relethe-text-md)] font-sans placeholder:text-relethe-muted focus:outline-none resize-none leading-[var(--relethe-leading-relaxed)]"
            rows={4}
            autoFocus
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-relethe-line">
        {/* Media icons */}
        <div className="flex items-center gap-3">
          <button className="text-relethe-muted hover:text-relethe-ghost transition-colors">
            <Image className="w-[var(--relethe-icon-lg)] h-[var(--relethe-icon-lg)]" strokeWidth={1.5} />
          </button>
          <button className="text-relethe-muted hover:text-relethe-ghost transition-colors">
            <FileText className="w-[var(--relethe-icon-lg)] h-[var(--relethe-icon-lg)]" strokeWidth={1.5} />
          </button>
          <button className="text-relethe-muted hover:text-relethe-ghost transition-colors">
            <Plus className="w-[var(--relethe-icon-lg)] h-[var(--relethe-icon-lg)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="bg-relethe-raised text-relethe-dim px-5 py-2 rounded-full text-[length:var(--relethe-text-sm)] font-sans transition-colors hover:opacity-80"
          >
            Cancel
          </button>
          <button
            className="bg-relethe-accent text-black px-5 py-2 rounded-full text-[length:var(--relethe-text-sm)] font-sans transition-colors hover:opacity-90"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
