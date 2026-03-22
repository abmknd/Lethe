import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Check, MapPin, Zap } from 'lucide-react';
import LetheLogo from '../imports/LetheLogo';

// Persona data with 10 suggestions
const suggestions = [
  {
    name: 'Elena Voss',
    handle: '@elena.voss',
    pronouns: 'She / Her',
    role: 'Product Designer',
    loc: 'Berlin, Germany',
    compat: 94,
    img: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "I build at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me. Currently focused on ethical design frameworks for emerging tech.",
    commonInterests: ['Design Ethics', 'Systems Thinking', 'Effective Altruism', 'Architecture', 'Coffee'],
    insights: [
      "You're both active in the <strong>Effective Altruism community</strong> — she's attended the same chapter events.",
      "She left agency work to go independent <strong>within the same 6-month window</strong> as you.",
      "She wrote about <strong>design ethics in AI</strong> last month — a topic you've circled in your last 4 posts.",
    ]
  },
  {
    name: 'Marcus Jin',
    handle: '@marcus.jin',
    pronouns: 'He / Him',
    role: 'Founder · Stealth',
    loc: 'Singapore',
    compat: 88,
    img: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Building something I can't talk about yet. Previously distributed systems at a place you've heard of. I think in systems and ship in sprints.",
    commonInterests: ['AI / ML', 'Distributed Systems', 'Building in Public', 'Lagos Tech Scene'],
    insights: [
      "You both follow the same <strong>3 niche newsletters</strong> on distributed systems — and cited them in posts.",
      "You'll both be in <strong>Lagos next month</strong> during the same conference window.",
      "He's been thinking about <strong>product ethics</strong> — you've written about this twice this month.",
    ]
  },
  {
    name: 'Sophia Chen',
    handle: '@sophia.chen',
    pronouns: 'She / Her',
    role: 'Research Scientist',
    loc: 'London, UK',
    compat: 91,
    img: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Researcher by training, creative by habit. I like conversations that go somewhere unexpected. Currently studying how memory shapes decision-making.",
    commonInterests: ['AI Research', 'Cognitive Science', 'Memory Studies', 'Podcasts'],
    insights: [
      "You both referenced the <strong>same Kahneman footnote</strong> on memory in posts published a day apart.",
      "She's looking for someone to think through <strong>AI alignment framing</strong> with — your exact stated interest.",
      "You're in the <strong>same book club</strong> — neither of you knows the other is a member.",
    ]
  },
  {
    name: 'Theo Lark',
    handle: '@theo.lark',
    pronouns: 'He / Him',
    role: 'Writer · Investor',
    loc: 'Amsterdam, NL',
    compat: 79,
    img: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Write about what I fund. Fund what I find interesting. Mostly trying to stay curious and avoid pretending I know more than I do.",
    commonInterests: ['Early Stage Investing', 'Long-form Writing', 'Philosophy', 'Podcasts'],
    insights: [
      "He angel-invested in a company explicitly looking for <strong>a designer with your exact background</strong>.",
      "You're both reading <strong>the same three books</strong> right now — from different recommendation paths.",
      "He's been asking his network for intros to <strong>product designers who think structurally</strong>.",
    ]
  },
  {
    name: 'Iris Morrow',
    handle: '@iris.morrow',
    pronouns: 'She / Her',
    role: 'Head of Design',
    loc: 'New York, USA',
    compat: 86,
    img: 'https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90JTIwc21pbGV8ZW58MXx8fHwxNzcyMzQ2MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Three cups of coffee and still thinking about design systems at scale. Building teams that outlast the product. Open to mentoring one designer this quarter.",
    commonInterests: ['Design Systems', 'Design Leadership', 'Mentoring', 'Running'],
    insights: [
      "She's explicitly looking to <strong>mentor one designer this quarter</strong> — your profile came up first.",
      "You both left your last role within <strong>two weeks of each other</strong> citing the same frustration.",
      "You're both in Lagos this week. <strong>She'd be open to meeting in person</strong> if you match.",
    ]
  },
  {
    name: 'River Castillo',
    handle: '@river.castillo',
    pronouns: 'They / Them',
    role: 'UX Researcher',
    loc: 'Mexico City, MX',
    compat: 83,
    img: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NjA0MXww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "I study how people make sense of complex systems. Fascinated by where research ends and design begins. Usually found with too many browser tabs open.",
    commonInterests: ['UX Research', 'Complexity Theory', 'Design Systems', 'Open Source'],
    insights: [
      "You both contributed to the <strong>same open-source design toolkit</strong> in the past year.",
      "They've cited your Lethe posts <strong>in two separate research threads</strong> — they know your work.",
      "Both of you list <strong>complexity theory</strong> as a non-work obsession nobody asks about.",
    ]
  },
  {
    name: 'Anika Patel',
    handle: '@anika.patel',
    pronouns: 'She / Her',
    role: 'Product Lead · Fintech',
    loc: 'Bangalore, India',
    compat: 77,
    img: 'https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjMxODI4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Building financial tools for people who've never had access to them. Product by day, urban sketcher by night. Strong opinions, loosely held.",
    commonInterests: ['Fintech', 'Inclusive Design', 'Urban Sketching', 'Side Projects'],
    insights: [
      "You both have <strong>side projects focused on financial access</strong> for underserved communities.",
      "She runs the design blog you've bookmarked — <strong>you never connected the handle to the face</strong>.",
      "Both of you have spoken publicly about <strong>the loneliness of product work</strong> in the last 3 months.",
    ]
  },
  {
    name: 'James Okafor',
    handle: '@james.okafor',
    pronouns: 'He / Him',
    role: 'Co-founder · B2B SaaS',
    loc: 'Lagos, Nigeria',
    compat: 90,
    img: 'https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjMxODI4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Building tools for African businesses to go global. Two years in, still learning. I believe in calm companies and thoughtful growth.",
    commonInterests: ['African Tech Ecosystem', 'B2B SaaS', 'Calm Companies', 'Lagos Scene'],
    insights: [
      "You're both based in Lagos and have <strong>attended the same 3 events</strong> without ever meeting.",
      "He quoted you in a post last month <strong>without knowing your Lethe handle</strong>.",
      "You both believe in <strong>calm companies</strong> — and have each written about it independently.",
    ]
  },
  {
    name: 'Yuki Tanaka',
    handle: '@yuki.tanaka',
    pronouns: 'She / Her',
    role: 'Creative Technologist',
    loc: 'Tokyo, Japan',
    compat: 81,
    img: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "I sit between art and engineering and refuse to move. Building generative tools for visual artists. Very much a night person.",
    commonInterests: ['Generative Art', 'Creative Coding', 'Tools for Creators', 'Night Owl Hours'],
    insights: [
      "You both follow the same <strong>generative art community</strong> and bookmarked the same 12 projects.",
      "She's looking for a <strong>design-thinking collaborator</strong> — your profile matched her brief exactly.",
      "Both of you are most active on Lethe <strong>between midnight and 3am</strong>.",
    ]
  },
  {
    name: 'Noah Bekele',
    handle: '@noah.bekele',
    pronouns: 'He / Him',
    role: 'Climate Tech Founder',
    loc: 'Nairobi, Kenya',
    compat: 85,
    img: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: "Building infrastructure for climate resilience in East Africa. I care about what lasts. Avid reader, slow runner.",
    commonInterests: ['Climate Tech', 'African Infrastructure', 'Long-form Reading', 'Thoughtful Design'],
    insights: [
      "You both believe <strong>design has a direct role in climate outcomes</strong> — and have each said so publicly.",
      "He's been looking for a <strong>product design advisor</strong> for three months. Your name came up twice.",
      "You're both reading <strong>the same biography</strong> and annotating the same chapters.",
    ]
  },
];

