// Persona-based profile fixtures for user behavior scenario tests (L0–L3).
// Each function returns a complete profile payload accepted by onboarding.saveUserProfile().

// --- L0: Happy Path personas ---

export function buildMarcusWebb(overrides = {}) {
  return {
    user: {
      id: 'marcus_webb',
      displayName: 'Marcus Webb',
      handle: 'marcus.webb',
      email: 'marcus@logisticsaas.io',
      timezone: 'America/Chicago',
      location: 'Austin, TX',
      bio: 'Pre-seed founder building freight-tracking software.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'founder',
      preferredUserTypes: ['operator'],
      matchIntent: ['mentorship', 'collaboration'],
      offers: ['saas product feedback', 'b2b growth tactics'],
      asks: ['logistics domain expertise', 'supply chain operator mentor'],
      interests: ['logistics', 'b2b saas', 'product'],
      objectives: [],
      introText: 'Building freight-tracking software and looking for operator mentors who have scaled logistics startups.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 14, endHour: 16, timezone: 'UTC' },
      { dayOfWeek: 3, startHour: 15, endHour: 17, timezone: 'UTC' },
    ],
  };
}

export function buildLogisticsOperatorMentor(overrides = {}) {
  return {
    user: {
      id: 'logistics_mentor',
      displayName: 'Freight Operator',
      handle: 'freight.operator',
      email: 'mentor@supplyco.com',
      timezone: 'UTC',
      location: 'Chicago, IL',
      bio: 'Scaled three logistics startups from seed to Series B.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'operator',
      preferredUserTypes: ['founder', 'builder'],
      matchIntent: ['mentorship', 'knowledge sharing'],
      offers: ['logistics domain expertise', 'supply chain scaling', 'operator network'],
      asks: ['saas product feedback', 'startup strategy'],
      interests: ['logistics', 'supply chain', 'product'],
      objectives: [],
      introText: 'Operator with three logistics exits. Enjoy helping founders avoid supply-chain pitfalls.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 14, endHour: 16, timezone: 'UTC' },
      { dayOfWeek: 4, startHour: 10, endHour: 12, timezone: 'UTC' },
    ],
  };
}

export function buildClaraOsei(overrides = {}) {
  return {
    user: {
      id: 'clara_osei',
      displayName: 'Clara Osei',
      handle: 'clara.osei',
      email: 'clara@fintech-accra.com',
      timezone: 'Africa/Accra',
      location: 'Accra, Ghana',
      bio: 'UX researcher at a fintech company focused on financial inclusion.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'researcher',
      preferredUserTypes: ['researcher', 'designer'],
      matchIntent: ['peer exchange', 'collaboration'],
      offers: ['qualitative research methods', 'emerging market ux insights'],
      asks: ['peer researcher in fintech', 'qual research in west africa'],
      interests: ['ux research', 'fintech', 'financial inclusion'],
      objectives: [],
      introText: 'UX researcher doing qual work on financial inclusion in West Africa. Looking for peer researchers.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' },
      { dayOfWeek: 4, startHour: 14, endHour: 16, timezone: 'UTC' },
    ],
  };
}

export function buildPeerResearcher(overrides = {}) {
  return {
    user: {
      id: 'peer_researcher',
      displayName: 'Amara Diallo',
      handle: 'amara.diallo',
      email: 'amara@socialimpact.org',
      timezone: 'UTC',
      location: 'Lagos, Nigeria',
      bio: 'UX researcher focused on social impact products in West Africa.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'researcher',
      preferredUserTypes: ['researcher', 'designer'],
      matchIntent: ['peer exchange', 'collaboration'],
      offers: ['qual research in social impact', 'user interview facilitation'],
      asks: ['qualitative research methods', 'fintech research collaboration'],
      interests: ['ux research', 'financial inclusion', 'social impact'],
      objectives: [],
      introText: 'Qual researcher working on social impact in Nigeria. Want to exchange methods with peers.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' },
      { dayOfWeek: 3, startHour: 14, endHour: 16, timezone: 'UTC' },
    ],
  };
}

export function buildPriyaNair(overrides = {}) {
  return {
    user: {
      id: 'priya_nair',
      displayName: 'Priya Nair',
      handle: 'priya.nair',
      email: 'priya@angel.in',
      timezone: 'Asia/Kolkata',
      location: 'Bangalore, India',
      bio: 'Angel investor with 10 checks in pre-seed B2B SaaS.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'investor',
      preferredUserTypes: ['founder', 'builder'],
      matchIntent: ['deal flow', 'mentorship'],
      offers: ['angel check', 'investor network', 'b2b saas go-to-market advice'],
      asks: ['b2b saas founder', 'devtools founder pre-series a'],
      interests: ['b2b saas', 'developer tools', 'product'],
      objectives: [],
      introText: 'Angel investor doing pre-seed B2B checks. Looking for technical founders building tools.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 8, endHour: 10, timezone: 'UTC' },
      { dayOfWeek: 5, startHour: 9, endHour: 11, timezone: 'UTC' },
    ],
  };
}

