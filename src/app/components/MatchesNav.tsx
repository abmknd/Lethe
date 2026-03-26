import { Tooltip } from "./Tooltip";

interface MatchesNavProps {
  activeTab: "suggestions" | "recent" | "upcoming";
  onTabChange: (tab: "suggestions" | "recent" | "upcoming") => void;
  isMatchmakingEnabled: boolean;
  onToggleMatchmaking: () => void;
}

export function MatchesNav({
  activeTab,
  onTabChange,
  isMatchmakingEnabled,
  onToggleMatchmaking,
}: MatchesNavProps) {
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
      {/* Tab navigation */}
      <div className="bg-lethe-surface rounded-full border border-lethe-line inline-flex px-2 py-1.5 gap-1 transition-colors duration-300">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-1 rounded-full text-[length:var(--lethe-text-xs)] tracking-[length:var(--lethe-tracking-ui)] font-sans transition-all duration-300 ${
                isActive ? "text-lethe-fg" : "text-lethe-line-dim"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Status + toggle */}
      <div className="flex items-center gap-3">
        <span
          className={`text-[length:var(--lethe-text-xs)] tracking-[length:var(--lethe-tracking-ui)] uppercase font-light font-sans transition-colors duration-300 ${
            isMatchmakingEnabled ? "text-lethe-accent" : "text-lethe-muted"
          }`}
        >
          {isMatchmakingEnabled ? "You're up for matching" : "You've paused matching"}
        </span>

        <Tooltip text={tooltipText}>
          <button
            onClick={onToggleMatchmaking}
            className="relative inline-flex h-[26px] w-[54px] items-center rounded-full transition-all duration-300"
            style={{
              backgroundColor: isMatchmakingEnabled
                ? "var(--accent-primary)"
                : "var(--lethe-line-subtle)",
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${
                isMatchmakingEnabled
                  ? "translate-x-[35px] bg-black"
                  : "translate-x-1 bg-white"
              }`}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
