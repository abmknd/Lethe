import { useState } from "react";

type FilterOption = "all" | "following" | "echoed";

interface FeedFiltersProps {
  onCreateClick: () => void;
}

export function FeedFilters({ onCreateClick }: FeedFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const filters = [
    { id: "all" as const, label: "ALL" },
    { id: "following" as const, label: "FOLLOWING" },
    { id: "echoed" as const, label: "ECHOES" },
  ];

  return (
    <div className="flex items-center justify-between w-full">
      {/* Filter tabs */}
      <div className="bg-relethe-surface rounded-full border border-relethe-line inline-flex px-2 py-1.5 gap-1 transition-colors duration-300">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-1 rounded-full text-[length:var(--relethe-text-xs)] tracking-[length:var(--relethe-tracking-ui)] font-sans transition-all duration-300 ${
                isActive ? "text-relethe-fg" : "text-relethe-line-dim"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Create button */}
      <button
        onClick={onCreateClick}
        className="border border-relethe-accent rounded-full px-4 py-1.5 text-[length:var(--relethe-text-xs)] tracking-[length:var(--relethe-tracking-ui)] uppercase font-light font-sans text-relethe-accent transition-all duration-300 hover:bg-relethe-accent-bg"
      >
        CREATE
      </button>
    </div>
  );
}