export function buildDevtoolsFounder(overrides = {}) {
  return {
    user: {
      id: 'devtools_founder',
      displayName: 'Lena Braun',
      handle: 'lena.braun',
      email: 'lena@devtoolstartup.io',
      timezone: 'Europe/Berlin',
      location: 'Berlin, Germany',
      bio: 'Technical founder building a developer productivity tool, pre-seed.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'founder',
      preferredUserTypes: ['investor', 'operator'],
      matchIntent: ['fundraising advice', 'mentorship'],
      offers: ['developer tools expertise', 'open source community building'],
      asks: ['angel check', 'b2b saas investor', 'go-to-market advice'],
      interests: ['developer tools', 'b2b saas', 'open source'],
      objectives: [],
      introText: 'Building a dev productivity tool. Pre-seed, looking for angels who understand developer GTM.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 8, endHour: 10, timezone: 'UTC' },
      { dayOfWeek: 4, startHour: 15, endHour: 17, timezone: 'UTC' },
    ],
  };
}

export function buildDanielHartmann(overrides = {}) {
  return {
    user: {
      id: 'daniel_hartmann',
      displayName: 'Daniel Hartmann',
      handle: 'daniel.hartmann',
      email: 'daniel@indiehacker.de',
      timezone: 'Europe/Berlin',
      location: 'Berlin, Germany',
      bio: 'Second-time indie hacker after a small exit. Building in public.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'builder',
      preferredUserTypes: ['builder', 'founder'],
      matchIntent: ['accountability', 'peer exchange'],
      offers: ['product iteration feedback', 'bootstrapped saas experience'],
      asks: ['peer founder at same revenue stage', 'accountability partner'],
      interests: ['bootstrapping', 'product', 'indie hacking'],
      objectives: [],
      introText: 'Second-time indie founder. Want peers at the same stage to think out loud with.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 9, endHour: 11, timezone: 'UTC' },
      { dayOfWeek: 3, startHour: 16, endHour: 18, timezone: 'UTC' },
    ],
  };
}

export function buildPeerIndieHacker(overrides = {}) {
  return {
    user: {
      id: 'peer_indie_hacker',
      displayName: 'Mia Santos',
      handle: 'mia.santos',
      email: 'mia@bootstrapped.pt',
      timezone: 'Europe/Lisbon',
      location: 'Lisbon, Portugal',
      bio: 'Bootstrapped founder building a B2B SaaS for small teams.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'builder',
      preferredUserTypes: ['builder', 'founder'],
      matchIntent: ['accountability', 'peer exchange'],
      offers: ['bootstrapped saas experience', 'customer development advice'],
      asks: ['product iteration feedback', 'accountability partner'],
      interests: ['bootstrapping', 'indie hacking', 'product'],
      objectives: [],
      introText: 'Bootstrapped B2B SaaS founder at $3K MRR. Want a thinking partner at the same stage.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 9, endHour: 11, timezone: 'UTC' },
      { dayOfWeek: 4, startHour: 14, endHour: 16, timezone: 'UTC' },
    ],
  };
}

// --- L1: Insufficient Input personas ---

export function buildTylerBrooks(overrides = {}) {
  return {
    user: {
      id: 'tyler_brooks',
      displayName: 'Tyler Brooks',
      handle: 'tyler.brooks',
      email: 'tyler@gmail.com',
      timezone: 'America/Phoenix',
      location: 'Phoenix, AZ',
      bio: 'Working in e-commerce, figuring out what to build next.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'founder',
      preferredUserTypes: ['founder', 'operator'],
      matchIntent: ['exploration'],
      offers: ['i am a founder'],
      asks: [],
      interests: ['startups'],
      objectives: [],
      introText: '',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' },
    ],
  };
}

export function buildEthanPark(overrides = {}) {
  return {
    user: {
      id: 'ethan_park',
      displayName: 'Ethan Park',
      handle: 'ethan.park',
      email: 'ethan@ucla.edu',
      timezone: 'America/Los_Angeles',
      location: 'Los Angeles, CA',
      bio: 'CS student interested in ML.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'builder',
      preferredUserTypes: ['designer', 'founder'],
      matchIntent: ['mentorship', 'learning'],
      offers: [],
      asks: ['product designer or pm willing to mentor', 'cross-functional thinking'],
      interests: ['ml', 'product'],
      objectives: [],
      introText: 'CS student, self-taught ML. Want to learn how to turn technical work into products people want.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 18, endHour: 20, timezone: 'UTC' },
    ],
  };
}

