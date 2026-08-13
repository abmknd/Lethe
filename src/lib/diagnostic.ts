// Diagnostic domain logic: the questions, the scoring, and the result matrix.
//
// Extracted VERBATIM from src/app/components/DiagnosticModal.tsx so the survey
// has exactly one home. The rebrand shell and the current modal both read from
// here, which means a reskin cannot silently change what the survey measures.
//
// Why this matters: computeArchetype maps by OPTION LETTER, so the ORDER of
// each `options` array is load-bearing. Paraphrasing a question or reordering
// its options scores a different archetype while still looking correct on
// screen. Change this copy deliberately, or not at all.

export type Community = "independents" | "epistemics" | "social_impact";
export type Archetype = "underdistributed" | "signal_seeker" | "isolated_practitioner" | "blocked_mover";

/** Option keys are positional: index 0 = A, 1 = B, 2 = C, 3 = D. */
export const OPT_KEYS = ["A", "B", "C", "D"] as const;

/** Progress readout per step of the 10-step flow. */
export const PROGRESS = [9, 18, 27, 36, 45, 55, 64, 82, 91, 100];

export const QUESTIONS = [
  {
    label: "THE ACCESS AUDIT",
    query: "QUERY 1/5",
    text: "When you need a real conversation with someone who understands the specific thing you're navigating, what actually happens?",
    options: [
      "I don't know who that person is.",
      "I know who they are, but I can't reach them.",
      "I reach out and get something polite and empty.",
      "I don't ask. I figure it out alone.",
    ],
  },
  {
    label: "THE ROOM CHECK",
    query: "QUERY 2/5",
    text: "Think about the last professional or intellectual gathering you were in. What did you leave with?",
    options: [
      "Nothing. It was the wrong room entirely.",
      "A few contacts I never followed up on.",
      "One interesting exchange that went nowhere.",
      "I've stopped going to these things.",
    ],
  },
  {
    label: "THE PLATFORM SIGNAL",
    query: "QUERY 3/5",
    text: "When you open LinkedIn right now, what's your honest reaction?",
    options: [
      "Noise. I scroll and leave with nothing.",
      "FOMO. Everyone looks like they're further ahead.",
      "Invisible. I post, but nothing lands.",
      "Irrelevant. The people I actually need aren't there.",
    ],
  },
  {
    label: "THE LAST REAL CONVERSATION",
    query: "QUERY 4/5",
    text: "The last conversation that genuinely changed how you think or opened something new: how long ago was it?",
    options: [
      "I can't remember one.",
      "Over a year ago.",
      "A few months back, but it was luck, not system.",
      "Recently, but it took years to get to that person.",
    ],
  },
  {
    label: "THE GAP",
    query: "QUERY 5/5",
    text: "If you could add one type of person to your life right now, who would they be?",
    options: [
      "Someone who has already navigated what I'm navigating.",
      "Someone who thinks in a way that sharpens how I think.",
      "Someone building something adjacent who actually gets the work.",
      "Someone with access to the rooms I haven't reached yet.",
    ],
  },
];

export const TEASER: Record<Archetype, string> = {
  underdistributed: "Connection gap: High-trust signal, low-volume network.",
  signal_seeker: "Signal gap: No trusted validators in range.",
  isolated_practitioner: "Peer gap: Doing serious work without a room to match.",
  blocked_mover: "Access gap: Right direction, wrong room.",
};

export const RESULT_COPY: Record<
  Archetype,
  { name: string; tagline: string; variants: Record<Community, { gap: string; who: string }> }
