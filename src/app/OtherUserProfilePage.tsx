import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MessageCircle, UserPlus } from 'lucide-react';
import svgPaths from "../imports/svg-mzo5g4s9h6";
import svgPathsBack from "../imports/svg-9x8xqlgryp";
import svgPathsRing from "../imports/svg-gaju7ne3wq";
import GenderIcon from "../imports/Gender";
import LetheLogo from "../imports/LetheLogo";
import { PostCard } from './components/PostCard';

// Mock user data - in production this would come from API/database
const mockUsers: { [key: string]: any } = {
  'elena.voss': {
    username: 'elena.voss',
    name: 'Elena Voss',
    handle: '@elena.voss',
    pronouns: 'She / Her',
    occupation: 'Product Designer',
    location: 'Berlin, Germany',
    avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'I build at the intersection of design and systems thinking. Happiest in rooms where someone disagrees with me. Currently focused on ethical design frameworks for emerging tech.',
    isMatch: true,
    isFollowing: false,
    stats: {
      followers: 284,
      following: 521,
      posts: 1603,
      faded: 5499,
    },
    matches: {
      count: 6,
      avatars: [
        'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      ],
    },
    meetings: 8,
    posts: [
      {
        avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'elena.voss',
        timestamp: "2h",
        text: "There's a peculiar weight to forgotten things. Not the absence of memory, but the presence of its echo. What we lose shapes us as much as what we keep.",
        status: "flowing" as const,
        image: 'https://images.unsplash.com/photo-1635248677595-17a15f7a1972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wbGF0aXZlJTIwbmF0dXJlJTIwYmxhY2slMjB3aGl0ZXxlbnwxfHx8fDE3NzIyODU1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        halfLifeProgress: 85,
        isFollowing: false,
      },
      {
        avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'elena.voss',
        timestamp: "5h",
        text: "Sometimes the most profound connections happen in silence, when words would only dilute the moment.",
        status: "flowing" as const,
        halfLifeProgress: 78,
        isFollowing: false,
      },
      {
        avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'elena.voss',
        timestamp: "1d",
        text: "Found myself thinking about the architecture of memory. How we build rooms for certain moments but not others.",
        status: "flowing" as const,
        halfLifeProgress: 42,
        isFollowing: false,
      },
    ],
  },
  'marcus.chen': {
    username: 'marcus.chen',
    name: 'Marcus Chen',
    handle: '@marcus.chen',
    pronouns: 'He / Him',
    occupation: 'Senior Engineer',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Building something I can\'t talk about yet. Previously distributed systems at a place you\'ve heard of. I think in systems and ship in sprints.',
    isMatch: false,
    isFollowing: true,
    stats: {
      followers: 512,
      following: 298,
      posts: 842,
      faded: 3201,
    },
    matches: {
      count: 4,
      avatars: [
        'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      ],
    },
    meetings: 5,
    posts: [
      {
        avatar: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'marcus.chen',
        timestamp: "4h",
        text: "The distance between who we were and who we are becomes clearest in silence.",
        status: "flowing" as const,
        halfLifeProgress: 81,
        isFollowing: true,
      },
      {
        avatar: 'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'marcus.chen',
        timestamp: "1d",
        text: "Watched someone return a library book today. Made me think about all the borrowed things we eventually give back.",
        status: "flowing" as const,
        halfLifeProgress: 44,
        isFollowing: true,
      },
    ],
  },
  'sophia.martinez': {
    username: 'sophia.martinez',
    name: 'Sophia Martinez',
    handle: '@sophia.martinez',
    pronouns: 'She / Her',
    occupation: 'Research Scientist',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Researcher by training, creative by habit. I like conversations that go somewhere unexpected. Currently studying how memory shapes decision-making.',
    isMatch: true,
    isFollowing: true,
    stats: {
      followers: 412,
      following: 367,
      posts: 1205,
      faded: 4128,
    },
    matches: {
      count: 7,
      avatars: [
        'https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjM0NDQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      ],
    },
    meetings: 12,
    posts: [
      {
        avatar: 'https://images.unsplash.com/photo-1770363757711-aa4db84d308d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY29uZmlkZW50JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'sophia.martinez',
        timestamp: "3h",
        text: "Some bridges are meant to be crossed only once. That doesn't make them any less important.",
        status: "flowing" as const,
        image: 'https://images.unsplash.com/photo-1694473799096-a915b576511f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3Vuc2V0JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MjI5NzM0MXww&ixlib=rb-4.1.0&q=80&w=1080',
        halfLifeProgress: 83,
        isFollowing: true,
      },
    ],
  },
  'david.park': {
    username: 'david.park',
    name: 'David Park',
    handle: '@david.park',
    pronouns: 'He / Him',
    occupation: 'Lead Designer',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Product designer obsessed with meaningful experiences. I\'m here to find someone who appreciates thoughtful silence as much as great conversation.',
    isMatch: false,
    isFollowing: false,
    stats: {
      followers: 623,
      following: 411,
      posts: 934,
      faded: 2876,
    },
    matches: {
      count: 3,
      avatars: [
        'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMzI5MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      ],
    },
    meetings: 6,
    posts: [
      {
        avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjM0NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080',
        username: 'david.park',
        timestamp: "6h",
        text: "Silence isn't empty. It's full of answers we're not yet ready to hear.",
        status: "flowing" as const,
        halfLifeProgress: 76,
        isFollowing: false,
      },
    ],
  },
};

export default function OtherUserProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<'all' | 'faded' | 'echoes'>('all');
  const [isFollowing, setIsFollowing] = useState(false);

  // Get user data from mock (in production, fetch from API)
  const user = username ? mockUsers[username] : null;

  // Initialize following state from user data
  if (user && isFollowing !== user.isFollowing) {
    setIsFollowing(user.isFollowing);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Cormorant_Garamond'] text-[24px] text-white/90 mb-4">
            User not found
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="font-['Inter'] text-[12px] tracking-[0.2em] uppercase text-[#7FFF00] hover:text-[#c8ff4f] transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleMessage = () => {
    navigate('/messages', { state: { username: user.username } });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Same as ProfilePage */}
      <header className="sticky top-0 z-10 bg-black border-b border-[#1a1a1a]">
        <div className="px-4 sm:px-12 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white text-sm tracking-[0.3em] uppercase font-light font-display hover:opacity-70 cursor-pointer transition-opacity"
          >
            <div className="w-5 h-5">
              <LetheLogo />
            </div>
            LETHE
          </button>

          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[#6b6b6b] hover:opacity-70 cursor-pointer transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path d={svgPathsBack.p543f5c0} stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Inter'] font-light leading-[16.5px] text-[11px] tracking-[3.3px] uppercase">BACK</span>
          </button>
        </div>
      </header>

      {/* Profile Header Card - Full Width */}
      <div className="mt-5 mx-12 mb-6">
        <div className="bg-[#0a0d0a] rounded-[16px] border border-white/[0.07] px-6 py-8">
          <div className="flex items-start justify-between">
            {/* Left: Avatar + Info */}
            <div className="flex gap-6 items-start">
              {/* Avatar with Ring - 115px */}
              <div className="flex-shrink-0">
                <div className="w-[115px] h-[115px] relative">
                  {/* Profile Image */}
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-[115px] h-[115px] rounded-full object-cover relative z-10"
                  />
                  {/* Green Dashed Ring */}
                  <div className="absolute inset-0 z-0">
                    <div className="relative size-full">
                      <div className="absolute inset-[-1.5%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 108 108">
                          <path d={svgPathsRing.pe60fb00} stroke="#ADFF2F" strokeDasharray="55 30" strokeLinecap="round" strokeOpacity="0.5" strokeWidth="3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity */}
              <div className="flex flex-col h-[115px]">
                <div className="flex flex-col gap-[4px] mb-[12px]">
                  <div className="flex items-center gap-[6px]">
                    <h1 className="font-['Cormorant_Garamond'] text-[22px] leading-[26.4px] text-[rgba(255,255,255,0.88)]">
                      {user.name}
                    </h1>
                    {user.isMatch && (
                      <span className="font-['Inter'] text-[11px] font-medium tracking-[0.08em] px-[8.6px] py-[4.2px] rounded-[40px] bg-[rgba(127,255,0,0.1)] text-[rgba(127,255,0,0.7)] whitespace-nowrap flex-shrink-0 leading-[16.5px]">
                        Match
                      </span>
                    )}
                  </div>
                  <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.52px] text-[rgba(255,255,255,0.25)]">
                    {user.handle}
                  </p>
                </div>

                {/* Occupation, Location & Gender */}
                <div className="flex flex-col gap-[4px]">
                  <div className="font-['Cormorant_Garamond'] text-[13px] leading-[19.5px] text-[rgba(255,255,255,0.4)]">
                    {user.occupation}
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-[6px]">
                      <div className="w-4 h-4 relative flex-shrink-0">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 20 20">
                          <g transform="translate(3.33, 1.67)">
                            <path 
                              d={svgPaths.p1fd14140} 
                              stroke="rgba(173,255,47,0.5)" 
                              strokeLinecap="round" 
                              strokeWidth="1.25" 
                            />
                            <path 
                              d={svgPaths.p1b528f0} 
                              stroke="rgba(173,255,47,0.5)" 
                              strokeWidth="1.25" 
                            />
                            <path 
                              d={svgPaths.p312c0700} 
                              stroke="rgba(173,255,47,0.5)" 
                              strokeWidth="1.25" 
                            />
                          </g>
                        </svg>
                      </div>
                      <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.52px] text-[rgba(255,255,255,0.25)]">
                        {user.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-[6px]">
                      <div className="w-4 h-4 relative flex-shrink-0">
                        <GenderIcon />
                      </div>
                      <p className="font-['Inter'] text-[13px] leading-[19.5px] tracking-[0.52px] text-[rgba(255,255,255,0.25)]">
                        {user.pronouns}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Message Button */}
            <div className="flex items-center gap-3">
              <button 
                className={`border rounded-full px-6 h-[34px] font-['Inter'] text-[11px] tracking-[1.98px] uppercase transition-all flex items-center justify-center gap-2 ${
                  isFollowing
                    ? 'bg-transparent border-white/[0.15] text-white/[0.4] hover:bg-white/[0.05] hover:border-white/[0.25]'
                    : 'bg-transparent border-white/[0.15] text-white/[0.6] hover:bg-white/[0.05] hover:border-white/[0.25] hover:text-white/[0.8]'
                }`}
                onClick={handleFollow}
              >
                <UserPlus size={14} strokeWidth={1.5} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                className="bg-[rgba(173,255,47,0.06)] border border-[rgba(173,255,47,0.2)] rounded-full px-6 h-[34px] font-['Inter'] text-[11px] tracking-[1.98px] uppercase text-[rgba(173,255,47,0.7)] hover:bg-[rgba(173,255,47,0.12)] hover:border-[rgba(173,255,47,0.4)] transition-all flex items-center justify-center gap-2"
                onClick={handleMessage}
              >
                <MessageCircle size={14} strokeWidth={1.5} />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <main className="px-12 pb-20 max-w-[1440px] mx-auto">
        <div className="flex gap-8">
          {/* CENTER - Feed */}
          <div className="flex-1 min-w-[400px]">
            {/* Tabs */}
            <div className="mb-6">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-full p-[7px] pr-[8px] pl-[9px] flex items-center gap-1 inline-flex">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-[21px] py-[4px] rounded-full font-['Inter'] text-[11px] tracking-[2.2px] uppercase leading-[16.5px] transition-all ${
                    activeTab === 'all'
                      ? 'text-[rgba(255,255,255,0.9)]'
                      : 'text-[#3a3a3a]'
                  }`}
                >
                  All Posts <span className="text-[9px] leading-[13.5px] text-[rgba(173,255,47,0.5)] ml-1">{user.posts.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('faded')}
                  className={`px-[20px] py-[4px] rounded-full font-['Inter'] text-[11px] tracking-[2.2px] uppercase leading-[16.5px] transition-all ${
                    activeTab === 'faded'
                      ? 'text-[rgba(255,255,255,0.9)]'
                      : 'text-[#3a3a3a]'
                  }`}
                >
                  Faded <span className="text-[9px] leading-[13.5px] text-[rgba(173,255,47,0.5)] ml-1">0</span>
                </button>
                <button
                  onClick={() => setActiveTab('echoes')}
                  className={`px-[20px] py-[4px] rounded-full font-['Inter'] text-[11px] tracking-[2.2px] uppercase leading-[16.5px] transition-all ${
                    activeTab === 'echoes'
                      ? 'text-[rgba(255,255,255,0.9)]'
                      : 'text-[#3a3a3a]'
                  }`}
                >
                  echoes <span className="text-[9px] leading-[13.5px] text-[rgba(173,255,47,0.5)] ml-1">0</span>
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="flex flex-col gap-5">
              {user.posts.map((post: any, idx: number) => (
                <PostCard 
                  key={idx}
                  avatar={post.avatar}
                  username={post.username}
                  timestamp={post.timestamp}
                  text={post.text}
                  image={post.image}
                  halfLifeProgress={post.halfLifeProgress}
                  status={post.status}
                  isFollowing={post.isFollowing}
                  fadingIn={post.fadingIn}
                />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (Sticky) */}
          <div className="w-[400px] min-w-[400px] flex-shrink-0">
            <div className="sticky top-[100px]">
              <div className="bg-[#0a0a0a] rounded-[16px] border-[0.8px] border-[rgba(255,255,255,0.07)] overflow-hidden">
                {/* Bio Section */}
                <div className="p-5">
                  <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-4">
                    bio
                  </p>
                  <p className="font-['Cormorant_Garamond'] text-[14px] leading-[25.5px] text-[rgba(255,255,255,0.4)]">
                    {user.bio}
                  </p>
                </div>

                {/* Stats Grid Section */}
                <div className="relative border-t-[0.8px] border-b-[0.8px] border-[rgba(255,255,255,0.07)]">
                  <div className="flex flex-wrap gap-x-8 gap-y-8 px-5 py-[20.8px]">
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        {user.stats.followers}
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        Followers
                      </p>
                    </div>
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        {user.stats.following}
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        Following
                      </p>
                    </div>
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        {user.stats.posts}
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        posts
                      </p>
                    </div>
                    <div className="w-[160px]">
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)] mb-2">
                        {user.stats.faded}
                      </p>
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b]">
                        faded
                      </p>
                    </div>
                  </div>
                </div>

                {/* Matches & Meetings Section */}
                <div className="p-5">
                  <div className="flex gap-8">
                    {/* Matches */}
                    <div className="flex-1">
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-2">
                        matches
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {user.matches.avatars.map((avatar: string, idx: number) => (
                            <img
                              key={idx}
                              src={avatar}
                              alt=""
                              className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] object-cover"
                            />
                          ))}
                        </div>
                        <span className="font-['Cormorant_Garamond'] text-[14px] leading-[25.5px] text-[rgba(255,255,255,0.4)]">
                          {user.matches.count}
                        </span>
                      </div>
                    </div>

                    {/* Meetings */}
                    <div className="flex-1">
                      <p className="font-['Inter'] font-medium text-[11px] tracking-[2px] uppercase text-[#6b6b6b] mb-2">
                        Meetings
                      </p>
                      <p className="font-['Cormorant_Garamond'] text-[22px] leading-[22px] text-[rgba(255,255,255,0.9)]">
                        {user.meetings}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}