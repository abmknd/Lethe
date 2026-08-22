/**
 * The system_icons usage map.
 *
 * THE LIBRARY IS HUGEICONS, adopted whole as the Relethe icon library and
 * shipped from `@hugeicons/react` + `@hugeicons/core-free-icons` (MIT). Nothing
 * in here is drawn by us and nothing here restricts which icons may be used —
 * the whole library is available.
 *
 * This file is the SOURCE. `docs/system-icons.md` is generated from it, so the
 * list cannot drift from its own documentation — run `node scripts/icon-inventory.mjs`
 * after any edit.
 *
 * Why a script rather than a hand-written table: the inventory is a running
 * artifact (REBRAND-PLAN 4c-i). Every surface we rebuild adds icons to it, and
 * a hand-maintained list of 240 names silently accumulates duplicates,
 * inconsistent naming, and icons nothing imports. The assertions at the bottom
 * catch all three.
 *
 * NAMING: kebab-case, NOUN FIRST, modifier after — `calendar-add`, not
 * `add-calendar`; `message-unread`, not `unread-message`. Noun-first is what
 * makes related icons sort together, which is the entire point of a convention.
 * State suffixes are `-on` / `-off`, per `radio-on`.
 */

/** The 42 lucide icons the product imports today, mapped to house names.
 *  This is the migration checklist: every one must resolve to a library icon
 *  before `lucide-react` can leave package.json. */
export const IN_USE = {
  'activity-pulse': 'Activity',
  'alert-circle': 'AlertCircle',
  'alert-triangle': 'AlertTriangle',
  'arrow-left': 'ArrowLeft',
  ban: 'Ban',
  // Semantic, not pictorial: lucide's `Bell` is a picture of a bell, ours is
  // the thing it means. Renaming at the boundary is the cheapest moment to do it.
  notification: 'Bell',
  calendar: 'Calendar',
  check: 'Check',
  'chevron-left': 'ChevronLeft',
  clock: 'Clock',
  download: 'Download',
  'eye-off': 'EyeOff',
  'document-text': 'FileText',
  'layout-grid': 'Grid',
  heart: 'Heart',
  image: 'Image',
  link: 'Link2',
  'layout-list': 'List',
  'sign-out': 'LogOut',
  'map-pin': 'MapPin',
  message: 'MessageCircle',
  'more-horizontal': 'MoreHorizontal',
  'more-vertical': 'MoreVertical',
  attachment: 'Paperclip',
  pin: 'Pin',
  plus: 'Plus',
  refresh: 'RotateCcw',
  search: 'Search',
  send: 'Send',
  share: 'Share2',
  'emoji-smile': 'Smile',
  sparkle: 'Sparkles',
  trash: 'Trash2',
  upload: 'Upload',
  user: 'User',
  'user-add': 'UserPlus',
  'user-group': 'Users',
  video: 'Video',
  'volume-on': 'Volume2',
  'volume-off': 'VolumeX',
  close: 'X',
  bolt: 'Zap',
};

