import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { listUserRecommendations, markMatchesSeen, respondToRecommendation } from './api';
import type { Recommendation } from './types';
import { useAuth } from './context/AuthContext';
import '../rebrand/rebrand.css';
import { AppShell, MessageView, SuggestionsView } from '../rebrand/app/AppShell';
import { MATCH_RAIL } from '../rebrand/app/appDemo';
import type { Profile } from '../rebrand/app/appDemo';

/**
 * SUGGESTED — `relethe-feed` 911:4246, on real recommendations.
 *
 * This route is the **Suggested** row of the MATCHES tab, not a surface of its
 * own. It renders the same `AppShell` as the preview, differing only in where
 * the profile comes from. The retired CONNECT design it used to mount — its own
 * header, its own three-up tab rail — is gone.
 *
 * The path is still `/connect` because that is what the app links to and
 * renaming it is a separate change with its own redirects.
 */

const NAV_MATCHES = 1;
const RAIL_SUGGESTED = MATCH_RAIL.indexOf('Suggested');

/**
 * Map a recommendation onto the card's view model.
 *
 * WHERE THE DATA IS NOT: the design shows identity — photo, socials,
 * endorsements, meeting formats — above PASS / MATCH, but `candidate` is null
 * while a match is blind and the endpoint sends `blindRationale` instead.
 * Several of those fields have no column anywhere (docs/backend-gaps.md 2b).
 *
 * So this maps what exists and leaves the rest empty. `SuggestionsView` hides a
 * section whose list is empty, so the card comes out short rather than
 * scaffolded with blanks. A card filled with plausible fiction is a lie that
 * survives to production; a shorter card is just the truth about what we know.
 */
function toProfile(rec: Recommendation): Profile {
  const c = rec.candidate;
  return {
    name: c?.displayName ?? 'A match',
    handle: c?.handle ?? '',
    // `candidate` is EXACTLY id, displayName, handle, location, timezone,
    // introText. It carries no avatar, so this is empty even though
    // `users.avatar_url` exists and `AppUser.avatarUrl` reads it — the column is
    // real, the payload just does not include it (docs/backend-gaps.md 2a).
    avatarSrc: undefined,
    // The role chip is `blindRationale.roleCategory`, which is the field's whole
    // purpose: what we may say about someone while their identity is closed.
    // It is NOT a field on `candidate`; reading it off there was wrong.
    role: rec.blindRationale?.roleCategory ?? '',
    city: c?.location ?? '',
    about: c?.introText ?? rec.insightText ?? '',
    // No interest chips while blind. `overlapThemes` are SENTENCES ("Shared
    // interest in Architecture and Cats"), not tags, and a sentence in a Tag
    // chip is a chip used as a paragraph. They belong in SIGNAL, below.
    interests: [],
    /**
     * SIGNAL comes from `blindRationale`, NOT from `whyMatched`.
     *
     * Two reasons, either of which is decisive. `whyMatched` is the matcher's
     * internal scoring diagnostics — "Ask-offer fit 73%", "Role fit 50%
     * (founder ↔ investor)" — which is audit output, not something to show a
     * person. And the API sends it as `[]` on every blind record by design, so
     * reading it here rendered an empty SIGNAL section on every card.
     *
     * `overlapThemes` now carries `{pre, emph, post}`, so the two-colour
     * emphasis the design draws renders on live data.
     */
    bullets: [
      ...(rec.blindRationale?.overlapThemes ?? []).map((t) => ({
        pre: t.pre,
        emph: t.emph,
        post: t.post,
      })),
      // Real signal and the one line that is about the meeting rather than the
      // person, so it closes the list. No emphasis: there is no phrase in it
      // that is more "theirs" than the rest.
      ...(rec.blindRationale?.availabilityCompatibility
        ? [{ pre: rec.blindRationale.availabilityCompatibility, emph: '', post: '' }]
        : []),
    ],
    endorsers: [],
    endorseName: '',
    endorseRest: '',
    formats: [],
    socials: [],
  };
}

export default function ConnectPage() {
  const navigate = useNavigate();
  const { user, getAccessToken } = useAuth();
  const userId = user?.id ?? '';

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // The tabs and the rail are navigation now, not local state. Only the rows
  // with a screen behind them move; the rest stay put rather than leading
  // somewhere that does not exist yet.
  const onNav = (i: number) => {
    if (i === 0) navigate('/feed');
    if (i === 2) navigate('/communities');
  };
  const onRail = (i: number) => {
    const label = MATCH_RAIL[i];
    if (label === 'Matches') navigate('/matches');
    if (label === 'Upcoming') navigate('/matches?filter=upcoming');
  };

  return (
    <AppShell nav={NAV_MATCHES} rail={RAIL_SUGGESTED} onNav={onNav} onRail={onRail}>
      {isLoading ? (
        <MessageView title="Finding this week's people." body="One moment." />
      ) : isComplete || !rec ? (
        recommendations.length === 0 ? (
          <MessageView
            title="No suggestions yet."
            body="Your first introduction arrives once the weekly matcher has run. Nothing to do until then."
          />
        ) : (
          <MessageView
            title="You're all caught up."
            body="New suggestions arrive each Monday. We'd rather send you one worth reading than a list worth skimming."
          />
        )
      ) : (
        <SuggestionsView
          profile={toProfile(rec)}
          done={Math.min(currentIdx, recommendations.length)}
          onPass={handlePass}
          onMatch={handleMatch}
          busy={isAnimating}
        />
      )}
    </AppShell>
  );
}