> = {
  underdistributed: {
    name: "THE UNDERDISTRIBUTED EXPERT",
    tagline: "You have the signal. The right rooms just don't know you're in them yet.",
    variants: {
      independents: {
        gap: "What you're building is real and the direction is clear. But the people who could open the right doors, make the right introductions, or simply recognise what you're doing at a glance are not in your current orbit. That is not a capability problem. It is a proximity problem.",
        who: "Builders one or two stages ahead who can place you in rooms that your current network cannot reach.",
      },
      epistemics: {
        gap: "Your thinking is serious and your work is honest. But the people who operate at the same standard, who would push back in the right ways and recognise the distinction between a sharp idea and a performed one, are somewhere else entirely. You have not found each other yet.",
        who: "Thinkers who will sharpen your models rather than validate them. People worth being wrong in front of.",
      },
      social_impact: {
        gap: "You know what you're working on and why it matters. The gap is that the people working on the same problems at the same level of seriousness are scattered. The infrastructure for finding each other does not exist yet. Relethe is that infrastructure.",
        who: "Operators working at the intersection of the same systems, with enough overlap to collaborate and enough difference to challenge.",
      },
    },
  },
  signal_seeker: {
    name: "THE SIGNAL SEEKER",
    tagline: "You know what you're moving toward. You need someone who's already been through it.",
    variants: {
      independents: {
        gap: "You are making real decisions, alone, without enough signal from people who have faced the same variables. The advice available to you is either too generic or too far removed from the specifics of what you're building to be useful. Encouragement is not the same as feedback.",
        who: "Builders who have already made the move you are trying to make and will tell you what it actually cost.",
      },
      epistemics: {
        gap: "The question you're working through is live and consequential. But the people around you are not close enough to the problem to give you real signal. You need someone who has thought about this carefully, arrived somewhere, and is willing to show you their working.",
        who: "Thinkers two or three steps into the same terrain who will engage with the specific problem, not the general category it belongs to.",
      },
      social_impact: {
        gap: "The system you are trying to change is complex and the path through it is not obvious. The people who have navigated it before exist, but they are not easy to find and even harder to get honest time with. What you need is not more information. It is grounded perspective from someone who has been inside.",
        who: "Operators who have worked inside the same systems you are trying to move and are willing to give you the unvarnished version.",
      },
    },
  },
  isolated_practitioner: {
    name: "THE ISOLATED PRACTITIONER",
    tagline: "You're doing serious work. You're doing it alone.",
    variants: {
      independents: {
        gap: "You have momentum. What you do not have is a room of people who understand it without needing it explained. The people around you are supportive but not proximate. Peers who are building at the same altitude, with the same level of honesty about what it takes, are harder to find than they should be.",
        who: "Builders at a similar stage working on adjacent problems. People who get the work because they are in it too.",
      },
      epistemics: {
        gap: "Serious thinking is lonely by design, but it does not have to be isolated. The ideas you are working through deserve interlocutors who can meet them on their own terms: people who will notice the distinction that matters, push on the assumption you have not examined, and still be there next week.",
        who: "Thinkers who are genuinely curious about the same territory and rigorous enough to make the conversation worth having.",
      },
      social_impact: {
        gap: "The work you are doing is long-horizon and the feedback loops are slow. Most people in your immediate circle do not share your orientation toward scale and consequence. Finding collaborators who are thinking at the same level, with the same sense of what is actually at stake, requires more luck than it should.",
        who: "Operators working at a similar intersection with enough shared context to make the conversation immediately useful.",
      },
    },
  },
  blocked_mover: {
    name: "THE BLOCKED MOVER",
    tagline: "The next move is clear. The door is not open.",
    variants: {
      independents: {
        gap: "You know where you're going. You have tried to get there. The gap is not capability or direction: it is access. One introduction to the right person could shift your trajectory, and your current network is not able to produce it.",
        who: "Builders and connectors with direct presence in the space you are trying to enter. Not advisors. Doors.",
      },
      epistemics: {
        gap: "The intellectual move you are trying to make, whether that is a field shift, a publishing ambition, or a new research direction, requires access to people and institutions that your current network does not touch. The ideas are ready. The room has not opened yet.",
        who: "Thinkers with roots in the space you are trying to enter, who can make an introduction that actually means something.",
      },
      social_impact: {
        gap: "The problem is clear, the work is credible, and the next step involves reaching people or institutions that your current network cannot connect you to. Every door you need is one relationship away from opening. That relationship is what is missing.",
        who: "Operators with established presence in the policy, funding, or implementation spaces you are trying to reach.",
      },
    },
  },
};

export function classifyCommunity(text: string): Community {
  const lower = text.toLowerCase();
  const scores = { independents: 0, epistemics: 0, social_impact: 0 };
  const signals: Record<Community, string[]> = {
    independents: ["build", "building", "startup", "founder", "company", "freelance", "independent", "autonomy", "product", "launch", "bootstrap", "venture"],
    epistemics: ["think", "research", "understand", "idea", "write", "writing", "theory", "model", "knowledge", "curious", "intellectual", "scholar", "study", "question"],
    social_impact: ["impact", "change", "policy", "climate", "system", "systemic", "justice", "nonprofit", "community", "cause", "matter", "world", "society", "operator"],
  };
  for (const c of ["independents", "epistemics", "social_impact"] as Community[]) {
    for (const word of signals[c]) {
      if (lower.includes(word)) scores[c]++;
    }
  }
  const max = Math.max(scores.independents, scores.epistemics, scores.social_impact);
  if (max === 0) return "independents";
  const tied = (["independents", "epistemics", "social_impact"] as Community[]).filter((c) => scores[c] === max);
  return tied.length > 1 ? "independents" : tied[0];
}

export function computeArchetype(answers: Record<string, string>): Archetype {
  const scores: Record<Archetype, number> = {
    underdistributed: 0, signal_seeker: 0, isolated_practitioner: 0, blocked_mover: 0,
  };
  const table: Record<string, Record<string, [Archetype, number]>> = {
    q1: { A: ["underdistributed", 2], B: ["blocked_mover", 2], C: ["signal_seeker", 1], D: ["isolated_practitioner", 2] },
    q2: { A: ["blocked_mover", 1], B: ["signal_seeker", 1], C: ["isolated_practitioner", 1], D: ["isolated_practitioner", 2] },
    q3: { A: ["signal_seeker", 1], B: ["underdistributed", 1], C: ["isolated_practitioner", 2], D: ["blocked_mover", 2] },
    q4: { A: ["signal_seeker", 2], B: ["signal_seeker", 1], C: ["underdistributed", 1], D: ["blocked_mover", 1] },
    q5: { A: ["signal_seeker", 2], B: ["underdistributed", 2], C: ["isolated_practitioner", 2], D: ["blocked_mover", 2] },
  };
  for (const [q, ans] of Object.entries(answers)) {
    if (table[q]?.[ans]) {
      const [arch, pts] = table[q][ans];
      scores[arch] += pts;
    }
  }
  const max = Math.max(...Object.values(scores));
  const winners = (Object.entries(scores) as [Archetype, number][]).filter(([, v]) => v === max);
  if (winners.length === 1) return winners[0][0];
  const q5Tie: Record<string, Archetype> = {
    A: "signal_seeker", B: "underdistributed", C: "isolated_practitioner", D: "blocked_mover",
  };
  return q5Tie[answers.q5] ?? "signal_seeker";
}
