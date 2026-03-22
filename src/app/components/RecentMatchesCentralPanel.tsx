import { useTheme } from "../context/ThemeContext";
import { Star } from "lucide-react";

interface Match {
  id: string;
  name: string;
  username: string;
  avatar: string;
  scheduledDate: string;
  status: "met" | "didn't meet" | "cancelled" | "upcoming";
  rating: number; // 1-5 stars
}

export function RecentMatchesCentralPanel() {
  const { theme } = useTheme();

  const matches: Match[] = [
    {
      id: "1",
      name: "Elena Voss",
      username: "elena_voss",
      avatar: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjI3NjkxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "15/02/26, 13:00PM",
      status: "met",
      rating: 4,
    },
    {
      id: "2",
      name: "Marcus Jin",
      username: "marcus_jin",
      avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMGFzaWFufGVufDF8fHx8MTc3MjM0ODY3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "10/02/26, 14:30PM",
      status: "didn't meet",
      rating: 0,
    },
    {
      id: "3",
      name: "Sophia Chen",
      username: "sophia_chen",
      avatar: "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwYXNpYW58ZW58MXx8fHwxNzcyMzQ4NjcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "08/02/26, 11:00AM",
      status: "cancelled",
      rating: 0,
    },
    {
      id: "4",
      name: "Kai Shore",
      username: "kai_shore",
      avatar: "https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "03/03/26, 16:00PM",
      status: "upcoming",
      rating: 0,
    },
    {
      id: "5",
      name: "Iris Morrow",
      username: "iris_morrow",
      avatar: "https://images.unsplash.com/photo-1638727295415-286409421143?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwYmxhY2t8ZW58MXx8fHwxNzcyMzQ4NjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "05/03/26, 12:00PM",
      status: "upcoming",
      rating: 0,
    },
    {
      id: "6",
      name: "Theo Lark",
      username: "theo_lark",
      avatar: "https://images.unsplash.com/photo-1543132220-e7fef0b974e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwY2FzdWFsfGVufDF8fHx8MTc3MjMyNzc1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "01/02/26, 15:00PM",
      status: "met",
      rating: 3,
    },
    {
      id: "7",
      name: "Anya Kurosawa",
      username: "anya_kurosawa",
      avatar: "https://images.unsplash.com/photo-1675388545634-83d816322c83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwamFwYW5lc2V8ZW58MXx8fHwxNzcyMzQ4NjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "28/01/26, 10:00AM",
      status: "met",
      rating: 5,
    },
    {
      id: "8",
      name: "River Castellano",
      username: "river_castellano",
      avatar: "https://images.unsplash.com/photo-1643269552626-5e2874c5309b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbm8lMjBtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzIzNDg2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "20/01/26, 17:30PM",
      status: "didn't meet",
      rating: 0,
    },
    {
      id: "9",
      name: "Maya Frost",
      username: "maya_frost",
      avatar: "https://images.unsplash.com/photo-1618590067690-2db34a87750a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBjYXVjYXNpYW58ZW58MXx8fHwxNzcyMzQ4NjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "15/01/26, 14:00PM",
      status: "met",
      rating: 4,
    },
    {
      id: "10",
      name: "Lior Mendez",
      username: "lior_mendez",
      avatar: "https://images.unsplash.com/photo-1766334079470-7f36e9c78311?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRkbGUlMjBlYXN0ZXJuJTIwbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzE1MjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "12/01/26, 11:30AM",
      status: "cancelled",
      rating: 0,
    },
    {
      id: "11",
      name: "Zara Nyx",
      username: "zara_nyx",
      avatar: "https://images.unsplash.com/photo-1633419798503-0b0c628f267c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzQ3NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "08/01/26, 19:00PM",
      status: "met",
      rating: 5,
    },
    {
      id: "12",
      name: "Kieran Vale",
      username: "kieran_vale",
      avatar: "https://images.unsplash.com/photo-1612014206380-b282e27ebb7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMGNhdWNhc2lhbnxlbnwxfHx8fDE3NzIzNDg2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "03/01/26, 13:00PM",
      status: "met",
      rating: 4,
    },
    {
      id: "13",
      name: "Sasha Bloom",
      username: "sasha_bloom",
      avatar: "https://images.unsplash.com/photo-1650443215213-728560ddc1a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwaW5kaWFufGVufDF8fHx8MTc3MjM0ODY3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "29/12/25, 16:30PM",
      status: "didn't meet",
      rating: 0,
    },
    {
      id: "14",
      name: "Atlas Quinn",
      username: "atlas_quinn",
      avatar: "https://images.unsplash.com/photo-1656313815939-6373a497bbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMGJsYWNrfGVufDF8fHx8MTc3MjM0ODY3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "22/12/25, 10:00AM",
      status: "met",
      rating: 5,
    },
    {
      id: "15",
      name: "Nova Sterling",
      username: "nova_sterling",
      avatar: "https://images.unsplash.com/photo-1613477757159-7fbb73011611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjByZWRoZWFkfGVufDF8fHx8MTc3MjM0ODY3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "18/12/25, 14:00PM",
      status: "cancelled",
      rating: 0,
    },
    {
      id: "16",
      name: "Phoenix Rivera",
      username: "phoenix_rivera",
      avatar: "https://images.unsplash.com/photo-1771050889377-b68415885c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMGhpc3BhbmljfGVufDF8fHx8MTc3MjM0ODY3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "15/12/25, 12:30PM",
      status: "met",
      rating: 4,
    },
    {
      id: "17",
      name: "Echo Winters",
      username: "echo_winters",
      avatar: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwYmxvbmRlfGVufDF8fHx8MTc3MjM0ODY3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "10/12/25, 15:00PM",
      status: "met",
      rating: 5,
    },
    {
      id: "18",
      name: "Sage Everett",
      username: "sage_everett",
      avatar: "https://images.unsplash.com/flagged/photo-1573582677725-863b570e3c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0JTIwYnJ1bmV0dGV8ZW58MXx8fHwxNzcyMzQ4Njc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "05/12/25, 11:00AM",
      status: "didn't meet",
      rating: 0,
    },
    {
      id: "19",
      name: "Indigo Moon",
      username: "indigo_moon",
      avatar: "https://images.unsplash.com/photo-1771958062747-198a5e04febc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzb3V0aCUyMGFzaWFufGVufDF8fHx8MTc3MjM0ODY3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "01/12/25, 18:00PM",
      status: "met",
      rating: 4,
    },
    {
      id: "20",
      name: "Cedar Blake",
      username: "cedar_blake",
      avatar: "https://images.unsplash.com/photo-1584554376766-ac0f2c65e949?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMGJlYXJkfGVufDF8fHx8MTc3MjM0ODY3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "25/11/25, 13:30PM",
      status: "met",
      rating: 5,
    },
    {
      id: "21",
      name: "Lyric Dawn",
      username: "lyric_dawn",
      avatar: "https://images.unsplash.com/photo-1758599543111-36ce5c34fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwZ2xhc3Nlc3xlbnwxfHx8fDE3NzIzNDg2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "20/11/25, 16:00PM",
      status: "cancelled",
      rating: 0,
    },
    {
      id: "22",
      name: "Orion Grey",
      username: "orion_grey",
      avatar: "https://images.unsplash.com/photo-1578758697719-ba34da9657ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwbWVkaXRlcnJhbmVhbnxlbnwxfHx8fDE3NzIzNDg2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      scheduledDate: "15/11/25, 10:30AM",
      status: "met",
      rating: 4,
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
  const accentColor = theme === "dark" ? "#7FFF00" : "#5D9F00";

  const getStatusColor = (status: string) => {
    if (status === "met") return "#A3CC66";
    if (status === "cancelled") return "#CC6B6B";
    if (status === "upcoming") return "#CCB366";
    if (status === "didn't meet") return "#6B6B6B";
    return textSecondary;
  };

  const getStatusBgColor = () => {
    return theme === "dark" ? "#1a1a1a" : "#E5E5E5";
  };

  return (
    <>
      {sortedMatches.map((match) => (
        <div
          key={match.id}
          className={`${bg} rounded-2xl border ${border} p-5 transition-colors duration-300`}
        >
          {/* Header with avatar and name */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={match.avatar}
              alt={match.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-[#1a1a1a] ring-1 ring-[#2a2a2a]"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-[15px] font-light font-sans tracking-wide mb-0.5">
                {match.name}
              </div>
              <div className="text-[#6B6B6B] text-[13px] tracking-wider font-light font-sans">
                @{match.username}
              </div>
            </div>
          </div>

          {/* Date and Meeting Status */}
          <div className="mb-4 space-y-1.5">
            <div className="text-[13px] font-sans">
              <span className="text-[#6B6B6B]">Meeting date: </span>
              <span className="text-[#6B6B6B]">{match.scheduledDate}</span>
            </div>
            <div className="text-[13px] font-sans flex items-center gap-1.5">
              <span className="text-[#6B6B6B]">Meeting status:</span>
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

          {/* Bottom section: Stars above, then buttons below */}
          <div>
            {/* 5-star rating display */}
            <div className="flex items-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <Star
                  key={starIndex}
                  className="w-3.5 h-3.5"
                  strokeWidth={1.5}
                  fill={starIndex <= match.rating ? "#6B6B6B" : "none"}
                  style={{ color: starIndex <= match.rating ? "#6B6B6B" : "#6B6B6B" }}
                />
              ))}
            </div>

            {/* Divider line */}
            <div className={`border-t ${border} -mx-5 mb-4`} />

            {/* Action buttons side by side */}
            <div className="flex gap-2">
              <button 
                className="text-[#d4d4d4] text-[13px] font-sans px-4 py-1.5 rounded-full transition-colors duration-300 flex-1 border border-[#2a2a2a] tracking-wider font-light"
                style={{ backgroundColor: theme === "dark" ? "#0f0f0f" : "#1a1a1a" }}
              >
                Message
              </button>
              <button 
                className="text-[#d4d4d4] text-[13px] font-sans px-4 py-1.5 rounded-full transition-colors duration-300 flex-1 border border-[#2a2a2a] tracking-wider font-light"
                style={{ backgroundColor: theme === "dark" ? "#0f0f0f" : "#1a1a1a" }}
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}