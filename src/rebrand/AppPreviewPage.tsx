import { useState } from 'react';
import './rebrand.css';
import {
  AppShell,
  AsideColumn,
  MessageView,
  FeedView,
  MatchListView,
  SuggestionsView,
} from './app/AppShell';
import { FEED_RAIL, PROFILES, RAILS } from './app/appDemo';

/**
 * THE DEMO COMPOSITION.
 *
 * The shell is a layout with no data of its own, so the demo state — which tab,
 * which rail row, which profile, how much of the daily goal is spent — lives
 * here rather than inside it. `src/app/ConnectPage.tsx` composes the same shell
 * from real recommendations; keeping the demo's state out of `AppShell` is what
 * lets both exist without one pretending to be the other.
 */
export default function AppPreviewPage() {
  const [nav, setNav] = useState(0);
  const [rail, setRail] = useState(0);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(1);

  const railItems = RAILS[nav] ?? FEED_RAIL;
  const railLabel = railItems[rail] ?? railItems[0];
  const isSuggestions = nav === 1 && railLabel === 'Suggested';
  const profile = PROFILES[idx % PROFILES.length];

  const decide = () => {
    setIdx((i) => i + 1);
    setDone((d) => Math.min(10, d + 1));
  };

  return (
    <AppShell
      nav={nav}
      rail={rail}
      onNav={(i) => {
        setNav(i);
        setRail(0);
      }}
      onRail={setRail}
      // 911:4246 has no right-hand column; 907:22311 and the feed do.
      aside={isSuggestions ? undefined : <AsideColumn isFeed={nav === 0} />}
    >
      {isSuggestions ? (
        <SuggestionsView profile={profile} done={done} onPass={decide} onMatch={decide} />
      ) : (
        <main className="flex min-w-0 flex-col gap-[20px]">
          {nav === 0 && <FeedView />}
          {nav === 1 && <MatchListView rail={railLabel} />}
          {nav === 2 && (
            <MessageView
              title="Communities come next."
              body="Rooms built around the things people keep meeting about. The rail is real; nothing to join yet."
            />
          )}
        </main>
      )}
    </AppShell>
  );
}
