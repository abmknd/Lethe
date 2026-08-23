import { useState } from 'react';
import './rebrand.css';
import { ConnectMessage, ConnectSurface, SuggestionView, type ConnectTab } from './app/ConnectSurface';
import { DEMO_SUGGESTION, DEMO_VIEWER_AVATAR } from './app/connectDemo';

/**
 * /rebrand/connect — the Connect surface, clickable, without auth or a matcher
 * run behind it. It mounts the SAME components the product mounts; only the
 * data differs. See REBRAND-PLAN, "Preview, always".
 */
export default function ConnectPreviewPage() {
  const [tab, setTab] = useState<ConnectTab>('SUGGESTIONS');
  const [decided, setDecided] = useState<'pass' | 'match' | null>(null);

  return (
    <ConnectSurface tab={tab} onTab={setTab} goalDone={decided ? 2 : 1} avatarSrc={DEMO_VIEWER_AVATAR}>
      {tab !== 'SUGGESTIONS' ? (
        <ConnectMessage
          title={tab === 'ALL MATCHES' ? 'Matches live here.' : 'Nothing scheduled yet.'}
          body="Not rebuilt yet — this preview covers the Suggestions surface."
        />
      ) : decided ? (
        <ConnectMessage
          title={decided === 'match' ? "You're in." : 'Passed.'}
          body={
            decided === 'match'
              ? 'Waiting on the other side. We tell you the moment it resolves, and nothing more if it does not.'
              : 'Nothing is revealed to them. The next suggestion arrives on Monday.'
          }
        />
      ) : (
        <SuggestionView
          suggestion={DEMO_SUGGESTION}
          onPass={() => setDecided('pass')}
          onMatch={() => setDecided('match')}
        />
      )}
    </ConnectSurface>
  );
}
