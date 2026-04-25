import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Check } from 'lucide-react';
import LetheLogo from '../imports/LetheLogo';
import { listTrialUsers, listUserRecommendations } from './trial/api';
import type { TrialUser, TrialRecommendation } from './trial/types';

const USER_ID_KEY = 'lethe_trial_user_id';

function initials(name: string) {
  return name.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase();
}

const FOLLOW_THROUGH_LABELS: Record<string, string> = {
  intro_sent: 'Intro sent',
  meeting_scheduled: 'Meeting scheduled',
  completed: 'Completed',
  no_follow_through: 'No follow-through',
};

export default function MatchesPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [matches, setMatches] = useState<TrialRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    listTrialUsers().then(fetched => {
      setUsers(fetched);
      const saved = localStorage.getItem(USER_ID_KEY);
      const id = (saved && fetched.some(u => u.id === saved)) ? saved : (fetched[0]?.id ?? '');
      setSelectedUserId(id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    setIsLoading(true);
    listUserRecommendations(selectedUserId, 'accepted')
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, [selectedUserId]);

  const selectUser = (id: string) => {
    localStorage.setItem(USER_ID_KEY, id);
    setSelectedUserId(id);
  };

  return (
    <div className="min-h-screen bg-[#050705] text-white/[0.88] font-['Inter'] flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex-shrink-0 flex items-center justify-between px-8 bg-[rgba(5,7,5,0.97)] backdrop-blur-[20px] border-b border-white/[0.07]">
        <button
          onClick={() => navigate('/feed')}
          className="font-['Cormorant_Garamond'] text-[13px] tracking-[0.32em] uppercase text-white/[0.52] flex items-center gap-[9px] hover:text-white/70 transition-colors"
        >
          <LetheLogo className="w-[15px] h-[15px] opacity-55" />
          Lethe
        </button>
        {users.length > 0 && (
          <select
            value={selectedUserId}
            onChange={e => selectUser(e.target.value)}
            className="text-[11px] bg-[#0b0e0b] border border-white/[0.12] rounded-[8px] px-2 py-1 text-white/[0.52] tracking-[0.04em] outline-none"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.displayName}</option>
            ))}
          </select>
        )}
      </nav>

      {/* Tabs */}
      <div className="h-12 flex-shrink-0 flex items-center px-8 bg-[#0b0e0b] border-b border-white/[0.07]">
        <button
          onClick={() => navigate('/connect')}
          className="h-full px-0 mr-7 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 border-transparent text-white/[0.25] hover:text-white/[0.52] transition-colors"
        >
          Suggestions
        </button>
        <button className="h-full px-0 mr-7 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 border-[#ADFF2F] text-white/[0.88]">
          All matches
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-8 py-6">
        <div className="mb-6">
          <h1 className="font-['Cormorant_Garamond'] text-[28px] font-light italic text-white/[0.88]">Your Matches</h1>
          {!isLoading && (
            <p className="text-[12px] text-white/[0.25] mt-1 tracking-[0.04em]">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} accepted
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-[13px] text-white/[0.25] py-12 text-center">Loading…</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-['Cormorant_Garamond'] text-[20px] italic text-white/[0.45] mb-2">No matches yet.</p>
            <p className="text-[13px] font-light text-white/[0.25] leading-[1.7] max-w-[240px] mx-auto">
              Accept a suggestion from the recommendations page to see it here.
            </p>
            <button
              onClick={() => navigate('/connect')}
              className="mt-5 px-4 py-2 text-[11px] rounded-[10px] border border-white/[0.14] text-white/[0.45] hover:text-white/70 hover:border-white/[0.25] transition-colors"
            >
              View suggestions
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map(match => {
              const followStatus = match.outcome?.followThroughStatus;
              const statusLabel = (followStatus && FOLLOW_THROUGH_LABELS[followStatus]) ?? 'Accepted';
              return (
                <div key={match.id} className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full flex-shrink-0 bg-[#1a2a1a] border border-[#ADFF2F]/[0.15] flex items-center justify-center text-[15px] font-semibold text-[#ADFF2F]/60 font-['Cormorant_Garamond']">
                    {initials(match.candidate.displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-[3px]">
                      <div className="font-['Cormorant_Garamond'] text-[17px] text-white/[0.88]">{match.candidate.displayName}</div>
                      <div className="text-[10px] font-semibold tracking-[0.08em] text-[rgba(173,255,47,0.65)] whitespace-nowrap">{match.score}% match</div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-white/[0.25] mb-[10px]">
                      <MapPin size={9} className="opacity-55 flex-shrink-0" strokeWidth={1.5} />
                      {match.candidate.location}
                    </div>
                    {match.candidate.introText && (
                      <p className="text-[12px] font-light leading-[1.7] text-white/[0.4] mb-[10px] line-clamp-2">{match.candidate.introText}</p>
                    )}
                    <div className="flex items-center gap-[5px] text-[10px] tracking-[0.06em] text-white/[0.28]">
                      <Check size={9} strokeWidth={2} className="text-[rgba(173,255,47,0.5)]" />
                      {statusLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
