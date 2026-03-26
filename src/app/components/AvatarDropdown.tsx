import { useState, useRef, useEffect } from "react";
import { User, MessageSquare, Users, Settings, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router";

interface AvatarDropdownProps {
  avatarUrl: string;
}

export function AvatarDropdown({ avatarUrl }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { icon: User,         label: "Profile",     action: () => navigate("/profile") },
    { icon: MessageSquare, label: "Messages",   action: () => navigate("/messages") },
    { icon: Users,        label: "Communities", action: () => navigate("/communities") },
    { icon: Settings,     label: "Settings",    action: () => navigate("/settings") },
    { icon: HelpCircle,   label: "Support",     action: () => console.log("Support") },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover bg-lethe-raised border border-lethe-line-dim hover:border-lethe-muted transition-colors"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[240px] bg-lethe-raised border border-lethe-line-subtle rounded-lg shadow-2xl overflow-hidden z-[100]">
          {/* Menu items */}
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => { item.action(); setIsOpen(false); }}
              className={`w-full px-4 py-3.5 flex items-center gap-3 text-lethe-fg hover:bg-lethe-line-subtle transition-colors text-left ${
                index === 0 ? "" : "border-t border-lethe-line-subtle"
              }`}
            >
              <item.icon size={18} strokeWidth={1.5} className="text-lethe-fg" />
              <span className="font-sans text-[length:var(--lethe-text-sm)] leading-[21px] tracking-[0.35px]">
                {item.label}
              </span>
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-lethe-line-subtle" />

          {/* Theme toggle */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-sans text-[length:var(--lethe-text-xs)] leading-[18px] tracking-[length:var(--lethe-tracking-caps)] uppercase text-lethe-muted font-light">
                Theme
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTheme("dark")}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "bg-lethe-line-subtle text-lethe-fg"
                    : "text-lethe-muted hover:bg-lethe-line-subtle"
                }`}
              >
                <Moon size={16} strokeWidth={1.5} />
                <span className="font-sans text-[length:var(--lethe-text-sm)]">Dark</span>
              </button>
              <button
                onClick={() => toggleTheme("light")}
                disabled
                className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors opacity-40 cursor-not-allowed text-lethe-muted"
              >
                <Sun size={16} strokeWidth={1.5} />
                <span className="font-sans text-[length:var(--lethe-text-sm)]">Light</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-lethe-line-subtle" />

          {/* Logout */}
          <button
            onClick={() => { console.log("Logout"); setIsOpen(false); }}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-lethe-danger hover:bg-lethe-danger/10 transition-colors text-left border-t border-lethe-line-subtle"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="font-sans text-[length:var(--lethe-text-sm)] leading-[21px] tracking-[0.35px]">
              Logout
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
