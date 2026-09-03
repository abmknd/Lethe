import type { Suggestion } from './SuggestionCard';
import lauren from '../../assets/dummies/lauren-shepard.png';
import marcus from '../../assets/dummies/marcus-webb.png';
import anika from '../../assets/dummies/anika-sharma.png';
import priya from '../../assets/dummies/priya-nair.png';
import remi from '../../assets/dummies/remi-falade.png';

/** The signed-in viewer, for the header. */
export const DEMO_VIEWER_AVATAR = remi;

/**
 * The suggestion from the reference, as data.
 *
 * Used by the /rebrand/connect preview so the surface can be reviewed without
 * auth or a matcher run. It doubles as the written-down contract for what the
 * API would have to send: everything below `about` is a field the suggestions
 * endpoint does not currently return, and `pronouns`, `birthday`,
 * `meetingFormats`, `endorsedBy` and `socials` do not exist in the schema at
 * all. See the note at the top of SuggestionCard.
 */
export const DEMO_SUGGESTION: Suggestion = {
  id: 'demo-elena-voss',
  name: 'Elena Voss',
  avatarSrc: lauren,
  role: 'Design Engineer',
  location: 'Frankfurt, Germany',
  pronouns: 'She/Her/Hers',
  birthday: 'September, 21st',
  about:
    'I build at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me. Currently focused on ethical design frameworks for emerging tech.',
  commonInterests: [
    'Design Ethics',
    'Systems Thinking',
    'Effective Altruism',
    'Architecture',
    'Coffee',
    'Game Theory',
    'Cats',
  ],
  meetingFormats: ['Video call', 'In person'],
  signalBullets: [
    "You're both active in the **Effective Altruism community**. She has attended the same chapter events.",
    'She left agency work to go independent **within the same six-month window** as you.',
  ],
  endorsedBy: {
    people: [
      { src: marcus, name: 'George Tracy' },
      { src: anika, name: 'Anika Sharma' },
      { src: priya, name: 'Priya Nair' },
    ],
    sentence: 'and 3 others.',
  },
  socials: [{ kind: 'linkedin' }, { kind: 'website' }, { kind: 'substack' }],
};
