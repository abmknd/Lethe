import type { AvatarName } from '../../assets/avatars';

/**
 * Demo content for the app shell preview. Nothing here ships.
 *
 * THE POV IS ELENA VOSS. She is the signed-in user — the header avatar, the
 * composer, the "you" in every signal line. That is a change: she used to be
 * the person being suggested, so the app was being viewed past her rather than
 * through her.
 *
 * Everyone here is a real member of Figma's `Avatar Image` set, so a name and a
 * face cannot drift apart. Adding a person means adding them to that set first.
 */

export const ME = {
  name: 'Elena Voss',
  handle: '@elenavoss',
  avatar: 'elena-voss' as AvatarName,
};

export const NAV = ['FEED', 'MATCHES', 'COMMUNITIES'] as const;
export type NavTab = (typeof NAV)[number];

export const FEED_RAIL = ['For you', 'Following', 'Insights', 'Explore', 'Bookmarks', 'Activity'] as const;
export const MATCH_RAIL = ['Matches', 'Suggested', 'Upcoming', 'Endorsed', 'Invited', 'Disavowed'] as const;

const MEDIA = {
  city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  desk: 'https://images.unsplash.com/photo-1517842645767-c639042777db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
};

export type Post = {
  name: string; handle: string; time: string;
  likes: number; replies: number; echoes: number;
  media: string | null; avatar: AvatarName; body: string;
};

export const POSTS: Post[] = [
  {
    name: 'Abel Kant', handle: '@abelkant', time: '2h', likes: 48, replies: 12, echoes: 6,
    media: null, avatar: 'abel-kant',
    body: 'Ran the same intro question at four meetings this month: what did you change your mind about recently. Nobody gave a small answer. Turns out the question does the work, not the venue.',
  },
  {
    name: 'Monty Wei', handle: '@montywei', time: '5h', likes: 126, replies: 31, echoes: 19,
    media: MEDIA.desk, avatar: 'monty-wei',
    body: 'Six months of independent work, one lesson: the calendar is the design tool. Everything else is downstream of when you let people reach you.',
  },
  {
    name: 'Maya Frost', handle: '@mayafrost', time: 'Jul 22', likes: 73, replies: 8, echoes: 4,
    media: null, avatar: 'maya-frost',
    body: "Silence in a group decision isn't consent and isn't dissent. It's usually someone waiting to see who pays first for saying the obvious thing.",
  },
  {
    name: 'Marcus Jin', handle: '@marcusjin', time: 'Jul 20', likes: 91, replies: 14, echoes: 11,
    media: MEDIA.city, avatar: 'marcus-jin',
    body: "The city before 6am is the only version of it that isn't negotiating with you. Most of what I shipped this quarter was decided on those walks.",
  },
];

export type MatchRow = {
  name: string; handle: string; avatar: AvatarName;
  status: 'Upcoming' | 'Met'; about: string;
  /** Split so the date reads as a link, the way the frame draws it. */
  signal: { pre: string; link: string; post: string };
};

export const MATCHES: MatchRow[] = [
  {
    name: 'Iris Morrow', handle: '@irismorrow', avatar: 'iris-morrow', status: 'Upcoming',
    about: "I collect other people's decision-making habits, then borrow the ones that survive contact with a deadline.",
    signal: { pre: 'Video ', link: 'call on 05 Mar, 12:00PM', post: '. Two people in your Monday cohort follow her.' },
  },
  {
    name: 'Theo Lark', handle: '@theolark', avatar: 'theo-lark', status: 'Upcoming',
    about: 'Ex-journalist writing about decision science. I ask one more question than is comfortable.',
    signal: { pre: 'Voice ', link: 'call on 09 Mar, 8:30AM', post: '. You both wrote about the same idea a week apart.' },
  },
  {
    name: 'Marcus Jin', handle: '@marcusjin', avatar: 'marcus-jin', status: 'Met',
    about: 'I write software early and walk the city late. Most of what I build gets designed in that quiet hour.',
    signal: { pre: 'You ', link: 'met on 10 Feb', post: '. He endorsed you afterwards.' },
  },
];

