function toFocusTokens(text) {
  if (!text) return new Set();
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2),
  );
}

function firstName(displayName) {
  return String(displayName ?? '').split(' ')[0] || String(displayName ?? '');
}

function normalizeToken(value) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeList(items) {
  return (items ?? []).map(normalizeToken).filter(Boolean);
}

function intersect(a, b) {
  const setB = new Set(b);
  return [...new Set(a)].filter((v) => setB.has(v));
}

function listItems(items, maxItems = 2) {
  const limited = items.slice(0, maxItems);
  if (limited.length === 0) return '';
  if (limited.length === 1) return limited[0];
  return `${limited[0]} and ${limited[1]}`;
}

export function generateInsightText(sourceProfile, candidateProfile, { sourceCep = null, candidateCep = null } = {}) {
  const sourceName = firstName(sourceProfile.user.displayName);
  const candidateName = firstName(candidateProfile.user.displayName);

  const sourceAsks = normalizeList(sourceProfile.preferences.asks);
  const sourceOffers = normalizeList(sourceProfile.preferences.offers);
  const candidateAsks = normalizeList(candidateProfile.preferences.asks);
  const candidateOffers = normalizeList(candidateProfile.preferences.offers);

  const askOfferBridges = intersect(sourceAsks, candidateOffers);
  const reverseAskOfferBridges = intersect(candidateAsks, sourceOffers);

  const sharedIntents = intersect(
    normalizeList(sourceProfile.preferences.matchIntent),
    normalizeList(candidateProfile.preferences.matchIntent),
  );
  const sharedInterests = intersect(
    normalizeList(sourceProfile.preferences.interests),
    normalizeList(candidateProfile.preferences.interests),
  );
  const sharedObjectives = intersect(
    normalizeList(sourceProfile.preferences.objectives),
    normalizeList(candidateProfile.preferences.objectives),
  );

  const sourceType = normalizeToken(sourceProfile.preferences.userType);
  const candidateType = normalizeToken(candidateProfile.preferences.userType);
  const sourceWantsCandidate = Boolean(
    candidateType && normalizeList(sourceProfile.preferences.preferredUserTypes).includes(candidateType),
  );
  const candidateWantsSource = Boolean(
    sourceType && normalizeList(candidateProfile.preferences.preferredUserTypes).includes(sourceType),
  );
  const roleFitMutual = sourceWantsCandidate && candidateWantsSource;

  const sentences = [];

  // Sentence 1: the primary bridge
  if (askOfferBridges.length > 0 && reverseAskOfferBridges.length > 0) {
    sentences.push(
      `${candidateName} can offer ${sourceName} ${listItems(askOfferBridges)}, and ${sourceName} can offer ${candidateName} ${listItems(reverseAskOfferBridges)} in return.`,
    );
  } else if (askOfferBridges.length > 0) {
    sentences.push(`${candidateName} offers ${listItems(askOfferBridges)} — exactly what ${sourceName} is looking for.`);
  } else if (reverseAskOfferBridges.length > 0) {
    sentences.push(`${sourceName} can offer ${listItems(reverseAskOfferBridges)} that ${candidateName} is actively looking for.`);
  } else if (roleFitMutual && sourceType && candidateType) {
    sentences.push(
      `${sourceName} is a ${sourceType} looking to meet a ${candidateType}, and ${candidateName} is a ${candidateType} who wants to meet a ${sourceType}.`,
    );
  } else if (sourceWantsCandidate && candidateType) {
    sentences.push(`${sourceName} is specifically looking to meet a ${candidateType}, and ${candidateName} fits that profile.`);
  } else if (candidateWantsSource && sourceType) {
    sentences.push(`${candidateName} is looking to meet a ${sourceType}, and ${sourceName} fits that profile.`);
  }

  // Sentence 2: shared context
  if (sharedIntents.length > 0) {
    sentences.push(`Both are focused on ${listItems(sharedIntents)}.`);
  } else if (sharedInterests.length > 0) {
    sentences.push(`They share a background in ${listItems(sharedInterests)}.`);
  } else if (sharedObjectives.length > 0) {
    sentences.push(`Both care about ${listItems(sharedObjectives)}.`);
  } else if (sentences.length < 2 && sourceType && candidateType) {
    sentences.push(`The pairing brings together a ${sourceType} and a ${candidateType}.`);
  }

  // Sentence 3: CEP weekly focus (if both have active signals)
  if (sourceCep && candidateCep && sentences.length < 3) {
    const sourceTokens = toFocusTokens(sourceCep.focusText);
    const candidateTokens = toFocusTokens(candidateCep.focusText);
    const shared = [...sourceTokens].filter((t) => candidateTokens.has(t));
    if (shared.length > 0) {
      sentences.push(`This week both are working on ${listItems(shared, 2)}.`);
    } else {
      sentences.push(
        `This week ${sourceName} is focused on ${sourceCep.focusText.slice(0, 60)}, and ${candidateName} on ${candidateCep.focusText.slice(0, 60)}.`,
      );
    }
  } else if (sourceCep && sentences.length < 3) {
    sentences.push(`This week ${sourceName} is focused on ${sourceCep.focusText.slice(0, 60)}.`);
  } else if (candidateCep && sentences.length < 3) {
    sentences.push(`This week ${candidateName} is focused on ${candidateCep.focusText.slice(0, 60)}.`);
  }

  // Sentence 3 fallback: location
  const sourceLocation = normalizeToken(sourceProfile.user.location);
  const candidateLocation = normalizeToken(candidateProfile.user.location);
  if (sourceLocation && sourceLocation === candidateLocation && sentences.length < 3) {
    sentences.push(`Both are based in ${sourceProfile.user.location}, giving them the option to meet in person.`);
  }

  // Ensure at least 2 sentences
  if (sentences.length < 2) {
    sentences.push(`Their availability overlaps across time zones, making a direct introduction straightforward.`);
  }

  return sentences.slice(0, 3).join(' ');
}
