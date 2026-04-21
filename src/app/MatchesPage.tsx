import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

export default function MatchesPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-white"} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-8 py-12">
        <button
          onClick={() => navigate("/feed")}
          className={`flex items-center gap-2 mb-8 ${
            theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
          } transition-colors`}
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-sm">Back to Feed</span>
        </button>

        <h1 className={`font-['Cormorant_Garamond'] text-4xl font-light italic mb-4 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}>
          Your Matches
        </h1>
        <p className={`${theme === "dark" ? "text-white/45" : "text-black/60"}`}>
          Matches feature coming soon.
        </p>
      </div>
    </div>
  );
}
