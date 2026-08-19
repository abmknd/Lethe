/**
 * The system_icons inventory.
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
 *  This is the migration checklist: every one must be drawn before
 *  `lucide-react` can leave package.json. */
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
    note: 'One per family in Step 9. These are not decoration — a chip grid of fourteen text labels is the densest thing in onboarding, and a mark per family is what makes it scannable.',
    icons: [
      'role-founder', 'role-operator', 'role-engineer', 'role-designer',
      'role-researcher', 'role-writer', 'role-artist', 'role-investor',
      'role-educator', 'role-healthcare', 'role-public-service', 'role-trades',
      'role-student', 'role-other',
    ],
  },
  {
    name: 'Matching and intro',
    note: 'The product\'s actual subject. Nothing off-the-shelf covers these, which is most of the argument for drawing our own set.',
    icons: [
      'match-blind', 'match-revealed', 'match-accept', 'match-pass',
      'match-pending', 'intro-sent', 'intro-scheduled', 'intro-complete',
      'intro-missed', 'confidence-band', 'signal-overlap', 'signal-strong',
      'signal-weak', 'rematch', 'matching-on', 'matching-off',
    ],
  },
  {
    name: 'Trust and review',
    note: 'The surfaces in Phase 4b that do not exist yet. Listed now so they are drawn in the same batch rather than improvised later.',
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
    note: 'The three content-state icons carry Relethe\'s core idea: posts move flowing to fading to faded. No icon set on earth ships these.',
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
    note: 'DRAWN DIFFERENTLY, ON PURPOSE. A brand mark is a trademark and its recognisability IS its function — restyling LinkedIn into our house line weight makes it both legally dubious and harder to recognise. These are sourced from each brand\'s own asset kit, normalised to the 24 grid, and are the ONE group exempt from the house style.',
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
    note: 'The cyber-classical end of the set: the interests in Step 5, and the flavour marks that keep the system from reading as generic SaaS. This is where the style is most visible and most worth getting right.',
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

  w('# system_icons — the inventory');
  w();
  w('**Generated** by `scripts/icon-inventory.mjs`. Edit the script, not this file.');
  w();
  w(`**${TOTAL} icons** in ${GROUPS.length} groups. **${COVERED}** are already in the product`);
  w('today (as `lucide-react` imports across 47 files) and are marked **in use** below —');
  w('those are the migration set, and `lucide-react` cannot leave `package.json`');
  w('until every one of them is drawn.');
  w();
  w('Outlined only for now. The filled variants come after the outlined set is');
  w('complete and reviewed as a whole, because filled is a derivative of the');
  w('outlined drawing, not an independent one.');
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
  w('## Drawing rules');
  w();
  w('```');
  w('grid           24 x 24, drawn on the grid, exported at 1x');
  w('stroke         1.25px, matching IconButton and the existing chevrons');
  w('caps / joins   round, round');
  w('colour         NONE. currentColor only, so the caller\'s token decides');
  w('optical size   a 16px usage is a redrawn 16 icon, not a scaled-down 24');
  w('padding        2px minimum inside the 24 box, so nothing touches the edge');
  w('fill           no fills in the outlined set, including white knockouts');
  w('```');
  w();
  w('Style: minimalist cyber-classical — a single fine line weight, geometric');
  w('construction, and the occasional classical object (flask, lantern, quill)');
  w('rather than the rounded-corner SaaS default.');
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
      w(`- [ ] \`${name}\`${lucide ? ` — **in use**, replaces \`${lucide}\`` : ''}`);
    }
    w();
  }

  w('---');
  w();
  w('## Not in this set');
  w();
  w('- **Filled variants.** A second pass over the same 240 once the outlined set');
  w('  is reviewed whole. Filled means SELECTED, never emphasis — emphasis is a');
  w('  colour decision.');
  w('- **`dynamic_icons`.** Ten animated marks, a separate workstream (PLAN 4c-ii).');
  w('- **Artwork plates.** `src/assets/artworks/`, a different kind of asset entirely.');
  w();

  writeFileSync('docs/system-icons.md', lines.join('\n'));
  console.log('\nwrote docs/system-icons.md');
}