export default function ConnectPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchingOn, setMatchingOn] = useState(true);
  const [showMatchFlash, setShowMatchFlash] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [profileFade, setProfileFade] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'matches'>('suggestions');

  const currentSuggestion = suggestions[currentIdx];
  const totalSuggestions = suggestions.length;
  const isComplete = currentIdx >= totalSuggestions;

  useEffect(() => {
    // Animate compatibility bar on load
    if (currentSuggestion) {
      setProfileFade(true);
      setTimeout(() => setProfileFade(false), 220);
    }
  }, [currentIdx]);

  const handlePass = () => {
    if (isAnimating || isComplete) return;
    setIsAnimating(true);
    setProfileFade(true);

    setTimeout(() => {
      setCurrentIdx(prev => prev + 1);
      setProfileFade(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleMatch = () => {
    if (isAnimating || isComplete) return;
    setIsAnimating(true);
    setShowMatchFlash(true);

    setTimeout(() => {
      setShowMatchFlash(false);
      setCurrentIdx(prev => prev + 1);
      setIsAnimating(false);
    }, 2000);
  };

  const toggleMatching = () => {
    setMatchingOn(!matchingOn);
    displayToast(matchingOn ? 'Matching paused' : 'Matching is on');
  };

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  return (
    <div className="min-h-screen bg-[#050705] text-white/[0.88] font-['Inter'] overflow-hidden flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex-shrink-0 flex items-center justify-between px-8 bg-[rgba(5,7,5,0.97)] backdrop-blur-[20px] border-b border-white/[0.07]">
        <button
          onClick={() => navigate('/feed')}
          className="font-['Libre_Baskerville'] text-[13px] tracking-[0.32em] uppercase text-white/[0.52] flex items-center gap-[9px] hover:text-white/70 transition-colors"
        >
          <LetheLogo className="w-[15px] h-[15px] opacity-55" />
          Lethe
        </button>
        <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a2a1a] to-[#0d150d] border-[1.5px] border-[#ADFF2F]/[0.22] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NzIyMTAxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="You"
            className="w-full h-full object-cover"
          />
        </button>
      </nav>

      {/* Tabs */}
      <div className="h-12 flex-shrink-0 flex items-center px-8 bg-[#0b0e0b] border-b border-white/[0.07]">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`h-full px-0 mr-7 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 transition-colors ${
            activeTab === 'suggestions'
              ? 'text-white/[0.88] border-[#ADFF2F]'
              : 'text-white/[0.25] border-transparent hover:text-white/[0.52]'
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => {
            setActiveTab('matches');
            navigate('/matches');
          }}
          className={`h-full px-0 mr-7 text-[11px] font-medium tracking-[0.14em] uppercase border-b-2 transition-colors ${
            activeTab === 'matches'
              ? 'text-white/[0.88] border-[#ADFF2F]'
              : 'text-white/[0.25] border-transparent hover:text-white/[0.52]'
          }`}
        >
          All matches
        </button>
        
        <div className="ml-auto flex items-center gap-[10px]">
          <span className="text-[11px] text-white/[0.25] tracking-[0.06em]">{matchingOn ? 'Matching on' : 'Matching off'}</span>
          <button
            onClick={toggleMatching}
            className={`w-9 h-[22px] rounded-[11px] border-none relative transition-all ${
              matchingOn ? 'bg-[#ADFF2F]' : 'bg-white/[0.08]'
            }`}
          >
            <div
              className={`absolute top-[3px] w-4 h-4 rounded-full transition-all ${
                matchingOn ? 'left-[17px] bg-[#050705]' : 'left-[3px] bg-white/[0.28]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Weekly banner */}
      <div className="flex-shrink-0 px-8 bg-[rgba(173,255,47,0.03)] border-b border-[rgba(173,255,47,0.07)] flex items-center justify-between h-10">
        <div className="flex items-center gap-[9px]">
          <div className="w-[5px] h-[5px] rounded-full bg-[#ADFF2F] flex-shrink-0 shadow-[0_0_7px_rgba(173,255,47,0.55)]" />
          <div className="text-[11px] text-[rgba(173,255,47,0.6)] tracking-[0.03em]">
            Your weekly summary — <strong className="text-[rgba(173,255,47,0.85)] font-semibold">{totalSuggestions} suggestions</strong> this week. Your next introduction goes out <strong className="text-[rgba(173,255,47,0.85)] font-semibold">Monday.</strong>
          </div>
        </div>
        <div className="text-[11px] font-medium text-white/[0.25] tracking-[0.04em] whitespace-nowrap">
          <strong className="text-white/[0.52] font-semibold">{isComplete ? totalSuggestions : currentIdx} of {totalSuggestions}</strong> reviewed
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-5 gap-4">
        {/* Profile panel */}
        <div className="flex-1 min-w-0 bg-[#0b0e0b] border border-white/[0.07] rounded-2xl flex flex-col overflow-hidden">
          {!isComplete ? (
            <>
              <div className={`flex-1 min-h-0 overflow-y-auto transition-opacity duration-[220ms] ${profileFade ? 'opacity-0' : 'opacity-100'}`}>
                {/* Hero */}
                <div className="flex items-center gap-4 p-5 flex-shrink-0 border-b border-white/[0.07]">
                  <div className="w-[52px] h-[52px] rounded-full flex-shrink-0 overflow-hidden bg-[#0d150d]">
                    <img src={currentSuggestion.img} alt={currentSuggestion.name} className="w-full h-full object-cover object-[center_20%]" />
                  </div>
                  <div className="flex flex-col justify-center gap-[3px]">
                    <div className="font-['Libre_Baskerville'] text-[20px] leading-[1.2] text-white/[0.88]">{currentSuggestion.name}</div>
                    <div className="text-[11px] text-white/[0.25] tracking-[0.05em]">{currentSuggestion.handle}</div>
                    <div className="flex items-center gap-[7px] flex-wrap">
                      <div className="flex items-center gap-1 text-[11px] font-light text-white/[0.25]">
                        <MapPin size={9} className="opacity-55 flex-shrink-0" strokeWidth={1.5} />
                        <span>{currentSuggestion.loc}</span>
                      </div>
                      <div className="w-[3px] h-[3px] rounded-full bg-white/[0.18]" />
                      <div className="text-[11px] font-light text-white/[0.25] tracking-[0.04em]">{currentSuggestion.pronouns}</div>
                    </div>
                  </div>
                </div>

                {/* Compatibility strip */}
                <div className="px-5 py-3 border-b border-white/[0.07] flex-shrink-0 flex items-center gap-[14px]">
                  <div className="flex-1 h-[2px] rounded-[2px] bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full bg-[#ADFF2F] rounded-[2px] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${currentSuggestion.compat}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] text-[rgba(173,255,47,0.72)] whitespace-nowrap flex-shrink-0">
                    {currentSuggestion.compat}%
                  </div>
                  <div className="text-[11px] font-light text-white/[0.25] whitespace-nowrap flex-shrink-0">match</div>
                </div>

                {/* Bio section */}
                <div className="px-5 py-4 border-b border-white/[0.07]">
                  <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/[0.25] mb-[10px]">About</div>
                  <div className="text-[13px] font-light leading-[1.78] text-white/[0.52]">{currentSuggestion.bio}</div>
                </div>

                {/* Common interests */}
                <div className="px-5 py-4">
                  <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/[0.25] mb-[10px]">Common interests</div>
                  <div className="flex flex-wrap gap-[6px]">
                    {currentSuggestion.commonInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] tracking-[0.04em] px-3 py-[5px] rounded-[20px] bg-white/[0.06] border border-white/[0.1] text-white/[0.5]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-5 py-4 flex gap-[10px] flex-shrink-0 border-t border-white/[0.07] bg-[#0b0e0b]">
                <button
                  onClick={handlePass}
                  disabled={isAnimating}
                  className="flex-1 px-3 py-[13px] rounded-[13px] bg-transparent border border-white/[0.18] text-white/[0.45] text-[11px] font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-[7px] transition-all hover:bg-white/[0.05] hover:text-white/70 hover:border-white/[0.28] disabled:opacity-50"
                >
                  <X size={12} strokeWidth={1.8} />
                  Pass
                </button>
                <button
                  onClick={handleMatch}
                  disabled={isAnimating}
                  className="flex-[1.6] px-3 py-[13px] rounded-[13px] bg-white/[0.1] border border-white/[0.18] text-white/[0.88] text-[11px] font-semibold tracking-[0.1em] uppercase flex items-center justify-center gap-[7px] transition-all hover:bg-white/[0.16] hover:border-white/[0.3] hover:text-white disabled:opacity-50"
                >
                  <Check size={12} strokeWidth={2} />
                  Match
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-10 py-[60px] text-center">
              <p className="font-['Libre_Baskerville'] text-[20px] italic text-white/[0.88]">You're all caught up.</p>
              <p className="text-[13px] font-light text-white/[0.52] leading-[1.7] max-w-[240px]">
                New suggestions arrive each Monday.
              </p>
            </div>
          )}
        </div>

        {/* Right card */}
        {!isComplete && (
          <div className="w-[420px] min-w-[400px] flex-shrink-0 flex flex-col bg-transparent overflow-y-auto">
            <div className="bg-[#0b0e0b] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
              {/* Lethe summary */}
              <div className={`rounded-none bg-[rgba(173,255,47,0.03)] border-none border-b-0 overflow-hidden transition-opacity duration-[220ms] ${profileFade ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-center gap-[10px] px-4 pt-[13px] pb-[10px]">
                  <div className="w-[26px] h-[26px] rounded-[7px] bg-[rgba(173,255,47,0.08)] border border-[rgba(173,255,47,0.12)] flex items-center justify-center flex-shrink-0 text-[rgba(173,255,47,0.6)]">
                    <Zap size={12} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[rgba(173,255,47,0.65)]">Lethe summary</div>
                    <div className="text-[10px] font-light text-white/[0.25] mt-[1px]">
                      What you and {currentSuggestion.name.split(' ')[0]} have in common
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-[14px] flex flex-col gap-[9px]">
                  {currentSuggestion.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-[9px]">
                      <div className="w-1 h-1 rounded-full bg-[rgba(173,255,47,0.35)] flex-shrink-0 mt-[7px]" />
                      <div className="text-[12px] font-light leading-[1.72] text-white/[0.5]" dangerouslySetInnerHTML={{ __html: insight }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/[0.07]" />

              {/* Your availability */}
              <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/[0.25] mb-[10px] px-4 pt-4">Your availability</div>
              <div className="grid grid-cols-2 gap-[6px] mb-[10px] px-4">
                <div className="px-3 py-[10px] rounded-[10px] bg-[#050705] border border-white/[0.07]">
                  <div className="text-[9px] font-semibold tracking-[0.16em] uppercase text-white/[0.25] mb-[5px]">Mon</div>
                  <div className="flex flex-col gap-[3px]">
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      7:00 AM
                    </div>
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      8:00 PM
                    </div>
                  </div>
                </div>
                <div className="px-3 py-[10px] rounded-[10px] bg-[#050705] border border-white/[0.07]">
                  <div className="text-[9px] font-semibold tracking-[0.16em] uppercase text-white/[0.25] mb-[5px]">Tue</div>
                  <div className="flex flex-col gap-[3px]">
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      7:00 AM
                    </div>
                  </div>
                </div>
                <div className="px-3 py-[10px] rounded-[10px] bg-[#050705] border border-white/[0.07]">
                  <div className="text-[9px] font-semibold tracking-[0.16em] uppercase text-white/[0.25] mb-[5px]">Thu</div>
                  <div className="flex flex-col gap-[3px]">
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      6:00 PM
                    </div>
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      7:00 PM
                    </div>
                  </div>
                </div>
                <div className="px-3 py-[10px] rounded-[10px] bg-[#050705] border border-white/[0.07]">
                  <div className="text-[9px] font-semibold tracking-[0.16em] uppercase text-white/[0.25] mb-[5px]">Sat</div>
                  <div className="flex flex-col gap-[3px]">
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      10:00 AM
                    </div>
                    <div className="text-[11px] text-white/[0.52] flex items-center gap-[5px]">
                      <div className="w-[3px] h-[3px] rounded-full bg-[rgba(173,255,47,0.3)] flex-shrink-0" />
                      11:00 AM
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-light text-white/[0.25] leading-[1.6] px-4 pb-4">
                You can change your availability in your profile settings.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Match flash overlay */}
      <div
        className={`fixed inset-0 z-[500] bg-[rgba(5,7,5,0.92)] flex flex-col items-center justify-center gap-[14px] transition-opacity duration-[350ms] ${
          showMatchFlash ? 'opacity-100 pointer-events-all' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-[60px] h-[60px] relative flex items-center justify-center">
          <div className="absolute border-[rgba(173,255,47,0.2)] border rounded-full animate-[mfRipple_2s_ease-out_infinite]" />
          <div className="absolute border-[rgba(173,255,47,0.2)] border rounded-full animate-[mfRipple_2s_ease-out_infinite] [animation-delay:1s]" />
          <div className="w-[22px] h-[22px] rounded-full bg-white/[0.12] border border-white/[0.25] flex items-center justify-center">
            <Check size={11} className="text-white/80" strokeWidth={2.5} />
          </div>
        </div>
        <div className="font-['Libre_Baskerville'] text-[22px] italic text-white/[0.88]">Match set.</div>
        <div className="text-[12px] font-light text-white/[0.52] text-center max-w-[220px] leading-[1.65]">
          Lethe will handle the introduction when the time is right.
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#181e18] border border-white/[0.12] rounded-[20px] px-[18px] py-2 text-[11px] tracking-[0.1em] text-white/[0.52] whitespace-nowrap transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[14px] pointer-events-none'
        }`}
      >
        {toastMessage}
      </div>

      <style>{`
        @keyframes mfRipple {
          0% {
            width: 22px;
            height: 22px;
            opacity: 0.7;
          }
          100% {
            width: 60px;
            height: 60px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
