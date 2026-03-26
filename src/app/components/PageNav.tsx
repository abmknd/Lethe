interface PageNavProps {
  activePage: "posts" | "matches";
  onPageChange: (page: "posts" | "matches") => void;
}

export function PageNav({ activePage, onPageChange }: PageNavProps) {
  const tabs = [
    { id: "posts" as const, label: "POST" },
    { id: "matches" as const, label: "CONNECT" },
  ];

  return (
    <div className="inline-flex gap-8">
      {tabs.map((tab) => {
        const isActive = activePage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={`px-2 py-1.5 text-[length:var(--lethe-text-xs)] tracking-[length:var(--lethe-tracking-wide)] font-sans transition-all duration-300 hover:opacity-70 ${
              isActive ? "text-lethe-fg" : "text-lethe-line-dim"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
