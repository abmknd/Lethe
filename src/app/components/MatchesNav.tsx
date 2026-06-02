import { Tooltip } from "./Tooltip";

interface MatchesNavProps {
  activeTab: "suggestions" | "recent" | "upcoming";
  onTabChange: (tab: "suggestions" | "recent" | "upcoming") => void;
  isMatchmakingEnabled: boolean;
  onToggleMatchmaking: () => void;
  // #76.3 — when > 0, show a dot on SUGGESTIONS. ConnectPage clears it by
  // calling markMatchesSeen on mount.
  newMatchCount?: number;
}

export function MatchesNav({
  activeTab,
  onTabChange,
  isMatchmakingEnabled,
  onToggleMatchmaking,
  newMatchCount = 0,
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
      <div className="bg-relethe-surface rounded-full border border-relethe-line inline-flex px-2 py-1.5 gap-1 transition-colors duration-300">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showDot = tab.id === "suggestions" && newMatchCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-5 py-1 rounded-full text-[length:var(--relethe-text-xs)] tracking-[length:var(--relethe-tracking-ui)] font-sans transition-all duration-300 ${
                isActive ? "text-relethe-fg" : "text-relethe-line-dim"
              }`}
            >
              {tab.label}
              {showDot && (
                <span
                  aria-label={`${newMatchCount} new match${newMatchCount === 1 ? '' : 'es'}`}
                  className="absolute top-0 right-1 w-[6px] h-[6px] rounded-full bg-[#ADFF2F] shadow-[0_0_6px_rgba(173,255,47,0.7)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Status + toggle */}
      <div className="flex items-center gap-3">
        <span
          className={`text-[length:var(--relethe-text-xs)] tracking-[length:var(--relethe-tracking-ui)] uppercase font-light font-sans transition-colors duration-300 ${
            isMatchmakingEnabled ? "text-relethe-accent" : "text-relethe-muted"
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
                : "var(--relethe-line-subtle)",
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
