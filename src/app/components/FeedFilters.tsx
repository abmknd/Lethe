import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

type FilterOption = "all" | "following" | "echoed";

interface FeedFiltersProps {
  onCreateClick: () => void;
}

export function FeedFilters({ onCreateClick }: FeedFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const { theme } = useTheme();
  
  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const text = theme === "dark" ? "text-white" : "text-black";
  const textInactive = theme === "dark" ? "text-[#3A3A3A]" : "text-[#9B9B9B]";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  const filters = [
    { id: "all" as const, label: "ALL" },
    { id: "following" as const, label: "FOLLOWING" },
    { id: "echoed" as const, label: "ECHOES" },
  ];

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Filter tabs */}
      <div className={`${bg} rounded-full border ${border} inline-flex px-2 py-1.5 gap-1 transition-colors duration-300`}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-1 rounded-full text-[11px] tracking-[0.2em] font-sans transition-all duration-300 ${
                isActive ? text : textInactive
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Right: Create button */}
      <button
        onClick={onCreateClick}
        className={`border rounded-full px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase font-light font-sans transition-all duration-300`}
        style={{
          borderColor: accentColor,
          color: accentColor,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(127, 255, 0, 0.15)" : "rgba(93, 159, 0, 0.15)";
          e.currentTarget.style.color = accentColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = accentColor;
        }}
      >
        CREATE
      </button>
    </div>
  );
}