export const GROUPS = [
  {
    name: 'Navigation and chrome',
    note: 'Movement through the product. Every one of these is used on more than one surface, which is why they are first.',
    icons: [
      'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
      'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down',
      'arrow-external', 'close', 'menu', 'more-horizontal', 'more-vertical',
      'search', 'home',
    ],
  },
  {
    name: 'Actions',
    note: 'Things a user does TO something. Verbs.',
    icons: [
      'plus', 'minus', 'edit', 'trash', 'copy', 'share', 'download', 'upload',
      'refresh', 'undo', 'filter', 'sort', 'expand', 'collapse', 'drag-handle',
      'pin', 'pin-off', 'archive', 'link', 'link-off', 'attachment', 'send',
    ],
  },
  {
    name: 'Status and feedback',
    note: 'What the system is telling you. Never the only carrier of meaning — each pairs with a label.',
    icons: [
      'check', 'check-circle', 'close-circle', 'alert-circle', 'alert-triangle',
      'info-circle', 'help-circle', 'loading-spinner', 'verified-badge',
      'shield-check', 'lock', 'unlock', 'eye', 'eye-off', 'flag', 'ban',
      'star', 'heart', 'bolt', 'sparkle',
    ],
  },
  {
    name: 'People and identity',
    note: 'Who someone is. `user-anonymous` matters more here than in most products: the blind gate means a real person is often deliberately unshown.',
    icons: [
      'user', 'user-avatar', 'user-add', 'user-remove', 'user-check',
      'user-group', 'user-anonymous', 'user-blocked', 'avatar-stack',
      'profile-card', 'handshake', 'presence-online', 'presence-away',
      'presence-offline',
    ],
  },
  {
    name: 'Role families',
    note: 'One per family in Step 9. A chip grid of fourteen text labels is the densest thing in onboarding, and a mark per family is what makes it scannable. Fourteen judgement calls, since the library has no role taxonomy.',
    icons: [
      'role-founder', 'role-operator', 'role-engineer', 'role-designer',
      'role-researcher', 'role-writer', 'role-artist', 'role-investor',
      'role-educator', 'role-healthcare', 'role-public-service', 'role-trades',
      'role-student', 'role-other',
    ],
  },
  {
    name: 'Matching and intro',
    note: 'The product\'s actual subject, and the group most likely to need a substituted or composed icon — the library has no `match-blind`, so these resolve by meaning rather than by name.',
    icons: [
      'match-blind', 'match-revealed', 'match-accept', 'match-pass',
      'match-pending', 'intro-sent', 'intro-scheduled', 'intro-complete',
      'intro-missed', 'confidence-band', 'signal-overlap', 'signal-strong',
      'signal-weak', 'rematch', 'matching-on', 'matching-off',
    ],
  },
  {
    name: 'Trust and review',
    note: 'The surfaces in Phase 4b that do not exist yet. Mapped now so the icon is chosen once, deliberately, rather than grabbed at build time.',
    icons: [
      'review-blind', 'review-unlocked', 'rating-scale', 'trust-ledger',
      'provenance', 'dispute', 'dispute-resolved', 'suspension', 'reinstate',
      'no-show', 'report', 'moderation',
    ],
  },
  {
    name: 'Time and scheduling',
    note: '`daylight-band` is the 24-hour track from Step 2, reduced to an icon. The three windows match AVAILABILITY_WINDOWS exactly.',
    icons: [
      'calendar', 'calendar-add', 'calendar-check', 'calendar-off', 'clock',
      'clock-pending', 'hourglass', 'daylight-band', 'timezone', 'availability',
      'availability-off', 'morning', 'afternoon', 'evening', 'recurring',
      'reminder',
    ],
  },
  {
    name: 'Communication',
    icons: [
      'message', 'message-add', 'message-unread', 'reply', 'thread', 'mention',
      'email', 'email-open', 'notification', 'notification-off', 'video-call',
      'audio-call', 'mic', 'mic-off', 'volume-on', 'volume-off',
    ],
  },
  {
    name: 'Content and feed',
    note: 'The three content-state icons carry Relethe\'s core idea: posts move flowing to fading to faded. No library ships that concept, so these are the likeliest to need composing from what is there.',
    icons: [
      'post', 'post-add', 'feed', 'image', 'video', 'document-text', 'quote',
      'list-bullet', 'layout-grid', 'layout-list', 'bookmark', 'echo',
      'view-count', 'content-flowing', 'content-fading', 'content-faded',
      'draft', 'publish',
    ],
  },
  {
    name: 'Location and world',
    icons: [
      'map-pin', 'map-pin-off', 'globe', 'city', 'compass', 'navigate',
      'region', 'map',
    ],
  },
  {
    name: 'Brand marks',
    note: 'The library ships these in its Brand Logo sheet. Use them AS DRAWN — a brand mark is a trademark and its recognisability is its function, so this is the one group that never gets re-stroked to match the house weight.',
    icons: [
      'brand-linkedin', 'brand-x', 'brand-github', 'brand-substack',
      'brand-instagram', 'brand-youtube', 'brand-figma', 'brand-discord', 'brand-google',
      'brand-apple', 'brand-calendly', 'website',
    ],
  },
  {
    name: 'Commerce and account',
    note: 'Free and paid tiers exist in the roadmap but not the product. Drawn in the same batch so the paywall is not the moment we discover we have no icons for it.',
    icons: [
      'credit-card', 'invoice', 'receipt', 'wallet', 'plan-free', 'plan-paid',
      'upgrade', 'billing', 'referral', 'invite',
    ],
  },
  {
    name: 'Data and admin',
    note: 'The admin routes that do not exist yet — trust ledger, suspensions, dispute queue, the HITL dial.',
    icons: [
      'chart-line', 'chart-bar', 'analytics', 'dashboard', 'database',
      'funnel', 'export', 'log', 'audit', 'queue', 'admin-shield',
    ],
  },
  {
    name: 'Form controls',
    note: 'The pairs are the point. A checkbox that only exists in one state is half a control.',
    icons: [
      'checkbox-on', 'checkbox-off', 'radio-on', 'radio-off', 'toggle-on',
      'toggle-off', 'dropdown', 'stepper-up', 'stepper-down', 'field-error',
      'field-valid', 'password-show', 'password-hide', 'clear-input',
    ],
  },
  {
    name: 'System and preference',
    icons: [
      'settings', 'sliders', 'sun', 'moon', 'contrast', 'accessibility',
      'keyboard', 'sign-out', 'sign-in', 'offline', 'activity-pulse',
    ],
  },
  {
    name: 'Objects and texture',
    note: 'The interests in Step 5. The library covers most of these across its Food, Game and Sports, and Education sheets.',
    icons: [
      'book', 'coffee', 'camera', 'vinyl', 'palette', 'bicycle', 'telescope',
      'flask', 'lantern', 'feather-quill', 'emoji-smile',
    ],
  },
];