export function buildLeilaAhmadi(overrides = {}) {
  return {
    user: {
      id: 'leila_ahmadi',
      displayName: 'Leila Ahmadi',
      handle: 'leila.ahmadi',
      email: 'leila@orgdev.io',
      timezone: 'UTC',
      location: 'Tehran, Iran',
      bio: 'Independent consultant in organizational development.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'consultant',
      preferredUserTypes: ['founder', 'researcher'],
      matchIntent: ['peer exchange', 'collaboration'],
      offers: ['organizational development frameworks', 'change management consulting'],
      asks: ['peers in org development', 'researchers in organizational behavior'],
      interests: ['organizational development', 'change management', 'leadership'],
      objectives: [],
      introText: 'Independent org-dev consultant. Want to connect with peers across industries.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [{ dayOfWeek: 3, startHour: 16, endHour: 18, timezone: 'UTC' }],
  };
}

export function buildMinJiPark(overrides = {}) {
  return {
    user: {
      id: 'min_ji_park',
      displayName: 'Min-Ji Park',
      handle: 'min.ji.park',
      email: 'minji@techjournal.com',
      timezone: 'America/New_York',
      location: 'New York, NY',
      bio: 'Tech journalist covering startups and founders.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'journalist',
      preferredUserTypes: ['founder', 'operator'],
      matchIntent: ['source discovery'],
      offers: ['media coverage and visibility'],
      asks: ['founders building interesting things in africa'],
      interests: ['startups', 'africa tech', 'media'],
      objectives: [],
      introText: 'Tech journalist looking to meet founders building in Africa for story sourcing.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 3, startHour: 14, endHour: 16, timezone: 'UTC' },
    ],
  };
}

// --- L2: Matching Failure personas ---

export function buildChrisNakamura(overrides = {}) {
  return {
    user: {
      id: 'chris_nakamura',
      displayName: 'Chris Nakamura',
      handle: 'chris.nakamura',
      email: 'chris@consumerapp.io',
      timezone: 'America/Los_Angeles',
      location: 'San Francisco, CA',
      bio: 'Seed-stage B2C founder.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'founder',
      preferredUserTypes: ['investor'],
      matchIntent: ['fundraising advice', 'deal flow'],
      offers: ['product growth experience', 'b2c consumer insights'],
      asks: ['seed-stage investor', 'angel or micro-vc'],
      interests: ['consumer apps', 'product', 'growth'],
      objectives: [],
      introText: 'Seed-stage B2C founder. Explicitly looking for investors, not peer founders.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 14, endHour: 16, timezone: 'UTC' },
    ],
  };
}

export function buildZaraHussain(overrides = {}) {
  return {
    user: {
      id: 'zara_hussain',
      displayName: 'Zara Hussain',
      handle: 'zara.hussain',
      email: 'zara@bigtelco.com',
      timezone: 'Asia/Karachi',
      location: 'Karachi, Pakistan',
      bio: 'Growth marketer at a Series A startup.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'operator',
      preferredUserTypes: ['founder', 'operator'],
      matchIntent: ['peer exchange', 'collaboration'],
      offers: ['growth marketing expertise', 'paid acquisition strategy'],
      asks: ['product marketers outside my company', 'growth peers'],
      interests: ['growth', 'marketing', 'product'],
      objectives: [],
      introText: 'Growth marketer wanting to meet people outside my immediate work bubble.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' },
    ],
  };
}

export function buildColleagueAtBigTelco(overrides = {}) {
  return {
    user: {
      id: 'colleague_bigtelco',
      displayName: 'Omar Siddiqui',
      handle: 'omar.siddiqui',
      email: 'omar@bigtelco.com',
      timezone: 'Asia/Karachi',
      location: 'Karachi, Pakistan',
      bio: 'Product manager at BigTelco.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'operator',
      preferredUserTypes: ['founder', 'operator'],
      matchIntent: ['peer exchange', 'mentorship'],
      offers: ['product management frameworks', 'telco industry knowledge'],
      asks: ['growth marketing peers', 'growth expertise'],
      interests: ['product', 'growth', 'telco'],
      objectives: [],
      introText: 'PM at BigTelco. Looking to connect with growth and marketing professionals.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 10, endHour: 12, timezone: 'UTC' },
    ],
  };
}

