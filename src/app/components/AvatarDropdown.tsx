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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { icon: User, label: "Profile", action: () => navigate("/profile") },
    { icon: MessageSquare, label: "Messages", action: () => navigate("/messages") },
    { icon: Users, label: "Communities", action: () => navigate("/communities") },
    { icon: Settings, label: "Settings", action: () => navigate("/settings") },
    { icon: HelpCircle, label: "Support", action: () => console.log("Support") },
  ];

  const avatarBorder = "border-[#3A3A3A]";
  const hoverBorder = "hover:border-[#6B6B6B]";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-shrink-0"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className={`w-9 h-9 rounded-full object-cover bg-[#1a1a1a] border ${avatarBorder} ${hoverBorder} transition-colors`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[240px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden z-[100]">
          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3.5 flex items-center gap-3 text-white hover:bg-[#2a2a2a] transition-colors text-left ${
                index === 0 ? '' : 'border-t border-[#2a2a2a]'
              }`}
            >
              <item.icon size={18} strokeWidth={1.5} className="text-white" />
              <span className="font-['Inter'] text-[14px] leading-[21px] tracking-[0.35px]">{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-[#2a2a2a]" />

          {/* Theme Toggle */}
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-['Inter'] text-[12px] leading-[18px] tracking-[0.6px] uppercase text-[#6B6B6B] font-light">
                Theme
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTheme("dark")}
                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  theme === "dark"
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-[#6B6B6B] hover:bg-[#2a2a2a]'
                }`}
              >
                <Moon size={16} strokeWidth={1.5} />
                <span className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.325px]">Dark</span>
              </button>
              <button
                onClick={() => toggleTheme("light")}
                disabled={true}
                className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors opacity-40 cursor-not-allowed text-[#6B6B6B]"
              >
                <Sun size={16} strokeWidth={1.5} />
                <span className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.325px]">Light</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2a2a2a]" />

          {/* Logout */}
          <button
            onClick={() => {
              console.log("Logout");
              setIsOpen(false);
            }}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors text-left border-t border-[#2a2a2a]"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="font-['Inter'] text-[14px] leading-[21px] tracking-[0.35px]">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}