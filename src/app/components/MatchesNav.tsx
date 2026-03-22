import { useTheme } from "../context/ThemeContext";
import { Tooltip } from "./Tooltip";

interface MatchesNavProps {
  activeTab: "suggestions" | "recent" | "upcoming";
  onTabChange: (tab: "suggestions" | "recent" | "upcoming") => void;
  isMatchmakingEnabled: boolean;
  onToggleMatchmaking: () => void;
}

export function MatchesNav({ activeTab, onTabChange, isMatchmakingEnabled, onToggleMatchmaking }: MatchesNavProps) {
  const { theme } = useTheme();
  
  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const text = theme === "dark" ? "text-white" : "text-black";
  const textInactive = theme === "dark" ? "text-[#3A3A3A]" : "text-[#9B9B9B]";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  const tabs = [
    { id: "suggestions" as const, label: "SUGGESTIONS" },
    { id: "recent" as const, label: "ALL MATCHES" },
    { id: "upcoming" as const, label: "UPCOMING" },
  ];

  const tooltipText = isMatchmakingEnabled 
    ? "pause meetings for now" 
    : "start having meetings again";

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Tab navigation */}
      <div className={`${bg} rounded-full border ${border} inline-flex px-2 py-1.5 gap-1 transition-colors duration-300`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-1 rounded-full text-[11px] tracking-[0.2em] font-sans transition-all duration-300 ${
                isActive ? text : textInactive
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Status text and Toggle */}
      <div className="flex items-center gap-3">
        <span 
          className="text-[11px] tracking-[0.2em] uppercase font-light font-sans transition-colors duration-300"
          style={{ color: isMatchmakingEnabled ? "#7FFF00" : "#6B6B6B" }}
        >
          {isMatchmakingEnabled ? "You're up for matching" : "You've paused matching"}
        </span>
        
        <Tooltip text={tooltipText}>
          <button
            onClick={onToggleMatchmaking}
            className="relative inline-flex h-[26px] w-[54px] items-center rounded-full transition-all duration-300 group"
            style={{
              backgroundColor: isMatchmakingEnabled ? accentColor : theme === "dark" ? "#2a2a2a" : "#D0D0D0"
            }}
          >
            {/* Toggle circle */}
            <span
              className={`inline-block h-[16px] w-[16px] transform rounded-full transition-all duration-300 ${
                isMatchmakingEnabled ? "translate-x-[35px] bg-black" : "translate-x-1 bg-white"
              }`}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}