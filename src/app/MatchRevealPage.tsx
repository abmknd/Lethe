import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MapPin, ArrowLeft, Video, Calendar, MessageCircle, Sparkles } from 'lucide-react';
import ReletheLogo from '../imports/ReletheLogo';
import { listUserRecommendations } from './api';
import type { Recommendation } from './types';
import { useAuth } from './context/AuthContext';

function initials(name: string) {
  return name.split(' ').map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();
}

// The dedicated in-app reveal (alignment plan, Phase 1). Reached after a mutual
// blind accept, or from the matches list. Identity is already gated server-side
// (PR #105): only revealed / resolved-accepted matches carry a populated
// candidate, so a still-blind or unknown id lands on the "not available" state
// rather than leaking anything.
export default function MatchRevealPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, getAccessToken } = useAuth();
  const userId = user?.id ?? '';

  const [match, setMatch] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!userId || !id) return;
    setIsLoading(true);
    (async () => {
      const token = await getAccessToken();
      try {
        const recs = await listUserRecommendations(userId, 'accepted', token);
        setMatch(recs.find((r) => r.id === id) ?? null);
      } catch {
        setMatch(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId, id, getAccessToken]);

  // Trigger the entrance once the identity is in hand.
  useEffect(() => {
    if (match?.candidate?.displayName) {
      const t = setTimeout(() => setRevealed(true), 60);
      return () => clearTimeout(t);
    }
  }, [match]);

  const candidate = match?.candidate ?? null;
  const meeting = match?.meeting ?? null;

  return (
    <div className="min-h-screen bg-[#050705] text-white/[0.88] font-['Inter'] flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex-shrink-0 flex items-center justify-between px-8 bg-[rgba(5,7,5,0.97)] backdrop-blur-[20px] border-b border-white/[0.07]">
        <button
          onClick={() => navigate('/feed')}
          className="font-['Cormorant_Garamond'] text-[13px] tracking-[0.32em] uppercase text-white/[0.52] flex items-center gap-[9px] hover:text-white/70 transition-colors"
        >
          <ReletheLogo className="w-[15px] h-[15px] opacity-55" />
          Relethe
        </button>
        <button
          onClick={() => navigate('/matches')}
          className="text-[11px] text-white/[0.35] hover:text-white/70 tracking-[0.06em] flex items-center gap-[6px] transition-colors"
        >
          <ArrowLeft size={12} strokeWidth={1.8} />
          All matches
        </button>
      </nav>

      <div className="flex-1 max-w-xl mx-auto w-full px-8 py-10">
        {isLoading ? (
          <div className="text-[13px] text-white/[0.25] py-16 text-center">Opening…</div>
        ) : !candidate ? (
          <div className="text-center py-16">
            <p className="font-['Cormorant_Garamond'] text-[22px] italic text-white/[0.5] mb-2">Nothing to reveal here yet.</p>
            <p className="text-[13px] font-light text-white/[0.3] leading-[1.7] max-w-[280px] mx-auto">
              A match opens once both sides have accepted. If you just accepted, the other person hasn't yet.
            </p>
            <button
              onClick={() => navigate('/connect')}
              className="mt-6 px-4 py-2 text-[11px] rounded-[10px] border border-white/[0.14] text-white/[0.45] hover:text-white/70 hover:border-white/[0.25] transition-colors"
            >
              Back to suggestions
            </button>
          </div>
        ) : (
          <div
            className="transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(12px)' }}
          >
            {/* Reveal banner */}
            <div className="flex items-center gap-[7px] mb-5">
              <Sparkles size={13} className="text-[#ADFF2F]/70" strokeWidth={1.6} />
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[rgba(173,255,47,0.7)]">
                It's mutual
              </span>
            </div>

            {/* Hero */}
            <div className="flex items-center gap-5 mb-7">
              <div className="w-[68px] h-[68px] rounded-full flex-shrink-0 bg-[#1a2a1a] border border-[#ADFF2F]/[0.2] flex items-center justify-center text-[24px] font-semibold text-[#ADFF2F]/70 font-['Cormorant_Garamond']">
                {initials(candidate.displayName)}
              </div>
              <div className="min-w-0">
                <div className="font-['Cormorant_Garamond'] text-[30px] leading-[1.1] italic text-white/[0.92]">
                  {candidate.displayName}
                </div>
                {candidate.handle && (
                  <div className="text-[12px] text-white/[0.3] tracking-[0.05em] mt-[2px]">{candidate.handle}</div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-1 text-[12px] font-light text-white/[0.3] mt-[3px]">
                    <MapPin size={10} className="opacity-55 flex-shrink-0" strokeWidth={1.5} />
                    <span>{candidate.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            {candidate.introText && (
              <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl px-5 py-4 mb-4">
                <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/[0.28] mb-[10px]">About</div>
                <p className="text-[13px] font-light leading-[1.78] text-white/[0.55]">{candidate.introText}</p>
              </div>
            )}

            {/* Why you matched — full rationale now that identity is open */}
            {Array.isArray(match?.whyMatched) && match!.whyMatched.length > 0 && (
              <div className="bg-[rgba(173,255,47,0.03)] border border-[rgba(173,255,47,0.1)] rounded-2xl px-5 py-4 mb-4">
                <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[rgba(173,255,47,0.6)] mb-[10px]">
                  Why Relethe matched you
                </div>
                <ul className="flex flex-col gap-[8px]">
                  {match!.whyMatched.map((line, i) => (
                    <li key={i} className="text-[13px] font-light leading-[1.6] text-white/[0.6] flex gap-[9px]">
                      <span className="text-[#ADFF2F]/50 mt-[2px] flex-shrink-0">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scheduling handoff */}
            <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl px-5 py-4 mb-6">
              <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/[0.28] mb-[10px] flex items-center gap-[7px]">
                <Calendar size={11} className="opacity-60" strokeWidth={1.6} />
                Next step
              </div>
              {meeting?.meetingUrl ? (
                <>
                  <p className="text-[13px] font-light leading-[1.6] text-white/[0.55] mb-[14px]">
                    {meeting.scheduledAt
                      ? `A call is set for ${new Date(meeting.scheduledAt).toLocaleString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}.`
                      : 'Your call room is ready when you both are.'}
                  </p>
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[7px] px-4 py-[11px] rounded-[12px] bg-[#ADFF2F] text-[#050705] text-[11px] font-semibold tracking-[0.08em] uppercase hover:brightness-105 transition-all"
                  >
                    <Video size={13} strokeWidth={2} />
                    Join call
                  </a>
                </>
              ) : (
                <p className="text-[13px] font-light leading-[1.6] text-white/[0.5]">
                  Scheduling opens up shortly. We'll surface a time that works for you both.
                </p>
              )}
            </div>

            {/* Message */}
            <button
              onClick={() => navigate('/messages')}
              className="w-full px-4 py-[13px] rounded-[13px] bg-white/[0.05] border border-white/[0.12] text-white/[0.7] text-[11px] font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-[8px] hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <MessageCircle size={13} strokeWidth={1.8} />
              Send a message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