// ---------------------------------------------------------------- validation

const all = GROUPS.flatMap((g) => g.icons);
const seen = new Map();
const errors = [];

for (const g of GROUPS) {
  for (const name of g.icons) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) errors.push(`not kebab-case: ${name}`);
    if (seen.has(name)) errors.push(`duplicate: ${name} (in "${seen.get(name)}" and "${g.name}")`);
    else seen.set(name, g.name);
  }
}

const missing = Object.keys(IN_USE).filter((n) => !seen.has(n));
if (missing.length) errors.push(`in use today but absent from the inventory: ${missing.join(', ')}`);

export const TOTAL = seen.size;
export const COVERED = Object.keys(IN_USE).length;

if (process.argv[1]?.endsWith('icon-inventory.mjs')) {
  if (errors.length) {
    console.error('FAILED\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log(`ok  ${TOTAL} icons in ${GROUPS.length} groups, ${COVERED} of them already in use`);
  console.log(GROUPS.map((g) => `    ${String(g.icons.length).padStart(3)}  ${g.name}`).join('\n'));

  const { writeFileSync } = await import('node:fs');
  const lines = [];
  const w = (s = '') => lines.push(s);

  w('# system_icons — the usage map');
  w();
  w('**Generated** by `scripts/icon-inventory.mjs`. Edit the script, not this file.');
  w();
  w('## What this is now');
  w();
  w('**The library is HugeIcons, adopted whole as the Relethe icon library.**');
  w('Nothing here needs drawing. The whole set is available — this file is not a');
  w('restriction on which icons may be used.');
  w();
  w(`So these **${TOTAL} names in ${GROUPS.length} groups** are a *usage map*, not a`);
  w('drawing list: the semantic names the product calls icons by, and what each one');
  w('resolves to in the library. That layer is worth keeping for three reasons:');
  w();
  w('1. A call site reads `match-blind`, not `user-search-01`.');
  w('2. Swapping the underlying pack later touches one file instead of 47.');
  w('3. It is the only place that records which icons the product actually uses,');
  w('   which is what makes the lucide migration finishable.');
  w();
  w(`**${COVERED}** of them are in the product today as \`lucide-react\` imports and are`);
  w('marked **in use** below. That is the migration set: `lucide-react` cannot leave');
  w('`package.json` until every one resolves to a library icon.');
  w();
  w('`RESOLVES TO` is blank on every row until the mapping pass runs against the');
  w('library\'s own names. A blank is an open question, not an omission.');
  w();
  w('---');
  w();
  w('## Naming');
  w();
  w('```');
  w('kebab-case          user-avatar, radio-on');
  w('noun first          calendar-add   NOT add-calendar');
  w('                    message-unread NOT unread-message');
  w('state suffix        -on / -off     radio-on, matching-off');
  w('semantic not        notification   NOT bell');
  w('  pictorial         user-avatar    NOT person-circle');
  w('```');
  w();
  w('Noun-first is the whole point of the convention: it sorts related icons');
  w('together, so `calendar`, `calendar-add`, `calendar-check` and `calendar-off`');
  w('sit in one block in the file listing, the Figma page and the import.');
  w();
  w('---');
  w();
  w('## Style');
  w();
  w('Measured from `calendar-01` as drawn in the Figma library, not specified');
  w('from memory:');
  w();
  w('```');
  w('viewBox        0 0 24 24');
  w('stroke-width   1.5          as DRAWN — we render it lighter, see below');
  w('linecap        round');
  w('linejoin       round');
  w('fill           none, everywhere. Strokes only');
  w('colour         currentColor, so the caller\'s token decides');
  w('```');
  w();
  w('Two artefacts come out of a Figma SVG export and both have to be stripped:');
  w('a `<rect width="24" height="24" fill="#1E1E1E"/>` behind the glyph, and the');
  w('parent sheet\'s `<rect width="1144" ... fill="white"/>`. The stroke colour');
  w('also exports as a literal `#100A0A` and must become `currentColor`.');
  w();
  w('## Rendered stroke — size-relative');
  w();
  w('| Rendered size | Stroke on screen |');
  w('|---|---|');
  w('| **16px** | **1px** |');
  w('| **24px** | **1.25px** |');
  w();
  w('The drawn weight is the vendor\'s decision; the rendered weight is ours.');
  w('The smaller size takes proportionally more weight and less absolute weight,');
  w('because a hairline that reads on a 24 glyph closes up on a 16 one.');
  w();
  w('**The attribute is not the rendered value.** `stroke-width` is in viewBox');
  w('units, so a 24-grid icon rendered at 16px has its stroke scaled by 16/24 too.');
  w('The number goes DOWN as the icon gets bigger:');
  w();
  w('```');
  w('16px display  ->  strokeWidth 1.5   ->  1.0 rendered');
  w('24px display  ->  strokeWidth 1.25  ->  1.25 rendered');
  w('```');
  w();
  w('`iconStroke(size)` in the primitives owns that arithmetic. No call site does it.');
  w();
  w('---');
  w();
  w('## The set');
  w();

  for (const g of GROUPS) {
    w(`### ${g.name} · ${g.icons.length}`);
    w();
    if (g.note) { w(g.note); w(); }
    for (const name of g.icons) {
      const lucide = IN_USE[name];
      w(`- [ ] \`${name}\` → \`?\`${lucide ? ` · **in use**, replaces \`${lucide}\`` : ''}`);
    }
    w();
  }

  w('---');
  w();
  w('## Not in this map');
  w();
  w('- **The rest of the library.** Thousands of icons across ~52 category sheets');
  w('  are available and unlisted. A name earns a row here once the product calls');
  w('  it by that name.');
  w('- **Filled variants.** The library ships them; the map covers outlined until a');
  w('  surface needs a filled one. Filled means SELECTED, never emphasis — emphasis');
  w('  is a colour decision.');
  w('- **`dynamic_icons`.** Ten animated marks, a separate workstream (PLAN 4c-ii).');
  w('- **Artwork plates.** `src/assets/artworks/`, a different kind of asset entirely.');
  w();

  writeFileSync('docs/system-icons.md', lines.join('\n'));
  console.log('\nwrote docs/system-icons.md');
}
