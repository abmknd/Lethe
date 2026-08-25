/**
 * Demo content for the app shell preview.
 *
 * Lifted verbatim from `Relethe App.dc.html` in the design project, so the
 * preview shows the copy the design was composed against rather than filler.
 * Nothing here ships — the real surfaces read from the API.
 */

const AV = {
  elena: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  marcus: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  nova: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  me: 'https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
};

const MEDIA = {
  city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  desk: 'https://images.unsplash.com/photo-1517842645767-c639042777db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
};

export const ME = AV.me;

export const NAV = ['FEED', 'MATCHES', 'COMMUNITIES'] as const;
export type NavTab = (typeof NAV)[number];

export const FEED_RAIL = ['For you', 'Following', 'Insights', 'Explore', 'Bookmarks', 'Activity'] as const;
export const MATCH_RAIL = ['All', 'Suggested', 'Upcoming', 'Endorsed', 'Invited', 'Disavowed'] as const;

export type Post = {
  name: string; handle: string; time: string;
  likes: number; replies: number; echoes: number;
  media: string | null; avatar: string; body: string;
};

export const POSTS: Post[] = [
  {
    name: 'Abel Kant', handle: '@abelkant', time: '2h', likes: 48, replies: 12, echoes: 6,
    media: null, avatar: AV.marcus,
    body: 'Ran the same intro question at four meetings this month: what did you change your mind about recently. Nobody gave a small answer. Turns out the question does the work, not the venue.',
  },
  {
    name: 'Elena Voss', handle: '@elenavoss', time: '5h', likes: 126, replies: 31, echoes: 19,
    media: MEDIA.desk, avatar: AV.elena,
    body: 'Six months of independent work, one lesson: the calendar is the design tool. Everything else is downstream of when you let people reach you.',
  },
  {
    name: 'Nova Winters', handle: '@novawinters', time: 'Jul 22', likes: 73, replies: 8, echoes: 4,
    media: null, avatar: AV.nova,
    body: "Silence in a group decision isn't consent and isn't dissent. It's usually someone waiting to see who pays first for saying the obvious thing.",
  },
  {
    name: 'Marcus Jin', handle: '@marcusjin', time: 'Jul 20', likes: 91, replies: 14, echoes: 11,
    media: MEDIA.city, avatar: AV.marcus,
    body: "The city before 6am is the only version of it that isn't negotiating with you. Most of what I shipped this quarter was decided on those walks.",
  },
];

export type MatchRow = {
  name: string; handle: string; avatar: string;
  status: 'Upcoming' | 'Met'; about: string; signal: string;
};

export const MATCHES: MatchRow[] = [
  {
    name: 'Iris Morrow', handle: '@irismorrow', avatar: AV.nova, status: 'Upcoming',
    about: "I collect other people's decision-making habits, then borrow the ones that survive contact with a deadline.",
    signal: 'Video call on 05 Mar, 12:00PM. Two people in your Monday cohort follow her.',
  },
  {
    name: 'Theo Lark', handle: '@theolark', avatar: AV.me, status: 'Upcoming',
    about: 'Ex-journalist writing about decision science. I ask one more question than is comfortable.',
    signal: 'Voice call on 09 Mar, 8:30AM. You both wrote about the same idea a week apart.',
  },
  {
    name: 'Marcus Jin', handle: '@marcusjin', avatar: AV.marcus, status: 'Met',
    about: 'I write software early and walk the city late. Most of what I build gets designed in that quiet hour.',
    signal: 'You met on 10 Feb. He endorsed you afterwards.',
  },
  {
    name: 'Elena Voss', handle: '@elenavoss', avatar: AV.elena, status: 'Met',
    about: 'I build at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me.',
    signal: 'You met on 15 Feb. She rated the meeting five stars.',
  },
];

