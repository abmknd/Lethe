import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MessageCircle, UserPlus } from 'lucide-react';
import svgPaths from "../imports/svg-mzo5g4s9h6";
import svgPathsBack from "../imports/svg-9x8xqlgryp";
import svgPathsRing from "../imports/svg-gaju7ne3wq";
import GenderIcon from "../imports/Gender";
import LetheLogo from "../imports/LetheLogo";
import { PostCard } from './components/PostCard';
import { useAuth } from './context/AuthContext';
import { getTrialUserPublicProfile } from './trial/api';
import type { TrialPublicProfile } from './trial/types';

function initials(name: string) {
  return name.split(' ').map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase();
}

interface DisplayUser {
  username: string;
  name: string;
  handle: string;
  pronouns: string;
  occupation: string;
  location: string;
  avatar: string | null;
  bio: string;
  isMatch: boolean;
  isFollowing: boolean;
  stats: { followers: number; following: number; posts: number; faded: number };
  matches: { count: number; avatars: string[] };
  meetings: number;
  posts: never[];
}

function toDisplayUser(profile: TrialPublicProfile, fallbackUsername: string): DisplayUser {
  return {
    username: profile.handle ?? fallbackUsername,
    name: profile.name,
    handle: profile.handle ? (profile.handle.startsWith('@') ? profile.handle : `@${profile.handle}`) : '',
    pronouns: '',
    occupation: '',
    location: profile.location ?? '',
    avatar: null,
    bio: profile.bio || profile.introText || '',
    isMatch: false,
    isFollowing: false,
    stats: { followers: 0, following: 0, posts: 0, faded: 0 },
    matches: { count: 0, avatars: [] },
    meetings: 0,
    posts: [],
  };
}

export default function OtherUserProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'faded' | 'echoes'>('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<DisplayUser | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'not-found'>('loading');

  useEffect(() => {
    if (!username) {
      setLoadState('not-found');
      return;
    }
    setLoadState('loading');
    (async () => {
      const token = await getAccessToken();
      try {
        const profile = await getTrialUserPublicProfile(username, token);
        setUser(toDisplayUser(profile, username));
        setLoadState('ready');
      } catch {
        setLoadState('not-found');
      }
    })();
  }, [username, getAccessToken]);

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[13px] text-white/[0.25]">Loading…</div>
      </div>
    );
  }

  if (loadState === 'not-found' || !user) {
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
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-[115px] h-[115px] rounded-full object-cover relative z-10"
                    />
                  ) : (
                    <div className="w-[115px] h-[115px] rounded-full relative z-10 bg-[#1a2a1a] border border-[#ADFF2F]/[0.15] flex items-center justify-center text-[36px] font-semibold text-[#ADFF2F]/60 font-['Cormorant_Garamond']">
                      {initials(user.name || '?')}
                    </div>
                  )}
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