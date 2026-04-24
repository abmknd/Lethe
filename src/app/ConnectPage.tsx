import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Check, MapPin, Zap } from 'lucide-react';
import LetheLogo from '../imports/LetheLogo';
import { listTrialUsers, listUserRecommendations, respondToRecommendation } from './trial/api';
import type { TrialUser, TrialRecommendation } from './trial/types';

const USER_ID_KEY = 'lethe_trial_user_id';

function initials(name: string) {
  return name.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase();
}

export default function ConnectPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [recommendations, setRecommendations] = useState<TrialRecommendation[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchingOn, setMatchingOn] = useState(true);
  const [showMatchFlash, setShowMatchFlash] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [profileFade, setProfileFade] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'matches'>('suggestions');

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
    setCurrentIdx(0);
    listUserRecommendations(selectedUserId, 'approved')
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setIsLoading(false));
  }, [selectedUserId]);

  useEffect(() => {
    if (recommendations[currentIdx]) {
      setProfileFade(true);
      setTimeout(() => setProfileFade(false), 220);
    }
  }, [currentIdx]);

  const rec = recommendations[currentIdx];
  const isComplete = !isLoading && currentIdx >= recommendations.length;

  const selectUser = (id: string) => {
    localStorage.setItem(USER_ID_KEY, id);
    setSelectedUserId(id);
  };

  const handlePass = async () => {
    if (isAnimating || !rec) return;
    setIsAnimating(true);
    setProfileFade(true);
    try { await respondToRecommendation({ recommendationId: rec.id, userId: selectedUserId, decision: 'pass' }); } catch {}
    setTimeout(() => { setCurrentIdx(i => i + 1); setProfileFade(false); setIsAnimating(false); }, 300);
  };

  const handleMatch = async () => {
    if (isAnimating || !rec) return;
    setIsAnimating(true);
    setShowMatchFlash(true);
    try { await respondToRecommendation({ recommendationId: rec.id, userId: selectedUserId, decision: 'accept' }); } catch {}
    setTimeout(() => { setShowMatchFlash(false); setCurrentIdx(i => i + 1); setIsAnimating(false); }, 2000);
  };

  const toggleMatching = () => {
    setMatchingOn(on => !on);
    displayToast(matchingOn ? 'Matching paused' : 'Matching is on');
  };

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  return (
    <div className="min-h-screen bg-[#050705] text-white/[0.88] font-['Inter'] overflow-hidden flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex-shrink-0 flex items-center justify-between px-8 bg-[rgba(5,7,5,0.97)] backdrop-blur-[20px] border-b border-white/[0.07]">
        <button
          onClick={() => navigate('/feed')}
          className="font-['Libre_Baskerville'] text-[13px] tracking-[0.32em] uppercase text-white/[0.52] flex items-center gap-[9px] hover:text-white/70 transition-colors"
        >
          <LetheLogo className="w-[15px] h-[15px] opacity-55" />
          Lethe
        </button>
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a2a1a] to-[#0d150d] border-[1.5px] border-[#ADFF2F]/[0.22] flex items-center justify-center text-[11px] font-semibold text-[#ADFF2F]/70 font-['Libre_Baskerville']"
          >
            {initials(users.find(u => u.id === selectedUserId)?.displayName ?? '?')}
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="h-12 flex-shrink-0 flex items-center px-8 bg-[#0b0e0b] border-b border-white/[0.07]">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`h-full px-0 mr-7 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 transition-colors ${
            activeTab === 'suggestions'
              ? 'text-white/[0.88] border-[#ADFF2F]'
              : 'text-white/[0.25] border-transparent hover:text-white/[0.52]'
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => { setActiveTab('matches'); navigate('/matches'); }}
          className={`h-full px-0 mr-7 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 transition-colors ${
            activeTab === 'matches'
              ? 'text-white/[0.88] border-[#ADFF2F]'
              : 'text-white/[0.25] border-transparent hover:text-white/[0.52]'
          }`}
        >
          All matches
        </button>
        <div className="ml-auto flex items-center gap-[10px]">
          <span className="text-[11px] text-white/[0.25] tracking-[0.06em]">{matchingOn ? 'Matching on' : 'Matching off'}</span>
          <button
            onClick={toggleMatching}
            className={`w-9 h-[22px] rounded-[11px] border-none relative transition-all ${matchingOn ? 'bg-[#ADFF2F]' : 'bg-white/[0.08]'}`}
          >
            <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${matchingOn ? 'left-[17px] bg-[#050705]' : 'left-[3px] bg-white/[0.28]'}`} />
          </button>
        </div>
      </div>

      {/* Weekly banner */}
      <div className="flex-shrink-0 px-8 bg-[rgba(173,255,47,0.03)] border-b border-[rgba(173,255,47,0.07)] flex items-center justify-between h-10">
        <div className="flex items-center gap-[9px]">
          <div className="w-[5px] h-[5px] rounded-full bg-[#ADFF2F] flex-shrink-0 shadow-[0_0_7px_rgba(173,255,47,0.55)]" />
          <div className="text-[11px] text-[rgba(173,255,47,0.6)] tracking-[0.03em]">
            {isLoading
              ? 'Loading recommendations…'
              : recommendations.length > 0
              ? <><strong className="text-[rgba(173,255,47,0.85)] font-semibold">{recommendations.length} suggestions</strong> ready for review.</>
              : 'No approved suggestions yet — run the weekly matcher from the trial home.'}
          </div>
        </div>
        {!isLoading && recommendations.length > 0 && (
          <div className="text-[11px] font-medium text-white/[0.25] tracking-[0.04em] whitespace-nowrap">
            <strong className="text-white/[0.52] font-semibold">{Math.min(currentIdx, recommendations.length)} of {recommendations.length}</strong> reviewed
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-5 gap-4">
        {/* Profile panel */}
        <div className="flex-1 min-w-0 bg-[#0b0e0b] border border-white/[0.07] rounded-2xl flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-[13px] text-white/[0.25]">Loading…</div>
          ) : !isComplete && rec ? (
            <>
              <div className={`flex-1 min-h-0 overflow-y-auto transition-opacity duration-[220ms] ${profileFade ? 'opacity-0' : 'opacity-100'}`}>
                {/* Hero */}
                <div className="flex items-center gap-4 p-5 flex-shrink-0 border-b border-white/[0.07]">
                  <div className="w-[52px] h-[52px] rounded-full flex-shrink-0 bg-[#1a2a1a] border border-[#ADFF2F]/[0.15] flex items-center justify-center text-[18px] font-semibold text-[#ADFF2F]/60 font-['Libre_Baskerville']">
                    {initials(rec.candidate.displayName)}
                  </div>
                  <div className="flex flex-col justify-center gap-[3px]">
                    <div className="font-['Libre_Baskerville'] text-[20px] leading-[1.2] text-white/[0.88]">{rec.candidate.displayName}</div>
                    <div className="text-[11px] text-white/[0.25] tracking-[0.05em]">{rec.candidate.handle}</div>
                    <div className="flex items-center gap-1 text-[11px] font-light text-white/[0.25]">
                      <MapPin size={9} className="opacity-55 flex-shrink-0" strokeWidth={1.5} />
                      <span>{rec.candidate.location}</span>
                    </div>
                  </div>
                </div>

                {/* Compatibility strip */}
                <div className="px-5 py-3 border-b border-white/[0.07] flex-shrink-0 flex items-center gap-[14px]">
                  <div className="flex-1 h-[2px] rounded-[2px] bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full bg-[#ADFF2F] rounded-[2px] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${rec.score}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-[rgba(173,255,47,0.72)] whitespace-nowrap flex-shrink-0">{rec.score}%</div>
                  <div className="text-[11px] font-light text-white/[0.25] whitespace-nowrap flex-shrink-0">match</div>
                </div>

                {/* Intro text */}
                {rec.candidate.introText && (
                  <div className="px-5 py-4 border-b border-white/[0.07]">
                    <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/[0.25] mb-[10px]">About</div>
                    <div className="text-[13px] font-light leading-[1.78] text-white/[0.52]">{rec.candidate.introText}</div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="px-5 py-4 flex gap-[10px] flex-shrink-0 border-t border-white/[0.07] bg-[#0b0e0b]">
                <button
                  onClick={handlePass}
                  disabled={isAnimating}
                  className="flex-1 px-3 py-[13px] rounded-[13px] bg-transparent border border-white/[0.18] text-white/[0.45] text-[11px] font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-[7px] transition-all hover:bg-white/[0.05] hover:text-white/70 hover:border-white/[0.28] disabled:opacity-50"
                >
                  <X size={12} strokeWidth={1.8} />
                  Pass
                </button>
                <button
                  onClick={handleMatch}
                  disabled={isAnimating}
                  className="flex-[1.6] px-3 py-[13px] rounded-[13px] bg-white/[0.1] border border-white/[0.18] text-white/[0.88] text-[11px] font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-[7px] transition-all hover:bg-white/[0.16] hover:border-white/[0.3] hover:text-white disabled:opacity-50"
                >
                  <Check size={12} strokeWidth={2} />
                  Match
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-10 py-[60px] text-center">
              {recommendations.length === 0 ? (
                <>
                  <p className="font-['Libre_Baskerville'] text-[20px] italic text-white/[0.88]">No suggestions yet.</p>
                  <p className="text-[13px] font-light text-white/[0.52] leading-[1.7] max-w-[260px]">
                    Run the weekly matcher from the trial home to generate recommendations.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-['Libre_Baskerville'] text-[20px] italic text-white/[0.88]">You're all caught up.</p>
                  <p className="text-[13px] font-light text-white/[0.52] leading-[1.7] max-w-[240px]">
                    New suggestions arrive each Monday.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right card — Lethe summary */}
        {!isLoading && !isComplete && rec && (
          <div className="w-[420px] min-w-[400px] flex-shrink-0 flex flex-col bg-transparent overflow-y-auto">
            <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
              <div className={`bg-[rgba(173,255,47,0.03)] transition-opacity duration-[220ms] ${profileFade ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-center gap-[10px] px-4 pt-[13px] pb-[10px]">
                  <div className="w-[26px] h-[26px] rounded-[7px] bg-[rgba(173,255,47,0.08)] border border-[rgba(173,255,47,0.12)] flex items-center justify-center flex-shrink-0 text-[rgba(173,255,47,0.6)]">
                    <Zap size={12} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[rgba(173,255,47,0.65)]">Lethe summary</div>
                    <div className="text-[10px] font-light text-white/[0.25] mt-[1px]">
                      What you and {rec.candidate.displayName.split(' ')[0]} have in common
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-[14px] flex flex-col gap-[9px]">
                  {rec.whyMatched.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-[9px]">
                      <div className="w-1 h-1 rounded-full bg-[rgba(173,255,47,0.35)] flex-shrink-0 mt-[7px]" />
                      <div className="text-[12px] font-light leading-[1.72] text-white/[0.5]">{reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match flash overlay */}
      <div
        className={`fixed inset-0 z-[500] bg-[rgba(5,7,5,0.92)] flex flex-col items-center justify-center gap-[14px] transition-opacity duration-[350ms] ${
          showMatchFlash ? 'opacity-100 pointer-events-all' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-[60px] h-[60px] relative flex items-center justify-center">
          <div className="absolute border-[rgba(173,255,47,0.2)] border rounded-full animate-[mfRipple_2s_ease-out_infinite]" />
          <div className="absolute border-[rgba(173,255,47,0.2)] border rounded-full animate-[mfRipple_2s_ease-out_infinite] [animation-delay:1s]" />
          <div className="w-[22px] h-[22px] rounded-full bg-white/[0.12] border border-white/[0.25] flex items-center justify-center">
            <Check size={11} className="text-white/80" strokeWidth={2.5} />
          </div>
        </div>
        <div className="font-['Libre_Baskerville'] text-[22px] italic text-white/[0.88]">Match set.</div>
        <div className="text-[12px] font-light text-white/[0.52] text-center max-w-[220px] leading-[1.65]">
          Lethe will handle the introduction when the time is right.
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#181e18] border border-white/[0.12] rounded-[20px] px-[18px] py-2 text-[11px] tracking-[0.1em] text-white/[0.52] whitespace-nowrap transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[14px] pointer-events-none'
        }`}
      >
        {toastMessage}
      </div>

      <style>{`
        @keyframes mfRipple {
          0% { width: 22px; height: 22px; opacity: 0.7; }
          100% { width: 60px; height: 60px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
