// Onboarding content, in one place.
//
// These lists used to exist twice: once in the step that renders them and once
// in KYCModal, which maps the selected INDEX back to a string before saving.
// Two copies of an ordered list where the order is the meaning is the same
// defect that silently mis-scored the diagnostic — a reordered option computes
// the wrong answer while looking perfectly correct on screen.
//
// One list. The step renders it, the save maps over it, and they cannot drift.

export const OBJECTIVES = [
  'Build in public',
  'Find a cofounder',
  'Grow my network',
  'Meet interesting people',
  'Get mentored',
  'Mentor others',
  'Explore new fields',
  'Share knowledge',
] as const;

/** Step 3 caps selection at three. Intent that includes everything is not intent. */
export const MAX_OBJECTIVES = 3;

export const WHO_OPTIONS = [
  'Are in the same field as me',
  'Are in an adjacent field',
  'Are building something',
  "Have perspectives I don't",
  'Are earlier in their career',
  'Are further along than me',
] as const;

export const WHERE_OPTIONS = [
  'Anywhere in the world',
  'Africa',
  'Asia',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Oceania',
] as const;

/** Saved as `preferredLocations`, minus this one — it is the absence of a filter. */
export const WHERE_ANYWHERE = 'Anywhere in the world';

export const HOBBIES = [
  'Photography', 'Running', 'Coffee', 'Books', 'Travel', 'Design',
  'Music', 'Gaming', 'Cooking', 'Film', 'Writing', 'Startups',
  'Meditation', 'Cycling', 'Football', 'Architecture', 'Podcasts', 'Philosophy',
] as const;

// Sunday = 0 to match the backend slot.dayOfWeek / getUTCDay() convention,
// but presented Monday-first.
export const AVAILABILITY_DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
] as const;

// Preset windows. Kept coarse on purpose — "manual window default" per the
// alignment plan; finer calendar sync comes later. startHour/endHour are the
// slot bounds the matcher consumes.
export const AVAILABILITY_WINDOWS = [
  { key: 'morning', label: 'Morning', hint: '9am – 12pm', startHour: 9, endHour: 12 },
  { key: 'afternoon', label: 'Afternoon', hint: '12pm – 5pm', startHour: 12, endHour: 17 },
  { key: 'evening', label: 'Evening', hint: '5pm – 9pm', startHour: 17, endHour: 21 },
] as const;

export const HOW_IT_WORKS = [
  {
    title: 'One match, every week',
    desc: 'Relethe finds one person worth talking to and makes the introduction. Not a hundred maybes — one considered yes.',
  },
  {
    title: 'Context before you meet',
    desc: 'Their feed gives you a sense of who they are. Not a LinkedIn bio — real thoughts, real perspective.',
  },
  {
    title: 'Always in control',
    desc: 'Pause anytime. Skip a week. No guilt, no consequences. This is yours to use on your terms.',
  },
] as const;

/** Shown under the intro field. Formerly italic Cormorant; the rebrand has no
 *  italic display face, so they are Body 5A quotes in a well — same role,
 *  different signal. */
export const INTRO_EXAMPLES = [
  "An early-stage founder who can't stop thinking about the problem I'm building for. Looking for people who are obsessed with something.",
  'Researcher by training, creative by habit. I like conversations that go somewhere I didn’t expect.',
  'I work at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me.',
] as const;

export const INTRO_MAX = 300;
/** Below this the intro is a label, not an introduction. */
export const INTRO_MIN = 60;

export const SOCIAL_FIELDS = [
  { key: 'linkedin', label: 'LINKEDIN', placeholder: 'linkedin.com/in/yourname', mark: 'in' },
  { key: 'twitter', label: 'TWITTER', placeholder: '@yourhandle', mark: 'X' },
  { key: 'website', label: 'WEBSITE', placeholder: 'yourname.com', mark: '@' },
  { key: 'github', label: 'GITHUB', placeholder: 'github.com/yourname', mark: '{ }' },
] as const;
