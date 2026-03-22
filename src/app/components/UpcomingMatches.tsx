import { useTheme } from "../context/ThemeContext";
import { Calendar } from "lucide-react";

interface UpcomingMatch {
  date: string;
  time: string;
  timezone: string;
}

const upcomingMatchesData: UpcomingMatch[] = [
  { date: "Wed Apr. 16", time: "5:00 pm", timezone: "BST" },
  { date: "Wed Apr. 16", time: "7:00 pm", timezone: "BST" },
  { date: "Thu Apr. 17", time: "5:00 pm", timezone: "BST" },
  { date: "Fri Apr. 18", time: "12:00 pm", timezone: "BST" },
  { date: "Mon Apr. 21", time: "6:00 pm", timezone: "BST" },
];

interface UpcomingMatchesProps {
  isMatchingPaused?: boolean;
}

export function UpcomingMatches({ isMatchingPaused = false }: UpcomingMatchesProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Info banner matching suggestions style */}
      <div className="mb-6 px-8 py-4 bg-[rgba(173,255,47,0.03)] border border-[rgba(173,255,47,0.07)] rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <div className="w-[6px] h-[6px] rounded-full bg-[#ADFF2F] flex-shrink-0 shadow-[0_0_7px_rgba(173,255,47,0.55)]" />
          <div className="text-[13px] text-[rgba(173,255,47,0.6)] tracking-[0.02em]">
            {isMatchingPaused ? (
              "Matching is turned off."
            ) : (
              <>
                Manage your availabilities in the <strong className="text-[rgba(173,255,47,0.85)] font-semibold">settings</strong> page!
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body - Two column layout matching suggestions */}
      <div className="flex gap-4">
        {/* Main panel matching profile panel style */}
        <div className="flex-1 min-w-0 bg-[#0b0e0b] border border-white/[0.07] rounded-2xl flex flex-col overflow-hidden">
          {isMatchingPaused ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-10 py-[60px] text-center">
              <p className="font-['Libre_Baskerville'] text-[24px] italic text-white/[0.88]">You have no upcoming meetings</p>
              <p className="text-[15px] font-light text-white/[0.52] leading-[1.7] max-w-[280px]">
                switch on matching to resume meetings
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {/* Upcoming matches section */}
              <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/[0.25] mb-[10px] px-4 pt-4">
                Your upcoming matches
              </div>
              
              {/* Grid layout for matches */}
              <div className="grid grid-cols-2 gap-[6px] mb-4 px-4">
                {upcomingMatchesData.map((match, index) => (
                  <div 
                    key={index}
                    className="px-3 py-[11px] rounded-[10px] bg-[#050705] border border-white/[0.07] relative"
                  >
                    {/* Icon in top-right corner */}
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#7FFF00]/[0.08] border border-[#7FFF00]/20 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-[#7FFF00]/70" strokeWidth={1.5} />
                    </div>
                    
                    {/* Date/time at top */}
                    <div className="text-[13px] font-semibold tracking-[0.12em] uppercase text-white/[0.25] mb-[6px] pr-8">
                      {match.date}
                    </div>
                    
                    {/* Time */}
                    <div className="text-[13px] text-white/[0.52] flex items-center gap-[6px] mb-3">
                      <div className="w-[4px] h-[4px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      {match.time} {match.timezone}
                    </div>
                    
                    {/* Upcoming Match title and description */}
                    <div className="border-t border-white/[0.05] pt-2 mt-2">
                      <div className="font-serif text-[13px] leading-[1.4] text-white/[0.62] mb-1">
                        Upcoming Match
                      </div>
                      <div className="text-[13px] leading-[1.5] text-white/[0.35]">
                        Stay tuned to find out who you'll be meeting with next
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar matching suggestions layout */}
        {!isMatchingPaused && (
          <div className="w-[340px] flex flex-col gap-4 flex-shrink-0">
            {/* Placeholder for consistency with suggestions layout */}
            <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl p-5">
              <div className="text-[13px] font-semibold tracking-[0.16em] uppercase text-white/[0.25] mb-3">
                About upcoming
              </div>
              <div className="text-[14px] font-light leading-[1.65] text-white/[0.5]">
                Your matches are scheduled based on your availability settings. You'll be notified before each meeting with details about your match.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
