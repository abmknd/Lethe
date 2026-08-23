import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { listUserRecommendations, markMatchesSeen, respondToRecommendation } from './api';
import type { Recommendation } from './types';
import { useAuth } from './context/AuthContext';
import {
  ConnectMessage,
  ConnectSurface,
  SuggestionView,
  type ConnectTab,
} from '../rebrand/app/ConnectSurface';
import type { Suggestion } from '../rebrand/app/SuggestionCard';

/**
 * Map a recommendation onto the card's view model.
 *
 * WHERE THE DATA IS NOT: the reference design shows identity — name, photo,
 * socials, endorsements — above PASS / MATCH, but `candidate` is null while a
 * match is blind and the endpoint sends `blindRationale` instead. Several
 * fields the card asks for (pronouns, birthday, meeting formats, endorsements,
 * socials) have no column anywhere.
 *
 * So this maps what exists and leaves the rest empty rather than inventing it.
 * A card with an empty COMMON INTERESTS block is a visible, honest gap; a card
 * filled with plausible fiction is a lie that survives to production.
 */
function toSuggestion(rec: Recommendation): Suggestion {
  const c = rec.candidate;
  return {
    id: rec.id,
    // Blind: the role category is the only thing we may say about them.
    name: c?.displayName ?? rec.blindRationale?.roleCategory ?? 'A match',
    avatarSrc: undefined,
    role: c ? '' : 'Identity opens when you both accept',
    location: c?.location ?? '',
    pronouns: '',
    birthday: '',
    about: c?.introText ?? rec.insightText ?? '',
    commonInterests: (rec.blindRationale?.overlapThemes ?? []).map((t) => t.label),
    meetingFormats: [],
    signalBullets: rec.whyMatched ?? [],
    endorsedBy: { people: [], sentence: '' },
    socials: [],
  };
}

export default function ConnectPage() {
  const navigate = useNavigate();
  const { user, getAccessToken } = useAuth();
  const userId = user?.id ?? '';
  const avatarSrc = user?.user_metadata?.avatar_url as string | undefined;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tab, setTab] = useState<ConnectTab>('SUGGESTIONS');

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    setCurrentIdx(0);
    (async () => {
      const token = await getAccessToken();
      try {
        // #76.3 — Suggestions surfaces what an admin has approved, not the
        // raw matcher output. Under the blind gate a lone accept keeps the
        // row `approved` while the other side decides, so filter out rows
        // the viewer has already responded to.
        const recs = await listUserRecommendations(userId, 'approved', token);
        setRecommendations(recs.filter((r) => !r.viewerResponse));
        // #76.3 — visiting Suggestions clears the new-match badge.
        markMatchesSeen(userId, token).catch(() => {});
      } catch {
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId, getAccessToken]);

  const rec = recommendations[currentIdx];
  const isComplete = !isLoading && currentIdx >= recommendations.length;

  const handlePass = async () => {
    if (isAnimating || !rec) return;
    setIsAnimating(true);
    const token = await getAccessToken();
    try {
      await respondToRecommendation({ recommendationId: rec.id, userId, decision: 'pass' }, token);
    } catch {}
    setCurrentIdx((i) => i + 1);
    setIsAnimating(false);
  };

  const handleMatch = async () => {
    if (isAnimating || !rec) return;
    setIsAnimating(true);
    const token = await getAccessToken();
    let mutual = false;
    try {
      const result = await respondToRecommendation({ recommendationId: rec.id, userId, decision: 'accept' }, token);
      mutual = Boolean(result.mutual);
    } catch {}
    // A lone accept is a vote, not a match — the blind gate means identity only
    // opens when both sides have said yes.
    if (mutual) {
      navigate(`/matches/${rec.id}`);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setIsAnimating(false);
  };

  const changeTab = (next: ConnectTab) => {
    setTab(next);
    if (next === 'ALL MATCHES') navigate('/matches');
    if (next === 'UPCOMING') navigate('/matches?filter=upcoming');
  };

  return (
    <ConnectSurface
      tab={tab}
      onTab={changeTab}
      goalDone={Math.min(currentIdx, recommendations.length)}
      avatarSrc={avatarSrc}
      onNavigate={navigate}
      onInvite={() => navigate('/profile')}
    >
      {isLoading ? (
        <ConnectMessage title="Finding this week's people." body="One moment." />
      ) : isComplete || !rec ? (
        recommendations.length === 0 ? (
          <ConnectMessage
            title="No suggestions yet."
            body="Your first introduction arrives once the weekly matcher has run. Nothing to do until then."
          />
        ) : (
          <ConnectMessage
            title="You're all caught up."
            body="New suggestions arrive each Monday. We'd rather send you one worth reading than a list worth skimming."
          />
        )
      ) : (
        <SuggestionView
          suggestion={toSuggestion(rec)}
          onPass={handlePass}
          onMatch={handleMatch}
          busy={isAnimating}
        />
      )}
    </ConnectSurface>
  );
}
