import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  summary: string;
  interests: string[];
}

export function SuggestionsPanel() {
  const { theme } = useTheme();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const users = [
    {
      id: "1",
      name: "Elena Voss",
      username: "@elena.voss",
      avatar: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Philosophy enthusiast who writes about existentialism and modern life. Loves deep conversations over coffee.",
      interests: ["fitness", "philosophy", "coffee"],
    },
    {
      id: "2",
      name: "Marcus Jin",
      username: "@marcus.jin",
      avatar: "https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Photographer and early riser. Captures quiet moments in urban landscapes. Believes silence speaks louder than words.",
      interests: ["travel", "photography", "food"],
    },
    {
      id: "3",
      name: "Sophia Chen",
      username: "@sophia.chen",
      avatar: "https://images.unsplash.com/photo-1678542230173-8e2c3eb87c85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjI5MDU3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Urban explorer and memory keeper. Documents the stories of changing neighborhoods and forgotten places.",
      interests: ["travel", "social impact", "gaming"],
    },
    {
      id: "4",
      name: "Kai Shore",
      username: "@kai.shore",
      avatar: "https://images.unsplash.com/photo-1519651459912-3c00c1a9f1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NTkzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Writer and collector of quotes. Finds meaning in old notebooks and forgotten words. Always seeking connection.",
      interests: ["food", "venture capital"],
    },
    {
      id: "5",
      name: "Iris Morrow",
      username: "@iris.morrow",
      avatar: "https://images.unsplash.com/photo-1617746652974-0be48cd984d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NTkzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Dream analyst and coffee addict. Believes memory is the mind's greatest artist.",
      interests: ["coffee", "fitness"],
    },
    {
      id: "6",
      name: "Theo Lark",
      username: "@theo.lark",
      avatar: "https://images.unsplash.com/photo-1663518629510-016989dc4ee3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRkbGUlMjBlYXN0ZXJuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzQ1OTM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Minimalist poet who finds beauty in transience. Watches rain and writes about impermanence.",
      interests: ["social impact", "travel", "food"],
    },
    {
      id: "7",
      name: "Anya K",
      username: "@anya.k",
      avatar: "https://images.unsplash.com/photo-1770392988936-dc3d8581e0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGFzaWFuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzQ1OTM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Reflective thinker and journal keeper. Explores the space between endings and new beginnings.",
      interests: ["venture capital", "fitness"],
    },
    {
      id: "8",
      name: "River C",
      username: "@river.c",
      avatar: "https://images.unsplash.com/photo-1758599543111-36ce5c34fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NzIyNzk1ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Musician and philosopher. Believes forgotten melodies carry more weight than popular songs.",
      interests: ["gaming", "travel"],
    },
    {
      id: "9",
      name: "Maya Frost",
      username: "@maya.frost",
      avatar: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBvcnRyYWl0JTIwbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NzIzNDU5NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Archivist of the ephemeral. Collects moments, thoughts, and half-remembered conversations.",
      interests: ["fitness", "social impact", "coffee"],
    },
    {
      id: "10",
      name: "Lior M",
      username: "@lior.m",
      avatar: "https://images.unsplash.com/photo-1762522926984-e721bff0d6c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwY2FzdWFsfGVufDF8fHx8MTc3MjM0NTk0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Contemplative writer exploring identity through memory. Questions who we were versus who we've become.",
      interests: ["food", "venture capital", "travel"],
    },
    {
      id: "11",
      name: "Zara Nyx",
      username: "@zara.nyx",
      avatar: "https://images.unsplash.com/photo-1764084052338-23a317e34ea1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdCUyMG91dGRvb3J8ZW58MXx8fHwxNzcyMzQ1OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Night owl and star gazer. Writes about cosmic insignificance and finding peace in it.",
      interests: ["gaming", "coffee"],
    },
    {
      id: "12",
      name: "Kieran Vale",
      username: "@kieran.vale",
      avatar: "https://images.unsplash.com/photo-1743594789334-967d1049e743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkc2hvdCUyMHdvbWFuJTIwY29uZmlkZW50fGVufDF8fHx8MTc3MjM0NTk0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Digital minimalist who documents the analog world. Film photographer with a philosophical bent.",
      interests: ["social impact", "fitness", "food"],
    },
    {
      id: "13",
      name: "Sasha Bloom",
      username: "@sasha.bloom",
      avatar: "https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkc2hvdCUyMG1hbiUyMGJ1c2luZXNzJTIwY2FzdWFsfGVufDF8fHx8MTc3MjM0NTk0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Botanical artist exploring growth, decay, and renewal. Sees parallels between gardens and memory.",
      interests: ["venture capital", "travel"],
    },
    {
      id: "14",
      name: "Atlas Q",
      username: "@atlas.q",
      avatar: "https://images.unsplash.com/photo-1610387694365-19fafcc86d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFuJTIwb2ZmaWNlfGVufDF8fHx8MTc3MjM0NTk0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Wanderer mapping emotional landscapes. Believes getting lost is sometimes the only way forward.",
      interests: ["travel", "gaming", "fitness"],
    },
    {
      id: "15",
      name: "Nova Sterling",
      username: "@nova.sterling",
      avatar: "https://images.unsplash.com/photo-1605298046196-e205d0d699d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHNtaWxlfGVufDF8fHx8MTc3MjI3MjUyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Seeker of quiet revelations. Finds profound truths in ordinary moments.",
      interests: ["coffee", "social impact"],
    },
    {
      id: "16",
      name: "Phoenix R",
      username: "@phoenix.r",
      avatar: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Student of transformation. Documents the space between who we were and who we're becoming.",
      interests: ["fitness", "venture capital", "food"],
    },
    {
      id: "17",
      name: "Echo Winters",
      username: "@echo.winters",
      avatar: "https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Sound designer fascinated by resonance. Believes echoes teach us about letting go.",
      interests: ["gaming", "travel", "coffee"],
    },
    {
      id: "18",
      name: "Sage Everett",
      username: "@sage.everett",
      avatar: "https://images.unsplash.com/photo-1678542230173-8e2c3eb87c85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjI5MDU3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Keeper of ancient wisdom and modern anxieties. Bridges old philosophies with contemporary life.",
      interests: ["social impact", "venture capital"],
    },
    {
      id: "19",
      name: "Indigo Moon",
      username: "@indigo.moon",
      avatar: "https://images.unsplash.com/photo-1519651459912-3c00c1a9f1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NTkzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Midnight thinker exploring the twilight between memory and imagination.",
      interests: ["food", "fitness", "gaming"],
    },
    {
      id: "20",
      name: "Orion Quest",
      username: "@orion.q",
      avatar: "https://images.unsplash.com/photo-1617746652974-0be48cd984d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXNwYW5pYyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NTkzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      summary: "Astronomer of the soul. Maps internal constellations and forgotten coordinates.",
      interests: ["gaming", "food", "travel"],
    },
  ];

  const bg = theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#F8F8F8]";
  const border = theme === "dark" ? "border-[#1a1a1a]" : "border-[#E5E5E5]";
  const textPrimary = theme === "dark" ? "text-white" : "text-black";
  const textSecondary = theme === "dark" ? "text-[#6B6B6B]" : "text-[#9B9B9B]";

  return (
    <>
      {users.map((user) => {
        const isSelected = selectedUsers.has(user.id);

        return (
          <div
            key={user.id}
            className={`${bg} rounded-2xl border ${border} overflow-hidden transition-colors duration-300`}
          >
            {/* Top: Full-width image with aspect ratio to show full portrait */}
            <div className="relative w-full aspect-square">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Content section with padding */}
            <div className="p-5">
              {/* Name and username */}
              <div className="mb-3">
                <div className="text-white text-[15px] font-light font-sans tracking-wide mb-0.5">
                  {user.name}
                </div>
                <div className="text-[#6B6B6B] text-[13px] tracking-wider font-light font-sans">
                  {user.username}
                </div>
              </div>

              {/* Summary text - max 2 lines with ellipsis */}
              <p 
                className="text-[#d4d4d4] text-[13px] font-sans leading-relaxed mb-4"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {user.summary}
              </p>

              {/* Interest tags - max 2 rows */}
              <div 
                className="flex flex-wrap gap-2 mb-4 overflow-hidden"
                style={{
                  maxHeight: '3.5rem', // Approximately 2 rows
                }}
              >
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-[#6B6B6B] text-[13px] font-sans px-2 py-1 rounded-full tracking-wider font-light"
                    style={{ backgroundColor: theme === "dark" ? "#1a1a1a" : "#E5E5E5" }}
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Divider line */}
              <div className={`border-t ${border} -mx-5 mb-4`} />

              {/* Action buttons - side by side with vertical padding */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleUser(user.id)}
                  className="text-[#d4d4d4] text-[13px] font-sans px-4 py-1.5 rounded-full transition-colors duration-300 flex-1 border border-[#2a2a2a] tracking-wider font-light"
                  style={{ backgroundColor: theme === "dark" ? "#0f0f0f" : "#1a1a1a" }}
                >
                  Match
                </button>
                <button
                  className="text-[#d4d4d4] text-[13px] font-sans px-4 py-1.5 rounded-full transition-colors duration-300 flex-1 border border-[#2a2a2a] tracking-wider font-light"
                  style={{ backgroundColor: theme === "dark" ? "#0f0f0f" : "#1a1a1a" }}
                >
                  Pass
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}