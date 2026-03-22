import { useTheme } from "../context/ThemeContext";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

interface UserToMeet {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export function WhoToMeetPanel() {
  const { theme } = useTheme();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const users: UserToMeet[] = [
    {
      id: "1",
      name: "Elena Voss",
      username: "@elena.voss",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    },
    {
      id: "2",
      name: "Marcus Jin",
      username: "@marcus.jin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    {
      id: "3",
      name: "Sophia Chen",
      username: "@sophia.chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    },
  ];

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const textPrimary = theme === "dark" ? "text-white" : "text-black";
  const textSecondary = theme === "dark" ? "text-[#d4d4d4]" : "text-[#6B6B6B]";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  return (
    <div className={`${bg} rounded-2xl border ${border} p-5 transition-colors duration-300`}>
      <h2 className={`${textPrimary} text-[15px] font-serif mb-4 tracking-wide`}>
        Would you like to meet?
      </h2>

      <div className="space-y-4">
        {users.map((user) => {
          const isSelected = selectedUsers.has(user.id);
          return (
            <div key={user.id} className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className={`${textPrimary} text-[13px] font-serif truncate`}>
                  {user.name}
                </div>
                <div className={`${textSecondary} text-[11px] font-sans truncate`}>
                  {user.username}
                </div>
              </div>
              <button
                onClick={() => toggleUser(user.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0`}
                style={{
                  borderColor: isSelected ? accentColor : "#6B6B6B",
                  backgroundColor: isSelected ? accentColor : "transparent",
                }}
              >
                {isSelected ? (
                  <Check 
                    className="w-3.5 h-3.5 transition-colors duration-300" 
                    strokeWidth={2}
                    style={{
                      color: isSelected ? (theme === "dark" ? "#000" : "#fff") : "#6B6B6B"
                    }}
                  />
                ) : (
                  <Plus 
                    className="w-3.5 h-3.5 transition-colors duration-300" 
                    strokeWidth={2}
                    style={{
                      color: isSelected ? (theme === "dark" ? "#000" : "#fff") : "#6B6B6B"
                    }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <button
        className={`mt-4 w-full text-center text-[12px] font-sans transition-colors`}
        style={{ color: accentColor }}
      >
        Show more
      </button>
    </div>
  );
}