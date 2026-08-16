// The cohort's cities.
//
// One fact per city, two renderings. The UTC offset is stored as a NUMBER
// because Step 2 does arithmetic with it (whose 6-9pm lands inside yours), and
// both the label the user reads and the string we persist are derived from it.
// Holding a display string and an offset side by side would be two facts that
// drift.
//
// `offsetHours` is standard time, not DST-adjusted: the step answers "roughly
// who can you meet after work", and a one-hour seasonal shift does not change
// that answer. A real scheduling surface must use the IANA zone instead, which
// is why availability slots already carry `Intl…resolvedOptions().timeZone`
// rather than anything from this table.

export type City = {
  /** ISO 3166-1 alpha-2. Rendered as a CountryMark, never as a flag emoji. */
  country: string;
  name: string;
  /** Zone abbreviation as people say it: WAT, GMT, EST. */
  abbr: string;
  /** Hours from UTC. Fractional for the half-hour zones. */
  offsetHours: number;
};

export const CITIES: City[] = [
  { country: 'NG', name: 'Lagos', abbr: 'WAT', offsetHours: 1 },
  { country: 'GB', name: 'London', abbr: 'GMT', offsetHours: 0 },
  { country: 'US', name: 'New York', abbr: 'EST', offsetHours: -5 },
  { country: 'US', name: 'San Francisco', abbr: 'PST', offsetHours: -8 },
  { country: 'NL', name: 'Amsterdam', abbr: 'CET', offsetHours: 1 },
  { country: 'DE', name: 'Berlin', abbr: 'CET', offsetHours: 1 },
  { country: 'SG', name: 'Singapore', abbr: 'SGT', offsetHours: 8 },
  { country: 'JP', name: 'Tokyo', abbr: 'JST', offsetHours: 9 },
  { country: 'IN', name: 'Bangalore', abbr: 'IST', offsetHours: 5.5 },
  { country: 'ZA', name: 'Cape Town', abbr: 'SAST', offsetHours: 2 },
  { country: 'FR', name: 'Paris', abbr: 'CET', offsetHours: 1 },
  { country: 'BR', name: 'São Paulo', abbr: 'BRT', offsetHours: -3 },
];

/** `+1`, `−5`, `+5:30`. `minus` picks the typographic minus for display or the
 *  ASCII hyphen for the string we store, which has to keep its old shape. */
function utcOffset(hours: number, minus: string): string {
  const sign = hours < 0 ? minus : '+';
  const abs = Math.abs(hours);
  const whole = Math.floor(abs);
  const minutes = Math.round((abs - whole) * 60);
  return `UTC${sign}${whole}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}

/** What the user reads: `WAT · UTC+1`. Typographic minus. */
export const cityTimezoneLabel = (c: City) => `${c.abbr} · ${utcOffset(c.offsetHours, '−')}`;

/** What we persist on `users.timezone`: `WAT (UTC+1)`. Unchanged in shape from
 *  before the rebrand, so existing rows and new ones read the same. */
export const cityTimezoneValue = (c: City) => `${c.abbr} (${utcOffset(c.offsetHours, '-')})`;

/** Wrap an hour into 0–24. */
export const normHour = (h: number) => ((h % 24) + 24) % 24;

/** The cohort's shared evening: 6–9pm local, everywhere. */
export const EVENING_START = 18;
export const EVENING_END = 21;

/**
 * Does `city`'s 6–9pm land inside YOUR 6–9pm? Shift their window onto your
 * clock and ask whether any of your evening hours fall in it.
 */
export function eveningOverlaps(city: City, me: City): boolean {
  const shift = city.offsetHours - me.offsetHours;
  const s = normHour(EVENING_START - shift);
  const e = normHour(EVENING_END - shift);
  return [18, 19, 20].some((h) => (s <= e ? h >= s && h < e : h >= s || h < e));
}