export const FAVES: { name: string; handle: string; avatar: AvatarName; note: string }[] = [
  { name: 'Anya Kurosawa', handle: '@anyakurosawa', avatar: 'anya-kurosawa', note: 'Met 3 times · you follow each other' },
  { name: 'Marcus Jin', handle: '@marcusjin', avatar: 'marcus-jin', note: 'Met 2 times · you endorsed Marcus' },
  { name: 'Maya Frost', handle: '@mayafrost', avatar: 'maya-frost', note: 'Met 2 times · Maya endorsed you' },
  { name: 'Theo Lark', handle: '@theolark', avatar: 'theo-lark', note: 'Met once · you invited Theo' },
];

export const FOLLOW: { name: string; handle: string; avatar: AvatarName; note: string }[] = [
  { name: 'Priya Nair', handle: '@priyanair', avatar: 'priya-nair', note: 'Endorsed by George Tracy' },
  { name: 'Anika Sharma', handle: '@anikasharma', avatar: 'anika-sharma', note: '3 shared interests' },
  { name: 'Marcus Webb', handle: '@marcuswebb', avatar: 'marcus-webb', note: 'Met someone you met' },
  { name: 'Sofia Mendes', handle: '@sofiamendes', avatar: 'sofia-mendes', note: '2 mutual follows' },
];

export type Profile = {
  name: string; handle: string; avatar: AvatarName; role: string;
  city: string; about: string;
  interests: string[];
  bullets: { pre: string; emph: string; post: string }[];
  endorsers: AvatarName[]; endorseName: string; endorseRest: string;
  formats: string[];
};

/**
 * The people Elena is being suggested. She is deliberately not among them — a
 * suggestion feed that offers you yourself is the bug nobody files.
 */
export const PROFILES: Profile[] = [
  {
    name: 'Monty Wei', handle: '@montywei', avatar: 'monty-wei', role: 'Software Engineer',
    city: 'Frankfurt, Germany',
    about: 'I build at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me. Currently focused on ethical design frameworks for emerging tech.',
    interests: ['Design Ethics', 'Systems Thinking', 'Effective Altruism', 'Coffee', 'Architecture', 'Cats', 'Game Theory'],
    bullets: [
      { pre: "You're both active in the ", emph: 'Effective Altruism community', post: '. He has attended the same chapter events.' },
      { pre: 'He left agency work to go independent ', emph: 'within the same six-month window', post: ' as you.' },
    ],
    endorsers: ['george-tracy', 'anya-kurosawa', 'abel-kant'],
    endorseName: 'George Tracy', endorseRest: 'and 3 others.',
    formats: ['Video call', 'In-person'],
  },
  {
    name: 'Iris Morrow', handle: '@irismorrow', avatar: 'iris-morrow', role: 'Researcher',
    city: 'Copenhagen, Denmark',
    about: 'I study how groups decide things, which mostly means I listen for a living. Silence is not empty. It is full of answers we are not yet ready to hear.',
    interests: ['Decision Science', 'Effective Altruism', 'Architecture', 'Silence'],
    bullets: [
      { pre: 'You have written about the same idea a week apart: ', emph: 'what silence does to a conversation', post: '.' },
      { pre: 'Three people follow you both, and ', emph: 'two are in your Monday cohort', post: '.' },
    ],
    endorsers: ['maya-frost', 'theo-lark', 'marcus-jin'],
    endorseName: 'Priya Nair', endorseRest: 'and 1 other.',
    formats: ['Voice only', 'Video call'],
  },
  {
    name: 'Marcus Jin', handle: '@marcusjin', avatar: 'marcus-jin', role: 'Engineer',
    city: 'Lisbon, Portugal',
    about: 'I write software early and walk the city late. There is something meditative about the quiet before the noise, and most of what I build gets designed in that hour.',
    interests: ['Systems Thinking', 'Cities', 'Coffee', 'Photography'],
    bullets: [
      { pre: 'You both post in the hour before the city wakes: ', emph: 'his 5am is your 7am', post: '.' },
      { pre: 'He is the only person this week whose ', emph: 'evenings line up with your Thursday', post: '.' },
    ],
    endorsers: ['anika-sharma', 'marcus-webb', 'sofia-mendes'],
    endorseName: 'Ana Duarte', endorseRest: 'and 5 others.',
    formats: ['In-person', 'Video call'],
  },
];
