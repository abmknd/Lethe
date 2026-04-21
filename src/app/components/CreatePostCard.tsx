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
        className="bg-lethe-surface rounded-2xl border border-lethe-line shadow-2xl p-4 transition-colors duration-300 cursor-text"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={username}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 text-lethe-muted text-[length:var(--lethe-text-md)] font-sans">
            What's on your mind?
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-lethe-surface rounded-2xl border border-lethe-line shadow-2xl p-5 transition-colors duration-300">
      {/* Top Row */}
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="text-lethe-dim mb-2 font-display">{username}</div>
          <textarea
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none text-lethe-muted text-[length:var(--lethe-text-md)] font-sans placeholder:text-lethe-muted focus:outline-none resize-none leading-[var(--lethe-leading-relaxed)]"
            rows={4}
            autoFocus
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-lethe-line">
        {/* Media icons */}
        <div className="flex items-center gap-3">
          <button className="text-lethe-muted hover:text-lethe-ghost transition-colors">
            <Image className="w-[var(--lethe-icon-lg)] h-[var(--lethe-icon-lg)]" strokeWidth={1.5} />
          </button>
          <button className="text-lethe-muted hover:text-lethe-ghost transition-colors">
            <FileText className="w-[var(--lethe-icon-lg)] h-[var(--lethe-icon-lg)]" strokeWidth={1.5} />
          </button>
          <button className="text-lethe-muted hover:text-lethe-ghost transition-colors">
            <Plus className="w-[var(--lethe-icon-lg)] h-[var(--lethe-icon-lg)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="bg-lethe-raised text-lethe-dim px-5 py-2 rounded-full text-[length:var(--lethe-text-sm)] font-sans transition-colors hover:opacity-80"
          >
            Cancel
          </button>
          <button
            className="bg-lethe-accent text-black px-5 py-2 rounded-full text-[length:var(--lethe-text-sm)] font-sans transition-colors hover:opacity-90"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