export const FAVES = [
  { name: 'Anya Kurosawa', handle: '@anyakurosawa', avatar: AV.elena, times: '3 times', rest: ' · you follow each other' },
  { name: 'Kai Shore', handle: '@kaishore', avatar: AV.marcus, times: '2 times', rest: ' · you endorsed Kai' },
  { name: 'Maya Frost', handle: '@mayafrost', avatar: AV.nova, times: '2 times', rest: ' · Maya endorsed you' },
  { name: 'Theo Lark', handle: '@theolark', avatar: AV.me, times: 'once', rest: ' · you invited Theo' },
];

export const FOLLOW = [
  { name: 'Priya Raman', handle: '@priyaraman', avatar: AV.nova, signal: 'Endorsed by George Tracy' },
  { name: 'Ana Duarte', handle: '@anaduarte', avatar: AV.elena, signal: '3 shared interests' },
  { name: 'Kai Shore', handle: '@kaishore', avatar: AV.marcus, signal: 'Met someone you met' },
  { name: 'River Castellano', handle: '@rivercastellano', avatar: AV.me, signal: '2 mutual follows' },
];

export type Profile = {
  name: string; handle: string; avatar: string; role: string;
  city: string; pronouns: string; birthday: string; about: string;
  interests: string[];
  bullets: { pre: string; emph: string; post: string }[];
  endorsers: string[]; endorseName: string; endorseRest: string;
  formats: string[];
};

export const PROFILES: Profile[] = [
  {
    name: 'Elena Voss', handle: '@elenavoss', avatar: AV.elena, role: 'Design Engineer',
    city: 'Frankfurt, Germany', pronouns: 'She/Her/Hers', birthday: 'September, 21st',
    about: 'I build at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me. Currently focused on ethical design frameworks for emerging tech.',
    interests: ['Design Ethics', 'Systems Thinking', 'Effective Altruism', 'Architecture', 'Coffee'],
    bullets: [
      { pre: "You're both active in the ", emph: 'Effective Altruism community', post: '. She has attended the same chapter events.' },
      { pre: 'She left agency work to go independent ', emph: 'within the same six-month window', post: ' as you.' },
    ],
    endorsers: [AV.marcus, AV.nova], endorseName: 'George Tracy', endorseRest: 'and 3 others.',
    formats: ['Video call', 'In person'],
  },
  {
    name: 'Nova Winters', handle: '@novawinters', avatar: AV.nova, role: 'Researcher',
    city: 'Copenhagen, Denmark', pronouns: 'They/Them/Theirs', birthday: 'March, 4th',
    about: 'I study how groups decide things, which mostly means I listen for a living. Silence is not empty. It is full of answers we are not yet ready to hear.',
    interests: ['Decision Science', 'Effective Altruism', 'Architecture', 'Silence'],
    bullets: [
      { pre: 'You have written about the same idea a week apart: ', emph: 'what silence does to a conversation', post: '.' },
      { pre: 'Three people follow you both, and ', emph: 'two are in your Monday cohort', post: '.' },
    ],
    endorsers: [AV.elena, AV.marcus], endorseName: 'Priya Raman', endorseRest: 'and 1 other.',
    formats: ['Voice only', 'Video call'],
  },
  {
    name: 'Marcus Jin', handle: '@marcusjin', avatar: AV.marcus, role: 'Engineer',
    city: 'Lisbon, Portugal', pronouns: 'He/Him/His', birthday: 'November, 9th',
    about: 'I write software early and walk the city late. There is something meditative about the quiet before the noise, and most of what I build gets designed in that hour.',
    interests: ['Systems Thinking', 'Cities', 'Coffee', 'Photography'],
    bullets: [
      { pre: 'You both post in the hour before the city wakes: ', emph: 'his 5am is your 7am', post: '.' },
      { pre: 'He is the only person this week whose ', emph: 'evenings line up with your Thursday', post: '.' },
    ],
    endorsers: [AV.nova, AV.elena], endorseName: 'Ana Duarte', endorseRest: 'and 5 others.',
    formats: ['In person', 'Video call'],
  },
];
