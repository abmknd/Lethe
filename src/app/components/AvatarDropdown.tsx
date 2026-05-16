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
    { icon: HelpCircle,   label: "Support",     action: () => {} },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex-shrink-0">
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover bg-relethe-raised border border-relethe-line-dim hover:border-relethe-muted transition-colors"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[240px] bg-relethe-raised border border-relethe-line-subtle rounded-lg shadow-2xl overflow-hidden z-[100]">
          {/* Menu items */}
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => { item.action(); setIsOpen(false); }}
              className={`w-full px-4 py-3.5 flex items-center gap-3 text-relethe-fg hover:bg-relethe-line-subtle transition-colors text-left ${
                index === 0 ? "" : "border-t border-relethe-line-subtle"
              }`}
            >
              <item.icon size={18} strokeWidth={1.5} className="text-relethe-fg" />
              <span className="font-sans text-[length:var(--relethe-text-sm)] leading-[21px] tracking-[0.35px]">
                {item.label}
              </span>
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-relethe-line-subtle" />

          {/* Theme toggle */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-sans text-[length:var(--relethe-text-xs)] leading-[18px] tracking-[length:var(--relethe-tracking-caps)] uppercase text-relethe-muted font-light">
                Theme
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTheme("dark")}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "bg-relethe-line-subtle text-relethe-fg"
                    : "text-relethe-muted hover:bg-relethe-line-subtle"
                }`}
              >
                <Moon size={16} strokeWidth={1.5} />
                <span className="font-sans text-[length:var(--relethe-text-sm)]">Dark</span>
              </button>
              <button
                onClick={() => toggleTheme("light")}
                disabled
                className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors opacity-40 cursor-not-allowed text-relethe-muted"
              >
                <Sun size={16} strokeWidth={1.5} />
                <span className="font-sans text-[length:var(--relethe-text-sm)]">Light</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-relethe-line-subtle" />

          {/* Logout */}
          <button
            onClick={() => { setIsOpen(false); }}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-relethe-danger hover:bg-relethe-danger/10 transition-colors text-left border-t border-relethe-line-subtle"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="font-sans text-[length:var(--relethe-text-sm)] leading-[21px] tracking-[0.35px]">
              Logout
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
