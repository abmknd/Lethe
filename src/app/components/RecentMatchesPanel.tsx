import { useTheme } from "../context/ThemeContext";
import { MoreVertical } from "lucide-react";

interface Match {
  id: string;
  name: string;
  avatar: string;
  scheduledDate: string;
  status: "met" | "didn't meet" | "cancelled" | "upcoming";
}

export function RecentMatchesPanel() {
  const { theme } = useTheme();

  const matches: Match[] = [
    {
      id: "1",
      name: "Elena Voss",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      scheduledDate: "15/02/26, 13:00PM",
      status: "met",
    },
    {
      id: "2",
      name: "Marcus Jin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      scheduledDate: "10/02/26, 14:30PM",
      status: "didn't meet",
    },
    {
      id: "3",
      name: "Sophia Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
      scheduledDate: "08/02/26, 11:00AM",
      status: "cancelled",
    },
    {
      id: "4",
      name: "Kai Shore",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai",
      scheduledDate: "03/03/26, 16:00PM",
      status: "upcoming",
    },
  ];

  // Sort matches: upcoming first, then chronologically (newest to oldest)
  const sortedMatches = [...matches].sort((a, b) => {
    // Upcoming always comes first
    if (a.status === "upcoming" && b.status !== "upcoming") return -1;
    if (a.status !== "upcoming" && b.status === "upcoming") return 1;

    // Parse date strings (DD/MM/YY, HH:MMAM/PM)
    const parseDate = (dateStr: string) => {
      const [datePart, timePart] = dateStr.split(", ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [time, period] = [timePart.slice(0, -2), timePart.slice(-2)];
      const [hours, minutes] = time.split(":").map(Number);
      
      let adjustedHours = hours;
      if (period === "PM" && hours !== 12) adjustedHours += 12;
      if (period === "AM" && hours === 12) adjustedHours = 0;
      
      // Assuming 20xx for year
      return new Date(2000 + year, month - 1, day, adjustedHours, minutes);
    };

    // Sort by date (newest to oldest)
    return parseDate(b.scheduledDate).getTime() - parseDate(a.scheduledDate).getTime();
  });

  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const textPrimary = theme === "dark" ? "text-white" : "text-black";
  const textSecondary = theme === "dark" ? "text-[#6B6B6B]" : "text-[#9B9B9B]";
  const hoverBg = theme === "dark" ? "hover:bg-[#1a1a1a]" : "hover:bg-[#EFEFEF]";
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  const getStatusColor = (status: string) => {
    if (status === "met") return "#A3CC66";
    if (status === "cancelled") return "#CC6B6B";
    if (status === "upcoming") return "#CCB366";
    return textSecondary;
  };

  const getStatusBgColor = () => {
    return theme === "dark" ? "#1a1a1a" : "#E5E5E5";
  };

  return (
    <div className={`${bg} rounded-2xl border ${border} p-5 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`${textPrimary} text-[15px] font-serif tracking-wide`}>
          Your matches
        </h2>
        <button
          className={`${textSecondary} text-[11px] font-sans hover:opacity-70 transition-opacity`}
        >
          See all
        </button>
      </div>

      <div className="space-y-4">
        {sortedMatches.map((match, index) => (
          <div key={match.id}>
            <div className="flex items-start gap-3">
              <img
                src={match.avatar}
                alt={match.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`${textPrimary} text-[13px] font-serif truncate`}>
                    {match.name}
                  </div>
                  <button className={`${textSecondary} hover:opacity-70 transition-opacity flex-shrink-0`}>
                    <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className={`${textSecondary} text-[12px] font-sans mb-2`}>
                  Date: {match.scheduledDate}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`${textSecondary} text-[12px] font-sans`}>Meeting status:</span>
                  <span
                    className="text-[13px] font-sans px-2 py-1 rounded-full tracking-wide font-light"
                    style={{ 
                      color: getStatusColor(match.status),
                      backgroundColor: getStatusBgColor()
                    }}
                  >
                    {match.status}
                  </span>
                </div>
              </div>
            </div>
            {index < sortedMatches.length - 1 && (
              <div className={`border-t ${border} mt-4`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}