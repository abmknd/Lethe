import { useTheme } from "../context/ThemeContext";

interface PageNavProps {
  activePage: "posts" | "matches";
  onPageChange: (page: "posts" | "matches") => void;
}

export function PageNav({ activePage, onPageChange }: PageNavProps) {
  const { theme } = useTheme();
  
  const text = theme === "dark" ? "text-white" : "text-black";
  const textInactive = theme === "dark" ? "text-[#3A3A3A]" : "text-[#9B9B9B]";

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
            className={`px-2 py-1.5 text-[11px] tracking-[0.25em] font-sans transition-all duration-300 ${
              isActive ? text : textInactive
            } hover:opacity-70`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}