export function buildEleanorHughes(overrides = {}) {
  return {
    user: {
      id: 'eleanor_hughes',
      displayName: 'Eleanor Hughes',
      handle: 'eleanor.hughes',
      email: 'eleanor@conflictmediation.org',
      timezone: 'Europe/London',
      location: 'Edinburgh, Scotland',
      bio: 'Former diplomat, now doing conflict mediation consulting.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'consultant',
      preferredUserTypes: ['researcher', 'consultant'],
      matchIntent: ['peer exchange', 'collaboration'],
      offers: ['conflict mediation frameworks', 'diplomatic negotiation experience'],
      asks: ['peers in international relations', 'peacebuilding practitioners', 'diplomacy experts'],
      interests: ['conflict mediation', 'international relations', 'peacebuilding', 'diplomacy'],
      objectives: [],
      introText: 'Former diplomat doing conflict mediation. Need peers with direct experience in the field.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 1, startHour: 10, endHour: 12, timezone: 'UTC' },
      { dayOfWeek: 3, startHour: 14, endHour: 16, timezone: 'UTC' },
    ],
  };
}

// --- L3: Match Bypass personas ---

export function buildMeiChen(overrides = {}) {
  return {
    user: {
      id: 'mei_chen',
      displayName: 'Mei Chen',
      handle: 'mei.chen',
      email: 'mei@startup.com.au',
      timezone: 'Australia/Sydney',
      location: 'Sydney, Australia',
      bio: 'Junior PM at a startup. Still building confidence.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'builder',
      preferredUserTypes: ['founder', 'operator'],
      matchIntent: ['learning', 'mentorship'],
      offers: ['user research support', 'product thinking'],
      asks: ['senior product mentor', 'product leader willing to share experience'],
      interests: ['product management', 'ux', 'growth'],
      objectives: [],
      introText: 'Junior PM learning the craft. One-on-one feels high-stakes right now.',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 2, startHour: 18, endHour: 20, timezone: 'UTC' },
    ],
  };
}

export function buildJamesOsei(overrides = {}) {
  return {
    user: {
      id: 'james_osei',
      displayName: 'James Osei',
      handle: 'james.osei',
      email: 'james@creativecollective.uk',
      timezone: 'Europe/London',
      location: 'London, UK',
      bio: 'Community builder running a creative professional collective.',
      isActive: true,
      matchingEnabled: false,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'builder',
      preferredUserTypes: ['builder', 'designer'],
      matchIntent: ['community building', 'collaboration'],
      offers: ['community design', 'creative network access'],
      asks: ['community co-builders', 'creative professionals'],
      interests: ['community building', 'creative work', 'culture'],
      objectives: [],
      introText: 'Community builder. Prefer organic relationships to scheduled calls.',
      meetingFormat: 'async',
      localOnly: false,
      matchEnabled: false,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [
      { dayOfWeek: 3, startHour: 18, endHour: 20, timezone: 'UTC' },
    ],
  };
}

export function buildCamilleFontaine(overrides = {}) {
  return {
    user: {
      id: 'camille_fontaine',
      displayName: 'Camille Fontaine',
      handle: 'camille.fontaine',
      email: 'camille@essayist.fr',
      timezone: 'Europe/Paris',
      location: 'Lyon, France',
      bio: 'Freelance writer and essayist.',
      isActive: true,
      matchingEnabled: false,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'thinker',
      preferredUserTypes: ['thinker', 'researcher'],
      matchIntent: ['intellectual discourse'],
      offers: ['philosophical writing', 'essay critique'],
      asks: ['thinkers interested in philosophy and literature'],
      interests: ['philosophy', 'literature', 'epistemics'],
      objectives: [],
      introText: 'Writer. Here for the ideas, not the networking.',
      meetingFormat: 'async',
      localOnly: false,
      matchEnabled: false,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: overrides.availability ?? [],
  };
}

export function buildWilliamCastillo(overrides = {}) {
  return {
    user: {
      id: 'william_castillo',
      displayName: 'William Castillo',
      handle: 'william.castillo',
      email: 'william@gov.us',
      timezone: 'America/New_York',
      location: 'Miami, FL',
      bio: 'Senior government consultant.',
      isActive: true,
      matchingEnabled: true,
      ...(overrides.user ?? {}),
    },
    preferences: {
      userType: 'consultant',
      preferredUserTypes: ['operator'],
      matchIntent: [],
      offers: [],
      asks: [],
      interests: ['policy', 'governance'],
      objectives: [],
      introText: '',
      meetingFormat: 'video',
      localOnly: false,
      matchEnabled: true,
      blockedUserIds: [],
      ...(overrides.preferences ?? {}),
    },
    availability: [],
  };
}
